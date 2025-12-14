---
title: Estratégia de Escalabilidade
description: Como o VSmenu 2.0 escala horizontal e verticalmente
---

# Estratégia de Escalabilidade

Documentação completa das estratégias de escalabilidade do VSmenu 2.0, incluindo padrões, métricas e planos de crescimento.

## 📊 Visão Geral

A escalabilidade do VSmenu 2.0 é projetada para suportar crescimento tanto em número de usuários quanto em volume de dados, utilizando uma combinação de:

1. **Escalabilidade Horizontal**: Adicionar mais instâncias
2. **Escalabilidade Vertical**: Aumentar recursos de instâncias existentes
3. **Caching Multi-camada**: Reduzir carga no banco de dados
4. **Database Scaling**: Réplicas e otimizações
5. **Queue System**: Processamento assíncrono
6. **CDN**: Distribuição de conteúdo estático

## 🎯 Princípios de Escalabilidade

### 1. Stateless Design
**Conceito**: Serviços não mantêm estado entre requisições.

**Implementação**:
- Sessões em Redis (não em memória local)
- Tokens JWT/Sanctum (sem sessão server-side)
- Upload de arquivos direto para S3
- Workers independentes e replicáveis

**Benefícios**:
- ✅ Facilita load balancing
- ✅ Permite escalar horizontalmente
- ✅ Simplifica deployments
- ✅ Aumenta resiliência

### 2. Horizontal vs Vertical

**Horizontal (Scale Out)**:
- Adicionar mais servidores/instâncias
- Melhor para: API, Workers, Frontend
- Limite: Praticamente ilimitado
- Custo: Linear

**Vertical (Scale Up)**:
- Aumentar CPU/RAM/Storage
- Melhor para: Database, Cache
- Limite: Hardware disponível
- Custo: Exponencial

### 3. Database Scaling
**Conceito**: Distribuir carga de leitura e otimizar escritas.

**Estratégias**:
- Read replicas para consultas
- Índices otimizados
- Query optimization
- Connection pooling

### 4. Caching Strategy
**Conceito**: Múltiplas camadas de cache para reduzir latência.

**Camadas**:
1. Browser/App Cache
2. CDN Cache
3. Application Cache (Redis)
4. Database Cache (Query Cache)

## ⚖️ Escalabilidade Horizontal

### Load Balancing

**Configuração** (AWS Application Load Balancer):

```yaml
# terraform/alb.tf
resource "aws_lb" "api" {
  name               = "vsmenu-api-lb"
  internal           = false
  load_balancer_type = "application"
  subnets            = var.public_subnets
  security_groups    = [aws_security_group.alb.id]

  enable_deletion_protection = true
  enable_http2              = true
  enable_cross_zone_load_balancing = true
}

resource "aws_lb_target_group" "api" {
  name     = "vsmenu-api-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    interval            = 30
    path                = "/health"
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = false  # stateless design
  }
}
```

**Health Checks**:

```php
// routes/web.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String(),
        'database' => DB::connection()->getPdo() ? 'ok' : 'error',
        'cache' => Cache::store('redis')->get('health') ? 'ok' : 'error',
    ]);
});
```

**Distribuição de Carga**:
- Round Robin (padrão)
- Least Connections (para workloads desiguais)
- IP Hash (não recomendado - stateless)

### Stateless Services

**Design Stateless** na API:

```php
// NÃO FAZER - Stateful
class OrderController extends Controller
{
    private $currentOrder; // Estado local ❌
    
    public function addItem(Request $request)
    {
        $this->currentOrder->addItem($request->item);
    }
}

// FAZER - Stateless
class OrderController extends Controller
{
    public function addItem(Request $request)
    {
        $order = Order::findOrFail($request->order_id);
        $order->addItem($request->item);
        $order->save();
        
        return response()->json($order);
    }
}
```

**Session Management**:

```php
// config/session.php
return [
    'driver' => 'redis', // não 'file'
    'connection' => 'session',
    'store' => 'session',
];

// Para API, usar tokens
'defaults' => [
    'guard' => 'sanctum',
],
```

### Database Sharding

::: warning Implementação Futura
Database sharding está planejado para a **fase 2** (após 1 milhão de estabelecimentos).
:::

**Estratégia de Sharding** (futuro):

```
Shard Key: tenant_id (establishment_id)

Shard 1: tenant_id % 4 == 0
Shard 2: tenant_id % 4 == 1
Shard 3: tenant_id % 4 == 2
Shard 4: tenant_id % 4 == 3
```

**Vantagens**:
- ✅ Distribui carga de escrita
- ✅ Isola dados por tenant
- ✅ Permite crescimento ilimitado

**Desafios**:
- ❌ Queries cross-shard complexas
- ❌ Rebalanceamento de shards
- ❌ Transações distribuídas

### CDN (Content Delivery Network)

**CloudFront Configuration**:

```typescript
// terraform/cloudfront.tf
resource "aws_cloudfront_distribution" "assets" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id   = "S3-Assets"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Assets"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400   # 1 dia
    max_ttl     = 31536000 # 1 ano

    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["BR"] # Otimizado para Brasil
    }
  }
}
```

**Assets Estáticos**:
- Imagens de produtos
- Logos de estabelecimentos
- CSS/JS bundles
- Fontes
- Ícones

**Edge Caching**:
- Cache em múltiplas localizações (Edge Locations)
- Reduz latência para usuários distantes
- Reduz carga no origin server

### Caching Layers

**Multi-layer Caching Strategy**:

