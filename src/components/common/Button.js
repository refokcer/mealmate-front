import './Button.css';

export const Button = ({ variant = 'primary', children, className = '', ...props }) => (
  <button type="button" className={`btn btn--${variant} ${className}`.trim()} {...props}>
    {children}
  </button>
);

