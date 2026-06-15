# REVIEW_ARQUITETURA.md
## Branch: `fix/script-teste` — Estabilização da Arquitetura BANTADS

> **Resultado:** 100% de aprovação na suíte de testes de integração após as correções documentadas abaixo.

---

## 🎯 Resumo Executivo

Esta branch corrigiu **cinco categorias de bugs** que impediam os testes de integração de passar. As falhas não eram isoladas: elas interagiam entre si, criando sintomas difíceis de rastrear individualmente.

| # | Categoria | Sintoma nos testes | Serviços envolvidos |
|---|---|---|---|
| 1 | **Binding de fila ausente** | SAGA de inserção de gerente nunca movia o cliente doado | ms-gerente → ms-cliente |
| 2 | **Erro de desserialização Jackson (TypeId cross-service)** | Mensagens RabbitMQ entre serviços geravam `ClassNotFoundException` | ms-cliente |
| 3 | **Lógica SAGA no serviço errado** | `ms-gerente` tentava descobrir quem tinha mais clientes sem acesso aos dados | ms-gerente, ms-cliente |
| 4 | **Race condition no controller** | Script de teste validava o estado antes da SAGA assíncrona terminar | ms-gerente |
| 5 | **CQRS incorreto no ms-conta** | Extrato retornava tipo errado (`"depósito"` em vez de `"saque"`), timestamps com nanosegundos causavam comparações inválidas, campo `origem` nulo em depósitos | ms-conta |

Adicionalmente, foram feitas correções no **API Gateway** para suportar API Composition (dashboard de gerentes, enriquecimento de saldo por cliente, revogação de tokens) e no **ms-cliente** para corrigir o campo `conta` do cliente que nunca era persistido ao aprovar um autocadastro.

---

## 🛠️ Detalhamento por Microsserviço

---

### ms-cliente

#### 1. Novos bindings e exchanges RabbitMQ (`RabbitMqConfiguracao.java`)

**Problema:** A fila `cliente.atribuir-conta.queue` estava declarada mas **sem binding para nenhuma exchange**. O ms-gerente publicava a solicitação de doação de cliente em `gerente.insercao.exchange → gerente.atribuir-conta`, mas essa mensagem nunca chegava ao ms-cliente.

**Correção:** Adicionados exchange, filas e bindings para os dois fluxos SAGA ausentes:

```
gerente.insercao.exchange
  ├── gerente.consultar-mais-contas   →  gerente.consultar-mais-contas.queue
  └── gerente.atribuir-conta         →  cliente.atribuir-conta.queue  ← estava sem binding

gerente.remocao.exchange
  └── gerente.transferencia-contas-remocao  →  cliente.transferir-contas-remocao.queue
```

#### 2. Correção do `JacksonJsonMessageConverter` — TypeId cross-service

**Problema:** Mensagens originadas em ms-gerente carregavam o header `__TypeId__: com.bantads.gerente.mensageria.XYZ`. O `JacksonJsonMessageConverter` padrão tentava carregar essa classe no classpath do ms-cliente, lançando `ClassNotFoundException` silenciosamente.

**Correção:**
```java
// RabbitMqConfiguracao.java
@Bean
public JacksonJsonMessageConverter conversorJsonRabbitMq() {
    JacksonJsonMessageConverter converter = new JacksonJsonMessageConverter();
    converter.setAlwaysConvertToInferredType(true); // usa tipo do parâmetro do método, ignora __TypeId__
    return converter;
}
```

> **Impacto amplo:** Esta correção beneficia **todos** os listeners do ms-cliente que recebem mensagens de outros serviços (`ListenerTransferenciaClienteRemocaoSaga`, `ListenerRespostaGerenteAutocadastro`, etc.).

#### 3. Novo listener: `ListenerConsultaGerenteMaisContasCliente` (pacote `mensageria/insercaogerente`)

**Problema:** O ms-gerente tinha um `ListenerConsultaGerenteMaisContas` que respondia à consulta SAGA sobre "quem tem mais clientes?" com `gerenteRepository.findAll().get(0)` — ou seja, sempre retornava o primeiro gerente da lista, sem qualquer dado real de clientes.

