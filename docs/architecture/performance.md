---
title: Estratégia de Performance
description: Otimizações e métricas de performance do VSmenu 2.0
---

# Estratégia de Performance

Documentação completa das estratégias, otimizações e boas práticas de performance do VSmenu 2.0.

## ⚡ Visão Geral

A performance do VSmenu 2.0 é fundamental para garantir uma experiência de usuário excepcional. Nossa estratégia foca em:

1. **Response Time**: API responses < 200ms (P95)
2. **Page Load**: First Contentful Paint < 1.5s
3. **Database Queries**: < 50ms (P95)
4. **Cache Hit Rate**: > 95%
5. **Bundle Size**: Web < 500KB inicial
6. **Mobile Performance**: Smooth 60 FPS

### Princípios de Performance

1. **Measure First**: Sempre medir antes de otimizar
2. **Progressive Enhancement**: Funcionalidade básica rápida, melhorias progressivas
3. **Lazy Loading**: Carregar apenas o necessário
4. **Caching Everywhere**: Cache em múltiplas camadas
5. **Async by Default**: Operações assíncronas sempre que possível

## 📊 Métricas de Performance

### API Metrics

**Response Time** (latência):

```
Target:
- P50: < 50ms
- P95: < 200ms
- P99: < 500ms

Critical Endpoints:
- GET /api/menus/:id: < 100ms (P95)
- POST /api/orders: < 300ms (P95)
- GET /api/products: < 150ms (P95)
```

**Throughput** (requisições por segundo):

```
Target:
- Normal: 1.000 req/s por instância
- Peak: 3.000 req/s (com auto-scaling)
```

**Error Rate**:

```
Target:
- 4xx errors: < 1%
- 5xx errors: < 0.1%
```

**Apdex Score**:

```
Target: > 0.95
Satisfied: < 100ms
Tolerating: 100-400ms
Frustrated: > 400ms
```

### Frontend Metrics

**Core Web Vitals**:

```
Largest Contentful Paint (LCP): < 2.5s
First Input Delay (FID): < 100ms
Cumulative Layout Shift (CLS): < 0.1
```

**Performance Metrics**:

```
First Contentful Paint (FCP): < 1.5s
Time to Interactive (TTI): < 3.5s
Speed Index: < 3.0s
Total Blocking Time (TBT): < 200ms
```

**Resource Metrics**:

```
Initial Bundle Size: < 500KB (gzipped)
Total Page Weight: < 2MB
Number of Requests: < 50
```

### Database Metrics

**Query Performance**:

```
Average Query Time: < 10ms
P95 Query Time: < 50ms
P99 Query Time: < 100ms
Slow Queries (> 1s): 0
```

**Connection Pool**:

```
Active Connections: < 80% of max
Connection Wait Time: < 10ms
Connection Errors: < 0.1%
```

**Cache Hit Rate**:

```
Query Cache: > 90%
Buffer Pool: > 95%
```

## 🖥️ Performance do Backend (API)

### Query Optimization

**1. N+1 Queries Prevention**

❌ **Problema - N+1 Queries**:

```php
// N+1 problem - 1 query + N queries
$orders = Order::all(); // 1 query
foreach ($orders as $order) {
    echo $order->user->name; // N queries (uma para cada order)
    foreach ($order->items as $item) { // N queries
        echo $item->product->name; // N * M queries
    }
}
// Total: 1 + N + N*M queries
```

✅ **Solução - Eager Loading**:

```php
// Eager loading - 3 queries total
$orders = Order::with(['user', 'items.product'])->get();
foreach ($orders as $order) {
    echo $order->user->name; // Sem query adicional
    foreach ($order->items as $item) {
        echo $item->product->name; // Sem query adicional
    }
}
// Total: 3 queries (orders, users, items+products)
```

**2. Query Scoping**

```php
// Adicionar scopes para queries comuns
class Product extends Model
{
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->whereNull('deleted_at');
    }
    
    public function scopeForEstablishment($query, $establishmentId)
    {
        return $query->where('establishment_id', $establishmentId);
    }
    
    public function scopeWithCategories($query)
    {
        return $query->with('category');
    }
}

// Uso eficiente
$products = Product::active()
    ->forEstablishment($establishmentId)
    ->withCategories()
    ->get();
```

**3. Select Específico**

```php
// ❌ Select *
$users = User::all(); // Carrega todas as colunas

// ✅ Select apenas necessário
$users = User::select('id', 'name', 'email')->get();

// ✅ Com relacionamentos
$orders = Order::select('id', 'total', 'status', 'user_id')
    ->with(['user:id,name,email'])
    ->get();
```

**4. Chunk para Grandes Volumes**

```php
// ❌ Carregar tudo na memória
$products = Product::all(); // Pode estourar memória

// ✅ Processar em chunks
Product::chunk(200, function ($products) {
    foreach ($products as $product) {
        // Processar produto
    }
});

// ✅ Lazy collection (melhor para grandes volumes)
Product::lazy()->each(function ($product) {
    // Processar produto
});
```

