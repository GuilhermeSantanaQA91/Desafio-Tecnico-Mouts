# Desafio Técnico Mouts — Automação de Testes com Cypress

Este projeto contém uma suíte completa de testes automatizados (E2E e API) focada no [ServeRest](https://serverest.dev/) — uma API REST pública para estudos de testes de software.

## 🛠️ Tecnologias Utilizadas

- **[Cypress](https://www.cypress.io/)** (v15) - Framework principal de testes
- **[JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)** - Linguagem de programação
- **[Ajv](https://ajv.js.org/)** - Validação estrutural de contratos JSON Schema
- **[Faker.js](https://fakerjs.dev/)** - Geração de massa de dados dinâmicos
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD pipeline
- **[Mochawesome](https://www.npmjs.com/package/cypress-mochawesome-reporter)** - Relatório detalhado em HTML

## 🏗️ Estrutura do Projeto

```text
├── .github/workflows/   # Pipelines do GitHub Actions
├── cypress/
│   ├── e2e/
│   │   ├── api/         # Testes puros de API (Contrato e Funcional)
│   │   └── gui/         # Testes end-to-end de Interface (GUI)
│   ├── environments/    # Variáveis de ambiente configuráveis
│   ├── fixtures/        # Massa de dados estática e JSON Schemas
│   └── support/         # Comandos customizados (cy.validarContrato, etc)
├── templates/           # Templates padronizados para criação de novos testes
└── package.json         # Dependências e scripts de execução
```

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/en/) (versão >= 22)
- [pnpm](https://pnpm.io/) (via Corepack ou `npm install -g pnpm`)

### Instalação
Clone este repositório e instale as dependências:
```bash
git clone https://github.com/GuilhermeSantanaQA91/Desafio-Tecnico-Mouts.git
cd Desafio-Tecnico-Mouts
pnpm install
```

### Execução dos Testes

Rodar testes de API e E2E no modo headless:
```bash
pnpm run cy:run
```

Rodar **apenas** testes de API:
```bash
pnpm run cy:run:api
```

Rodar **apenas** testes E2E (Interface):
```bash
pnpm run cy:run:e2e
```

Abrir a interface interativa do Cypress:
```bash
pnpm run cy:open
```

Gerar relatório consolidado Mochawesome:
```bash
pnpm run cy:run:report
```

## 🤖 CI/CD e Relatórios

Este projeto utiliza **GitHub Actions** para execução contínua. Toda vez que ocorre um push ou um Pull Request para a branch `main`, a pipeline é engatilhada rodando os jobs separados para `@api` e `@e2e` paralelamente.

Após a execução bem-sucedida, o relatório de testes em HTML é gerado automaticamente usando Mochawesome e publicado no **GitHub Pages**:

🔗 **[Ver Relatório de Testes Mais Recente](https://guilhermesantanaqa91.github.io/Desafio-Tecnico-Mouts/)** *(se ativo)*

## 📚 Boas Práticas Adotadas

1. **Validação de Contrato**: Utilização do `Ajv` para realizar validações estruturais de API em massa, evitando múltiplos `expect` no corpo do teste.
2. **Separação de Responsabilidades**: Lógicas de requisições de API repetitivas foram extraídas para Custom Commands (`cypress/support/commands.js`), evitando Page Objects.
3. **Massa de Dados Dinâmica**: Uso do `@faker-js/faker` para nomes, e-mails, senhas, prevenindo falsos positivos por conflito de dados no banco.
4. **Isolamento de Estado**: Cypress lida perfeitamente com cookies e local storage via `testIsolation: true`.
5. **Asserções de Interface**: Foco em verificar estado visível ao invés de buscar por tags com `cy.contains(selector, text)`.

## 📝 Licença
Desenvolvido por Guilherme Santana como parte do Desafio Técnico Mouts. Licenciado sob MIT.
