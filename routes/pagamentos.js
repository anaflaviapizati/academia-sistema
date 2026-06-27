const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { paraObjectId } = require('../utils/objectId');
const validarPagamento = require('../validators/pagamento');

function pipelineComRelacionados(filtro) {
  return [
    { $match: filtro },
    {
      $lookup: {
        from: 'alunos',
        localField: 'aluno',
        foreignField: '_id',
        as: 'aluno',
        pipeline: [{ $project: { nome: 1, cpf: 1, email: 1 } }]
      }
    },
    { $unwind: { path: '$aluno', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'matriculas',
        localField: 'matricula',
        foreignField: '_id',
        as: 'matricula'
      }
    },
    { $unwind: { path: '$matricula', preserveNullAndEmptyArrays: true } },
    { $sort: { dataPagamento: -1 } }
  ];
}

router.post('/', async (req, res) => {
  try {
    const dados = validarPagamento(req.body);
    const db = getDB();

    const matriculaExiste = await db.collection('matriculas').findOne({ _id: dados.matricula });
    if (!matriculaExiste) return res.status(404).json({ erro: 'Matrícula não encontrada' });

    const agora = new Date();
    const resultado = await db.collection('pagamentos').insertOne({
      ...dados,
      createdAt: agora,
      updatedAt: agora
    });
    const pagamento = await db.collection('pagamentos').findOne({ _id: resultado.insertedId });
    res.status(201).json(pagamento);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Listar pagamentos
router.get('/', async (req, res) => {
  try {
    const filtro = {};
    if (req.query.aluno) {
      const id = paraObjectId(req.query.aluno);
      if (!id) return res.status(400).json({ erro: 'ID de aluno inválido' });
      filtro.aluno = id;
    }
    if (req.query.status) filtro.status = req.query.status;
    if (req.query.mesReferencia) filtro.mesReferencia = req.query.mesReferencia;

    const db = getDB();
    const pagamentos = await db.collection('pagamentos').aggregate(pipelineComRelacionados(filtro)).toArray();
    res.json(pagamentos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const db = getDB();
    const [pagamento] = await db.collection('pagamentos').aggregate(pipelineComRelacionados({ _id: id })).toArray();
    if (!pagamento) return res.status(404).json({ erro: 'Pagamento não encontrado' });
    res.json(pagamento);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const dados = validarPagamento(req.body, { isUpdate: true });
    dados.updatedAt = new Date();

    const db = getDB();
    const pagamento = await db.collection('pagamentos').findOneAndUpdate(
      { _id: id },
      { $set: dados },
      { returnDocument: 'after' }
    );
    if (!pagamento) return res.status(404).json({ erro: 'Pagamento não encontrado' });
    res.json(pagamento);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const db = getDB();
    const resultado = await db.collection('pagamentos').findOneAndDelete({ _id: id });
    if (!resultado) return res.status(404).json({ erro: 'Pagamento não encontrado' });
    res.json({ mensagem: 'Pagamento removido com sucesso' });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

module.exports = router;
