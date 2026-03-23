import  { useState, useEffect } from 'react';
import api from '../api/axios';
import { Notification } from '../types';
import { Bell, Mail, Send, CheckCircle2, Loader2, AlertCircle, Eye, X } from 'lucide-react';
import LoadingButton from '../components/common/LoadingButton';
import DataView, { Column } from '../components/common/DataView';

const Notifications = () => {
  const [received, setReceived] = useState<Notification[]>([]);
  const [sent, setSent] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [isMarking, setIsMarking] = useState(false);
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [receivedRes, sentRes] = await Promise.all([
        api.get('/Notifications'),
        api.get('/Notifications/sent')
      ]);
      setReceived(receivedRes.data);
      setSent(sentRes.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/Notifications/${id}/read`);
      setReceived(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    if (isMarking) return;
    setIsMarking(true);
    try {
      await api.put('/Notifications/read-all');
      setReceived(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    } finally {
      setIsMarking(false);
    }
  };

  const displayedNotifications = activeTab === 'inbox' ? received : sent;
  const unreadCount = received.filter(n => !n.isRead).length;

  const columns: Column<Notification>[] = [
    {
      key: 'status',
      header: '',
      render: (notif) => (
        <div className="w-8 flex justify-center">
          {activeTab === 'inbox' && !notif.isRead && (
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200"></div>
          )}
        </div>
      ),
    },
    {
      key: 'users',
      header: activeTab === 'inbox' ? 'From' : 'To',
      render: (notif) => (
        <span className="font-semibold text-slate-700">
          {activeTab === 'inbox' ? notif.senderEmail : notif.recipientEmail}
        </span>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      render: (notif) => (
        <span className={`${activeTab === 'inbox' && !notif.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
          {notif.message}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      align: 'right',
      render: (notif) => (
        <span className="text-sm text-slate-500">
          {new Date(notif.sentAt).toLocaleString()}
        </span>
      ),
    },
    ...(activeTab === 'inbox' ? [{
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (notif: Notification) => (
        <div className="flex justify-end gap-1 pr-4">
          <button
             onClick={() => setViewingNotification(notif)}
             className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
             title="View full notification"
           >
             <Eye className="w-5 h-5" />
           </button>
          {!notif.isRead && (
             <button
               onClick={() => markAsRead(notif.id)}
               className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
               title="Mark as read"
             >
               <CheckCircle2 className="w-5 h-5" />
             </button>
          )}
        </div>
      )
    }] : [{
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (notif: Notification) => (
        <div className="flex justify-end gap-1 pr-4">
          <button
             onClick={() => setViewingNotification(notif)}
             className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
             title="View full notification"
           >
             <Eye className="w-5 h-5" />
           </button>
        </div>
      )
    }])
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-600" /> Notifications
          </h1>
          <p className="text-slate-500 mt-2">View system alerts and messages from your team</p>
        </div>
        {activeTab === 'inbox' && unreadCount > 0 && (
          <LoadingButton
            onClick={markAllAsRead}
            loading={isMarking}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors disabled:opacity-50 w-auto h-auto shadow-none"
          >
            <CheckCircle2 className="w-5 h-5" />
            Mark all as read
          </LoadingButton>
        )}
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors relative ${
            activeTab === 'inbox' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Inbox {unreadCount > 0 && <span className="ml-1.5 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">{unreadCount}</span>}
          {activeTab === 'inbox' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors relative ${
            activeTab === 'sent' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Sent Messages
          {activeTab === 'sent' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <DataView<Notification>
          data={displayedNotifications}
          columns={columns}
          keyExtractor={(notif) => notif.id}
          emptyIcon={activeTab === 'inbox' ? <Mail className="w-12 h-12 text-slate-300" /> : <Send className="w-12 h-12 text-slate-300" />}
          emptyMessage={`No ${activeTab} notifications found.`}
          cardRender={(notif) => (
            <div className={`bg-white border rounded-xl p-5 shadow-sm transition-shadow ${
              activeTab === 'inbox' && !notif.isRead ? 'border-indigo-200 bg-indigo-50/10' : 'border-slate-200 hover:shadow-md'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {activeTab === 'inbox' && !notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  )}
                  <p className="font-semibold text-sm text-slate-500 uppercase tracking-wider">
                    {activeTab === 'inbox' ? 'From:' : 'To:'} <span className="text-slate-800">{activeTab === 'inbox' ? notif.senderEmail : notif.recipientEmail}</span>
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {new Date(notif.sentAt).toLocaleDateString()}
                </span>
              </div>
              <p className={`text-slate-700 leading-relaxed ${activeTab === 'inbox' && !notif.isRead ? 'font-medium' : ''}`}>
                {notif.message}
              </p>
              
              {activeTab === 'inbox' && !notif.isRead && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={() => setViewingNotification(notif)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark as read
                  </button>
                </div>
              )}
              {(activeTab !== 'inbox' || notif.isRead) && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setViewingNotification(notif)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" /> View full message
                  </button>
                </div>
              )}
            </div>
          )}
        />
      )}

      {/* View Notification Modal */}
      {viewingNotification && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Bell className="w-5 h-5 text-indigo-500" /> Notification Details
               </h3>
               <button onClick={() => setViewingNotification(null)} className="text-slate-400 hover:text-slate-600">
                 <X className="w-5 h-5" />
               </button>
             </div>
             <div className="p-6">
                <div className="mb-4 text-sm text-slate-500">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700">{activeTab === 'inbox' ? 'From:' : 'To:'}</span>
                    <span className="text-slate-900">{activeTab === 'inbox' ? viewingNotification.senderEmail : viewingNotification.recipientEmail}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="font-semibold text-slate-700">Date:</span>
                    <span>{new Date(viewingNotification.sentAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                   <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                     {viewingNotification.message}
                   </p>
                </div>
                {activeTab === 'inbox' && !viewingNotification.isRead && (
                   <div className="mt-6 flex justify-end">
                     <button
                       onClick={() => {
                         markAsRead(viewingNotification.id);
                         setViewingNotification(null);
                       }}
                       className="flex items-center gap-2 px-4 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-sm"
                     >
                       <CheckCircle2 className="w-5 h-5" /> Mark as read
                     </button>
                   </div>
                )}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
