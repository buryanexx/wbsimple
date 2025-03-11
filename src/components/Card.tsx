import React, { ReactNode } from 'react';

type CardVariant = 'default' | 'primary' | 'accent' | 'outline';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default', 
  className = '',
  onClick
}) => {
  const baseClasses = 'rounded-lg p-4 transition-all duration-200 shadow-sm';
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    primary: 'bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30',
    accent: 'bg-accent/10 dark:bg-accent/20 border border-accent/20 dark:border-accent/30',
    outline: 'bg-transparent border border-gray-200 dark:border-gray-700'
  };
  
  const hoverClasses = onClick ? 'hover:shadow-md cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card; 