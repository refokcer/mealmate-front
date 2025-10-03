import './Card.css';

export const Card = ({ tone = 'default', children, className = '', ...props }) => (
  <section className={`card card--${tone} ${className}`.trim()} {...props}>
    {children}
  </section>
);

export const CardHeader = ({ title, subtitle, endSlot }) => (
  <header className="card__header">
    <div>
      <h2 className="card__title">{title}</h2>
      {subtitle && <p className="card__subtitle">{subtitle}</p>}
    </div>
    {endSlot && <div className="card__header-actions">{endSlot}</div>}
  </header>
);

export const CardContent = ({ children }) => <div className="card__content">{children}</div>;

export const CardFooter = ({ children }) => (
  <footer className="card__footer">{children}</footer>
);

