---
title: Diagrama de Componentes
description: Diagramas C4 detalhados dos componentes arquiteturais do VSmenu 2.0
---

# Diagrama de Componentes Arquiteturais

Documentação detalhada dos componentes do VSmenu 2.0 usando o modelo C4 (Context, Containers, Components, Code).

## 📊 Diagrama C4 - Nível 2: Containers

Visão geral de todas as aplicações (containers) e como elas se comunicam.

```mermaid
graph TB
    subgraph "Aplicações Cliente"
        DESK[fa:fa-desktop Desktop App<br/>Electron + Vue.js + SQLite<br/>Sistema Interno Offline-First]
        WEB[fa:fa-globe Delivery Web<br/>Vue.js 3 + Vite<br/>Multi-tenant por Subdomínio]
        MOB_W[fa:fa-mobile Mobile Garçom<br/>Flutter + BLoC<br/>Gestão de Mesas]
        MOB_E[fa:fa-motorcycle Mobile Entregador<br/>Flutter + BLoC<br/>GPS + Rotas]
        SALES[fa:fa-chart-line Sales Panel<br/>Vue.js 3<br/>Dashboards + Analytics]
        LANDING[fa:fa-rocket Landing Page<br/>Nuxt 3<br/>SEO Otimizado]
    end
    
    subgraph "Backend - Google Kubernetes Engine"
        API[fa:fa-server API Central<br/>Laravel 10 + PHP 8.2<br/>Clean Architecture + DDD<br/>Port: 8000]
        WS[fa:fa-plug WebSocket Server<br/>Laravel Broadcasting<br/>Soketi/Pusher<br/>Port: 6001]
        WORKER[fa:fa-cogs Queue Workers<br/>Laravel Queue<br/>Background Processing]
    end
    
    subgraph "Data Layer - Google Cloud"
        DB[(fa:fa-database Cloud SQL MySQL<br/>Primary Database<br/>Port: 3306)]
        REDIS[(fa:fa-bolt Memorystore Redis<br/>Cache + Queue + PubSub<br/>Port: 6379)]
        STORAGE[(fa:fa-hdd Cloud Storage<br/>Assets + Uploads<br/>S3-compatible)]
    end
    
    subgraph "Infrastructure"
        LB[fa:fa-balance-scale Cloud Load Balancer<br/>HTTPS/TLS]
        CDN[fa:fa-network-wired Cloud CDN<br/>Edge Caching]
    end
    
    DESK -->|HTTPS REST<br/>JSON| LB
    WEB -->|HTTPS REST<br/>JSON| LB
    MOB_W -->|HTTPS REST<br/>JSON| LB
    MOB_E -->|HTTPS REST<br/>JSON| LB
    SALES -->|HTTPS REST<br/>JSON| LB
    LANDING -->|HTTPS REST<br/>JSON| LB
    
    WEB -.->|WebSocket<br/>wss://| WS
    DESK -.->|WebSocket<br/>wss://| WS
    MOB_W -.->|WebSocket<br/>wss://| WS
    
    LB --> API
    
    API -->|SQL Queries| DB
    API -->|Cache/Queue| REDIS
    API -->|Upload/Download| STORAGE
    API -->|Dispatch Jobs| WORKER
    
    WS -->|Pub/Sub| REDIS
    WORKER -->|Process| REDIS
    WORKER -->|Read/Write| DB
    
    CDN -->|Serve Assets| STORAGE
    
    style DESK fill:#ff9800
    style WEB fill:#2196f3
    style MOB_W fill:#4caf50
    style MOB_E fill:#4caf50
    style API fill:#e91e63
    style DB fill:#9c27b0
    style REDIS fill:#f44336
```

## 🔧 Diagrama C4 - Nível 3: Components (API Laravel)

Detalhamento interno da API Laravel seguindo Clean Architecture.

