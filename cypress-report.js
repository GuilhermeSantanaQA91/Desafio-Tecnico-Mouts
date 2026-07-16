const fs = require('fs');
const path = require('path');
const { setSimpleConfig } = require('cypress-mochawesome-reporter/lib/config');
const generateReport = require('cypress-mochawesome-reporter/lib/generateReport');

const projectRoot = __dirname;
const outputDir = path.join(projectRoot, 'cypress', 'reports', 'mochawesome');

const config = {
  jsonDir: 'cypress/reports/mochawesome/.jsons',
  screenshotsDir: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  outputDir: 'cypress/reports/mochawesome',
  removeJsonsFolderAfterMerge: true,
  reporterOptions: {
    reportDir: 'cypress/reports/mochawesome',
    overwrite: false,
    html: true,
    json: true,
    inlineAssets: true,
    saveAllAttempts: false
  }
};

(async () => {
  try {
    console.log('Iniciando preparação de arquivos JSON...');
    
    // Limpa HTMLs anteriores para evitar colisões (ex: index_001.html)
    const existingHtml = path.join(outputDir, 'index.html');
    if (fs.existsSync(existingHtml)) {
      fs.rmSync(existingHtml, { force: true });
      console.log('Removido index.html anterior para substituição.');
    }
    // Remove também arquivos index_*.html legados
    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir);
      for (const f of files) {
        if (f.startsWith('index_') && f.endsWith('.html')) {
          fs.rmSync(path.join(outputDir, f), { force: true });
        }
      }
    }

    console.log('Gerando relatório HTML unificado...');
    setSimpleConfig(config);
    await generateReport();

    console.log('✅ Relatório unificado criado com sucesso!');
  } catch (error) {
    console.error('❌ Falha ao unificar relatórios:', error);
    process.exit(1);
  }
})();
