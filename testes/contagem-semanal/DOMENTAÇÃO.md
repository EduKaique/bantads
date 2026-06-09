Banco de Questões: Desenvolvimento de Aplicativos Corporativos (DAC)

Questão 1: Vantagens de Microsserviços
No desenvolvimento de aplicações corporativas, a migração de uma arquitetura monolítica para uma arquitetura baseada em microsserviços traz diversas justificativas técnicas. Qual das seguintes opções apresenta a principal vantagem dessa abordagem?

a) Eliminação completa da necessidade de testes automatizados devido ao isolamento do código.
b) Compartilhamento centralizado e obrigatório de um único banco de dados relacional por todos os componentes do sistema.
c) Facilidade de manutenção e capacidade de escalabilidade independente para cada serviço de negócio.
d) Redução drástica da latência de rede em todas as comunicações internas da aplicação corporativa.
e) Centralização do ciclo de vida de implantação (deploy) de todos os módulos em um único pacote compilado.

Resposta correta: c

Questão 2: Helper Rabbit
Ao utilizar ferramentas ou classes utilitárias auxiliares (Helpers) integradas ao RabbitMQ em uma solução baseada em Spring AMQP, o principal objetivo do desenvolvedor ao configurar e injetar esses componentes no fluxo da aplicação é:

a) Forçar a conversão automática de chamadas síncronas HTTP REST diretamente em conexões JDBC estruturadas.
b) Simplificar a declaração de filas, exchanges, bindings e o envio/recebimento de mensagens, encapsulando a complexidade da API nativa.
c) Garantir que o banco de dados relacional seja replicado em tempo real em múltiplos clusters geográficos sem usar SQL.
d) Substituir integralmente o uso de controladores @RestController para anulações de rotas HTTP.
e) Permitir que o navegador cliente acesse as filas diretamente sem passar por uma camada de backend ou API Gateway
.
Resposta correta: b

Questão 3: Media Type HTTP JSON
Durante a comunicação entre microsserviços via requisições RESTful, é fundamental definir a natureza dos dados trafegados no corpo (body) da mensagem HTTP. Qual cabeçalho e respectivo Media Type devem ser utilizados para indicar que o conteúdo enviado ou esperado está no formato JSON?
a) Content-Type: text/xml
b) Accept: application/javascript
c) Content-Type: application/json
d) Content-Encoding: gzip/json
e) Type: text/json-stream

Resposta correta: c

Questão 4: Anotação URI Get Parameter
No ecossistema Spring Boot, ao construir um endpoint REST que precisa capturar um valor dinâmico passado diretamente como parte do caminho da URL (ex: /usuarios/{id}), qual anotação deve ser utilizada no parâmetro do método do controlador?
a) @RequestParam
b) @QueryParam
c) @RequestBody
d) @PathVariable
e) @MatrixVariable

Resposta correta: d

Questão 5: Padrão Consulta Distribuída Database per Service
Adotando o padrão de design (design pattern) de banco de dados por serviço (Database per Service), as consultas que envolvem a junção (join) de dados residentes em diferentes bases tornam-se um desafio. Qual padrão é especificamente modelado para resolver esse cenário por meio da composição e agregação manual de chamadas a múltiplos serviços?

a) CQRS (Command Query Responsibility Segregation)
b) API Composition
c) Event Sourcing
d) Transactional Outbox
e) Shared Database Monolith

Resposta correta: b

Questão 6: Agregados do Domain-Driven Design (DDD)
Dentro das práticas de Domain-Driven Design (DDD), amplamente utilizadas na decomposição de microsserviços, como é chamado o composto de objetos de domínio (entidades e objetos de valor) que são tratados como uma única unidade para fins de mudança de dados e que possui uma raiz (root) externa?

a) DTO (Data Transfer Object)
b) Service Layer
c) Aggregate (Agregado)
d) Repository Pattern
e) Anemic Domain Model

Resposta correta: c


Questão 7: Transações Distribuídas e Atomicidade
Em sistemas baseados em microsserviços onde cada serviço possui sua própria base de dados, garantir a atomicidade de transações de negócios de longa duração sem recorrer a protocolos de bloqueio pesado de duas fases (2PC) é um desafio crucial. Qual padrão resolve isso implementando uma sequência de transações locais seguidas por ações de compensação em caso de falha?

a) Padrão SAGA
b) Padrão Circuit Breaker
c) Padrão Strangler Fig
d) Padrão Bulkhead
e) Padrão Proxy Reverso
Resposta correta: a

