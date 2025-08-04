import React, { useEffect } from 'react';
import { notification } from 'antd';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Notification = ({ showNotification, notificationMessage, type = 'success' }) => {
  const [api, contextHolder] = notification.useNotification();

  const getIcon = (type) => {
    switch(type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'info':
        return <Info size={20} className="text-blue-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      default:
        return <CheckCircle size={20} className="text-green-500" />;
    }
  };

  const openNotification = (type, message) => {
    api[type]({
      message: message,
      icon: getIcon(type),
      placement: 'topRight',
      duration: 2,
      style: {
        borderRadius: '12px',
        border: `1px solid ${
          type === 'success' ? '#86efac' : 
          type === 'error' ? '#fca5a5' : 
          type === 'warning' ? '#fcd34d' : '#93c5fd'
        }`,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }
    });
  };

  useEffect(() => {
    if (showNotification && notificationMessage) {
      openNotification(type, notificationMessage);
    }
  }, [showNotification, notificationMessage, type]);

  return contextHolder;
};

export default Notification;