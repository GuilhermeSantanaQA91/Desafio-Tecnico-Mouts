import { faker } from '@faker-js/faker/locale/pt_BR';

// ─── Constantes de mensagens (contrato do swagger) ───────────────────────────
const MSG = {
	loginSucesso: 'Login realizado com sucesso',
	loginInvalido: 'Email e/ou senha inválidos',
	cadastroSucesso: 'Cadastro realizado com sucesso',
	emailDuplicado: 'Este email já está sendo usado',
};

describe('ServeRest API — Usuários e Autenticação', { tags: '@api' }, () => {
	// ─── Cenário 1: GET /usuarios ────────────────────────────────────────────
	context('GET /usuarios', () => {
		it('Deve listar e validar o contrato de resposta de todos os usuarios cadastrados', () => {
			// Arrange
			const url = `${Cypress.env('API_URL')}/usuarios`;

			// Act + Assert
			cy.api({ method: 'GET', url }).then(({ status, body }) => {
				expect(status).to.eq(200);
				cy.validarContrato('getUsuarios', body);
			});
		});
	});

	// ─── Cenário 2: POST /login ──────────────────────────────────────────────
	context('POST /login', () => {
		it('Deve autenticar com credenciais válidas, retornar token Bearer e mensagem de sucesso', () => {
			// Arrange
			const payload = {
				email: Cypress.env('USER_EMAIL'),
				password: Cypress.env('USER_PASSWORD'),
			};

			// Act + Assert
			cy.loginApi(payload).then(({ status, body }) => {
				expect(status).to.eq(200);
				cy.validarContrato('loginComSucesso', body);
				expect(body.message).to.eq(MSG.loginSucesso);
			});
		});

		it('Deve retornar 401 e mensagem de erro ao autenticar com credenciais inválidas', () => {
			// Arrange — credenciais inexistentes geradas com faker
			cy.log('[API] Enviando credenciais inválidas para /login');
			const payload = {
				email: faker.internet.email(),
				password: faker.internet.password({ length: 8 }),
			};

			// Act + Assert
			cy.loginApi(payload, { failOnStatusCode: false }).then(({ status, body }) => {
				expect(status).to.eq(401);
				cy.validarContrato('errorEmailSenhaInvalidos', body);
				expect(body.message).to.eq(MSG.loginInvalido);
			});
		});
	});

	// ─── Cenário 3: POST /usuarios + GET /usuarios/{_id} ────────────────────
	context('POST /usuarios', () => {
		it('Deve criar usuário com dados válidos e confirmar dados via GET /usuarios/{_id}', () => {
			// Arrange — nome e email correlacionados via faker
			const firstName = faker.person.firstName();
			const lastName = faker.person.lastName();
			const payload = {
				nome: `${firstName} ${lastName}`,
				email: faker.internet.email({ firstName, lastName, provider: 'qa.mouts.com.br' }),
				password: faker.internet.password({ length: 10 }),
				administrador: 'false',
			};

			// Act — cria o usuário
			cy.criarUsuarioApi(payload).then(({ status, body }) => {
				expect(status).to.eq(201);
				cy.validarContrato('cadastroComSucesso', body);
				expect(body.message).to.eq(MSG.cadastroSucesso);

				// Act — busca o usuário criado por ID (swagger: GET /usuarios/{_id})
				cy.api({
					method: 'GET',
					url: `${Cypress.env('API_URL')}/usuarios/${body._id}`,
				}).then(({ status: getStatus, body: getBody }) => {
					expect(getStatus).to.eq(200);
					cy.validarContrato('getUsuariosId', getBody);
					expect(getBody.nome).to.eq(payload.nome);
					expect(getBody.email).to.eq(payload.email);
					expect(getBody.administrador).to.eq(payload.administrador);
				});
			});
		});

		it('Deve retornar 400 ao tentar criar usuário com email já cadastrado', () => {
			// Arrange — email já existente no ambiente
			cy.log('[API] Enviando email duplicado para /usuarios');
			const payloadDuplicado = {
				nome: faker.person.fullName(),
				email: Cypress.env('USER_EMAIL'),
				password: faker.internet.password({ length: 10 }),
				administrador: 'false',
			};

			// Act + Assert
			cy.criarUsuarioApi(payloadDuplicado, { failOnStatusCode: false }).then(({ status, body }) => {
				expect(status).to.eq(400);
				cy.validarContrato('errorEmailJaUtilizado', body);
				expect(body.message).to.eq(MSG.emailDuplicado);
			});
		});
	});
});
