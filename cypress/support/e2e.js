import { register } from '@cypress/grep';
register();

import 'cypress-plugin-api';
import './commands';

// Ignora apenas erros externos conhecidos e documentados do ServeRest/front.
// NÃO retorne false de forma global: erros reais da aplicação devem falhar o teste.
Cypress.on('uncaught:exception', (error) => {
	const errorsConhecidos = [
		// ResizeObserver loop — erro cosmético de navegador, não afeta a aplicação
		'ResizeObserver loop limit exceeded',
		'ResizeObserver loop completed with undelivered notifications',
	];

	if (errorsConhecidos.some((msg) => error.message.includes(msg))) {
		return false;
	}
	// Qualquer outro erro propaga e falha o teste
});
