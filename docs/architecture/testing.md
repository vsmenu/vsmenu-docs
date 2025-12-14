---
title: Estratégia de Testes na Arquitetura
description: Como os testes se integram à arquitetura do VSmenu 2.0
---

# Estratégia de Testes na Arquitetura

Documentação completa das estratégias, padrões e práticas de teste do VSmenu 2.0 em todas as camadas da arquitetura.

## 🧪 Visão Geral

A estratégia de testes do VSmenu 2.0 está fundamentada na **pirâmide de testes** e foca em garantir qualidade, confiabilidade e manutenibilidade do código em todas as camadas da aplicação.

### Princípios de Teste

1. **Test First (TDD)**: Escrever testes antes da implementação (quando possível)
2. **Fast Feedback**: Testes devem executar rapidamente
3. **Test Isolation**: Cada teste deve ser independente
4. **Readable Tests**: Testes como documentação viva
5. **Maintainable Tests**: Evitar duplicação e testes frágeis

### Objetivos de Qualidade

```
Coverage Target: > 80%
Test Execution Time: < 5 minutos (unit + integration)
E2E Execution Time: < 30 minutos
Flaky Tests: 0 (zero tolerância)
Test Maintenance: < 10% do tempo de desenvolvimento
```

## 🔺 Pirâmide de Testes

A pirâmide de testes guia a distribuição de esforço entre os diferentes tipos de teste:

```
           /\
          /  \
         / E2E \ ← Poucos, lentos, end-to-end (5%)
        /--------\
       /          \
      / Integration\ ← Médio número, médio tempo (25%)
     /--------------\
    /                \
   /   Unit Tests     \ ← Muitos, rápidos, isolados (70%)
  /--------------------\
```

### Distribuição Recomendada

**Unit Tests (70%)**:
- Maioria dos testes
- Execução rápida (< 1s cada)
- Testa lógica isolada
- Alta cobertura de edge cases

**Integration Tests (25%)**:
- Testa integração entre componentes
- Execução média (1-5s cada)
- Database, API, Cache, Queue
- Scenarios realistas

**E2E Tests (5%)**:
- Poucos testes de fluxos críticos
- Execução lenta (10-60s cada)
- User journeys completos
- Happy paths e critical paths

## 🖥️ Backend (Laravel) - Estratégia de Testes

### Unit Tests

**Domain Logic**:

```php
// tests/Unit/Domain/OrderCalculatorTest.php
namespace Tests\Unit\Domain;

use App\Domain\OrderCalculator;
use App\Models\Order;
use App\Models\OrderItem;
use PHPUnit\Framework\TestCase;

class OrderCalculatorTest extends TestCase
{
    /** @test */
    public function it_calculates_order_total_correctly()
    {
        // Arrange
        $calculator = new OrderCalculator();
        $items = collect([
            new OrderItem(['price' => 10.00, 'quantity' => 2]), // 20.00
            new OrderItem(['price' => 15.50, 'quantity' => 1]), // 15.50
        ]);
        
        // Act
        $total = $calculator->calculateTotal($items);
        
        // Assert
        $this->assertEquals(35.50, $total);
    }
    
    /** @test */
    public function it_applies_discount_correctly()
    {
        // Arrange
        $calculator = new OrderCalculator();
        $subtotal = 100.00;
        $discount = 10; // 10%
        
        // Act
        $total = $calculator->applyDiscount($subtotal, $discount);
        
        // Assert
        $this->assertEquals(90.00, $total);
    }
    
    /** @test */
    public function it_throws_exception_for_negative_discount()
    {
        // Arrange
        $calculator = new OrderCalculator();
        
        // Assert
        $this->expectException(\InvalidArgumentException::class);
        
        // Act
        $calculator->applyDiscount(100, -10);
    }
}
```

**Value Objects**:

```php
// tests/Unit/ValueObjects/MoneyTest.php
namespace Tests\Unit\ValueObjects;

use App\ValueObjects\Money;
use PHPUnit\Framework\TestCase;

class MoneyTest extends TestCase
{
    /** @test */
    public function it_creates_money_from_amount()
    {
        $money = Money::fromAmount(10.50, 'BRL');
        
        $this->assertEquals(1050, $money->getAmountInCents());
        $this->assertEquals('BRL', $money->getCurrency());
        $this->assertEquals('R$ 10,50', $money->format());
    }
    
    /** @test */
    public function it_adds_two_money_values()
    {
        $money1 = Money::fromAmount(10.00, 'BRL');
        $money2 = Money::fromAmount(5.50, 'BRL');
        
        $result = $money1->add($money2);
        
        $this->assertEquals(15.50, $result->getAmount());
    }
    
    /** @test */
    public function it_throws_exception_when_adding_different_currencies()
    {
        $money1 = Money::fromAmount(10.00, 'BRL');
        $money2 = Money::fromAmount(10.00, 'USD');
        
        $this->expectException(\InvalidArgumentException::class);
        
        $money1->add($money2);
    }
}
```

**Services**:

