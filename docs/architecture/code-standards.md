---
title: Padrões de Código e Convenções
description: Padrões de código, convenções de nomenclatura e boas práticas do VSmenu 2.0
---

# Padrões de Código e Convenções

Documentação completa dos padrões de código, convenções de nomenclatura e boas práticas utilizadas em cada camada do ecossistema VSmenu 2.0.

## 🎯 Visão Geral

Padrões de código consistentes são essenciais para:
- **Legibilidade**: Código fácil de ler e entender
- **Manutenibilidade**: Facilita manutenção futura
- **Colaboração**: Time alinhado nas mesmas práticas
- **Qualidade**: Reduz bugs e inconsistências
- **Onboarding**: Novos desenvolvedores se adaptam mais rápido

### Princípios Gerais

1. **KISS** (Keep It Simple, Stupid): Simplicidade sobre complexidade
2. **DRY** (Don't Repeat Yourself): Evite duplicação de código
3. **YAGNI** (You Aren't Gonna Need It): Não implemente até necessário
4. **SOLID**: Princípios de design orientado a objetos
5. **Clean Code**: Código limpo e auto-explicativo

## 🔧 Backend (Laravel)

### Estrutura de Pastas - Clean Architecture

```
app/
├── Domain/                 # Lógica de negócio pura
│   ├── Entities/          # Entidades de domínio
│   │   └── Order.php
│   ├── ValueObjects/      # Objetos de valor imutáveis
│   │   └── Money.php
│   ├── Repositories/      # Interfaces de repositórios
│   │   └── OrderRepositoryInterface.php
│   └── Services/          # Serviços de domínio
│       └── OrderDomainService.php
│
├── Application/           # Casos de uso
│   ├── UseCases/
│   │   └── CreateOrderUseCase.php
│   ├── DTOs/              # Data Transfer Objects
│   │   └── CreateOrderDTO.php
│   └── Validators/        # Validadores de negócio
│       └── OrderValidator.php
│
├── Infrastructure/        # Implementações técnicas
│   ├── Persistence/       # Eloquent Models & Repositories
│   │   ├── Models/
│   │   │   └── Order.php
│   │   └── Repositories/
│   │       └── EloquentOrderRepository.php
│   ├── Cache/
│   ├── Queue/
│   └── External/          # APIs externas
│
├── Presentation/          # Camada de apresentação
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── OrderController.php
│   │   ├── Middleware/
│   │   ├── Requests/      # Form Requests
│   │   │   └── CreateOrderRequest.php
│   │   └── Resources/     # API Resources
│   │       └── OrderResource.php
│   └── Console/
│
└── Support/               # Helpers e utilitários
    ├── Helpers/
    └── Traits/
```

### Nomenclatura

#### Classes

```php
// ✅ CORRETO - PascalCase
class OrderController extends Controller {}
class CreateOrderUseCase {}
class OrderRepository {}

// ❌ ERRADO
class orderController {}
class Order_Controller {}
```

#### Métodos e Variáveis

```php
// ✅ CORRETO - camelCase
public function createOrder(CreateOrderRequest $request) {
    $orderData = $request->validated();
    $totalPrice = $this->calculateTotal($orderData);
}

// ❌ ERRADO
public function CreateOrder() {}
public function create_order() {}
$order_data = [];
```

#### Constants

```php
// ✅ CORRETO - UPPER_SNAKE_CASE
const MAX_ITEMS_PER_ORDER = 50;
const ORDER_STATUS_PENDING = 'pending';

// ❌ ERRADO
const maxItemsPerOrder = 50;
const orderStatusPending = 'pending';
```

### Controllers

#### Padrão Resource Controller

```php
<?php

namespace App\Presentation\Http\Controllers;

use App\Application\UseCases\CreateOrderUseCase;
use App\Application\DTOs\CreateOrderDTO;
use App\Presentation\Http\Requests\CreateOrderRequest;
use App\Presentation\Http\Resources\OrderResource;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(
        private readonly CreateOrderUseCase $createOrderUseCase
    ) {}

    /**
     * Display a listing of orders.
     */
    public function index(): JsonResponse
    {
        // Implementação
    }

    /**
     * Store a newly created order.
     */
    public function store(CreateOrderRequest $request): JsonResponse
    {
        $dto = CreateOrderDTO::fromRequest($request);
        $order = $this->createOrderUseCase->execute($dto);
        
        return response()->json(
            new OrderResource($order),
            201
        );
    }

    /**
     * Display the specified order.
     */
    public function show(int $id): JsonResponse
    {
        // Implementação
    }

    /**
     * Update the specified order.
     */
    public function update(UpdateOrderRequest $request, int $id): JsonResponse
    {
        // Implementação
    }

    /**
     * Remove the specified order.
     */
    public function destroy(int $id): JsonResponse
    {
        // Implementação
    }
}
```

**Regras**:
- Um controller por recurso
- Seguir convenções RESTful
- Métodos curtos (< 20 linhas)
- Delegar lógica para Use Cases
- Sempre usar Form Requests para validação
- Sempre retornar API Resources

### Models e Repositories

#### Eloquent Model

```php
<?php

namespace App\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

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

    /**
     * Get the items for the order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Scope a query to only include pending orders.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
```

#### Repository Interface

```php
<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Order;
use Illuminate\Support\Collection;

interface OrderRepositoryInterface
{
    public function find(int $id): ?Order;
    public function all(): Collection;
    public function create(array $data): Order;
    public function update(int $id, array $data): Order;
    public function delete(int $id): bool;
    public function findByStatus(string $status): Collection;
}
```

#### Repository Implementation

```php
<?php

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Repositories\OrderRepositoryInterface;
use App\Infrastructure\Persistence\Models\Order as OrderModel;
use App\Domain\Entities\Order;

class EloquentOrderRepository implements OrderRepositoryInterface
{
    public function find(int $id): ?Order
    {
        $orderModel = OrderModel::with('items')->find($id);
        
        return $orderModel ? $this->toDomainEntity($orderModel) : null;
    }

    public function create(array $data): Order
    {
        $orderModel = OrderModel::create($data);
        
        return $this->toDomainEntity($orderModel);
    }

    private function toDomainEntity(OrderModel $model): Order
    {
        return Order::fromArray($model->toArray());
    }
}
```

### Form Requests

```php
<?php

namespace App\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'customer_id' => 'required|exists:customers,id',
            'table_id' => 'nullable|exists:tables,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1|max:99',
            'items.*.price' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'items.required' => 'O pedido deve conter pelo menos um item.',
            'items.*.product_id.required' => 'Cada item deve ter um produto.',
            'items.*.quantity.min' => 'A quantidade mínima é 1.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'customer_id' => (int) $this->customer_id,
        ]);
    }
}
```

### API Resources

```php
<?php

namespace App\Presentation\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'table' => new TableResource($this->whenLoaded('table')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'status' => $this->status,
            'total' => $this->total,
            'notes' => $this->notes,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
```

### Services e Use Cases

```php
<?php

namespace App\Application\UseCases;

use App\Domain\Repositories\OrderRepositoryInterface;
use App\Application\DTOs\CreateOrderDTO;
use App\Domain\Entities\Order;
use Illuminate\Support\Facades\DB;

class CreateOrderUseCase
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository
    ) {}

    public function execute(CreateOrderDTO $dto): Order
    {
        return DB::transaction(function () use ($dto) {
            // Validações de negócio
            $this->validateBusinessRules($dto);
            
            // Criar pedido
            $order = $this->orderRepository->create($dto->toArray());
            
            // Disparar eventos
            event(new OrderCreated($order));
            
            return $order;
        });
    }

    private function validateBusinessRules(CreateOrderDTO $dto): void
    {
        // Implementar validações de negócio
        if (count($dto->items) > 50) {
            throw new \DomainException('Maximum 50 items per order');
        }
    }
}
```

### Exceptions

```php
<?php

namespace App\Domain\Exceptions;

use Exception;

class OrderNotFoundException extends Exception
{
    public function __construct(int $orderId)
    {
        parent::__construct("Order with ID {$orderId} not found", 404);
    }
}

class InvalidOrderStateException extends Exception
{
    public function __construct(string $message)
    {
        parent::__construct($message, 400);
    }
}
```

### PHPDoc e Comentários

```php
<?php

/**
 * Calculate the total price of an order including taxes and discounts.
 *
 * This method applies the following logic:
 * 1. Calculate subtotal of all items
 * 2. Apply discount if applicable
 * 3. Calculate taxes
 * 4. Return final total
 *
 * @param array $items Array of order items
 * @param float|null $discountPercent Discount percentage (0-100)
 * @return float Total price with taxes
 * @throws InvalidArgumentException If items array is empty
 */
private function calculateTotal(array $items, ?float $discountPercent = null): float
{
    if (empty($items)) {
        throw new InvalidArgumentException('Items array cannot be empty');
    }
    
    // Lógica clara não precisa de comentários inline
    $subtotal = $this->calculateSubtotal($items);
    $discounted = $this->applyDiscount($subtotal, $discountPercent);
    
    return $this->calculateWithTaxes($discounted);
}
```

**Regras de Comentários**:
- Explique **porquê**, não **o quê**
- Use PHPDoc para métodos públicos
- Evite comentários óbvios
- Comente lógica complexa
- Remova código comentado (use Git)

## 🎨 Frontend Web (Vue.js)

### Estrutura de Pastas

```
src/
├── components/           # Componentes reutilizáveis
│   ├── common/          # Componentes comuns (Button, Input, etc.)
│   ├── orders/          # Componentes de pedidos
│   └── layout/          # Componentes de layout
├── views/               # Páginas/Views
│   └── orders/
│       ├── OrderList.vue
│       └── OrderDetails.vue
├── stores/              # Pinia stores
│   └── useOrderStore.js
├── composables/         # Composables Vue
│   └── useOrders.js
├── services/            # API clients
│   └── orderService.js
├── router/              # Vue Router
│   └── index.js
├── utils/               # Utilitários
│   └── formatters.js
└── assets/              # Assets estáticos
    ├── images/
    └── styles/
```

### Nomenclatura

#### Componentes

```vue
// ✅ CORRETO - PascalCase para componentes
<script setup>
// OrderList.vue
// OrderDetails.vue
// UserProfile.vue
</script>

// ❌ ERRADO
// orderList.vue
// order-list.vue (arquivo)
```

#### Variáveis e Funções

```javascript
// ✅ CORRETO - camelCase
const orderList = ref([])
const isLoading = ref(false)

function fetchOrders() {}
function handleSubmit() {}

// ❌ ERRADO
const OrderList = ref([])
const order_list = ref([])
function FetchOrders() {}
```

### Componentes Vue - Composition API

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/useOrderStore'
import OrderItem from './OrderItem.vue'

// Props
const props = defineProps({
  customerId: {
    type: Number,
    required: true
  },
  showPending: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['orderSelected', 'orderCreated'])

// Composables e Stores
const orderStore = useOrderStore()

// Estado local
const isLoading = ref(false)
const searchQuery = ref('')

// Computed
const filteredOrders = computed(() => {
  let orders = orderStore.orders
  
  if (props.showPending) {
    orders = orders.filter(o => o.status === 'pending')
  }
  
  if (searchQuery.value) {
    orders = orders.filter(o => 
      o.id.toString().includes(searchQuery.value)
    )
  }
  
  return orders
})

// Métodos
async function fetchOrders() {
  isLoading.value = true
  try {
    await orderStore.fetchOrders(props.customerId)
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    isLoading.value = false
  }
}

function handleOrderClick(order) {
  emit('orderSelected', order)
}

// Lifecycle
onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="order-list">
    <div class="order-list__header">
      <h2>Pedidos</h2>
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="Buscar pedido..."
        class="order-list__search"
      >
    </div>

    <div v-if="isLoading" class="order-list__loading">
      Carregando...
    </div>

    <div v-else-if="filteredOrders.length === 0" class="order-list__empty">
      Nenhum pedido encontrado
    </div>

    <div v-else class="order-list__items">
      <OrderItem
        v-for="order in filteredOrders"
        :key="order.id"
        :order="order"
        @click="handleOrderClick(order)"
      />
    </div>
  </div>
</template>

<style scoped>
.order-list {
  @apply flex flex-col gap-4;
}

.order-list__header {
  @apply flex items-center justify-between;
}

.order-list__search {
  @apply px-4 py-2 border rounded-lg;
}

.order-list__loading,
.order-list__empty {
  @apply text-center text-gray-500 py-8;
}

.order-list__items {
  @apply grid gap-4;
}
</style>
```

**Regras de Componentes**:
- Um componente por arquivo
- Props tipadas
- Emits declarados
- Composition API preferencial
- Estilos scoped
- Ordem: `<script>`, `<template>`, `<style>`

### Composables

```javascript
// composables/useOrders.js
import { ref, computed } from 'vue'
import { orderService } from '@/services/orderService'

/**
 * Composable for managing orders
 * @returns {Object} Order management functions and state
 */
export function useOrders() {
  const orders = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const pendingOrders = computed(() => 
    orders.value.filter(o => o.status === 'pending')
  )

  async function fetchOrders(customerId) {
    isLoading.value = true
    error.value = null
    
    try {
      orders.value = await orderService.getOrders(customerId)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createOrder(orderData) {
    try {
      const newOrder = await orderService.createOrder(orderData)
      orders.value.push(newOrder)
      return newOrder
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  return {
    // State
    orders,
    isLoading,
    error,
    
    // Computed
    pendingOrders,
    
    // Methods
    fetchOrders,
    createOrder
  }
}
```

**Regras de Composables**:
- Prefixo `use`
- Retornar objeto com state e methods
- Documentar com JSDoc
- Lógica reutilizável
- Sem side effects globais

### Pinia Stores

```javascript
// stores/useOrderStore.js
import { defineStore } from 'pinia'
import { orderService } from '@/services/orderService'

export const useOrderStore = defineStore('orders', {
  state: () => ({
    orders: [],
    currentOrder: null,
    isLoading: false,
    error: null
  }),

  getters: {
    pendingOrders: (state) => 
      state.orders.filter(o => o.status === 'pending'),
    
    completedOrders: (state) => 
      state.orders.filter(o => o.status === 'completed'),
    
    totalOrders: (state) => state.orders.length
  },

  actions: {
    async fetchOrders(customerId) {
      this.isLoading = true
      this.error = null
      
      try {
        this.orders = await orderService.getOrders(customerId)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createOrder(orderData) {
      try {
        const newOrder = await orderService.createOrder(orderData)
        this.orders.push(newOrder)
        return newOrder
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    setCurrentOrder(order) {
      this.currentOrder = order
    },

    clearError() {
      this.error = null
    }
  }
})
```

### Services (API Clients)

```javascript
// services/orderService.js
import axios from '@/utils/axios'

export const orderService = {
  /**
   * Fetch all orders for a customer
   * @param {number} customerId - Customer ID
   * @returns {Promise<Array>} List of orders
   */
  async getOrders(customerId) {
    const { data } = await axios.get(`/api/v1/orders`, {
      params: { customer_id: customerId }
    })
    return data.data
  },

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    const { data } = await axios.post('/api/v1/orders', orderData)
    return data.data
  },

  /**
   * Update order status
   * @param {number} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order
   */
  async updateStatus(orderId, status) {
    const { data } = await axios.patch(`/api/v1/orders/${orderId}/status`, {
      status
    })
    return data.data
  }
}
```

### Router

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/orders/OrderList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/orders/:id',
      name: 'order-details',
      component: () => import('@/views/orders/OrderDetails.vue'),
      meta: { requiresAuth: true },
      props: true
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
```

## 🖥️ Desktop (Electron)

### Estrutura IPC

#### Main Process

```javascript
// src/main/ipc/orderHandlers.js
const { ipcMain } = require('electron')
const { orderRepository } = require('../database/repositories/orderRepository')

/**
 * Register order IPC handlers
 */
function registerOrderHandlers() {
  // Get orders
  ipcMain.handle('orders:getAll', async () => {
    try {
      return await orderRepository.findAll()
    } catch (error) {
      console.error('Failed to get orders:', error)
      throw error
    }
  })

  // Create order
  ipcMain.handle('orders:create', async (event, orderData) => {
    try {
      return await orderRepository.create(orderData)
    } catch (error) {
      console.error('Failed to create order:', error)
      throw error
    }
  })

  // Sync orders
  ipcMain.handle('orders:sync', async () => {
    try {
      const { syncService } = require('../sync/syncService')
      return await syncService.syncOrders()
    } catch (error) {
      console.error('Failed to sync orders:', error)
      throw error
    }
  })
}

module.exports = { registerOrderHandlers }
```

#### Renderer Process

```javascript
// src/renderer/services/ipcService.js
const { ipcRenderer } = require('electron')

export const ipcService = {
  /**
   * Get all orders from local database
   * @returns {Promise<Array>} List of orders
   */
  async getOrders() {
    return await ipcRenderer.invoke('orders:getAll')
  },

  /**
   * Create a new order in local database
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    return await ipcRenderer.invoke('orders:create', orderData)
  },

  /**
   * Sync orders with remote API
   * @returns {Promise<Object>} Sync result
   */
  async syncOrders() {
    return await ipcRenderer.invoke('orders:sync')
  }
}
```

### SQLite

```javascript
// src/main/database/repositories/orderRepository.js
const Database = require('better-sqlite3')
const db = new Database('vsmenu.db')

class OrderRepository {
  /**
   * Find all orders
   * @returns {Array} List of orders
   */
  findAll() {
    const stmt = db.prepare('SELECT * FROM orders ORDER BY created_at DESC')
    return stmt.all()
  }

  /**
   * Find order by ID
   * @param {number} id - Order ID
   * @returns {Object|null} Order or null
   */
  findById(id) {
    const stmt = db.prepare('SELECT * FROM orders WHERE id = ?')
    return stmt.get(id)
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Object} Created order
   */
  create(orderData) {
    const stmt = db.prepare(`
      INSERT INTO orders (customer_id, total, status, notes, created_at)
      VALUES (@customerId, @total, @status, @notes, @createdAt)
    `)
    
    const info = stmt.run({
      customerId: orderData.customer_id,
      total: orderData.total,
      status: orderData.status || 'pending',
      notes: orderData.notes,
      createdAt: new Date().toISOString()
    })
    
    return this.findById(info.lastInsertRowid)
  }

  /**
   * Update order
   * @param {number} id - Order ID
   * @param {Object} orderData - Order data
   * @returns {Object} Updated order
   */
  update(id, orderData) {
    const stmt = db.prepare(`
      UPDATE orders 
      SET status = @status, updated_at = @updatedAt
      WHERE id = @id
    `)
    
    stmt.run({
      id,
      status: orderData.status,
      updatedAt: new Date().toISOString()
    })
    
    return this.findById(id)
  }
}

module.exports = { orderRepository: new OrderRepository() }
```

## 📱 Mobile (Flutter)

### Estrutura Feature-based

```
lib/features/orders/
├── data/
│   ├── models/
│   │   └── order_model.dart
│   ├── datasources/
│   │   ├── order_local_datasource.dart
│   │   └── order_remote_datasource.dart
│   └── repositories/
│       └── order_repository_impl.dart
├── domain/
│   ├── entities/
│   │   └── order.dart
│   ├── repositories/
│   │   └── order_repository.dart
│   └── usecases/
│       ├── get_orders.dart
│       └── create_order.dart
└── presentation/
    ├── bloc/
    │   ├── order_bloc.dart
    │   ├── order_event.dart
    │   └── order_state.dart
    ├── pages/
    │   └── order_list_page.dart
    └── widgets/
        └── order_item_widget.dart
```

### Nomenclatura

#### Arquivos

```dart
// ✅ CORRETO - snake_case para arquivos
// order_list_page.dart
// order_repository.dart
// create_order_use_case.dart

// ❌ ERRADO
// OrderListPage.dart
// order-list-page.dart
```

#### Classes e Variáveis

```dart
// ✅ CORRETO
class OrderListPage extends StatelessWidget {}
class OrderBloc extends Bloc<OrderEvent, OrderState> {}

final String customerName = 'João';
final int orderId = 1;

void fetchOrders() {}

// ❌ ERRADO
class orderListPage {}
class Order_Bloc {}
final String CustomerName = 'João';
void FetchOrders() {}
```

### Entity

```dart
// domain/entities/order.dart
import 'package:equatable/equatable.dart';

/// Domain entity representing an Order
class Order extends Equatable {
  final int id;
  final int customerId;
  final String status;
  final double total;
  final DateTime createdAt;

  const Order({
    required this.id,
    required this.customerId,
    required this.status,
    required this.total,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, customerId, status, total, createdAt];
}
```

### Repository Interface

```dart
// domain/repositories/order_repository.dart
import 'package:dartz/dartz.dart';
import '../entities/order.dart';
import '../../core/errors/failures.dart';

/// Repository interface for Order operations
abstract class OrderRepository {
  /// Fetches all orders for a customer
  /// 
  /// Returns [Right<List<Order>>] on success
  /// Returns [Left<Failure>] on error
  Future<Either<Failure, List<Order>>> getOrders(int customerId);

  /// Creates a new order
  /// 
  /// Returns [Right<Order>] on success
  /// Returns [Left<Failure>] on error
  Future<Either<Failure, Order>> createOrder(Order order);

  /// Updates order status
  Future<Either<Failure, Order>> updateStatus(int orderId, String status);
}
```

### UseCase

```dart
// domain/usecases/get_orders.dart
import 'package:dartz/dartz.dart';
import '../entities/order.dart';
import '../repositories/order_repository.dart';
import '../../core/errors/failures.dart';
import '../../core/usecases/usecase.dart';

/// UseCase to fetch orders for a customer
class GetOrders implements UseCase<List<Order>, GetOrdersParams> {
  final OrderRepository repository;

  GetOrders(this.repository);

  @override
  Future<Either<Failure, List<Order>>> call(GetOrdersParams params) async {
    return await repository.getOrders(params.customerId);
  }
}

/// Parameters for GetOrders usecase
class GetOrdersParams extends Equatable {
  final int customerId;

  const GetOrdersParams({required this.customerId});

  @override
  List<Object?> get props => [customerId];
}
```

### BLoC

```dart
// presentation/bloc/order_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'order_event.dart';
import 'order_state.dart';
import '../../domain/usecases/get_orders.dart';
import '../../domain/usecases/create_order.dart';

/// BLoC for managing order state
class OrderBloc extends Bloc<OrderEvent, OrderState> {
  final GetOrders getOrders;
  final CreateOrder createOrder;

  OrderBloc({
    required this.getOrders,
    required this.createOrder,
  }) : super(OrderInitial()) {
    on<FetchOrdersEvent>(_onFetchOrders);
    on<CreateOrderEvent>(_onCreate);
  }

  Future<void> _onFetchOrders(
    FetchOrdersEvent event,
    Emitter<OrderState> emit,
  ) async {
    emit(OrderLoading());

    final result = await getOrders(
      GetOrdersParams(customerId: event.customerId),
    );

    result.fold(
      (failure) => emit(OrderError(message: _mapFailureToMessage(failure))),
      (orders) => emit(OrderLoaded(orders: orders)),
    );
  }

  Future<void> _onCreateOrder(
    CreateOrderEvent event,
    Emitter<OrderState> emit,
  ) async {
    emit(OrderLoading());

    final result = await createOrder(
      CreateOrderParams(order: event.order),
    );

    result.fold(
      (failure) => emit(OrderError(message: _mapFailureToMessage(failure))),
      (order) => emit(OrderCreated(order: order)),
    );
  }

  String _mapFailureToMessage(Failure failure) {
    if (failure is ServerFailure) {
      return 'Erro ao conectar com o servidor';
    } else if (failure is CacheFailure) {
      return 'Erro ao acessar dados locais';
    } else {
      return 'Erro inesperado';
    }
  }
}
```

### Widget

```dart
// presentation/pages/order_list_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/order_bloc.dart';
import '../widgets/order_item_widget.dart';

/// Page displaying list of orders
class OrderListPage extends StatefulWidget {
  final int customerId;

  const OrderListPage({
    Key? key,
    required this.customerId,
  }) : super(key: key);

  @override
  State<OrderListPage> createState() => _OrderListPageState();
}

class _OrderListPageState extends State<OrderListPage> {
  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  void _fetchOrders() {
    context.read<OrderBloc>().add(
      FetchOrdersEvent(customerId: widget.customerId),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pedidos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchOrders,
          ),
        ],
      ),
      body: BlocBuilder<OrderBloc, OrderState>(
        builder: (context, state) {
          if (state is OrderLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          } else if (state is OrderLoaded) {
            if (state.orders.isEmpty) {
              return const Center(
                child: Text('Nenhum pedido encontrado'),
              );
            }
            return ListView.builder(
              itemCount: state.orders.length,
              itemBuilder: (context, index) {
                return OrderItemWidget(
                  order: state.orders[index],
                  onTap: () => _onOrderTap(state.orders[index]),
                );
              },
            );
          } else if (state is OrderError) {
            return Center(
              child: Text(
                state.message,
                style: const TextStyle(color: Colors.red),
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _onCreateOrder,
        child: const Icon(Icons.add),
      ),
    );
  }

  void _onOrderTap(Order order) {
    // Navigate to order details
  }

  void _onCreateOrder() {
    // Navigate to create order
  }
}
```

## 🌐 Convenções Gerais

### Git

#### Commits - Conventional Commits

```bash
# ✅ CORRETO
feat(orders): adiciona filtro por status
fix(auth): corrige validação de token expirado
docs(api): atualiza documentação de endpoints
refactor(orders): melhora performance de query
test(orders): adiciona testes para CreateOrderUseCase
chore(deps): atualiza dependências do Laravel

# ❌ ERRADO
updated orders
fix bug
changes
wip
```

**Tipos**:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de manutenção
- `perf`: Melhorias de performance
- `style`: Formatação de código

#### Branches

```bash
# ✅ CORRETO
feature/add-order-filter
fix/auth-token-validation
docs/update-api-docs
refactor/improve-order-query

# ❌ ERRADO
new-feature
bugfix
my-branch
```

**Padrões**:
- `feature/` - Nova funcionalidade
- `fix/` - Correção de bug
- `docs/` - Documentação
- `refactor/` - Refatoração
- `hotfix/` - Correção urgente

### Código

#### Comentários

```php
// ✅ CORRETO - Explica "porquê"
// We need to check inventory before confirming order
// to prevent overselling
if ($product->stock < $quantity) {
    throw new OutOfStockException();
}

// ❌ ERRADO - Explica "o quê" (óbvio)
// Check if stock is less than quantity
if ($product->stock < $quantity) {
    throw new OutOfStockException();
}
```

#### Documentação

```php
/**
 * Calculate order total with discounts and taxes.
 *
 * @param array $items Order items
 * @param float|null $discountPercent Discount percentage (0-100)
 * @return float Total price
 * @throws InvalidArgumentException If items array is empty
 */
public function calculateTotal(array $items, ?float $discountPercent = null): float
```

### Arquivos e Pastas

```bash
# Backend (PHP)
OrderController.php        # PascalCase para classes
order-service.js           # kebab-case para arquivos

# Frontend (Vue.js)
OrderList.vue              # PascalCase para componentes
orderService.js            # camelCase para JS
order-list.scss            # kebab-case para styles

# Mobile (Flutter)
order_list_page.dart       # snake_case para arquivos
OrderBloc                  # PascalCase para classes
```

## ✅ Checklist de Code Review

### Geral
- [ ] Código segue padrões definidos
- [ ] Nomenclatura consistente
- [ ] Comentários quando necessário
- [ ] Sem código comentado
- [ ] Sem console.log ou var_dump
- [ ] Sem TODOs (criar issues)

### Backend
- [ ] Validação de input (Form Requests)
- [ ] Tratamento de erros
- [ ] Transações de banco onde necessário
- [ ] Queries otimizadas (N+1)
- [ ] Retorna API Resources
- [ ] Testes criados/atualizados

### Frontend
- [ ] Props tipadas
- [ ] Emits declarados
- [ ] Loading states
- [ ] Error handling
- [ ] Composables reutilizáveis
- [ ] Estilos scoped

### Mobile
- [ ] BLoC pattern correto
- [ ] Estados bem definidos
- [ ] Error handling
- [ ] Loading states
- [ ] Widgets reutilizáveis

## 📚 Referências

### Padrões e Guias
- [PSR-12: Extended Coding Style](https://www.php-fig.org/psr/psr-12/)
- [Laravel Best Practices](https://github.com/alexeymezenin/laravel-best-practices)
- [Vue.js Style Guide](https://vuejs.org/style-guide/)
- [Flutter Style Guide](https://dart.dev/guides/language/effective-dart/style)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

### Ferramentas
- [PHPStan](https://phpstan.org/) - Static analysis for PHP
- [ESLint](https://eslint.org/) - Linting for JavaScript
- [Prettier](https://prettier.io/) - Code formatter
- [Dart Analyzer](https://dart.dev/tools/analysis) - Dart static analysis

---

**Última Atualização**: Dezembro 2025  
**Responsável**: Equipe de Arquitetura VSmenu  
**Revisão**: Trimestral

[⬅️ Voltar para Arquitetura](./index.md)
