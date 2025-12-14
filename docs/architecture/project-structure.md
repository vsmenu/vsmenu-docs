---
title: Estrutura de Projetos
description: Organização de pastas e arquivos em cada repositório do VSmenu 2.0
---

# Estrutura de Projetos e Organização

Documentação detalhada da estrutura de pastas e organização de código em cada repositório do VSmenu 2.0, facilitando navegação e compreensão do código.

## 🎯 Visão Geral

Cada repositório do VSmenu 2.0 segue padrões específicos de organização baseados em:
- **Arquitetura**: Clean Architecture, DDD, Feature-based
- **Separação de Responsabilidades**: Camadas bem definidas
- **Escalabilidade**: Estrutura que cresce com o projeto
- **Manutenibilidade**: Fácil localização de código

### Repositórios e Padrões

| Repositório | Padrão | Estrutura Principal |
|-------------|--------|---------------------|
| **vsmenu-api** | Clean Architecture + DDD | Domain, Application, Infrastructure, Presentation |
| **vsmenu-delivery-web** | Feature-based | components, views, stores, services |
| **vsmenu-desktop** | Main/Renderer | main/, renderer/, shared/ |
| **vsmenu-mobile-waiter** | Clean Architecture + Feature | features/[feature]/data-domain-presentation |
| **vsmenu-mobile-deliverer** | Clean Architecture + Feature | features/[feature]/data-domain-presentation |
| **vsmenu-sales-panel** | Feature-based | components, views, stores, services |
| **vsmenu-landing** | Pages-based (Nuxt) | pages/, components/, composables/ |
| **vsmenu-digital-menu** | Feature-based | components, views, stores, services |

## 🔧 vsmenu-api (Backend Laravel)

### Estrutura Completa

