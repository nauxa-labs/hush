import { assert, TestSuite } from './assert.js';
import { WorkspaceStore } from '../js/store/WorkspaceStore.js';

export async function runWorkspaceTests() {
  const suite = new TestSuite('Workspace Store');

  // Clean state
  localStorage.clear();

  suite.add('Should initialize with default workspace', async () => {
    const store = new WorkspaceStore();
    assert.ok(store.data.workspaces.length > 0, "Should have at least one workspace");
    assert.equal(store.data.activeId, store.data.workspaces[0].id, "First workspace should be active");
  });

  suite.add('Should create new workspace', async () => {
    const store = new WorkspaceStore();
    const newWs = store.createWorkspace('AI Brain');

    assert.equal(newWs.name, 'AI Brain');
    assert.ok(newWs.id, 'Should have an ID');
    assert.equal(store.data.workspaces.length, 2, 'Should have 2 workspaces now');
  });

  suite.add('Should switch active workspace', async () => {
    const store = new WorkspaceStore();
    const ws1 = store.data.workspaces[0];
    const ws2 = store.createWorkspace('Second Space');

    store.setActive(ws2.id);
    assert.equal(store.data.activeId, ws2.id, "Active ID should change");

    store.setActive(ws1.id);
    assert.equal(store.data.activeId, ws1.id, "Active ID should revert");
  });

  suite.add('Should persist data', async () => {
    const store = new WorkspaceStore();
    store.createWorkspace('Persist Test');

    const store2 = new WorkspaceStore(); // Re-init to simulate reload
    const found = store2.data.workspaces.find(w => w.name === 'Persist Test');
    assert.ok(found, "Should load persisted workspace");
  });

  await suite.run();
}