**5. Query Cache**

```php
// Cache de queries pesadas
public function getSalesReport($establishmentId, $date)
{
    $cacheKey = "sales_report:{$establishmentId}:{$date}";
    
    return Cache::remember($cacheKey, 3600, function () use ($establishmentId, $date) {
        return DB::table('orders')
            ->where('establishment_id', $establishmentId)
            ->whereDate('created_at', $date)
            ->selectRaw('
                COUNT(*) as total_orders,
                SUM(total) as revenue,
                AVG(total) as average_ticket,
                COUNT(DISTINCT customer_id) as unique_customers
            ')
            ->first();
    });
}
```

### Database Indexing

**Índices Estratégicos**:

```sql
-- 1. Primary Keys (automático)
PRIMARY KEY (id)

-- 2. Foreign Keys (sempre indexar)
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_establishment_id ON orders(establishment_id);
CREATE INDEX idx_products_category_id ON products(category_id);

-- 3. Colunas de filtro frequente
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_products_is_active ON products(is_active);

-- 4. Índices compostos (ordem importa!)
CREATE INDEX idx_orders_establishment_status_created 
    ON orders(establishment_id, status, created_at DESC);

-- 5. Índices para ordenação
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);

-- 6. Índices full-text para busca
CREATE FULLTEXT INDEX idx_products_search 
    ON products(name, description);

-- 7. Índices parciais (apenas dados relevantes)
CREATE INDEX idx_active_products 
    ON products(establishment_id, category_id, name) 
    WHERE is_active = true AND deleted_at IS NULL;

-- 8. Covering indexes (include extra columns)
CREATE INDEX idx_orders_covering 
    ON orders(establishment_id, created_at DESC)
    INCLUDE (id, total, status);
```

**Análise de Índices**:

```sql
-- Verificar uso de índices
EXPLAIN SELECT * FROM orders 
WHERE establishment_id = 123 
  AND status = 'pending' 
ORDER BY created_at DESC 
LIMIT 20;

-- Índices não utilizados
SELECT 
    s.table_name,
    s.index_name,
    s.rows_read
FROM 
    performance_schema.table_io_waits_summary_by_index_usage s
WHERE 
    s.rows_read = 0 
    AND s.index_name IS NOT NULL
ORDER BY 
    s.table_name;

-- Queries lentas
SELECT 
    SUBSTRING(digest_text, 1, 100) AS query,
    count_star AS exec_count,
    avg_timer_wait / 1000000000 AS avg_time_ms,
    sum_rows_examined AS rows_examined
FROM 
    performance_schema.events_statements_summary_by_digest
WHERE 
    avg_timer_wait > 100000000 -- > 100ms
ORDER BY 
    avg_timer_wait DESC
LIMIT 20;
```

### Caching

**Application Cache (Redis)**:

```php
// config/cache.php
'stores' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'cache',
        'lock_connection' => 'default',
    ],
],

// Cache service
class CacheService
{
    // Cache simples com TTL
    public function rememberMenu($establishmentId)
    {
        return Cache::remember(
            "menu:{$establishmentId}",
            3600, // 1 hora
            fn() => Menu::with('categories.items')
                ->where('establishment_id', $establishmentId)
                ->first()
        );
    }
    
    // Cache com tags (invalidação granular)
    public function rememberProduct($productId)
    {
        $product = Product::findOrFail($productId);
        
        return Cache::tags([
            'products',
            "establishment:{$product->establishment_id}",
            "product:{$productId}"
        ])->remember(
            "product:{$productId}",
            3600,
            fn() => $product
        );
    }
    
    // Invalidação de cache
    public function invalidateProduct($productId)
    {
        $product = Product::find($productId);
        
        Cache::tags([
            "product:{$productId}",
            "establishment:{$product->establishment_id}"
        ])->flush();
    }
    
    // Cache de agregações pesadas
    public function getDashboardStats($establishmentId)
    {
        return Cache::tags("establishment:{$establishmentId}")
            ->remember("dashboard_stats:{$establishmentId}", 300, function () use ($establishmentId) {
                return [
                    'orders_today' => Order::today()->count(),
                    'revenue_today' => Order::today()->sum('total'),
                    'active_tables' => Table::active()->count(),
                    'pending_orders' => Order::pending()->count(),
                ];
            });
    }
}
```

**Cache Warming**:

```php
// app/Console/Commands/WarmCache.php
class WarmCache extends Command
{
    protected $signature = 'cache:warm {--establishments=*}';
    
    public function handle()
    {
        $this->info('Starting cache warming...');
        
        $establishments = $this->option('establishments') 
            ? Establishment::whereIn('id', $this->option('establishments'))->get()
            : Establishment::active()->get();
        
        $bar = $this->output->createProgressBar($establishments->count());
        
        foreach ($establishments as $establishment) {
            // Warm menu cache
            Cache::remember(
                "menu:{$establishment->id}",
                3600,
                fn() => Menu::with('categories.items')
                    ->where('establishment_id', $establishment->id)
                    ->first()
            );
            
            // Warm products cache
            Cache::remember(
                "products:{$establishment->id}",
                3600,
                fn() => Product::where('establishment_id', $establishment->id)
                    ->active()
                    ->get()
            );
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info('Cache warming completed!');
    }
}
```

