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
		it('Deve listar e validar o contrato de resposta de até 5 usuários aleatórios', () => {
			// Arrange
			const url = `${Cypress.env('API_URL')}/usuarios`;

			// Act + Assert
			cy.api({ method: 'GET', url }).then(({ status, body }) => {
				expect(status).to.eq(200);
				// Contrato de envelope (swagger: getUsuarios)
				expect(body).to.have.all.keys('quantidade', 'usuarios');
				expect(body.quantidade).to.be.a('number').and.be.greaterThan(0);
				expect(body.usuarios).to.be.an('array').and.have.length.greaterThan(0);

				// Contrato de itens do array (amostragem para não poluir o Cypress Runner)
				// Usa Lodash (embutido no Cypress) para pegar até 5 usuários aleatórios da lista
				const sample = Cypress._.sampleSize(body.usuarios, 5);
				sample.forEach((usuario) => {
					expect(usuario).to.have.all.keys('nome', 'email', 'password', 'administrador', '_id');
					expect(usuario.nome).to.be.a('string').and.not.be.empty;
					expect(usuario.email).to.be.a('string').and.include('@');
					expect(usuario.password).to.be.a('string').and.not.be.empty;
					expect(usuario.administrador).to.be.oneOf(['true', 'false']);
					expect(usuario._id).to.be.a('string').and.not.be.empty;
				});
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
				// Contrato de sucesso (swagger: loginComSucesso)
				expect(status).to.eq(200);
				expect(body).to.have.all.keys('message', 'authorization');
				expect(body.message).to.eq(MSG.loginSucesso);
				expect(body.authorization)
					.to.be.a('string')
					.and.match(/^Bearer\s.+/);
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
				// Contrato de erro (swagger: errorEmailSenhaInvalidos)
				expect(status).to.eq(401);
				expect(body).to.have.all.keys('message');
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
				// Assert — contrato de criação (swagger: cadastroComSucesso)
				expect(status).to.eq(201);
				expect(body).to.have.all.keys('message', '_id');
				expect(body.message).to.eq(MSG.cadastroSucesso);
				expect(body._id).to.be.a('string').and.not.be.empty;

				// Act — busca o usuário criado por ID (swagger: GET /usuarios/{_id})
				cy.api({
					method: 'GET',
					url: `${Cypress.env('API_URL')}/usuarios/${body._id}`,
				}).then(({ status: getStatus, body: getBody }) => {
					// Assert — contrato de resposta (swagger: getUsuariosId)
					expect(getStatus).to.eq(200);
					expect(getBody).to.have.all.keys('nome', 'email', 'password', 'administrador', '_id');
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
				// Contrato de erro (swagger: errorEmailJaUtilizado)
				expect(status).to.eq(400);
				expect(body).to.have.all.keys('message');
				expect(body.message).to.eq(MSG.emailDuplicado);
			});
		});
	});
});
