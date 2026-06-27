// Validador "puro": apenas confere/normaliza os campos antes de gravar no
// MongoDB. Não é um Schema/Model de ORM/ODM — é só uma função JavaScript.
function validarPlano(dados, { isUpdate = false } = {}) {
  const limpo = {};

  if (dados.nome !== undefined) limpo.nome = String(dados.nome).trim();
  else if (!isUpdate) throw new Error('O campo "nome" é obrigatório');

  if (dados.descricao !== undefined) limpo.descricao = String(dados.descricao).trim();

  if (dados.valor !== undefined) {
    const valor = Number(dados.valor);
    if (Number.isNaN(valor) || valor < 0) throw new Error('O campo "valor" deve ser um número >= 0');
    limpo.valor = valor;
  } else if (!isUpdate) {
    throw new Error('O campo "valor" é obrigatório');
  }

  if (dados.duracaoMeses !== undefined) {
    const duracao = Number(dados.duracaoMeses);
    if (Number.isNaN(duracao) || duracao < 1) throw new Error('O campo "duracaoMeses" deve ser um número >= 1');
    limpo.duracaoMeses = duracao;
  } else if (!isUpdate) {
    throw new Error('O campo "duracaoMeses" é obrigatório');
  }

  if (dados.beneficios !== undefined) {
    limpo.beneficios = Array.isArray(dados.beneficios)
      ? dados.beneficios.map((b) => String(b).trim())
      : String(dados.beneficios).split(',').map((b) => b.trim()).filter(Boolean);
  }

  if (dados.ativo !== undefined) limpo.ativo = Boolean(dados.ativo);
  else if (!isUpdate) limpo.ativo = true;

  return limpo;
}

module.exports = validarPlano;
