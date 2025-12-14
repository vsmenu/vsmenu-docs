---
title: Arquitetura de Segurança
description: Estratégias completas de segurança do VSmenu 2.0
---

# Arquitetura de Segurança

Documentação completa das estratégias, práticas e implementações de segurança do VSmenu 2.0.

## 🛡️ Visão Geral

A segurança do VSmenu 2.0 é baseada em **defesa em profundidade** (defense in depth), com múltiplas camadas de proteção:

1. **Network Security**: Firewalls, VPC, TLS
2. **Application Security**: Autenticação, Autorização, Validação
3. **Data Security**: Encryption, Backup, Isolation
4. **Infrastructure Security**: IAM, Secrets Management
5. **Monitoring & Response**: Logs, Alerts, Incident Response

## 🔐 Princípios de Segurança

### 1. Defense in Depth
Múltiplas camadas de segurança - se uma falha, outras protegem.

### 2. Least Privilege
Usuários e serviços têm apenas as permissões mínimas necessárias.

### 3. Secure by Default
Configurações padrão são seguras, não inseguras.

### 4. Fail Securely
Quando algo falha, o sistema falha de forma segura (nega acesso).

### 5. Zero Trust
Não confiar em nada por padrão, sempre validar.

## 🔑 Autenticação

### Laravel Sanctum (API Tokens)

**Implementação:**

```php
// Geração de token no login
public function login(LoginRequest $request)
{
    $credentials = $request->validated();
    
    if (!Auth::attempt($credentials)) {
        throw new AuthenticationException('Credenciais inválidas');
    }
    
    $user = Auth::user();
    $token = $user->createToken('api-token')->plainTextToken;
    
    return response()->json([
        'token' => $token,
        'user' => new UserResource($user)
    ]);
}
```

**Características:**
- ✅ Tokens estateless
- ✅ Múltiplos tokens por usuário
- ✅ Revogação individual de tokens
- ✅ Expiração configurável
- ✅ Scopes para permissões

### Password Security

**Hashing:**
```php
// Laravel usa Bcrypt por padrão
Hash::make($password);  // Bcrypt
Hash::make($password, ['rounds' => 12]);  // Customizado

// Argon2id (mais seguro, PHP 7.3+)
Hash::driver('argon2id')->make($password);
```

**Políticas de Senha:**
- Mínimo 8 caracteres
- Combinação de letras, números e símbolos
- Verificação contra senhas comuns (Have I Been Pwned)
- Expiração de senha (90 dias para admins)

**Reset de Senha:**
```php
// Token único de reset
Password::sendResetLink(['email' => $email]);

// Validação do token
Password::reset($request->validated(), function ($user, $password) {
    $user->forceFill([
        'password' => Hash::make($password)
    ])->save();
});
```

### Refresh Tokens

**Implementação:**
```php
public function refresh(Request $request)
{
    $user = $request->user();
    
    // Revoga token atual
    $request->user()->currentAccessToken()->delete();
    
    // Cria novo token
    $token = $user->createToken('api-token')->plainTextToken;
    
    return response()->json(['token' => $token]);
}
```

### Multi-Factor Authentication (MFA) - Futuro

Planejado para v2.0:
- TOTP (Time-based One-Time Password)
- SMS (via Twilio)
- Email backup codes

## 🔒 Autorização

### Roles e Permissions (Spatie Laravel Permission)

**Estrutura:**

```php
// Roles principais
'super_admin'    // Acesso total ao sistema
'admin'          // Gerente do estabelecimento
'manager'        // Gerente de loja
'waiter'         // Garçom
'cashier'        // Caixa
'kitchen'        // Cozinha
'deliverer'      // Entregador
'customer'       // Cliente final

// Permissions por módulo
'products.view'
'products.create'
'products.update'
'products.delete'

'orders.view'
'orders.create'
'orders.update'
'orders.cancel'

'tables.view'
'tables.manage'

// ... etc
```

**Implementação:**

```php
// Atribuir role
$user->assignRole('waiter');

// Atribuir permission
$user->givePermissionTo('orders.create');

// Verificar permission
if ($user->can('orders.create')) {
    // Permitido
}

// Middleware
Route::middleware(['permission:orders.create'])->post('/orders', ...);
```

### Laravel Policies

**Policy por Resource:**