```php
// tests/Unit/Services/MenuServiceTest.php
namespace Tests\Unit\Services;

use App\Services\MenuService;
use App\Repositories\MenuRepository;
use Illuminate\Support\Facades\Cache;
use Mockery;
use PHPUnit\Framework\TestCase;

class MenuServiceTest extends TestCase
{
    /** @test */
    public function it_gets_menu_from_cache_if_available()
    {
        // Arrange
        $repository = Mockery::mock(MenuRepository::class);
        $service = new MenuService($repository);
        
        $cachedMenu = ['id' => 1, 'name' => 'Menu Principal'];
        Cache::shouldReceive('remember')
            ->once()
            ->andReturn($cachedMenu);
        
        // Act
        $menu = $service->getMenu(1);
        
        // Assert
        $this->assertEquals($cachedMenu, $menu);
    }
    
    /** @test */
    public function it_invalidates_menu_cache_on_update()
    {
        // Arrange
        $repository = Mockery::mock(MenuRepository::class);
        $repository->shouldReceive('update')->once();
        
        $service = new MenuService($repository);
        
        Cache::shouldReceive('tags')->with(['menu:1'])->andReturnSelf();
        Cache::shouldReceive('flush')->once();
        
        // Act
        $service->updateMenu(1, ['name' => 'Novo Nome']);
        
        // Assert
        $this->assertTrue(true); // Se chegou aqui, passou
    }
}
```

### Feature Tests

**API Endpoints**:

```php
// tests/Feature/Api/OrderControllerTest.php
namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Establishment;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    use RefreshDatabase;
    
    /** @test */
    public function it_creates_an_order_successfully()
    {
        // Arrange
        $user = User::factory()->create();
        $establishment = Establishment::factory()->create();
        $product1 = Product::factory()->create([
            'establishment_id' => $establishment->id,
            'price' => 10.00
        ]);
        $product2 = Product::factory()->create([
            'establishment_id' => $establishment->id,
            'price' => 15.00
        ]);
        
        $orderData = [
            'establishment_id' => $establishment->id,
            'table_number' => 5,
            'items' => [
                ['product_id' => $product1->id, 'quantity' => 2],
                ['product_id' => $product2->id, 'quantity' => 1],
            ]
        ];
        
        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $orderData);
        
        // Assert
        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'total',
                    'status',
                    'items',
                ]
            ]);
        
        $this->assertDatabaseHas('orders', [
            'establishment_id' => $establishment->id,
            'table_number' => 5,
            'total' => 35.00, // (10 * 2) + (15 * 1)
        ]);
        
        $this->assertDatabaseCount('order_items', 2);
    }
    
    /** @test */
    public function it_validates_required_fields()
    {
        // Arrange
        $user = User::factory()->create();
        
        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', []);
        
        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'establishment_id',
                'items',
            ]);
    }
    
    /** @test */
    public function it_prevents_unauthorized_access()
    {
        // Act
        $response = $this->postJson('/api/orders', []);
        
        // Assert
        $response->assertStatus(401);
    }
}
```

**Middleware**:

```php
// tests/Feature/Middleware/CheckEstablishmentAccessTest.php
namespace Tests\Feature\Middleware;

use App\Models\User;
use App\Models\Establishment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckEstablishmentAccessTest extends TestCase
{
    use RefreshDatabase;
    
    /** @test */
    public function it_allows_owner_to_access_establishment()
    {
        // Arrange
        $owner = User::factory()->create();
        $establishment = Establishment::factory()->create([
            'owner_id' => $owner->id
        ]);
        
        // Act
        $response = $this->actingAs($owner, 'sanctum')
            ->getJson("/api/establishments/{$establishment->id}");
        
        // Assert
        $response->assertStatus(200);
    }
    
    /** @test */
    public function it_denies_access_to_non_owner()
    {
        // Arrange
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $establishment = Establishment::factory()->create([
            'owner_id' => $owner->id
        ]);
        
        // Act
        $response = $this->actingAs($otherUser, 'sanctum')
            ->getJson("/api/establishments/{$establishment->id}");
        
        // Assert
        $response->assertStatus(403);
    }
}
```

### Integration Tests

**Database**:

```php
// tests/Integration/Repositories/OrderRepositoryTest.php
namespace Tests\Integration\Repositories;

use App\Models\Order;
use App\Models\Establishment;
use App\Repositories\OrderRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderRepositoryTest extends TestCase
{
    use RefreshDatabase;
    
    /** @test */
    public function it_fetches_orders_by_establishment_with_eager_loading()
    {
        // Arrange
        $establishment = Establishment::factory()->create();
        Order::factory()
            ->count(3)
            ->hasItems(2)
            ->create(['establishment_id' => $establishment->id]);
        
        $repository = new OrderRepository();
        
        // Act
        \DB::enableQueryLog();
        $orders = $repository->getByEstablishment($establishment->id);
        $queryCount = count(\DB::getQueryLog());
        
        // Assert
        $this->assertCount(3, $orders);
        $this->assertLessThanOrEqual(3, $queryCount); // Evita N+1
        $this->assertTrue($orders->first()->relationLoaded('items'));
    }
}
```

**Queue**:

```php
// tests/Integration/Jobs/SendOrderNotificationTest.php
namespace Tests\Integration\Jobs;

use App\Jobs\SendOrderNotification;
use App\Models\Order;
use App\Notifications\OrderCreated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class SendOrderNotificationTest extends TestCase
{
    use RefreshDatabase;
    
    /** @test */
    public function it_sends_notification_when_job_is_processed()
    {
        // Arrange
        Notification::fake();
        $order = Order::factory()->create();
        
        // Act
        $job = new SendOrderNotification($order);
        $job->handle();
        
        // Assert
        Notification::assertSentTo(
            $order->customer,
            OrderCreated::class,
            function ($notification) use ($order) {
                return $notification->order->id === $order->id;
            }
        );
    }
    
    /** @test */
    public function it_queues_notification_job()
    {
        // Arrange
        Queue::fake();
        $order = Order::factory()->create();
        
        // Act
        SendOrderNotification::dispatch($order);
        
        // Assert
        Queue::assertPushed(SendOrderNotification::class, function ($job) use ($order) {
            return $job->order->id === $order->id;
        });
    }
}
```

