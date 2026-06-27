const { paraObjectId } = require('../utils/objectId');

const STATUS_VALIDOS = ['ativa', 'vencida', 'cancelada'];

function validarMatricula(dados, { isUpdate = false } = {}) {
  const limpo = {};

  if (dados.aluno !== undefined) {
    const id = paraObjectId(dados.aluno);
    if (!id) throw new Error('O campo "aluno" possui um ID inválido');
    limpo.aluno = id;
  } else if (!isUpdate) {
    throw new Error('O campo "aluno" é obrigatório');
  }

  if (dados.plano !== undefined) {
    const id = paraObjectId(dados.plano);
    if (!id) throw new Error('O campo "plano" possui um ID inválido');
    limpo.plano = id;
  } else if (!isUpdate) {
    throw new Error('O campo "plano" é obrigatório');
  }

  if (dados.dataInicio !== undefined && dados.dataInicio !== '') {
    const data = new Date(dados.dataInicio);
    if (Number.isNaN(data.getTime())) throw new Error('O campo "dataInicio" é inválido');
    limpo.dataInicio = data;
  }

  if (dados.dataFim !== undefined && dados.dataFim !== '') {
    const data = new Date(dados.dataFim);
    if (Number.isNaN(data.getTime())) throw new Error('O campo "dataFim" é inválido');
    limpo.dataFim = data;
  }

  if (dados.valorContratado !== undefined) {
    const valor = Number(dados.valorContratado);
    if (Number.isNaN(valor) || valor < 0) throw new Error('O campo "valorContratado" deve ser um número >= 0');
    limpo.valorContratado = valor;
  }

  if (dados.status !== undefined) {
    if (!STATUS_VALIDOS.includes(dados.status)) {
      throw new Error(`O campo "status" deve ser um de: ${STATUS_VALIDOS.join(', ')}`);
    }
    limpo.status = dados.status;
  } else if (!isUpdate) {
    limpo.status = 'ativa';
  }

  return limpo;
}

module.exports = validarMatricula;
