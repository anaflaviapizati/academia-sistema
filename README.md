# Sistema de Academia usando MongoDB (nosql)

Sistema de gestão de academia construído com Node.js, Express e MongoDB para falar com o banco.

Inclui uma interface gráfica web simples usando React e vite para o front

O deploy foi feito usando o render para o backend e o vercel para subir o frontend.

Gerencia: alunos, instrutores, planos, matrículas, pagamentos, treinos e check-ins.

## Link de acesso

https://academia-sistema-evpvdc1g1-anaflaviapizatis-projects.vercel.app/

## Como rodar local

1. **Extraia o arquivo .zip** e entre na pasta do projeto:
   ```bash
   cd academia-sistema
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```
   (instala apenas `express`, `mongodb`, `dotenv`, `cors` e, para desenvolvimento, `nodemon`)

3. **Configure as variáveis de ambiente:**
   O arquivo `.env` já vem preenchido com a string de conexão do seu cluster Atlas (mas se for rodar local é só por o link, tem o exemplo no .env example):

4. **Inicie o servidor:**
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
   E tá pronto o sorvetinho.


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

## 🔧 Possíveis melhorias futuras

Adicionar autenticação
Melhorar a velocidade evoluindo o deploy
