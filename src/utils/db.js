import { deleteDB, openDB } from 'idb';

export const dbPromise = openDB('tableDB', 1, {
  upgrade(db) {
    db.createObjectStore('tables', {
      keyPath: 'id',
      autoIncrement: true,
    });
  },
});

export const saveDataToIndexedDB = async (data) => {
  const db = await dbPromise;
  await db.put('tables', { id: 'userTableSetup', ...data });
};

export const loadDataFromIndexedDB = async () => {
  const db = await dbPromise;
  return await db.get('tables', 'userTableSetup');
};

export const deleteDataFromIndexedDB = async () => {
  try {
    const db = await dbPromise;
    await db.delete('tables', 'userTableSetup');
    alert('Data has been deleted from database.');
  } catch (error) {
    alert('Failed to delete data from IndexedDB:', error);
  }
};

export const deleteDatabaseWithConfirmation = async () => {
  const confirmation = window.confirm('Please confirm the deletion of the "tableDB" database.');

  if (confirmation) {
    const retryDelete = async (retries = 3, delay = 1000) => {
      try {
        await deleteDB('tableDB', {
          blocked() {
            if (retries > 0) {
              setTimeout(() => retryDelete(retries - 1, delay), delay);
            } else {
              alert('Failed to delete the database. Please try again later.');
            }
          },
        });
        alert('Database "tableDB" has been deleted successfully.');
      } catch (error) {
        alert('Failed to delete the database:', error);
      }
    };
    window.location.reload();

    retryDelete();
  } else {
    alert('Database deletion canceled by the user.');
  }
};
