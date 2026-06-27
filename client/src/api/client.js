const API_URL = import.meta.env.VITE_API_URL;

export async function api(path, options = {}) {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options,
  });

  let dados = {};

  try {
    dados = await res.json();
  } catch (_) {
    // resposta sem JSON
  }

  if (!res.ok) {
    throw new Error(dados.erro || `Erro ${res.status}`);
  }

  return dados;
}