```
┌─────────────────────────────────────────┐
│ 1. Browser Cache (HTTP Headers)        │ ← 0ms
├─────────────────────────────────────────┤
│ 2. CDN Cache (CloudFront)              │ ← 10ms
├─────────────────────────────────────────┤
│ 3. Application Cache (Redis)           │ ← 50ms
├─────────────────────────────────────────┤
│ 4. Database Query Cache                │ ← 100ms
├─────────────────────────────────────────┤
│ 5. Database (Aurora)                   │ ← 200ms
└─────────────────────────────────────────┘
```

**Implementação**:

```php
// app/Services/MenuService.php
class MenuService
{
    public function getMenu(int $establishmentId): Menu
    {
        // Layer 3: Application Cache
        return Cache::tags(['menu', "establishment:{$establishmentId}"])
            ->remember("menu:{$establishmentId}", 3600, function () use ($establishmentId) {
                // Layer 5: Database
                return Menu::with(['categories.items'])
                    ->where('establishment_id', $establishmentId)
                    ->first();
            });
    }
    
    public function invalidateMenu(int $establishmentId): void
    {
        Cache::tags(["establishment:{$establishmentId}"])->flush();
    }
}
```

## 📈 Escalabilidade Vertical

### Resource Scaling

**CPU Scaling**:
- API: 2-8 vCPUs por instância
- Workers: 2-4 vCPUs por worker
- Database: 4-16 vCPUs

**RAM Scaling**:
- API: 4-16 GB por instância
- Workers: 2-8 GB por worker
- Database: 16-64 GB
- Redis: 8-32 GB

**Storage Scaling**:
- Database: 100 GB → 1 TB (Aurora auto-scaling)
- Redis: 8 GB → 64 GB
- S3: Ilimitado (pay per use)

### Database Optimization

**Índices Estratégicos**:

```sql
-- Índice para queries por establishment
CREATE INDEX idx_menus_establishment_id ON menus(establishment_id);
CREATE INDEX idx_orders_establishment_id ON orders(establishment_id);
CREATE INDEX idx_products_establishment_id ON products(establishment_id);

-- Índice composto para queries comuns
CREATE INDEX idx_orders_establishment_status_created 
    ON orders(establishment_id, status, created_at DESC);

-- Índice para buscas
CREATE INDEX idx_products_name_gin ON products USING gin(to_tsvector('portuguese', name));

-- Índice parcial para dados ativos
CREATE INDEX idx_active_products ON products(establishment_id) 
    WHERE is_active = true;
```

**Query Optimization**:

```php
// ❌ N+1 Problem
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->user->name; // Query adicional para cada order
}

// ✅ Eager Loading
$orders = Order::with('user')->get();
foreach ($orders as $order) {
    echo $order->user->name; // Sem queries adicionais
}

// ✅ Lazy Eager Loading (quando necessário)
$orders = Order::all();
$orders->load('user', 'items.product');

// ✅ Select apenas colunas necessárias
$orders = Order::select('id', 'total', 'status')
    ->with(['user:id,name', 'items:id,order_id,quantity'])
    ->get();
```

### Code Optimization

**Processamento Assíncrono**:

```php
// ❌ Processamento síncrono (bloqueia resposta)
public function createOrder(CreateOrderRequest $request)
{
    $order = Order::create($request->validated());
    
    // Bloqueia por ~2 segundos
    $this->notifyKitchen($order);
    $this->sendEmailConfirmation($order);
    $this->updateInventory($order);
    
    return response()->json($order);
}

// ✅ Processamento assíncrono (resposta imediata)
public function createOrder(CreateOrderRequest $request)
{
    $order = Order::create($request->validated());
    
    // Enfileira jobs (resposta imediata)
    NotifyKitchenJob::dispatch($order);
    SendOrderConfirmationJob::dispatch($order);
    UpdateInventoryJob::dispatch($order);
    
    return response()->json($order);
}
```

**Caching de Resultados Pesados**:

```php
// Cache de relatórios pesados
public function getSalesReport(int $establishmentId, Carbon $date)
{
    $cacheKey = "sales_report:{$establishmentId}:{$date->format('Y-m-d')}";
    
    return Cache::remember($cacheKey, 3600, function () use ($establishmentId, $date) {
        return DB::table('orders')
            ->where('establishment_id', $establishmentId)
            ->whereDate('created_at', $date)
            ->selectRaw('
                COUNT(*) as total_orders,
                SUM(total) as total_sales,
                AVG(total) as average_ticket,
                COUNT(DISTINCT customer_id) as unique_customers
            ')
            ->first();
    });
}
```

## 🏗️ Escalabilidade por Componente

### API (Laravel)

**Horizontal Scaling**:

```yaml
# docker-compose.prod.yml
services:
  api-1:
    image: vsmenu/api:latest
    environment:
      - APP_ENV=production
      - REDIS_HOST=redis-cluster
      - DB_HOST=aurora-primary
    deploy:
      replicas: 3  # 3+ instâncias
      
  api-2:
    image: vsmenu/api:latest
    # ... mesmas configs
```

**Connection Pooling**:

```php
// config/database.php
'connections' => [
    'mysql' => [
        // ...
        'pool' => [
            'min' => 5,
            'max' => 20,
        ],
        'options' => [
            PDO::ATTR_PERSISTENT => true,
        ],
    ],
],
```

**Queue Workers**:

```bash
# Múltiplos workers por tipo de job
php artisan queue:work redis --queue=orders --sleep=3 --tries=3 --max-jobs=1000 &
php artisan queue:work redis --queue=notifications --sleep=3 --tries=3 --max-jobs=1000 &
php artisan queue:work redis --queue=reports --sleep=3 --tries=3 --max-jobs=1000 &
```

