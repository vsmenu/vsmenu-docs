# Estrutura da Documentação 📁

Este documento descreve a estrutura de pastas e organização do conteúdo da documentação VSmenu.

## 📊 Visão Geral

A documentação está organizada de forma hierárquica e modular para facilitar navegação, manutenção e contribuição.

## 🗂️ Estrutura de Pastas

```
vsmenu-docs/
├── docs/                                # Conteúdo da documentação
│   ├── index.md                         # 🏠 Página inicial
│   │
│   ├── getting-started/                 # 🚀 Primeiros passos
│   │   ├── index.md                     # Overview
│   │   ├── installation.md              # Instalação
│   │   ├── quick-start.md               # Quick start
│   │   └── prerequisites.md             # Pré-requisitos
│   │
│   ├── architecture/                    # 🏗️ Arquitetura do sistema
│   │   ├── index.md                     # Overview da arquitetura
│   │   ├── overview.md                  # Visão geral detalhada
│   │   ├── components.md                # Componentes do sistema
│   │   ├── data-flow.md                 # Fluxo de dados
│   │   ├── decisions/                   # 📋 ADRs (Architecture Decision Records)
│   │   │   └── .gitkeep
│   │   └── diagrams/                    # 📊 Diagramas de arquitetura
│   │       └── .gitkeep
│   │
│   ├── api/                             # 🔌 Documentação da API
│   │   ├── index.md                     # API overview
│   │   ├── authentication.md            # Autenticação
│   │   ├── endpoints/                   # 📍 Endpoints por módulo
│   │   │   └── .gitkeep                 # (auth, products, orders, etc)
│   │   ├── webhooks.md                  # Webhooks
│   │   └── websockets.md                # WebSocket events
│   │
│   ├── guides/                          # 📚 Guias de desenvolvimento
│   │   ├── index.md                     # Guias overview
│   │   ├── api/                         # 🔧 vsmenu-api (Backend)
│   │   │   └── .gitkeep
│   │   ├── web/                         # 🌐 vsmenu-delivery-web
│   │   │   └── .gitkeep
│   │   ├── desktop/                     # 💻 vsmenu-desktop
│   │   │   └── .gitkeep
│   │   ├── mobile-waiter/               # 📱 vsmenu-mobile-waiter
│   │   │   └── .gitkeep
│   │   ├── mobile-deliverer/            # 🚚 vsmenu-mobile-deliverer
│   │   │   └── .gitkeep
│   │   └── design-system/               # 🎨 vsmenu-design-system
│   │       └── .gitkeep
│   │
│   ├── tutorials/                       # 🎯 Tutoriais passo a passo
│   │   ├── index.md                     # Tutoriais overview
│   │   ├── beginner/                    # Para iniciantes
│   │   ├── intermediate/                # Intermediário
│   │   └── advanced/                    # Avançado
│   │
│   ├── business-rules/                  # 📋 Regras de negócio
│   │   ├── index.md                     # RNs overview
│   │   ├── products.md                  # RNs de produtos
│   │   ├── orders.md                    # RNs de pedidos
│   │   ├── tables.md                    # RNs de mesas
│   │   ├── delivery.md                  # RNs de delivery
│   │   ├── customers.md                 # RNs de clientes
│   │   ├── payments.md                  # RNs de pagamentos
│   │   └── inventory.md                 # RNs de estoque
│   │
│   ├── testing/                         # 🧪 Estratégia de testes
│   │   ├── index.md                     # Testing overview
│   │   ├── unit-tests.md                # Testes unitários
│   │   ├── integration-tests.md         # Testes de integração
│   │   └── e2e-tests.md                 # Testes E2E
│   │
│   ├── deployment/                      # 🚀 Deploy e implantação
│   │   ├── index.md                     # Deploy overview
│   │   ├── local.md                     # Ambiente local
│   │   ├── staging.md                   # Ambiente de staging
│   │   └── production.md                # Ambiente de produção
│   │
│   ├── contributing/                    # 🤝 Como contribuir
│   │   ├── index.md                     # Guia de contribuição
│   │   ├── code-style.md                # Estilo de código
│   │   ├── git-workflow.md              # Fluxo de trabalho Git
│   │   └── pull-requests.md             # Como fazer PRs
│   │
│   ├── changelog/                       # 📝 Histórico de mudanças
│   │   └── index.md                     # Changelog
│   │
│   ├── images/                          # 🖼️ Imagens da documentação
│   │   ├── logo.svg
│   │   └── vsmenu-logo.png
│   │
│   └── public/                          # 📦 Assets públicos
│       └── diagrams/                    # Diagramas e assets
│           └── .gitkeep
│
├── .github/                             # ⚙️ Configurações GitHub
│   └── workflows/                       # GitHub Actions
│
├── node_modules/                        # 📦 Dependências
├── package.json                         # 📋 Configuração do projeto
├── package-lock.json
│
├── DOCUMENT-TEMPLATE.md                 # 📄 Template de documento
├── CONVENTIONS.md                       # 📐 Convenções de documentação
├── STRUCTURE.md                         # 📁 Este arquivo
├── LICENSE                              # ⚖️ Licença
└── README.md                            # 📖 README principal

```

