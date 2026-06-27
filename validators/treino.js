const { paraObjectId } = require('../utils/objectId');

const OBJETIVOS_VALIDOS = ['hipertrofia', 'emagrecimento', 'condicionamento', 'forca', 'saude_geral'];

function validarExercicio(ex) {
  if (!ex || ex.nome === undefined || ex.series === undefined || ex.repeticoes === undefined) {
    throw new Error('Cada exercício precisa de "nome", "series" e "repeticoes"');
  }
  const series = Number(ex.series);
  if (Number.isNaN(series) || series < 1) throw new Error('O campo "series" de um exercício deve ser >= 1');

  const exercicio = {
    nome: String(ex.nome).trim(),
    series,
    repeticoes: String(ex.repeticoes).trim()
  };

  if (ex.cargaKg !== undefined && ex.cargaKg !== '') {
    const carga = Number(ex.cargaKg);
    if (Number.isNaN(carga) || carga < 0) throw new Error('O campo "cargaKg" deve ser um número >= 0');
    exercicio.cargaKg = carga;
  }
  if (ex.observacao !== undefined) exercicio.observacao = String(ex.observacao).trim();

  return exercicio;
}

function validarTreino(dados, { isUpdate = false } = {}) {
  const limpo = {};

  if (dados.aluno !== undefined) {
    const id = paraObjectId(dados.aluno);
    if (!id) throw new Error('O campo "aluno" possui um ID inválido');
    limpo.aluno = id;
  } else if (!isUpdate) {
    throw new Error('O campo "aluno" é obrigatório');
  }

  if (dados.instrutor !== undefined) {
    const id = paraObjectId(dados.instrutor);
    if (!id) throw new Error('O campo "instrutor" possui um ID inválido');
    limpo.instrutor = id;
  } else if (!isUpdate) {
    throw new Error('O campo "instrutor" é obrigatório');
  }

  if (dados.nome !== undefined) limpo.nome = String(dados.nome).trim();
  else if (!isUpdate) throw new Error('O campo "nome" é obrigatório');

  if (dados.objetivo !== undefined) {
    if (!OBJETIVOS_VALIDOS.includes(dados.objetivo)) {
      throw new Error(`O campo "objetivo" deve ser um de: ${OBJETIVOS_VALIDOS.join(', ')}`);
    }
    limpo.objetivo = dados.objetivo;
  } else if (!isUpdate) {
    limpo.objetivo = 'saude_geral';
  }

  if (dados.exercicios !== undefined) {
    if (!Array.isArray(dados.exercicios) || dados.exercicios.length === 0) {
      throw new Error('O campo "exercicios" deve ser uma lista com pelo menos um exercício');
    }
    limpo.exercicios = dados.exercicios.map(validarExercicio);
  } else if (!isUpdate) {
    throw new Error('O campo "exercicios" é obrigatório');
  }

  if (dados.dataValidade !== undefined && dados.dataValidade !== '') {
    const data = new Date(dados.dataValidade);
    if (Number.isNaN(data.getTime())) throw new Error('O campo "dataValidade" é inválido');
    limpo.dataValidade = data;
  }

  if (dados.ativo !== undefined) limpo.ativo = Boolean(dados.ativo);
  else if (!isUpdate) limpo.ativo = true;

  return limpo;
}

module.exports = validarTreino;
