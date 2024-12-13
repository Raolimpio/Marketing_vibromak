# Sistema de Vendas - Frontend

Este é o frontend do Sistema de Vendas, desenvolvido com React, TypeScript e Material-UI.

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── assets/          # Arquivos estáticos (imagens, ícones, etc.)
│   ├── components/      # Componentes reutilizáveis
│   ├── config/          # Configurações do projeto
│   ├── contexts/        # Contextos do React (ex: AuthContext)
│   ├── hooks/          # Hooks personalizados
│   ├── pages/          # Páginas da aplicação
│   │   ├── Products.tsx           # Lista de produtos
│   │   ├── ProductCreate.tsx      # Criação de produto
│   │   ├── ProductDetails.tsx     # Detalhes do produto
│   │   ├── ProductEdit.tsx        # Edição de produto
│   │   └── ...
│   ├── routes/         # Configurações de rotas
│   ├── services/       # Serviços e APIs
│   ├── utils/          # Funções utilitárias
│   ├── App.tsx         # Componente principal
│   └── main.tsx        # Ponto de entrada
```

## Rotas Principais

### Produtos
- `/produtos` - Lista de produtos
- `/produtos/novo` - Criar novo produto
- `/produtos/:id` - Visualizar detalhes do produto
- `/produtos/:id/editar` - Editar produto

### Orçamentos
- `/orcamentos` - Lista de orçamentos
- `/orcamentos/novo` - Criar novo orçamento
- `/orcamentos/:id` - Visualizar orçamento
- `/orcamentos/:id/editar` - Editar orçamento

### Clientes
- `/clientes` - Lista de clientes
- `/clientes/novo` - Criar novo cliente
- `/clientes/:id` - Visualizar cliente
- `/clientes/:id/editar` - Editar cliente

### Outras Rotas
- `/calendario` - Calendário
- `/configuracoes` - Configurações (acesso admin)

## Componentes Principais

### Layout
O componente `Layout` é responsável pela estrutura básica da aplicação, incluindo:
- Barra de navegação superior
- Menu lateral
- Área principal de conteúdo

### Produtos
- `Products`: Lista todos os produtos com opções de filtro e busca
- `ProductCreate`: Formulário para criar novo produto
- `ProductDetails`: Exibe detalhes completos do produto
- `ProductEdit`: Formulário para editar produto existente

## Serviços

### productService
Responsável por todas as operações relacionadas a produtos:
- `getAll()`: Busca todos os produtos
- `getById(id)`: Busca produto por ID
- `create(product)`: Cria novo produto
- `update(id, product)`: Atualiza produto existente
- `delete(id)`: Remove produto

## Autenticação

O sistema utiliza autenticação baseada em contexto (AuthContext) com as seguintes funcionalidades:
- Login/Logout
- Proteção de rotas
- Controle de acesso baseado em perfil (admin/usuário)

## Relatório de Funcionalidade da Página `/configuracoes`

### Visão Geral
A página `/configuracoes` é planejada para ser uma interface onde os usuários podem gerenciar configurações do sistema. Isso pode incluir preferências de usuário, configurações de notificação e opções administrativas.

### Estrutura do Projeto
O projeto é construído com Django e utiliza Django REST Framework para a criação de APIs. As principais aplicações incluem:
- **calendar_app**: Gerencia eventos e lembretes.
- **clients**: Gerencia informações sobre clientes.
- **products**: Gerencia produtos disponíveis para venda, incluindo operações CRUD.
- **quotes**: Gerencia cotações de produtos.
- **users**: Gerencia autenticação e informações do usuário, incluindo login e registro.

### Funcionalidades da Página `/configuracoes`
- **Gerenciamento de Configurações**: Permite que os usuários ajustem suas preferências e configurações do sistema.
- **Configurações do Usuário**: Possibilita que os usuários atualizem informações do perfil e preferências.
- **Configurações do Sistema**: Interface para administradores configurarem opções globais do sistema.

### Próximos Passos
Para implementar a página `/configuracoes`, será necessário:
1. Criar uma nova view para gerenciar as configurações.
2. Definir a rota correspondente em `urls.py`.
3. Criar um template para a interface do usuário.

### Conclusão
A página `/configuracoes` ainda não está implementada, mas sua adição é essencial para melhorar a experiência do usuário e a gestão do sistema. O projeto está em andamento e novas funcionalidades estão sendo planejadas.

## Como Executar o Projeto

1. Instale as dependências:
```bash
npm install
```

2. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5174`

## Solução de Problemas

### Erro ao Editar Produto
Se estiver tendo problemas para editar produtos, verifique:
1. Se a rota `/produtos/:id/editar` está corretamente configurada
2. Se o componente `ProductEdit` está importado e registrado nas rotas
3. Se o `productService` está funcionando corretamente para operações de atualização

## Contribuição

Para contribuir com o projeto:
1. Crie uma branch para sua feature
2. Faça commit das alterações
3. Crie um Pull Request