### Response Compression

**Gzip/Brotli Compression**:

```nginx
# nginx.conf
http {
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        application/atom+xml
        image/svg+xml;
    
    # Brotli compression (melhor que gzip)
    brotli on;
    brotli_comp_level 6;
    brotli_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        application/atom+xml
        image/svg+xml;
}
```

**Laravel Response Compression**:

```php
// app/Http/Middleware/CompressResponse.php
class CompressResponse
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        
        // Apenas comprimir responses grandes
        if ($response->getStatusCode() === 200 
            && strlen($response->getContent()) > 1024) {
            
            $acceptEncoding = $request->header('Accept-Encoding', '');
            
            // Brotli (melhor compressão)
            if (str_contains($acceptEncoding, 'br')) {
                $compressed = brotli_compress($response->getContent(), 6);
                $response->setContent($compressed);
                $response->header('Content-Encoding', 'br');
            }
            // Gzip (fallback)
            elseif (str_contains($acceptEncoding, 'gzip')) {
                $compressed = gzencode($response->getContent(), 6);
                $response->setContent($compressed);
                $response->header('Content-Encoding', 'gzip');
            }
            
            $response->header('Vary', 'Accept-Encoding');
        }
        
        return $response;
    }
}
```

### Connection Pooling

**Database Connection Pool**:

```php
// config/database.php
'connections' => [
    'mysql' => [
        'driver' => 'mysql',
        'host' => env('DB_HOST'),
        'database' => env('DB_DATABASE'),
        'username' => env('DB_USERNAME'),
        'password' => env('DB_PASSWORD'),
        
        // Connection pooling
        'options' => [
            PDO::ATTR_PERSISTENT => true,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_STRINGIFY_FETCHES => false,
        ],
        
        // Pool settings
        'pool' => [
            'min' => 5,
            'max' => 20,
        ],
    ],
],
```

**Redis Connection Pool**:

```php
// config/database.php
'redis' => [
    'client' => 'phpredis',
    
    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', 'vsmenu:'),
    ],
    
    'default' => [
        'host' => env('REDIS_HOST'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT'),
        'database' => 0,
        'read_timeout' => 60,
        'persistent' => true, // Conexões persistentes
    ],
],
```

### Code Profiling

**Telescope para Development**:

```php
// config/telescope.php
'watchers' => [
    Watchers\QueryWatcher::class => [
        'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
        'slow' => 100, // Queries > 100ms
    ],
    
    Watchers\RequestWatcher::class => [
        'enabled' => env('TELESCOPE_REQUEST_WATCHER', true),
        'size_limit' => 64,
    ],
],
```

**Blackfire para Production**:

```bash
# Instalar Blackfire
composer require blackfire/php-sdk

# Profiling de endpoint específico
blackfire curl https://api.vsmenu.com/api/establishments/1/menu

# Comparar duas versões
blackfire curl https://api.vsmenu.com/api/orders --samples 10
```

**XHProf para Análise Profunda**:

```php
// Habilitar profiling
if (extension_loaded('xhprof')) {
    xhprof_enable(XHPROF_FLAGS_CPU + XHPROF_FLAGS_MEMORY);
}

// Seu código aqui
$menu = Menu::with('categories.items')->first();

// Coletar dados
if (extension_loaded('xhprof')) {
    $data = xhprof_disable();
    
    // Salvar para análise
    file_put_contents(
        "/tmp/xhprof/" . uniqid() . ".xhprof",
        serialize($data)
    );
}
```

## 🌐 Performance do Frontend Web

### Code Splitting

**Route-based Splitting**:

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "home" */ '@/views/HomeView.vue')
  },
  {
    path: '/menu',
    component: () => import(/* webpackChunkName: "menu" */ '@/views/MenuView.vue')
  },
  {
    path: '/orders',
    component: () => import(/* webpackChunkName: "orders" */ '@/views/OrdersView.vue')
  },
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ '@/views/AdminView.vue')
  },
]

export default createRouter({
  history: createWebHistory(),
  routes
})
```

**Component Lazy Loading**:

```vue
<template>
  <div>
    <!-- Componente carregado apenas quando necessário -->
    <Suspense>
      <template #default>
        <HeavyComponent v-if="showHeavy" />
      </template>
      <template #fallback>
        <LoadingSpinner />
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// Lazy load de componente pesado
const HeavyComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
)
</script>
```

**Dynamic Imports**:

```typescript
// Importar módulo apenas quando necessário
async function loadChart() {
  const { Chart } = await import('chart.js')
  return new Chart(ctx, config)
}