**Cache**:

```php
// tests/Integration/Cache/MenuCacheTest.php
namespace Tests\Integration\Cache;

use App\Models\Menu;
use App\Models\Establishment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class MenuCacheTest extends TestCase
{
    use RefreshDatabase;
    
    /** @test */
    public function it_caches_menu_data()
    {
        // Arrange
        $establishment = Establishment::factory()->create();
        $menu = Menu::factory()
            ->hasCategories(3)
            ->create(['establishment_id' => $establishment->id]);
        
        $cacheKey = "menu:{$establishment->id}";
        
        // Act
        Cache::tags(['menus'])->put($cacheKey, $menu, 3600);
        
        // Assert
        $this->assertTrue(Cache::tags(['menus'])->has($cacheKey));
        $this->assertEquals($menu->id, Cache::tags(['menus'])->get($cacheKey)->id);
    }
    
    /** @test */
    public function it_invalidates_cache_on_menu_update()
    {
        // Arrange
        $establishment = Establishment::factory()->create();
        $menu = Menu::factory()->create(['establishment_id' => $establishment->id]);
        
        $cacheKey = "menu:{$establishment->id}";
        Cache::tags(['menus'])->put($cacheKey, $menu, 3600);
        
        // Act
        Cache::tags(['menus'])->flush();
        
        // Assert
        $this->assertFalse(Cache::tags(['menus'])->has($cacheKey));
    }
}
```

### Coverage Target

```bash
# Executar testes com coverage
php artisan test --coverage --min=80

# Gerar relatório HTML
php artisan test --coverage-html coverage/

# Coverage por tipo
Unit Tests: > 90%
Feature Tests: > 80%
Integration Tests: > 75%
Overall: > 80%
```

### Ferramentas

- **PHPUnit**: Framework de testes principal
- **Pest** (opcional): Sintaxe alternativa mais moderna
- **Laravel TestCase**: Base para testes Laravel
- **Mockery**: Mocking de dependências
- **Factory**: Geração de dados de teste
- **Database Transactions**: Rollback automático

## 🌐 Frontend Web (Vue.js) - Estratégia de Testes

### Unit Tests

**Composables**:

```typescript
// tests/unit/composables/useCart.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useCart } from '@/composables/useCart'

describe('useCart', () => {
  beforeEach(() => {
    // Clear cart before each test
    const { clearCart } = useCart()
    clearCart()
  })
  
  it('adds item to cart', () => {
    // Arrange
    const { addItem, items, total } = useCart()
    const product = {
      id: 1,
      name: 'Pizza Margherita',
      price: 35.00
    }
    
    // Act
    addItem(product, 2)
    
    // Assert
    expect(items.value).toHaveLength(1)
    expect(items.value[0].product.id).toBe(1)
    expect(items.value[0].quantity).toBe(2)
    expect(total.value).toBe(70.00)
  })
  
  it('increases quantity for existing item', () => {
    // Arrange
    const { addItem, items } = useCart()
    const product = { id: 1, name: 'Pizza', price: 35.00 }
    
    // Act
    addItem(product, 1)
    addItem(product, 1)
    
    // Assert
    expect(items.value).toHaveLength(1)
    expect(items.value[0].quantity).toBe(2)
  })
  
  it('removes item from cart', () => {
    // Arrange
    const { addItem, removeItem, items } = useCart()
    const product = { id: 1, name: 'Pizza', price: 35.00 }
    addItem(product, 1)
    
    // Act
    removeItem(1)
    
    // Assert
    expect(items.value).toHaveLength(0)
  })
})
```

**Utils**:

```typescript
// tests/unit/utils/currency.spec.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, parseCurrency } from '@/utils/currency'

describe('currency utils', () => {
  it('formats number as BRL currency', () => {
    expect(formatCurrency(10.5)).toBe('R$ 10,50')
    expect(formatCurrency(1000)).toBe('R$ 1.000,00')
    expect(formatCurrency(0)).toBe('R$ 0,00')
  })
  
  it('parses currency string to number', () => {
    expect(parseCurrency('R$ 10,50')).toBe(10.5)
    expect(parseCurrency('R$ 1.000,00')).toBe(1000)
    expect(parseCurrency('10,50')).toBe(10.5)
  })
  
  it('handles invalid input gracefully', () => {
    expect(parseCurrency('invalid')).toBe(0)
    expect(parseCurrency('')).toBe(0)
  })
})
```

### Component Tests

**Vue Components**:

```typescript
// tests/unit/components/ProductCard.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCard from '@/components/ProductCard.vue'

describe('ProductCard', () => {
  const product = {
    id: 1,
    name: 'Pizza Margherita',
    description: 'Molho de tomate, mussarela e manjericão',
    price: 35.00,
    image: '/images/pizza.jpg'
  }
  
  it('renders product information', () => {
    // Arrange & Act
    const wrapper = mount(ProductCard, {
      props: { product }
    })
    
    // Assert
    expect(wrapper.text()).toContain('Pizza Margherita')
    expect(wrapper.text()).toContain('R$ 35,00')
    expect(wrapper.find('img').attributes('src')).toBe('/images/pizza.jpg')
    expect(wrapper.find('img').attributes('alt')).toBe('Pizza Margherita')
  })
  
  it('emits add-to-cart event when button is clicked', async () => {
    // Arrange
    const wrapper = mount(ProductCard, {
      props: { product }
    })
    
    // Act
    await wrapper.find('button[data-test="add-to-cart"]').trigger('click')
    
    // Assert
    expect(wrapper.emitted('add-to-cart')).toBeTruthy()
    expect(wrapper.emitted('add-to-cart')![0]).toEqual([product])
  })
  
  it('shows out of stock badge when not available', () => {
    // Arrange
    const unavailableProduct = { ...product, available: false }
    
    // Act
    const wrapper = mount(ProductCard, {
      props: { product: unavailableProduct }
    })
    
    // Assert
    expect(wrapper.text()).toContain('Indisponível')
    expect(wrapper.find('button').element.disabled).toBe(true)
  })
})
```

