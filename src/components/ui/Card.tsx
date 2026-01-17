import React, { type HTMLAttributes } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    glass?: boolean;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    glass = false,
    hover = false,
    padding = 'md',
    ...props
}) => {
    const classes = [
        'card',
        glass && 'card-glass',
        hover && 'card-hover',
        padding !== 'md' && `card-padding-${padding}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};