```
vsmenu-api/
├── app/
│   ├── Domain/                         # 🏛️ Lógica de Negócio Pura
│   │   ├── Entities/                   # Entidades de domínio
│   │   │   ├── Order/
│   │   │   │   ├── Order.php
│   │   │   │   ├── OrderItem.php
│   │   │   │   └── OrderStatus.php (enum)
│   │   │   ├── Product/
│   │   │   ├── Customer/
│   │   │   └── Table/
│   │   │
│   │   ├── ValueObjects/               # Objetos de valor imutáveis
│   │   │   ├── Money.php
│   │   │   ├── Email.php
│   │   │   ├── CPF.php
│   │   │   └── Address.php
│   │   │
│   │   ├── Repositories/               # Interfaces de repositórios
│   │   │   ├── OrderRepositoryInterface.php
│   │   │   ├── ProductRepositoryInterface.php
│   │   │   └── CustomerRepositoryInterface.php
│   │   │
│   │   ├── Services/                   # Serviços de domínio
│   │   │   ├── OrderDomainService.php
│   │   │   ├── PricingService.php
│   │   │   └── InventoryService.php
│   │   │
│   │   └── Events/                     # Eventos de domínio
│   │       ├── OrderCreated.php
│   │       ├── OrderStatusChanged.php
│   │       └── PaymentReceived.php
│   │
│   ├── Application/                    # 🎯 Casos de Uso
│   │   ├── UseCases/
│   │   │   ├── Orders/
│   │   │   │   ├── CreateOrderUseCase.php
│   │   │   │   ├── UpdateOrderStatusUseCase.php
│   │   │   │   ├── CancelOrderUseCase.php
│   │   │   │   └── GetOrderUseCase.php
│   │   │   ├── Products/
│   │   │   └── Customers/
│   │   │
│   │   ├── DTOs/                       # Data Transfer Objects
│   │   │   ├── CreateOrderDTO.php
│   │   │   ├── UpdateOrderDTO.php
│   │   │   └── OrderFilterDTO.php
│   │   │
│   │   └── Validators/                 # Validadores de negócio
│   │       ├── OrderBusinessValidator.php
│   │       └── ProductStockValidator.php
│   │
│   ├── Infrastructure/                 # 🔧 Implementações Técnicas
│   │   ├── Persistence/                # Eloquent & Repositories
│   │   │   ├── Models/
│   │   │   │   ├── Order.php          # Eloquent Model
│   │   │   │   ├── OrderItem.php
│   │   │   │   ├── Product.php
│   │   │   │   └── Customer.php
│   │   │   │
│   │   │   └── Repositories/           # Implementações
│   │   │       ├── EloquentOrderRepository.php
│   │   │       ├── EloquentProductRepository.php
│   │   │       └── EloquentCustomerRepository.php
│   │   │
│   │   ├── Cache/                      # Cache implementations
│   │   │   ├── RedisCache.php
│   │   │   └── CacheKeys.php
│   │   │
│   │   ├── Queue/                      # Queue jobs
│   │   │   ├── Jobs/
│   │   │   │   ├── SendOrderNotification.php
│   │   │   │   ├── ProcessPayment.php
│   │   │   │   └── SyncInventory.php
│   │   │   └── Listeners/
│   │   │
│   │   ├── External/                   # APIs externas
│   │   │   ├── Payment/
│   │   │   │   └── StripePaymentGateway.php
│   │   │   └── Delivery/
│   │   │       └── iFoodIntegration.php
│   │   │
│   │   └── Broadcasting/               # WebSocket events
│   │       ├── OrderChannel.php
│   │       └── TableChannel.php
│   │
│   ├── Presentation/                   # 🎨 Camada de Apresentação
│   │   ├── Http/
│   │   │   ├── Controllers/            # Controllers RESTful
│   │   │   │   ├── Api/
│   │   │   │   │   └── V1/
│   │   │   │   │       ├── OrderController.php
│   │   │   │   │       ├── ProductController.php
│   │   │   │   │       ├── CustomerController.php
│   │   │   │   │       ├── TableController.php
│   │   │   │   │       └── AuthController.php
│   │   │   │   └── Webhook/
│   │   │   │       └── PaymentWebhookController.php
│   │   │   │
│   │   │   ├── Middleware/             # Middlewares
│   │   │   │   ├── TenantMiddleware.php
│   │   │   │   ├── RateLimitMiddleware.php
│   │   │   │   └── LogRequestMiddleware.php
│   │   │   │
│   │   │   ├── Requests/               # Form Requests (validação)
│   │   │   │   ├── Orders/
│   │   │   │   │   ├── CreateOrderRequest.php
│   │   │   │   │   ├── UpdateOrderRequest.php
│   │   │   │   │   └── UpdateOrderStatusRequest.php
│   │   │   │   ├── Products/
│   │   │   │   └── Customers/
│   │   │   │
│   │   │   └── Resources/              # API Resources (transformação)
│   │   │       ├── OrderResource.php
│   │   │       ├── OrderCollection.php
│   │   │       ├── ProductResource.php
│   │   │       └── CustomerResource.php
│   │   │
│   │   └── Console/                    # Comandos Artisan
│   │       ├── Commands/
│   │       │   ├── SyncInventoryCommand.php
│   │       │   └── GenerateReportsCommand.php
│   │       └── Kernel.php
│   │
│   └── Support/                        # 🛠️ Helpers e Utilitários
│       ├── Helpers/
│       │   ├── helpers.php            # Helper functions
│       │   └── DateHelper.php
│       └── Traits/
│           ├── HasTenant.php
│           └── Auditable.php
│
├── bootstrap/                          # Bootstrap da aplicação
│   ├── app.php
│   └── cache/
│
├── config/                             # Configurações
│   ├── app.php
│   ├── database.php
│   ├── cache.php
│   ├── queue.php
│   ├── sanctum.php
│   └── cors.php
│
├── database/                           # Database
│   ├── migrations/                     # Migrations
│   │   ├── 2024_01_01_000001_create_orders_table.php
│   │   ├── 2024_01_01_000002_create_products_table.php
│   │   └── 2024_01_01_000003_create_customers_table.php
│   │
│   ├── seeders/                        # Seeders
│   │   ├── DatabaseSeeder.php
│   │   ├── ProductSeeder.php
│   │   └── UserSeeder.php
│   │
│   └── factories/                      # Factories para testes
│       ├── OrderFactory.php
│       └── ProductFactory.php
│
├── public/                             # Arquivos públicos
│   ├── index.php
│   └── .htaccess
│
├── resources/                          # Resources
│   ├── views/                         # Blade templates (se usado)
│   └── lang/                          # Traduções
│
├── routes/                             # Rotas
│   ├── api.php                        # Rotas de API
│   ├── channels.php                   # Broadcasting channels
│   ├── web.php                        # Rotas web (se usado)
│   └── console.php                    # Comandos console
│
├── storage/                            # Storage
│   ├── app/                           # Arquivos da aplicação
│   ├── framework/                     # Framework cache
│   └── logs/                          # Logs
│
├── tests/                              # Testes
│   ├── Unit/                          # Testes unitários
│   │   ├── Domain/
│   │   │   ├── Entities/
│   │   │   └── Services/
│   │   └── Application/
│   │       └── UseCases/
│   │
│   ├── Feature/                       # Testes de feature (API)
│   │   ├── OrdersTest.php
│   │   ├── ProductsTest.php
│   │   └── AuthTest.php
│   │
│   ├── Integration/                   # Testes de integração
│   │   ├── Database/
│   │   ├── Cache/
│   │   └── Queue/
│   │
│   └── TestCase.php                   # Base test case
│
├── .env.example                        # Exemplo de configuração
├── .gitignore
├── artisan                            # CLI do Laravel
├── composer.json                      # Dependências PHP
├── composer.lock
├── phpunit.xml                        # Configuração PHPUnit
├── docker-compose.yml                 # Docker local
└── README.md
```

