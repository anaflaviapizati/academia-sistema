export async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  let dados = {};
  try {
    dados = await res.json();
  } catch (_) {
    /* resposta sem JSON */
  }
  if (!res.ok) throw new Error(dados.erro || `Erro ${res.status}`);
  return dados;
}
