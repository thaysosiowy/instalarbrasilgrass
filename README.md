# BrasilGrass — Planta de Instalação e Corte

Ferramenta interna: desenha o espaço do cliente (com ou sem foto), calcula
automaticamente a disposição dos rolos de grama sintética, gera uma planta
profissional pra enviar ao cliente, e calcula insumos (cola, fita tape,
ganchos).

O catálogo de modelos de grama fica salvo num banco Postgres compartilhado
por toda a equipe.

## Estrutura

```
brasilgrass-app/
├── server.js        → backend Express (serve a página + API do catálogo)
├── package.json
└── public/
    └── index.html   → a aplicação inteira (front-end)
```

## Como colocar no ar (GitHub + Render)

### 1. Subir pro GitHub

```bash
cd brasilgrass-app
git init
git add .
git commit -m "primeira versão"
```

Crie um repositório novo no GitHub (pode ser privado) e siga as instruções
que ele mesmo mostra pra conectar e dar `git push`.

### 2. Criar o banco de dados no Render

1. Entre em [render.com](https://render.com) e faça login.
2. **New +** → **PostgreSQL**.
3. Dê um nome (ex: `brasilgrass-db`), escolha a região, plano **Free**.
4. Depois de criado, copie o valor de **Internal Database URL** — vai
   precisar dele no próximo passo.

### 3. Criar o serviço web no Render

1. **New +** → **Web Service**.
2. Conecte o repositório do GitHub que você acabou de criar.
3. Configurações:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (ou o que preferir)
4. Em **Environment Variables**, adicione:
   - `DATABASE_URL` = (cole aqui a *Internal Database URL* copiada no passo 2)
5. Clique em **Create Web Service**.

O Render vai instalar as dependências, subir o servidor, e o próprio
`server.js` cria a tabela `modelos` sozinho no primeiro start (já com os
3 modelos de exemplo, caso o catálogo esteja vazio).

### 4. Pronto

Sua aplicação vai estar disponível em algo como
`https://brasilgrass-app.onrender.com` — esse é o link que você compartilha
com a equipe de vendas.

> Nota: no plano gratuito do Render, o serviço "dorme" depois de um tempo
> sem uso e demora alguns segundos pra acordar no primeiro acesso do dia.
> Se isso incomodar, dá pra migrar pro plano pago mais tarde.

## Rodando localmente (opcional, pra testar antes de subir)

Precisa de um Postgres local ou de usar a `DATABASE_URL` de um banco do
Render mesmo em modo de teste.

```bash
npm install
DATABASE_URL=postgres://usuario:senha@localhost:5432/brasilgrass npm start
```

Depois acesse `http://localhost:3000`.

## Próximos ajustes

Qualquer erro ou ajuste que aparecer no uso do dia a dia, é só reportar —
o arquivo principal da aplicação é `public/index.html`.