Questão 8: HTTP Status para Chave Duplicada
Ao projetar uma API RESTful corporativa, um cliente tenta realizar uma requisição POST /usuarios para inserir um novo registro. No entanto, o sistema detecta que já existe um usuário com o mesmo identificador exclusivo (ex: mesmo CPF ou email). De acordo com as boas práticas HTTP, qual código de status deve ser retornado?

a) 201 Created
b) 400 Bad Request
c) 404 Not Found
d) 409 Conflict
e) 503 Service Unavailable

Resposta correta: d

Questão 9: Lei de Conway Reversa
A Lei de Conway estabelece que as organizações tendem a criar sistemas que copiam sua própria estrutura de comunicação. O que prega a "Lei de Conway Reversa" (Inverse Conway Maneuver) aplicada ao contexto de arquitetura de software?

a) Unificar todas as equipes de desenvolvimento em um único grande time focado em manter o monólito.
b) Projetar e organizar a estrutura dos times técnicos em torno da arquitetura de microsserviços que se deseja alcançar para o sistema.
c) Eliminar gerentes de projeto para permitir a criação automática de código autônomo.
d) Forçar a equipe de infraestrutura a reescrever o código da aplicação em linguagem de baixo nível.
e) Permitir que cada programador trabalhe de forma isolada sem nenhuma comunicação interna.

Resposta correta: b


Questão 10: Extensão de Interfaces no Spring Data JPA
No desenvolvimento de aplicações com Spring Boot, o Spring Data JPA reduz drasticamente a necessidade de códigos repetitivos de acesso a dados (CRUD). Para criar um repositório gerenciado automaticamente para uma entidade, o desenvolvedor deve declarar uma interface que estende qual das seguintes opções padrão?

a) JpaRepository
b) CrudController
c) SqlSession
d) DataRepositoryContext
e) EntityPersistenceManager

Resposta correta: a

Questão 11: Comando Linux utilizando o Docker Hub
Deseja-se baixar uma imagem oficial e atualizada do servidor de mensageria RabbitMQ diretamente do repositório público padrão (Docker Hub) para o ambiente local via terminal Linux, sem necessariamente executá-la de imediato. Qual comando executa essa tarefa de forma precisa?

a) docker push rabbitmq
b) docker build rabbitmq
c) docker pull rabbitmq
d) docker run -d rabbitmq
e) docker commit rabbitmq

Resposta correta: c

Questão 12: Anotações para Classe Web Service RESTful no Spring
Para que uma classe Java seja reconhecida pelo framework Spring Boot como um componente capaz de expor endpoints HTTP RESTful e retornar automaticamente os dados serializados (geralmente em JSON) no corpo da resposta, ela deve ser obrigatoriamente anotada na sua definição com:

a) @Controller e @ResponseBody (ou simplesmente a combinada @RestController)
b) @Service e @Autowired
c) @Repository e @PersistenceContext
d) @Component e @ManagedBean
e) @WebService e @SOAPBinding

Resposta correta: a

Questão 13: Características de Arquiteturas Monolíticas
Ao analisar as restrições arquiteturais de sistemas legados de grande porte, qual modelo arquitetural clássico é caracterizado por apresentar escalabilidade limitada (necessitando geralmente de escala vertical pesado), forte acoplamento de código e um único ciclo de implantação unificado?

a) Arquitetura de Microsserviços Orientada a Eventos
b) Arquitetura Serverless baseada em Funções (FaaS)
c) Arquitetura Monolítica
d) Arquitetura Baseada em Espaço (Space-Based Architecture)
e) Arquitetura Hexagonal (Ports and Adapters)

Resposta correta: c

Questão 14: Framework Node.js para Criação de APIs Web
Durante a disciplina, para a construção das estruturas de API Gateway e proxies no ecossistema JavaScript/Node.js de forma simplificada, rápida e extensível através de rotas e middlewares, utilizou-se o framework:

a) Angular
b) Express
c) Vue.js
d) React Native
e) Hibernate

Resposta correta: b

Questão 15: Identificadores no Spring Data JPA
Ao mapear uma classe de modelo de domínio para persistência relacional utilizando a especificação JPA no Spring Boot, qual anotação deve ser colocada diretamente sobre o atributo que representará a chave primária (primary key) da tabela no banco de dados?

a) @Id
b) @Column(unique=true)
c) @GeneratedValue
d) @PrimaryKey
e) @Key

Resposta correta: a

