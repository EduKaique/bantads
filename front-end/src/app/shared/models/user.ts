export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phoneNumber: string;
  salary: number,
  userAccess: 'employee' | 'client'; 
}
