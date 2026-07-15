---
name: cypress-e2e
description: >
  Guia completo para escrever, revisar ou tirar dúvidas sobre testes E2E de interface (GUI)
  com Cypress neste projeto. Ativa automaticamente para arquivos em cypress/e2e/gui/**
  e cypress/support/**. Cobre seletores, esperas, intercepts, mocking, estrutura de teste
  e boas práticas de automação web.
---

# Cypress — Testes E2E (GUI)

## Contexto do projeto

- **Framework**: Cypress 15 + JavaScript (não TypeScript)
- **Aplicação alvo**: ServeRest — front-end em `https://front.serverest.dev`
- **Plugins ativos**: `cypress-plugin-api`, `cypress-plugin-xhr-toggle`, `cypress-mochawesome-reporter`
- **Shadow DOM**: habilitado globalmente (`includeShadowDom: true`)
- **Retries**: 0 (configurado em `cypress.config.js`)

---

## Estrutura de um teste E2E

```js
describe('Funcionalidade — Contexto', () => {
	beforeEach(() => {
		// Registrar intercepts ANTES da navegação
		cy.intercept('POST', '**/endpoint').as('alias');
		cy.visit('/rota');
	});

	it('Deve realizar ação com sucesso', () => {
		// Arrange
		const dado = 'valor';

		// Act
		cy.get('[data-testid="campo"]').should('be.visible').type(dado);
		cy.get('[data-testid="btn-enviar"]').should('be.visible').click();

		// Assert
		cy.get('[data-testid="mensagem-sucesso"]').should('be.visible');
	});
});
```

---

## Seletores — ordem de preferência

> Princípio: seletores estáveis, semânticos e resistentes a mudanças de UI.

1. `[data-testid="..."]` — preferido quando disponível
2. `input[name="..."]` ou `input#id` — atributos semânticos estáveis
3. `[aria-label="..."]` — acessibilidade como seletor
4. `cy.contains('button', 'Texto')` — tipo + texto visível único
5. Seletor CSS por classe — somente como último recurso, com comentário `// TODO: replace with data-testid`

### Proibido

- XPath
- Classes dinâmicas (ex: `.Messenger_openButton_OgKIA`)
- Índices genéricos (ex: `cy.get('a').first()`, `cy.get('button').eq(3)`)
- Encadeamento longo (ex: `cy.get('div > p > span')`)

### Alias de seletores (`.as()`)

Quando o mesmo seletor é usado em múltiplos `it()`, declare o alias no `beforeEach`:

```js
beforeEach(() => {
	cy.get('[data-testid="input-email"]').as('email');
	cy.get('[data-testid="btn-login"]').as('btnLogin');
});

it('Deve logar com sucesso', () => {
	cy.get('@email').type(Cypress.env('EMAIL'));
	cy.get('@btnLogin').click();
	cy.url().should('include', '/dashboard');
});
```

---

## Esperas

> Princípio: **nunca** aguardar tempo fixo. Sempre vincular esperas a eventos observáveis.

```js
// ❌ Proibido — espera cega
cy.wait(3000);

// ✅ Correto — aguarda requisição real
cy.intercept('POST', '**/login').as('login');
cy.contains('button', 'Entrar').click();
cy.wait('@login');
cy.url().should('include', '/dashboard');
```

Para timeouts específicos, usar constante nomeada:

```js
const TIMEOUT_CARREGAMENTO = 15000;
cy.get('[data-testid="resultado"]', { timeout: TIMEOUT_CARREGAMENTO }).should('be.visible');
```

---

## Intercepts e Mocking

Sempre registrar **antes** da ação que dispara a requisição:

```js
// ✅ Correto
cy.intercept('POST', '**/usuarios').as('criarUsuario');
cy.contains('button', 'Cadastrar').click();
cy.wait('@criarUsuario').its('response.statusCode').should('eq', 201);

// ❌ Errado — intercept depois da ação
cy.contains('button', 'Cadastrar').click();
cy.intercept('POST', '**/usuarios').as('criarUsuario'); // nunca vai capturar
```

### Múltiplas chamadas ao mesmo endpoint

```js
cy.intercept({ method: 'POST', url: '**/usuarios', times: 2 }).as('criarUsuario');
cy.wait('@criarUsuario'); // 1ª chamada
cy.wait('@criarUsuario'); // 2ª chamada
```

### Desestruturação em `.then()`

```js
// ✅ Correto — desestrutura o necessário
cy.wait('@criarUsuario').then(({ response }) => {
	expect(response.statusCode).to.eq(201);
	expect(response.body).to.have.property('_id');
});

// ❌ Errado — objeto completo com repetição
cy.wait('@criarUsuario').then((interception) => {
	expect(interception.response.statusCode).to.eq(201);
});
```

### Mockar resposta (isolamento)

```js
cy.intercept('GET', '**/produtos', {
	statusCode: 200,
	fixture: 'produtos.json',
}).as('listarProdutos');
```

### Mockar erro HTTP

```js
cy.intercept('POST', '**/login', {
	statusCode: 401,
	body: { message: 'Email e/ou senha inválidos' },
}).as('loginInvalido');
```

---

## Assertivas

### `.should('be.visible')` vs `.should('exist')`

`be.visible` já implica que o elemento existe — **nunca** encadeie os dois:

```js
// ✅
cy.get('[data-testid="alerta"]').should('be.visible');

// ❌
cy.get('[data-testid="alerta"]').should('exist').and('be.visible');
```

### Assertiva positiva antes de negativa

```js
// ✅ — confirma contexto antes do not.exist
cy.get('[data-testid="lista-usuarios"]').should('be.visible');
cy.contains('[data-testid="usuario"]', 'João').should('not.exist');

// ❌ — negativa prematura, pode passar por acidente
cy.contains('[data-testid="usuario"]', 'João').should('not.exist');
```

### Trabalhando com `.last()`

```js
// ✅ — garante o número antes de pegar o último
cy.get('[data-testid="usuario"]').should('have.length', 3).last().should('contain', 'Carlos');

// ❌
cy.get('[data-testid="usuario"]').last().should('contain', 'Carlos');
```

---

## Hooks

| Hook                  | Uso recomendado                                      |
| --------------------- | ---------------------------------------------------- |
| `beforeEach`          | Setup inicial: visit, intercepts, aliases de seletor |
| `before`              | **Evitar** — impede independência entre testes       |
| `after` / `afterEach` | **Evitar** — não executam se o Cypress travar        |

Limpeza de estado: faça no `beforeEach` (não no `afterEach`).

---

## `context` para sub-funcionalidades

```js
describe('Usuários', () => {
	context('Cadastro', () => {
		beforeEach(() => cy.visit('/cadastro'));
		// testes de cadastro
	});

	context('Login', () => {
		beforeEach(() => cy.visit('/login'));
		// testes de login
	});
});
```

---

## Dados sensíveis

```js
// ✅ — protege dados do log do Cypress Runner
cy.get('[data-testid="senha"]').type(Cypress.env('PASSWORD'), { log: false });

// ❌ — expõe dado no log
cy.get('[data-testid="senha"]').type(Cypress.env('PASSWORD'));

// ❌ — hardcode nunca
cy.get('[data-testid="senha"]').type('minha-senha-123');
```

---

## Importações — ordem

```js
// 1. Pacotes externos
import { faker } from '@faker-js/faker';

// (linha em branco)

// 2. Comandos customizados ou utilitários do projeto
import '../../support/commands';
```

---

## Indentação

Use **tabs** (configurado no `.prettierrc.json`). Isso facilita o alinhamento ao encadear comandos Cypress.
