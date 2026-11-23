import { getNextCycle, pruneClosedTabs, recordVisit } from "./history.js";

const HISTORY_KEY = "recentTabIds";
const CYCLE_KEY = "cycleState";
const PENDING_KEY = "pendingTabIds";

// Serialize events so quick activations retain their actual order.
let activationQueue = Promise.resolve();
let commandQueue = Promise.resolve();

function queueActivation(tabId) {
  activationQueue = activationQueue
    .then(() => recordActivation(tabId))
    .catch((error) => console.error("TabFlip could not record an activation:", error));
  return activationQueue;
}

async function recordActivation(tabId) {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab || tab.url?.startsWith(chrome.runtime.getURL(""))) return;

  const stored = await chrome.storage.session.get([HISTORY_KEY, CYCLE_KEY, PENDING_KEY]);
  const pending = Array.isArray(stored[PENDING_KEY]) ? stored[PENDING_KEY] : [];
  if (pending.includes(tabId)) {
    const remaining = pending.filter((id) => id !== tabId);
    if (remaining.length) await chrome.storage.session.set({ [PENDING_KEY]: remaining });
    else await chrome.storage.session.remove(PENDING_KEY);
    return;
  }

  const history = Array.isArray(stored[HISTORY_KEY]) ? stored[HISTORY_KEY] : [];
  await chrome.storage.session.set({ [HISTORY_KEY]: recordVisit(history, tabId) });
  await chrome.storage.session.remove([CYCLE_KEY, PENDING_KEY]);
}

async function removeClosedTab(tabId) {
  const stored = await chrome.storage.session.get([HISTORY_KEY, CYCLE_KEY, PENDING_KEY]);
  const history = Array.isArray(stored[HISTORY_KEY]) ? stored[HISTORY_KEY] : [];
  const pending = Array.isArray(stored[PENDING_KEY]) ? stored[PENDING_KEY] : [];

  await chrome.storage.session.set({
    [HISTORY_KEY]: history.filter((id) => id !== tabId)
  });
  // A changed history invalidates the current position; restart from the active tab.
  await chrome.storage.session.remove(CYCLE_KEY);
  const remaining = pending.filter((id) => id !== tabId);
  if (remaining.length) await chrome.storage.session.set({ [PENDING_KEY]: remaining });
  else await chrome.storage.session.remove(PENDING_KEY);
}

async function cycleRecentTabs() {
  const [activeTabs, openTabs, stored] = await Promise.all([
    chrome.tabs.query({ active: true, lastFocusedWindow: true }),
    chrome.tabs.query({}),
    chrome.storage.session.get([HISTORY_KEY, CYCLE_KEY, PENDING_KEY])
  ]);
  const activeTab = activeTabs[0];
  if (activeTab?.id === undefined) return;

  const openById = new Map(openTabs
    .filter((tab) => tab.id !== undefined && !tab.url?.startsWith(chrome.runtime.getURL("")))
    .map((tab) => [tab.id, tab]));
  let history = pruneClosedTabs(
    Array.isArray(stored[HISTORY_KEY]) ? stored[HISTORY_KEY] : [],
    openById.keys()
  );

  // The active tab is a visit; other open tabs are never added implicitly.
  if (!history.includes(activeTab.id)) history = recordVisit(history, activeTab.id);
  const next = getNextCycle(history, activeTab.id, stored[CYCLE_KEY]);
  if (!next) {
    await chrome.storage.session.set({ [HISTORY_KEY]: history });
    await chrome.storage.session.remove(CYCLE_KEY);
    return;
  }

  const target = openById.get(next.tabId);
  if (!target) return;

  const pending = Array.isArray(stored[PENDING_KEY]) ? stored[PENDING_KEY] : [];
  await chrome.storage.session.set({
    [HISTORY_KEY]: history,
    [CYCLE_KEY]: next.cycleState,
    [PENDING_KEY]: [...new Set([...pending, next.tabId])]
  });

  try {
    if (target.windowId !== undefined) {
      await chrome.windows.update(target.windowId, { focused: true });
    }
    await chrome.tabs.update(next.tabId, { active: true });
  } catch (error) {
    const current = await chrome.storage.session.get([HISTORY_KEY, PENDING_KEY]);
    await chrome.storage.session.set({
      [HISTORY_KEY]: (current[HISTORY_KEY] || []).filter((id) => id !== next.tabId)
    });
    const remaining = (current[PENDING_KEY] || []).filter((id) => id !== next.tabId);
    if (remaining.length) await chrome.storage.session.set({ [PENDING_KEY]: remaining });
    else await chrome.storage.session.remove(PENDING_KEY);
    await chrome.storage.session.remove(CYCLE_KEY);
    console.error("TabFlip could not switch tabs:", error);
  }
}

chrome.tabs.onActivated.addListener(({ tabId }) => queueActivation(tabId));
chrome.tabs.onRemoved.addListener((tabId) => {
  activationQueue = activationQueue
    .then(() => removeClosedTab(tabId))
    .catch((error) => console.error("TabFlip could not remove a closed tab:", error));
  return activationQueue;
});

chrome.commands.onCommand.addListener((command) => {
  if (command !== "cycle-recent-tabs") return;
  commandQueue = commandQueue
    .then(cycleRecentTabs)
    .catch((error) => console.error("TabFlip could not cycle tabs:", error));
  return commandQueue;
});
