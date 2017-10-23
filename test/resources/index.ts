import { UserService } from './services/user';
import { Models } from './models';

export { database } from './database';
export const userService = new UserService(Models.User);
