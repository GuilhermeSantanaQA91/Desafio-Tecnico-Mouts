---
name: cypress-api
description: >
  Guia completo para escrever, revisar ou tirar dúvidas sobre testes de API pura com Cypress
  neste projeto. Ativa automaticamente para arquivos em cypress/e2e/api/** e
  cypress/support/commands/**. Cobre cy.request(), cy.api(), validação de resposta HTTP,
  payloads, erros esperados e boas práticas de contrato de API.
---

# Cypress — Testes de API

## Contexto do projeto

- **Framework**: Cypress 15 + JavaScript
- **API alvo**: ServeRest — `https://serverest.dev`
- **Plugin de API**: `cypress-plugin-api` — `cy.api()` renderiza a requisição/resposta no Runner
- **baseUrl**: configurado via `cypress/environments/dev.settings.json`

---

## `cy.api()` vs `cy.request()`

|                   | `cy.api()`                                          | `cy.request()`                                |
| ----------------- | --------------------------------------------------- | --------------------------------------------- |
| **Quando usar**   | Testes de API puros (sem UI)                        | Quando não precisar de visualização no Runner |
| **Visualização**  | ✅ Mostra URL, método, headers, body, status, tempo | ❌ Sem visualização dedicada                  |
| **Comportamento** | Idêntico ao `cy.request()`                          | Nativo do Cypress                             |

> Para este projeto, prefira `cy.api()` em testes de API pura — facilita diagnóstico no Cypress Runner.

---

## Estrutura de um teste de API

```js
describe('API — Usuários', () => {
	it('Deve listar usuários com sucesso', () => {
		// Arrange
		const url = '/usuarios';

		// Act
		cy.api({
			method: 'GET',
			url,
		}).then(({ status, body }) => {
			// Assert
			expect(status).to.eq(200);
			expect(body.quantidade).to.be.a('number');
			expect(body.usuarios).to.be.an('array');
		});
	});
});
```

---

## Cenários de erro obrigatórios

Todo teste de API deve incluir ao menos **um cenário de erro** (4xx ou 5xx) além do cenário de sucesso:

```js
describe('API — Login', () => {
	it('Deve autenticar com sucesso', () => {
		cy.api({
			method: 'POST',
			url: '/login',
			body: {
				email: Cypress.env('EMAIL'),
				password: Cypress.env('PASSWORD'),
			},
		}).then(({ status, body }) => {
			expect(status).to.eq(200);
			expect(body).to.have.property('authorization');
		});
	});

	it('Deve retornar 401 para credenciais inválidas', () => {
		cy.api({
			method: 'POST',
			url: '/login',
			body: { email: 'invalido@email.com', password: 'errada' },
			failOnStatusCode: false, // necessário para status 4xx não falhar o teste
		}).then(({ status, body }) => {
			expect(status).to.eq(401);
			expect(body).to.have.property('message');
		});
	});
});
```

---

## `failOnStatusCode: false`

Obrigatório quando o cenário **espera** um status 4xx ou 5xx:

```js
cy.api({
	method: 'DELETE',
	url: '/usuarios/id-inexistente',
	failOnStatusCode: false,
}).then(({ status }) => {
	expect(status).to.eq(400);
});
```

---

## Desestruturação em `.then()`

Sempre desestruturar apenas o que for usar — evita repetições como `response.body.campo`:

```js
// ✅ Correto
cy.api({ method: 'GET', url: '/produtos' }).then(({ status, body }) => {
	expect(status).to.eq(200);
	expect(body.quantidade).to.be.greaterThan(0);
});

// ❌ Errado
cy.api({ method: 'GET', url: '/produtos' }).then((response) => {
	expect(response.status).to.eq(200);
	expect(response.body.quantidade).to.be.greaterThan(0);
});
```

---

## Encapsular em comandos customizados

Quando a mesma chamada de API é reutilizada em múltiplos testes, encapsule em um comando:

```js
// cypress/support/commands.js
Cypress.Commands.add('criarUsuario', (payload, { failOnStatusCode = true } = {}) => {
	cy.log(`[API] POST /usuarios | email: ${payload.email ?? '(ausente)'}`);
	return cy.api({
		method: 'POST',
		url: '/usuarios',
		body: payload,
		failOnStatusCode,
	});
});

// Uso no teste
cy.criarUsuario({ nome: 'Fulano', email: 'fulano@qa.com', password: 'teste', administrador: 'true' });
```

---

## `cy.log` em comandos de API

Adicionar `cy.log` quando o payload ou comportamento varia por cenário:

```js
cy.log(`[API] Enviando payload sem o campo obrigatório "email"`);
cy.api({
	method: 'POST',
	url: '/usuarios',
	body: payloadSemEmail,
	failOnStatusCode: false,
}).then(({ status, body }) => {
	cy.log(`[API] status=${status} | body=${JSON.stringify(body)}`);
	expect(status).to.eq(400);
});
```

> Comandos que sempre enviam o mesmo payload fixo não precisam de `cy.log`.

---

## Validação de estrutura de resposta

Use `.to.have.all.keys()` para validar contratos de payload:

```js
cy.api({ method: 'GET', url: '/usuarios' }).then(({ body }) => {
	expect(body).to.have.all.keys('quantidade', 'usuarios');
	body.usuarios.forEach((usuario) => {
		expect(usuario).to.have.all.keys('nome', 'email', 'administrador', '_id');
	});
});
```

---

## Campos opcionais — condicionais aceitos

Condicionais são aceitos **somente** para validar campos opcionais na resposta:

```js
cy.api({ method: 'GET', url: '/usuarios' }).then(({ body }) => {
	body.usuarios.forEach((usuario) => {
		expect(usuario.nome).to.be.a('string');

		// Campo opcional — condicional aceito ✅
		if (usuario.cpf) {
			expect(usuario.cpf).to.match(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
		}
	});
});
```

---

## Validação de arrays grandes (Prevenir Poluição do Runner)

Nunca itere sobre respostas inteiras quando o array for grande (ex: `body.usuarios.forEach`), pois isso gera milhares de *assertions* e trava o Cypress Runner. Use `Cypress._.sampleSize()` para validar um subconjunto aleatório:

```js
// ✅ Correto — valida até 5 itens aleatórios, mantendo o Runner limpo
const amostra = Cypress._.sampleSize(body.usuarios, 5);
amostra.forEach((usuario) => {
	expect(usuario).to.have.all.keys('nome', 'email');
});
```

---

## Headers de autenticação

Use variável de ambiente para tokens — nunca hardcode:

```js
cy.api({
	method: 'POST',
	url: '/produtos',
	headers: {
		Authorization: Cypress.env('BEARER_TOKEN'),
	},
	body: payload,
}).then(({ status }) => {
	expect(status).to.eq(201);
});
```

Para obter token antes dos testes, use `beforeEach` com `cy.request()`:

```js
beforeEach(() => {
	cy.request('POST', '/login', {
		email: Cypress.env('EMAIL'),
		password: Cypress.env('PASSWORD'),
	}).then(({ body }) => {
		Cypress.env('BEARER_TOKEN', `Bearer ${body.authorization}`);
	});
});
```

---

## Nomenclatura de arquivos

```
cypress/e2e/api/
  ├── usuarios-api.cy.js    # CRUD de usuários
  ├── produtos-api.cy.js    # CRUD de produtos
  └── login-api.cy.js       # Autenticação
```

---

## Boas práticas

- `failOnStatusCode: false` sempre que o cenário espera 4xx/5xx
- Encapsular chamadas repetidas em comandos customizados
- Separar cenário de sucesso e de erro em `it()` distintos
- Nunca misturar validações de UI e API pura no mesmo `it()`
- Usar `cy.log` com contexto quando o payload varia por cenário