Questão 16: Decomposição por Subdomínio
O padrão de design que propõe a decomposição de um sistema complexo e monolítico em microsserviços com base em "Subdomínios" baseia-se fortemente em quais conceitos e práticas de engenharia de software?

a) Padrões clássicos de design de redes locais (Modelos OSI e TCP/IP).
b) Princípios de Domain-Driven Design (DDD), dividindo o negócio em domínios Centrais (Core), Suportados (Supporting) e Genéricos (Generic).
c) Análise puramente estatística do volume de linhas de código por arquivo fonte.
d) Alocação física de servidores nos datacenters da empresa.
e) Separação exclusiva por camadas tradicionais de MVC (uma API para Views, uma para Controllers).
Resposta correta: b

Questão 17: Restrições REST e Intermediários
A arquitetura REST baseia-se em um conjunto de restrições formais. Qual restrição estabelece que a comunicação pode passar por intermediários (como balanceadores de carga, firewalls ou proxies reversos) sem que o cliente ou o servidor final precisem ter conhecimento ou ser interrompidos por essa intermediação?

a) Client-Server
b) Stateless
c) Cacheable
d) Layered System (Sistema em Camadas)
e) Code on Demand

Resposta correta: d

Questão 18: Padrão API Composition
Sobre a implementação prática do padrão API Composition atuando como agregador em uma arquitetura corporativa distribuída, assinale a afirmação correta:

a) Ele exige que todos os microsserviços envolvidos compartilhem obrigatoriamente tabelas espelhadas em uma única transação ACID tradicional.
b) O compositor de APIs (API Composer) realiza chamadas paralelas ou sequenciais aos microsserviços necessários, combina os resultados obtidos e entrega uma resposta unificada ao cliente.
c) Ele deve ser obrigatoriamente executado dentro do banco de dados relacional por meio de uma Stored Procedure.
d) Seu uso é restrito a conexões assíncronas baseadas exclusivamente em filas físicas do RabbitMQ.
e) Ele elimina totalmente a necessidade de possuir controladores HTTP na arquitetura.

Resposta correta: b

Questão 19: Interface Uniforme em REST
Em sistemas Web baseados no estilo arquitetural REST, qual restrição essencial determina o uso de regras padronizadas, genéricas e previsíveis para a comunicação e manipulação de recursos, utilizando URIs como identificadores e verbos HTTP padrão para as ações?

a) Uniform Interface (Interface Uniforme)
b) Statelessness
c) Layered System
d) Client-Server Isolation
e) Cache-Control Max-Age

Resposta correta: a

Questão 20: O que é AMQP?
No contexto de sistemas corporativos orientados a eventos e comunicação assíncrona distribuída, o protocolo de rede padrão utilizado pelo servidor de mensageria RabbitMQ chama-se AMQP. O significado dessa sigla corresponde a:

a) Advanced Message Queuing Protocol
b) Asynchronous Messaging Query Processing
c) Automated Model Query Protocol
d) Application Message Queue Procedure
e) Architecture Microservice Queue Protection

Resposta correta: a

Questão 21: Níveis do Richardson Maturity Model (RMM) - Nível 0
O Modelo de Maturidade de Richardson (RMM) quebra os requisitos REST em quatro níveis (0 a 3). No Nível 0 desse modelo, as APIs corporativas são caracterizadas por:

a) Utilizar recursos identificados por URIs específicas e todos os métodos HTTP de forma semântica.
b) Usar o protocolo HTTP meramente como um sistema de transporte de mensagens para RPC (Remote Procedure Call), apontando todas as requisições para um único endpoint e usando geralmente apenas o método POST.
c) Adotar controles de hipermídia (HATEOAS) de forma completa nas respostas estruturadas.
d) Isolar completamente as requisições de escrita das consultas usando bancos de dados distintos.
e) Bloquear qualquer acesso vindo de aplicações front-end web sem o uso de tokens JWT corporativos.

Resposta correta: b

Questão 22: Mapeamento de Corpo de Mensagem no Spring REST
Considere um método dentro de uma classe webservice controladora do Spring Boot. Deseja-se que os dados em formato JSON trafegados no corpo (body) de uma requisição de rede HTTP de entrada sejam automaticamente desserializados e atribuídos a um objeto Java passado como parâmetro do método. Qual anotação deve anteceder esse parâmetro?

a) @PathParam
b) @RequestBody
c) @ResponseBody
d) @ModelAttribute
e) @ContextParam

Resposta correta: b

