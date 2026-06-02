const assert = require('assert');
const { TesteServico, criarTesteServico } = require('./teste-servico');

console.log('====== INICIANDO TESTE DE HOMOLOGAÇÃO SEMANAL ======');

try {
  // Teste 1: Adicionar registro
  const servicoLimpo = new TesteServico();
  servicoLimpo.adicionar({ codigo: 'abc', descricao: 'Teste Commit', ativo: true });
  assert.strictEqual(servicoLimpo.contar(), 1, 'O contador deveria ser igual a 1');
  console.log('✅ Teste 1: Inserção e contagem funcionando.');





  // Teste 2: Listar apenas registros ativos
  servicoLimpo.adicionar({ codigo: 'def', descricao: 'Inativo', ativo: false });
  const ativos = servicoLimpo.listarAtivos();
  assert.strictEqual(ativos.length, 1, 'Deveria listar apenas 1 registro ativo');
  assert.strictEqual(ativos[0].codigo, 'abc', 'O código do registro ativo deveria ser "abc"');
  console.log('✅ Teste 2: Filtro de registros ativos funcionando.');




  // Teste 3: Validar a fábrica inicial (criarTesteServico)
  const servicoFabrica = criarTesteServico();
  assert.strictEqual(servicoFabrica.contar(), 2, 'A fábrica deveria iniciar com 2 registros');
  assert.strictEqual(servicoFabrica.listarAtivos().length, 1, 'A fábrica deveria ter apenas 1 ativo');
  console.log('✅ Teste 3: Inicialização da fábrica padrão funcionando.');









  console.log('\n🎉 SUCESSO COMPLETO: Todos os testes estáticos passaram para o commit semanal!');



  



} catch (error) {
  console.error('❌ ERRO NO TESTE SEMANAL:');
  console.error(error.message);
  process.exit(1); // Força falha se algo der errado
}