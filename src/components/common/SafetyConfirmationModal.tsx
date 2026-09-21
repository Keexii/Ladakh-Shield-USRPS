import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  warningMessage: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SafetyConfirmationModal: React.FC<Props> = ({
  isOpen,
  title,
  warningMessage,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="cockpit-card w-full max-w-md p-6 rounded-xl relative border shadow-2xl"
        style={{ borderColor: '#FF4D4D', backgroundColor: 'var(--bg-card)' }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-[#FF4D4D]/20 text-[#FF4D4D] border border-[#FF4D4D]/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-base text-[#FF4D4D] uppercase tracking-wider">
              Safety Critical Warning
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Engineering Interlock Override Confirmation
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg border bg-[#FF4D4D]/10 border-[#FF4D4D]/40 mb-5 text-xs font-mono leading-relaxed text-[#F5F7FA]">
          <div className="font-bold mb-1 flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-[#FFB020]" />
            <span>{title}</span>
          </div>
          <p>{warningMessage}</p>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-mono font-bold border transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          >
            Cancel / Abort
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-[#FF4D4D] hover:opacity-90 text-white uppercase tracking-wider transition-all"
          >
            Confirm Override
          </button>
        </div>
      </div>
    </div>
  );
};
