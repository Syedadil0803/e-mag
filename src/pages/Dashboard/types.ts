
export type UserRole = 'Admin' | 'Editor' | 'Author' | 'Reviewer';

export interface User {
    name: string;
    role: UserRole;
    avatar?: string;
}
