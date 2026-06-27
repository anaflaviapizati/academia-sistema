const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { paraObjectId } = require('../utils/objectId');
const validarTreino = require('../validators/treino');

function pipelineComRelacionados(filtro) {
  return [
    { $match: filtro },
    {
      $lookup: {
        from: 'alunos',
        localField: 'aluno',
        foreignField: '_id',
        as: 'aluno',
        pipeline: [{ $project: { nome: 1, cpf: 1 } }]
      }
    },
    { $unwind: { path: '$aluno', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'instrutores',
        localField: 'instrutor',
        foreignField: '_id',
        as: 'instrutor',
        pipeline: [{ $project: { nome: 1, especialidades: 1 } }]
      }
    },
    { $unwind: { path: '$instrutor', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } }
  ];
}

router.post('/', async (req, res) => {
  try {
    const dados = validarTreino(req.body);
    const db = getDB();

    const agora = new Date();
    const resultado = await db.collection('treinos').insertOne({
      ...dados,
      createdAt: agora,
      updatedAt: agora
    });
    const treino = await db.collection('treinos').findOne({ _id: resultado.insertedId });
    res.status(201).json(treino);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Listar treinos
router.get('/', async (req, res) => {
  try {
    const filtro = {};
    if (req.query.aluno) {
      const id = paraObjectId(req.query.aluno);
      if (!id) return res.status(400).json({ erro: 'ID de aluno inválido' });
      filtro.aluno = id;
    }

    const db = getDB();
    const treinos = await db.collection('treinos').aggregate(pipelineComRelacionados(filtro)).toArray();
    res.json(treinos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const db = getDB();
    const [treino] = await db.collection('treinos').aggregate(pipelineComRelacionados({ _id: id })).toArray();
    if (!treino) return res.status(404).json({ erro: 'Treino não encontrado' });
    res.json(treino);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const dados = validarTreino(req.body, { isUpdate: true });
    dados.updatedAt = new Date();

    const db = getDB();
    const treino = await db.collection('treinos').findOneAndUpdate(
      { _id: id },
      { $set: dados },
      { returnDocument: 'after' }
    );
    if (!treino) return res.status(404).json({ erro: 'Treino não encontrado' });
    res.json(treino);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const db = getDB();
    const resultado = await db.collection('treinos').findOneAndDelete({ _id: id });
    if (!resultado) return res.status(404).json({ erro: 'Treino não encontrado' });
    res.json({ mensagem: 'Treino removido com sucesso' });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

module.exports = router;
