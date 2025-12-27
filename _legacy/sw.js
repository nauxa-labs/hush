const CACHE_NAME = 'hush-phoenix-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/base/reset.css',
  './css/base/variables.css',
  './css/layouts/shell.css',
  './css/components/editable-text.css',
  './css/components/sidebar.css',
  './css/components/kanban.css',
  './css/components/task-card.css',
  './css/components/timer.css',
  './css/components/panels.css',
  './css/components/toast.css',
  './js/app.js',
  './js/store/Store.js',
  './js/store/SettingsStore.js',
  './js/store/WorkspaceStore.js',
  './js/store/KanbanStore.js',
  './js/store/StatsStore.js',
  './js/store/AchievementStore.js',
  './js/services/TimerService.js',
  './js/services/AudioService.js',
  './js/components/ui/EditableText.js',
  './js/components/ui/Toast.js',
  './js/components/ui/IconButton.js',
  './js/components/layout/Sidebar.js',
  './js/components/layout/TopBar.js',
  './js/components/layout/SlidePanel.js',
  './js/components/workspace/KanbanBoard.js',
  './js/components/workspace/KanbanColumn.js',
  './js/components/workspace/TaskCard.js',
  './js/components/workspace/ListView.js',
  './js/components/focus/FocusOverlay.js',
  './js/components/focus/Timer.js',
  './js/components/panels/CardDetailPanel.js',
  './js/components/panels/StatsPanel.js',
  './js/components/panels/BadgesPanel.js',
  './js/components/panels/SettingsPanel.js',
  './js/components/panels/AudioMixer.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});