```php
class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        // Admin pode ver todos
        if ($user->hasRole('admin')) {
            return true;
        }
        
        // Garçom pode ver pedidos da sua mesa
        if ($user->hasRole('waiter')) {
            return $order->table->waiter_id === $user->id;
        }
        
        // Cliente pode ver apenas seus pedidos
        return $order->customer_id === $user->id;
    }
    
    public function update(User $user, Order $order): bool
    {
        // Apenas admin ou o próprio garçom
        return $user->hasRole('admin') || 
               ($user->hasRole('waiter') && $order->table->waiter_id === $user->id);
    }
    
    public function cancel(User $user, Order $order): bool
    {
        // Apenas admin pode cancelar
        return $user->hasRole('admin');
    }
}
```

**Uso em Controllers:**

```php
public function update(UpdateOrderRequest $request, Order $order)
{
    $this->authorize('update', $order);
    
    // ... lógica de atualização
}
```

### Tenant Isolation (Multi-tenancy)

**Middleware:**

```php
class TenantMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Detecta tenant pelo subdomínio
        $subdomain = $request->getHost();
        $tenant = Tenant::where('domain', $subdomain)->firstOrFail();
        
        // Define tenant no contexto
        app()->instance('tenant', $tenant);
        
        // Aplica global scope em todos os models
        Model::addGlobalScope('tenant', function ($query) use ($tenant) {
            $query->where('tenant_id', $tenant->id);
        });
        
        return $next($request);
    }
}
```

**Global Scope:**

```php
class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model)
    {
        if (app()->has('tenant')) {
            $builder->where($model->getTable() . '.tenant_id', app('tenant')->id);
        }
    }
}

// Aplicar em models
class Product extends Model
{
    protected static function booted()
    {
        static::addGlobalScope(new TenantScope);
        
        // Auto-set tenant_id ao criar
        static::creating(function ($model) {
            if (app()->has('tenant')) {
                $model->tenant_id = app('tenant')->id;
            }
        });
    }
}
```

## 🔐 Proteção de Dados

### Encryption at Rest

**Database Encryption:**

```php
// Atributos criptografados
class User extends Model
{
    protected $casts = [
        'cpf' => 'encrypted',
        'phone' => 'encrypted',
        'address' => 'encrypted',
    ];
}

// Ou manualmente
$encrypted = Crypt::encryptString($value);
$decrypted = Crypt::decryptString($encrypted);
```

**Encryption Key:**
- Armazenado em Google Cloud Secret Manager
- Rotação automática a cada 90 dias
- Backup seguro

### Encryption in Transit

**TLS/HTTPS:**
- TLS 1.3 obrigatório
- Certificados Let's Encrypt (auto-renovação)
- HSTS (HTTP Strict Transport Security)
- Perfect Forward Secrecy

**Configuração:**

```nginx
# HTTPS obrigatório
server {
    listen 443 ssl http2;
    
    ssl_certificate /etc/letsencrypt/live/vsmenu.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vsmenu.io/privkey.pem;
    
    ssl_protocols TLSv1.3;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

### Input Validation

**Laravel Form Requests:**

```php
class CreateOrderRequest extends FormRequest
{
    public function rules()
    {
        return [
            'customer_id' => 'required|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1|max:99',
            'items.*.price' => 'required|numeric|min:0',
            'delivery_address_id' => 'nullable|exists:addresses,id',
            'payment_method' => 'required|in:credit_card,debit_card,pix,cash',
        ];
    }
    
    // Sanitização
    protected function prepareForValidation()
    {
        $this->merge([
            'customer_id' => (int) $this->customer_id,
            'items' => array_map(function ($item) {
                return [
                    'product_id' => (int) $item['product_id'],
                    'quantity' => (int) $item['quantity'],
                    'price' => (float) $item['price'],
                ];
            }, $this->items ?? []),
        ]);
    }
}
```

### SQL Injection Prevention

**Eloquent ORM:**

```php
// ✅ Seguro (prepared statements)
Product::where('category_id', $categoryId)->get();
DB::table('products')->where('price', '>', 100)->get();

// ✅ Seguro (bindings)
DB::select('SELECT * FROM products WHERE category_id = ?', [$categoryId]);

// ❌ NUNCA faça isso
DB::select("SELECT * FROM products WHERE category_id = $categoryId");
```

### XSS Prevention

**Output Encoding:**

```php
// Blade templates escapam automaticamente
{{ $product->name }}  // Escapado

// Se precisar HTML puro (cuidado!)
{!! $product->description !!}  // Não escapado

