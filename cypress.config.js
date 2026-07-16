require('dotenv').config();
const path = require('path');
const { defineConfig } = require('cypress');
const fse = require('fs-extra');

module.exports = defineConfig({
	e2e: {
		specPattern: ['cypress/e2e/**/*.{cy,spec}.js'],
		pageLoadTimeout: 50000,
		requestTimeout: 50000,
		responseTimeout: 50000,
		viewportHeight: 800,
		viewportWidth: 1366,
		retries: 0,
		watchForFileChanges: false,
		chromeWebSecurity: false,
		scrollBehavior: false,
		video: false,
		screenshotsFolder: 'cypress/screenshots',
		includeShadowDom: true,

		// ─── Reporters ──────────────────────────────────────────────────────────
		// cypress-multi-reporters: exibe 'spec' no terminal E gera JSON/HTML
		// via mochawesome para cada spec. O merge final em um único HTML é feito
		// pelo script `cy:report` (cypress-mochawesome-reporter merge).
		reporter: 'cypress-multi-reporters',
		reporterOptions: {
			reporterEnabled: 'cypress-mochawesome-reporter',
			cypressMochawesomeReporterReporterOptions: {
				reportDir: 'cypress/reports/mochawesome',
				overwrite: false,
				html: false,
				json: true,
				inlineAssets: true,
				saveAllAttempts: false,
				removeJsonsFolderAfterMerge: false,
			},
		},

		setupNodeEvents(on, config) {
			// ─── Cypress Grep ─────────────────────────────────────────────────────
			config.env.grepFilterSpecs = true;
			const { plugin: cypressGrep } = require('@cypress/grep/plugin');
			cypressGrep(config);

			// ─── Mochawesome Reporter ─────────────────────────────────────────────
			require('cypress-mochawesome-reporter/plugin')(on);
			// ─── Chrome DevTools MCP ───────────────────────────────────────────────
			// Habilita integração Cypress + Chrome DevTools MCP apenas quando
			// o script `cy:open:mcp` for utilizado (mcpDebug=true).
			on('before:browser:launch', (browser = {}, launchOptions) => {
				const mcpDebugEnabled =
					config.env.mcpDebug === true || config.env.mcpDebug === 'true';

				if (!mcpDebugEnabled) {
					return launchOptions;
				}

				if (browser.family === 'chromium' && browser.name !== 'electron') {
					const mcpProxyPort = String(config.env.mcpPort || '60562');

					// Lê a porta real que o Cypress atribuiu ao Chrome
					const rdpArg = launchOptions.args.find((arg) =>
						arg.startsWith('--remote-debugging-port='),
					);
					const chromePort = rdpArg ? rdpArg.split('=')[1] : null;

					if (chromePort) {
						// Salva a porta real do Chrome para o proxy MCP redirecionar
						const portFilePath = path.join(__dirname, '.cypress-mcp-port');
						fse.writeFileSync(portFilePath, chromePort, 'utf8');
						console.log(
							`[MCP] Chrome CDP na porta ${chromePort} → proxy MCP escutará em ${mcpProxyPort}`,
						);
					}
				}

				return launchOptions;
			});

			// ─── after:spec ────────────────────────────────────────────────────────
			// Loga erros dos testes que falharam após cada spec.
			on('after:spec', (_spec, results) => {
				if (!results) return;
				for (const test of results.tests) {
					if (test.state === 'failed') {
						console.log('\n' + test.title);
						console.log(test.displayError);
					}
				}
			});

			// ─── Carrega variáveis de ambiente por ambiente (dev | uat) ──────────
			const rawEnv = config.env.env || 'dev';
			const env = ['dev', 'uat'].includes(rawEnv) ? rawEnv : 'dev';

			const environmentFilename = `./cypress/environments/${env}.settings.json`;
			console.log('Carregando arquivo %s', environmentFilename);
			const settings = require(environmentFilename);
			console.log('Carregadas as configurações para o ambiente: %s', env);

			config.env = { ...config.env, ...settings };
			config.baseUrl = settings.BASE_URL;
			return config;
		},

		// PERFORMANCE: Bloqueia requisições externas sem relação com os testes
		// (analytics, tracking, acessibilidade). Reduz ruído de rede e melhora
		// a estabilidade dos testes E2E.
		blockHosts: [
			// '*google-analytics.com',
			// '*googletagmanager.com',
			// '*facebook.net',
			// '*hotjar.com',
			// '*clarity.ms',
			// '*doubleclick.net',
		],
	},
});