**Form Components**:

```typescript
// tests/unit/components/LoginForm.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from '@/components/LoginForm.vue'

describe('LoginForm', () => {
  it('validates required fields', async () => {
    // Arrange
    const wrapper = mount(LoginForm)
    
    // Act
    await wrapper.find('form').trigger('submit')
    
    // Assert
    expect(wrapper.text()).toContain('E-mail é obrigatório')
    expect(wrapper.text()).toContain('Senha é obrigatória')
  })
  
  it('validates email format', async () => {
    // Arrange
    const wrapper = mount(LoginForm)
    
    // Act
    await wrapper.find('input[type="email"]').setValue('invalid-email')
    await wrapper.find('form').trigger('submit')
    
    // Assert
    expect(wrapper.text()).toContain('E-mail inválido')
  })
  
  it('emits submit event with credentials', async () => {
    // Arrange
    const wrapper = mount(LoginForm)
    
    // Act
    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit')
    
    // Assert
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')![0]).toEqual([{
      email: 'user@example.com',
      password: 'password123'
    }])
  })
})
```

### E2E Tests

**User Flows** (Playwright):

```typescript
// tests/e2e/order-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Order Flow', () => {
  test('customer can create a complete order', async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:3000')
    
    // Act - Login
    await page.click('[data-test="login-button"]')
    await page.fill('input[name="email"]', 'customer@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Assert - Logged in
    await expect(page.locator('[data-test="user-menu"]')).toBeVisible()
    
    // Act - Select establishment
    await page.click('[data-test="establishment-1"]')
    await expect(page).toHaveURL(/.*\/establishments\/1/)
    
    // Act - Add items to cart
    await page.click('[data-test="product-1"] [data-test="add-to-cart"]')
    await page.click('[data-test="product-2"] [data-test="add-to-cart"]')
    
    // Assert - Cart updated
    await expect(page.locator('[data-test="cart-count"]')).toHaveText('2')
    
    // Act - Go to cart
    await page.click('[data-test="cart-button"]')
    
    // Assert - Cart page
    await expect(page).toHaveURL(/.*\/cart/)
    await expect(page.locator('[data-test="cart-item"]')).toHaveCount(2)
    
    // Act - Checkout
    await page.fill('input[name="table_number"]', '5')
    await page.click('[data-test="checkout-button"]')
    
    // Assert - Order confirmation
    await expect(page.locator('[data-test="order-success"]')).toBeVisible()
    await expect(page.locator('[data-test="order-number"]')).toContainText('#')
  })
  
  test('validates empty cart checkout', async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:3000/cart')
    
    // Act
    await page.click('[data-test="checkout-button"]')
    
    // Assert
    await expect(page.locator('[data-test="error-message"]'))
      .toContainText('Carrinho vazio')
  })
})
```

### Ferramentas

- **Vitest**: Framework de testes (rápido, Vite-native)
- **Vue Test Utils**: Utilitários para testar componentes Vue
- **Playwright**: E2E testing (recomendado)
- **Cypress**: E2E testing alternativo
- **Testing Library**: Queries semânticas
- **MSW**: Mock Service Worker para API mocking

## 🖥️ Desktop (Electron) - Estratégia de Testes

### Unit Tests

**Main Process**:

```typescript
// tests/unit/main/database.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { Database } from '@/main/database'

describe('Database', () => {
  let db: Database
  
  beforeEach(() => {
    db = new Database(':memory:') // SQLite in-memory
  })
  
  it('creates tables on initialization', () => {
    // Arrange & Act
    db.initialize()
    
    // Assert
    const tables = db.getTables()
    expect(tables).toContain('products')
    expect(tables).toContain('orders')
    expect(tables).toContain('customers')
  })
  
  it('inserts and retrieves product', () => {
    // Arrange
    db.initialize()
    const product = {
      name: 'Pizza',
      price: 35.00,
      establishment_id: 1
    }
    
    // Act
    const id = db.insertProduct(product)
    const retrieved = db.getProduct(id)
    
    // Assert
    expect(retrieved).toMatchObject(product)
    expect(retrieved.id).toBe(id)
  })
})
```

**Renderer Components**:

```typescript
// tests/unit/renderer/components/OrderList.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderList from '@/renderer/components/OrderList.vue'

describe('OrderList', () => {
  it('renders orders', () => {
    // Arrange
    const orders = [
      { id: 1, table_number: 5, total: 50.00, status: 'pending' },
      { id: 2, table_number: 3, total: 75.00, status: 'completed' },
    ]
    
    // Act
    const wrapper = mount(OrderList, {
      props: { orders }
    })
    
    // Assert
    expect(wrapper.findAll('[data-test="order-item"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('Mesa 5')
    expect(wrapper.text()).toContain('R$ 50,00')
  })
})
```