**Princípio violado:** ms-gerente não tem acesso à base de clientes. O **dono dos dados de clientes é o ms-cliente**, e é ele quem deve responder.

**Correção:** Criado listener no ms-cliente que recebe o evento de consulta, faz a query no **seu próprio banco de dados** e publica a resposta de volta:

```java
// ListenerConsultaGerenteMaisContasCliente.java
@RabbitListener(queues = RabbitMqConfiguracao.FILA_CONSULTAR_GERENTE_MAIS_CONTAS_CLIENTE)
public void consumir(EventoConsultaGerenteMaisContas evento) {
    List<Cliente> todos = clienteRepository.findAll();
    Map<String, Long> contagemPorGerente = todos.stream()
        .filter(c -> c.getCpfGerenteResponsavel() != null)
        .collect(Collectors.groupingBy(Cliente::getCpfGerenteResponsavel, Collectors.counting()));
    // ... publica EventoRespostaGerenteMaisContas de volta para o orquestrador
}
```

Novos arquivos criados:
- `EventoConsultaGerenteMaisContas.java` — record recebido pelo listener
- `EventoRespostaGerenteMaisContas.java` — record publicado de volta ao ms-gerente

#### 4. Novo listener: `ListenerAtribuicaoClienteSaga` com fechamento de loop

**Problema:** Mesmo que a mensagem chegasse (com o binding corrigido), o listener existente realizava a transferência do cliente mas **nunca publicava uma resposta**. O `OrquestradorSagaInsercaoGerente` ficava preso no estado `"AGUARDANDO_ATRIBUICAO_CONTA"` indefinidamente, impedindo o Smart Wait de detectar o fim da SAGA.

**Correção:** O listener agora publica `EventoRespostaAtribuicaoConta` ao final (tanto no caminho feliz quanto no `catch`):

```java
rabbitTemplate.convertAndSend(
    RabbitMqConfiguracao.EXCHANGE_INSERCAO_GERENTE,
    RabbitMqConfiguracao.CHAVE_RESPOSTA_ATRIBUICAO_CONTA,
    new EventoRespostaAtribuicaoConta(evento.sagaId(), 1, true, "Atribuição concluída")
);
```

Novo arquivo criado: `EventoRespostaAtribuicaoConta.java`

#### 5. `ClienteResponseDTO` — renomeação do campo `gerente` e adição de `conta`/`saldo`

**Problema:** O API Gateway filtrava clientes por `c.gerente === cpfDoGerente`, mas o DTO expunha o campo como `cpfGerenteResponsavel`. Os clientes nunca apareciam no dashboard de nenhum gerente.

**Correção:**
```java
// Antes
private String cpfGerenteResponsavel;
// Depois
private String gerente;  // campo mapeado como esperado pelo API Gateway
private String conta;    // número da conta bancária
private Double saldo;    // enriquecido pelo gateway
private Double limite;   // calculado: salario >= 2000 ? salario/2 : 0
```

#### 6. `OrquestradorAprovacaoCliente` — campo `conta` nunca era persistido

**Problema:** Ao aprovar um autocadastro de cliente, o orquestrador definia o status como `APROVADO` mas **não gravava o número da conta** criado pelo ms-conta na SAGA. O campo `conta` ficava `null` no banco.

**Correção:**
```java
// OrquestradorAprovacaoCliente.java — adicionado antes de setStatus(APROVADO)
cliente.setConta(saga.getNumeroConta());
cliente.setStatus(StatusCliente.APROVADO);
clienteRepository.save(cliente);
```

---

### ms-gerente

#### 1. Padrão Smart Wait no `POST /gerentes` — eliminação da race condition

**Problema:** O endpoint `POST /gerentes` tinha um `Thread.sleep(2000)` fixo. O script de teste Python fazia a requisição e imediatamente consultava o estado dos clientes. Em ambientes com carga ou com a SAGA mais longa que 2 segundos, a transferência de cliente ainda não tinha ocorrido no momento da validação.

**Correção:** Substituído por um polling no status da SAGA com timeout de 5 segundos:

