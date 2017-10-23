import * as Sequelize from 'sequelize';
import * as MySQL from 'mysql2/promise';

export interface IDatabase extends Sequelize.Sequelize {
  reset: (options?: { transaction?: Sequelize.Transaction }) => Promise<void>;
  disableForeignKeyCheck: (options?: { transaction?: Sequelize.Transaction }) => Promise<void>;
  restoreForeignKeyCheck: (options?: { transaction?: Sequelize.Transaction }) => Promise<void>;
  listTables: (options?: { transaction?: Sequelize.Transaction }) => Promise<string[]>;
  setup: () => Promise<void>;
  isSetup: boolean;
}

const DB_NAME = 'bluejay_sequelize_service_test';
const DB_USER = 'root';
const DB_PASSWORD = '';
const DB_HOST = 'localhost';

const database: IDatabase = <IDatabase>new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  dialect: 'mysql',
  host: DB_HOST,
  logging: false
});

database.setup = async function() {
  const connection = await MySQL.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD });
  await connection.query(`DROP DATABASE IF EXISTS ${DB_NAME};`);
  await connection.query(`CREATE DATABASE ${DB_NAME};`);
  await database.sync({ force: true });
  await connection.close();
  this.isSetup = true;
};

database.reset = async function() {
  if (!this.isSetup) {
    await this.setup();
  }

  await this.transaction(async (transaction: Sequelize.Transaction) => {
    const options = { transaction };

    await this.disableForeignKeyCheck(options);
    const tables = await this.listTables(options);

    for (const table of tables) {
      await this.query(`TRUNCATE TABLE ${table};`, options);
    }

    await this.restoreForeignKeyCheck(options);
  });
};

database.disableForeignKeyCheck = async function(options: Partial<{ transaction: Sequelize.Transaction }> = {}) {
  await this.query('SET FOREIGN_KEY_CHECKS = 0;', options);
};

database.restoreForeignKeyCheck = async function(options: Partial<{ transaction: Sequelize.Transaction }> = {}) {
  await this.query('SET FOREIGN_KEY_CHECKS = 1;', options);
};

database.listTables = async function(options: Partial<{ transaction: Sequelize.Transaction }> = {}) {
  const result = <[{ table_name: string }[]]>await this.query(`SELECT table_name FROM information_schema.tables where table_schema='${DB_NAME}';`, options);
  return result[0].map(item => item.table_name);
};

export { database };