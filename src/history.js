/** Move an activated tab to the front of the most-recently-used list. */
export function recordVisit(history, tabId) {
  return [tabId, ...history.filter((id) => id !== tabId)];
}

/** Keep recorded tabs that are still open, preserving their visit order. */
export function pruneClosedTabs(history, openTabIds) {
  const openIds = openTabIds instanceof Set ? openTabIds : new Set(openTabIds);
  return [...new Set(history)].filter((id) => openIds.has(id));
}

/**
 * Pick the next tab and updated ping-pong position.
 * History is ordered newest first; cycling reverses at either end.
 */
export function getNextCycle(history, activeTabId, cycleState) {
  if (history.length < 2) return null;

  const cycleMatches = cycleState?.tabIds?.length === history.length &&
    cycleState.tabIds.every((id, index) => id === history[index]) &&
    Number.isInteger(cycleState.index) &&
    cycleState.index >= 0 && cycleState.index < history.length &&
    history[cycleState.index] === activeTabId &&
    (cycleState.direction === 1 || cycleState.direction === -1);
  const currentIndex = cycleMatches ? cycleState.index : history.indexOf(activeTabId);
  if (currentIndex < 0) return null;

  let direction = cycleMatches ? cycleState.direction : (currentIndex === 0 ? 1 : -1);
  let index = currentIndex + direction;
  if (index < 0 || index >= history.length) {
    direction *= -1;
    index = currentIndex + direction;
  }

  return {
    tabId: history[index],
    cycleState: { tabIds: [...history], index, direction }
  };
}