// Importar utilidade pesada
async function processImage(file: File) {
  const { compressImage } = await import('@/utils/imageProcessing')
  return compressImage(file)
}
```

### Asset Optimization

**Vite Configuration**:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({ // Analisar bundle size
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  
  build: {
    // Minificação
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.log em produção
        drop_debugger: true,
      },
    },
    
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['@headlessui/vue', '@heroicons/vue'],
          
          // Feature chunks
          'admin': [
            './src/views/admin/UsersView.vue',
            './src/views/admin/SettingsView.vue',
          ],
        },
      },
    },
    
    // Otimizar chunk size
    chunkSizeWarningLimit: 500, // 500KB
  },
  
  // Otimizar dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
  },
})
```

**Tree Shaking**:

```typescript
// ❌ Importar tudo
import _ from 'lodash'
import moment from 'moment'

// ✅ Importar apenas necessário
import { debounce, throttle } from 'lodash-es'
import dayjs from 'dayjs' // Alternativa mais leve ao moment
```

### Image Optimization

**Lazy Loading**:

```vue
<template>
  <!-- Native lazy loading -->
  <img 
    :src="product.image" 
    :alt="product.name"
    loading="lazy"
    decoding="async"
  />
  
  <!-- Vue component com lazy loading -->
  <LazyImage 
    :src="product.image"
    :placeholder="product.thumbnail"
    :alt="product.name"
  />
</template>
```

**Responsive Images**:

```vue
<template>
  <!-- Servir diferentes tamanhos -->
  <picture>
    <source 
      :srcset="`${product.image_small} 400w, ${product.image_medium} 800w, ${product.image_large} 1200w`"
      sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
      type="image/webp"
    />
    <img 
      :src="product.image_medium" 
      :alt="product.name"
      loading="lazy"
    />
  </picture>
</template>
```

**WebP Format**:

```typescript
// Converter para WebP no upload
import sharp from 'sharp'

async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1200, 1200, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: 80,
      effort: 6,
    })
    .toBuffer()
}
```

**Image CDN**:

```typescript
// Usar CDN com transformações on-the-fly
function getImageUrl(path: string, options: ImageOptions = {}): string {
  const { width, height, quality = 80, format = 'webp' } = options
  
  const params = new URLSearchParams({
    w: width?.toString() || '',
    h: height?.toString() || '',
    q: quality.toString(),
    f: format,
  })
  
  return `https://cdn.vsmenu.com/${path}?${params}`
}

// Uso
<img :src="getImageUrl(product.image, { width: 400, format: 'webp' })" />
```

### Rendering Optimization

**Virtual Scrolling**:

```vue
<template>
  <RecycleScroller
    :items="products"
    :item-size="100"
    key-field="id"
    v-slot="{ item }"
  >
    <ProductCard :product="item" />
  </RecycleScroller>
</template>

<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
</script>
```

**Debouncing/Throttling**:

```vue
<template>
  <input 
    v-model="searchQuery"
    @input="debouncedSearch"
    placeholder="Buscar produtos..."
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const searchQuery = ref('')

const performSearch = (query: string) => {
  // Busca no servidor
  api.get('/products/search', { params: { q: query } })
}

const debouncedSearch = useDebounceFn(() => {
  performSearch(searchQuery.value)
}, 300) // Aguarda 300ms após última digitação
</script>
```

**Memoization**:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const orders = ref<Order[]>([])

// Computed é automaticamente memoizado
const totalRevenue = computed(() => {
  return orders.value.reduce((sum, order) => sum + order.total, 0)
})

// Para cálculos mais complexos, usar useMemo
import { useMemo } from '@vueuse/core'

const expensiveCalculation = useMemo(() => {
  // Cálculo pesado aqui
  return orders.value
    .filter(o => o.status === 'completed')
    .map(o => calculateMetrics(o))
    .reduce((acc, metrics) => mergeMetrics(acc, metrics), {})
})
</script>
```

### Service Workers (PWA)

**Caching Strategy**:

```typescript
// src/service-worker.ts
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { 
  CacheFirst, 
  NetworkFirst, 
  StaleWhileRevalidate 
} from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Precache de assets críticos
precacheAndRoute(self.__WB_MANIFEST)

// Cache-first para imagens
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
)

// Stale-while-revalidate para API
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutos
      }),
    ],
  })
)

// Network-first para dados críticos
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/orders'),
  new NetworkFirst({
    cacheName: 'orders',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60, // 1 minuto
      }),
    ],
  })
)
```

## 🖥️ Performance do Desktop (Electron)

### Local Database (SQLite)

**Otimização de SQLite**:

```typescript
// src/database/connection.ts
import Database from 'better-sqlite3'

const db = new Database('vsmenu.db', {
  verbose: console.log
})

// Otimizações de performance
db.pragma('journal_mode = WAL') // Write-Ahead Logging (melhor performance)
db.pragma('synchronous = NORMAL') // Menos sync, mais rápido
db.pragma('cache_size = 10000') // Cache de 10MB
db.pragma('temp_store = MEMORY') // Tabelas temp em memória
db.pragma('mmap_size = 30000000000') // Memory-mapped I/O

// Índices estratégicos
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_products_establishment 
    ON products(establishment_id);
  
  CREATE INDEX IF NOT EXISTS idx_orders_establishment_date 
    ON orders(establishment_id, created_at DESC);
  
  CREATE INDEX IF NOT EXISTS idx_order_items_order 
    ON order_items(order_id);
`)

