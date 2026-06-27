import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { formToObject } from '../utils/format';
import { useFormMessage, useSelectData, planoOptions } from '../hooks/useSelectData';
import { BadgeAtivo, FormMessage, SelectField, TrashIcon } from '../components/ui';

export default function Alunos() {
  const { planos, refresh } = useSelectData();
  const [alunos, setAlunos] = useState([]);
  const [soAtivos, setSoAtivos] = useState(false);
  const { msg, show } = useFormMessage();

  const carregar = useCallback(async () => {
    await refresh();
    const lista = await api(`/alunos${soAtivos ? '?ativo=true' : ''}`);
    setAlunos(lista);
  }, [soAtivos, refresh]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleSubmit(ev) {
    ev.preventDefault();
    const form = ev.target;
    try {
      const dados = formToObject(form);
      await api('/alunos', { method: 'POST', body: JSON.stringify(dados) });
      show('Aluno cadastrado com sucesso!', 'sucesso');
      form.reset();
      carregar();
    } catch (e) {
      show(e.message, 'erro');
    }
  }

  async function handleToggle(id, ativo) {
    try {
      await api(`/alunos/${id}`, { method: 'PUT', body: JSON.stringify({ ativo: !ativo }) });
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleExcluir(id) {
    if (!confirm('Excluir este aluno?')) return;
    try {
      await api(`/alunos/${id}`, { method: 'DELETE' });
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <section className="view">
      <header className="view-header">
        <h1>Alunos</h1>
        <p>Cadastro e consulta dos alunos matriculados.</p>
      </header>

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label>Nome *</label>
          <input type="text" name="nome" required />
        </div>
        <div className="field">
          <label>CPF *</label>
          <input type="text" name="cpf" required placeholder="000.000.000-00" />
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
          <label>Data de nascimento</label>
          <input type="date" name="dataNascimento" />
        </div>
        <SelectField
          name="planoAtual"
          label="Plano atual"
          placeholder="Sem plano"
          options={planoOptions(planos)}
        />
        <div className="field span-2">
          <label>Endereço (opcional)</label>
          <div className="subfields">
            <input type="text" name="endereco.rua" placeholder="Rua" />
            <input type="text" name="endereco.numero" placeholder="Número" />
            <input type="text" name="endereco.bairro" placeholder="Bairro" />
            <input type="text" name="endereco.cidade" placeholder="Cidade" />
            <input type="text" name="endereco.estado" placeholder="UF" maxLength={2} />
            <input type="text" name="endereco.cep" placeholder="CEP" />
          </div>
        </div>
        <div className="field span-2">
          <label>Observações médicas</label>
          <input type="text" name="observacoesMedicas" placeholder="Restrições, lesões, etc." />
        </div>
        <div className="field actions span-2">
          <button type="submit" className="btn-primary">
            Cadastrar aluno
          </button>
          <FormMessage msg={msg} />
        </div>
      </form>

      <div className="panel">
        <div className="panel-toolbar">
          <h2>Alunos cadastrados</h2>
          <label className="filter-check">
            <input
              type="checkbox"
              checked={soAtivos}
              onChange={(e) => setSoAtivos(e.target.checked)}
            />{' '}
            mostrar só ativos
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>E-mail</th>
                <th>Plano atual</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {alunos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="vazio">
                    Nenhum aluno cadastrado ainda.
                  </td>
                </tr>
              ) : (
                alunos.map((a) => (
                  <tr key={a._id}>
                    <td>{a.nome}</td>
                    <td>{a.cpf}</td>
                    <td>{a.email}</td>
                    <td>{a.planoAtual?.nome || '—'}</td>
                    <td>
                      <BadgeAtivo ativo={a.ativo} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => handleToggle(a._id, a.ativo)}
                      >
                        {a.ativo ? 'Desativar' : 'Ativar'}
                      </button>{' '}
                      <button
                        type="button"
                        className="btn-danger btn-icon-only"
                        aria-label="Excluir aluno"
                        title="Excluir aluno"
                        onClick={() => handleExcluir(a._id)}
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
