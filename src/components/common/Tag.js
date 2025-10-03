import './Tag.css';

export const Tag = ({ tone = 'neutral', className = '', children, onClick, ...props }) => {
  const Component = onClick ? 'button' : 'span';
  const componentProps = onClick
    ? { type: 'button', onClick, ...props }
    : props;

  const classes = ['tag', `tag--${tone}`];

  if (onClick) {
    classes.push('tag--clickable');
  }

  if (className) {
    classes.push(className);
  }

  return (
    <Component className={classes.join(' ')} {...componentProps}>
      {children}
    </Component>
  );
};

