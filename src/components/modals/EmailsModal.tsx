import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  Inbox,
  Sparkles,
  Server,
  Loader2,
  FileText,
  Clock,
} from 'lucide-react';

interface EmailLog {
  id: string;
  type: 'welcome' | 'invoice' | 'digest';
  provider: 'Resend' | 'SendGrid' | 'AWS SES';
  subject: string;
  recipient: string;
  timestamp: string;
  status: 'Delivered' | 'Pending';
}

export const EmailsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, revisionItems } = useApp();

  const [provider, setProvider] = useState<'Resend' | 'SendGrid' | 'AWS SES'>('Resend');
  const [selectedType, setSelectedType] = useState<'welcome' | 'invoice' | 'digest'>('digest');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [logs, setLogs] = useState<EmailLog[]>([
    {
      id: 'eml-1',
      type: 'welcome',
      provider: 'Resend',
      subject: 'Welcome to STUDYOS by bhaleinc — Your AI Learning Operating System',
      recipient: user?.email || 'sarah.j@university.edu',
      timestamp: 'Today, 08:30 AM',
      status: 'Delivered',
    },
    {
      id: 'eml-2',
      type: 'invoice',
      provider: 'Resend',
      subject: 'Tax Invoice: STUDYOS PRO Plan (bhaleinc)',
      recipient: user?.email || 'sarah.j@university.edu',
      timestamp: 'Nov 04, 2026',
      status: 'Delivered',
    },
  ]);

  if (!isOpen) return null;

  const handleSendTestEmail = async () => {
    setLoading(true);
    setStatusMessage(null);

    try {
      let endpoint = '/api/emails/send-digest';
      let payload: any = {
        email: user?.email || 'student@university.edu',
        streakDays: user?.streakDays || 8,
        dueRevisionsCount: revisionItems.length,
        provider,
      };

      if (selectedType === 'welcome') {
        endpoint = '/api/emails/send-welcome';
        payload = { email: user?.email || 'student@university.edu', name: user?.name || 'Scholar', provider };
      } else if (selectedType === 'invoice') {
        endpoint = '/api/emails/send-invoice';
        payload = { email: user?.email || 'student@university.edu', plan: user?.plan || 'pro', amount: 149, provider };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        const newLog: EmailLog = {
          id: `eml-${Date.now()}`,
          type: selectedType,
          provider,
          subject: data.subject,
          recipient: user?.email || 'student@university.edu',
          timestamp: 'Just now',
          status: 'Delivered',
        };
        setLogs([newLog, ...logs]);
        setStatusMessage(`Email successfully dispatched via ${provider} to ${payload.email}`);
      }
    } catch (err: any) {
      setStatusMessage('Failed to dispatch transactional email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 max-h-[88vh] overflow-y-auto min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              <span>bhaleinc messaging</span>
              <span>·</span>
              <span>Transactional Gateway</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
              Transactional Emails
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Powered by Resend, SendGrid, and AWS SES.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-600" />
            <span>Active Email Service</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['Resend', 'SendGrid', 'AWS SES'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center truncate ${
                  provider === p
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Email Dispatch Trigger */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Send Notification or Invoice</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200"
            >
              <option value="digest">Daily Revision Digest</option>
              <option value="welcome">Student Welcome Email</option>
              <option value="invoice">bhaleinc Tax Invoice</option>
            </select>
          </div>

          <button
            onClick={handleSendTestEmail}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Dispatch via {provider}</span>
          </button>

          {statusMessage && (
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMessage}</span>
            </p>
          )}
        </div>

        {/* Sent Email History */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Inbox className="w-3.5 h-3.5" />
            <span>Recent Email Deliveries</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 uppercase">
                      {log.provider}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {log.subject}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">To: {log.recipient} · {log.timestamp}</p>
                </div>

                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{log.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