```mermaid
graph TB
    subgraph "API Laravel - Clean Architecture"
        subgraph "Presentation Layer"
            CONTROLLER[Controllers<br/>HTTP Handlers]
            MIDDLEWARE[Middleware<br/>Auth, CORS, Tenant]
            REQUEST[Form Requests<br/>Validation]
            RESOURCE[Resources<br/>Data Transformation]
        end
        
        subgraph "Application Layer"
            USECASE[Use Cases<br/>Business Logic]
            DTO[DTOs<br/>Data Transfer Objects]
            INTERFACE[Interfaces<br/>Repository Contracts]
        end
        
        subgraph "Domain Layer"
            ENTITY[Entities<br/>Business Models]
            VO[Value Objects<br/>Immutable Values]
            DOMAIN_SERVICE[Domain Services<br/>Business Rules]
            REPOSITORY_INT[Repository Interfaces]
        end
        
        subgraph "Infrastructure Layer"
            ELOQUENT[Eloquent Models<br/>ORM]
            REPOSITORY_IMPL[Repository Implementations]
            CACHE[Cache Service<br/>Redis]
            QUEUE[Queue Service<br/>Jobs]
            EXTERNAL[External APIs<br/>Payment, Maps]
        end
    end
    
    REQUEST --> MIDDLEWARE
    MIDDLEWARE --> CONTROLLER
    CONTROLLER --> USECASE
    CONTROLLER --> RESOURCE
    
    USECASE --> DTO
    USECASE --> INTERFACE
    INTERFACE --> DOMAIN_SERVICE
    DOMAIN_SERVICE --> ENTITY
    DOMAIN_SERVICE --> VO
    
    INTERFACE --> REPOSITORY_INT
    REPOSITORY_INT -.Implementation.-> REPOSITORY_IMPL
    REPOSITORY_IMPL --> ELOQUENT
    REPOSITORY_IMPL --> CACHE
    
    USECASE --> QUEUE
    QUEUE --> EXTERNAL
    
    RESOURCE --> DTO
```

### Principais Componentes da API

#### Presentation Layer
- **Controllers**: Recebem requests HTTP, delegam para use cases
- **Middleware**: Autenticação (Sanctum), Tenant Detection, CORS
- **Form Requests**: Validação de entrada
- **Resources**: Transformação de dados para JSON

#### Application Layer
- **Use Cases**: Orquestração da lógica de negócio
- **DTOs**: Transferência de dados entre camadas
- **Interfaces**: Contratos para repositories

#### Domain Layer
- **Entities**: Modelos de negócio puros (Product, Order, Table)
- **Value Objects**: Valores imutáveis (Money, Email, CPF)
- **Domain Services**: Regras de negócio complexas
- **Repository Interfaces**: Contratos de persistência

#### Infrastructure Layer
- **Eloquent Models**: ORM do Laravel
- **Repositories**: Implementação de persistência
- **Cache Service**: Redis caching
- **Queue Service**: Background jobs
- **External APIs**: Integrações externas

## 🖥️ Diagrama C4 - Nível 3: Components (Desktop App)

Detalhamento do app Desktop Electron com arquitetura offline-first.

```mermaid
graph TB
    subgraph "Electron Desktop App"
        subgraph "Main Process - Node.js"
            MAIN[Main Entry Point<br/>Electron Main]
            IPC_MAIN[IPC Handlers<br/>Inter-Process Communication]
            DB_SERVICE[Database Service<br/>SQLite Manager]
            SYNC_SERVICE[Sync Service<br/>API Synchronization]
            WINDOW[Window Manager<br/>BrowserWindow]
        end
        
        subgraph "Renderer Process - Vue.js"
            VUE_APP[Vue.js Application<br/>SPA]
            COMPONENTS[Components<br/>UI Components]
            VIEWS[Views<br/>Pages]
            STORES[Pinia Stores<br/>State Management]
            SERVICES[Services<br/>API Clients]
            IPC_RENDERER[IPC Renderer<br/>Invoke Main Process]
        end
        
        subgraph "Local Storage"
            SQLITE[(SQLite Database<br/>Local Data)]
            EVENT_QUEUE[(Event Queue<br/>Sync Events)]
        end
    end
    
    MAIN --> WINDOW
    MAIN --> IPC_MAIN
    IPC_MAIN --> DB_SERVICE
    IPC_MAIN --> SYNC_SERVICE
    
    DB_SERVICE --> SQLITE
    SYNC_SERVICE --> EVENT_QUEUE
    SYNC_SERVICE -.->|When Online| API_EXTERNAL[API Central]
    
    WINDOW --> VUE_APP
    VUE_APP --> VIEWS
    VUE_APP --> STORES
    VIEWS --> COMPONENTS
    STORES --> SERVICES
    SERVICES --> IPC_RENDERER
    IPC_RENDERER -->|ipcRenderer.invoke| IPC_MAIN
    IPC_MAIN -->|Return Data| IPC_RENDERER
```

