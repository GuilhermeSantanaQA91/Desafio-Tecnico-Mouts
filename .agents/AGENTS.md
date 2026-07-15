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

## Skills disponíveis

- `cypress-e2e` → guia completo para testes E2E / GUI (seletores, esperas, intercepts, mocking)
- `cypress-api` → guia completo para testes de API pura com `cy.request()` e `cy.api()`
