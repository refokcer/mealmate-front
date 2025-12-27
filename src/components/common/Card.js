import './Card.css';

export const Card = ({ tone = 'default', children, className = '', accentColor, ...props }) => (
  <section
    className={`card card--${tone} ${accentColor ? 'card--accented' : ''} ${className}`.trim()}
    style={accentColor ? { '--card-accent-color': accentColor } : undefined}
    {...props}
  >
    {children}
  </section>
);

export const CardHeader = ({ title, subtitle, endSlot, accentColor }) => (
  <header className="card__header">
    <div className="card__title-group">
      {accentColor && <span className="card__accent" aria-hidden style={{ backgroundColor: accentColor }} />}
      <div>
        <h2 className="card__title">{title}</h2>
        {subtitle && <p className="card__subtitle">{subtitle}</p>}
      </div>
    </div>
    {endSlot && <div className="card__header-actions">{endSlot}</div>}
  </header>
);

export const CardContent = ({ children }) => <div className="card__content">{children}</div>;

export const CardFooter = ({ children }) => (
  <footer className="card__footer">{children}</footer>
);