### Principais Componentes do Desktop

#### Main Process (Node.js)
- **Main Entry**: Inicialização do Electron
- **IPC Handlers**: Processa requisições do renderer
- **Database Service**: Gerencia SQLite (CRUD, migrations)
- **Sync Service**: Sincronização bidirecional com API
- **Window Manager**: Cria e gerencia janelas

#### Renderer Process (Vue.js)
- **Vue App**: Single Page Application
- **Views**: Páginas (PDV, Mesas, Estoque, etc)
- **Components**: Componentes reutilizáveis
- **Stores (Pinia)**: State management global
- **Services**: Comunicação com Main via IPC

#### Local Storage
- **SQLite**: Dados estruturados offline
- **Event Queue**: Fila de eventos para sync

## 🌐 Diagrama C4 - Nível 3: Components (Delivery Web)

Detalhamento do frontend web multi-tenant.

```mermaid
graph TB
    subgraph "Delivery Web - Vue.js 3"
        subgraph "Core"
            ROUTER[Vue Router<br/>Navigation]
            APP[App Root<br/>Main Component]
        end
        
        subgraph "Pages/Views"
            HOME[Home<br/>Cardápio]
            CART[Cart<br/>Carrinho]
            CHECKOUT[Checkout<br/>Finalização]
            ORDER_TRACK[Order Tracking<br/>Acompanhamento]
            PROFILE[Profile<br/>Perfil do Cliente]
        end
        
        subgraph "Components"
            PRODUCT_CARD[Product Card]
            CART_ITEM[Cart Item]
            PAYMENT[Payment Form]
            ADDRESS[Address Form]
        end
        
        subgraph "State Management - Pinia"
            AUTH_STORE[Auth Store<br/>Autenticação]
            TENANT_STORE[Tenant Store<br/>Restaurante Atual]
            CART_STORE[Cart Store<br/>Carrinho]
            ORDER_STORE[Order Store<br/>Pedidos]
        end
        
        subgraph "Services"
            API_CLIENT[API Client<br/>Axios]
            WS_CLIENT[WebSocket Client<br/>Laravel Echo]
            STORAGE[Local Storage<br/>Persistence]
        end
    end
    
    ROUTER --> APP
    APP --> HOME
    APP --> CART
    APP --> CHECKOUT
    APP --> ORDER_TRACK
    APP --> PROFILE
    
    HOME --> PRODUCT_CARD
    CART --> CART_ITEM
    CHECKOUT --> PAYMENT
    CHECKOUT --> ADDRESS
    
    PRODUCT_CARD --> CART_STORE
    CART_STORE --> ORDER_STORE
    ORDER_STORE --> API_CLIENT
    
    AUTH_STORE --> API_CLIENT
    TENANT_STORE --> API_CLIENT
    
    API_CLIENT -->|HTTPS| API_EXTERNAL[API Central]
    WS_CLIENT -.->|WebSocket| WS_EXTERNAL[WebSocket Server]
    
    AUTH_STORE --> STORAGE
    CART_STORE --> STORAGE
```

### Principais Componentes do Delivery Web

#### Core
- **Vue Router**: Gerenciamento de rotas e navegação
- **App Root**: Componente raiz da aplicação

#### Pages/Views
- **Home**: Cardápio do restaurante
- **Cart**: Carrinho de compras
- **Checkout**: Finalização e pagamento
- **Order Tracking**: Acompanhamento em tempo real
- **Profile**: Perfil e histórico do cliente

#### State Management (Pinia)
- **Auth Store**: Autenticação do cliente
- **Tenant Store**: Dados do restaurante atual (multi-tenant)
- **Cart Store**: Gerenciamento do carrinho
- **Order Store**: Pedidos e histórico

#### Services
- **API Client**: Comunicação REST com API
- **WebSocket Client**: Eventos em tempo real
- **Local Storage**: Persistência local (cart, auth)

## 🚀 Diagrama de Deploy - Google Cloud Platform

Como as aplicações são deployed na infraestrutura GCP.

