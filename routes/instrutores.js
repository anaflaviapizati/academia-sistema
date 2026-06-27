const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { paraObjectId } = require('../utils/objectId');
const validarInstrutor = require('../validators/instrutor');

router.post('/', async (req, res) => {
  try {
    const dados = validarInstrutor(req.body);
    const db = getDB();

    const duplicado = await db.collection('instrutores').findOne({
      $or: [{ cpf: dados.cpf }, { email: dados.email }]
    });
    if (duplicado) return res.status(400).json({ erro: 'Já existe um instrutor com este CPF ou e-mail' });

    const agora = new Date();
    const resultado = await db.collection('instrutores').insertOne({
      ...dados,
      createdAt: agora,
      updatedAt: agora
    });
    const instrutor = await db.collection('instrutores').findOne({ _id: resultado.insertedId });
    res.status(201).json(instrutor);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const filtro = {};
    if (req.query.ativo !== undefined) filtro.ativo = req.query.ativo === 'true';

    const instrutores = await db.collection('instrutores').find(filtro).sort({ nome: 1 }).toArray();
    res.json(instrutores);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const db = getDB();
    const instrutor = await db.collection('instrutores').findOne({ _id: id });
    if (!instrutor) return res.status(404).json({ erro: 'Instrutor não encontrado' });
    res.json(instrutor);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const dados = validarInstrutor(req.body, { isUpdate: true });
    dados.updatedAt = new Date();

    const db = getDB();
    const instrutor = await db.collection('instrutores').findOneAndUpdate(
      { _id: id },
      { $set: dados },
      { returnDocument: 'after' }
    );
    if (!instrutor) return res.status(404).json({ erro: 'Instrutor não encontrado' });
    res.json(instrutor);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const db = getDB();
    const resultado = await db.collection('instrutores').findOneAndDelete({ _id: id });
    if (!resultado) return res.status(404).json({ erro: 'Instrutor não encontrado' });
    res.json({ mensagem: 'Instrutor removido com sucesso' });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

module.exports = router;
