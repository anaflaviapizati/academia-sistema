const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { paraObjectId } = require('../utils/objectId');
const validarCheckinEntrada = require('../validators/checkin');

// Registrar entrada
router.post('/entrada', async (req, res) => {
  try {
    const dados = validarCheckinEntrada(req.body);
    const db = getDB();

    const alunoExiste = await db.collection('alunos').findOne({ _id: dados.aluno });
    if (!alunoExiste) return res.status(404).json({ erro: 'Aluno não encontrado' });

    const agora = new Date();
    const resultado = await db.collection('checkins').insertOne({
      ...dados,
      createdAt: agora,
      updatedAt: agora
    });
    const checkin = await db.collection('checkins').findOne({ _id: resultado.insertedId });
    res.status(201).json(checkin);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Registrar saída
router.put('/:id/saida', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const db = getDB();
    const checkin = await db.collection('checkins').findOneAndUpdate(
      { _id: id },
      { $set: { dataHoraSaida: new Date(), updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!checkin) return res.status(404).json({ erro: 'Check-in não encontrado' });
    res.json(checkin);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Listar check-ins
router.get('/', async (req, res) => {
  try {
    const filtro = {};
    if (req.query.aluno) {
      const id = paraObjectId(req.query.aluno);
      if (!id) return res.status(400).json({ erro: 'ID de aluno inválido' });
      filtro.aluno = id;
    }

    const db = getDB();
    const checkins = await db.collection('checkins').aggregate([
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
      { $sort: { dataHoraEntrada: -1 } }
    ]).toArray();
    res.json(checkins);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
