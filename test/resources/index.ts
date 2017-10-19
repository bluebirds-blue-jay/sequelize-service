import { UserService } from './services/user/user';
import { Models } from './models/index';

export { database } from './database';
export const userService = new UserService(Models.User);
