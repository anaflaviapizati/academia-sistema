import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { GraficoCheckins, GraficoMatriculas, GraficoPagamentos } from '../components/DashboardCharts';

export default function Dashboard() {
  const [cards, setCards] = useState(null);
  const [graficos, setGraficos] = useState(null);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCards(null);
    setGraficos(null);
    setErro('');
    try {
      const [alunos, instrutores, planos, matriculas, pagamentos, checkins] = await Promise.all([
        api('/alunos'),
        api('/instrutores'),
        api('/planos'),
        api('/matriculas'),
        api('/pagamentos'),
        api('/checkins'),
      ]);

      const hoje = new Date().toDateString();
      const matriculasAtivas = matriculas.filter((m) => m.status === 'ativa').length;
      const pagamentosPendentes = pagamentos.filter((p) => p.status !== 'pago').length;
      const checkinsHoje = checkins.filter(
        (c) => new Date(c.dataHoraEntrada).toDateString() === hoje
      ).length;

      setCards([
        ['Alunos cadastrados', alunos.length],
        ['Instrutores', instrutores.length],
        ['Planos', planos.length],
        ['Matrículas ativas', matriculasAtivas],
        ['Pagamentos pendentes/atrasados', pagamentosPendentes],
        ['Check-ins hoje', checkinsHoje],
      ]);

      setGraficos({ matriculas, pagamentos, checkins });
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <section className="view">
      <header className="view-header">
        <h1>Painel geral</h1>
        <p>Visão resumida da academia em tempo real.</p>
      </header>

      {erro && <p className="form-msg erro view-feedback">Erro ao carregar painel: {erro}</p>}
      {!cards && !erro && <p className="view-feedback">Carregando…</p>}

      {cards && (
        <>
          <div className="cards">
            {cards.map(([label, num]) => (
              <div key={label} className="card">
                <div className="card-num">{num}</div>
                <div className="card-label">{label}</div>
              </div>
            ))}
          </div>

          {graficos && (
            <div className="dashboard-charts">
              <GraficoMatriculas matriculas={graficos.matriculas} />
              <GraficoPagamentos pagamentos={graficos.pagamentos} />
              <GraficoCheckins checkins={graficos.checkins} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