**Auto-scaling Configuration**:

```yaml
# kubernetes/api-deployment.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vsmenu-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vsmenu-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Frontend Web

**CDN Distribution**:
- Build assets servidos via CloudFront
- Cache de 1 ano com content hashing
- Compressão gzip/brotli
- HTTP/2 push para recursos críticos

**Code Splitting**:

```typescript
// src/router/index.ts
const routes = [
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
```

**Service Workers** (PWA):

```typescript
// src/service-worker.ts
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'

// Precache de assets críticos
precacheAndRoute(self.__WB_MANIFEST)

// Cache-first para imagens
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
)

// Network-first para API
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5 minutos
      }),
    ],
  })
)
```

### Desktop (Electron)

**Local Optimization**:
- SQLite local para dados offline
- Sincronização incremental (apenas deltas)
- Compressão de dados sincronizados
- Background sync (não bloqueia UI)

**Sync Optimization**:

```typescript
// src/services/SyncService.ts
export class SyncService {
  async syncEstablishmentData(establishmentId: string): Promise<void> {
    const lastSync = await this.getLastSyncTimestamp(establishmentId)
    
    // Sincroniza apenas mudanças desde último sync
    const changes = await api.get(`/sync/${establishmentId}`, {
      params: { since: lastSync }
    })
    
    // Aplica mudanças localmente
    await this.applyChanges(changes.data)
    
    // Atualiza timestamp
    await this.setLastSyncTimestamp(establishmentId, new Date())
  }
  
  async batchSync(establishmentIds: string[]): Promise<void> {
    // Sincroniza em lotes de 10
    const batches = chunk(establishmentIds, 10)
    
    for (const batch of batches) {
      await Promise.all(
        batch.map(id => this.syncEstablishmentData(id))
      )
    }
  }
}
```

### Mobile (React Native)

**Offline Capabilities**:

```typescript
// src/services/OfflineService.ts
import NetInfo from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'

export class OfflineService {
  private queue: QueuedRequest[] = []
  
  async queueRequest(request: QueuedRequest): Promise<void> {
    this.queue.push(request)
    await AsyncStorage.setItem('request_queue', JSON.stringify(this.queue))
  }
  
  async processQueue(): Promise<void> {
    const state = await NetInfo.fetch()
    
    if (!state.isConnected) return
    
    while (this.queue.length > 0) {
      const request = this.queue[0]
      
      try {
        await api.request(request)
        this.queue.shift()
      } catch (error) {
        if (error.status >= 500) {
          break // Retry later
        } else {
          this.queue.shift() // Remove bad request
        }
      }
    }
    
    await AsyncStorage.setItem('request_queue', JSON.stringify(this.queue))
  }
}
```

**Data Optimization**:

```typescript
// Paginação eficiente
async function loadOrders(page: number = 1): Promise<Order[]> {
  const response = await api.get('/orders', {
    params: {
      page,
      per_page: 20,
      // Campos mínimos necessários
      fields: 'id,number,total,status,created_at'
    }
  })
  
  return response.data
}

// Compressão de imagens
import ImageResizer from 'react-native-image-resizer'

async function uploadProductImage(uri: string): Promise<string> {
  // Redimensiona e comprime antes de enviar
  const resized = await ImageResizer.createResizedImage(
    uri,
    800, // width
    800, // height
    'JPEG',
    80, // quality
  )
  
  const formData = new FormData()
  formData.append('image', {
    uri: resized.uri,
    type: 'image/jpeg',
    name: 'product.jpg',
  })
  
  const response = await api.post('/products/images', formData)
  return response.data.url
}
```

## 🗄️ Database Scaling

### Read Replicas

**Aurora Read Replicas**:

```yaml
# terraform/rds.tf
resource "aws_rds_cluster" "aurora" {
  cluster_identifier = "vsmenu-aurora-cluster"
  engine            = "aurora-mysql"
  engine_version    = "8.0.mysql_aurora.3.04.0"
  
  master_username = var.db_username
  master_password = var.db_password
  
  backup_retention_period = 7
  preferred_backup_window = "03:00-04:00"
}

# Writer instance
resource "aws_rds_cluster_instance" "writer" {
  identifier         = "vsmenu-aurora-writer"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.r6g.xlarge"
  engine             = aws_rds_cluster.aurora.engine
}

# Reader instances (2+)
resource "aws_rds_cluster_instance" "reader" {
  count              = 2
  identifier         = "vsmenu-aurora-reader-${count.index + 1}"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.r6g.large"
  engine             = aws_rds_cluster.aurora.engine
}
```

**Load Distribution**:

```php
// config/database.php
'connections' => [
    'mysql' => [
        'read' => [
            'host' => [
                env('DB_READ_HOST_1'),
                env('DB_READ_HOST_2'),
            ],
        ],
        'write' => [
            'host' => [env('DB_WRITE_HOST')],
        ],
        'sticky' => true, // Leituras na mesma transação usam writer
    ],
],

// Uso explícito
DB::connection('mysql')->select(...); // Usa read replica
DB::connection('mysql')->statement(...); // Usa writer
```

### Partitioning

**Table Partitioning** (orders por data):

```sql
-- Particionamento por range (data)
CREATE TABLE orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    establishment_id INT UNSIGNED NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id, created_at)
)
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION pfuture VALUES LESS THAN MAXVALUE
);

