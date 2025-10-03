import './FormField.css';

export const FormField = ({ label, hint, error, children }) => (
  <label className={`form-field ${error ? 'form-field--error' : ''}`}>
    <span className="form-field__label">{label}</span>
    {children}
    {hint && !error && <span className="form-field__hint">{hint}</span>}
    {error && <span className="form-field__error">{error}</span>}
  </label>
);

export const TextInput = ({ multiline, rows = 3, ...props }) => {
  if (multiline) {
    return <textarea rows={rows} className="form-field__input form-field__input--textarea" {...props} />;
  }

  return <input className="form-field__input" {...props} />;
};

export const SelectInput = ({ options = [], placeholder = 'Выберите', ...props }) => (
  <select className="form-field__input" {...props}>
    <option value="" disabled>
      {placeholder}
    </option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

