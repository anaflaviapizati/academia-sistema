import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { formToObject } from '../utils/format';
import { useFormMessage } from '../hooks/useSelectData';
import { BadgeAtivo, FormMessage, TrashIcon } from '../components/ui';

export default function Instrutores() {
  const [instrutores, setInstrutores] = useState([]);
  const { msg, show } = useFormMessage();

  const carregar = useCallback(async () => {
    setInstrutores(await api('/instrutores'));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleSubmit(ev) {
    ev.preventDefault();
    const form = ev.target;
    try {
      const dados = formToObject(form);
      await api('/instrutores', { method: 'POST', body: JSON.stringify(dados) });
      show('Instrutor cadastrado com sucesso!', 'sucesso');
      form.reset();
      carregar();
    } catch (e) {
      show(e.message, 'erro');
    }
  }

  async function handleToggle(id, ativo) {
    try {
      await api(`/instrutores/${id}`, { method: 'PUT', body: JSON.stringify({ ativo: !ativo }) });
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleExcluir(id) {
    if (!confirm('Excluir este instrutor?')) return;
    try {
      await api(`/instrutores/${id}`, { method: 'DELETE' });
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <section className="view">
      <header className="view-header">
        <h1>Instrutores</h1>
        <p>Cadastro e consulta dos instrutores da academia.</p>
      </header>

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label>Nome *</label>
          <input type="text" name="nome" required />
        </div>
        <div className="field">
          <label>CPF *</label>
          <input type="text" name="cpf" required />
        </div>
        <div className="field">
          <label>E-mail *</label>
          <input type="email" name="email" required />
        </div>
        <div className="field">
          <label>Telefone</label>
          <input type="text" name="telefone" />
        </div>
        <div className="field">
          <label>CREF</label>
          <input type="text" name="cref" placeholder="123456-G/MG" />
        </div>
        <div className="field">
          <label>Especialidades</label>
          <input type="text" name="especialidades" placeholder="Musculação, Pilates" />
        </div>
        <div className="field actions span-2">
          <button type="submit" className="btn-primary">
            Cadastrar instrutor
          </button>
          <FormMessage msg={msg} />
        </div>
      </form>

      <div className="panel">
        <div className="panel-toolbar">
          <h2>Instrutores cadastrados</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>E-mail</th>
                <th>Especialidades</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {instrutores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="vazio">
                    Nenhum instrutor cadastrado ainda.
                  </td>
                </tr>
              ) : (
                instrutores.map((i) => (
                  <tr key={i._id}>
                    <td>{i.nome}</td>
                    <td>{i.cpf}</td>
                    <td>{i.email}</td>
                    <td>{(i.especialidades || []).join(', ') || '—'}</td>
                    <td>
                      <BadgeAtivo ativo={i.ativo} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => handleToggle(i._id, i.ativo)}
                      >
                        {i.ativo ? 'Desativar' : 'Ativar'}
                      </button>{' '}
                      <button
                        type="button"
                        className="btn-danger btn-icon-only"
                        aria-label="Excluir instrutor"
                        title="Excluir instrutor"
                        onClick={() => handleExcluir(i._id)}
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
