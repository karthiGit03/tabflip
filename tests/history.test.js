import assert from "node:assert/strict";
import test from "node:test";
import { getNextCycle, pruneClosedTabs, recordVisit } from "../src/history.js";

test("records each activation at the front without duplicates", () => {
  const history = recordVisit(recordVisit(recordVisit([], 1), 3), 1);
  assert.deepEqual(history, [1, 3]);
});

test("cycles through visit order and reverses at both ends", () => {
  const history = [2, 4, 3, 1];
  const expected = [3, 4, 2, 4, 3, 1, 3];
  let activeTabId = 1;
  let cycleState;

  for (const expectedTabId of expected) {
    const next = getNextCycle(history, activeTabId, cycleState);
    assert.equal(next?.tabId, expectedTabId);
    activeTabId = next.tabId;
    cycleState = next.cycleState;
  }
});

test("starts moving toward recent tabs from the oldest visit", () => {
  const next = getNextCycle([2, 4, 3, 1], 1, null);
  assert.equal(next?.tabId, 3);
});

test("starts moving toward older tabs from the newest visit", () => {
  const next = getNextCycle([2, 4, 3, 1], 2, null);
  assert.equal(next?.tabId, 4);
});

test("does not add open tabs that are absent from recorded history", () => {
  assert.deepEqual(pruneClosedTabs([4, 3], new Set([1, 2, 3, 4, 5])), [4, 3]);
});

test("removes closed tabs while keeping the remaining visit order", () => {
  assert.deepEqual(pruneClosedTabs([4, 3, 2, 1], [4, 2]), [4, 2]);
});

test("does not cycle with fewer than two recorded tabs", () => {
  assert.equal(getNextCycle([7], 7, null), null);
});

test("restarts from the active tab when a stale cycle no longer matches", () => {
  const history = [2, 4, 3, 1];
  const staleCycle = { tabIds: history, index: 2, direction: -1 };
  assert.equal(getNextCycle(history, 2, staleCycle)?.tabId, 4);
});
