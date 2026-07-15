describe('API — <Recurso>', () => {
	it('Deve <ação> com sucesso', () => {
		// Arrange
		const url = '/<rota>';

		// Act
		cy.api({
			method: 'GET',
			url,
		}).then(({ status, body }) => {
			// Assert
			expect(status).to.eq(200);
			expect(body).to.not.be.empty;
		});
	});

	it('Deve retornar erro para <condição inválida>', () => {
		// Arrange
		const url = '/<rota>';

		// Act
		cy.api({
			method: 'GET',
			url,
			failOnStatusCode: false,
		}).then(({ status, body }) => {
			// Assert
			expect(status).to.eq(400);
			expect(body).to.have.property('message');
		});
	});
});
