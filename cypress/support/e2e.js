import 'cypress-plugin-api';
import './commands';

// Ignora erros não tratados para evitar falha dos testes
Cypress.on('uncaught:exception', (_err, _runnable) => {
	// retornar false aqui impede que o Cypress falhe o teste
	return false;
});
