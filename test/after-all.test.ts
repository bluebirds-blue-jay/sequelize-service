import { database } from './resources';

after(async () => {
  await database.close();
});