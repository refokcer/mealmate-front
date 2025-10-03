import './Alert.css';

export const Alert = ({ tone = 'info', title, children, onClose }) => (
  <div className={`alert alert--${tone}`} role="alert">
    <div className="alert__content">
      {title && <strong className="alert__title">{title}</strong>}
      {children && <p className="alert__message">{children}</p>}
    </div>
    {onClose && (
      <button type="button" className="alert__close" onClick={onClose} aria-label="Закрыть оповещение">
        ×
      </button>
    )}
  </div>
);

