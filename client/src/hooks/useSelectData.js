import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { formatMoney } from '../utils/format';

export function useSelectData(enabled = true) {
  const [alunos, setAlunos] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [instrutores, setInstrutores] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) return { alunos: [], planos: [], instrutores: [], matriculas: [] };
    setLoading(true);
    try {
      const [a, p, i, m] = await Promise.all([
        api('/alunos').catch(() => []),
        api('/planos').catch(() => []),
        api('/instrutores').catch(() => []),
        api('/matriculas').catch(() => []),
      ]);
      setAlunos(a);
      setPlanos(p);
      setInstrutores(i);
      setMatriculas(m);
      return { alunos: a, planos: p, instrutores: i, matriculas: m };
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { alunos, planos, instrutores, matriculas, loading, refresh };
}

export function alunoOptions(alunos) {
  return alunos.map((a) => ({ value: a._id, label: `${a.nome} (${a.cpf})` }));
}

export function planoOptions(planos) {
  return planos.map((p) => ({ value: p._id, label: `${p.nome} — ${formatMoney(p.valor)}` }));
}

export function instrutorOptions(instrutores) {
  return instrutores.map((i) => ({ value: i._id, label: i.nome }));
}

export function matriculaOptions(matriculas) {
  return matriculas.map((m) => ({
    value: m._id,
    label: `${m.aluno?.nome || '—'} · ${m.plano?.nome || '—'} (${m.status})`,
  }));
}

export function useFormMessage() {
  const [msg, setMsg] = useState({ text: '', type: '' });

  const show = useCallback((text, type) => {
    setMsg({ text, type });
    if (type === 'sucesso') {
      setTimeout(() => setMsg({ text: '', type: '' }), 3500);
    }
  }, []);

  return { msg, show };
}