## 📝 Convenções

### Arquivos

- **index.md** - Sempre presente em cada seção, serve como overview
- **kebab-case.md** - Nomes de arquivos em kebab-case
- **Front Matter** - Todo arquivo `.md` deve ter front matter YAML

### Pastas

- **kebab-case** - Nomes de pastas em kebab-case
- **index.md obrigatório** - Cada pasta deve ter seu `index.md`
- **.gitkeep** - Usado em pastas vazias para mantê-las no Git

### Assets

- **images/** - Imagens (logos, screenshots, ícones)
- **public/diagrams/** - Diagramas de arquitetura e fluxos
- **Otimização** - Imagens devem ser otimizadas antes do commit

## 🎯 Seções Principais

### 1. Getting Started 🚀

**Objetivo:** Ajudar novos desenvolvedores a começar rapidamente  
**Conteúdo:** Instalação, pré-requisitos, quick start  
**Público:** Iniciantes no projeto

### 2. Architecture 🏗️

**Objetivo:** Explicar a arquitetura do sistema  
**Conteúdo:** Visão geral, componentes, fluxo de dados, ADRs  
**Público:** Arquitetos, desenvolvedores avançados

### 3. API 🔌

**Objetivo:** Documentar a API REST e WebSocket  
**Conteúdo:** Endpoints, autenticação, webhooks, eventos  
**Público:** Desenvolvedores frontend/mobile, integrações

### 4. Guides 📚

**Objetivo:** Guias específicos por aplicação  
**Conteúdo:** Setup, desenvolvimento, deploy por repositório  
**Público:** Desenvolvedores de cada aplicação

### 5. Tutorials 🎯

**Objetivo:** Tutoriais práticos e passo a passo  
**Conteúdo:** Exemplos práticos, casos de uso  
**Público:** Todos os níveis (iniciante → avançado)

### 6. Business Rules 📋

**Objetivo:** Documentar regras de negócio  
**Conteúdo:** RNs por módulo do sistema  
**Público:** Analistas, desenvolvedores, QA

### 7. Testing 🧪

**Objetivo:** Estratégias e guias de testes  
**Conteúdo:** Unitários, integração, E2E  
**Público:** Desenvolvedores, QA

### 8. Deployment 🚀

**Objetivo:** Guias de implantação  
**Conteúdo:** Deploy local, staging, produção  
**Público:** DevOps, desenvolvedores

### 9. Contributing 🤝

**Objetivo:** Orientar contribuidores  
**Conteúdo:** Como contribuir, padrões, workflow  
**Público:** Contribuidores externos e internos

### 10. Changelog 📝

**Objetivo:** Histórico de mudanças  
**Conteúdo:** Releases, mudanças significativas  
**Público:** Todos

## 🔗 Navegação

### Links Internos

Use links relativos:

```markdown
[Documentação da API](../api/index.md)
[Getting Started](./getting-started/index.md)
```

### Links Externos

Use links absolutos:

```markdown
[VitePress](https://vitepress.dev)
```

## 📈 Escalabilidade

A estrutura foi projetada para escalar:

- ✅ Fácil adicionar novas seções
- ✅ Subpastas ilimitadas
- ✅ Um tópico por arquivo
- ✅ Modular e organizada
- ✅ Busca eficiente

## 🤝 Contribuindo

Para adicionar novo conteúdo:

1. Identifique a seção correta
2. Crie arquivo em kebab-case
3. Adicione front matter
4. Use o [template](./DOCUMENT-TEMPLATE.md)
5. Siga as [convenções](./CONVENTIONS.md)
6. Atualize navegação se necessário

## 📚 Referências

- [DOCUMENT-TEMPLATE.md](./DOCUMENT-TEMPLATE.md) - Template de documento
- [CONVENTIONS.md](./CONVENTIONS.md) - Convenções de documentação
- [README.md](./README.md) - README principal
- [VitePress Docs](https://vitepress.dev) - Documentação VitePress

---

**Dúvidas sobre a estrutura?** Abra uma [issue](https://github.com/vsmenu/vsmenu-docs/issues) ou veja o [Guia de Contribuição](./docs/contributing/index.md).