export default db
```

**Queries Otimizadas**:

```typescript
// Prepared statements (mais rápido)
const getProductsByEstablishment = db.prepare(`
  SELECT id, name, price, image
  FROM products
  WHERE establishment_id = ?
    AND is_active = 1
  ORDER BY category_id, name
`)

// Uso
const products = getProductsByEstablishment.all(establishmentId)

// Transações para múltiplas operações
const insertMany = db.transaction((items) => {
  const insert = db.prepare(`
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (?, ?, ?, ?)
  `)
  
  for (const item of items) {
    insert.run(item.orderId, item.productId, item.quantity, item.price)
  }
})

// Executar transação (muito mais rápido)
insertMany(orderItems)
```

### IPC Optimization

**Efficient IPC Communication**:

```typescript
// main/ipc-handlers.ts
import { ipcMain } from 'electron'

// Batch operations (reduzir chamadas IPC)
ipcMain.handle('products:getBatch', async (event, productIds: number[]) => {
  // Uma chamada IPC para múltiplos produtos
  return db.prepare(`
    SELECT * FROM products WHERE id IN (${productIds.map(() => '?').join(',')})
  `).all(...productIds)
})

// Streaming para grandes volumes
ipcMain.handle('orders:export', async (event, filters) => {
  const orders = db.prepare(`
    SELECT * FROM orders WHERE establishment_id = ?
  `).iterate(filters.establishmentId)
  
  for (const order of orders) {
    // Enviar em chunks
    event.sender.send('orders:export:chunk', order)
  }
  
  event.sender.send('orders:export:complete')
})

// Cache de dados frequentes
const menuCache = new Map()

ipcMain.handle('menu:get', async (event, establishmentId) => {
  if (menuCache.has(establishmentId)) {
    return menuCache.get(establishmentId)
  }
  
  const menu = getMenuFromDB(establishmentId)
  menuCache.set(establishmentId, menu)
  
  return menu
})
```

### UI Rendering

**Virtual Lists**:

```vue
<template>
  <VirtualList
    :items="products"
    :item-height="80"
    :buffer="5"
  >
    <template #item="{ item }">
      <ProductRow :product="item" />
    </template>
  </VirtualList>
</template>
```

**Lazy Loading de Imagens**:

```vue
<template>
  <div v-for="product in products" :key="product.id">
    <img 
      v-lazy="`file://${product.localImage}`"
      :alt="product.name"
    />
  </div>
</template>
```

### Sync Optimization

**Incremental Sync**:

```typescript
// src/services/SyncService.ts
export class SyncService {
  async syncEstablishmentData(establishmentId: string): Promise<void> {
    const lastSync = await this.getLastSyncTimestamp(establishmentId)
    
    // Sincronizar apenas mudanças desde último sync
    const changes = await api.get(`/sync/${establishmentId}`, {
      params: { 
        since: lastSync,
        include: ['menu', 'products', 'orders']
      }
    })
    
    // Aplicar mudanças em transação
    await this.applyChanges(changes.data)
    
    // Atualizar timestamp
    await this.setLastSyncTimestamp(establishmentId, new Date())
  }
  
  async applyChanges(changes: SyncChanges): Promise<void> {
    const applyTransaction = db.transaction(() => {
      // Aplicar todas as mudanças atomicamente
      for (const product of changes.products) {
        if (product.deleted) {
          db.prepare('DELETE FROM products WHERE id = ?').run(product.id)
        } else {
          db.prepare(`
            INSERT INTO products (id, name, price, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              price = excluded.price,
              updated_at = excluded.updated_at
          `).run(product.id, product.name, product.price, product.updated_at)
        }
      }
    })
    
    applyTransaction()
  }
}
```

## 📱 Performance Mobile (React Native)

### Bundle Size Optimization

**Code Splitting**:

```typescript
// App.tsx
import React, { lazy, Suspense } from 'react'
import { NavigationContainer } from '@react-navigation/native'

// Lazy load de telas
const MenuScreen = lazy(() => import('./screens/MenuScreen'))
const OrdersScreen = lazy(() => import('./screens/OrdersScreen'))
const AdminScreen = lazy(() => import('./screens/AdminScreen'))

export default function App() {
  return (
    <NavigationContainer>
      <Suspense fallback={<LoadingScreen />}>
        <Stack.Navigator>
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Orders" component={OrdersScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
        </Stack.Navigator>
      </Suspense>
    </NavigationContainer>
  )
}
```

**Metro Configuration**:

```javascript
// metro.config.js
module.exports = {
  transformer: {
    minifierConfig: {
      compress: {
        drop_console: true, // Remover console.log
      },
    },
  },
  resolver: {
    // Usar versões leves de bibliotecas
    resolverMainFields: ['react-native', 'browser', 'main'],
  },
}
```

### Network Optimization

**Request Batching**:

```typescript
// src/services/BatchService.ts
class BatchService {
  private queue: Request[] = []
  private timer: NodeJS.Timeout | null = null
  
