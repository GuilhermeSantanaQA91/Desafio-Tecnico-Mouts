describe('Funcionalidade — Contexto', () => {
	beforeEach(() => {
		// Registrar intercepts ANTES da navegação
		cy.intercept('POST', '**/endpoint').as('enviarFormulario');
		cy.visit('/<rota>');
	});

	it('Deve <ação> com sucesso', () => {
		// Arrange
		const dado = 'valor';

		// Act
		cy.get('[data-testid="campo"]').should('be.visible').type(dado);
		cy.get('[data-testid="btn-enviar"]').should('be.visible').click();
		cy.wait('@enviarFormulario');

		// Assert
		// Preferir validação de texto explícita usando contains (Regra do Workspace)
		cy.contains('[data-testid="mensagem-sucesso"]', 'Sucesso!').should('be.visible');
	});
});