// Sanitize HTML
use HTMLPurifier;
$clean = app(HTMLPurifier::class)->purify($dirtyHtml);
```

**Content Security Policy:**

```php
// Middleware
class ContentSecurityPolicy
{
    public function handle($request, $next)
    {
        $response = $next($request);
        
        $response->headers->set('Content-Security-Policy', 
            "default-src 'self'; " .
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " .
            "style-src 'self' 'unsafe-inline'; " .
            "img-src 'self' data: https:; " .
            "font-src 'self' data:; " .
            "connect-src 'self' wss://*.vsmenu.io;"
        );
        
        return $response;
    }
}
```

### CSRF Protection

```php
// Laravel CSRF automático em forms
<form method="POST" action="/orders">
    @csrf
    <!-- ... -->
</form>

// API: desabilitado (usa tokens Sanctum)
// app/Http/Middleware/VerifyCsrfToken.php
protected $except = [
    'api/*',
];
```

## 🌐 Segurança de API

### Rate Limiting

**Configuração:**

```php
// Throttle middleware
Route::middleware('throttle:api')->group(function () {
    // 60 requests/minuto por padrão
});

// Custom rate limit
Route::middleware('throttle:10,1')->post('/orders', ...);

// Por usuário
RateLimiter::for('api', function (Request $request) {
    return $request->user()
        ? Limit::perMinute(100)->by($request->user()->id)
        : Limit::perMinute(20)->by($request->ip());
});
```

**Response Headers:**

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
Retry-After: 60
```

### CORS (Cross-Origin Resource Sharing)

**Configuração:**

```php
// config/cors.php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://*.vsmenu.io',
        'http://localhost:5173',  // Dev
    ],
    'allowed_origins_patterns' => [
        '/^https:\/\/.*\.vsmenu\.io$/',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### API Versioning

```php
// Isolamento por versão
Route::prefix('api/v1')->group(function () {
    // v1 routes
});

Route::prefix('api/v2')->group(function () {
    // v2 routes
});
```

### Security Headers

```php
// Middleware
class SecurityHeaders
{
    public function handle($request, $next)
    {
        $response = $next($request);
        
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        return $response;
    }
}
```

## 🏗️ Segurança de Infraestrutura

### Google Cloud IAM

**Princípio do Menor Privilégio:**

```yaml
# Roles customizados
vsmenu-api-role:
  permissions:
    - cloudsql.instances.connect
    - storage.objects.create
    - storage.objects.get
    
vsmenu-worker-role:
  permissions:
    - cloudsql.instances.connect
    - pubsub.topics.publish
    - pubsub.subscriptions.consume
```

### Secrets Management

**Google Secret Manager:**

```bash
# Armazenar secrets
gcloud secrets create database-password --data-file=-

# Acessar em runtime
gcloud secrets versions access latest --secret="database-password"
```

**Kubernetes Secrets:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
type: Opaque
data:
  database-password: <base64-encoded>
  app-key: <base64-encoded>
```

### Network Security

**VPC e Firewalls:**

```yaml
# VPC privado
vpc:
  name: vsmenu-vpc
  subnet:
    - name: private-subnet
      cidr: 10.0.0.0/24
      
# Regras de firewall
firewall:
  - name: allow-https
    direction: INGRESS
    ports: [443]
    source: 0.0.0.0/0
    
  - name: deny-all-other
    direction: INGRESS
    action: DENY
```

**Private Google Access:**
- GKE cluster privado
- Nodes sem IP público
- Acesso a GCP services via private endpoint

### Backup e Recovery

**Cloud SQL:**
- Backup automático diário
- Point-in-time recovery (até 7 dias)
- Replicação multi-region

**Storage:**
- Versionamento habilitado
- Lifecycle policies
- Backup para Cloud Storage Archive

## 📱 Segurança Mobile/Desktop

### Secure Storage

**Flutter (Mobile):**

```dart
// Armazenamento seguro de tokens
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();

// Salvar token
await storage.write(key: 'auth_token', value: token);

// Ler token
String? token = await storage.read(key: 'auth_token');
```

**Electron (Desktop):**

```javascript
// Armazenamento seguro
import Store from 'electron-store';

const store = new Store({
  encryptionKey: 'your-encryption-key',
});

// Salvar
store.set('auth.token', token);

// Ler
const token = store.get('auth.token');
```

### Certificate Pinning

**Flutter:**