### Integration Tests

**IPC Communication**:

```typescript
// tests/integration/ipc.spec.ts
import { describe, it, expect } from 'vitest'
import { ipcMain, ipcRenderer } from 'electron'
import { setupIPC } from '@/main/ipc'

describe('IPC Communication', () => {
  it('handles get-products request', async () => {
    // Arrange
    setupIPC()
    
    // Act
    const products = await ipcRenderer.invoke('products:getAll', 1)
    
    // Assert
    expect(Array.isArray(products)).toBe(true)
    expect(products[0]).toHaveProperty('id')
    expect(products[0]).toHaveProperty('name')
  })
  
  it('handles create-order request', async () => {
    // Arrange
    const orderData = {
      establishment_id: 1,
      table_number: 5,
      items: [
        { product_id: 1, quantity: 2 }
      ]
    }
    
    // Act
    const order = await ipcRenderer.invoke('orders:create', orderData)
    
    // Assert
    expect(order).toHaveProperty('id')
    expect(order.table_number).toBe(5)
  })
})
```

**SQLite Integration**:

```typescript
// tests/integration/sqlite.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'

describe('SQLite Integration', () => {
  let db: Database.Database
  
  beforeEach(() => {
    db = new Database(':memory:')
    db.exec(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL
      )
    `)
  })
  
  it('performs CRUD operations', () => {
    // Create
    const insert = db.prepare('INSERT INTO products (name, price) VALUES (?, ?)')
    const result = insert.run('Pizza', 35.00)
    const id = result.lastInsertRowid
    
    // Read
    const select = db.prepare('SELECT * FROM products WHERE id = ?')
    const product = select.get(id)
    expect(product).toMatchObject({ name: 'Pizza', price: 35.00 })
    
    // Update
    const update = db.prepare('UPDATE products SET price = ? WHERE id = ?')
    update.run(40.00, id)
    const updated = select.get(id)
    expect(updated.price).toBe(40.00)
    
    // Delete
    const del = db.prepare('DELETE FROM products WHERE id = ?')
    del.run(id)
    const deleted = select.get(id)
    expect(deleted).toBeUndefined()
  })
})
```

### E2E Tests

**Spectron** (ou Playwright para Electron):

```typescript
// tests/e2e/app.spec.ts
import { test, expect, _electron as electron } from '@playwright/test'

test.describe('Electron App', () => {
  test('launches and shows main window', async () => {
    // Launch app
    const app = await electron.launch({
      args: ['main.js']
    })
    
    // Get first window
    const window = await app.firstWindow()
    
    // Check window title
    await expect(window).toHaveTitle('VSmenu Desktop')
    
    // Take screenshot
    await window.screenshot({ path: 'tests/screenshots/main-window.png' })
    
    // Close app
    await app.close()
  })
  
  test('creates an order', async () => {
    // Launch app
    const app = await electron.launch({ args: ['main.js'] })
    const window = await app.firstWindow()
    
    // Navigate to orders
    await window.click('[data-test="orders-menu"]')
    
    // Click new order
    await window.click('[data-test="new-order"]')
    
    // Fill form
    await window.fill('input[name="table"]', '5')
    await window.click('[data-test="product-1"]')
    await window.click('[data-test="submit-order"]')
    
    // Check success
    await expect(window.locator('[data-test="order-success"]')).toBeVisible()
    
    await app.close()
  })
})
```

### Ferramentas

- **Vitest**: Unit tests
- **Electron Mocha**: Alternative test runner
- **Spectron**: E2E testing (deprecated, use Playwright)
- **Playwright**: Modern E2E testing for Electron
- **better-sqlite3**: SQLite testing

## 📱 Mobile (Flutter) - Estratégia de Testes

### Unit Tests

**BLoC Tests**:

```dart
// test/bloc/order_bloc_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:vsmenu/bloc/order_bloc.dart';
import 'package:vsmenu/repositories/order_repository.dart';

class MockOrderRepository extends Mock implements OrderRepository {}

void main() {
  group('OrderBloc', () {
    late OrderRepository repository;
    late OrderBloc bloc;
    
    setUp(() {
      repository = MockOrderRepository();
      bloc = OrderBloc(repository);
    });
    
    tearDown(() {
      bloc.close();
    });
    
    test('initial state is OrderInitial', () {
      expect(bloc.state, equals(OrderInitial()));
    });
    
    blocTest<OrderBloc, OrderState>(
      'emits [OrderLoading, OrderLoaded] when LoadOrders succeeds',
      build: () {
        when(() => repository.getOrders(any()))
          .thenAnswer((_) async => [
            Order(id: 1, total: 50.0),
            Order(id: 2, total: 75.0),
          ]);
        return bloc;
      },
      act: (bloc) => bloc.add(LoadOrders(establishmentId: 1)),
      expect: () => [
        OrderLoading(),
        OrderLoaded(orders: [
          Order(id: 1, total: 50.0),
          Order(id: 2, total: 75.0),
        ]),
      ],
    );
    
    blocTest<OrderBloc, OrderState>(
      'emits [OrderLoading, OrderError] when LoadOrders fails',
      build: () {
        when(() => repository.getOrders(any()))
          .thenThrow(Exception('Failed to load'));
        return bloc;
      },
      act: (bloc) => bloc.add(LoadOrders(establishmentId: 1)),
      expect: () => [
        OrderLoading(),
        OrderError(message: 'Failed to load orders'),
      ],
    );
  });
}
```

**Repository Tests**:

```dart
// test/repositories/order_repository_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:vsmenu/repositories/order_repository.dart';
import 'package:vsmenu/services/api_service.dart';