```mermaid
graph TB
    subgraph "Internet"
        USER[fa:fa-users Usuários]
        DNS[fa:fa-globe Cloud DNS<br/>vsmenu.io]
    end
    
    subgraph "Google Cloud Platform"
        subgraph "Global"
            CDN[fa:fa-network-wired Cloud CDN<br/>Edge Caching]
            LB[fa:fa-balance-scale Cloud Load Balancer<br/>HTTPS/TLS<br/>SSL Certificate]
        end
        
        subgraph "GKE Cluster - southamerica-east1"
            subgraph "Namespace: production"
                API_POD1[fa:fa-cube API Pod 1<br/>Laravel]
                API_POD2[fa:fa-cube API Pod 2<br/>Laravel]
                API_POD3[fa:fa-cube API Pod 3<br/>Laravel]
                WS_POD[fa:fa-cube WebSocket Pod<br/>Soketi]
                WORKER_POD1[fa:fa-cube Worker Pod 1<br/>Queue]
                WORKER_POD2[fa:fa-cube Worker Pod 2<br/>Queue]
            end
        end
        
        subgraph "Managed Services"
            CLOUD_SQL[(fa:fa-database Cloud SQL<br/>MySQL 8.0<br/>High Availability)]
            MEMORYSTORE[(fa:fa-bolt Memorystore<br/>Redis 7.0)]
            STORAGE[(fa:fa-hdd Cloud Storage<br/>Assets Bucket)]
        end
        
        subgraph "Static Hosting"
            WEB_BUCKET[fa:fa-sitemap Web Bucket<br/>Delivery Web<br/>Vue.js Build]
            SALES_BUCKET[fa:fa-chart-line Sales Bucket<br/>Sales Panel<br/>Vue.js Build]
            LANDING_BUCKET[fa:fa-rocket Landing Bucket<br/>Landing Page<br/>Nuxt Build]
        end
        
        subgraph "Monitoring & Logging"
            MONITORING[fa:fa-chart-area Cloud Monitoring<br/>Metrics + Alerts]
            LOGGING[fa:fa-file-alt Cloud Logging<br/>Centralized Logs]
        end
    end
    
    USER --> DNS
    DNS --> LB
    DNS --> CDN
    
    LB --> API_POD1
    LB --> API_POD2
    LB --> API_POD3
    LB --> WS_POD
    
    CDN --> WEB_BUCKET
    CDN --> SALES_BUCKET
    CDN --> LANDING_BUCKET
    CDN --> STORAGE
    
    API_POD1 --> CLOUD_SQL
    API_POD2 --> CLOUD_SQL
    API_POD3 --> CLOUD_SQL
    
    API_POD1 --> MEMORYSTORE
    API_POD2 --> MEMORYSTORE
    API_POD3 --> MEMORYSTORE
    WS_POD --> MEMORYSTORE
    
    API_POD1 --> STORAGE
    API_POD2 --> STORAGE
    API_POD3 --> STORAGE
    
    WORKER_POD1 --> MEMORYSTORE
    WORKER_POD2 --> MEMORYSTORE
    WORKER_POD1 --> CLOUD_SQL
    WORKER_POD2 --> CLOUD_SQL
    
    API_POD1 --> MONITORING
    API_POD1 --> LOGGING
    WORKER_POD1 --> MONITORING
```

### Infraestrutura GCP

#### Compute
- **GKE Cluster**: Kubernetes Engine para API e Workers
- **Pods**: Containers com auto-scaling
- **Load Balancer**: Distribuição de carga HTTPS

#### Storage
- **Cloud SQL**: MySQL gerenciado com HA
- **Memorystore**: Redis gerenciado
- **Cloud Storage**: Object storage para assets

#### Static Hosting
- **Buckets**: Hospedagem de SPAs Vue.js/Nuxt
- **Cloud CDN**: Edge caching global

#### Observability
- **Cloud Monitoring**: Métricas e alertas
- **Cloud Logging**: Logs centralizados

## 📊 Diagrama de Fluxo de Dados

Como os dados fluem entre os componentes.