### Domain Layer - Onde Adicionar

**Entidades** (`app/Domain/Entities/`):
- Uma entidade representa um conceito do negócio
- Contém lógica de domínio pura
- Exemplo: `Order`, `Product`, `Customer`

**Value Objects** (`app/Domain/ValueObjects/`):
- Objetos imutáveis que representam valores
- Exemplo: `Money`, `Email`, `CPF`

**Repositories** (`app/Domain/Repositories/`):
- Apenas interfaces (contratos)
- Implementações ficam em `Infrastructure/Persistence/Repositories/`

### Application Layer - Onde Adicionar

**Use Cases** (`app/Application/UseCases/[Feature]/`):
- Um Use Case = Uma ação do usuário
- Exemplo: `CreateOrderUseCase`, `UpdateOrderStatusUseCase`

**DTOs** (`app/Application/DTOs/`):
- Transferência de dados entre camadas
- Exemplo: `CreateOrderDTO`, `OrderFilterDTO`

### Infrastructure Layer - Onde Adicionar

**Models** (`app/Infrastructure/Persistence/Models/`):
- Eloquent Models (implementação técnica)
- Um por tabela do banco

**Repositories** (`app/Infrastructure/Persistence/Repositories/`):
- Implementação das interfaces de repositório
- Usa Eloquent para acessar banco

**Jobs** (`app/Infrastructure/Queue/Jobs/`):
- Tarefas assíncronas
- Exemplo: `SendOrderNotification`, `ProcessPayment`

### Presentation Layer - Onde Adicionar

**Controllers** (`app/Presentation/Http/Controllers/Api/V1/`):
- Um controller por recurso
- Métodos: `index`, `store`, `show`, `update`, `destroy`

**Form Requests** (`app/Presentation/Http/Requests/[Feature]/`):
- Uma por action que recebe dados
- Exemplo: `CreateOrderRequest`, `UpdateOrderRequest`

**Resources** (`app/Presentation/Http/Resources/`):
- Transformação de dados para API
- Exemplo: `OrderResource`, `ProductResource`

## 🎨 vsmenu-delivery-web (Frontend Vue.js)

### Estrutura Completa

