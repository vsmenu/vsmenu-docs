---
title: Guia de Desenvolvimento - vsmenu-api
description: Guia completo para desenvolvimento do backend Laravel do VSmenu 2.0
---

# Guia de Desenvolvimento - vsmenu-api

Guia completo e prático para desenvolver no backend Laravel da aplicação VSmenu 2.0. Este guia cobre desde o setup inicial até deployment em produção.

## 🎯 Visão Geral

O **vsmenu-api** é o backend principal do sistema VSmenu 2.0, responsável por:

- **API RESTful**: Endpoints para todas as aplicações cliente
- **Autenticação**: Gerenciamento de usuários e permissões
- **Lógica de Negócio**: Pedidos, produtos, mesas, delivery
- **Broadcasting**: Eventos em tempo real via WebSocket
- **Integrações**: Pagamentos, delivery externo, etc.

### Stack Tecnológica

| Tecnologia | Versão | Propósito |
|-----------|--------|-----------|
| **PHP** | 8.2+ | Linguagem principal |
| **Laravel** | 10+ | Framework web |
| **MySQL** | 8.0+ | Banco de dados principal |
| **Redis** | 7+ | Cache, Queue, Pub/Sub |
| **Sanctum** | 3.2+ | Autenticação API |
| **PHPUnit** | 10+ | Testes |

### Arquitetura

O projeto segue **Clean Architecture** com Domain-Driven Design (DDD):

```
app/
├── Domain/                 # 🏛️ Lógica de negócio pura
├── Application/           # 🎯 Casos de uso
├── Infrastructure/        # 🔧 Implementações técnicas
├── Presentation/          # 🎨 Controllers e API
└── Support/              # 🛠️ Helpers e utilitários
```

::: tip Benefícios
- **Testabilidade**: Lógica de negócio isolada
- **Manutenibilidade**: Separação clara de responsabilidades
- **Escalabilidade**: Fácil adicionar features
- **Flexibilidade**: Trocar implementações sem afetar negócio
:::

## 📋 Pré-requisitos

### Ferramentas Necessárias

#### Obrigatórias