class MockApiService extends Mock implements ApiService {}

void main() {
  group('OrderRepository', () {
    late ApiService apiService;
    late OrderRepository repository;
    
    setUp(() {
      apiService = MockApiService();
      repository = OrderRepository(apiService);
    });
    
    test('getOrders returns list of orders', () async {
      // Arrange
      when(() => apiService.get('/orders', queryParameters: any(named: 'queryParameters')))
        .thenAnswer((_) async => {
          'data': [
            {'id': 1, 'total': 50.0},
            {'id': 2, 'total': 75.0},
          ]
        });
      
      // Act
      final orders = await repository.getOrders(establishmentId: 1);
      
      // Assert
      expect(orders, hasLength(2));
      expect(orders[0].id, equals(1));
      expect(orders[0].total, equals(50.0));
    });
    
    test('createOrder sends correct data to API', () async {
      // Arrange
      final orderData = {
        'establishment_id': 1,
        'table_number': 5,
        'items': [
          {'product_id': 1, 'quantity': 2}
        ]
      };
      
      when(() => apiService.post('/orders', data: any(named: 'data')))
        .thenAnswer((_) async => {
          'data': {'id': 1, ...orderData}
        });
      
      // Act
      final order = await repository.createOrder(orderData);
      
      // Assert
      expect(order.id, equals(1));
      expect(order.tableNumber, equals(5));
      verify(() => apiService.post('/orders', data: orderData)).called(1);
    });
  });
}
```

### Widget Tests

**UI Components**:

```dart
// test/widgets/product_card_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:vsmenu/widgets/product_card.dart';
import 'package:vsmenu/models/product.dart';

void main() {
  group('ProductCard', () {
    final product = Product(
      id: 1,
      name: 'Pizza Margherita',
      price: 35.0,
      image: 'https://example.com/pizza.jpg',
    );
    
    testWidgets('displays product information', (tester) async {
      // Arrange & Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(product: product),
          ),
        ),
      );
      
      // Assert
      expect(find.text('Pizza Margherita'), findsOneWidget);
      expect(find.text('R\$ 35,00'), findsOneWidget);
      expect(find.byType(Image), findsOneWidget);
    });
    
    testWidgets('calls onTap when tapped', (tester) async {
      // Arrange
      var tapped = false;
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(
              product: product,
              onTap: () => tapped = true,
            ),
          ),
        ),
      );
      
      // Act
      await tester.tap(find.byType(ProductCard));
      await tester.pumpAndSettle();
      
      // Assert
      expect(tapped, isTrue);
    });
    
    testWidgets('shows unavailable badge when not available', (tester) async {
      // Arrange
      final unavailableProduct = product.copyWith(available: false);
      
      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProductCard(product: unavailableProduct),
          ),
        ),
      );
      
      // Assert
      expect(find.text('Indisponível'), findsOneWidget);
      expect(find.byType(ElevatedButton), findsNothing); // Button hidden
    });
  });
}
```

### Integration Tests

**Full App Flows**:

```dart
// integration_test/order_flow_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:vsmenu/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  group('Order Flow', () {
    testWidgets('user can create a complete order', (tester) async {
      // Launch app
      app.main();
      await tester.pumpAndSettle();
      
      // Login
      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();
      
      await tester.enterText(find.byKey(Key('email-field')), 'user@example.com');
      await tester.enterText(find.byKey(Key('password-field')), 'password123');
      await tester.tap(find.byKey(Key('login-button')));
      await tester.pumpAndSettle();
      
      // Select establishment
      await tester.tap(find.text('Estabelecimento 1'));
      await tester.pumpAndSettle();
      
      // Add items to cart
      await tester.tap(find.byKey(Key('add-product-1')));
      await tester.pumpAndSettle();
      
      await tester.tap(find.byKey(Key('add-product-2')));
      await tester.pumpAndSettle();
      
      // Go to cart
      await tester.tap(find.byIcon(Icons.shopping_cart));
      await tester.pumpAndSettle();
      
      // Verify cart items
      expect(find.byKey(Key('cart-item')), findsNWidgets(2));
      
      // Fill table number
      await tester.enterText(find.byKey(Key('table-field')), '5');
      
      // Checkout
      await tester.tap(find.text('Finalizar Pedido'));
      await tester.pumpAndSettle();
      
      // Verify success
      expect(find.text('Pedido criado com sucesso!'), findsOneWidget);
    });
  });
}
```

### Golden Tests

**Visual Regression**:

```dart
// test/golden/product_card_golden_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';

import 'package:vsmenu/widgets/product_card.dart';