  async request(endpoint: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ endpoint, data, resolve, reject })
      
      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), 50) // Batch a cada 50ms
      }
    })
  }
  
  private async flush() {
    const batch = this.queue.splice(0)
    this.timer = null
    
    if (batch.length === 0) return
    
    try {
      // Enviar todas as requisições em um único request
      const response = await api.post('/batch', {
        requests: batch.map(r => ({
          endpoint: r.endpoint,
          data: r.data,
        }))
      })
      
      // Resolver todas as promises
      response.data.forEach((result: any, index: number) => {
        if (result.error) {
          batch[index].reject(result.error)
        } else {
          batch[index].resolve(result.data)
        }
      })
    } catch (error) {
      batch.forEach(r => r.reject(error))
    }
  }
}

// Uso
await batchService.request('/products/view', { id: 123 })
```

**Response Compression**:

```typescript
// src/api/client.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.vsmenu.com',
  headers: {
    'Accept-Encoding': 'gzip, deflate, br',
  },
  decompress: true, // Descomprimir automaticamente
})
```

### Local Storage Optimization

**SQLite Performance**:

```typescript
import SQLite from 'react-native-sqlite-storage'

const db = await SQLite.openDatabase({
  name: 'vsmenu.db',
  location: 'default',
})

// Otimizações
await db.executeSql('PRAGMA journal_mode = WAL')
await db.executeSql('PRAGMA synchronous = NORMAL')
await db.executeSql('PRAGMA cache_size = 10000')

// Query otimizada
const [results] = await db.executeSql(`
  SELECT p.*, c.name as category_name
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.establishment_id = ?
    AND p.is_active = 1
  ORDER BY c.order, p.name
`, [establishmentId])
```

**AsyncStorage Optimization**:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'

// Batch operations
const storeMultiple = async (items: [string, string][]) => {
  try {
    await AsyncStorage.multiSet(items)
  } catch (error) {
    console.error('Failed to save items', error)
  }
}

// Uso
await storeMultiple([
  ['user:1', JSON.stringify(user)],
  ['settings', JSON.stringify(settings)],
  ['cache:menu', JSON.stringify(menu)],
])
```

### Rendering Optimization

**FlatList Optimization**:

```tsx
<FlatList
  data={products}
  renderItem={({ item }) => <ProductCard product={item} />}
  keyExtractor={item => item.id.toString()}
  
  // Otimizações
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  
  // Item height fixo (melhor performance)
  getItemLayout={(data, index) => ({
    length: 100,
    offset: 100 * index,
    index,
  })}
  
  // Memoização
  ItemSeparatorComponent={ItemSeparator}
  ListEmptyComponent={EmptyList}
/>
```

**Image Caching**:

```tsx
import FastImage from 'react-native-fast-image'

<FastImage
  source={{
    uri: product.image,
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable,
  }}
  resizeMode={FastImage.resizeMode.cover}
  style={styles.image}
/>
```

## 🗄️ Database Performance

### Read Replicas

**Configuração de Read Replicas**:

```php
// config/database.php
'connections' => [
    'mysql' => [
        'read' => [
            'host' => [
                env('DB_READ_HOST_1', '127.0.0.1'),
                env('DB_READ_HOST_2', '127.0.0.1'),
            ],
        ],
        'write' => [
            'host' => [env('DB_WRITE_HOST', '127.0.0.1')],
        ],
        'sticky' => true,
    ],
],
```

**Uso Estratégico**:

```php
// Leitura automática usa réplicas
$products = Product::where('establishment_id', $id)->get();

// Escrita usa master
$product = Product::create($data);

// Forçar uso de master para leitura crítica
DB::connection('mysql')->useWriteConnection();
$order = Order::find($orderId);
```

### Query Optimization Patterns

**Subqueries Otimizadas**:

```php
// ❌ N+1 com subquery
$establishments = Establishment::all();
foreach ($establishments as $establishment) {
    $orderCount = $establishment->orders()->count();
}

// ✅ Subquery eficiente
$establishments = Establishment::select('establishments.*')
    ->selectSub(
        Order::selectRaw('COUNT(*)')
            ->whereColumn('orders.establishment_id', 'establishments.id'),
        'order_count'
    )
    ->get();
```

**Window Functions**:

```sql
-- Ranking de produtos por vendas
SELECT 
    p.id,
    p.name,
    SUM(oi.quantity) as total_sold,
    RANK() OVER (
        PARTITION BY p.establishment_id 
        ORDER BY SUM(oi.quantity) DESC
    ) as rank_in_establishment
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name, p.establishment_id
HAVING rank_in_establishment <= 10;
```

