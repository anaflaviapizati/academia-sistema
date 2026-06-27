const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { paraObjectId } = require('../utils/objectId');
const validarMatricula = require('../validators/matricula');

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
        from: 'planos',
        localField: 'plano',
        foreignField: '_id',
        as: 'plano'
      }
    },
    { $unwind: { path: '$plano', preserveNullAndEmptyArrays: true } },
    { $sort: { dataInicio: -1 } }
  ];
}

// Criar matrícula
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const dados = validarMatricula(req.body);

    const alunoExiste = await db.collection('alunos').findOne({ _id: dados.aluno });
    if (!alunoExiste) return res.status(404).json({ erro: 'Aluno não encontrado' });

    const planoExiste = await db.collection('planos').findOne({ _id: dados.plano });
    if (!planoExiste) return res.status(404).json({ erro: 'Plano não encontrado' });

    const dataInicio = dados.dataInicio || new Date();
    let dataFim = dados.dataFim;
    if (!dataFim) {
      dataFim = new Date(dataInicio);
      dataFim.setMonth(dataFim.getMonth() + planoExiste.duracaoMeses);
    }

    const agora = new Date();
    const novaMatricula = {
      aluno: dados.aluno,
      plano: dados.plano,
      dataInicio,
      dataFim,
      valorContratado: dados.valorContratado ?? planoExiste.valor,
      status: 'ativa',
      createdAt: agora,
      updatedAt: agora
    };

    const resultado = await db.collection('matriculas').insertOne(novaMatricula);

    await db.collection('alunos').updateOne(
      { _id: dados.aluno },
      { $set: { planoAtual: dados.plano, updatedAt: agora } }
    );

    const matriculaCriada = await db.collection('matriculas').findOne({ _id: resultado.insertedId });
    res.status(201).json(matriculaCriada);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Listar matrículas
router.get('/', async (req, res) => {
  try {
    const filtro = {};
    if (req.query.aluno) {
      const id = paraObjectId(req.query.aluno);
      if (!id) return res.status(400).json({ erro: 'ID de aluno inválido' });
      filtro.aluno = id;
    }
    if (req.query.status) filtro.status = req.query.status;

    const db = getDB();
    const matriculas = await db.collection('matriculas').aggregate(pipelineComRelacionados(filtro)).toArray();
    res.json(matriculas);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const db = getDB();
    const [matricula] = await db.collection('matriculas').aggregate(pipelineComRelacionados({ _id: id })).toArray();
    if (!matricula) return res.status(404).json({ erro: 'Matrícula não encontrada' });
    res.json(matricula);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const dados = validarMatricula(req.body, { isUpdate: true });
    dados.updatedAt = new Date();

    const db = getDB();
    const matricula = await db.collection('matriculas').findOneAndUpdate(
      { _id: id },
      { $set: dados },
      { returnDocument: 'after' }
    );
    if (!matricula) return res.status(404).json({ erro: 'Matrícula não encontrada' });
    res.json(matricula);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const db = getDB();
    const resultado = await db.collection('matriculas').findOneAndDelete({ _id: id });
    if (!resultado) return res.status(404).json({ erro: 'Matrícula não encontrada' });
    res.json({ mensagem: 'Matrícula removida com sucesso' });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

module.exports = router;
