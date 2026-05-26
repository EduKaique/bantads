import { ContaService } from '../../../core/services/conta.service';
import { ClientAccountService } from './client-account.service';

describe('ClientAccountService', () => {
  it('deve manter compatibilidade apontando para ContaService em core/services', () => {
    expect(ClientAccountService).toBe(ContaService);
  });
});
