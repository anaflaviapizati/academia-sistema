import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { formToObject } from '../utils/format';
import {
  useFormMessage,
  useSelectData,
  alunoOptions,
  instrutorOptions,
} from '../hooks/useSelectData';
import { FormMessage, SelectField, TrashIcon } from '../components/ui';

const EXERCICIO_VAZIO = {
  nome: '',
  series: '',
  repeticoes: '',
  cargaKg: '',
  observacao: '',
};

function IconOlho() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export default function Treinos() {
  const { alunos, instrutores, refresh } = useSelectData();
  const [treinos, setTreinos] = useState([]);
  const [exercicios, setExercicios] = useState([{ ...EXERCICIO_VAZIO }]);
  const { msg, show } = useFormMessage();

  const carregar = useCallback(async () => {
    await refresh();
    setTreinos(await api('/treinos'));
  }, [refresh]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function atualizarExercicio(index, campo, valor) {
    setExercicios((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [campo]: valor } : ex))
    );
  }

  function adicionarExercicio() {
    setExercicios((prev) => [...prev, { ...EXERCICIO_VAZIO }]);
  }

  function removerExercicio(index) {
    setExercicios((prev) => prev.filter((_, i) => i !== index));
  }

  function coletarExercicios() {
    return exercicios
      .map((ex) => ({
        nome: ex.nome.trim(),
        series: ex.series,
        repeticoes: ex.repeticoes.trim(),
        cargaKg: ex.cargaKg,
        observacao: ex.observacao.trim(),
      }))
      .filter((ex) => ex.nome && ex.series && ex.repeticoes);
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const form = ev.target;
    try {
      const dados = formToObject(form);
      dados.exercicios = coletarExercicios();
      if (!dados.exercicios.length) {
        throw new Error('Adicione pelo menos um exercício válido.');
      }

      await api('/treinos', { method: 'POST', body: JSON.stringify(dados) });
      show('Treino cadastrado com sucesso!', 'sucesso');
      form.reset();
      setExercicios([{ ...EXERCICIO_VAZIO }]);
      carregar();
    } catch (e) {
      show(e.message, 'erro');
    }
  }

  async function handleExcluir(id) {
    if (!confirm('Excluir este treino?')) return;
    try {
      await api(`/treinos/${id}`, { method: 'DELETE' });
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <section className="view">
      <header className="view-header">
        <h1>Treinos</h1>
        <p>Ficha de treino montada por um instrutor para um aluno.</p>
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
          name="instrutor"
          label="Instrutor *"
          required
          placeholder="Selecione…"
          options={instrutorOptions(instrutores)}
        />
        <div className="field">
          <label>Nome do treino *</label>
          <input type="text" name="nome" required placeholder="Treino A - Peito/Tríceps" />
        </div>
        <div className="field">
          <label>Objetivo</label>
          <select name="objetivo" defaultValue="saude_geral">
            <option value="saude_geral">Saúde geral</option>
            <option value="hipertrofia">Hipertrofia</option>
            <option value="emagrecimento">Emagrecimento</option>
            <option value="condicionamento">Condicionamento</option>
            <option value="forca">Força</option>
          </select>
        </div>

        <div className="field span-2">
          <label>Exercícios *</label>
          <div className="exercicios-lista">
            {exercicios.map((ex, index) => (
              <div key={index} className="exercicio-row">
                <input
                  type="text"
                  className="ex-nome"
                  placeholder="Exercício (ex: Supino reto)"
                  value={ex.nome}
                  onChange={(e) => atualizarExercicio(index, 'nome', e.target.value)}
                />
                <input
                  type="number"
                  className="ex-series"
                  placeholder="Séries"
                  min="1"
                  value={ex.series}
                  onChange={(e) => atualizarExercicio(index, 'series', e.target.value)}
                />
                <input
                  type="text"
                  className="ex-reps"
                  placeholder="Repetições (ex: 10-12)"
                  value={ex.repeticoes}
                  onChange={(e) => atualizarExercicio(index, 'repeticoes', e.target.value)}
                />
                <input
                  type="number"
                  className="ex-carga"
                  placeholder="Carga (kg)"
                  min="0"
                  value={ex.cargaKg}
                  onChange={(e) => atualizarExercicio(index, 'cargaKg', e.target.value)}
                />
                <input
                  type="text"
                  className="ex-obs"
                  placeholder="Observação"
                  value={ex.observacao}
                  onChange={(e) => atualizarExercicio(index, 'observacao', e.target.value)}
                />
                <button type="button" className="btn-ghost" onClick={() => removerExercicio(index)}>
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary" onClick={adicionarExercicio}>
            + adicionar exercício
          </button>
        </div>

        <div className="field actions span-2">
          <button type="submit" className="btn-primary">
            Cadastrar treino
          </button>
          <FormMessage msg={msg} />
        </div>
      </form>

      <div className="panel">
        <div className="panel-toolbar">
          <h2>Treinos cadastrados</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Instrutor</th>
                <th>Treino</th>
                <th>Objetivo</th>
                <th>Exercícios</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {treinos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="vazio">
                    Nenhum treino cadastrado ainda.
                  </td>
                </tr>
              ) : (
                treinos.map((t) => (
                  <tr key={t._id}>
                    <td>{t.aluno?.nome || '—'}</td>
                    <td>{t.instrutor?.nome || '—'}</td>
                    <td>{t.nome}</td>
                    <td>{(t.objetivo || '').replace('_', ' ')}</td>
                    <td>
                      <div className="exercicios-resumo">
                        <span className="exercicios-contagem">
                          {(t.exercicios || []).length}{' '}
                          {(t.exercicios || []).length === 1 ? 'exercício' : 'exercícios'}
                        </span>
                        {(t.exercicios || []).length > 0 && (
                          <details className="exercicios-detalhes">
                            <summary className="btn-icon" title="Ver exercícios" aria-label="Ver exercícios">
                              <IconOlho />
                            </summary>
                            <ul className="exercicios-lista-resumo">
                              {(t.exercicios || []).map((ex, i) => (
                                <li key={i}>
                                  {ex.nome} — {ex.series}x {ex.repeticoes}
                                  {ex.cargaKg ? ` (${ex.cargaKg}kg)` : ''}
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    </td>
                    <td>
                      <button type="button" className="btn-danger" onClick={() => handleExcluir(t._id)}>
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
