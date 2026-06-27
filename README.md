# 🏋️ Sistema de Academia — MongoDB (driver nativo, sem ORM/ODM)

Sistema de gestão de academia (CRUD completo) construído com **Node.js**, **Express** e **MongoDB**, usando **apenas o driver nativo do MongoDB** (pacote `mongodb`) para falar com o banco — **sem Mongoose, sem ORM/ODM e sem nenhuma outra biblioteca de terceiros para acesso aos dados**, conforme exigido no enunciado do projeto prático (CSI603 — Banco de Dados II).

Inclui uma **interface gráfica web simples** (HTML/CSS/JS puro, sem frameworks de frontend) para inserir e consultar os dados — não é necessário usar `mongosh`, Compass ou qualquer outro aplicativo de administração do SGBD.

Gerencia: alunos, instrutores, planos, matrículas, pagamentos, treinos e check-ins (frequência).

---

## 📁 Estrutura do projeto

```
academia-sistema/
├── config/
│   └── db.js               # Conexão com o MongoDB usando o driver nativo (MongoClient)
├── validators/              # Funções puras de validação dos dados (NÃO é ODM/Schema)
│   ├── aluno.js
│   ├── instrutor.js
│   ├── plano.js
│   ├── matricula.js
│   ├── pagamento.js
│   ├── treino.js
│   └── checkin.js
├── utils/
│   └── objectId.js          # Helper para validar/converter ObjectId
├── routes/                  # Rotas Express — falam com o MongoDB via db.collection(...)
│   ├── alunos.js
│   ├── instrutores.js
│   ├── planos.js
│   ├── matriculas.js
│   ├── pagamentos.js
│   ├── treinos.js
│   └── checkins.js
├── public/                  # Interface gráfica (front-end) servida pelo Express
│   ├── index.html
│   ├── style.css
│   └── app.js                # fetch() para a própria API REST — nenhum acesso direto ao BD
├── server.js                 # Ponto de entrada da aplicação (API + interface web)
├── seed.js                   # Script para popular o banco com dados de exemplo
├── package.json
├── .env / .env.example
└── MODELAGEM.md              # Documentação da modelagem do banco (NoSQL)
```

### Por que não há mais uma pasta `models/`?

Na versão anterior, `models/` continha *Schemas do Mongoose* (um ODM). Isso foi removido. Agora:

- `validators/*.js` são apenas **funções JavaScript comuns** que conferem e normalizam os campos recebidos antes de gravar — não têm relação com nenhum ORM/ODM, não definem "classes de modelo" e não controlam a conexão com o banco.
- Toda a comunicação real com o MongoDB acontece nas `routes/*.js`, diretamente via `db.collection('nome').find(...)`, `insertOne(...)`, `findOneAndUpdate(...)`, `aggregate(...)`, etc — chamadas nativas do pacote oficial `mongodb`.
- Relacionamentos entre coleções (o que antes era feito com `.populate()` do Mongoose) agora usam `$lookup` em pipelines de agregação — um recurso **nativo** do MongoDB, não uma biblioteca externa.

---

## ⚙️ Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- Uma conexão com o MongoDB: local (`mongodb://localhost:27017/...`) **ou** [MongoDB Atlas](https://www.mongodb.com/atlas) (gratuito)

---

## 🚀 Como rodar

1. **Extraia o arquivo .zip** e entre na pasta do projeto:
   ```bash
   cd academia-sistema
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```
   (instala apenas `express`, `mongodb`, `dotenv`, `cors` e, para desenvolvimento, `nodemon` — nenhum ORM/ODM)

3. **Configure as variáveis de ambiente:**
   O arquivo `.env` já vem preenchido com a string de conexão do seu cluster Atlas:
   ```
   PORT=3000
   MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/academia_db?appName=...
   ```
   Se quiser usar outro banco (ex.: local), edite essa linha. Veja `.env.example` para outros formatos.

   ⚠️ **Atenção:** o arquivo `.env` está no `.gitignore` (não é enviado ao Git), mas como a senha foi compartilhada em texto puro durante o desenvolvimento, é uma boa prática trocá-la no Atlas (Database Access → Edit Password) antes de entregar/publicar o projeto.

4. **(Opcional) Popule o banco com dados de exemplo:**
   ```bash
   npm run seed
   ```
   Isso cria 3 planos, 2 instrutores, 2 alunos, matrículas, pagamentos, treinos e um check-in de exemplo. Também garante a criação dos índices únicos (`cpf`, `email`).

5. **Inicie o servidor:**
   ```bash
   npm start
   ```
   Para desenvolvimento com reinício automático:
   ```bash
   npm run dev
   ```

6. **Abra a interface gráfica no navegador:**
   ```
   http://localhost:3000
   ```
   Use o menu lateral para cadastrar e consultar alunos, instrutores, planos, matrículas, pagamentos, treinos e check-ins — tudo pela própria interface, sem precisar de linha de comando ou de aplicativos de administração do MongoDB.

---

## 📡 Endpoints da API (usados pela própria interface)

Todos os recursos seguem o padrão REST: `GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`.

| Recurso        | Rota base             | Observações                                                                       |
|----------------|------------------------|-----------------------------------------------------------------------------------|
| Alunos         | `/api/alunos`          | Filtro: `?ativo=true`. Listagem já traz o plano atual (via `$lookup`).            |
| Instrutores    | `/api/instrutores`     |                                                                                     |
| Planos         | `/api/planos`          |                                                                                     |
| Matrículas     | `/api/matriculas`      | Ao criar, vincula automaticamente o plano ao aluno. Filtros: `?aluno=` `?status=` |
| Pagamentos     | `/api/pagamentos`      | Filtros: `?aluno=` `?status=` `?mesReferencia=`                                   |
| Treinos        | `/api/treinos`         | Filtro: `?aluno=`                                                                  |
| Check-ins      | `/api/checkins`        | `POST /api/checkins/entrada`, `PUT /api/checkins/:id/saida`                       |

### Exemplo (com `curl`, apenas para depuração — a entrega usa a interface web)

```bash
curl -X POST http://localhost:3000/api/planos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Mensal","valor":120,"duracaoMeses":1,"beneficios":["Musculação"]}'
```

---

## 🗂️ Modelagem do banco de dados

Veja o arquivo **`MODELAGEM.md`** para o detalhamento completo das coleções, relacionamentos e o diagrama (em Mermaid).

---

## 🔧 Possíveis melhorias futuras

- Autenticação (JWT) para instrutores/administradores
- Geração automática de pagamentos mensais (job agendado)
- Notificações de vencimento de plano
- Validação de CPF/CNPJ
