export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phoneNumber: string;
  password: string;
  salary: string,
  userAccess: 'employee' | 'client'; 
}
