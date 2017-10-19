export type TUser = {
  id?: number;
  email: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  lucky_number?: number;
  password: string;
  password_last_updated_at?: Date;
};

export type TUserComputedProperties = {
  date_of_birth: Date;
};