```
vsmenu-delivery-web/
├── public/                             # Arquivos públicos estáticos
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── assets/                         # Assets (imagens, fonts, etc.)
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   └── icons/
│   │   ├── styles/
│   │   │   ├── main.scss
│   │   │   └── variables.scss
│   │   └── fonts/
│   │
│   ├── components/                     # 🧩 Componentes Reutilizáveis
│   │   ├── common/                    # Componentes comuns
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   ├── Modal.vue
│   │   │   ├── Spinner.vue
│   │   │   └── Toast.vue
│   │   │
│   │   ├── orders/                    # Componentes de pedidos
│   │   │   ├── OrderList.vue
│   │   │   ├── OrderItem.vue
│   │   │   ├── OrderDetails.vue
│   │   │   └── OrderForm.vue
│   │   │
│   │   ├── products/                  # Componentes de produtos
│   │   │   ├── ProductCard.vue
│   │   │   ├── ProductGrid.vue
│   │   │   └── ProductFilter.vue
│   │   │
│   │   ├── cart/                      # Componentes de carrinho
│   │   │   ├── CartSidebar.vue
│   │   │   ├── CartItem.vue
│   │   │   └── CartSummary.vue
│   │   │
│   │   └── layout/                    # Componentes de layout
│   │       ├── AppHeader.vue
│   │       ├── AppFooter.vue
│   │       ├── AppSidebar.vue
│   │       └── AppNav.vue
│   │
│   ├── views/                          # 📄 Páginas/Views
│   │   ├── Home.vue                   # Página inicial
│   │   │
│   │   ├── auth/                      # Autenticação
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   └── ForgotPassword.vue
│   │   │
│   │   ├── orders/                    # Pedidos
│   │   │   ├── OrderList.vue
│   │   │   ├── OrderDetails.vue
│   │   │   └── OrderTracking.vue
│   │   │
│   │   ├── products/                  # Produtos/Cardápio
│   │   │   ├── ProductList.vue
│   │   │   └── ProductDetails.vue
│   │   │
│   │   ├── checkout/                  # Checkout
│   │   │   ├── Cart.vue
│   │   │   ├── Checkout.vue
│   │   │   └── OrderConfirmation.vue
│   │   │
│   │   └── profile/                   # Perfil do usuário
│   │       ├── Profile.vue
│   │       ├── Addresses.vue
│   │       └── OrderHistory.vue
│   │
│   ├── stores/                         # 🗄️ Pinia Stores
│   │   ├── useAuthStore.js            # Autenticação
│   │   ├── useOrderStore.js           # Pedidos
│   │   ├── useProductStore.js         # Produtos
│   │   ├── useCartStore.js            # Carrinho
│   │   └── useUserStore.js            # Usuário
│   │
│   ├── composables/                    # 🎣 Composables Vue
│   │   ├── useAuth.js                 # Autenticação
│   │   ├── useOrders.js               # Pedidos
│   │   ├── useProducts.js             # Produtos
│   │   ├── useCart.js                 # Carrinho
│   │   ├── useToast.js                # Notificações
│   │   └── useWebSocket.js            # WebSocket
│   │
│   ├── services/                       # 🔌 API Clients e Services
│   │   ├── api/
│   │   │   ├── orderService.js       # Orders API
│   │   │   ├── productService.js     # Products API
│   │   │   ├── authService.js        # Auth API
│   │   │   └── userService.js        # User API
│   │   │
│   │   └── websocket/
│   │       └── websocketService.js   # WebSocket service
│   │
│   ├── router/                         # 🛣️ Vue Router
│   │   ├── index.js                   # Configuração principal
│   │   └── guards.js                  # Navigation guards
│   │
│   ├── utils/                          # 🛠️ Utilitários
│   │   ├── axios.js                   # Configuração Axios
│   │   ├── formatters.js              # Formatadores (data, moeda, etc.)
│   │   ├── validators.js              # Validadores
│   │   ├── constants.js               # Constantes
│   │   └── helpers.js                 # Helper functions
│   │
│   ├── types/                          # 📝 TypeScript Types (futuro)
│   │   ├── order.ts
│   │   ├── product.ts
│   │   └── user.ts
│   │
│   ├── App.vue                         # Componente raiz
│   └── main.js                         # Entry point
│
├── .env.example                        # Exemplo de variáveis de ambiente
├── .env.development                    # Env de desenvolvimento
├── .env.production                     # Env de produção
├── .gitignore
├── index.html                          # HTML principal
├── package.json                        # Dependências npm
├── package-lock.json
├── vite.config.js                      # Configuração Vite
├── tailwind.config.js                  # Configuração TailwindCSS
├── postcss.config.js                   # PostCSS config
├── .eslintrc.js                        # ESLint config
├── .prettierrc.js                      # Prettier config
├── docker-compose.yml                  # Docker local (opcional)
└── README.md
```

