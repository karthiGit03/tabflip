import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const manifest = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url), "utf8"));

test("manifest points to an existing MV3 module service worker", async () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.background.type, "module");
  await assert.doesNotReject(readFile(new URL(`../${manifest.background.service_worker}`, import.meta.url)));
});

test("manifest declares required permissions, icons, and the Alt+Q command", async () => {
  assert.ok(manifest.permissions.includes("tabs"));
  assert.ok(manifest.permissions.includes("storage"));
  assert.equal(manifest.commands["cycle-recent-tabs"].suggested_key.default, "Alt+Q");
  assert.equal(manifest.action.default_title, "TabFlip");
  for (const icon of Object.values(manifest.icons)) {
    await assert.doesNotReject(readFile(new URL(`../${icon}`, import.meta.url)));
  }
});


