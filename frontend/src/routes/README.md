# Documentação das Rotas

## Estrutura de Rotas

O sistema utiliza o React Router DOM para gerenciamento de rotas. As rotas são organizadas hierarquicamente:

```tsx
<Routes>
  {/* Rota pública de login */}
  <Route path="/login" element={<Login />} />

  {/* Rotas protegidas (requer autenticação) */}
  <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
    {/* Dashboard */}
    <Route index element={<Dashboard />} />

    {/* Produtos */}
    <Route path="produtos">
      <Route index element={<Products />} />
      <Route path="novo" element={<ProductCreate />} />
      <Route path=":id" element={<ProductDetails />} />
      <Route path=":id/editar" element={<ProductEdit />} />
    </Route>

    {/* Orçamentos */}
    <Route path="orcamentos">
      <Route index element={<QuoteList />} />
      <Route path="novo" element={<QuoteCreate />} />
      <Route path=":id" element={<QuoteDetails />} />
      <Route path=":id/editar" element={<QuoteEdit />} />
    </Route>

    {/* Clientes */}
    <Route path="clientes">
      <Route index element={<Clients />} />
      <Route path="novo" element={<ClientCreate />} />
      <Route path=":id" element={<ClientDetails />} />
      <Route path=":id/editar" element={<ClientEdit />} />
    </Route>

    {/* Outras rotas */}
    <Route path="calendario" element={<Calendar />} />
    <Route path="configuracoes" element={<AdminRoute><Admin /></AdminRoute>} />
  </Route>
</Routes>
```

## Componentes de Proteção de Rota

### PrivateRoute
- Protege rotas que requerem autenticação
- Redireciona para `/login` se o usuário não estiver autenticado
- Verifica o estado de autenticação através do `AuthContext`

### AdminRoute
- Protege rotas que requerem privilégios de administrador
- Redireciona para `/` se o usuário não for admin
- Verifica o perfil do usuário através do `AuthContext`

## Navegação Programática

Para navegar entre rotas no código, use o hook `useNavigate`:

```tsx
const navigate = useNavigate();

// Exemplos de navegação
navigate('/produtos');                    // Lista de produtos
navigate(`/produtos/${id}`);              // Detalhes do produto
navigate(`/produtos/${id}/editar`);       // Editar produto
navigate(-1);                             // Voltar para página anterior
```

## Parâmetros de Rota

Para acessar parâmetros de rota, use o hook `useParams`:

```tsx
const { id } = useParams<{ id: string }>();
```

## Observações Importantes

1. Todas as rotas (exceto `/login`) são protegidas e requerem autenticação
2. A rota `/configuracoes` requer privilégios de administrador
3. O componente `Layout` envolve todas as rotas autenticadas e fornece:
   - Barra de navegação
   - Menu lateral
   - Container principal

## Solução de Problemas

Se uma rota não estiver funcionando:

1. Verifique se a rota está corretamente definida no arquivo de rotas
2. Confirme se o componente correspondente existe e está exportado
3. Verifique se o usuário tem as permissões necessárias
4. Confira se não há conflitos de rota (rotas mais específicas devem vir antes)