### Onde Adicionar Novos Arquivos

**Componentes** (`src/components/[feature]/`):
- Componentes reutilizáveis por feature
- Nomear em PascalCase: `OrderList.vue`
- Um componente por arquivo

**Views** (`src/views/[feature]/`):
- Páginas/rotas da aplicação
- Uma view = uma rota
- Exemplo: `OrderList.vue` em `views/orders/`

**Stores** (`src/stores/`):
- Um store por domínio/feature
- Prefixo `use`: `useOrderStore.js`
- State management global

**Composables** (`src/composables/`):
- Lógica reutilizável
- Prefixo `use`: `useOrders.js`
- Retornar objeto com state e methods

**Services** (`src/services/api/`):
- API clients organizados por recurso
- Exemplo: `orderService.js`, `productService.js`

## 🖥️ vsmenu-desktop (Electron)

### Estrutura Completa

```
vsmenu-desktop/
├── src/
│   ├── main/                           # 🔧 Main Process (Node.js)
│   │   ├── index.js                   # Entry point
│   │   │
│   │   ├── database/                  # 💾 SQLite Database
│   │   │   ├── connection.js         # Database connection
│   │   │   ├── migrations/           # Database migrations
│   │   │   │   ├── 001_create_orders.js
│   │   │   │   ├── 002_create_products.js
│   │   │   │   └── 003_create_sync_log.js
│   │   │   │
│   │   │   └── repositories/         # Data repositories
│   │   │       ├── orderRepository.js
│   │   │       ├── productRepository.js
│   │   │       └── syncRepository.js
│   │   │
│   │   ├── sync/                      # 🔄 Sincronização com API
│   │   │   ├── syncService.js        # Service principal de sync
│   │   │   ├── syncStrategies/       # Estratégias de sync
│   │   │   │   ├── orderSync.js
│   │   │   │   ├── productSync.js
│   │   │   │   └── conflictResolver.js
│   │   │   │
│   │   │   └── eventSourcing/        # Event sourcing
│   │   │       └── eventStore.js
│   │   │
│   │   ├── ipc/                       # 🔌 Inter-Process Communication
│   │   │   ├── handlers/             # IPC handlers
│   │   │   │   ├── orderHandlers.js
│   │   │   │   ├── productHandlers.js
│   │   │   │   ├── syncHandlers.js
│   │   │   │   └── authHandlers.js
│   │   │   │
│   │   │   └── channels.js           # IPC channel definitions
│   │   │
│   │   ├── api/                       # 🌐 API Client
│   │   │   └── apiClient.js          # HTTP client para backend
│   │   │
│   │   ├── services/                  # 🛠️ Services
│   │   │   ├── authService.js
│   │   │   └── updateService.js      # Auto-update
│   │   │
│   │   └── utils/                     # Utilitários
│   │       └── logger.js
│   │
│   ├── renderer/                       # 🎨 Renderer Process (Vue.js)
│   │   ├── components/               # Componentes Vue
│   │   │   ├── common/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   ├── tables/
│   │   │   └── layout/
│   │   │
│   │   ├── views/                    # Views/Páginas
│   │   │   ├── Dashboard.vue
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   ├── tables/
│   │   │   └── settings/
│   │   │
│   │   ├── stores/                   # Pinia stores
│   │   │   ├── useOrderStore.js
│   │   │   ├── useProductStore.js
│   │   │   └── useSyncStore.js
│   │   │
│   │   ├── services/                 # Services (IPC calls)
│   │   │   ├── ipcService.js        # IPC client
│   │   │   ├── orderService.js
│   │   │   └── productService.js
│   │   │
│   │   ├── router/                   # Vue Router
│   │   │   └── index.js
│   │   │
│   │   ├── utils/                    # Utilitários
│   │   │   └── formatters.js
│   │   │
│   │   ├── App.vue                   # Root component
│   │   └── main.js                   # Entry point
│   │
│   ├── shared/                         # 📦 Código Compartilhado
│   │   ├── constants/                # Constantes compartilhadas
│   │   │   ├── ipcChannels.js       # IPC channel names
│   │   │   └── appConstants.js
│   │   │
│   │   └── types/                    # TypeScript types
│   │       ├── order.ts
│   │       └── product.ts
│   │
│   └── preload/                        # 🔐 Preload Scripts
│       └── index.js                   # Preload script (security)
│
├── dist/                               # Build output (gitignored)
├── node_modules/                       # Dependencies (gitignored)
├── package.json                        # Dependências npm
├── package-lock.json
├── electron-builder.yml                # Electron builder config
├── vite.config.js                      # Vite config (renderer)
└── README.md
```

