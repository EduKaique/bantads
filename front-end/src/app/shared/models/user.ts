export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phoneNumber: string;
  password: string;
  salary: number,
  userAccess: 'employee' | 'client'; 
}