-- Particionamento por hash (distribuição uniforme)
CREATE TABLE order_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id, order_id)
)
PARTITION BY HASH(order_id)
PARTITIONS 8;
```

**Benefícios**:
- ✅ Queries mais rápidas (partition pruning)
- ✅ Manutenção mais fácil (drop partition antiga)
- ✅ Backup/restore mais rápido
- ✅ Melhor gerenciamento de dados históricos

### Indexing Strategy

**Índices Essenciais**:

```sql
-- 1. Primary Keys (automaticamente indexadas)
PRIMARY KEY (id)

-- 2. Foreign Keys (devem ser indexadas)
CREATE INDEX idx_orders_establishment_id ON orders(establishment_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- 3. Colunas de filtro comum
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_is_active ON products(is_active);

-- 4. Índices compostos para queries específicas
CREATE INDEX idx_orders_establishment_status_date 
    ON orders(establishment_id, status, created_at DESC);

-- 5. Índices para ordenação
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- 6. Índices full-text para busca
CREATE FULLTEXT INDEX idx_products_search 
    ON products(name, description);

-- 7. Índices parciais (somente dados relevantes)
CREATE INDEX idx_active_products 
    ON products(establishment_id, category_id) 
    WHERE is_active = true AND deleted_at IS NULL;
```

**Análise de Performance**:

```sql
-- Verificar queries lentas
SHOW FULL PROCESSLIST;

-- Analisar query plan
EXPLAIN SELECT * FROM orders 
WHERE establishment_id = 123 
  AND status = 'pending' 
ORDER BY created_at DESC 
LIMIT 20;

-- Índices não utilizados
SELECT 
    s.table_name,
    s.index_name,
    s.rows_read,
    s.rows_inserted
FROM 
    performance_schema.table_io_waits_summary_by_index_usage s
WHERE 
    s.rows_read = 0 
    AND s.index_name IS NOT NULL
ORDER BY 
    s.table_name;
```

### Query Optimization

**Otimizações Comuns**:

```php
// ❌ Select *
$orders = DB::select('SELECT * FROM orders WHERE establishment_id = ?', [$id]);

// ✅ Select apenas colunas necessárias
$orders = DB::select(
    'SELECT id, number, total, status, created_at FROM orders WHERE establishment_id = ?',
    [$id]
);

// ❌ Queries em loop
foreach ($orderIds as $orderId) {
    $order = Order::find($orderId);
}

// ✅ Bulk query
$orders = Order::whereIn('id', $orderIds)->get();

// ❌ Sem paginação
$products = Product::where('establishment_id', $id)->get();

// ✅ Com paginação
$products = Product::where('establishment_id', $id)->paginate(50);

// ❌ Sem índices
WHERE YEAR(created_at) = 2024

// ✅ Com índices (sargable)
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'
```

## 💾 Caching Strategy

### Multi-layer Caching

**Layer 1: Browser Cache**

```nginx
# nginx.conf
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /api/ {
    add_header Cache-Control "no-cache, private";
}
```

**Layer 2: CDN Cache (CloudFront)**

```typescript
// cloudfront-functions/cache-key.js
function handler(event) {
    var request = event.request
    var uri = request.uri
    
    // Normalizar query strings para melhor cache hit rate
    if (request.querystring) {
        var params = new URLSearchParams(request.querystring)
        
        // Remover parâmetros de tracking
        params.delete('utm_source')
        params.delete('utm_medium')
        params.delete('fbclid')
        
        request.querystring = params.toString()
    }
    
    return request
}
```

**Layer 3: Application Cache (Redis)**

```php
// app/Services/CacheService.php
class CacheService
{
    // Cache simples
    public function rememberMenu(int $establishmentId): Menu
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
    public function rememberProduct(int $productId): Product
    {
        $product = Product::find($productId);
        
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
    
    // Cache de queries pesadas
    public function getSalesReport(int $establishmentId, string $period): array
    {
        return Cache::remember(
            "sales_report:{$establishmentId}:{$period}",
            1800, // 30 minutos
            fn() => $this->calculateSalesReport($establishmentId, $period)
        );
    }
}
```

**Layer 4: Database Query Cache**

```php
// config/database.php
'mysql' => [
    'options' => [
        PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true,
    ],
],
```

### Cache Invalidation

**Estratégias de Invalidação**:

```php
// 1. Time-based (TTL)
Cache::put('key', $value, 3600); // Expira em 1 hora

// 2. Event-based
class ProductUpdated
{
    public function __construct(public Product $product) {}
}

class InvalidateProductCache
{
    public function handle(ProductUpdated $event): void
    {
        Cache::tags([
            "product:{$event->product->id}",
            "establishment:{$event->product->establishment_id}"
        ])->flush();
    }
}

// 3. Manual (em operações CRUD)
class ProductController extends Controller
{
    public function update(Request $request, Product $product)
    {
        $product->update($request->validated());
        
        // Invalidar caches relacionados
        Cache::tags([
            "product:{$product->id}",
            "menu:{$product->establishment_id}"
        ])->flush();
        
        return response()->json($product);
    }
}

// 4. Pattern-based
Cache::flush(); // Flush tudo (cuidado!)
Cache::tags('products')->flush(); // Flush apenas products
```

**Cache Stampede Prevention**:

```php
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class MenuService
{
    public function getMenuSafe(int $establishmentId): Menu
    {
        $cacheKey = "menu:{$establishmentId}";
        $lockKey = "lock:{$cacheKey}";
        
        // Tenta obter do cache
        $menu = Cache::get($cacheKey);
        if ($menu) return $menu;
        
        // Tenta adquirir lock
        $lock = Redis::set($lockKey, 1, 'EX', 10, 'NX');
        
        if ($lock) {
            // Este processo irá regenerar o cache
            try {
                $menu = Menu::with('categories.items')
                    ->where('establishment_id', $establishmentId)
                    ->first();
                
                Cache::put($cacheKey, $menu, 3600);
                
                return $menu;
            } finally {
                Redis::del($lockKey);
            }
        } else {
            // Aguarda outro processo regenerar
            sleep(1);
            return $this->getMenuSafe($establishmentId);
        }
    }
}
```

### Cache Warming

**Pré-carregamento de Cache**:

```php
// app/Console/Commands/WarmCache.php
class WarmCache extends Command
{
    protected $signature = 'cache:warm';
    
    public function handle(): void
    {
        $this->info('Warming cache...');
        
        // Menus dos estabelecimentos ativos
        Establishment::active()->chunk(100, function ($establishments) {
            foreach ($establishments as $establishment) {
                Cache::remember(
                    "menu:{$establishment->id}",
                    3600,
                    fn() => Menu::with('categories.items')
                        ->where('establishment_id', $establishment->id)
                        ->first()
                );
            }
        });
        
        // Produtos populares
        Product::popular()->chunk(100, function ($products) {
            foreach ($products as $product) {
                Cache::remember(
                    "product:{$product->id}",
                    3600,
                    fn() => $product
                );
            }
        });
        
        $this->info('Cache warmed successfully!');
    }
}

// Agendar warming
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    $schedule->command('cache:warm')
        ->dailyAt('03:00');
}
```

## 📊 Queue Scaling

### Multiple Workers

**Worker Configuration**:

```bash
# config/horizon.php (Laravel Horizon)
'environments' => [
    'production' => [
        'supervisor-1' => [
            'connection' => 'redis',
            'queue' => ['orders', 'default'],
            'balance' => 'auto',
            'minProcesses' => 5,
            'maxProcesses' => 20,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
            'tries' => 3,
            'timeout' => 60,
        ],
        
        'supervisor-2' => [
            'connection' => 'redis',
            'queue' => ['notifications'],
            'balance' => 'auto',
            'minProcesses' => 3,
            'maxProcesses' => 10,
            'tries' => 5,
            'timeout' => 30,
        ],
        
        'supervisor-3' => [
            'connection' => 'redis',
            'queue' => ['reports'],
            'balance' => 'auto',
            'minProcesses' => 2,
            'maxProcesses' => 5,
            'tries' => 3,
            'timeout' => 300, // 5 minutos para relatórios
        ],
    ],
],
```

**Auto-scaling Workers**:

```yaml
# kubernetes/horizon-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vsmenu-horizon
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: horizon
        image: vsmenu/api:latest
        command: ["php", "artisan", "horizon"]
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vsmenu-horizon-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vsmenu-horizon
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Pods
    pods:
      metric:
        name: queue_size
      target:
        type: AverageValue
        averageValue: "100"
```

### Queue Priorities

**Priority Queues**:

```php
// Definir prioridades
ProcessOrder::dispatch($order)->onQueue('orders-high');
SendNotification::dispatch($notification)->onQueue('notifications-medium');
GenerateReport::dispatch($report)->onQueue('reports-low');

// Worker processa por prioridade
php artisan queue:work redis --queue=orders-high,orders-medium,orders-low,default
```

**Processing Order**:

```php
// app/Jobs/ProcessOrder.php
class ProcessOrder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;
    
    public $tries = 3;
    public $timeout = 60;
    public $backoff = [10, 30, 60]; // Retry delays
    
    public function __construct(
        public Order $order,
        public int $priority = 1
    ) {
        // Priority 0 = highest, 10 = lowest
        $queueName = match(true) {
            $priority <= 2 => 'orders-high',
            $priority <= 5 => 'orders-medium',
            default => 'orders-low',
        };
        
        $this->onQueue($queueName);
    }
}
```

### Dead Letter Queue

**Handling Failed Jobs**:

```php
// app/Jobs/ProcessOrder.php
class ProcessOrder implements ShouldQueue
{
    public function failed(Throwable $exception): void
    {
        // Notificar equipe
        Log::error('Failed to process order', [
            'order_id' => $this->order->id,
            'exception' => $exception->getMessage(),
        ]);
        
        // Mover para dead letter queue
        DeadLetterJob::create([
            'job_type' => self::class,
            'job_data' => serialize($this->order),
            'exception' => $exception->getMessage(),
            'failed_at' => now(),
        ]);
        
        // Notificar admin
        AdminNotification::dispatch(
            'Order Processing Failed',
            "Order #{$this->order->id} failed after {$this->tries} attempts"
        );
    }
}

