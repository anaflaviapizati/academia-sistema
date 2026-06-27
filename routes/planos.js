const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { paraObjectId } = require('../utils/objectId');
const validarPlano = require('../validators/plano');

// Criar plano
router.post('/', async (req, res) => {
  try {
    const dados = validarPlano(req.body);
    const db = getDB();
    const agora = new Date();
    const resultado = await db.collection('planos').insertOne({
      ...dados,
      createdAt: agora,
      updatedAt: agora
    });
    const plano = await db.collection('planos').findOne({ _id: resultado.insertedId });
    res.status(201).json(plano);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Listar todos os planos
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const filtro = {};
    if (req.query.ativo !== undefined) filtro.ativo = req.query.ativo === 'true';

    const planos = await db.collection('planos').find(filtro).sort({ valor: 1 }).toArray();
    res.json(planos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Buscar plano por ID
router.get('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const db = getDB();
    const plano = await db.collection('planos').findOne({ _id: id });
    if (!plano) return res.status(404).json({ erro: 'Plano não encontrado' });
    res.json(plano);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Atualizar plano
router.put('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const dados = validarPlano(req.body, { isUpdate: true });
    dados.updatedAt = new Date();

    const db = getDB();
    const plano = await db.collection('planos').findOneAndUpdate(
      { _id: id },
      { $set: dados },
      { returnDocument: 'after' }
    );
    if (!plano) return res.status(404).json({ erro: 'Plano não encontrado' });
    res.json(plano);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Remover plano
router.delete('/:id', async (req, res) => {
  try {
    const id = paraObjectId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido' });

    const db = getDB();
    const resultado = await db.collection('planos').findOneAndDelete({ _id: id });
    if (!resultado) return res.status(404).json({ erro: 'Plano não encontrado' });
    res.json({ mensagem: 'Plano removido com sucesso' });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

module.exports = router;