Questão 23: Framework ORM e Mapeamento Objeto-Relacional
A especificação Java Persistence API (JPA) fornece um modelo padrão para gerenciamento de persistência. Qual o termo correto para a tecnologia ou framework encarregado de realizar o mapeamento entre os conceitos do Paradigma Orientado a Objetos (classes, atributos) e o Paradigma Relacional (tabelas, colunas, chaves primárias)?

a) Enterprise Service Bus (ESB)
b) API Gateway Proxy
c) Object-Relational Mapping (ORM)
d) Message Broker Handler
e) Remote Method Invocation (RMI)

Resposta correta: c

Questão 24: Camada para Conteinerização
Ao preparar aplicações corporativas para implantação em produção moderna utilizando Docker, qual tecnologia do sistema operacional atua como a camada central para criar ambientes de execução isolados (containers), compartilhando o mesmo kernel da máquina hospedeira sem a sobrecarga de virtualizar um hardware completo?

a) Hypervisor do tipo 1
b) Máquina Virtual JVM isolada
c) Containers baseados em Namespaces e Control Groups (cgroups) do Linux
d) Servidores de aplicação pesados do tipo Enterprise JavaBeans (EJB)
e) Redes físicas de fibra óptica dedicadas

Resposta correta: c

Questão 25: Julgamento sobre Arquitetura de Microsserviços
Em relação aos fundamentos das arquiteturas de microsserviços corporativas, assinale a alternativa inteiramente correta:

a) Microsserviços possuem alto acoplamento físico e dependência direta de compilação de código entre si.
b) Um dos principais desafios técnicos em microsserviços é gerenciar a consistência eventual e evitar o espelhamento desnecessário ou incorreto de dados entre bases isoladas.
c) Todos os microsserviços de um ecossistema devem obrigatoriamente utilizar o padrão arquitetural MVC na sua camada de persistência.
d) Microsserviços dependem tradicionalmente de um barramento central inteligente do tipo ESB (Enterprise Service Bus) para orquestrar todas as mensagens de forma centralizada.
e) O uso de microsserviços elimina a necessidade de qualquer barramento ou protocolo de transporte como HTTP ou AMQP.

Resposta correta: b

Questão 26: Definição de JSON
A especificação JSON é amplamente adotada como o formato padrão de intercâmbio de dados textuais na grande maioria das APIs REST modernas. O termo JSON refere-se a:

a) Java Object Notation, um formato binário proprietário da Oracle.
b) JavaScript Object Notation, uma sintaxe baseada em texto para representação de objetos, matrizes, números, strings, booleanos e nulos.
c) Joint Source Open Network, um protocolo de infraestrutura de roteamento de pacotes.
d) Java Standard Output Name, uma ferramenta de depuração de código de console.
e) JavaScript Operational Node, um tipo de banco de dados baseado em grafos distribuídos.

Resposta correta: b

Questão 27: Características do Spring Boot
O framework Spring Boot revolucionou o ecossistema Java para a criação de microsserviços. Analisando suas características fundamentais, é correto afirmar que o Spring Boot:

a) É uma especialização direta e exclusiva do JAX-RS que impede o uso de containers Docker na infraestrutura.
b) Exige obrigatoriamente que o desenvolvedor configure manualmente arquivos XML extensos para subir qualquer aplicação corporativa.
c) Empacota um servidor web embutido (como o Tomcat) junto com a aplicação, gerando um arquivo JAR executável autônomo e dispensando a necessidade de deploys externos em servidores de aplicação tradicionais.
d) Serve unicamente para gerenciar bancos de dados relacionais Oracle, sendo incompatível com MongoDB ou Postgres.
e) Funciona apenas na plataforma Windows Server devido à sua dependência nativa do framework .NET.

Resposta correta: c

Questão 28: Alternativa ou Evolução ao API Gateway Centralizado
Quando um API Gateway centralizado torna-se um gargalo de desempenho de rede ou um ponto único de falha crônico em grandes corporações, qual padrão arquitetural propõe a segregação de gateways dedicados e otimizados para atender especificamente a diferentes tipos de clientes de front-end (ex: um gateway para Mobile, um gateway para Web)?

a) Backends for Frontends (BFF)
b) Database per Service
c) Strangler Fig Pattern
d) Transactional Outbox
e) Service Mesh Sidecar

Resposta correta: a

Questão 29: Princípios de Microsserviços
Sobre a arquitetura de microsserviços, assinale a alternativa correta:

