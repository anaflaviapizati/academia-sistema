import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { formToObject, formatMoney } from '../utils/format';
import {
  useFormMessage,
  useSelectData,
  alunoOptions,
  matriculaOptions,
} from '../hooks/useSelectData';
import { FormMessage, SelectField, TrashIcon } from '../components/ui';

export default function Pagamentos() {
  const { alunos, matriculas, refresh } = useSelectData();
  const [pagamentos, setPagamentos] = useState([]);
  const { msg, show } = useFormMessage();

  const carregar = useCallback(async () => {
    await refresh();
    setPagamentos(await api('/pagamentos'));
  }, [refresh]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleSubmit(ev) {
    ev.preventDefault();
    const form = ev.target;
    try {
      const dados = formToObject(form);
      await api('/pagamentos', { method: 'POST', body: JSON.stringify(dados) });
      show('Pagamento registrado com sucesso!', 'sucesso');
      form.reset();
      carregar();
    } catch (e) {
      show(e.message, 'erro');
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await api(`/pagamentos/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleExcluir(id) {
    if (!confirm('Excluir este pagamento?')) return;
    try {
      await api(`/pagamentos/${id}`, { method: 'DELETE' });
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <section className="view">
      <header className="view-header">
        <h1>Pagamentos</h1>
        <p>Histórico financeiro vinculado a uma matrícula.</p>
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
          name="matricula"
          label="Matrícula *"
          required
          placeholder="Selecione…"
          options={matriculaOptions(matriculas)}
        />
        <div className="field">
          <label>Valor (R$) *</label>
          <input type="number" name="valor" required min="0" step="0.01" />
        </div>
        <div className="field">
          <label>Mês de referência *</label>
          <input type="month" name="mesReferencia" required />
        </div>
        <div className="field">
          <label>Forma de pagamento *</label>
          <select name="formaPagamento" required defaultValue="">
            <option value="">Selecione…</option>
            <option value="pix">Pix</option>
            <option value="cartao_credito">Cartão de crédito</option>
            <option value="cartao_debito">Cartão de débito</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="boleto">Boleto</option>
          </select>
        </div>
        <div className="field">
          <label>Status</label>
          <select name="status" defaultValue="pago">
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </div>
        <div className="field actions span-2">
          <button type="submit" className="btn-primary">
            Registrar pagamento
          </button>
          <FormMessage msg={msg} />
        </div>
      </form>

      <div className="panel">
        <div className="panel-toolbar">
          <h2>Pagamentos</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Mês ref.</th>
                <th>Valor</th>
                <th>Forma</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pagamentos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="vazio">
                    Nenhum pagamento registrado ainda.
                  </td>
                </tr>
              ) : (
                pagamentos.map((p) => (
                  <tr key={p._id}>
                    <td>{p.aluno?.nome || '—'}</td>
                    <td>{p.mesReferencia}</td>
                    <td>{formatMoney(p.valor)}</td>
                    <td>{(p.formaPagamento || '').replace('_', ' ')}</td>
                    <td>
                      <select
                        className="status-inline"
                        value={p.status}
                        onChange={(e) => handleStatusChange(p._id, e.target.value)}
                      >
                        <option value="pago">pago</option>
                        <option value="pendente">pendente</option>
                        <option value="atrasado">atrasado</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-danger btn-icon-only"
                        aria-label="Excluir pagamento"
                        title="Excluir pagamento"
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
