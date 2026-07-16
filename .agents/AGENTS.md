# Regras do Workspace — Desafio Técnico Mouts

## Contexto

Projeto de automação de testes com Cypress 15 + JavaScript para o ServeRest (API REST pública).
Ferramenta de IA: Antigravity (Gemini). Não referenciar VSCode Copilot, GitHub Copilot ou nomenclatura de projetos anteriores.

## Ordem de precedência

1. Regras deste AGENTS.md (sempre aplicadas)
2. Skills em `.agents/skills/` (carregadas por contexto de arquivo/tarefa)
3. Respostas às perguntas diretas do usuário

## Regras de escrita de testes (sempre aplicadas)

- Padrão: **JavaScript** — nunca TypeScript
- Nunca usar `cy.wait(ms)` com tempo fixo — proibido sem exceção
- Nunca usar `testIsolation: false`
- `be.visible` já implica `exist` — nunca encadear os dois
- Para texto visível: usar `cy.contains('seletor', 'texto').should('be.visible')` — nunca `.get().should('be.visible').and('contain', 'texto')`
- Sempre asserts positivos antes de negativos
- Padrão AAA (Arrange / Act / Assert) com comentários inline
- `beforeEach` para setup; evitar `before`, `after`, `afterEach`
- Máximo de 3 asserts explícitos por `it()` — focar no comportamento principal
- Títulos de testes (`it()`) devem ser literais e explícitos sobre o que está sendo testado e como (ex: evite termos abstratos como "amostragem", prefira "validar até 5 itens aleatórios").
- Não usar Page Objects. Extraia PROATIVAMENTE qualquer sequência de ações repetidas (preencher formulários, chamadas de API como login/cadastro) para Custom Commands no `cypress/support/commands.js`. Nunca duplique fluxos de ação nos `it()`.
- Sempre preferir validação estrutural de contratos de API via comando customizado `cy.validarContrato('nomeDoSchema', dados)` (que utiliza o `Ajv` sob o capô) em vez de múltiplos `expect` manuais de tipos e chaves no runner. O primeiro argumento é sempre uma **string** com o nome do schema (ex: `'getUsuarios'`, `'loginComSucesso'`), não um objeto JSON. Isso simplifica a leitura dos testes, valida 100% da resposta sem requerer amostragem e evita poluição visual de asserções no Cypress Runner.
- Não usar `return false` global no `uncaught:exception`. Ignorar apenas erros externos conhecidos e documentados por mensagem. Erros reais da aplicação devem propagar e falhar o teste.

## Estrutura de arquivos

```
cypress/
  ├── e2e/
  │   ├── gui/        # Testes E2E de interface
  │   └── api/        # Testes de API pura
  ├── fixtures/       # Dados estáticos de teste
  └── support/
      ├── commands.js # Comandos customizados globais
      └── e2e.js      # Setup global (importa commands)
```

## Dados sensíveis

- Nunca hardcodar dados sensíveis — usar `Cypress.env('CHAVE')` ou `cypress.env.json` (não versionado)
- Usar `{ log: false }` ao tipar senhas e tokens

## Variáveis de ambiente disponíveis (dev.settings.json)

| Chave           | Descrição                                           |
| --------------- | ----------------------------------------------------- |
| `USER_EMAIL`    | Email do usuário fixo de testes                       |
| `USER_PASSWORD` | Senha do usuário fixo de testes                       |
| `USER_NAME`     | Nome completo do usuário fixo (usado em assert GUI)   |
| `API_URL`       | Base URL da API ServeRest                             |
| `BASE_URL`      | Base URL do front-end ServeRest                       |

## Custom Commands disponíveis (commands.js)

| Comando                    | Descrição                                                  |
| -------------------------- | ------------------------------------------------------------ |
| `cy.loginViaApi()`         | Login via API, armazena token em `BEARER_TOKEN`              |
| `cy.loginApi(payload)`     | POST /login via cy.api() — retorna resposta completa         |
| `cy.criarUsuarioApi()`     | POST /usuarios via cy.api() — retorna resposta completa      |
| `cy.deletarUsuarioApi(id)` | DELETE /usuarios/:id — usado em cleanup pós-criação         |
| `cy.loginGui()`            | Preenche e submete formulário de login                       |
| `cy.cadastrarUsuarioGui()` | Preenche e submete formulário de cadastro                    |
| `cy.validarContrato()`     | Valida body contra schema Ajv (1º arg: string com nome)      |

## Regras de Versionamento e Commit

- As mensagens de commit devem ser escritas sempre em **Português**.
- Adotar a especificação de **Conventional Commits** (ex: `feat(teste): ...`, `chore(config): ...`).
- Manter a mensagem do commit direta, concisa e simplificada. Mesmo ao realizar commits que agrupam várias alterações, evite descrever detalhadamente cada arquivo modificado na mensagem do commit, focando no objetivo geral do conjunto de mudanças.

## Skills disponíveis

- `cypress-e2e` → guia completo para testes E2E / GUI (seletores, esperas, intercepts, mocking)
- `cypress-api` → guia completo para testes de API pura com `cy.request()` e `cy.api()`