// Comando para reprocessar dead letters
php artisan queue:retry all
php artisan queue:retry 1,2,3
```

## 📈 Métricas e Monitoramento

### Performance Metrics

**Latency** (Tempo de Resposta):

```php
// Middleware de medição
class MeasureRequestDuration
{
    public function handle(Request $request, Closure $next)
    {
        $start = microtime(true);
        
        $response = $next($request);
        
        $duration = (microtime(true) - $start) * 1000; // ms
        
        // Registrar métrica
        Metrics::histogram('http_request_duration_ms', $duration, [
            'method' => $request->method(),
            'route' => $request->route()->getName(),
            'status' => $response->status(),
        ]);
        
        // Log de requests lentos
        if ($duration > 1000) { // > 1s
            Log::warning('Slow request detected', [
                'url' => $request->fullUrl(),
                'duration' => $duration,
            ]);
        }
        
        return $response;
    }
}
```

**Throughput** (Requisições por Segundo):

```php
// Coletar RPS
Metrics::increment('http_requests_total', 1, [
    'method' => $request->method(),
    'endpoint' => $request->route()->getName(),
]);

// Query Prometheus
rate(http_requests_total[1m])  # RPS por minuto
```

**Error Rates**:

```php
// Registrar erros
Metrics::increment('http_requests_total', 1, [
    'status' => $response->status(),
]);

