# Guia de Desenvolvimento - App de Vendas

## 🎯 Objetivo do Sistema
App PWA para vendedores técnicos consultarem produtos, compartilharem documentação e gerarem orçamentos em campo.

## 📱 Características Principais
- PWA: Funciona web e mobile
- Offline first
- Foco em usabilidade
- Compartilhamento fácil

## 🏗️ Arquitetura

### Frontend (Next.js + PWA)
```
/pages
├── index.tsx (Dashboard)
├── products/
│   ├── index.tsx (Lista)
│   └── [id].tsx (Detalhes)
├── quotes/
│   ├── index.tsx (Lista)
│   ├── new.tsx (Novo)
│   └── [id].tsx (Detalhes)
├── clients/
├── calendar/
└── admin/
```

### Backend (Django REST)
```
/backend
├── products/
│   ├── models.py
│   └── views.py
├── quotes/
├── clients/
└── calendar/
```

## 💾 Modelos de Dados

### Produto
```python
class Product(models.Model):
    name = models.CharField()
    code = models.CharField()
    category = models.CharField()
    price = models.DecimalField()
    
    # Specs dinâmicas
    specs = JSONField()  # { "potência": "2000W", "voltagem": "220V" }
    
    # Relacionamentos
    documents = reverse('Document')
    videos = reverse('Video')
```

### Documento
```python
class Document(models.Model):
    product = ForeignKey(Product)
    type = CharField(choices=['manual', 'catalog'])
    nextcloud_link = URLField()
```

### Orçamento
```python
class Quote(models.Model):
    number = CharField()
    client = ForeignKey(Client)
    date = DateTimeField()
    items = reverse('QuoteItem')
    status = CharField(choices=[
        'draft',
        'sent',
        'negotiating',
        'approved',
        'closed',
        'lost'
    ])
    payment_terms = TextField()  # Campo livre
    total = DecimalField()
```

## 🔄 Fluxos Principais

### 1. Consulta de Produto
```mermaid
Lista de Produtos
      │
      ▼
Detalhes do Produto
      │
      ├── Ver Documentos ──► Download/Share
      ├── Ver Vídeos
      └── Adicionar ao Orçamento
```

### 2. Geração de Orçamento
```mermaid
Novo Orçamento
      │
      ├── Adicionar Produto Cadastrado
      ├── Adicionar Item Manual
      │
      ▼
Preencher Dados
      │
      ▼
Gerar PDF/Compartilhar
      │
      ▼
Acompanhar Status
```

## 📋 Requisitos por Tela

### Dashboard
- [x] Total de orçamentos fechados/mês
- [x] Valor total fechado
- [x] Compromissos do dia
- [x] Gráfico últimos 6 meses

### Produtos
- [x] Lista com filtros
- [x] Busca por nome/código
- [x] Detalhes técnicos
- [x] Documentos (Nextcloud)
- [x] Vídeos (YouTube)

### Orçamentos
- [x] Lista com status
- [x] Filtros por data/status
- [x] Produtos cadastrados
- [x] Itens manuais
- [x] PDF personalizado
- [x] Compartilhamento

### Agenda
- [x] Visualização mensal
- [x] Compromissos
- [x] Lembretes simples

### Admin
- [x] CRUD Produtos
- [x] Upload docs
- [x] Gestão usuários

## 🛠️ Setup Técnico

### Dependências Frontend
```json
{
  "next": "latest",
  "next-pwa": "latest",
  "tailwindcss": "latest",
  "react-query": "latest"
}
```

### Dependências Backend
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'rest_framework',
    'corsheaders',
    'products',
    'quotes',
    'clients',
    'calendar',
]
```

## 📱 Responsividade

### Desktop
- Menu vertical fixo
- 3 colunas produtos
- Tabelas completas

### Tablet
- Menu colapsável
- 2 colunas produtos
- Tabelas scroll horizontal

### Mobile
- Menu hamburguer
- 1 coluna produtos
- Cards adaptados

## 🔒 Segurança
- JWT Authentication
- Roles: admin/vendedor
- Dados isolados por vendedor
- HTTPS obrigatório

## 📊 APIs

### Produtos
```
GET /api/products/
GET /api/products/{id}/
GET /api/products/{id}/documents/
POST /api/products/ (admin)
```

### Orçamentos
```
GET /api/quotes/
POST /api/quotes/
PATCH /api/quotes/{id}/status/
```

## 🎨 UI/UX Guidelines

### Cores
```css
--primary: #2563eb;    /* Azul */
--secondary: #475569;  /* Cinza */
--success: #22c55e;    /* Verde */
--warning: #eab308;    /* Amarelo */
--danger: #ef4444;     /* Vermelho */
```

### Tipografia
```css
--font-sans: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

## 📝 Notas Importantes
1. Priorizar performance offline
2. Manter interface simples
3. Foco em usabilidade mobile
4. Documentação sempre atualizada

## 🚀 Ordem de Desenvolvimento

1. Setup inicial (Next.js + Django)
2. Autenticação
3. CRUD Produtos
4. Integração Nextcloud
5. Sistema de Orçamentos
6. Agenda
7. Admin
8. PWA e offline

## ⚠️ Pontos de Atenção
1. Sincronização offline
2. Tamanho dos PDFs
3. Cache de documentos
4. Performance mobile
5. Segurança dos links
