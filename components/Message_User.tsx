import React from 'react';
import './Message_User.css';

interface MessageUserProps {
  children?: React.ReactNode;
  text?: string;
  className?: string;
}

export const Message_User: React.FC<MessageUserProps> = ({
  children,
  text,
  className = '',
}) => {
  const messageContent = children || text || '';

  return (
    <div className={`message-user-wrapper ${className}`}>
      <div className="message-user">
        <p className="message-user-text">{messageContent}</p>
      </div>
    </div>
  );
};



