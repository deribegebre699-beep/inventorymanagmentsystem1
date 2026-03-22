import React, { useState } from 'react';
import { X, Mail, Paperclip } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingButton from './LoadingButton';
import { Item } from '../../types';
import { generatePDFBlob, generateCSVBlob } from '../../utils/exportUtils';

interface EmailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  reportTitle: string;
}

const EmailReportModal: React.FC<EmailReportModalProps> = ({ isOpen, onClose, items, reportTitle }) => {
  const { user } = useAuth();
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState(reportTitle);
  const [body, setBody] = useState('Please find the attached inventory report.');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setExtraFiles(Array.from(e.target.files));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('ToEmail', toEmail);
      formData.append('Subject', subject);
      formData.append('Body', body);

      // Generate report file on the fly
      let reportBlob: Blob;
      let filename: string;
      if (reportFormat === 'pdf') {
        reportBlob = generatePDFBlob(items, reportTitle);
        filename = 'inventory-report.pdf';
      } else {
        reportBlob = generateCSVBlob(items);
        filename = 'inventory-report.csv';
      }
      
      formData.append('Attachments', reportBlob, filename);

      // Add extra user attachments
      extraFiles.forEach(file => {
        formData.append('Attachments', file, file.name);
      });

      await api.post('/Reports/send-email', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess('Report sent successfully!');
      setTimeout(() => {
        onClose();
        setSuccess('');
        setToEmail('');
        setExtraFiles([]);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            Email Report
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-6 space-y-4">
          {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium">{error}</div>}
          {success && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium">{success}</div>}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">To Email</label>
            <input 
              required type="email" value={toEmail} onChange={e => setToEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="recipient@example.com"
            />
          </div>
          
          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 flex items-center gap-2 shadow-inner">
            <span className="font-bold">CC:</span> {user?.email} (You)
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
            <input 
              required type="text" value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Message</label>
            <textarea 
              rows={3} value={body} onChange={e => setBody(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Report Format</label>
              <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value as 'pdf' | 'csv')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Extra Attachments</label>
              <label className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 text-slate-600 transition-colors h-[42px]">
                <Paperclip className="w-4 h-4" />
                <span className="text-sm font-semibold truncate">{extraFiles.length > 0 ? `${extraFiles.length} file(s)` : 'Add Files'}</span>
                <input type="file" multiple onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-colors">Cancel</button>
            <div className="flex-1">
              <LoadingButton type="submit" loading={isSubmitting} className="w-full py-2.5 rounded-xl h-auto">Send Email</LoadingButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailReportModal;
