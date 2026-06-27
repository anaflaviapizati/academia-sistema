require('dotenv').config();
const { connectDB, closeDB } = require('./config/db');

async function seed() {
  const db = await connectDB();

  console.log('Limpando coleções...');
  await Promise.all([
    db.collection('alunos').deleteMany({}),
    db.collection('instrutores').deleteMany({}),
    db.collection('planos').deleteMany({}),
    db.collection('matriculas').deleteMany({}),
    db.collection('pagamentos').deleteMany({}),
    db.collection('treinos').deleteMany({}),
    db.collection('checkins').deleteMany({})
  ]);

  const agora = new Date();

  console.log('Criando planos...');
  const { insertedIds: idsPlanos } = await db.collection('planos').insertMany([
    {
      nome: 'Mensal',
      descricao: 'Plano com renovação mensal',
      valor: 120,
      duracaoMeses: 1,
      beneficios: ['Musculação', 'Aulas coletivas'],
      ativo: true,
      createdAt: agora,
      updatedAt: agora
    },
    {
      nome: 'Trimestral',
      descricao: 'Plano com renovação trimestral e desconto',
      valor: 320,
      duracaoMeses: 3,
      beneficios: ['Musculação', 'Aulas coletivas', 'Avaliação física'],
      ativo: true,
      createdAt: agora,
      updatedAt: agora
    },
    {
      nome: 'Anual',
      descricao: 'Plano anual com maior desconto',
      valor: 1100,
      duracaoMeses: 12,
      beneficios: ['Musculação', 'Aulas coletivas', 'Avaliação física', 'Acesso à piscina'],
      ativo: true,
      createdAt: agora,
      updatedAt: agora
    }
  ]);
  const planoMensal = { _id: idsPlanos[0], duracaoMeses: 1, valor: 120 };
  const planoTrimestral = { _id: idsPlanos[1], duracaoMeses: 3, valor: 320 };

  console.log('Criando instrutores...');
  const { insertedIds: idsInstrutores } = await db.collection('instrutores').insertMany([
    {
      nome: 'Carlos Souza',
      cpf: '111.111.111-11',
      email: 'carlos.souza@academia.com',
      telefone: '(31) 99999-0001',
      especialidades: ['Musculação', 'Hipertrofia'],
      cref: '123456-G/MG',
      ativo: true,
      createdAt: agora,
      updatedAt: agora
    },
    {
      nome: 'Fernanda Lima',
      cpf: '222.222.222-22',
      email: 'fernanda.lima@academia.com',
      telefone: '(31) 99999-0002',
      especialidades: ['Funcional', 'Pilates'],
      cref: '654321-G/MG',
      ativo: true,
      createdAt: agora,
      updatedAt: agora
    }
  ]);
  const instrutor1 = idsInstrutores[0];
  const instrutor2 = idsInstrutores[1];

  console.log('Criando alunos...');
  const { insertedIds: idsAlunos } = await db.collection('alunos').insertMany([
    {
      nome: 'Ana Flávia Pizati',
      cpf: '333.333.333-33',
      email: 'ana.flavia@email.com',
      telefone: '(31) 98888-0001',
      dataNascimento: new Date('1998-05-12'),
      endereco: {
        rua: 'Rua das Flores',
        numero: '100',
        bairro: 'Centro',
        cidade: 'Mariana',
        estado: 'MG',
        cep: '35420-000'
      },
      planoAtual: planoTrimestral._id,
      dataMatricula: agora,
      ativo: true,
      createdAt: agora,
      updatedAt: agora
    },
    {
      nome: 'João Pedro Alves',
      cpf: '444.444.444-44',
      email: 'joao.pedro@email.com',
      telefone: '(31) 98888-0002',
      dataNascimento: new Date('1995-09-23'),
      planoAtual: planoMensal._id,
      dataMatricula: agora,
      ativo: true,
      createdAt: agora,
      updatedAt: agora
    }
  ]);
  const aluno1 = idsAlunos[0];
  const aluno2 = idsAlunos[1];

  console.log('Criando matrículas...');
  const dataInicio1 = new Date();
  const dataFim1 = new Date(dataInicio1);
  dataFim1.setMonth(dataFim1.getMonth() + planoTrimestral.duracaoMeses);

  const dataInicio2 = new Date();
  const dataFim2 = new Date(dataInicio2);
  dataFim2.setMonth(dataFim2.getMonth() + planoMensal.duracaoMeses);

  const { insertedIds: idsMatriculas } = await db.collection('matriculas').insertMany([
    {
      aluno: aluno1,
      plano: planoTrimestral._id,
      dataInicio: dataInicio1,
      dataFim: dataFim1,
      valorContratado: planoTrimestral.valor,
      status: 'ativa',
      createdAt: agora,
      updatedAt: agora
    },
    {
      aluno: aluno2,
      plano: planoMensal._id,
      dataInicio: dataInicio2,
      dataFim: dataFim2,
      valorContratado: planoMensal.valor,
      status: 'ativa',
      createdAt: agora,
      updatedAt: agora
    }
  ]);
  const matricula1 = idsMatriculas[0];
  const matricula2 = idsMatriculas[1];

  console.log('Criando pagamentos...');
  const mesAtual = new Date().toISOString().slice(0, 7); // "AAAA-MM"
  await db.collection('pagamentos').insertMany([
    {
      aluno: aluno1,
      matricula: matricula1,
      valor: planoTrimestral.valor,
      mesReferencia: mesAtual,
      dataPagamento: agora,
      formaPagamento: 'pix',
      status: 'pago',
      createdAt: agora,
      updatedAt: agora
    },
    {
      aluno: aluno2,
      matricula: matricula2,
      valor: planoMensal.valor,
      mesReferencia: mesAtual,
      dataPagamento: agora,
      formaPagamento: 'cartao_credito',
      status: 'pago',
      createdAt: agora,
      updatedAt: agora
    }
  ]);

  console.log('Criando treinos...');
  await db.collection('treinos').insertMany([
    {
      aluno: aluno1,
      instrutor: instrutor1,
      nome: 'Treino A - Membros Superiores',
      objetivo: 'hipertrofia',
      exercicios: [
        { nome: 'Supino reto', series: 4, repeticoes: '10-12', cargaKg: 40 },
        { nome: 'Puxada frontal', series: 4, repeticoes: '10-12', cargaKg: 50 },
        { nome: 'Rosca direta', series: 3, repeticoes: '12', cargaKg: 12 }
      ],
      ativo: true,
      createdAt: agora,
      updatedAt: agora
    },
    {
      aluno: aluno2,
      instrutor: instrutor2,
      nome: 'Treino Funcional - Corpo Inteiro',
      objetivo: 'condicionamento',
      exercicios: [
        { nome: 'Burpee', series: 3, repeticoes: '15' },
        { nome: 'Agachamento livre', series: 4, repeticoes: '15', cargaKg: 20 },
        { nome: 'Prancha', series: 3, repeticoes: '45s' }
      ],
      ativo: true,
      createdAt: agora,
      updatedAt: agora
    }
  ]);

  console.log('Criando check-in de exemplo...');
  await db.collection('checkins').insertOne({
    aluno: aluno1,
    dataHoraEntrada: agora,
    createdAt: agora,
    updatedAt: agora
  });

  console.log('Seed finalizado com sucesso!');
  await closeDB();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error('Erro ao popular o banco:', err);
  await closeDB();
  process.exit(1);
});
