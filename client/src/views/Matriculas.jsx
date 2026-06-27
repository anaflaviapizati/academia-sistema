import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { formToObject, formatDate, formatMoney } from '../utils/format';
import {
  useFormMessage,
  useSelectData,
  alunoOptions,
  planoOptions,
} from '../hooks/useSelectData';
import { FormMessage, SelectField, TrashIcon } from '../components/ui';

export default function Matriculas() {
  const { alunos, planos, refresh } = useSelectData();
  const [matriculas, setMatriculas] = useState([]);
  const { msg, show } = useFormMessage();

  const carregar = useCallback(async () => {
    await refresh();
    setMatriculas(await api('/matriculas'));
  }, [refresh]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleSubmit(ev) {
    ev.preventDefault();
    const form = ev.target;
    try {
      const dados = formToObject(form);
      await api('/matriculas', { method: 'POST', body: JSON.stringify(dados) });
      show('Matrícula criada com sucesso!', 'sucesso');
      form.reset();
      carregar();
    } catch (e) {
      show(e.message, 'erro');
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await api(`/matriculas/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleExcluir(id) {
    if (!confirm('Excluir esta matrícula?')) return;
    try {
      await api(`/matriculas/${id}`, { method: 'DELETE' });
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <section className="view">
      <header className="view-header">
        <h1>Matrículas</h1>
        <p>Vincula um aluno a um plano por um período. Atualiza automaticamente o plano atual do aluno.</p>
      </header>

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <SelectField
          name="aluno"
          label="Aluno *"
          required
          placeholder="Selecione…"
          options={alunoOptions(alunos)}
        />
        <SelectField
          name="plano"
          label="Plano *"
          required
          placeholder="Selecione…"
          options={planoOptions(planos)}
        />
        <div className="field">
          <label>Data de início</label>
          <input type="date" name="dataInicio" />
        </div>
        <div className="field">
          <label>Valor contratado (R$)</label>
          <input
            type="number"
            name="valorContratado"
            min="0"
            step="0.01"
            placeholder="usa o valor do plano"
          />
        </div>
        <div className="field actions span-2">
          <button type="submit" className="btn-primary">
            Criar matrícula
          </button>
          <FormMessage msg={msg} />
        </div>
      </form>

      <div className="panel">
        <div className="panel-toolbar">
          <h2>Matrículas</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Plano</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Valor</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {matriculas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="vazio">
                    Nenhuma matrícula cadastrada ainda.
                  </td>
                </tr>
              ) : (
                matriculas.map((m) => (
                  <tr key={m._id}>
                    <td>{m.aluno?.nome || '—'}</td>
                    <td>{m.plano?.nome || '—'}</td>
                    <td>{formatDate(m.dataInicio)}</td>
                    <td>{formatDate(m.dataFim)}</td>
                    <td>{formatMoney(m.valorContratado)}</td>
                    <td>
                      <select
                        className="status-inline"
                        value={m.status}
                        onChange={(e) => handleStatusChange(m._id, e.target.value)}
                      >
                        <option value="ativa">ativa</option>
                        <option value="vencida">vencida</option>
                        <option value="cancelada">cancelada</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-danger btn-icon-only"
                        aria-label="Excluir matrícula"
                        title="Excluir matrícula"
                        onClick={() => handleExcluir(m._id)}
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
