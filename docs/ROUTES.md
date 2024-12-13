# Documentação de Rotas do Sistema

## Autenticação
- `/login` - Página de login
- `/register` - Página de registro
- `/` - Dashboard (requer autenticação)

## Produtos
- `/produtos` - Lista de produtos
- `/produtos/novo` - Criar novo produto
- `/produtos/:id` - Visualizar detalhes do produto
- `/produtos/:id/editar` - Editar produto

## Cotações e Orçamentos
- `/orcamentos` - Lista de orçamentos/cotações
- `/orcamentos/novo` - Criar novo orçamento
- `/orcamentos/:id` - Visualizar detalhes do orçamento
- `/orcamentos/:id/editar` - Editar orçamento

*Nota: As rotas `/cotacoes/...` também estão disponíveis como alias para compatibilidade, mas recomenda-se usar `/orcamentos/...`*

## Configurações
- `/configuracoes` - Configurações do sistema

## Componentes Principais

### Quotes.tsx
- Lista todas as cotações
- Permite criar nova cotação
- Permite visualizar e editar cotações existentes
- Mostra status e informações básicas de cada cotação

### QuoteCreate.tsx
- Formulário de criação de cotação
- Seleção de cliente
- Adição de produtos
- Definição de valores e condições

### QuoteEdit.tsx
- Edição de cotações existentes
- Alteração de produtos
- Atualização de valores
- Modificação de status

### QuoteDetails.tsx
- Visualização detalhada da cotação
- Informações do cliente
- Lista de produtos
- Valores e condições
- Status atual

## Fluxo de Navegação

1. Lista de Orçamentos (`/orcamentos`)
   - Clique em "Nova Cotação" → `/orcamentos/novo`
   - Clique em uma cotação → `/orcamentos/:id`
   - Clique em "Editar" → `/orcamentos/:id/editar`

2. Criação de Orçamento (`/orcamentos/novo`)
   - Sucesso → Redireciona para `/orcamentos`
   - Cancelar → Volta para `/orcamentos`

3. Edição de Orçamento (`/orcamentos/:id/editar`)
   - Salvar → Redireciona para `/orcamentos`
   - Cancelar → Volta para `/orcamentos`

4. Visualização de Orçamento (`/orcamentos/:id`)
   - "Editar" → `/orcamentos/:id/editar`
   - "Voltar" → `/orcamentos`

## Observações Importantes

1. Todas as rotas (exceto login e registro) requerem autenticação
2. A navegação é gerenciada pelo React Router v6
3. Cada rota tem seu próprio componente dedicado
4. Os componentes usam Material-UI para interface
5. Animações são implementadas com Framer Motion
