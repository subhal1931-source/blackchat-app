import React from 'react';
import { format } from 'date-fns';
import AudioPlayer from './AudioPlayer';

interface MessageProps {
  message: {
    id: string;
    content: string;
    senderName: string;
    createdAt: string;
    attachmentUrl?: string;
    attachmentType?: 'image' | 'video' | 'audio' | 'text';
  };
  isCurrentUser: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isCurrentUser }) => {
  const renderAttachment = () => {
    if (!message.attachmentUrl) return null;

    switch (message.attachmentType) {
      case 'image':
        return <img src={message.attachmentUrl} alt="attachment" className="mt-2 rounded-lg max-w-xs max-h-64 object-cover" />;
      case 'video':
        return <video src={message.attachmentUrl} controls className="mt-2 rounded-lg max-w-xs" />;
      case 'audio':
        return <AudioPlayer src={message.attachmentUrl} />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-end gap-2 group ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex flex-col max-w-md p-3 rounded-lg ${
          isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'
        }`}
      >
        {!isCurrentUser && <p className="text-xs font-bold text-primary mb-1">{message.senderName}</p>}
        {message.content && <p className="text-base whitespace-pre-wrap">{message.content}</p>}
        {renderAttachment()}
        <p className={`text-xs mt-2 text-right w-full ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {format(new Date(message.createdAt), 'p')}
        </p>
      </div>
    </div>
  );
};

export default Message;