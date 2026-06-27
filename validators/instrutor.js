function validarInstrutor(dados, { isUpdate = false } = {}) {
  const limpo = {};

  if (dados.nome !== undefined) limpo.nome = String(dados.nome).trim();
  else if (!isUpdate) throw new Error('O campo "nome" é obrigatório');

  if (dados.cpf !== undefined) limpo.cpf = String(dados.cpf).trim();
  else if (!isUpdate) throw new Error('O campo "cpf" é obrigatório');

  if (dados.email !== undefined) limpo.email = String(dados.email).trim().toLowerCase();
  else if (!isUpdate) throw new Error('O campo "email" é obrigatório');

  if (dados.telefone !== undefined) limpo.telefone = String(dados.telefone).trim();

  if (dados.especialidades !== undefined) {
    limpo.especialidades = Array.isArray(dados.especialidades)
      ? dados.especialidades.map((e) => String(e).trim())
      : String(dados.especialidades).split(',').map((e) => e.trim()).filter(Boolean);
  }

  if (dados.cref !== undefined) limpo.cref = String(dados.cref).trim();

  if (dados.ativo !== undefined) limpo.ativo = Boolean(dados.ativo);
  else if (!isUpdate) limpo.ativo = true;

  return limpo;
}

module.exports = validarInstrutor;
