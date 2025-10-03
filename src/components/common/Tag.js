import './Tag.css';

export const Tag = ({ tone = 'neutral', children }) => (
  <span className={`tag tag--${tone}`}>{children}</span>
);
