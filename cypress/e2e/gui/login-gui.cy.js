import { faker } from '@faker-js/faker/locale/pt_BR';

describe('ServeRest — Autenticação e Cadastro (GUI)', { tags: '@e2e' }, () => {
	// ─── Cenário 1 e 2: Login ────────────────────────────────────────────────
	context('Login', () => {
		beforeEach(() => {
			cy.intercept('POST', '**/login').as('postLogin');
			cy.visit('/login');
		});

		it('Deve autenticar com sucesso e redirecionar para o painel com nome do usuário', () => {
			// Arrange
			const email = Cypress.env('USER_EMAIL');
			const senha = Cypress.env('USER_PASSWORD');
			const nomeEsperado = Cypress.env('USER_NAME');

			// Act
			cy.loginGui(email, senha);

			// Assert
			cy.wait('@postLogin').its('response.statusCode').should('eq', 200);
			cy.url({ timeout: 10000 }).should('include', '/admin/home');
			// Valida que o nome do usuário logado aparece na saudação
			cy.contains('h1', nomeEsperado).should('be.visible');
		});

		it('Deve exibir mensagem de erro ao tentar login com credenciais inválidas', () => {
			// Arrange — dados falsos via faker para garantir que o usuário não existe
			const emailInvalido = faker.internet.email();
			const senhaInvalida = faker.internet.password({ length: 8 });

			// Act
			cy.loginGui(emailInvalido, senhaInvalida);

			// Assert
			cy.wait('@postLogin').its('response.statusCode').should('eq', 401);
			cy.contains('[role="alert"]', 'Email e/ou senha inválidos').should('be.visible');
			cy.url().should('include', '/login');
		});
	});

	// ─── Cenário 3 e 4: Cadastro de usuário ─────────────────────────────────
	context('Cadastro de Usuário', () => {
		beforeEach(() => {
			cy.intercept('POST', '**/usuarios').as('postCadastro');
			cy.visit('/cadastrarusuarios');
		});

		it('Deve cadastrar um novo usuário administrador e validar boas-vindas com o nome cadastrado', () => {
			// Arrange — nome e email correlacionados via faker
			const firstName = faker.person.firstName();
			const lastName = faker.person.lastName();
			const nome = `${firstName} ${lastName}`;
			const email = faker.internet.email({ firstName, lastName, provider: 'qa.mouts.com.br' });
			const senha = faker.internet.password({ length: 10, memorable: true });

			// Act
			cy.cadastrarUsuarioGui(nome, email, senha);

			// Assert — redireciona e exibe saudação com o nome exato cadastrado
			cy.wait('@postCadastro').its('response.statusCode').should('eq', 201);
			cy.url({ timeout: 10000 }).should('include', '/admin/home');
			// Valida que o nome recém-cadastrado aparece na saudação (não apenas o texto genérico)
			cy.contains('h1', nome).should('be.visible');
		});

		it('Deve exibir mensagem de erro ao tentar cadastrar com email já existente', () => {
			// Arrange — email já cadastrado no ambiente (usuário fixo de testes)
			cy.log('[GUI] Tentando cadastrar com email duplicado');
			const nome = faker.person.fullName();
			const emailDuplicado = Cypress.env('USER_EMAIL');
			const senha = faker.internet.password({ length: 10 });

			// Act
			cy.cadastrarUsuarioGui(nome, emailDuplicado, senha);

			// Assert — permanece na tela de cadastro com mensagem de erro
			cy.wait('@postCadastro').its('response.statusCode').should('eq', 400);
			cy.contains('[role="alert"]', 'Este email já está sendo usado').should('be.visible');
			cy.url().should('include', '/cadastrarusuarios');
		});
	});
});
