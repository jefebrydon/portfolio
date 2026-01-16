import React from 'react';
import './Button_Icon.css';

interface ButtonIconPrimaryProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export const Button_Icon_Primary: React.FC<ButtonIconPrimaryProps> = ({
  onClick,
  disabled = false,
  ariaLabel = 'Submit',
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type="button"
      className={`button-icon button-icon-primary ${disabled ? 'disabled' : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <svg
        className="button-icon-svg button-icon-primary-svg"
        width="15"
        height="16"
        viewBox="0 0 15 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6.25 16V4.67692L1.75 9.10769L0 7.38462L7.5 0L15 7.38462L13.25 9.10769L8.75 4.67692V16H6.25Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};

