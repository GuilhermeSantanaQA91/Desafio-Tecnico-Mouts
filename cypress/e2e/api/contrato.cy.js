describe('ServeRest API — Testes de Contrato', { tags: '@api' }, () => {
	// ─── Cenário 1: GET /usuarios ────────────────────────────────────────────
	context('GET /usuarios', () => {
		it('Deve validar o contrato de resposta da listagem de usuarios cadastrados', () => {
			// Arrange
			const url = `${Cypress.env('API_URL')}/usuarios`;

			// Act
			cy.api({
				method: 'GET',
				url,
			}).then(({ status, body }) => {
				// Assert
				expect(status).to.eq(200);
				cy.validarContrato('getUsuarios', body);
			});
		});
	});

	// ─── Cenário 2: GET /produtos ────────────────────────────────────────────
	context('GET /produtos', () => {
		it('Deve validar o contrato de resposta da listagem de produtos cadastrados', () => {
			// Arrange
			const url = `${Cypress.env('API_URL')}/produtos`;

			// Act
			cy.api({
				method: 'GET',
				url,
			}).then(({ status, body }) => {
				// Assert
				expect(status).to.eq(200);
				cy.validarContrato('getProdutos', body);
			});
		});
	});

	// ─── Cenário 3: GET /carrinhos ───────────────────────────────────────────
	context('GET /carrinhos', () => {
		it('Deve validar o contrato de resposta da listagem de carrinhos cadastrados', () => {
			// Arrange
			const url = `${Cypress.env('API_URL')}/carrinhos`;

			// Act
			cy.api({
				method: 'GET',
				url,
			}).then(({ status, body }) => {
				// Assert
				expect(status).to.eq(200);
				cy.validarContrato('getCarrinhos', body);
			});
		});
	});

	// ─── Cenário 4: POST /login ──────────────────────────────────────────────
	context('POST /login', () => {
		it('Deve validar o contrato de resposta ao realizar login com sucesso', () => {
			// Arrange
			const payload = {
				email: Cypress.env('USER_EMAIL'),
				password: Cypress.env('USER_PASSWORD'),
			};

			// Act
			cy.loginApi(payload).then(({ status, body }) => {
				// Assert
				expect(status).to.eq(200);
				cy.validarContrato('loginComSucesso', body);
			});
		});

		it('Deve validar o contrato de resposta ao tentar realizar login com credenciais invalidas', () => {
			// Arrange
			const payload = {
				email: 'email_invalido_teste_contrato@mouts.com',
				password: 'senha_incorreta_contrato',
			};

			// Act
			cy.loginApi(payload, { failOnStatusCode: false }).then(({ status, body }) => {
				// Assert
				expect(status).to.eq(401);
				cy.validarContrato('errorEmailSenhaInvalidos', body);
			});
		});
	});
});
