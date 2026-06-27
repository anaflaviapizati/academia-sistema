export function Badge({ children, tipo = 'good' }) {
  return <span className={`badge badge-${tipo}`}>{children}</span>;
}

export function BadgeAtivo({ ativo }) {
  return <Badge tipo={ativo ? 'good' : 'bad'}>{ativo ? 'Ativo' : 'Inativo'}</Badge>;
}

export function BadgeStatusMatricula({ status }) {
  const tipo = status === 'ativa' ? 'good' : status === 'vencida' ? 'amber' : 'bad';
  return <Badge tipo={tipo}>{status}</Badge>;
}

export function BadgeStatusPagamento({ status }) {
  const tipo = status === 'pago' ? 'good' : status === 'pendente' ? 'amber' : 'bad';
  return <Badge tipo={tipo}>{status}</Badge>;
}

export function FormMessage({ msg }) {
  if (!msg.text) return null;
  return <span className={`form-msg ${msg.type}`}>{msg.text}</span>;
}

export function BrandIcon() {
  return (
    <svg className="brand-icon" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="6" width="6" height="12" rx="1.5" fill="currentColor" />
      <rect x="8" y="2" width="4" height="20" rx="1.5" fill="currentColor" />
      <rect x="14" y="10" width="20" height="4" rx="1" fill="currentColor" />
      <rect x="36" y="2" width="4" height="20" rx="1.5" fill="currentColor" />
      <rect x="42" y="6" width="6" height="12" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M10 3h4m-8 4 .8 11.2A2 2 0 0 0 8.8 22h6.4a2 2 0 0 0 2-1.8L18 7M9 11v6m6-6v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SelectField({ name, label, required, options, placeholder, defaultValue = '', className = '' }) {
  return (
    <div className={`field${className ? ` ${className}` : ''}`}>
      <label>{label}</label>
      <select name={name} required={required} defaultValue={defaultValue}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
    </div>
  );
}
