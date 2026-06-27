import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { BrandIcon } from './ui';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Painel' },
  { id: 'alunos', label: 'Alunos' },
  { id: 'instrutores', label: 'Instrutores' },
  { id: 'planos', label: 'Planos' },
  { id: 'matriculas', label: 'Matrículas' },
  { id: 'pagamentos', label: 'Pagamentos' },
  { id: 'treinos', label: 'Treinos' },
  { id: 'checkins', label: 'Check-ins' },
];

export default function Sidebar({ viewAtiva, onNavigate }) {
  const [status, setStatus] = useState({ text: 'verificando…', className: 'status-pill' });

  useEffect(() => {
    api('')
      .then(() => setStatus({ text: 'API conectada', className: 'status-pill ok' }))
      .catch(() => setStatus({ text: 'sem conexão com a API', className: 'status-pill erro' }));
  }, []);

  return (
    <aside className="sidebar">
      <div className="brand">
        <BrandIcon />
        <div>
          <p className="brand-name">Academia</p>
          <p className="brand-sub">Sistema gerencial</p>
        </div>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item${viewAtiva === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className={status.className}>{status.text}</span>
      </div>
    </aside>
  );
}

export { NAV_ITEMS };
