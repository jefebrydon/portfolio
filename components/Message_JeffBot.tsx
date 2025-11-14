import React from 'react';
import './Message_JeffBot.css';

interface MessageJeffBotProps {
  children?: React.ReactNode;
  text?: string;
  className?: string;
}

export const Message_JeffBot: React.FC<MessageJeffBotProps> = ({
  children,
  text,
  className = '',
}) => {
  const messageContent = children || text || '';

  return (
    <div className={`message-jeffbot-wrapper ${className}`}>
      <div className="message-jeffbot">
        <p className="message-jeffbot-text">{messageContent}</p>
      </div>
    </div>
  );
};

