const { paraObjectId } = require('../utils/objectId');

function validarEndereco(endereco) {
  if (!endereco || typeof endereco !== 'object') return undefined;
  const { rua, numero, bairro, cidade, estado, cep } = endereco;
  return {
    rua: rua ? String(rua).trim() : undefined,
    numero: numero ? String(numero).trim() : undefined,
    bairro: bairro ? String(bairro).trim() : undefined,
    cidade: cidade ? String(cidade).trim() : undefined,
    estado: estado ? String(estado).trim() : undefined,
    cep: cep ? String(cep).trim() : undefined
  };
}

function validarAluno(dados, { isUpdate = false } = {}) {
  const limpo = {};

  if (dados.nome !== undefined) limpo.nome = String(dados.nome).trim();
  else if (!isUpdate) throw new Error('O campo "nome" é obrigatório');

  if (dados.cpf !== undefined) limpo.cpf = String(dados.cpf).trim();
  else if (!isUpdate) throw new Error('O campo "cpf" é obrigatório');

  if (dados.email !== undefined) limpo.email = String(dados.email).trim().toLowerCase();
  else if (!isUpdate) throw new Error('O campo "email" é obrigatório');

  if (dados.telefone !== undefined) limpo.telefone = String(dados.telefone).trim();

  if (dados.dataNascimento !== undefined && dados.dataNascimento !== '') {
    const data = new Date(dados.dataNascimento);
    if (Number.isNaN(data.getTime())) throw new Error('O campo "dataNascimento" é inválido');
    limpo.dataNascimento = data;
  }

  if (dados.endereco !== undefined) limpo.endereco = validarEndereco(dados.endereco);

  if (dados.planoAtual !== undefined && dados.planoAtual !== '') {
    const id = paraObjectId(dados.planoAtual);
    if (!id) throw new Error('O campo "planoAtual" possui um ID inválido');
    limpo.planoAtual = id;
  }

  if (dados.observacoesMedicas !== undefined) {
    limpo.observacoesMedicas = String(dados.observacoesMedicas).trim();
  }

  if (dados.ativo !== undefined) limpo.ativo = Boolean(dados.ativo);
  else if (!isUpdate) limpo.ativo = true;

  if (!isUpdate) limpo.dataMatricula = dados.dataMatricula ? new Date(dados.dataMatricula) : new Date();

  return limpo;
}

module.exports = validarAluno;
