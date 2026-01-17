import React, { type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    ...props
}) => {
    const classes = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="btn-loader" />}
            {!isLoading && leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
        </button>
    );
};
