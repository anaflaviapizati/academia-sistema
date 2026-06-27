export function formatMoney(valor) {
  if (valor === undefined || valor === null) return '—';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(valor, comHora = false) {
  if (!valor) return '—';
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '—';
  return comHora ? d.toLocaleString('pt-BR') : d.toLocaleDateString('pt-BR');
}

export function formToObject(form) {
  const fd = new FormData(form);
  const obj = {};
  for (const [chave, valor] of fd.entries()) {
    if (valor === '') continue;
    if (chave.includes('.')) {
      const [pai, filho] = chave.split('.');
      obj[pai] = obj[pai] || {};
      obj[pai][filho] = valor;
    } else {
      obj[chave] = valor;
    }
  }
  return obj;
}
