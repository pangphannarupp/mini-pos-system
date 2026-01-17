import React, { type InputHTMLAttributes, forwardRef } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    className = '',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    disabled,
    ...props
}, ref) => {
    const inputClasses = [
        'input-field',
        error && 'input-field-error',
        leftIcon && 'input-has-left-icon',
        rightIcon && 'input-has-right-icon',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}

            <div className="input-wrapper">
                {leftIcon && (
                    <div className="input-icon input-icon-left">
                        {leftIcon}
                    </div>
                )}

                <input
                    ref={ref}
                    className={inputClasses}
                    disabled={disabled}
                    {...props}
                />

                {rightIcon && (
                    <div className="input-icon input-icon-right">
                        {rightIcon}
                    </div>
                )}
            </div>

            {error ? (
                <span className="input-error-msg">{error}</span>
            ) : helperText ? (
                <span className="input-helper">{helperText}</span>
            ) : null}
        </div>
    );
});

Input.displayName = 'Input';
