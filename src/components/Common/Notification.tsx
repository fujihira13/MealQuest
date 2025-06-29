import React from 'react';
import { useUIStore } from '@/store/useAppStore';

export const Notification: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification ${notification.type} show`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="notification-content">
            {notification.message}
          </div>
        </div>
      ))}
    </div>
  );
};