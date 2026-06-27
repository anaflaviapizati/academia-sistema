import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Alunos from './views/Alunos';
import Instrutores from './views/Instrutores';
import Planos from './views/Planos';
import Matriculas from './views/Matriculas';
import Pagamentos from './views/Pagamentos';
import Treinos from './views/Treinos';
import Checkins from './views/Checkins';

const VIEWS = {
  dashboard: Dashboard,
  alunos: Alunos,
  instrutores: Instrutores,
  planos: Planos,
  matriculas: Matriculas,
  pagamentos: Pagamentos,
  treinos: Treinos,
  checkins: Checkins,
};

export default function App() {
  const [viewAtiva, setViewAtiva] = useState('dashboard');
  const ViewComponent = VIEWS[viewAtiva];

  return (
    <div className="app">
      <Sidebar viewAtiva={viewAtiva} onNavigate={setViewAtiva} />
      <main className="content">
        <ViewComponent key={viewAtiva} />
      </main>
    </div>
  );
}
