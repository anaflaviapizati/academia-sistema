import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { formToObject, formatDate } from '../utils/format';
import { useFormMessage, useSelectData, alunoOptions } from '../hooks/useSelectData';
import { FormMessage, SelectField } from '../components/ui';

export default function Checkins() {
  const { alunos, refresh } = useSelectData();
  const [checkins, setCheckins] = useState([]);
  const { msg, show } = useFormMessage();

  const carregar = useCallback(async () => {
    await refresh();
    setCheckins(await api('/checkins'));
  }, [refresh]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleSubmit(ev) {
    ev.preventDefault();
    const form = ev.target;
    try {
      const dados = formToObject(form);
      await api('/checkins/entrada', { method: 'POST', body: JSON.stringify(dados) });
      show('Entrada registrada com sucesso!', 'sucesso');
      form.reset();
      carregar();
    } catch (e) {
      show(e.message, 'erro');
    }
  }

  async function handleSaida(id) {
    try {
      await api(`/checkins/${id}/saida`, { method: 'PUT' });
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <section className="view">
      <header className="view-header">
        <h1>Check-ins</h1>
        <p>Registro de frequência (entrada/saída) na academia.</p>
      </header>

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <SelectField
          name="aluno"
          label="Aluno *"
          required
          placeholder="Selecione…"
          options={alunoOptions(alunos)}
          className="span-2"
        />
        <div className="field actions span-2">
          <button type="submit" className="btn-primary">
            Registrar entrada
          </button>
          <FormMessage msg={msg} />
        </div>
      </form>

      <div className="panel">
        <div className="panel-toolbar">
          <h2>Check-ins recentes</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {checkins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="vazio">
                    Nenhum check-in registrado ainda.
                  </td>
                </tr>
              ) : (
                checkins.map((c) => (
                  <tr key={c._id}>
                    <td>{c.aluno?.nome || '—'}</td>
                    <td>{formatDate(c.dataHoraEntrada, true)}</td>
                    <td>{c.dataHoraSaida ? formatDate(c.dataHoraSaida, true) : '—'}</td>
                    <td>
                      {!c.dataHoraSaida && (
                        <button type="button" className="btn-ghost" onClick={() => handleSaida(c._id)}>
                          Registrar saída
                        </button>
                      )}
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
