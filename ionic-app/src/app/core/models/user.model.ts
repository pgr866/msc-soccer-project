export interface User {
  uid: string;
  email: string;
  role: 'ADMIN' | 'USER';
}