**Common Table Expressions (CTE)**:

```sql
-- Hierarquia de categorias
WITH RECURSIVE category_tree AS (
    -- Categorias raiz
    SELECT id, name, parent_id, 1 as level
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Categorias filhas
    SELECT c.id, c.name, c.parent_id, ct.level + 1
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree
ORDER BY level, name;
```

## 💾 Caching Strategy

### Multi-Layer Caching

**Layer 1 - Browser Cache**:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /api/ {
    add_header Cache-Control "no-cache, private";
}
```

**Layer 2 - CDN Cache**:

```typescript
// CloudFront cache behavior
{
  "PathPattern": "/assets/*",
  "TargetOriginId": "S3-Assets",
  "ViewerProtocolPolicy": "redirect-to-https",
  "MinTTL": 0,
  "DefaultTTL": 86400,
  "MaxTTL": 31536000,
  "Compress": true
}
```

**Layer 3 - Application Cache**:

```php
// Redis cache com TTL
Cache::put('key', $value, 3600);

// Cache com tags
Cache::tags(['products', 'establishment:123'])
    ->put('products:123', $products, 3600);

// Cache forever (até invalidação manual)
Cache::forever('settings', $settings);
```

**Layer 4 - Database Cache**:

```sql
-- Query cache MySQL
SET SESSION query_cache_type = ON;

-- Buffer pool
SET GLOBAL innodb_buffer_pool_size = 8589934592; -- 8GB
```

### Cache Invalidation Strategies

**Time-based (TTL)**:

```php
// Expira após tempo definido
Cache::put('menu:123', $menu, 3600); // 1 hora
```

**Event-based**:

```php
// Invalidar quando dados mudam
Event::listen(ProductUpdated::class, function ($event) {
    Cache::tags([
        "product:{$event->product->id}",
        "establishment:{$event->product->establishment_id}"
    ])->flush();
});
```

**Write-through**:

```php
// Atualizar cache ao escrever
public function updateProduct($id, $data)
{
    $product = Product::findOrFail($id);
    $product->update($data);
    
    // Atualizar cache imediatamente
    Cache::put("product:{$id}", $product, 3600);
    
    return $product;
}
```

## 🌐 Network Performance

### HTTP/2

**Enable HTTP/2**:

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name api.vsmenu.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # HTTP/2 push
    location = /index.html {
        http2_push /css/main.css;
        http2_push /js/app.js;
    }
}
```

### Keep-Alive

**Connection Reuse**:

```nginx
# nginx.conf
http {
    keepalive_timeout 65;
    keepalive_requests 100;
    
    upstream api {
        server api1.internal:3000;
        server api2.internal:3000;
        
        keepalive 32;
    }
}
```

### CDN Configuration

**Geographic Distribution**:

```typescript
// CloudFront distribution
{
  "PriceClass": "PriceClass_All",
  "Locations": {
    "Quantity": 3,
    "Items": [
      "us-east-1",
      "sa-east-1",  // São Paulo
      "eu-west-1"
    ]
  }
}
```

## 📊 Ferramentas de Monitoramento

### Application Performance Monitoring (APM)

**New Relic**:

```php
// config/newrelic.php
return [
    'app_name' => env('NEW_RELIC_APP_NAME', 'VSmenu API'),
    'license_key' => env('NEW_RELIC_LICENSE_KEY'),
    'transaction_tracer' => [
        'enabled' => true,
        'threshold' => 'apdex_f',
        'slow_sql' => true,
    ],
];
```

**Sentry**:

```typescript
// src/main.ts
import * as Sentry from '@sentry/vue'

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
    }),
  ],
  tracesSampleRate: 0.1,
  tracePropagationTargets: ['api.vsmenu.com'],
})
```

### Profiling Tools

**Laravel Telescope**:

```bash
# Instalar
composer require laravel/telescope

# Publicar
php artisan telescope:install
php artisan migrate

# Acessar
http://localhost/telescope
```

**Chrome DevTools**:

```typescript
// Performance monitoring
performance.mark('start-load-menu')

await loadMenu()

performance.mark('end-load-menu')
performance.measure('load-menu', 'start-load-menu', 'end-load-menu')

const measure = performance.getEntriesByName('load-menu')[0]
console.log(`Menu loaded in ${measure.duration}ms`)
```

### Logging

**Structured Logging**:

```php
// Monolog configuration
'channels' => [
    'performance' => [
        'driver' => 'daily',
        'path' => storage_path('logs/performance.log'),
        'level' => 'info',
        'days' => 14,
    ],
],

// Uso
Log::channel('performance')->info('Slow query detected', [
    'query' => $query,
    'duration' => $duration,
    'bindings' => $bindings,
]);
```

## 🎯 Otimizações Específicas

### Menu Loading