```dart
class ApiClient {
  static final certificateSHA256 = 'sha256/AAAAAAA...';
  
  Dio getDio() {
    final dio = Dio();
    
    (dio.httpClientAdapter as DefaultHttpClientAdapter).onHttpClientCreate = 
      (client) {
        client.badCertificateCallback = 
          (X509Certificate cert, String host, int port) {
            return cert.sha256.toString() == certificateSHA256;
          };
        return client;
      };
      
    return dio;
  }
}
```

### Code Obfuscation

**Flutter (Release Build):**

```bash
flutter build apk --obfuscate --split-debug-info=build/app/outputs/symbols
flutter build appbundle --obfuscate --split-debug-info=build/app/outputs/symbols
```

## 📊 Compliance e Auditoria

### LGPD/GDPR Compliance

**Direitos do Usuário:**
- ✅ Acesso aos dados
- ✅ Correção de dados
- ✅ Exclusão de dados (right to be forgotten)
- ✅ Portabilidade de dados
- ✅ Opt-out de marketing

**Implementação:**

```php
// Exportar dados do usuário
public function exportData(User $user)
{
    return [
        'user' => $user->only(['name', 'email', 'created_at']),
        'orders' => $user->orders,
        'addresses' => $user->addresses,
        // ... outros dados
    ];
}

// Anonimizar usuário (soft delete + anonimização)
public function anonymize(User $user)
{
    $user->update([
        'name' => 'Usuário Anônimo',
        'email' => 'anonimo_' . $user->id . '@deleted.local',
        'phone' => null,
        'cpf' => null,
    ]);
    
    $user->delete();  // Soft delete
}
```

### Audit Logs

**Implementação:**

```php
// Trait para models auditáveis
trait Auditable
{
    protected static function bootAuditable()
    {
        static::created(function ($model) {
            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'created',
                'auditable_type' => get_class($model),
                'auditable_id' => $model->id,
                'old_values' => [],
                'new_values' => $model->toArray(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        });
        
        static::updated(function ($model) {
            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'updated',
                'auditable_type' => get_class($model),
                'auditable_id' => $model->id,
                'old_values' => $model->getOriginal(),
                'new_values' => $model->getChanges(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        });
    }
}

// Usar no model
class Product extends Model
{
    use Auditable;
}
```

### Monitoring & Logging

**Cloud Logging:**

```php
// Log de eventos de segurança
Log::channel('security')->warning('Tentativa de acesso não autorizado', [
    'user_id' => auth()->id(),
    'ip' => request()->ip(),
    'route' => request()->path(),
    'method' => request()->method(),
]);

// Log de falhas de autenticação
Log::channel('security')->error('Falha de autenticação', [
    'email' => $request->email,
    'ip' => request()->ip(),
]);
```

**Alertas:**
- Múltiplas falhas de login
- Acessos de IPs desconhecidos
- Mudanças em dados sensíveis
- Rate limiting excedido

## ✅ Checklist de Segurança

### Desenvolvimento

- [ ] Validação de input em todos os endpoints
- [ ] Output encoding em todas as views
- [ ] Prepared statements (Eloquent ORM)
- [ ] CSRF protection habilitado
- [ ] Secrets não commitados no git
- [ ] Dependencies atualizadas
- [ ] Security headers configurados

### Deploy

- [ ] HTTPS/TLS configurado
- [ ] Certificados válidos
- [ ] Firewall configurado
- [ ] Rate limiting habilitado
- [ ] CORS configurado corretamente
- [ ] Backups automatizados
- [ ] Monitoring e alertas ativos

### Operação

- [ ] Logs de segurança monitorados
- [ ] Patches de segurança aplicados
- [ ] Audit logs revisados mensalmente
- [ ] Penetration testing semestral
- [ ] Incident response plan atualizado

## 🚨 Incident Response

### Processo de Resposta

1. **Detecção**: Monitoramento identifica incidente
2. **Contenção**: Isolar sistemas afetados
3. **Erradicação**: Remover ameaça
4. **Recuperação**: Restaurar serviços
5. **Post-Mortem**: Análise e melhorias

### Contatos de Emergência

- **Security Lead**: security@vsmenu.io
- **On-Call**: +55 (XX) XXXXX-XXXX
- **GCP Support**: Ticket de prioridade alta

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Laravel Security](https://laravel.com/docs/security)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [LGPD - Lei Geral de Proteção de Dados](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

---

[⬅️ Voltar para Arquitetura](./index.md)

