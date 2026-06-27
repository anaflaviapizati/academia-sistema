import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { formToObject, formatMoney } from '../utils/format';
import { useFormMessage } from '../hooks/useSelectData';
import { BadgeAtivo, FormMessage, TrashIcon } from '../components/ui';

export default function Planos() {
  const [planos, setPlanos] = useState([]);
  const { msg, show } = useFormMessage();

  const carregar = useCallback(async () => {
    setPlanos(await api('/planos'));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleSubmit(ev) {
    ev.preventDefault();
    const form = ev.target;
    try {
      const dados = formToObject(form);
      await api('/planos', { method: 'POST', body: JSON.stringify(dados) });
      show('Plano cadastrado com sucesso!', 'sucesso');
      form.reset();
      carregar();
    } catch (e) {
      show(e.message, 'erro');
    }
  }

  async function handleToggle(id, ativo) {
    try {
      await api(`/planos/${id}`, { method: 'PUT', body: JSON.stringify({ ativo: !ativo }) });
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleExcluir(id) {
    if (!confirm('Excluir este plano?')) return;
    try {
      await api(`/planos/${id}`, { method: 'DELETE' });
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <section className="view">
      <header className="view-header">
        <h1>Planos</h1>
        <p>Catálogo de planos oferecidos pela academia.</p>
      </header>

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label>Nome *</label>
          <input type="text" name="nome" required placeholder="Mensal, Trimestral..." />
        </div>
        <div className="field">
          <label>Valor (R$) *</label>
          <input type="number" name="valor" required min="0" step="0.01" />
        </div>
        <div className="field">
          <label>Duração (meses) *</label>
          <input type="number" name="duracaoMeses" required min="1" step="1" />
        </div>
        <div className="field">
          <label>Benefícios</label>
          <input type="text" name="beneficios" placeholder="Musculação, Piscina" />
        </div>
        <div className="field span-2">
          <label>Descrição</label>
          <input type="text" name="descricao" />
        </div>
        <div className="field actions span-2">
          <button type="submit" className="btn-primary">
            Cadastrar plano
          </button>
          <FormMessage msg={msg} />
        </div>
      </form>

      <div className="panel">
        <div className="panel-toolbar">
          <h2>Planos cadastrados</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Valor</th>
                <th>Duração</th>
                <th>Benefícios</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {planos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="vazio">
                    Nenhum plano cadastrado ainda.
                  </td>
                </tr>
              ) : (
                planos.map((p) => (
                  <tr key={p._id}>
                    <td>{p.nome}</td>
                    <td>{formatMoney(p.valor)}</td>
                    <td>{p.duracaoMeses} mês(es)</td>
                    <td>{(p.beneficios || []).join(', ') || '—'}</td>
                    <td>
                      <BadgeAtivo ativo={p.ativo} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => handleToggle(p._id, p.ativo)}
                      >
                        {p.ativo ? 'Desativar' : 'Ativar'}
                      </button>{' '}
                      <button
                        type="button"
                        className="btn-danger btn-icon-only"
                        aria-label="Excluir plano"
                        title="Excluir plano"
                        onClick={() => handleExcluir(p._id)}
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