a) Cada microsserviço deve idealmente possuir seu próprio ciclo de deploy independente, permitindo entregas de novas funcionalidades de forma ágil sem derrubar o restante do ecossistema.
b) O tamanho ideal de um microsserviço deve obrigatoriamente seguir a regra estrita de conter no máximo 100 linhas de código Java.
c) Toda a comunicação interna entre os microsserviços corporativos deve obrigatoriamente ocorrer de maneira síncrona por meio de sockets brutos de rede.
d) Mudar a tecnologia ou a linguagem de programação de um microsserviço individual quebra obrigatoriamente toda a arquitetura dos outros serviços.
e) Eles aumentam o acoplamento de código se comparados a uma estrutura modular em monólitos.

Resposta correta: a

Questão 30: Escolha por Containers Docker
Uma equipe de arquitetos de software optou por adotar containers Docker para empacotar e distribuir os microsserviços de um sistema de software corporativo. Qual argumento técnico justifica de forma correta essa escolha?

a) O Docker elimina a necessidade de escrever códigos fontes de testes funcionais.
b) Containers Docker garantem portabilidade incomparável e consistência de ambiente, assegurando que o microsserviço execute exatamente da mesma forma no ambiente local do desenvolvedor e nos servidores de produção.
c) O uso do Docker substitui integralmente a necessidade de qualquer banco de dados físico na aplicação corporativa.
d) Containers Docker transformam códigos escritos em linguagens interpretadas de forma automática em código compilado binário nativo.
e) O Docker aumenta significativamente o consumo de memória RAM do sistema operacional comparado às máquinas virtuais clássicas completas.

Resposta correta: b

Questão 31: Mapeamento de Invocação POST no Spring
No desenvolvimento de um endpoint REST utilizando Spring MVC/Boot, deseja-se mapear um método de negócio para capturar e processar requisições HTTP do tipo POST associadas ao caminho /usuarios. Qual anotação deve ser colocada no método correspondente?

a) @GetMapping("/usuarios")
b) @PutMapping("/usuarios")
c) @PostMapping("/usuarios")
d) @DeleteMapping("/usuarios")
e) @PatchMapping("/usuarios")

Resposta correta: c

Questão 32: Idempotência de Métodos HTTP
No design de APIs RESTful baseadas na especificação do protocolo HTTP, um método é considerado idempotente quando múltiplas requisições idênticas produzem o mesmo efeito colateral no servidor que uma única requisição. Quais dos métodos HTTP listados abaixo possuem essa característica de idempotência por padrão?

a) POST e PATCH
b) GET, PUT e DELETE
c) POST e GET
d) POST, PUT e PATCH
e) Apenas o método POST

Resposta correta: b

Questão 33: Escalabilidade em Arquitetura de Microsserviços
Em relação à escalabilidade em arquiteturas de microsserviços, qual cenário reflete a aplicação prática do "Eixo X" do modelo de escalabilidade Scale Cube?

a) Dividir a base de dados em múltiplos fragmentos (shards) geograficamente distribuídos por cliente.
b) Decompor a aplicação monolítica com base em capacidades de negócio distintas (subdomínios).
c) Clonar múltiplas instâncias idênticas do mesmo microsserviço atrás de um balanceador de carga ou API Gateway para distribuir o tráfego de requisições.
d) Reescrever a lógica do microsserviço de autenticação para rodar em hardware de mainframe corporativo antigo.
e) Centralizar todas as tabelas em um único banco relacional compartilhado.

Resposta correta: c

Questão 34: Escuta Assíncrona com Spring AMQP
Utilizando o framework Spring AMQP para integrar microsserviços via RabbitMQ, qual anotação deve ser declarada acima de um método para transformá-lo em um ouvinte assíncrono capaz de consumir de forma contínua e automática as mensagens que chegam a uma determinada fila?

a) @RabbitListener(queues = "minhaFila")
b) @SendMessage
c) @EnableQueue
d) @RestController
e) @Autowired

Resposta correta: a

Questão 35: Segurança em Protocolos REST (HTTP/HTTPS)
Considere os aspectos de segurança envolvidos no tráfego de dados de serviços RESTful corporativos. Assinale a alternativa correta:

