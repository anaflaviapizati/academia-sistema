const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { paraObjectId } = require('../utils/objectId');
const validarAluno = require('../validators/aluno');

function pipelineComPlano(filtro) {
  return [
    { $match: filtro },
    {
      $lookup: {
        from: 'planos',
        localField: 'planoAtual',
        foreignField: '_id',
        as: 'planoAtual'
      }
    },
    { $unwind: { path: '$planoAtual', preserveNullAndEmptyArrays: true } },
    { $sort: { nome: 1 } }
  ];
}

router.post('/', async (req, res) => {
  try {
    const dados = validarAluno(req.body);
    const db = getDB();

    const duplicado = await db.collection('alunos').findOne({
      $or: [{ cpf: dados.cpf }, { email: dados.email }]
    });
    if (duplicado) return res.status(400).json({ erro: 'Já existe um aluno com este CPF ou e-mail' });

    const agora = new Date();
    const resultado = await db.collection('alunos').insertOne({
      ...dados,
      createdAt: agora,
      updatedAt: agora
    });
    const aluno = await db.collection('alunos').findOne({ _id: resultado.insertedId });
    res.status(201).json(aluno);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Listar alunos
router.get('/', async (req, res) => {
  try {
    const filtro = {};
    if (req.query.ativo !== undefined) filtro.ativo = req.query.ativo === 'true';

    const db = getDB();
    const alunos = await db.collection('alunos').aggregate(pipelineComPlano(filtro)).toArray();
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Buscar aluno por ID
router.get('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const db = getDB();
    const [aluno] = await db.collection('alunos').aggregate(pipelineComPlano({ _id: id })).toArray();
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });
    res.json(aluno);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Atualizar aluno
router.put('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const dados = validarAluno(req.body, { isUpdate: true });
    dados.updatedAt = new Date();

    const db = getDB();
    const aluno = await db.collection('alunos').findOneAndUpdate(
      { _id: id },
      { $set: dados },
      { returnDocument: 'after' }
    );
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });
    res.json(aluno);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Remover aluno
router.delete('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const db = getDB();
    const resultado = await db.collection('alunos').findOneAndDelete({ _id: id });
    if (!resultado) return res.status(404).json({ erro: 'Aluno não encontrado' });
    res.json({ mensagem: 'Aluno removido com sucesso' });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

module.exports = router;
