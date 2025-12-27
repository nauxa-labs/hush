import { assert, TestSuite } from './assert.js';
import { KanbanStore } from '../js/store/KanbanStore.js';

export async function runKanbanTests() {
  const suite = new TestSuite('Kanban Store');

  // Clean state
  localStorage.removeItem('hush_kanban');

  suite.add('Should create default board for workspace', async () => {
    const store = new KanbanStore();
    const board = store.createBoard('ws_1', 'Project Alpha');

    assert.equal(board.workspaceId, 'ws_1');
    assert.equal(board.title, 'Project Alpha');
    assert.ok(board.columns.length === 0, 'New board has no columns');
  });

  suite.add('Should add columns and cards', async () => {
    const store = new KanbanStore();
    const board = store.createBoard('ws_1', 'Dev Board');

    const colTodo = store.createColumn(board.id, 'To Do');
    const colDone = store.createColumn(board.id, 'Done');

    assert.equal(store.data.boards[board.id].columns.length, 2);

    const card = store.createCard(colTodo.id, 'Fix Bug #1');

    assert.equal(card.title, 'Fix Bug #1');
    assert.equal(store.data.columns[colTodo.id].cards[0], card.id, "Card ID should be in column");
  });

  suite.add('Should move card between columns', async () => {
    const store = new KanbanStore();
    const board = store.createBoard('ws_2', 'Moving Test');
    const col1 = store.createColumn(board.id, 'Col 1');
    const col2 = store.createColumn(board.id, 'Col 2');
    const card = store.createCard(col1.id, 'Moving Card');

    // Move logic
    store.moveCard(card.id, col1.id, col2.id, 0);

    // Check old column
    const oldCol = store.getColumn(col1.id);
    assert.equal(oldCol.cards.length, 0, "Card removed from source");

    // Check new column
    const newCol = store.getColumn(col2.id);
    assert.equal(newCol.cards.length, 1, "Card added to dest");
    assert.equal(newCol.cards[0], card.id, "Card ID matches");
  });

  await suite.run();
}