a) O estilo REST funciona exclusivamente sobre conexões HTTP abertas, sendo tecnicamente incompatível com segurança TLS/SSL (HTTPS).
b) A segurança da camada de transporte com HTTPS criptografa os dados trafegados na rede. No entanto, o código-fonte da lógica interna do microsserviço não precisa ser customizado para "saber" se está respondendo a HTTP ou HTTPS se a terminação TLS for gerenciada adequadamente na infraestrutura (como no Gateway ou Proxy).
c) Implementar protocolos de segurança de rede depende obrigatoriamente do código JPA inserido nas entidades de domínio.
d) APIs REST que utilizam JSON no corpo da mensagem dispensam totalmente o uso de HTTPS, pois o formato JSON já realiza criptografia nativa das strings de texto.
e) O uso de TLS invalida completamente o funcionamento de proxies de API Gateway na arquitetura.

Resposta correta: b

Questão 36: Características de Acoplamento e Produtividade
A decomposição de sistemas legados de grande porte em microsserviços autônomos altera a produtividade e a arquitetura das equipes corporativas. É uma característica marcante desse processo de transformação:

a) Forçar um acoplamento extremamente alto de código para garantir que nenhuma instância caia em produção.
b) Permitir entregas e deploys independentes por times menores, favorecendo a velocidade de manutenção, o isolamento de falhas e a produtividade geral no desenvolvimento de software.
c) Eliminar completamente a necessidade de gerenciar as dependências de rede e infraestrutura de servidores.
d) Centralizar todo o conhecimento técnico em um único arquiteto de software corporativo sênior.
e) Reduzir drasticamente o número de repositórios Git, unificando os códigos de todos os serviços em um único arquivo de texto massivo.

Resposta correta: b

Questão 37: Proteção de Headers e CORS no Node.js/Express
No desenvolvimento de APIs e componentes de API Gateway utilizando Node.js com o framework Express, qual middleware ou biblioteca consagrada é amplamente integrada para gerenciar cabeçalhos de segurança HTTP e as políticas de compartilhamento de recursos de origens diferentes (CORS), permitindo ou restringindo requisições vindas de aplicações front-end web hospedadas em outros domínios?

a) Mongoose
b) Cors (Middleware do Express)
c) Sequelize
d) Axios
e) Spring Security Core

Resposta correta: b

Questão 38: Funcionamento Técnico do RabbitMQ
Sobre o funcionamento do RabbitMQ como um Message Broker assíncrono para integração de ecossistemas corporativos distribuídos, assinale a opção correta:

a) Ele processa mensagens unicamente através de conexões síncronas HTTP puras bloqueantes de ponta a ponta.
b) É baseado no modelo AMQP, onde produtores publicam mensagens em Exchanges (Sinalizadores), que realizam o roteamento adequado dessas mensagens para Filas (Queues) com base em regras específicas (Bindings), para serem consumidas de forma assíncrona.
c) Ele armazena mensagens unicamente em tabelas estruturadas de bancos relacionais Oracle locais.
d) Ele impede o uso de múltiplos protocolos de comunicação, funcionando exclusivamente se a aplicação cliente for escrita em Java.
e) Ele apaga automaticamente todas as mensagens enviadas pelos produtores de forma instantânea antes mesmo de qualquer consumidor se conectar às filas.

Resposta correta: b

Questão 39: O que representa o Media Type no Protocolo HTTP?
No âmbito da arquitetura Web e do protocolo de transporte HTTP, para que serve conceitualmente o conceito e uso prático do Media Type (também historicamente denominado MIME Type)?

a) Serve para definir a velocidade de download máxima contratada pelo servidor de hospedagem na nuvem.
b) É um identificador padrão incluído em cabeçalhos (como Content-Type) que informa o formato exato e a natureza do arquivo ou dado contido no corpo da mensagem, permitindo que o receptor processe e renderize o conteúdo corretamente (ex: texto, JSON, imagem, áudio).
c) Trata-se de uma chave de segurança privada que substitui as senhas de usuários em bancos de dados relacionais.
d) Define as coordenadas geográficas exatas do servidor físico onde a aplicação corporativa está rodando.
e) É uma ferramenta do sistema operacional Linux que gerencia o uso de memória RAM por instâncias Docker de banco de dados.

Resposta correta: b

Questão 40: Desafios e Características do Padrão CQRS
O padrão CQRS propõe a separação estrita entre as operações que modificam dados (comandos) e as operações que apenas leem dados (consultas). Um dos desafios arquiteturais inerentes à adoção prática do CQRS distribuído envolve:

a) A impossibilidade técnica de utilizar bancos de dados SQL tradicionais na camada de escrita.
b) O atraso na sincronização (eventual consistency) entre a base de dados otimizada para escrita e a base de dados otimizada para consultas, fazendo com que dados recém-inseridos possam demorar alguns milissegundos para aparecer nas listagens.
c) A obrigatoriamente eliminação de todas as rotas de controladores HTTP da camada de apresentação da API.
d) A necessidade de unificar todas as tabelas em um único banco de dados relacional monolítico altamente normalizado.
e) A total incompatibilidade técnica com o uso de brokers de mensageria assíncrona como o RabbitMQ.

