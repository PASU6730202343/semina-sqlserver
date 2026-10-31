import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-agri-green text-white hover:bg-agri-green-dark',
    secondary: 'border-2 border-agri-green bg-transparent text-agri-green hover:bg-agri-surface',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
