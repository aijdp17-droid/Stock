import React from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Store,
  FileSpreadsheet,
  Package,
  X,
  ArrowRight,
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastsProps {
  onNavigateTab: (tab: string) => void;
}

export const NotificationToasts: React.FC<NotificationToastsProps> = ({ onNavigateTab }) => {
  const { activeToasts, dismissToast, markAsRead } = useApp();

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {activeToasts.map((toast) => {
        const isError = toast.severity === 'error';
        const isWarning = toast.severity === 'warning';
        const isSuccess = toast.severity === 'success';

        let Icon = Info;
        let iconBg = 'bg-blue-100 text-blue-700';
        let borderStyle = 'border-blue-200';

        if (toast.type === 'stock_alert') {
          Icon = AlertTriangle;
          iconBg = isError ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';
          borderStyle = isError ? 'border-red-300' : 'border-amber-300';
        } else if (toast.type === 'sheets_sync') {
          Icon = FileSpreadsheet;
          iconBg = isError ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700';
          borderStyle = isError ? 'border-red-300' : 'border-emerald-300';
        } else if (toast.type === 'web_order') {
          Icon = Store;
          iconBg = 'bg-purple-100 text-purple-700';
          borderStyle = 'border-purple-300';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border ${borderStyle} p-4 transition-all transform translate-y-0 animate-in fade-in slide-in-from-top-4 duration-200 flex items-start gap-3`}
          >
            <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900 truncate">{toast.title}</h4>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                {toast.message}
              </p>

              {toast.actionTab && (
                <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400">Notification en direct</span>
                  <button
                    onClick={() => {
                      markAsRead(toast.id);
                      dismissToast(toast.id);
                      if (toast.actionTab) onNavigateTab(toast.actionTab);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    <span>Consulter</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