```mermaid
sequenceDiagram
    participant Cliente
    participant Web as Delivery Web
    participant API as API Central
    participant DB as Cloud SQL
    participant Redis
    participant WS as WebSocket
    participant Desktop
    
    Note over Cliente,Desktop: Fluxo de Criação de Pedido
    
    Cliente->>Web: Adiciona produtos ao carrinho
    Web->>Web: Armazena no Local Storage
    Cliente->>Web: Finaliza checkout
    Web->>API: POST /api/v1/orders (JSON)
    
    API->>API: Valida tenant (middleware)
    API->>API: Valida dados (Form Request)
    API->>API: Use Case: CreateOrder
    API->>DB: INSERT order, order_items
    DB-->>API: Order ID
    
    API->>Redis: Publica evento: order.created
    Redis-->>WS: Notifica via Pub/Sub
    WS-->>Desktop: Envia via WebSocket
    Desktop->>Desktop: Mostra notificação
    Desktop->>Desktop: Salva no SQLite
    
    API-->>Web: Response: Order criado
    Web->>WS: Conecta via WebSocket
    WS-->>Web: Status updates em tempo real
    
    Note over Desktop,API: Sincronização Desktop (Offline → Online)
    
    Desktop->>Desktop: Cria pedido offline
    Desktop->>Desktop: Salva no SQLite
    Desktop->>Desktop: Adiciona à Event Queue
    
    Desktop->>API: Envia events (quando online)
    API->>API: Processa events
    API->>DB: Persiste dados
    API->>Redis: Publica eventos
    API-->>Desktop: Confirmação + conflicts
    Desktop->>Desktop: Resolve conflicts
```

## 🔐 Diagrama de Segurança

Camadas de segurança no sistema.

```mermaid
graph TB
    subgraph "Segurança em Camadas"
        subgraph "Layer 1: Network Security"
            FIREWALL[Cloud Firewall<br/>Regras de Acesso]
            VPC[VPC Network<br/>Isolamento]
            TLS[TLS 1.3<br/>Criptografia em Trânsito]
        end
        
        subgraph "Layer 2: Application Security"
            AUTH[Laravel Sanctum<br/>API Tokens]
            CORS[CORS Policy<br/>Origin Control]
            RATE[Rate Limiting<br/>Throttling]
            VALIDATION[Input Validation<br/>Form Requests]
        end
        
        subgraph "Layer 3: Data Security"
            ENCRYPTION[Data Encryption<br/>At Rest]
            TENANT_ISO[Tenant Isolation<br/>Multi-tenancy]
            SQL_PREVENT[SQL Injection Prevention<br/>Eloquent ORM]
        end
        
        subgraph "Layer 4: Access Control"
            RBAC[Roles & Permissions<br/>RBAC]
            POLICIES[Laravel Policies<br/>Resource Authorization]
            IAM[GCP IAM<br/>Infrastructure Access]
        end
    end
    
    FIREWALL --> VPC
    VPC --> TLS
    TLS --> AUTH
    AUTH --> CORS
    CORS --> RATE
    RATE --> VALIDATION
    VALIDATION --> ENCRYPTION
    ENCRYPTION --> TENANT_ISO
    TENANT_ISO --> SQL_PREVENT
    SQL_PREVENT --> RBAC
    RBAC --> POLICIES
    POLICIES --> IAM
```

## 📖 Legenda e Convenções

### Cores nos Diagramas

- 🟠 **Laranja**: Aplicações cliente (Desktop, Mobile)
- 🔵 **Azul**: Frontend Web
- 🟢 **Verde**: Mobile Apps (Flutter)
- 🔴 **Vermelho**: Backend/API
- 🟣 **Roxo**: Databases
- ⚫ **Cinza**: Infraestrutura

### Tipos de Conexão

- **Linha Sólida (→)**: Comunicação síncrona (HTTP REST)
- **Linha Tracejada (-.->)**: Comunicação assíncrona (WebSocket, Events)
- **Linha Grossa (==>)**: Fluxo de dados principal

### Ícones

- 🖥️ Desktop Application
- 🌐 Web Application
- 📱 Mobile Application
- 🔌 API/Service
- 💾 Database
- ⚡ Cache/Queue
- 📦 Storage

## 🔗 Documentação Relacionada

- [Overview da Arquitetura](./index.md) - Visão geral do sistema
- [Decisões Arquiteturais (ADRs)](./decisions/) - Por que escolhemos cada tecnologia
- [Fluxo de Dados](./data-flow.md) - Detalhes de como os dados fluem
- [Comunicação entre Serviços](./service-communication.md) - Protocolos e padrões

## 📚 Referências

- [C4 Model Documentation](https://c4model.com/)
- [Mermaid Diagram Syntax](https://mermaid.js.org/)
- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Google Cloud Architecture](https://cloud.google.com/architecture)

---

[⬅️ Voltar para Overview da Arquitetura](./index.md)

