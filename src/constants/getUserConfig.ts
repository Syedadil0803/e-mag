type IConfigUser = {
  phone: string;
  password: string;
  categoryId: number;
  provideUserId?: number;
  provideCategoryId?: number;
};

export function getUserConfig(defaultUser: IConfigUser): IConfigUser {
  return defaultUser;
}