void main() {
  group('ProductCard Golden Tests', () {
    testGoldens('renders correctly', (tester) async {
      // Arrange
      final product = Product(
        name: 'Pizza',
        price: 35.0,
        image: 'assets/pizza.jpg',
      );
      
      // Act
      await tester.pumpWidgetBuilder(
        ProductCard(product: product),
        surfaceSize: Size(400, 200),
      );
      
      // Assert
      await screenMatchesGolden(tester, 'product_card_default');
    });
    
    testGoldens('renders unavailable state', (tester) async {
      // Arrange
      final product = Product(
        name: 'Pizza',
        price: 35.0,
        available: false,
      );
      
      // Act
      await tester.pumpWidgetBuilder(
        ProductCard(product: product),
        surfaceSize: Size(400, 200),
      );
      
      // Assert
      await screenMatchesGolden(tester, 'product_card_unavailable');
    });
  });
}
```

### Ferramentas

- **flutter_test**: Framework de testes Flutter
- **bloc_test**: Testing BLoC
- **mocktail**: Mocking
- **integration_test**: Integration testing
- **golden_toolkit**: Golden tests (visual regression)

## 🎯 Padrões de Teste

### Arrange-Act-Assert (AAA)

Estrutura padrão para organizar testes:

```php
/** @test */
public function it_calculates_order_total()
{
    // Arrange (Given) - Setup
    $order = Order::factory()->create();
    $item1 = OrderItem::factory()->create(['price' => 10.00, 'quantity' => 2]);
    $item2 = OrderItem::factory()->create(['price' => 15.00, 'quantity' => 1]);
    $order->items()->saveMany([$item1, $item2]);
    
    $calculator = new OrderCalculator();
    
    // Act (When) - Execute
    $total = $calculator->calculate($order);
    
    // Assert (Then) - Verify
    $this->assertEquals(35.00, $total);
}
```

### Test Doubles

**Mocks** - Simulam comportamento e verificam interações:

```php
// Mock: Verifica que método foi chamado
$notificationService = Mockery::mock(NotificationService::class);
$notificationService->shouldReceive('send')
    ->once()
    ->with($order, 'Order Created');

$orderService = new OrderService($notificationService);
$orderService->createOrder($data);
```

**Stubs** - Retornam valores pré-definidos:

```php
// Stub: Retorna valor fixo
$repository = Mockery::mock(OrderRepository::class);
$repository->shouldReceive('find')
    ->andReturn(new Order(['id' => 1, 'total' => 100]));
```

**Fakes** - Implementações simplificadas:

```php
// Fake: Implementação em memória
Storage::fake('s3');

// Usar normalmente
Storage::disk('s3')->put('file.txt', 'contents');

// Verificar
Storage::disk('s3')->assertExists('file.txt');
```

**Spies** - Observam chamadas sem modificar comportamento:

```php
// Spy: Observa sem modificar
$logger = Mockery::spy(Logger::class);

$service->doSomething(); // Logger é chamado internamente

$logger->shouldHaveReceived('info')->with('Action performed');
```

## 📦 Test Data Management

### Factories

**Laravel Model Factories**:

```php
// database/factories/OrderFactory.php
namespace Database\Factories;

use App\Models\Order;
use App\Models\Establishment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;
    
    public function definition()
    {
        return [
            'establishment_id' => Establishment::factory(),
            'user_id' => User::factory(),
            'table_number' => $this->faker->numberBetween(1, 20),
            'total' => $this->faker->randomFloat(2, 10, 200),
            'status' => $this->faker->randomElement(['pending', 'preparing', 'ready', 'delivered']),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
    
    // States
    public function pending()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }
    
    public function completed()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'delivered',
            'completed_at' => now(),
        ]);
    }
}

// Uso
$order = Order::factory()->pending()->create();
$orders = Order::factory()->count(10)->create();
$order = Order::factory()
    ->hasItems(3)
    ->create();
```

### Fixtures

**Static Test Data**:

```php
// tests/Fixtures/ProductFixtures.php
namespace Tests\Fixtures;

class ProductFixtures
{
    public static function pizza(): array
    {
        return [
            'name' => 'Pizza Margherita',
            'description' => 'Molho de tomate, mussarela, manjericão',
            'price' => 35.00,
            'category_id' => 1,
            'is_active' => true,
        ];
    }
    
    public static function burger(): array
    {
        return [
            'name' => 'Burger Clássico',
            'description' => 'Hambúrguer, queijo, alface, tomate',
            'price' => 25.00,
            'category_id' => 2,
            'is_active' => true,
        ];
    }
    
    public static function all(): array
    {
        return [
            self::pizza(),
            self::burger(),
        ];
    }
}

// Uso
$product = Product::create(ProductFixtures::pizza());
```

### Database Transactions

**Rollback Automático**:

```php
// tests/TestCase.php
namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;
    use RefreshDatabase; // Rollback automático após cada teste
}

// Alternativa: DatabaseTransactions
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ExampleTest extends TestCase
{
    use DatabaseTransactions; // Mais rápido, mas não cria estrutura
    
    /** @test */
    public function it_creates_order()
    {
        $order = Order::create([...]);
        
        // Após teste, rollback automático
    }
}
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/tests.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_DATABASE: testing
          MYSQL_ROOT_PASSWORD: password
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s
      
      redis:
        image: redis:alpine
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, pdo, pdo_mysql, redis
          coverage: xdebug
      
      - name: Install dependencies
        run: composer install --no-interaction --prefer-dist
      
      - name: Run tests
        run: php artisan test --parallel --coverage --min=80
        env:
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_DATABASE: testing
          DB_USERNAME: root
          DB_PASSWORD: password
          REDIS_HOST: 127.0.0.1
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
  
  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Coverage Reports

**Codecov Integration**:

```yaml
# codecov.yml
coverage:
  status:
    project:
      default:
        target: 80%
        threshold: 1%
    patch:
      default:
        target: 80%

ignore:
  - "tests/"
  - "**/*.test.ts"
  - "**/*.spec.ts"
```

## 📁 Organização de Testes

### Estrutura de Diretórios

