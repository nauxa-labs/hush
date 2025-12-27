import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { KanbanBoard } from './components/workspace/KanbanBoard';
import { ListView } from './components/workspace/ListView';
import { useStores, useStoreData } from './contexts/StoreContext';

function App() {
  const { workspaceStore } = useStores();
  const { activeId, workspaces } = useStoreData(workspaceStore);
  const activeWs = workspaces.find(w => w.id === activeId);

  return (
    <AppShell>
      {activeWs && activeWs.viewMode === 'list' && <ListView />}
      {activeWs && activeWs.viewMode === 'board' && <KanbanBoard />}
      {!activeWs && (
        <div className="flex h-full items-center justify-center text-text-muted">
          Select or Create a Workspace
        </div>
      )}
    </AppShell>
  );
}

export default App;
