# Brechó App

Sistema web para gestão de vendas, peças e categorias de um brechó, com autenticação, controle de estoque e registro de vendas.

## Tecnologias Utilizadas

- **Next.js** (App Router, SSR, API Routes)
- **React**
- **TypeScript**
- **Prisma ORM** (com SQLite por padrão, fácil de trocar para PostgreSQL/MySQL)
- **Tailwind CSS**
- **shadcn/ui** (componentes de UI)
- **Zod** (validação de formulários)
- **React Hook Form**
- **Sonner** (notificações)
- **Lucide React** (ícones)

## Como rodar o projeto localmente

1. **Clone o repositório:**

   ```bash
   git clone <url-do-repo>
   cd brecho-app
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure o banco de dados:**

   - Por padrão, usa SQLite (arquivo local). Para usar outro banco, edite `prisma/schema.prisma` e a variável `DATABASE_URL` no `.env`.

4. **Rode as migrations:**

   ```bash
   npx prisma migrate dev
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```
   O app estará disponível em [http://localhost:3000](http://localhost:3000)

## Estrutura de Pastas

- `src/app/` — Páginas, rotas e APIs
- `src/components/ui/` — Componentes de UI reutilizáveis (shadcn/ui)
- `src/lib/` — Helpers, autenticação, instância do Prisma
- `prisma/` — Migrations e schema do banco

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz com:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua_chave_secreta"
```

## Rodando em produção

1. Rode as migrations:
   ```bash
   npx prisma migrate deploy
   ```
2. Gere o build:
   ```bash
   npm run build
   ```
3. Inicie:
   ```bash
   npm start
   ```
