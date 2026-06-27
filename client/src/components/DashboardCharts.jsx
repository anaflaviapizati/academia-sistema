import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CORES = {
  accent: '#ff5a36',
  good: '#2c9a6b',
  amber: '#e8a93b',
  bad: '#d6455a',
  ink: '#1d3338',
  soft: '#9fb2af',
};

const STATUS_MATRICULA = {
  ativa: { label: 'Ativa', cor: CORES.good },
  vencida: { label: 'Vencida', cor: CORES.amber },
  cancelada: { label: 'Cancelada', cor: CORES.bad },
};

const STATUS_PAGAMENTO = {
  pago: { label: 'Pago', cor: CORES.good },
  pendente: { label: 'Pendente', cor: CORES.amber },
  atrasado: { label: 'Atrasado', cor: CORES.bad },
};

function agruparPorStatus(itens, mapa) {
  const contagem = {};
  Object.keys(mapa).forEach((k) => {
    contagem[k] = 0;
  });
  itens.forEach((item) => {
    if (contagem[item.status] !== undefined) contagem[item.status] += 1;
  });
  return Object.entries(contagem).map(([status, valor]) => ({
    status,
    nome: mapa[status].label,
    valor,
    cor: mapa[status].cor,
  }));
}

function checkinsPorDia(checkins, dias = 7) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const resultado = [];
  for (let i = dias - 1; i >= 0; i -= 1) {
    const dia = new Date(hoje);
    dia.setDate(dia.getDate() - i);
    const rotulo = dia.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
    const chave = dia.toDateString();
    const total = checkins.filter(
      (c) => new Date(c.dataHoraEntrada).toDateString() === chave
    ).length;
    resultado.push({ dia: rotulo, total });
  }
  return resultado;
}

function TooltipCustom({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label ?? payload[0].name}</strong>
      <span>{payload[0].value}</span>
    </div>
  );
}

export function GraficoMatriculas({ matriculas }) {
  const dados = agruparPorStatus(matriculas, STATUS_MATRICULA);

  return (
    <div className="panel chart-panel">
      <h2>Matrículas por status</h2>
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8eeeb" vertical={false} />
            <XAxis dataKey="nome" tick={{ fontSize: 12, fill: '#5d6d6a' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#5d6d6a' }} axisLine={false} tickLine={false} />
            <Tooltip content={<TooltipCustom />} />
            <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {dados.map((item) => (
                <Cell key={item.status} fill={item.cor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function GraficoPagamentos({ pagamentos }) {
  const dados = agruparPorStatus(pagamentos, STATUS_PAGAMENTO).filter((d) => d.valor > 0);
  const vazio = dados.length === 0;

  return (
    <div className="panel chart-panel">
      <h2>Pagamentos por status</h2>
      <div className="chart-area chart-area--pie">
        {vazio ? (
          <p className="chart-empty">Sem pagamentos registrados.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dados}
                dataKey="valor"
                nameKey="nome"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
              >
                {dados.map((item) => (
                  <Cell key={item.status} fill={item.cor} />
                ))}
              </Pie>
              <Tooltip content={<TooltipCustom />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value) => <span className="chart-legend">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function GraficoCheckins({ checkins }) {
  const dados = checkinsPorDia(checkins);

  return (
    <div className="panel chart-panel chart-panel--wide">
      <h2>Check-ins — últimos 7 dias</h2>
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8eeeb" vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#5d6d6a' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#5d6d6a' }} axisLine={false} tickLine={false} />
            <Tooltip content={<TooltipCustom />} />
            <Bar dataKey="total" fill={CORES.accent} radius={[6, 6, 0, 0]} maxBarSize={40} name="Check-ins" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export { agruparPorStatus, checkinsPorDia };