// Query Prometheus
rate(http_requests_total{status=~"5.."}[5m]) # Erros 5xx últimos 5 min
```

### Resource Metrics

**CPU Usage**:

```yaml
# prometheus/alerts.yml
groups:
- name: cpu
  rules:
  - alert: HighCPUUsage
    expr: avg(rate(process_cpu_seconds_total[5m])) > 0.8
    for: 5m
    annotations:
      summary: "High CPU usage detected"
```

**Memory Usage**:

```php
// Monitorar uso de memória
Metrics::gauge('memory_usage_bytes', memory_get_usage(true));
Metrics::gauge('memory_peak_bytes', memory_get_peak_usage(true));
```

**Disk I/O**:

```bash
# Monitorar I/O no host
iostat -x 1
```

### Business Metrics

**Requests per Second**:

```php
// Dashboard query
rate(http_requests_total[1m])
```

**Concurrent Users**:

```php
// Rastrear usuários ativos
class TrackActiveUsers
{
    public function handle(Request $request, Closure $next)
    {
        if ($user = $request->user()) {
            Redis::setex(
                "active_user:{$user->id}",
                300, // 5 minutos
                now()->timestamp
            );
        }
        
        return $next($request);
    }
}

// Contar usuários ativos
$activeUsers = Redis::keys('active_user:*');
Metrics::gauge('active_users_total', count($activeUsers));
```

**Active Tenants**:

```php
// Rastrear estabelecimentos ativos
$activeTenants = Redis::zcount('active_establishments', now()->subMinutes(5)->timestamp, now()->timestamp);
Metrics::gauge('active_tenants_total', $activeTenants);
```

### Monitoring Stack

**Prometheus + Grafana**:

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'
  
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
  
  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
  
  redis-exporter:
    image: oliver006/redis_exporter:latest
    ports:
      - "9121:9121"
    environment:
      - REDIS_ADDR=redis:6379

volumes:
  prometheus-data:
  grafana-data:
```

**Alerting**:

```yaml
# prometheus/alerts.yml
groups:
- name: application
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate ({{ $value }})"
      
  - alert: SlowResponseTime
    expr: histogram_quantile(0.95, http_request_duration_ms) > 1000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Slow response time (P95: {{ $value }}ms)"
      
  - alert: HighQueueSize
    expr: queue_jobs_pending > 1000
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Queue size too high ({{ $value }} jobs)"
```

## 🎯 Padrões de Escalabilidade

### Caching Patterns

**1. Cache-Aside (Lazy Loading)**:

```php
function getProduct(int $id): Product
{
    $cached = Cache::get("product:{$id}");
    if ($cached) return $cached;
    
    $product = Product::findOrFail($id);
    Cache::put("product:{$id}", $product, 3600);
    
    return $product;
}
```

**2. Write-Through**:

```php
function updateProduct(int $id, array $data): Product
{
    $product = Product::findOrFail($id);
    $product->update($data);
    
    // Atualiza cache imediatamente
    Cache::put("product:{$id}", $product, 3600);
    
    return $product;
}
```

**3. Write-Behind (Write-Back)**:

```php
function updateProduct(int $id, array $data): Product
{
    // Atualiza cache primeiro
    $product = Cache::get("product:{$id}");
    $product->fill($data);
    Cache::put("product:{$id}", $product, 3600);
    
    // Enfileira atualização no DB
    UpdateProductJob::dispatch($id, $data)->delay(5);
    
    return $product;
}
```

**4. Refresh-Ahead**:

```php
function getMenu(int $establishmentId): Menu
{
    $menu = Cache::get("menu:{$establishmentId}");
    $ttl = Cache::get("menu:{$establishmentId}:ttl");
    
    // Se TTL < 10 minutos, recarrega em background
    if ($ttl < 600) {
        RefreshMenuCacheJob::dispatch($establishmentId);
    }
    
    return $menu;
}
```

### Database Patterns

**1. Read Replicas**:

```php
// Leituras usam réplicas
$users = DB::connection('mysql')->select('SELECT * FROM users');

// Escritas usam master
DB::connection('mysql')->insert('INSERT INTO users ...');
```

**2. CQRS (Command Query Responsibility Segregation)**:

```php
// Write Model
class CreateOrderCommand
{
    public function execute(CreateOrderRequest $request): Order
    {
        return DB::transaction(function () use ($request) {
            $order = Order::create($request->validated());
            $this->updateInventory($order);
            return $order;
        });
    }
}

// Read Model (pode usar cache, réplica, etc)
class OrderQuery
{
    public function getById(int $id): Order
    {
        return Cache::remember("order:{$id}", 3600, function () use ($id) {
            return DB::connection('read')->select('SELECT * FROM orders WHERE id = ?', [$id]);
        });
    }
}
```

**3. Event Sourcing**:

```php
// Armazena eventos ao invés de estado
class OrderCreated extends Event
{
    public function __construct(
        public int $orderId,
        public array $items,
        public float $total
    ) {}
}

class OrderStatusChanged extends Event
{
    public function __construct(
        public int $orderId,
        public string $newStatus
    ) {}
}

// Reconstrói estado a partir de eventos
class OrderProjection
{
    public function rebuild(int $orderId): Order
    {
        $events = EventStore::getEvents('order', $orderId);
        
        $order = new Order();
        foreach ($events as $event) {
            $order->apply($event);
        }
        
        return $order;
    }
}
```

