import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Mail, Eye } from 'lucide-react';
import {  useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Notification } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const [notifsRes, countRes] = await Promise.all([
        api.get('/Notifications'),
        api.get('/Notifications/unread-count')
      ]);
      setNotifications(notifsRes.data.slice(0, 5)); // Just top 5 for the dropdown
      setUnreadCount(countRes.data.count);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put(`/Notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const navigateToNotifications = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right"
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" /> Notifications
                {unreadCount > 0 && (
                  <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {unreadCount} new
                  </span>
                )}
              </h3>
            </div>

            <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-50 flex flex-col">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <Mail className="w-8 h-8 text-slate-200 mb-2" />
                  <p className="text-slate-500 text-sm">No notifications yet.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={navigateToNotifications}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm mb-1 ${!notif.isRead ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-400">
                          From: {notif.senderEmail} • {new Date(notif.sentAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigateToNotifications(); }}
                          className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                          title="View full notification"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {!notif.isRead && (
                          <button
                            onClick={(e) => markAsRead(notif.id, e)}
                            className="p-1.5 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={navigateToNotifications}
                className="w-full py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all text-center"
              >
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
