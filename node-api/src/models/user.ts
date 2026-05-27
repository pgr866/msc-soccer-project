export interface User {
    uid: string;
    email: string;
    role: 'USER' | 'ADMIN';
}