Resposta correta: b

Questão 41: Padrão Transactional Outbox
Em arquiteturas de microsserviços orientadas a eventos, o padrão Transactional Outbox é especificamente responsável por solucionar de forma confiável qual dos seguintes cenários problemáticos?

a) Evitar ataques cibernéticos de negação de serviço distribuído (DDoS) nas rotas públicas da API.
b) Garantir que uma transação no banco de dados local da aplicação e o envio do evento correspondente para o Message Broker (ex: RabbitMQ) ocorram de forma atômica, salvando o evento primeiro na tabela "Outbox" do próprio banco antes de publicá-lo, evitando a perda de dados caso o broker esteja temporariamente fora do ar.
c) Substituir completamente o uso de proxies reversos e API Gateways de criptografia em servidores Node.js.
d) Limitar o número máximo de registros que um usuário comum pode baixar do banco via chamadas GET.
e) Converter de forma automática dados salvos em arquivos Excel para tabelas em bancos NoSQL relacionais.

Resposta correta: b

Questão 42: Características do Protocolo AMQP
Com base na especificação formal do protocolo de mensageria assíncrona AMQP, amplamente utilizado no gerenciamento de barramentos corporativos e microsserviços com o RabbitMQ, assinale a definição técnica correta:

a) É um formato proprietário que roda apenas na JVM (Java Virtual Machine) e impede o tráfego de dados textuais JSON na rede.
b) É um protocolo aberto de camada de aplicação para mensageria assíncrona, projetado com foco em confiabilidade, segurança, roteamento flexível e interoperabilidade entre sistemas construídos em diferentes linguagens e plataformas.
c) Trata-se de uma biblioteca JavaScript interna do Express criada exclusivamente para gerenciar cabeçalhos de CORS.
d) Funciona meramente como um protocolo de transporte síncrono que concorre diretamente com o protocolo de rede UDP.
e) É uma extensão direta da especificação JPA utilizada para criptografar chaves primárias relacionais.

Resposta correta: b

Questão 43: Richardson Maturity Model (RMM) - Nível 2
A adoção correta dos princípios de design REST pode ser medida através do Richardson Maturity Model (RMM). A partir de qual nível desse modelo ocorre a introdução sistemática e correta dos múltiplos verbos e métodos HTTP padrão (como GET, POST, PUT, DELETE) com semânticas bem definidas para as ações sobre os recursos identificados por URIs?

a) Nível 0
b) Nível 1
c) Nível 2
d) Nível 3
e) Nível 4

Resposta correta: c

Questão 44: O que é HATEOAS?
No topo do Modelo de Maturidade de Richardson (Nível 3), encontra-se a restrição que define o ápice do design de APIs verdadeiramente RESTful. A sigla HATEOAS representa o conceito de:

a) Hypermedia As The Engine Of Application State (Hipermídia como Mecanismo de Estado da Aplicação), determinando que as respostas da API devem conter links que guiam o cliente sobre quais ações e navegações são possíveis a seguir.
b) High Availability Testing Engine for Operating System Automated Software, uma ferramenta para testes de estresse em hardware.
c) Hierarchical Architecture Testing and Encryption Object Application Service, um protocolo de segurança para redes internas de computadores.
d) Hybrid Automated Token Exchange for Open Access Systems, um padrão de autenticação que concorre com o JWT.
e) Horizontal Agile Task Execution for Organized Application Software, uma metodologia de gestão ágil de projetos corporativos.

Resposta correta: a

Questão 45: Teorema CAP em Sistemas Distribuídos
Ao projetar a arquitetura de armazenamento e persistência de dados distribuídos para microsserviços corporativos de grande porte, o Teorema CAP estabelece restrições fundamentais que os arquitetos de software precisam gerenciar. Esse teorema afirma textualmente que um sistema de dados distribuído pode garantir, de forma simultânea e perfeita, no máximo duas das seguintes três propriedades primordiais:
a) Concorrência, Agilidade e Performance (CAP)
b) Consistência (Consistency), Disponibilidade (Availability) e Tolerância a Partições de Rede (Partition Tolerance)
c) Codificação, Autenticação e Persistência (CAP)
d) Conectividade, Armazenamento e Portabilidade (CAP)
e) Complexidade, Alocação e Processamento (CAP)

