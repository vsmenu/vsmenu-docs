---
title: Estratégia de Testes
description: Guia completo de testes para o projeto VSmenu 2.0
---

# Estratégia de Testes

Documentação completa sobre testes no ecossistema VSmenu.

## 🎯 Visão Geral

O VSmenu segue uma estratégia de testes abrangente para garantir qualidade e confiabilidade do software.

## 🧪 Tipos de Testes

### Testes Unitários

Testam unidades individuais de código em isolamento.

**Ferramentas:**

- Backend (Laravel): PHPUnit
- Frontend (Vue): Vitest
- Mobile (React Native): Jest

**Cobertura Alvo:** 80%+

::: tip Boas Práticas

- Teste apenas uma coisa por vez
- Use mocks para dependências externas
- Nomes descritivos e claros
- Rápidos de executar (\< 1s cada)
:::

### Testes de Integração

Testam a integração entre componentes e serviços.

**Escopo:**

- APIs e banco de dados
- Integração entre módulos
- Serviços externos (mocks)

::: info Em Desenvolvimento
Documentação em construção.
:::

### Testes E2E (End-to-End)

Testam fluxos completos do ponto de vista do usuário.

**Ferramentas:**

- Web: Playwright ou Cypress
- Mobile: Detox
- Desktop: Spectron

::: info Em Desenvolvimento
Documentação em construção.
:::

### Testes de Performance

Garantem que o sistema atende aos requisitos de performance.

**Ferramentas:**

- k6 para testes de carga
- Lighthouse para performance web

::: info Em Desenvolvimento
Documentação em construção.
:::

## 🚀 Executando Testes

### Backend

```bash
# Todos os testes
php artisan test

# Com cobertura
php artisan test --coverage

# Apenas um arquivo
php artisan test tests/Unit/ProductTest.php
```

### Frontend Web

```bash
# Todos os testes
npm test

# Watch mode
npm test -- --watch

# Com cobertura
npm test -- --coverage
```

### Mobile

```bash
# Todos os testes
npm test

# E2E
npm run test:e2e
```

## 📊 Cobertura de Testes

Mantenha a cobertura de testes sempre acima de 80%:

- **Unitários:** 80%+
- **Integração:** 60%+
- **E2E:** Fluxos críticos cobertos

## 🎯 Quando Testar O Quê

| Tipo | Quando Usar |
|------|-------------|
| **Unitário** | Lógica de negócio, helpers, utilidades |
| **Integração** | APIs, repositories, services |
| **E2E** | Fluxos críticos do usuário |
| **Performance** | Antes de releases importantes |

## 🤝 Contribuindo

Ao criar um PR, garanta que:

- [ ] Novos testes cobrem o código adicionado
- [ ] Todos os testes existentes passam
- [ ] Cobertura não diminui
- [ ] Testes E2E críticos passam

---

Veja também: [Guias de Desenvolvimento](/guides/)
