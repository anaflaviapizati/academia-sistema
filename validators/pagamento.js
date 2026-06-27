const { paraObjectId } = require('../utils/objectId');

const FORMAS_VALIDAS = ['pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'boleto'];
const STATUS_VALIDOS = ['pago', 'pendente', 'atrasado'];

function validarPagamento(dados, { isUpdate = false } = {}) {
  const limpo = {};

  if (dados.aluno !== undefined) {
    const id = paraObjectId(dados.aluno);
    if (!id) throw new Error('O campo "aluno" possui um ID inválido');
    limpo.aluno = id;
  } else if (!isUpdate) {
    throw new Error('O campo "aluno" é obrigatório');
  }

  if (dados.matricula !== undefined) {
    const id = paraObjectId(dados.matricula);
    if (!id) throw new Error('O campo "matricula" possui um ID inválido');
    limpo.matricula = id;
  } else if (!isUpdate) {
    throw new Error('O campo "matricula" é obrigatório');
  }

  if (dados.valor !== undefined) {
    const valor = Number(dados.valor);
    if (Number.isNaN(valor) || valor < 0) throw new Error('O campo "valor" deve ser um número >= 0');
    limpo.valor = valor;
  } else if (!isUpdate) {
    throw new Error('O campo "valor" é obrigatório');
  }

  if (dados.mesReferencia !== undefined) {
    const mes = String(dados.mesReferencia).trim();
    if (!/^\d{4}-\d{2}$/.test(mes)) throw new Error('O campo "mesReferencia" deve estar no formato "AAAA-MM"');
    limpo.mesReferencia = mes;
  } else if (!isUpdate) {
    throw new Error('O campo "mesReferencia" é obrigatório');
  }

  if (dados.dataPagamento !== undefined && dados.dataPagamento !== '') {
    const data = new Date(dados.dataPagamento);
    if (Number.isNaN(data.getTime())) throw new Error('O campo "dataPagamento" é inválido');
    limpo.dataPagamento = data;
  } else if (!isUpdate) {
    limpo.dataPagamento = new Date();
  }

  if (dados.formaPagamento !== undefined) {
    if (!FORMAS_VALIDAS.includes(dados.formaPagamento)) {
      throw new Error(`O campo "formaPagamento" deve ser um de: ${FORMAS_VALIDAS.join(', ')}`);
    }
    limpo.formaPagamento = dados.formaPagamento;
  } else if (!isUpdate) {
    throw new Error('O campo "formaPagamento" é obrigatório');
  }

  if (dados.status !== undefined) {
    if (!STATUS_VALIDOS.includes(dados.status)) {
      throw new Error(`O campo "status" deve ser um de: ${STATUS_VALIDOS.join(', ')}`);
    }
    limpo.status = dados.status;
  } else if (!isUpdate) {
    limpo.status = 'pago';
  }

  return limpo;
}

module.exports = validarPagamento;
