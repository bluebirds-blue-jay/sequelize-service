import * as Sequelize from 'sequelize';
import { database } from '../database';

const Models: {
  User: Sequelize.Model<any, any>
} = <any>{};

Models.User = database.import('./user');

export { Models };