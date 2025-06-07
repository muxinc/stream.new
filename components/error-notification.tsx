import React from 'react';

interface ErrorNotificationProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({ message, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm" role="alert">
      <span className="block sm:inline">{message}</span>
      {onDismiss && (
        <button
          className="absolute top-0 bottom-0 right-0 px-3 py-2"
          onClick={onDismiss}
        >
          <span className="sr-only">Dismiss</span>
          <svg className="fill-current h-4 w-4 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <title>Close</title>
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
          </svg>
        </button>
      )}
    </div>
  );
}; 