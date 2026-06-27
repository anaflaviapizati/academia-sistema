// Conexão com o MongoDB usando APENAS o driver nativo (pacote "mongodb").
// Não há nenhum ORM/ODM (como Mongoose) envolvido aqui - apenas o driver
// oficial, que é permitido pelo enunciado do projeto prático para
// estabelecer a conexão com o SGBD não-relacional.
const { MongoClient } = require('mongodb');

let client = null;
let db = null;

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/academia_db';

  client = new MongoClient(uri);
  await client.connect();

  // Usa o banco indicado na própria string de conexão (ex.: ".../academia_db?...").
  db = client.db(process.env.MONGO_DB_NAME);

  console.log(`Conectado ao MongoDB (driver nativo) - banco: "${db.databaseName}"`);

  await criarIndices(db);

  return db;
}

// Cria os índices recomendados na modelagem (ver MODELAGEM.md).
// Isso substitui o que antes era feito automaticamente pelo Mongoose
// através da opção "unique: true" nos schemas.
async function criarIndices(database) {
  try {
    await database.collection('alunos').createIndex({ cpf: 1 }, { unique: true });
    await database.collection('alunos').createIndex({ email: 1 }, { unique: true });

    await database.collection('instrutores').createIndex({ cpf: 1 }, { unique: true });
    await database.collection('instrutores').createIndex({ email: 1 }, { unique: true });

    await database.collection('matriculas').createIndex({ aluno: 1, status: 1 });
    await database.collection('pagamentos').createIndex({ aluno: 1, mesReferencia: 1 });
    await database.collection('checkins').createIndex({ aluno: 1, dataHoraEntrada: -1 });

    console.log('Índices verificados/criados com sucesso.');
  } catch (error) {
    console.error('Aviso ao criar índices:', error.message);
  }
}

function getDB() {
  if (!db) {
    throw new Error('Banco de dados não conectado. Chame connectDB() antes de usar getDB().');
  }
  return db;
}

async function closeDB() {
  if (client) await client.close();
}

module.exports = { connectDB, getDB, closeDB };