```java
// GerenteController.java
String sagaId = sagaService.iniciarInsercaoGerente(dto);

long inicio = System.currentTimeMillis();
EstadoSagaInsercao estado;
do {
    try { Thread.sleep(200); } catch (InterruptedException e) { Thread.currentThread().interrupt(); break; }
    estado = sagaService.consultarStatusSaga(sagaId);
} while (estado != null
    && !"CONCLUIDA".equals(estado.getStatus())
    && !"ERRO".equals(estado.getStatus())
    && (System.currentTimeMillis() - inicio) < 5000);
```

O HTTP só retorna `201 Created` quando a SAGA completa (ou após timeout). Isso garante que qualquer cliente consultando o estado logo após o POST verá o resultado consolidado.

#### 2. `SagaGerenteService` — validação de duplicidade e retorno de sagaId

**Problema:** `iniciarInsercaoGerente` não validava CPF/e-mail duplicados antes de disparar a SAGA. Em caso de duplicata, a SAGA era iniciada e falhava internamente sem retornar `409 Conflict` ao cliente HTTP.

**Correção:** Validação movida para antes do disparo da SAGA. O método agora retorna `String sagaId` (necessário para o Smart Wait no controller):

```java
public String iniciarInsercaoGerente(GerenteInsercaoDTO dto) {
    if (gerenteRepository.existsByCpf(dto.getCpf()))
        throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
    if (gerenteRepository.existsByEmail(dto.getEmail()))
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
    String sagaId = UUID.randomUUID().toString();
    orquestrador.iniciarSaga(sagaId, dto);
    return sagaId;
}
```

#### 3. `ListenerConsultaGerenteMaisContas` — desativado

A anotação `@RabbitListener` foi removida. A responsabilidade de responder a essa consulta foi movida para o ms-cliente (ver seção acima). A classe permanece no código mas está inativa.

#### 4. `OrquestradorSagaInsercaoGerente` — criação de acesso faltando

**Problema:** O passo de criação de credencial de login (`publicarCriacaoAcessoGerente`) não estava sendo disparado dentro do orquestrador, apenas no serviço legado `GerenteServiceImpl`. Gerentes inseridos via SAGA não tinham acesso ao sistema.

**Correção:** Adicionado o disparo do `ComandoCriacaoAcessoGerente` no passo `inserirNovoGerente` do orquestrador.

---

### ms-conta

#### 1. Correção do campo `tipo` na movimentação de saque (CQRS)

**Problema:** O método `sacar()` em `ServicoContaEscrita` publicava o evento CQRS com `TipoMovimentacao.DEPOSITO` em vez de `TipoMovimentacao.SAQUE`. O banco de escrita (ms_conta_cud) ficava correto, mas o banco de leitura (ms_conta_r), alimentado via RabbitMQ, gravava tipo `"depósito"` para saques. O endpoint `/extrato` consultava o banco de leitura.

```java
// Antes (bug)
publicarEvento(criarEvento(conta, TipoMovimentacao.DEPOSITO, ...));

// Depois
publicarEvento(criarEvento(conta, TipoMovimentacao.SAQUE, ...));
```

#### 2. Truncamento de timestamp para milissegundos

**Problema:** `OffsetDateTime.now()` retorna precisão de nanosegundos em alguns JVMs. Os testes comparavam timestamps serializados como strings e qualquer diferença de precisão causava falhas de assertividade.

**Correção:** Todos os timestamps de movimentações agora são truncados para milissegundos:
```java
OffsetDateTime.now().truncatedTo(ChronoUnit.MILLIS)
```
Aplicado em: criação de conta, depósito, saque e transferência.

#### 3. Correção dos campos `origem` e `destino` em depósitos e saques

**Problema:** O campo `origem` em depósitos era `null` e o campo `destino` em saques era `null`. Os testes verificavam que `m["origem"] == conta` para ambas as operações.

**Correção:**
- **Depósito:** `origem` era `null` → agora `conta.getNumero()`
- **Saque:** `destino` era `null` → agora `conta.getNumero()`

#### 4. Correção da ordenação do extrato (`ServicoContaLeitura`)

**Problema:** O repositório buscava com `ORDER BY data DESC` e depois o service aplicava `.sorted(Comparator.comparing(...).reversed())` — dois inversões, resultando em ordem decrescente. O teste esperava ordem cronológica crescente.