### Application Patterns

**1. Circuit Breaker**:

```php
use Illuminate\Support\Facades\Cache;

class CircuitBreaker
{
    private const THRESHOLD = 5;
    private const TIMEOUT = 60; // segundos
    
    public function call(callable $callback)
    {
        $failures = Cache::get('circuit_breaker:failures', 0);
        $state = Cache::get('circuit_breaker:state', 'closed');
        
        if ($state === 'open') {
            $openedAt = Cache::get('circuit_breaker:opened_at');
            
            if (now()->timestamp - $openedAt < self::TIMEOUT) {
                throw new ServiceUnavailableException('Circuit breaker is open');
            }
            
            // Tentar half-open
            Cache::put('circuit_breaker:state', 'half-open');
        }
        
        try {
            $result = $callback();
            
            // Sucesso - reset
            Cache::forget('circuit_breaker:failures');
            Cache::put('circuit_breaker:state', 'closed');
            
            return $result;
        } catch (Exception $e) {
            $failures++;
            Cache::put('circuit_breaker:failures', $failures, 300);
            
            if ($failures >= self::THRESHOLD) {
                Cache::put('circuit_breaker:state', 'open');
                Cache::put('circuit_breaker:opened_at', now()->timestamp);
            }
            
            throw $e;
        }
    }
}
```

**2. Rate Limiting**:

```php
// Middleware
use Illuminate\Cache\RateLimiter;

class ThrottleRequests
{
    public function handle(Request $request, Closure $next, int $maxAttempts = 60)
    {
        $key = $this->resolveRequestSignature($request);
        
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return response()->json([
                'message' => 'Too many requests',
            ], 429);
        }
        
        RateLimiter::hit($key, 60); // 60 segundos
        
        return $next($request);
    }
    
    private function resolveRequestSignature(Request $request): string
    {
        return sha1(
            $request->method() .
            '|' . $request->server('SERVER_NAME') .
            '|' . $request->path() .
            '|' . $request->ip()
        );
    }
}

// Uso
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/api/products', [ProductController::class, 'index']);
});
```

**3. Bulkhead Pattern**:

```php
// Isolar recursos por tipo de requisição
'redis' => [
    'client' => 'phpredis',
    
    'default' => [
        'host' => env('REDIS_HOST'),
        'database' => 0,
    ],
    
    // Pool separado para sessões
    'sessions' => [
        'host' => env('REDIS_HOST'),
        'database' => 1,
    ],
    
    // Pool separado para cache
    'cache' => [
        'host' => env('REDIS_HOST'),
        'database' => 2,
    ],
    
    // Pool separado para queues
    'queue' => [
        'host' => env('REDIS_HOST'),
        'database' => 3,
    ],
],
```

## 📏 Limites e Capacidade

### Current Limits

**Capacidade Atual** (com configuração base):

| Componente | Capacidade | Limite |
|-----------|-----------|--------|
| **API** | 1.000 req/s | 3 instâncias × ~333 req/s |
| **Database (Writer)** | 5.000 connections | Aurora r6g.xlarge |
| **Database (Readers)** | 10.000 connections | 2× Aurora r6g.large |
| **Redis** | 100.000 ops/s | r6g.large (8 GB) |
| **Queue Workers** | 500 jobs/min | 20 workers × 25 jobs/min |
| **Storage** | Ilimitado | S3 |
| **CDN** | 100.000 req/s | CloudFront |

**Benchmarks Atuais**:

```bash
# API Latency
P50: 50ms
P95: 200ms
P99: 500ms

# Database
Queries/s: 10.000
Connections: 500
Latency P95: 10ms

# Cache Hit Rate
Redis: 95%
CDN: 98%
```

### Scaling Thresholds

**Auto-scaling Triggers**:

```yaml
# API Auto-scaling
- Metric: CPU > 70%
  Action: Scale out (+1 instance)
  Cooldown: 2 minutes

- Metric: Memory > 80%
  Action: Scale out (+1 instance)
  Cooldown: 2 minutes

- Metric: Request latency P95 > 1s
  Action: Scale out (+2 instances)
  Cooldown: 5 minutes

# Database Scaling
- Metric: CPU > 80%
  Action: Add read replica
  Manual: Yes

- Metric: Connections > 80%
  Action: Increase max_connections
  Manual: Yes

# Queue Workers
- Metric: Queue size > 1000
  Action: Scale workers (+5)
  Cooldown: 1 minute

- Metric: Queue wait time > 5 min
  Action: Scale workers (+10)
  Cooldown: 30 seconds
```

### Scaling Plans

**Roadmap de Escalabilidade**:

#### Fase 1: Atual (até 10k estabelecimentos)
- ✅ 3 instâncias API
- ✅ 1 writer + 2 readers (Aurora)
- ✅ Redis single instance
- ✅ 20 queue workers
- ✅ CDN básico

**Capacidade**: 10.000 estabelecimentos, 100.000 usuários ativos/dia

#### Fase 2: Crescimento (10k-100k estabelecimentos)
- 📋 5-10 instâncias API
- 📋 1 writer + 5 readers (Aurora)
- 📋 Redis cluster (3 nodes)
- 📋 50 queue workers
- 📋 CDN otimizado + edge computing

**Capacidade**: 100.000 estabelecimentos, 1M usuários ativos/dia

#### Fase 3: Escala (100k-1M estabelecimentos)
- 📋 10-50 instâncias API (Kubernetes)
- 📋 Database sharding (4 shards)
- 📋 Redis cluster (6 nodes)
- 📋 100+ queue workers
- 📋 Multi-region deployment