### Onde Adicionar Novos Arquivos

**Main Process**:
- **IPC Handlers** (`src/main/ipc/handlers/`): Handlers para comunicação com renderer
- **Repositories** (`src/main/database/repositories/`): Acesso ao SQLite
- **Sync** (`src/main/sync/`): Lógica de sincronização

**Renderer Process**:
- Segue mesma estrutura do `vsmenu-delivery-web`
- Componentes, Views, Stores, Services

## 📱 vsmenu-mobile-waiter (Flutter)

### Estrutura Completa

```
vsmenu-mobile-waiter/
├── lib/
│   ├── core/                           # 🎯 Core (Shared)
│   │   ├── errors/                    # Error handling
│   │   │   ├── failures.dart
│   │   │   └── exceptions.dart
│   │   │
│   │   ├── usecases/                  # Base use case
│   │   │   └── usecase.dart
│   │   │
│   │   ├── network/                   # Network utilities
│   │   │   └── network_info.dart
│   │   │
│   │   └── utils/                     # Utilitários gerais
│   │       ├── constants.dart
│   │       └── formatters.dart
│   │
│   ├── injection/                      # 💉 Dependency Injection
│   │   └── injection_container.dart  # GetIt configuration
│   │
│   ├── features/                       # 🎨 Features (Clean Architecture)
│   │   │
│   │   ├── auth/                      # Feature: Autenticação
│   │   │   ├── data/
│   │   │   │   ├── models/
│   │   │   │   │   └── user_model.dart
│   │   │   │   ├── datasources/
│   │   │   │   │   ├── auth_local_datasource.dart
│   │   │   │   │   └── auth_remote_datasource.dart
│   │   │   │   └── repositories/
│   │   │   │       └── auth_repository_impl.dart
│   │   │   │
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── user.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── auth_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── login.dart
│   │   │   │       ├── logout.dart
│   │   │   │       └── get_current_user.dart
│   │   │   │
│   │   │   └── presentation/
│   │   │       ├── bloc/
│   │   │       │   ├── auth_bloc.dart
│   │   │       │   ├── auth_event.dart
│   │   │       │   └── auth_state.dart
│   │   │       ├── pages/
│   │   │       │   ├── login_page.dart
│   │   │       │   └── splash_page.dart
│   │   │       └── widgets/
│   │   │           ├── login_form.dart
│   │   │           └── logo_widget.dart
│   │   │
│   │   ├── orders/                    # Feature: Pedidos
│   │   │   ├── data/
│   │   │   │   ├── models/
│   │   │   │   │   ├── order_model.dart
│   │   │   │   │   └── order_item_model.dart
│   │   │   │   ├── datasources/
│   │   │   │   │   ├── order_local_datasource.dart
│   │   │   │   │   └── order_remote_datasource.dart
│   │   │   │   └── repositories/
│   │   │   │       └── order_repository_impl.dart
│   │   │   │
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── order.dart
│   │   │   │   │   └── order_item.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── order_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── get_orders.dart
│   │   │   │       ├── create_order.dart
│   │   │   │       ├── update_order_status.dart
│   │   │   │       └── cancel_order.dart
│   │   │   │
│   │   │   └── presentation/
│   │   │       ├── bloc/
│   │   │       │   ├── order_bloc.dart
│   │   │       │   ├── order_event.dart
│   │   │       │   └── order_state.dart
│   │   │       ├── pages/
│   │   │       │   ├── order_list_page.dart
│   │   │       │   ├── order_details_page.dart
│   │   │       │   └── create_order_page.dart
│   │   │       └── widgets/
│   │   │           ├── order_card.dart
│   │   │           ├── order_item_widget.dart
│   │   │           └── order_status_badge.dart
│   │   │
│   │   ├── tables/                    # Feature: Mesas
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   │
│   │   └── products/                  # Feature: Produtos
│   │       ├── data/
│   │       ├── domain/
│   │       └── presentation/
│   │
│   └── main.dart                       # Entry point
│
├── test/                               # 🧪 Testes
│   ├── core/
│   ├── features/
│   │   ├── orders/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   └── auth/
│   └── fixtures/                      # Test fixtures
│       └── orders_fixture.json
│
├── integration_test/                   # Testes de integração
│   └── app_test.dart
│
├── assets/                             # Assets
│   ├── images/
│   ├── fonts/
│   └── translations/
│
├── pubspec.yaml                        # Dependências Flutter
├── pubspec.lock
├── analysis_options.yaml               # Dart analyzer config
└── README.md
```