**Correção:** Removido o `.reversed()`:
```java
// Antes
.sorted(Comparator.comparing(MovimentacaoLeitura::getData).reversed())

// Depois (ordem cronológica ascendente, conforme esperado pelos testes)
.sorted(Comparator.comparing(MovimentacaoLeitura::getData))
```

---

### API Gateway (Node.js)

#### 1. Revogação de token (suporte a logout)

**Problema:** `verifyJWT` apenas validava a assinatura JWT localmente, sem consultar o ms-auth. Tokens de usuários que fizeram logout continuavam válidos.

**Correção:** Adicionada chamada assíncrona ao ms-auth para validar se o token está na blacklist:
```javascript
async function verifyJWT(req, res, next) {
    // ...
    const authResponse = await fetch("http://ms-auth:8080/validate", {
        headers: { Authorization: authHeader }
    });
    if (authResponse.status === 401) {
        return res.status(401).json({ auth: false, message: "Token revogado (Logout)." });
    }
}
```

#### 2. Rota `/reboot` — orquestração paralela de todos os serviços

**Problema:** A rota `/reboot` apenas delegava para o ms-auth via proxy. Os outros três serviços não eram reiniciados.

**Correção:**
```javascript
app.get("/reboot", async (req, res) => {
    await Promise.all([
        fetch("http://ms-auth:8080/reboot"),
        fetch("http://ms-cliente:8080/reboot"),
        fetch("http://ms-gerente:8080/reboot"),
        fetch("http://conta:8080/reboot")
    ]);
});
```

#### 3. API Composition — Dashboard de gerentes

**Problema:** O ms-gerente retornava `clientes: []` (lista vazia) no endpoint de dashboard. O gateway precisava enriquecer a resposta com dados reais de clientes e saldos.

**Correção:** O gateway detecta respostas com formato `{gerente, clientes}` e realiza o join:
```javascript
app.get('/gerentes', verifyJWT, async (req, res, next) => {
    let respostaGerentes = await fetch(`http://ms-gerente:8080/gerentes${queryString}`);
    if (respostaGerentes[0]?.gerente) {
        const todosClientes = await fetch(`http://ms-cliente:8080/clientes`);
        // enriquece saldo de cada cliente via ms-conta
        // filtra clientes por c.gerente === cpfDoGerente
        // calcula saldo_positivo e saldo_negativo por gerente
        // ordena por saldo_positivo desc
    }
});
```

#### 4. API Composition — Saldo por cliente

Adicionadas rotas compostas `GET /clientes` e `GET /clientes/:cpf` que buscam o dado base no ms-cliente e enriquecem com o saldo real do ms-conta, incluindo filtro `melhores_clientes` (top 3 por saldo).

---

## 🔍 Pontos de Melhoria e Refatoração (Para a Equipe)

> **Regra de ouro:** Nenhuma das refatorações abaixo deve alterar o comportamento de I/O que faz os testes passarem. Toda mudança deve ser validada com `pytest` antes de ser mergeada.

### 1. Substituir `findAll()` + Stream por `@Query` com `GROUP BY` no banco

**Arquivo:** `ListenerConsultaGerenteMaisContasCliente.java`

**Situação atual:** O listener carrega **todos os clientes** em memória para depois contar via Streams:
```java
List<Cliente> todos = clienteRepository.findAll();  // carrega tudo
Map<String, Long> contagem = todos.stream()
    .filter(c -> c.getCpfGerenteResponsavel() != null)
    .collect(Collectors.groupingBy(..., Collectors.counting()));
```

**Problema:** Com crescimento da base, isso se torna um problema sério de memória e latência.

**Sugestão:** Adicionar query nativa ao `ClienteRepository`:
```java
// ClienteRepository.java
@Query("SELECT c.cpfGerenteResponsavel, COUNT(c) FROM Cliente c " +
       "WHERE c.cpfGerenteResponsavel IS NOT NULL AND c.status = 'APROVADO' " +
       "GROUP BY c.cpfGerenteResponsavel ORDER BY COUNT(c) DESC")