```
tests/
├── Unit/                          # Unit tests
│   ├── Domain/
│   │   ├── OrderCalculatorTest.php
│   │   └── PriceCalculatorTest.php
│   ├── ValueObjects/
│   │   ├── MoneyTest.php
│   │   └── EmailTest.php
│   └── Services/
│       ├── MenuServiceTest.php
│       └── OrderServiceTest.php
│
├── Feature/                       # Feature tests
│   ├── Api/
│   │   ├── OrderControllerTest.php
│   │   ├── ProductControllerTest.php
│   │   └── AuthControllerTest.php
│   └── Middleware/
│       └── CheckEstablishmentAccessTest.php
│
├── Integration/                   # Integration tests
│   ├── Repositories/
│   │   └── OrderRepositoryTest.php
│   ├── Jobs/
│   │   └── SendOrderNotificationTest.php
│   └── Cache/
│       └── MenuCacheTest.php
│
├── E2E/                          # End-to-end tests
│   ├── order-flow.spec.ts
│   └── menu-browsing.spec.ts
│
├── Fixtures/                     # Test data fixtures
│   ├── ProductFixtures.php
│   └── OrderFixtures.php
│
└── TestCase.php                  # Base test case
```

### Naming Conventions

**Test Classes**:
- `{ClassBeingTested}Test.php`
- Exemplo: `OrderServiceTest.php`

**Test Methods**:
- `test_it_{does_something}()` (snake_case)
- `/** @test */ public function it_does_something()` (annotations)
- Exemplo: `test_it_calculates_total_correctly()`

**E2E Tests**:
- `{feature}-{action}.spec.ts`
- Exemplo: `order-creation.spec.ts`

## ✅ Best Practices

### 1. Test Isolation

```php
// ❌ Testes dependentes
public function test_step_1() {
    $this->user = User::create([...]);
}

public function test_step_2() {
    $this->user->orders()->create([...]); // Depende de test_step_1
}

// ✅ Testes independentes
public function test_creates_order() {
    $user = User::factory()->create();
    $order = $user->orders()->create([...]);
    
    $this->assertDatabaseHas('orders', [...]);
}
```

### 2. Fast Tests

```php
// ❌ Teste lento
public function test_sends_email() {
    Mail::to('user@example.com')->send(new OrderCreated($order));
    
    sleep(2); // Aguarda e-mail ser enviado
    
    $this->assertTrue(/* verifica se e-mail foi enviado */);
}

// ✅ Teste rápido
public function test_queues_email() {
    Mail::fake();
    
    $this->orderService->createOrder($data);
    
    Mail::assertQueued(OrderCreated::class);
}
```

### 3. Readable Tests

```php
// ❌ Difícil de entender
public function test_1() {
    $u = User::factory()->create();
    $o = $u->orders()->create(['t' => 100]);
    $this->assertEquals(100, $o->t);
}

// ✅ Claro e legível
public function test_it_creates_order_with_correct_total() {
    // Arrange
    $user = User::factory()->create();
    $expectedTotal = 100.00;
    
    // Act
    $order = $user->orders()->create(['total' => $expectedTotal]);
    
    // Assert
    $this->assertEquals($expectedTotal, $order->total);
}
```

### 4. One Assert Per Concept

```php
// ✅ Um conceito por teste
public function test_it_creates_order_with_correct_data() {
    $order = Order::create($this->orderData);
    
    // Verificar dados do order (um conceito)
    $this->assertEquals($this->orderData['total'], $order->total);
    $this->assertEquals($this->orderData['table_number'], $order->table_number);
    $this->assertEquals('pending', $order->status);
}

public function test_it_creates_order_items() {
    $order = Order::create($this->orderData);
    
    // Verificar items (conceito diferente, teste separado)
    $this->assertCount(2, $order->items);
}
```

## 🚀 Performance Testing

### Load Testing (K6)

```javascript
// tests/performance/api-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp to 100
    { duration: '3m', target: 100 }, // Stay at 100
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% < 500ms
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  },
};

export default function() {
  // GET menu
  let menuRes = http.get('https://api.vsmenu.com/api/establishments/1/menu');
  check(menuRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
  
  // POST order
  let orderRes = http.post(
    'https://api.vsmenu.com/api/orders',
    JSON.stringify({
      establishment_id: 1,
      items: [{ product_id: 1, quantity: 2 }]
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(orderRes, {
    'order created': (r) => r.status === 201,
  });
  
  sleep(2);
}
```

### Stress Testing

```javascript
// tests/performance/stress-test.js
export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '5m', target: 300 },
    { duration: '2m', target: 400 }, // Break point?
    { duration: '5m', target: 400 },
    { duration: '5m', target: 0 },
  ],
};
```

## 📚 Referências

### Testing Best Practices
- [Laravel Testing Documentation](https://laravel.com/docs/testing)
- [Vue.js Testing Guide](https://vuejs.org/guide/scaling-up/testing.html)
- [Flutter Testing](https://docs.flutter.dev/testing)
- [Electron Testing](https://www.electronjs.org/docs/latest/tutorial/automated-testing)

### Testing Tools
- [PHPUnit](https://phpunit.de/)
- [Pest PHP](https://pestphp.com/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [K6 Load Testing](https://k6.io/)

### Testing Patterns
- [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Testing Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Test Doubles](https://martinfowler.com/bliki/TestDouble.html)

---

## 📖 Documentos Relacionados

- [📋 Overview da Arquitetura](./index.md)
- [⚡ Estratégia de Performance](./performance.md)
- [📊 Estratégia de Escalabilidade](./scalability.md)
- [🔐 Arquitetura de Segurança](./security.md)
- [📊 Fluxo de Dados](./data-flow.md)

---

<div align="center">

**[⬅️ Voltar para Overview da Arquitetura](./index.md)**

</div>
