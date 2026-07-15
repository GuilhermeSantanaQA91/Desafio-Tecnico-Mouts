// Custom commands — adicione aqui os comandos globais reutilizáveis do projeto.
// Documentação: https://docs.cypress.io/api/cypress-api/custom-commands

/**
 * loginViaApi — autentica diretamente via API (sem UI) e armazena o token.
 * Use nos testes E2E que precisam de sessão autenticada sem testar o fluxo de login.
 *
 * @param {string} [email]    - Email do usuário (padrão: Cypress.env('USER_EMAIL'))
 * @param {string} [password] - Senha do usuário (padrão: Cypress.env('USER_PASSWORD'))
 */
Cypress.Commands.add('loginViaApi', (email, password) => {
	const userEmail = email ?? Cypress.env('USER_EMAIL');
	const userPassword = password ?? Cypress.env('USER_PASSWORD');

	cy.request({
		method: 'POST',
		url: `${Cypress.env('API_URL')}/login`,
		body: { email: userEmail, password: userPassword },
		log: false,
	}).then(({ body }) => {
		Cypress.env('BEARER_TOKEN', `Bearer ${body.authorization}`);
	});
});

// ─── Comandos de API (ServeRest) ─────────────────────────────────────────────

Cypress.Commands.add('loginApi', (payload, { failOnStatusCode = true } = {}) => {
	cy.log(`[API] POST /login | email: ${payload.email}`);
	return cy.api({
		method: 'POST',
		url: `${Cypress.env('API_URL')}/login`,
		body: payload,
		failOnStatusCode,
	});
});

Cypress.Commands.add('criarUsuarioApi', (payload, { failOnStatusCode = true } = {}) => {
	cy.log(`[API] POST /usuarios | email: ${payload.email}`);
	return cy.api({
		method: 'POST',
		url: `${Cypress.env('API_URL')}/usuarios`,
		body: payload,
		failOnStatusCode,
	});
});

// ─── Comandos de GUI (App Actions) ───────────────────────────────────────────

Cypress.Commands.add('loginGui', (email, password) => {
	cy.log(`[GUI] Preenchendo formulário de login para: ${email}`);
	cy.get('[data-testid="email"]').should('be.visible').type(email);
	cy.get('[data-testid="senha"]').type(password, { log: false });
	cy.get('[data-testid="entrar"]').click();
});

Cypress.Commands.add('cadastrarUsuarioGui', (nome, email, password) => {
	cy.log(`[GUI] Preenchendo formulário de cadastro para: ${email}`);
	cy.get('[data-testid="nome"]').should('be.visible').type(nome);
	cy.get('[data-testid="email"]').type(email);
	cy.get('[data-testid="password"]').type(password, { log: false });
	cy.get('[data-testid="checkbox"]').check();
	cy.get('[data-testid="cadastrar"]').click();
});