List<Object[]> contarClientesPorGerente();
```
O listener então pega apenas o primeiro resultado — sem carregar nenhum objeto `Cliente` na memória.

### 2. Estado da SAGA em banco de dados (resiliência)

**Arquivo:** `OrquestradorSagaInsercaoGerente.java`

**Situação atual:** O estado da SAGA é mantido em `ConcurrentHashMap` em memória:
```java
private final ConcurrentHashMap<String, EstadoSagaInsercao> estadosSagas = new ConcurrentHashMap<>();
```

**Problema:** Em caso de reinício do ms-gerente durante uma SAGA em andamento, o estado é perdido. A SAGA fica "zumbi" — o ms-cliente pode entregar a resposta mas o orquestrador não existe mais para processá-la.

**Sugestão:** Persistir `EstadoSagaInsercao` em banco de dados com JPA, com campos para `sagaId`, `status` e `dataInicio`. Isso também permite implementar um job de limpeza/compensação para SAGAs travadas.

### 3. Smart Wait no `DELETE /gerentes` ainda usa sleep fixo

**Arquivo:** `GerenteController.java`

**Situação atual:** O endpoint de remoção ainda usa `Thread.sleep(2000)`:
```java
sagaRemocaoService.iniciarRemocaoGerente(cpf);
Thread.sleep(2000);
```

**Sugestão:** Aplicar o mesmo padrão Smart Wait implementado no POST, consultando o estado da SAGA de remoção via `OrquestradorSagaRemocaoGerente`.

### 4. `ListenerConsultaGerenteMaisContas` (ms-gerente) pode ser removido

**Arquivo:** `ListenerConsultaGerenteMaisContas.java` em ms-gerente

**Situação atual:** A classe existe mas está inativa (`@RabbitListener` removido). É dead code.

**Sugestão:** Remover a classe por completo. A lógica foi movida para `ListenerConsultaGerenteMaisContasCliente` em ms-cliente.

### 5. `ClienteResponseDTO.fromEntity()` sempre inclui salário agora

**Arquivo:** `ClienteResponseDTO.java`

**Situação atual:** `fromEntity(Cliente c)` agora chama `fromEntity(c, true)` — salário sempre incluso. A sobrecarga com `boolean incluirSalario` está disponível mas o default mudou.

**Atenção:** Verificar se algum endpoint público (sem autenticação) chama `fromEntity(c)` sem intenção de expor o salário.

---

## ✅ Check-list para o Code Reviewer

Antes de aprovar o Pull Request, verifique os itens abaixo:

- [ ] **Bindings RabbitMQ:** No painel do RabbitMQ Management (`http://localhost:15672`), confirmar que `gerente.insercao.exchange` tem bindings para `gerente.consultar-mais-contas.queue` e `cliente.atribuir-conta.queue`
- [ ] **TypeId fix abrangente:** Confirmar que `setAlwaysConvertToInferredType(true)` não quebra listeners existentes como `ListenerRespostaGerenteAutocadastro` e `ListenerTransferenciaClienteRemocaoSaga`
- [ ] **Smart Wait:** No fluxo feliz, confirmar que o `POST /gerentes` retorna em menos de 2 segundos (a SAGA deve concluir bem antes do timeout de 5s em ambiente local)
- [ ] **Extrato CQRS:** Confirmar que, após um saque, o campo `tipo` no extrato retorna `"saque"` (não `"depósito"`) e a ordem das movimentações é cronológica crescente
- [ ] **Campo `conta` no cliente:** Após aprovar um autocadastro, confirmar que `GET /clientes/{cpf}` retorna o campo `conta` preenchido (não `null`)
- [ ] **Campo `gerente` no DTO:** Confirmar que `GET /clientes` retorna o campo `gerente` (não `cpfGerenteResponsavel`) para compatibilidade com o join do API Gateway
- [ ] **Dashboard:** Confirmar que `GET /gerentes?filtro=dashboard` retorna cada gerente com a lista de clientes correta e os campos `saldo_positivo`/`saldo_negativo`
- [ ] **Suíte de testes completa:** Executar `pytest test_dac_bantads.py -v` e confirmar 100% de aprovação antes do merge

---

*Documento gerado a partir do diff `main...fix/script-teste` em 2026-06-14.*