**Capacidade**: 1M estabelecimentos, 10M usuários ativos/dia

#### Fase 4: Hiper-escala (1M+ estabelecimentos)
- 📋 50-200 instâncias API
- 📋 Database sharding avançado (16+ shards)
- 📋 Redis cluster distribuído
- 📋 Microservices architecture
- 📋 Global distribution (multi-region)

**Capacidade**: Ilimitado

### Cost Optimization

**Otimizações de Custo**:

1. **Reserved Instances**: 40% economia em EC2/RDS
2. **Spot Instances**: Para workers não-críticos (70% economia)
3. **S3 Intelligent Tiering**: Automático
4. **CloudFront**: Pay per use
5. **Aurora Serverless**: Para ambientes dev/staging

**Estimativa de Custos** (mensal):

```
Fase 1 (10k estabelecimentos):
- API (3× t3.medium): $70
- Database (1× r6g.xlarge + 2× r6g.large): $800
- Redis (1× r6g.large): $150
- S3 + CloudFront: $200
- Total: ~$1.220/mês

Fase 2 (100k estabelecimentos):
- API (10× t3.large): $350
- Database (1× r6g.2xlarge + 5× r6g.xlarge): $2.500
- Redis Cluster (3× r6g.xlarge): $700
- S3 + CloudFront: $1.000
- Total: ~$4.550/mês

Fase 3 (1M estabelecimentos):
- API (50× t3.xlarge): $3.000
- Database Sharding (4× clusters): $12.000
- Redis Cluster (6× r6g.2xlarge): $2.800
- S3 + CloudFront: $5.000
- Total: ~$22.800/mês
```

## 🧪 Testes de Carga

### Load Testing

**Ferramentas**:
- **K6**: Testes de carga programáveis
- **Apache JMeter**: Testes GUI
- **Locust**: Testes em Python
- **Gatling**: Testes em Scala

**K6 Script Example**:

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  // Test menu endpoint
  let menuResponse = http.get('https://api.vsmenu.com/api/establishments/1/menu');
  check(menuResponse, {
    'menu status is 200': (r) => r.status === 200,
    'menu response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
  
  // Test create order endpoint
  let orderPayload = JSON.stringify({
    table_id: 5,
    items: [
      { product_id: 10, quantity: 2 },
      { product_id: 15, quantity: 1 },
    ],
  });
  
  let orderResponse = http.post(
    'https://api.vsmenu.com/api/orders',
    orderPayload,
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(orderResponse, {
    'order status is 201': (r) => r.status === 201,
    'order response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  sleep(2);
}
```

**Executar Teste**:

```bash
# Teste local
k6 run load-test.js

# Teste em cloud (K6 Cloud)
k6 cloud load-test.js

# Teste com resultados em InfluxDB
k6 run --out influxdb=http://localhost:8086/k6 load-test.js
```

### Stress Testing

**Objetivo**: Encontrar breaking points do sistema.

**Estratégia**:
1. Aumentar carga gradualmente até falha
2. Identificar gargalos
3. Medir tempo de recuperação
4. Testar failover

**Stress Test Script**:

```javascript
// stress-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 500 },   // Ramp up to 500 users
    { duration: '5m', target: 500 },   // Stay at 500
    { duration: '2m', target: 1000 },  // Ramp up to 1000
    { duration: '5m', target: 1000 },  // Stay at 1000
    { duration: '2m', target: 2000 },  // Ramp up to 2000
    { duration: '5m', target: 2000 },  // Stay at 2000
    { duration: '5m', target: 0 },     // Ramp down
  ],
};

export default function () {
  let res = http.get('https://api.vsmenu.com/api/establishments/1/menu');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 2000,
  });
}
```

**Análise de Resultados**:

```bash
# Identificar breaking point
2000 users: P95 = 2.5s, Error rate = 5%   ← Breaking point
1000 users: P95 = 800ms, Error rate = 1%  ← Acceptable
500 users: P95 = 300ms, Error rate = 0%   ← Optimal

# Conclusão: Sistema suporta até ~1000 usuários simultâneos
```

### Soak Testing

**Objetivo**: Testar estabilidade por período prolongado.

```javascript
// soak-test.js
export let options = {
  stages: [
    { duration: '5m', target: 200 },   // Ramp up
    { duration: '24h', target: 200 },  // Stay for 24 hours!
    { duration: '5m', target: 0 },     // Ramp down
  ],
};
```

**Monitorar**:
- Memory leaks
- Connection leaks
- Disk space
- Log rotation

## 📚 Referências

### Scaling Patterns
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [The Twelve-Factor App](https://12factor.net/)
- [Microservices Patterns](https://microservices.io/patterns/)
- [Cloud Design Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/)

### Best Practices
- [Laravel Performance Best Practices](https://laravel.com/docs/performance)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [MySQL Performance Tuning](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)

### Load Testing
- [K6 Documentation](https://k6.io/docs/)
- [Gatling Documentation](https://gatling.io/docs/)
- [Performance Testing Guidance](https://martinfowler.com/articles/performance-testing.html)

### Monitoring
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [AWS CloudWatch](https://docs.aws.amazon.com/cloudwatch/)

---

## 📖 Documentos Relacionados

- [📋 Overview da Arquitetura](./index.md)
- [🔐 Arquitetura de Segurança](./security.md)
- [⚡ Estratégia de Performance](./performance.md)
- [🚀 Estratégia de Implantação](../deployment/index.md)
- [📊 Fluxo de Dados](./data-flow.md)

---

<div align="center">

**[⬅️ Voltar para Overview da Arquitetura](./index.md)**

</div>
