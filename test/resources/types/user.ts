export type TUser = {
  id?: number;
  email: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  lucky_number?: number;
  date_of_birth?: Date;
  password: string;
  password_last_updated_at?: Date;
};