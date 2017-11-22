export type TUserWriteProperties = {
  email: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: Date;
  lucky_number?: number;
  password: string;
  password_last_updated_at?: Date;
};

export type TUserReadProperties = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  lucky_number: number;
  password: string;
  password_last_updated_at: Date;
};

export type TUserComputedProperties = {
  age?: number | null;
  isAdult?: boolean | null;
};