- **PHP** >= 8.2 ([Download](https://www.php.net/downloads))
- **Composer** >= 2.6 ([Download](https://getcomposer.org/))
- **MySQL** >= 8.0 ([Download](https://dev.mysql.com/downloads/))
- **Redis** >= 7.0 ([Download](https://redis.io/download))
- **Git** >= 2.40 ([Download](https://git-scm.com/))

#### Recomendadas

- **Docker** >= 24.0 ([Download](https://www.docker.com/))
- **Docker Compose** >= 2.20
- **Postman** ou **Insomnia** (testar API)

### Extensões PHP Necessárias

```bash
# Verificar extensões instaladas
php -m

# Extensões obrigatórias:
- bcmath
- ctype
- fileinfo
- json
- mbstring
- openssl
- pdo
- pdo_mysql
- tokenizer
- xml
- redis (pecl)
```

### Verificar Instalação

```bash
# PHP
php -v
# PHP 8.2.x ou superior

# Composer
composer --version
# Composer version 2.6.x

# MySQL
mysql --version
# mysql  Ver 8.0.x

# Redis
redis-cli --version
# redis-cli 7.x.x

# Git
git --version
# git version 2.4x.x
```

## 🚀 Setup do Ambiente

### 1. Clonar o Repositório

```bash
# Clone o repositório
git clone git@github.com:vsmenu/vsmenu-api.git
cd vsmenu-api

# Verificar branch atual
git branch
# * main
```

### 2. Instalar Dependências

```bash
# Instalar dependências PHP
composer install

# Se for ambiente de desenvolvimento
composer install --dev
```

::: warning Atenção
Se encontrar erros de memória, aumente o limite do PHP:
```bash
php -d memory_limit=512M $(which composer) install
```
:::

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Gerar chave da aplicação
php artisan key:generate
```

Edite o arquivo `.env`:

```ini
# Aplicação
APP_NAME="VSmenu API"
APP_ENV=local
APP_KEY=base64:gerado_automaticamente
APP_DEBUG=true
APP_URL=http://localhost:8000

# Banco de Dados
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vsmenu
DB_USERNAME=root
DB_PASSWORD=senha_segura

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Cache
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Broadcasting (opcional para dev)
BROADCAST_DRIVER=log

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:8080
```

### 4. Criar Banco de Dados

```bash
# Conectar ao MySQL
mysql -u root -p

# Criar banco de dados
CREATE DATABASE vsmenu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 5. Executar Migrations

```bash
# Rodar todas as migrations
php artisan migrate

# Seed com dados iniciais (opcional)
php artisan db:seed

# Ou tudo junto (reset + migrate + seed)
php artisan migrate:fresh --seed
```

### 6. Iniciar Servidor de Desenvolvimento

```bash
# Servidor Laravel
php artisan serve
# Server started on http://127.0.0.1:8000

# Em outro terminal, Queue worker
php artisan queue:work

# Em outro terminal, Redis (se não estiver rodando como serviço)
redis-server
```

### 7. Testar API

```bash
# Verificar se API está rodando
curl http://localhost:8000/api/health

# Resposta esperada:
# {"status":"ok","timestamp":"2024-11-15T10:30:00Z"}
```

## 🐳 Setup com Docker (Alternativa)

Se preferir usar Docker:

```bash
# Subir containers
docker-compose up -d

# Instalar dependências
docker-compose exec app composer install

# Gerar chave
docker-compose exec app php artisan key:generate

# Rodar migrations
docker-compose exec app php artisan migrate --seed

# Ver logs
docker-compose logs -f app
```

O arquivo `docker-compose.yml` inclui:
- PHP 8.2 + Apache
- MySQL 8.0
- Redis 7
- phpMyAdmin (opcional)

## 📁 Estrutura do Projeto

### Visão Geral

```
vsmenu-api/
├── app/
│   ├── Domain/                 # Lógica de negócio pura
│   ├── Application/           # Casos de uso
│   ├── Infrastructure/        # Implementações técnicas
│   ├── Presentation/          # Controllers e API
│   └── Support/              # Helpers
│
├── bootstrap/                # Bootstrap da aplicação
├── config/                   # Arquivos de configuração
├── database/
│   ├── migrations/          # Migrations do banco
│   ├── seeders/             # Seeders
│   └── factories/           # Factories para testes
│
├── public/                   # Arquivos públicos
├── resources/               # Views e traduções
├── routes/
│   ├── api.php             # Rotas da API
│   ├── channels.php        # Broadcasting channels
│   └── console.php         # Comandos console
│
├── storage/                 # Storage da aplicação
├── tests/
│   ├── Unit/               # Testes unitários
│   ├── Feature/            # Testes de feature
│   └── Integration/        # Testes de integração
│
├── .env.example            # Exemplo de configuração
├── artisan                 # CLI do Laravel
├── composer.json           # Dependências PHP
└── phpunit.xml            # Configuração PHPUnit
```

### Domain Layer (`app/Domain/`)

**Responsabilidade**: Lógica de negócio pura, sem dependências externas.

```
Domain/
├── Entities/              # Entidades de domínio
│   ├── Order/
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   └── OrderStatus.php (enum)
│   ├── Product/
│   │   └── Product.php
│   └── Customer/
│       └── Customer.php
│
├── ValueObjects/         # Objetos de valor imutáveis
│   ├── Money.php
│   ├── Email.php
│   ├── CPF.php
│   └── Address.php
│
├── Repositories/         # Interfaces de repositórios
│   ├── OrderRepositoryInterface.php
│   └── ProductRepositoryInterface.php
│
├── Services/            # Serviços de domínio
│   ├── OrderDomainService.php
│   └── PricingService.php
│
└── Events/              # Eventos de domínio
    ├── OrderCreated.php
    └── OrderStatusChanged.php
```

::: info Regra
Domain Layer **NUNCA** deve depender de outras camadas. Ele é o núcleo do sistema.
:::

### Application Layer (`app/Application/`)

**Responsabilidade**: Casos de uso e orquestração da lógica de negócio.

```
Application/
├── UseCases/
│   ├── Orders/
│   │   ├── CreateOrderUseCase.php
│   │   ├── UpdateOrderStatusUseCase.php
│   │   ├── CancelOrderUseCase.php
│   │   └── GetOrderUseCase.php
│   ├── Products/
│   └── Customers/
│
├── DTOs/                # Data Transfer Objects
│   ├── CreateOrderDTO.php
│   ├── UpdateOrderDTO.php
│   └── OrderFilterDTO.php
│
└── Validators/          # Validadores de negócio
    └── OrderBusinessValidator.php
```

### Infrastructure Layer (`app/Infrastructure/`)

**Responsabilidade**: Implementações técnicas (banco, cache, APIs externas).

```
Infrastructure/
├── Persistence/
│   ├── Models/              # Eloquent Models
│   │   ├── Order.php
│   │   ├── Product.php
│   │   └── Customer.php
│   │
│   └── Repositories/        # Implementações
│       ├── EloquentOrderRepository.php
│       └── EloquentProductRepository.php
│
├── Cache/
│   └── RedisCache.php
│
├── Queue/
│   └── Jobs/
│       ├── SendOrderNotification.php
│       └── ProcessPayment.php
│
├── External/               # APIs externas
│   ├── Payment/
│   │   └── StripePaymentGateway.php
│   └── Delivery/
│       └── iFoodIntegration.php
│
└── Broadcasting/          # WebSocket
    └── OrderChannel.php
```

### Presentation Layer (`app/Presentation/`)

**Responsabilidade**: Interface HTTP (Controllers, Requests, Resources).

```
Presentation/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── V1/
│   │           ├── OrderController.php
│   │           ├── ProductController.php
│   │           ├── CustomerController.php
│   │           └── AuthController.php
│   │
│   ├── Middleware/
│   │   ├── TenantMiddleware.php
│   │   └── RateLimitMiddleware.php
│   │
│   ├── Requests/          # Form Requests (validação)
│   │   └── Orders/
│   │       ├── CreateOrderRequest.php
│   │       └── UpdateOrderRequest.php
│   │
│   └── Resources/         # API Resources
│       ├── OrderResource.php
│       └── ProductResource.php
│
└── Console/
    └── Commands/
        └── SyncInventoryCommand.php
```

## 🛠️ Como Criar Features

### Exemplo Completo: Feature de Pedidos

Vamos criar toda a estrutura para gerenciar pedidos passo a passo.

### Passo 1: Criar Migration

```bash
php artisan make:migration create_orders_table
```

Edite o arquivo em `database/migrations/`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained();
            $table->foreignId('table_id')->nullable()->constrained();
            $table->enum('status', ['pending', 'preparing', 'ready', 'delivered', 'cancelled'])
                  ->default('pending');
            $table->decimal('total', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('created_at');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained();
            $table->integer('quantity');
            $table->decimal('price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
```

Executar migration:

```bash
php artisan migrate
```

### Passo 2: Criar Domain Entity

Crie `app/Domain/Entities/Order/Order.php`:

```php
<?php

namespace App\Domain\Entities\Order;

use DateTime;

class Order
{
    public function __construct(
        public readonly int $id,
        public readonly int $customerId,
        public readonly ?int $tableId,
        public string $status,
        public float $total,
        public ?string $notes,
        public readonly DateTime $createdAt,
        public DateTime $updatedAt,
        public array $items = []
    ) {}

    public static function create(
        int $customerId,
        ?int $tableId,
        array $items,
        ?string $notes = null
    ): self {
        return new self(
            id: 0, // Será setado pelo repository
            customerId: $customerId,
            tableId: $tableId,
            status: OrderStatus::Pending->value,
            total: self::calculateTotal($items),
            notes: $notes,
            createdAt: new DateTime(),
            updatedAt: new DateTime(),
            items: $items
        );
    }

    public function updateStatus(string $newStatus): void
    {
        // Validação de transição de status
        if (!OrderStatus::canTransition($this->status, $newStatus)) {
            throw new \DomainException(
                "Cannot transition from {$this->status} to {$newStatus}"
            );
        }

        $this->status = $newStatus;
        $this->updatedAt = new DateTime();
    }

    public function cancel(): void
    {
        if ($this->status === OrderStatus::Delivered->value) {
            throw new \DomainException('Cannot cancel delivered order');
        }

        $this->status = OrderStatus::Cancelled->value;
        $this->updatedAt = new DateTime();
    }

    private static function calculateTotal(array $items): float
    {
        return array_reduce(
            $items,
            fn($total, $item) => $total + ($item['price'] * $item['quantity']),
            0.0
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customerId,
            'table_id' => $this->tableId,
            'status' => $this->status,
            'total' => $this->total,
            'notes' => $this->notes,
            'items' => $this->items,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
```

Crie `app/Domain/Entities/Order/OrderStatus.php`:

```php
<?php

namespace App\Domain\Entities\Order;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Preparing = 'preparing';
    case Ready = 'ready';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    public static function canTransition(string $from, string $to): bool
    {
        $allowedTransitions = [
            'pending' => ['preparing', 'cancelled'],
            'preparing' => ['ready', 'cancelled'],
            'ready' => ['delivered', 'cancelled'],
            'delivered' => [],
            'cancelled' => [],
        ];

        return in_array($to, $allowedTransitions[$from] ?? []);
    }
}
```

### Passo 3: Criar Repository Interface

Crie `app/Domain/Repositories/OrderRepositoryInterface.php`:

```php
<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Order\Order;
use Illuminate\Support\Collection;

interface OrderRepositoryInterface
{
    public function find(int $id): ?Order;
    
    public function findByCustomer(int $customerId): Collection;
    
    public function findByStatus(string $status): Collection;
    
    public function create(Order $order): Order;
    
    public function update(Order $order): Order;
    
    public function delete(int $id): bool;
}
```

### Passo 4: Criar Eloquent Model

Crie `app/Infrastructure/Persistence/Models/Order.php`:

```php
<?php

namespace App\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'table_id',
        'status',
        'total',
        'notes',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }
}
```

### Passo 5: Criar Repository Implementation

Crie `app/Infrastructure/Persistence/Repositories/EloquentOrderRepository.php`:

```php
<?php

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Entities\Order\Order as OrderEntity;
use App\Domain\Repositories\OrderRepositoryInterface;
use App\Infrastructure\Persistence\Models\Order as OrderModel;
use Illuminate\Support\Collection;

class EloquentOrderRepository implements OrderRepositoryInterface
{
    public function find(int $id): ?OrderEntity
    {
        $orderModel = OrderModel::with(['items', 'customer', 'table'])
            ->find($id);

        return $orderModel ? $this->toDomainEntity($orderModel) : null;
    }

    public function findByCustomer(int $customerId): Collection
    {
        return OrderModel::with(['items', 'customer', 'table'])
            ->where('customer_id', $customerId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($model) => $this->toDomainEntity($model));
    }

    public function findByStatus(string $status): Collection
    {
        return OrderModel::with(['items', 'customer', 'table'])
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($model) => $this->toDomainEntity($model));
    }

    public function create(OrderEntity $order): OrderEntity
    {
        $orderModel = OrderModel::create([
            'customer_id' => $order->customerId,
            'table_id' => $order->tableId,
            'status' => $order->status,
            'total' => $order->total,
            'notes' => $order->notes,
        ]);

        // Criar items
        foreach ($order->items as $item) {
            $orderModel->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'subtotal' => $item['price'] * $item['quantity'],
                'notes' => $item['notes'] ?? null,
            ]);
        }

        return $this->find($orderModel->id);
    }

    public function update(OrderEntity $order): OrderEntity
    {
        $orderModel = OrderModel::findOrFail($order->id);
        
        $orderModel->update([
            'status' => $order->status,
            'total' => $order->total,
            'notes' => $order->notes,
        ]);

        return $this->find($order->id);
    }

    public function delete(int $id): bool
    {
        return OrderModel::findOrFail($id)->delete();
    }

    private function toDomainEntity(OrderModel $model): OrderEntity
    {
        return new OrderEntity(
            id: $model->id,
            customerId: $model->customer_id,
            tableId: $model->table_id,
            status: $model->status,
            total: (float) $model->total,
            notes: $model->notes,
            createdAt: $model->created_at,
            updatedAt: $model->updated_at,
            items: $model->items->map(fn($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'price' => (float) $item->price,
                'subtotal' => (float) $item->subtotal,
                'notes' => $item->notes,
            ])->toArray()
        );
    }
}
```

### Passo 6: Criar DTO

Crie `app/Application/DTOs/CreateOrderDTO.php`:

```php
<?php

namespace App\Application\DTOs;

class CreateOrderDTO
{
    public function __construct(
        public readonly int $customerId,
        public readonly ?int $tableId,
        public readonly array $items,
        public readonly ?string $notes
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            customerId: $data['customer_id'],
            tableId: $data['table_id'] ?? null,
            items: $data['items'],
            notes: $data['notes'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'customer_id' => $this->customerId,
            'table_id' => $this->tableId,
            'items' => $this->items,
            'notes' => $this->notes,
        ];
    }
}
```

### Passo 7: Criar Use Case

Crie `app/Application/UseCases/Orders/CreateOrderUseCase.php`:

```php
<?php

namespace App\Application\UseCases\Orders;

use App\Application\DTOs\CreateOrderDTO;
use App\Domain\Entities\Order\Order;
use App\Domain\Repositories\OrderRepositoryInterface;
use App\Domain\Repositories\ProductRepositoryInterface;
use App\Domain\Events\OrderCreated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

class CreateOrderUseCase
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly ProductRepositoryInterface $productRepository
    ) {}

    public function execute(CreateOrderDTO $dto): Order
    {
        return DB::transaction(function () use ($dto) {
            // Validações de negócio
            $this->validateBusinessRules($dto);
            
            // Criar entidade de domínio
            $order = Order::create(
                customerId: $dto->customerId,
                tableId: $dto->tableId,
                items: $dto->items,
                notes: $dto->notes
            );
            
            // Persistir
            $order = $this->orderRepository->create($order);
            
            // Disparar evento
            Event::dispatch(new OrderCreated($order));
            
            return $order;
        });
    }

    private function validateBusinessRules(CreateOrderDTO $dto): void
    {
        // Validar limite de items
        if (count($dto->items) > 50) {
            throw new \DomainException('Maximum 50 items per order');
        }

        // Validar se produtos existem e têm estoque
        foreach ($dto->items as $item) {
            $product = $this->productRepository->find($item['product_id']);
            
            if (!$product) {
                throw new \DomainException(
                    "Product {$item['product_id']} not found"
                );
            }

            if ($product->stock < $item['quantity']) {
                throw new \DomainException(
                    "Insufficient stock for product {$product->name}"
                );
            }
        }
    }
}
```

### Passo 8: Criar Form Request

Crie `app/Presentation/Http/Requests/Orders/CreateOrderRequest.php`:

```php
<?php

namespace App\Presentation\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|integer|exists:customers,id',
            'table_id' => 'nullable|integer|exists:tables,id',
            'items' => 'required|array|min:1|max:50',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1|max:99',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'O pedido deve conter pelo menos um item.',
            'items.min' => 'O pedido deve conter pelo menos um item.',
            'items.max' => 'O pedido pode ter no máximo 50 itens.',
            'items.*.product_id.required' => 'Cada item deve ter um produto.',
            'items.*.product_id.exists' => 'Produto não encontrado.',
            'items.*.quantity.min' => 'A quantidade mínima é 1.',
            'items.*.quantity.max' => 'A quantidade máxima é 99.',
        ];
    }
}
```

### Passo 9: Criar API Resource

Crie `app/Presentation/Http/Resources/OrderResource.php`:

```php
<?php

namespace App\Presentation\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'table' => new TableResource($this->whenLoaded('table')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'status' => $this->status,
            'total' => number_format($this->total, 2, '.', ''),
            'notes' => $this->notes,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
```

### Passo 10: Criar Controller

Crie `app/Presentation/Http/Controllers/Api/V1/OrderController.php`:

```php
<?php

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\UseCases\Orders\CreateOrderUseCase;
use App\Application\UseCases\Orders\GetOrderUseCase;
use App\Application\UseCases\Orders\UpdateOrderStatusUseCase;
use App\Application\DTOs\CreateOrderDTO;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Requests\Orders\CreateOrderRequest;
use App\Presentation\Http\Resources\OrderResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly CreateOrderUseCase $createOrderUseCase,
        private readonly GetOrderUseCase $getOrderUseCase,
        private readonly UpdateOrderStatusUseCase $updateOrderStatusUseCase
    ) {}

    /**
     * Display a listing of orders.
     */
    public function index(): JsonResponse
    {
        // TODO: Implementar listagem com filtros
        return response()->json([
            'data' => []
        ]);
    }

    /**
     * Store a newly created order.
     */
    public function store(CreateOrderRequest $request): JsonResponse
    {
        try {
            $dto = CreateOrderDTO::fromRequest($request->validated());
            $order = $this->createOrderUseCase->execute($dto);
            
            return response()->json(
                new OrderResource($order),
                Response::HTTP_CREATED
            );
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating order',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified order.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $order = $this->getOrderUseCase->execute($id);
            
            if (!$order) {
                return response()->json([
                    'message' => 'Order not found'
                ], Response::HTTP_NOT_FOUND);
            }
            
            return response()->json(new OrderResource($order));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving order',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update order status.
     */
    public function updateStatus(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:pending,preparing,ready,delivered,cancelled'
        ]);

        try {
            $order = $this->updateOrderStatusUseCase->execute(
                $id,
                $request->input('status')
            );
            
            return response()->json(new OrderResource($order));
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating order status',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
```

### Passo 11: Registrar Rotas

Edite `routes/api.php`:

```php
<?php

use App\Presentation\Http\Controllers\Api\V1\OrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Orders
    Route::apiResource('orders', OrderController::class);
    Route::patch('orders/{id}/status', [OrderController::class, 'updateStatus']);
});
```

### Passo 12: Registrar Bindings

Edite `app/Providers/AppServiceProvider.php`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domain\Repositories\OrderRepositoryInterface;
use App\Infrastructure\Persistence\Repositories\EloquentOrderRepository;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind repository interfaces
        $this->app->bind(
            OrderRepositoryInterface::class,
            EloquentOrderRepository::class
        );
    }

    public function boot(): void
    {
        //
    }
}
```

### Passo 13: Testar Endpoint

```bash
# Criar um pedido
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-token-aqui" \
  -d '{
    "customer_id": 1,
    "table_id": 5,
    "items": [
      {
        "product_id": 10,
        "quantity": 2,
        "price": 25.50,
        "notes": "Sem cebola"
      },
      {
        "product_id": 11,
        "quantity": 1,
        "price": 15.00
      }
    ],
    "notes": "Entregar rápido"
  }'

# Buscar um pedido
curl http://localhost:8000/api/v1/orders/1 \
  -H "Authorization: Bearer seu-token-aqui"

# Atualizar status
curl -X PATCH http://localhost:8000/api/v1/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-token-aqui" \
  -d '{"status": "preparing"}'
```

::: tip Sucesso!
Você acabou de criar uma feature completa seguindo Clean Architecture! 🎉

Próximos passos:
- Adicionar testes unitários
- Adicionar testes de feature
- Implementar cache
- Adicionar eventos de broadcasting
:::

## 🧪 Testes

### Estrutura de Testes

```
tests/
├── Unit/                     # Testes unitários (lógica isolada)
│   ├── Domain/
│   │   ├── Entities/
│   │   │   └── OrderTest.php
│   │   └── Services/
│   │       └── PricingServiceTest.php
│   └── Application/
│       └── UseCases/
│           └── CreateOrderUseCaseTest.php
│
├── Feature/                  # Testes de feature (endpoints)
│   ├── OrdersTest.php
│   ├── ProductsTest.php
│   └── AuthTest.php
│
├── Integration/             # Testes de integração
│   ├── Database/
│   ├── Cache/
│   └── Queue/
│
└── TestCase.php            # Base test case
```

### Testes Unitários

#### Testar Entity

Crie `tests/Unit/Domain/Entities/OrderTest.php`:

```php
<?php

namespace Tests\Unit\Domain\Entities;

use App\Domain\Entities\Order\Order;
use App\Domain\Entities\Order\OrderStatus;
use PHPUnit\Framework\TestCase;

class OrderTest extends TestCase
{
    public function test_can_create_order(): void
    {
        $order = Order::create(
            customerId: 1,
            tableId: 5,
            items: [
                ['product_id' => 10, 'quantity' => 2, 'price' => 25.50],
                ['product_id' => 11, 'quantity' => 1, 'price' => 15.00],
            ],
            notes: 'Test order'
        );

        $this->assertEquals(1, $order->customerId);
        $this->assertEquals(5, $order->tableId);
        $this->assertEquals(OrderStatus::Pending->value, $order->status);
        $this->assertEquals(66.00, $order->total); // (2 * 25.50) + 15.00
        $this->assertEquals('Test order', $order->notes);
        $this->assertCount(2, $order->items);
    }

    public function test_can_update_status(): void
    {
        $order = Order::create(
            customerId: 1,
            tableId: 5,
            items: [['product_id' => 10, 'quantity' => 1, 'price' => 10.00]],
        );

        $order->updateStatus(OrderStatus::Preparing->value);

        $this->assertEquals(OrderStatus::Preparing->value, $order->status);
    }

    public function test_cannot_transition_to_invalid_status(): void
    {
        $this->expectException(\DomainException::class);

        $order = Order::create(
            customerId: 1,
            tableId: 5,
            items: [['product_id' => 10, 'quantity' => 1, 'price' => 10.00]],
        );

        // Tentar ir de pending direto para delivered (não permitido)
        $order->updateStatus(OrderStatus::Delivered->value);
    }

    public function test_cannot_cancel_delivered_order(): void
    {
        $this->expectException(\DomainException::class);

        $order = Order::create(
            customerId: 1,
            tableId: 5,
            items: [['product_id' => 10, 'quantity' => 1, 'price' => 10.00]],
        );

        // Simular ordem entregue
        $order->updateStatus(OrderStatus::Preparing->value);
        $order->updateStatus(OrderStatus::Ready->value);
        $order->updateStatus(OrderStatus::Delivered->value);

        // Tentar cancelar
        $order->cancel();
    }
}
```

Rodar testes:

```bash
# Rodar todos os testes
php artisan test

# Rodar testes específicos
php artisan test --filter OrderTest

# Com coverage
php artisan test --coverage
```

### Testes de Feature

Crie `tests/Feature/OrdersTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Infrastructure\Persistence\Models\Customer;
use App\Infrastructure\Persistence\Models\Product;
use App\Infrastructure\Persistence\Models\Table;
use App\Infrastructure\Persistence\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrdersTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Customer $customer;
    private Product $product1;
    private Product $product2;
    private Table $table;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup dados de teste
        $this->user = User::factory()->create();
        $this->customer = Customer::factory()->create();
        $this->product1 = Product::factory()->create(['price' => 25.50]);
        $this->product2 = Product::factory()->create(['price' => 15.00]);
        $this->table = Table::factory()->create();
    }

    public function test_can_create_order(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/orders', [
            'customer_id' => $this->customer->id,
            'table_id' => $this->table->id,
            'items' => [
                [
                    'product_id' => $this->product1->id,
                    'quantity' => 2,
                    'price' => 25.50,
                ],
                [
                    'product_id' => $this->product2->id,
                    'quantity' => 1,
                    'price' => 15.00,
                ],
            ],
            'notes' => 'Test order'
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'id',
                     'customer',
                     'table',
                     'items',
                     'status',
                     'total',
                     'notes',
                     'created_at',
                     'updated_at',
                 ])
                 ->assertJson([
                     'status' => 'pending',
                     'total' => '66.00',
                     'notes' => 'Test order',
                 ]);

        $this->assertDatabaseHas('orders', [
            'customer_id' => $this->customer->id,
            'table_id' => $this->table->id,
            'status' => 'pending',
            'total' => 66.00,
        ]);

        $this->assertDatabaseCount('order_items', 2);
    }

    public function test_cannot_create_order_without_items(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/orders', [
            'customer_id' => $this->customer->id,
            'items' => [],
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['items']);
    }

    public function test_cannot_create_order_with_invalid_product(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/orders', [
            'customer_id' => $this->customer->id,
            'items' => [
                [
                    'product_id' => 999999, // ID inexistente
                    'quantity' => 1,
                    'price' => 10.00,
                ],
            ],
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['items.0.product_id']);
    }

    public function test_can_get_order(): void
    {
        Sanctum::actingAs($this->user);

        // Criar pedido
        $createResponse = $this->postJson('/api/v1/orders', [
            'customer_id' => $this->customer->id,
            'items' => [
                [
                    'product_id' => $this->product1->id,
                    'quantity' => 1,
                    'price' => 25.50,
                ],
            ],
        ]);

        $orderId = $createResponse->json('id');

        // Buscar pedido
        $response = $this->getJson("/api/v1/orders/{$orderId}");

        $response->assertStatus(200)
                 ->assertJson([
                     'id' => $orderId,
                     'status' => 'pending',
                 ]);
    }

    public function test_can_update_order_status(): void
    {
        Sanctum::actingAs($this->user);

        // Criar pedido
        $createResponse = $this->postJson('/api/v1/orders', [
            'customer_id' => $this->customer->id,
            'items' => [
                [
                    'product_id' => $this->product1->id,
                    'quantity' => 1,
                    'price' => 25.50,
                ],
            ],
        ]);

        $orderId = $createResponse->json('id');

        // Atualizar status
        $response = $this->patchJson("/api/v1/orders/{$orderId}/status", [
            'status' => 'preparing'
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'preparing',
                 ]);

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'status' => 'preparing',
        ]);
    }

    public function test_cannot_access_orders_without_authentication(): void
    {
        $response = $this->getJson('/api/v1/orders');

        $response->assertStatus(401);
    }
}
```

### Rodar Testes

```bash
# Todos os testes
php artisan test

# Apenas testes unitários
php artisan test --testsuite=Unit

# Apenas testes de feature
php artisan test --testsuite=Feature

# Testes específicos
php artisan test --filter OrdersTest

# Com coverage (requer Xdebug)
php artisan test --coverage

# Com relatório HTML
php artisan test --coverage-html coverage
```

### Factories para Testes

Crie `database/factories/OrderFactory.php`:

```php
<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Models\Customer;
use App\Infrastructure\Persistence\Models\Order;
use App\Infrastructure\Persistence\Models\Table;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'table_id' => Table::factory(),
            'status' => 'pending',
            'total' => $this->faker->randomFloat(2, 10, 500),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }

    public function pending(): self
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function preparing(): self
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'preparing',
        ]);
    }

    public function delivered(): self
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'delivered',
        ]);
    }
}
```

Usar factory nos testes:

```php
// Criar um pedido
$order = Order::factory()->create();

// Criar pedido com status específico
$order = Order::factory()->preparing()->create();

// Criar múltiplos pedidos
$orders = Order::factory()->count(10)->create();

// Criar com relacionamentos
$order = Order::factory()
    ->for(Customer::factory())
    ->has(OrderItem::factory()->count(3), 'items')
    ->create();
```

## 🐛 Debugging

### Laravel Debugbar

Instalar Laravel Debugbar para desenvolvimento:

```bash
composer require barryvdh/laravel-debugbar --dev
```

Configurar em `.env`:

```ini
DEBUGBAR_ENABLED=true
```

Acesse qualquer endpoint e verá informações detalhadas:
- Queries executadas
- Tempo de execução
- Memória usada
- Views renderizadas
- Rotas
- Logs

### Laravel Telescope

Para monitoramento mais avançado:

```bash
# Instalar Telescope
composer require laravel/telescope --dev

# Publicar assets
php artisan telescope:install

# Rodar migrations
php artisan migrate

# Acessar dashboard
# http://localhost:8000/telescope
```

Telescope monitora:
- Requests HTTP
- Queries
- Jobs
- Exceptions
- Logs
- Dumps
- Cache
- Redis

### Logging

Configurar logs em `config/logging.php`:

```php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['single', 'slack'],
    ],
    
    'single' => [
        'driver' => 'single',
        'path' => storage_path('logs/laravel.log'),
        'level' => env('LOG_LEVEL', 'debug'),
    ],
    
    'daily' => [
        'driver' => 'daily',
        'path' => storage_path('logs/laravel.log'),
        'level' => env('LOG_LEVEL', 'debug'),
        'days' => 14,
    ],
],
```

Usar logs no código:

```php
use Illuminate\Support\Facades\Log;

// Diferentes níveis
Log::debug('Debug info');
Log::info('Informação');
Log::notice('Aviso');
Log::warning('Alerta');
Log::error('Erro');
Log::critical('Crítico');
Log::alert('Alerta urgente');
Log::emergency('Emergência');

// Com contexto
Log::info('Pedido criado', [
    'order_id' => $order->id,
    'customer_id' => $order->customer_id,
    'total' => $order->total,
]);

// Channel específico
Log::channel('slack')->critical('Sistema fora do ar');
```

### Dump & Die

```php
// Dump simples
dump($order);

// Dump and die
dd($order);

// Dump múltiplas variáveis
dd($order, $customer, $products);

// Ray (ferramenta premium)
ray($order)->label('Order created');
```

### Tinker

Console interativo do Laravel:

```bash
# Abrir Tinker
php artisan tinker

# Exemplos de uso
>>> $order = Order::find(1)
>>> $order->items
>>> $order->customer->name
>>> Order::where('status', 'pending')->count()
>>> User::factory()->count(10)->create()
```

### Xdebug

Configurar Xdebug no `php.ini`:

```ini
[xdebug]
zend_extension=xdebug.so
xdebug.mode=debug,develop,coverage
xdebug.start_with_request=yes
xdebug.client_host=127.0.0.1
xdebug.client_port=9003
```

Configurar no VS Code (`.vscode/launch.json`):

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Listen for Xdebug",
            "type": "php",
            "request": "launch",
            "port": 9003,
            "pathMappings": {
                "/var/www/html": "${workspaceFolder}"
            }
        }
    ]
}
```

## 🚀 Deploy

### Deploy para Produção (GCP)

#### Pré-requisitos

- Conta GCP configurada
- Google Cloud SDK instalado
- Projeto GCP criado
- Cloud SQL instance criada
- Memorystore for Redis criado
- GKE cluster criado

#### 1. Preparar Aplicação

Configurar variáveis de ambiente para produção:

```bash
# .env.production
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.vsmenu.io

DB_CONNECTION=mysql
DB_HOST=CLOUD_SQL_IP
DB_DATABASE=vsmenu_prod
DB_USERNAME=vsmenu_user
DB_PASSWORD=senha_super_segura

REDIS_HOST=MEMORYSTORE_IP
REDIS_PASSWORD=redis_password

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

LOG_CHANNEL=stack
LOG_LEVEL=error
```

#### 2. Criar Dockerfile

```dockerfile
# Dockerfile
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage

# Expose port
EXPOSE 9000

CMD ["php-fpm"]
```

#### 3. Build e Push Docker Image

```bash
# Build da imagem
docker build -t gcr.io/vsmenu-project/api:latest .

# Push para Google Container Registry
gcloud auth configure-docker
docker push gcr.io/vsmenu-project/api:latest
```

#### 4. Deploy no GKE

Criar `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vsmenu-api
  labels:
    app: vsmenu-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vsmenu-api
  template:
    metadata:
      labels:
        app: vsmenu-api
    spec:
      containers:
      - name: api
        image: gcr.io/vsmenu-project/api:latest
        ports:
        - containerPort: 9000
        env:
        - name: APP_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db-host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db-password
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: vsmenu-api-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 9000
  selector:
    app: vsmenu-api
```

Deploy:

```bash
# Aplicar deployment
kubectl apply -f k8s/deployment.yaml

# Verificar status
kubectl get pods
kubectl get services

# Ver logs
kubectl logs -f deployment/vsmenu-api
```

#### 5. GitHub Actions CI/CD

Criar `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GKE

on:
  push:
    branches: [main]

env:
  GKE_CLUSTER: vsmenu-cluster
  GKE_ZONE: us-central1-a
  IMAGE: gcr.io/vsmenu-project/api

jobs:
  setup-build-publish-deploy:
    name: Setup, Build, Publish, and Deploy
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.2'

    - name: Install Composer dependencies
      run: composer install --no-dev --optimize-autoloader

    - name: Run tests
      run: php artisan test

    - name: Setup Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}

    - name: Configure Docker
      run: gcloud auth configure-docker

    - name: Build Docker image
      run: docker build -t $IMAGE:$GITHUB_SHA .

    - name: Push Docker image
      run: docker push $IMAGE:$GITHUB_SHA

    - name: Deploy to GKE
      run: |
        gcloud container clusters get-credentials $GKE_CLUSTER --zone $GKE_ZONE
        kubectl set image deployment/vsmenu-api api=$IMAGE:$GITHUB_SHA
        kubectl rollout status deployment/vsmenu-api
```

### Otimizações de Produção

#### 1. Cache de Configuração

```bash
# Cachear configurações
php artisan config:cache

# Cachear rotas
php artisan route:cache

# Cachear views
php artisan view:cache

# Limpar todos os caches
php artisan optimize:clear
```

#### 2. Otimizar Autoloader

```bash
composer install --optimize-autoloader --no-dev
composer dump-autoload --optimize --classmap-authoritative
```

#### 3. OPcache

Configurar no `php.ini`:

```ini
[opcache]
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
opcache.revalidate_freq=0
opcache.fast_shutdown=1
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro "Class not found"

**Sintoma**: `Class 'App\...' not found`

**Solução**:
```bash
composer dump-autoload
php artisan config:clear
php artisan cache:clear
```

#### 2. Migrations falhando

**Sintoma**: Erro ao rodar migrations

**Soluções**:
```bash
# Verificar conexão com banco
php artisan db:show

# Resetar migrations
php artisan migrate:fresh

# Rodar migration específica
php artisan migrate --path=/database/migrations/2024_01_01_000000_create_orders_table.php
```

#### 3. Permission denied em storage/

**Sintoma**: Erro ao escrever em `storage/` ou `bootstrap/cache/`

**Solução**:
```bash
# Linux/Mac
chmod -R 775 storage bootstrap/cache
chown -R $USER:www-data storage bootstrap/cache

# Docker
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
```

#### 4. Timeout em Queries

**Sintoma**: Queries lentas ou timeout

**Soluções**:
```bash
# Ver queries lentas
php artisan db:show --counts

# Usar Debugbar para ver queries
composer require barryvdh/laravel-debugbar --dev

# Adicionar índices
Schema::table('orders', function (Blueprint $table) {
    $table->index('status');
    $table->index('created_at');
    $table->index(['customer_id', 'status']);
});
```

#### 5. Queue não processando jobs

**Sintoma**: Jobs ficam em pending

**Soluções**:
```bash
# Verificar worker
php artisan queue:work --verbose

# Ver jobs falhados
php artisan queue:failed

# Reprocessar job falhado
php artisan queue:retry {id}

# Reprocessar todos
php artisan queue:retry all

# Limpar queue
php artisan queue:flush
```

#### 6. Redis Connection Refused

**Sintoma**: `Connection refused [tcp://127.0.0.1:6379]`

**Soluções**:
```bash
# Verificar se Redis está rodando
redis-cli ping
# Resposta esperada: PONG

# Iniciar Redis
redis-server

# Verificar configuração no .env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

## 📚 Recursos Adicionais

### Documentação Relacionada

- [Arquitetura do Sistema](/architecture/)
- [Padrões de Código](/architecture/code-standards)
- [Documentação da API](/api/)
- [Guias de Outras Aplicações](/guides/)

### Links Úteis

- [Laravel Documentation](https://laravel.com/docs)
- [PHP Documentation](https://www.php.net/docs.php)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

### Comunidade

- [Laravel News](https://laravel-news.com/)
- [Laracasts](https://laracasts.com/)
- [Stack Overflow - Laravel](https://stackoverflow.com/questions/tagged/laravel)
- [Laravel GitHub](https://github.com/laravel/laravel)
- [VSmenu GitHub Discussions](https://github.com/orgs/vsmenu/discussions)

## 🤝 Contribuindo

Encontrou um erro neste guia ou quer sugerir melhorias?

1. Abra uma [issue](https://github.com/vsmenu/vsmenu-docs/issues)
2. Envie um [pull request](https://github.com/vsmenu/vsmenu-docs/pulls)
3. Entre em contato: <valdir@vsmenu.io>

---

**Última atualização**: Dezembro 2025  
**Mantenedor**: Equipe Backend VSmenu  
**Revisão**: Mensal