### Onde Adicionar Nova Feature

Para criar uma nova feature (ex: `notifications`):

1. Criar pasta `lib/features/notifications/`
2. Criar estrutura Clean Architecture:
   ```
   notifications/
   ├── data/
   │   ├── models/
   │   ├── datasources/
   │   └── repositories/
   ├── domain/
   │   ├── entities/
   │   ├── repositories/
   │   └── usecases/
   └── presentation/
       ├── bloc/
       ├── pages/
       └── widgets/
   ```
3. Registrar dependências em `injection/injection_container.dart`

## 🗺️ Convenções de Organização

### Nível de Arquivo

#### Backend (PHP)
```
PascalCase.php               # Classes
snake_case_helper.php        # Helpers (se necessário)
```

#### Frontend (Vue.js / JavaScript)
```
PascalCase.vue               # Componentes
camelCase.js                 # JavaScript files
kebab-case.scss              # Styles
```

#### Mobile (Flutter / Dart)
```
snake_case.dart              # Todos os arquivos Dart
```

### Nível de Pasta

```
kebab-case/                  # Todas as pastas em kebab-case
feature-name/                # Features
sub-feature/                 # Sub-features
```

### Regras Gerais

1. **Um arquivo = Uma responsabilidade**
   - Um componente por arquivo
   - Uma classe por arquivo
   - Uma feature por pasta

2. **Organização por Feature**
   - Agrupar por domínio/funcionalidade
   - Não por tipo técnico

3. **Separação de Responsabilidades**
   - Camadas bem definidas
   - Dependências claras

4. **Escalabilidade**
   - Estrutura que cresce com o projeto
   - Fácil localização de código

## 📚 Referências

- [Laravel Folder Structure](https://laravel.com/docs/structure)
- [Vue.js Project Structure](https://vuejs.org/guide/scaling-up/sfc.html)
- [Flutter Clean Architecture](https://resocoder.com/flutter-clean-architecture-tdd/)
- [Electron Project Structure](https://www.electronjs.org/docs/latest/tutorial/quick-start)

---

**Última Atualização**: Dezembro 2025  
**Responsável**: Equipe de Arquitetura VSmenu  
**Revisão**: Trimestral

[⬅️ Voltar para Arquitetura](./index.md)