```php
// Otimizado para carregamento rápido
public function getMenu($establishmentId)
{
    return Cache::tags("establishment:{$establishmentId}")
        ->remember("menu:{$establishmentId}", 3600, function () use ($establishmentId) {
            return Menu::select('id', 'name', 'description')
                ->with([
                    'categories:id,menu_id,name,order',
                    'categories.items' => function ($query) {
                        $query->select('id', 'category_id', 'name', 'price', 'image')
                            ->where('is_active', true)
                            ->orderBy('order');
                    }
                ])
                ->where('establishment_id', $establishmentId)
                ->first();
        });
}
```

### Order Creation

```php
// Otimizado com queue para operações pesadas
public function createOrder(CreateOrderRequest $request)
{
    $order = DB::transaction(function () use ($request) {
        // Criar order (rápido)
        $order = Order::create($request->validated());
        
        // Criar items (rápido)
        $order->items()->createMany($request->items);
        
        return $order;
    });
    
    // Enfileirar operações pesadas (assíncrono)
    NotifyKitchenJob::dispatch($order);
    UpdateInventoryJob::dispatch($order);
    SendConfirmationJob::dispatch($order);
    
    // Resposta imediata
    return response()->json($order, 201);
}
```

### Dashboard Stats

```php
// Cache de estatísticas pesadas
public function getDashboardStats($establishmentId)
{
    return Cache::remember("dashboard:{$establishmentId}", 300, function () use ($establishmentId) {
        return [
            'orders_today' => Order::today()
                ->where('establishment_id', $establishmentId)
                ->count(),
                
            'revenue_today' => Order::today()
                ->where('establishment_id', $establishmentId)
                ->where('status', 'completed')
                ->sum('total'),
                
            'top_products' => DB::table('order_items')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->where('products.establishment_id', $establishmentId)
                ->whereDate('order_items.created_at', today())
                ->select('products.name', DB::raw('SUM(order_items.quantity) as quantity'))
                ->groupBy('products.id', 'products.name')
                ->orderByDesc('quantity')
                ->limit(5)
                ->get(),
        ];
    });
}
```

## 📈 Benchmarks

### Baseline Performance

**API Response Times** (atual):

```
GET /api/establishments/:id/menu
├─ P50: 45ms
├─ P95: 180ms
└─ P99: 420ms

POST /api/orders
├─ P50: 120ms
├─ P95: 380ms
└─ P99: 850ms

GET /api/products
├─ P50: 35ms
├─ P95: 140ms
└─ P99: 320ms
```

**Frontend Performance** (atual):

```
First Contentful Paint: 1.2s
Largest Contentful Paint: 2.1s
Time to Interactive: 3.2s
Total Blocking Time: 180ms
Cumulative Layout Shift: 0.08
```

**Database Performance** (atual):

```
Average Query Time: 8ms
P95 Query Time: 42ms
P99 Query Time: 95ms
Slow Queries (>1s): 0
Cache Hit Rate: 94%
```

### Performance Targets

**API Targets**:

```
Response Time (P95): < 200ms
Throughput: > 1000 req/s
Error Rate: < 0.1%
Apdex Score: > 0.95
```

**Frontend Targets**:

```
LCP: < 2.5s
FID: < 100ms
CLS: < 0.1
TTI: < 3.5s
Bundle Size: < 500KB
```

**Database Targets**:

```
Query Time (P95): < 50ms
Cache Hit Rate: > 95%
Connection Pool Usage: < 80%
```

### Load Testing Results

**Test Configuration**:

```javascript
// k6 load test
export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
  },
}
```

**Results**:

```
Scenario: Menu Loading
├─ Users: 200 concurrent
├─ Duration: 5 minutes
├─ Total Requests: 60,000
├─ Success Rate: 99.95%
├─ Avg Response Time: 85ms
├─ P95 Response Time: 178ms
└─ Throughput: 200 req/s

Scenario: Order Creation
├─ Users: 100 concurrent
├─ Duration: 5 minutes
├─ Total Requests: 15,000
├─ Success Rate: 99.98%
├─ Avg Response Time: 245ms
├─ P95 Response Time: 420ms
└─ Throughput: 50 req/s
```

## 📚 Referências

### Performance Best Practices
- [Google Web Vitals](https://web.dev/vitals/)
- [Laravel Performance](https://laravel.com/docs/performance)
- [Vue.js Performance](https://vuejs.org/guide/best-practices/performance.html)
- [React Native Performance](https://reactnative.dev/docs/performance)

### Profiling Tools
- [Laravel Telescope](https://laravel.com/docs/telescope)
- [Blackfire.io](https://blackfire.io/)
- [New Relic](https://newrelic.com/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

### Database Optimization
- [MySQL Performance Tuning](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)

### CDN & Caching
- [CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)
- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## 📖 Documentos Relacionados

- [📋 Overview da Arquitetura](./index.md)
- [📊 Estratégia de Escalabilidade](./scalability.md)
- [🔐 Arquitetura de Segurança](./security.md)
- [🧪 Estratégia de Testes](./testing.md)
- [📊 Fluxo de Dados](./data-flow.md)

---

<div align="center">

**[⬅️ Voltar para Overview da Arquitetura](./index.md)**

</div>