Resposta correta: b

Questão 46: A Essência do JPA (Java Persistence API)
Em sua essência e definição conceitual dentro da plataforma Java corporativa, a especificação JPA (Java Persistence API) serve fundamentalmente para:

a) Criar interfaces gráficas de usuário ricas e responsivas para navegadores web corporativos.
b) Fornecer um modelo de programação padrão e um conjunto de especificações/interfaces para gerenciar o Mapeamento Objeto-Relacional (ORM) e a persistência de objetos Java em bancos de dados relacionais.
c) Orquestrar o roteamento de pacotes binários em barramentos de mensageria distribuídos integrados ao RabbitMQ.
d) Gerenciar de forma automatizada o ciclo de vida de containers Docker rodando em ambientes Linux de homologação.
e) Substituir completamente a necessidade de possuir um servidor web rodando a camada de controladores HTTP.

Resposta correta: b

Questão 47: Configuração de Proxy de Autenticação no API Gateway
Analisando o código arquitetural de um API Gateway em Node.js/Express utilizando o pacote express-http-proxy para integrar o microsserviço de autenticação, o parâmetro proxyReqBodyDecorator é programado especificamente com qual objetivo técnico?

a) Validar as credenciais diretamente no banco de dados NoSQL MongoDB sem passar por nenhuma classe Java.
b) Interceptar a chamada de entrada (ex: /login), permitindo ao desenvolvedor inspecionar e alterar o corpo da mensagem original antes que ela seja despachada e encaminhada ao microsserviço backend final (como converter os campos recebidos no formato esperado pelo serviço).
c) Desligar completamente os middlewares de segurança CORS do servidor Node.js.
d) Configurar o tempo de expiração em milissegundos dos tokens criptográficos JWT criados na aplicação.
e) Forçar o navegador cliente a atualizar a página de exibição HTML automaticamente através de conexões síncronas.

Resposta correta: b

Questão 48: Configuração de Headers no Proxy do Gateway
Em um middleware de proxy configurado no API Gateway (Node.js), deseja-se injetar ou modificar cabeçalhos específicos das requisições interceptadas (como definir 'Content-Type': 'application/json' e alterar o método HTTP implicitamente para 'POST'). Qual parâmetro do objeto de configuração do proxy gerencia nativamente essa interceptação de cabeçalhos e opções antes do envio do pacote?

a) userResDecorator
b) proxyReqOptDecorator
c) databaseConnection
d) expressRoutingHandler
e) amqpExchangeConnector

Resposta correta: b

Questão 49: Geração de Token JWT no Interceptador do Gateway
Considere um cenário de arquitetura corporativa onde o API Gateway delega a validação de credenciais de login para o Microsserviço de Autenticação. Este responde com status 200 OK e os dados brutos do usuário. De acordo com o fluxo do material didático, qual parâmetro do proxy do Gateway deve capturar essa resposta positiva com sucesso para gerar, assinar e anexar o Token JWT corporativo final que será enviado de volta para a aplicação cliente?

a) proxyReqBodyDecorator
b) proxyReqOptDecorator
c) userResDecorator
d) app.post nativo do Express sem middlewares
e) RabbitListener assíncrono

Resposta correta: c

Questão 50: Padrão SAGAs baseados em Orquestração e Coordenação
Ao implementar o padrão SAGA para transações distribuídas em microsserviços corporativos complexos, optou-se pela variante baseada em Orquestração (Orchestration). Qual a característica definidora dessa abordagem de coordenação de transações locais?

a) Não existe nenhum ponto central de controle. Cada microsserviço realiza sua transação local e publica eventos que desencadeiam transações nos outros de forma descentralizada (Coreografia).
b) Existe a figura de um componente centralizador explícito (um serviço Orquestrador/Coordenador de SAGA) que é inteiramente responsável por ditar a sequência exata de execuções das transações locais e invocar os serviços apropriados, bem como comandar as ações de compensação em caso de falhas no fluxo de negócios.
c) Todos os microsserviços compartilham uma única tabela "Outbox" física em um banco de dados relacional monolítico unificado.
d) O uso de brokers de mensagens assíncronas como o RabbitMQ torna-se expressamente proibido, funcionando apenas com chamadas síncronas bloqueantes do tipo SOAP.
e) A transação distributed falha instantaneamente se qualquer uma das instâncias Docker for escalada horizontalmente através do Eixo X do cubo de escala.

Resposta correta: b

