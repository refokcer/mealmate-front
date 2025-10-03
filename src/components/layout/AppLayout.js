import './AppLayout.css';

const defaultNavItems = [
  { id: 'planner', label: 'План', icon: '🗓️' },
  { id: 'dishes', label: 'Блюда', icon: '🍽️' },
  { id: 'products', label: 'Продукты', icon: '🧺' },
];

export const AppLayout = ({
  activeView,
  onChangeView,
  title,
  subtitle,
  actions,
  navigationItems = defaultNavItems,
  children,
  footer,
}) => (
  <div className="app-shell">
    <header className="app-shell__header">
      <div className="app-shell__header-content">
        <div>
          <p className="app-shell__subtitle">{subtitle}</p>
          <h1 className="app-shell__title">{title}</h1>
        </div>
        {actions && <div className="app-shell__actions">{actions}</div>}
      </div>
    </header>

    <div className="app-shell__body">
      <aside className="app-shell__sidebar" aria-label="Навигация по разделам">
        <nav className="app-shell__nav">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === activeView ? 'nav-btn nav-btn--active' : 'nav-btn'}
              onClick={() => onChangeView(item.id)}
            >
              <span className="nav-btn__icon" aria-hidden>
                {item.icon}
              </span>
              <span className="nav-btn__label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="app-shell__content">{children}</main>
    </div>

    <footer className="app-shell__footer">
      <nav className="bottom-nav" aria-label="Навигация по разделам (мобильная)">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === activeView ? 'bottom-nav__item bottom-nav__item--active' : 'bottom-nav__item'}
            onClick={() => onChangeView(item.id)}
          >
            <span className="bottom-nav__icon" aria-hidden>
              {item.icon}
            </span>
            <span className="bottom-nav__label">{item.label}</span>
          </button>
        ))}
      </nav>
      {footer}
    </footer>
  </div>
);

