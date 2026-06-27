const { paraObjectId } = require('../utils/objectId');

function validarCheckinEntrada(dados) {
  if (dados.aluno === undefined) throw new Error('O campo "aluno" é obrigatório');
  const id = paraObjectId(dados.aluno);
  if (!id) throw new Error('O campo "aluno" possui um ID inválido');
  return { aluno: id, dataHoraEntrada: new Date() };
}

module.exports = validarCheckinEntrada;
