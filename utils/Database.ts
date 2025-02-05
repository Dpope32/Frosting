import { Message, Role } from '@/utils/Interfaces';

export interface SQLResultSet {
  insertId?: number;
  rowsAffected: number;
  rows: {
    length: number;
    item: (index: number) => any;
    _array: any[];
  };
}

export interface SQLError {
  code: number;
  message: string;
}

export interface SQLTransaction {
  executeSql: (
    sqlStatement: string,
    args?: any[],
    callback?: (transaction: SQLTransaction, resultSet: SQLResultSet) => void,
    errorCallback?: (transaction: SQLTransaction, error: SQLError) => boolean
  ) => void;
}

export type Database = {
  transaction: (
    callback: (transaction: SQLTransaction) => void,
    errorCallback?: (error: SQLError) => void,
    successCallback?: () => void
  ) => void;
};


export async function migrateDbIfNeeded(db: Database) {
  // Log DB path for debugging
  // console.log(FileSystem.documentDirectory);
  const DATABASE_VERSION = 1;
  return new Promise<void>((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        'PRAGMA user_version',
        [],
        (_: SQLTransaction, result: SQLResultSet) => {
          const currentDbVersion = result.rows.item(0)?.user_version ?? 0;
          if (currentDbVersion >= DATABASE_VERSION) {
            resolve();
            return;
          }
          
          if (currentDbVersion === 0) {
            tx.executeSql(`
              PRAGMA journal_mode = 'wal';
              CREATE TABLE chats (
                id INTEGER PRIMARY KEY NOT NULL, 
                title TEXT NOT NULL
              );

              CREATE TABLE messages (
                id INTEGER PRIMARY KEY NOT NULL, 
                chat_id INTEGER NOT NULL, 
                content TEXT NOT NULL, 
                imageUrl TEXT, 
                role TEXT, 
                prompt TEXT, 
                FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE
              );
            `);
          }

          tx.executeSql(`PRAGMA user_version = ${DATABASE_VERSION}`);
          resolve();
        },
        (_: SQLTransaction, error: SQLError) => {
          reject(error);
          return false;
        }
      );
    });
  });

}

export const addChat = async (db: Database, title: string) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        'INSERT INTO chats (title) VALUES (?)',
        [title],
        (_: SQLTransaction, result: SQLResultSet) => resolve(result),
        (_: SQLTransaction, error: SQLError) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getChats = async (db: Database) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        'SELECT * FROM chats',
        [],
        (_: SQLTransaction, result: SQLResultSet) => {
          const chats = [];
          for (let i = 0; i < result.rows.length; i++) {
            chats.push(result.rows.item(i));
          }
          resolve(chats);
        },
        (_: SQLTransaction, error: SQLError) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getMessages = async (db: Database, chatId: number): Promise<Message[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        'SELECT * FROM messages WHERE chat_id = ?',
        [chatId],
        (_: SQLTransaction, result: SQLResultSet) => {
          const messages = [];
          for (let i = 0; i < result.rows.length; i++) {
            const message = result.rows.item(i);
            messages.push({
              ...message,
              role: '' + message.role === 'bot' ? Role.Bot : Role.User,
            });
          }
          resolve(messages);
        },
        (_: SQLTransaction, error: SQLError) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const addMessage = async (
  db: Database,
  chatId: number,
  { content, role, imageUrl, prompt }: Message
) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        'INSERT INTO messages (chat_id, content, role, imageUrl, prompt) VALUES (?, ?, ?, ?, ?)',
        [
          chatId,
          content,
          role === Role.Bot ? 'bot' : 'user',
          imageUrl || '',
          prompt || ''
        ],
        (_: SQLTransaction, result: SQLResultSet) => resolve(result),
        (_: SQLTransaction, error: SQLError) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const deleteChat = async (db: Database, chatId: number) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        'DELETE FROM chats WHERE id = ?',
        [chatId],
        (_: SQLTransaction, result: SQLResultSet) => resolve(result),
        (_: SQLTransaction, error: SQLError) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const renameChat = async (db: Database, chatId: number, title: string) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        'UPDATE chats SET title = ? WHERE id = ?',
        [title, chatId],
        (_: SQLTransaction, result: SQLResultSet) => resolve(result),
        (_: SQLTransaction, error: SQLError) => {
          reject(error);
          return false;
        }
      );
    });
  });
};
