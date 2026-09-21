import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeId } from '../../types/theme';
import { X, Check, Moon, Sun } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="cockpit-card w-full max-w-2xl p-6 rounded-xl shadow-2xl relative border"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--accent-glow)' }}>
              {currentTheme === 'dark' ? (
                <Moon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              ) : (
                <Sun className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wider font-mono uppercase" style={{ color: 'var(--text-primary)' }}>
                Day &amp; Night Theme Selection
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Switch between Tactical Night Ops and Arctic Daylight modes
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}
            aria-label="Close theme selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick segmented toggle bar */}
        <div className="flex rounded-xl p-1 mb-5 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={() => setTheme('night')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
              (currentTheme === 'night' || currentTheme === 'dark')
                ? 'shadow-md scale-[1.01]'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: (currentTheme === 'night' || currentTheme === 'dark') ? 'var(--accent-primary)' : 'transparent',
              color: (currentTheme === 'night' || currentTheme === 'dark') ? '#07111F' : 'var(--text-primary)',
            }}
          >
            <Moon className="w-4 h-4" />
            <span>NIGHT THEME</span>
          </button>

          <button
            onClick={() => setTheme('day')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
              (currentTheme === 'day' || currentTheme === 'light')
                ? 'shadow-md scale-[1.01]'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: (currentTheme === 'day' || currentTheme === 'light') ? 'var(--accent-primary)' : 'transparent',
              color: (currentTheme === 'day' || currentTheme === 'light') ? '#07111F' : 'var(--text-primary)',
            }}
          >
            <Sun className="w-4 h-4" />
            <span>DAY THEME</span>
          </button>
        </div>

        {/* 2 Theme Detailed Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {availableThemes.map((theme) => {
            const isSelected = currentTheme === theme.id || 
              (theme.id === 'night' && currentTheme === 'dark') || 
              (theme.id === 'day' && currentTheme === 'light');
            const isDarkCard = theme.id === 'night' || theme.id === 'dark';

            return (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id as ThemeId)}
                className={`p-4 rounded-xl text-left transition-all relative border flex flex-col justify-between ${
                  isSelected ? 'ring-2 ring-offset-2 scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: theme.previewColors.bg,
                  borderColor: isSelected ? theme.previewColors.accent : theme.previewColors.border,
                }}
              >
                <div>
                  <div className="flex items-start justify-between w-full mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: theme.previewColors.accent, borderColor: isDarkCard ? '#fff' : '#0F172A' }}
                      />
                      <span 
                        className="font-mono font-bold text-sm tracking-wider"
                        style={{ color: isDarkCard ? '#F5F7FA' : '#0F172A' }}
                      >
                        {theme.name}
                      </span>
                    </div>
                    {isSelected && (
                      <span 
                        className="flex items-center text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow"
                        style={{ 
                          backgroundColor: theme.previewColors.accent,
                          color: '#07111F'
                        }}
                      >
                        <Check className="w-3 h-3 mr-1" /> ACTIVE
                      </span>
                    )}
                  </div>

                  <p 
                    className="text-xs mb-4 font-sans leading-relaxed"
                    style={{ color: isDarkCard ? '#8FA3B8' : '#475569' }}
                  >
                    {theme.tagline}
                  </p>
                </div>

                {/* Color swatches preview */}
                <div 
                  className="pt-3 border-t w-full"
                  style={{ borderColor: isDarkCard ? '#1E4055' : '#CBD5E1' }}
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-[10px] font-mono uppercase tracking-wider" 
                      style={{ color: isDarkCard ? '#8FA3B8' : '#64748B' }}
                    >
                      PALETTE
                    </span>
                    <div className="flex space-x-1.5">
                      {isDarkCard ? (
                        <>
                          <span className="w-4 h-4 rounded border" style={{ backgroundColor: '#07111F', borderColor: '#1E4055' }} title="Navy BG (#07111F)" />
                          <span className="w-4 h-4 rounded border" style={{ backgroundColor: '#12263A', borderColor: '#1E4055' }} title="Card (#12263A)" />
                          <span className="w-4 h-4 rounded border" style={{ backgroundColor: '#00D9FF', borderColor: '#1E4055' }} title="Ice Cyan (#00D9FF)" />
                          <span className="w-4 h-4 rounded border" style={{ backgroundColor: '#00FF9C', borderColor: '#1E4055' }} title="Safety Green (#00FF9C)" />
                          <span className="w-4 h-4 rounded border" style={{ backgroundColor: '#FFB020', borderColor: '#1E4055' }} title="Warning (#FFB020)" />
                          <span className="w-4 h-4 rounded border" style={{ backgroundColor: '#FF4D4D', borderColor: '#1E4055' }} title="Critical (#FF4D4D)" />
                        </>
                      ) : (
                        <>
                          <span className="w-4 h-4 rounded border" style={{ backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }} title="Snow BG (#F1F5F9)" />
                          <span className="w-4 h-4 rounded border" style={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1' }} title="White Card (#FFFFFF)" />
                          <span className="w-4 h-4 rounded border" style={{ backgroundColor: '#0284C7', borderColor: '#CBD5E1' }} title="Sky Cyan (#0284C7)" />
                          <span className="w-4 h-4 rounded border" style={{ backgroundColor: '#059669', borderColor: '#CBD5E1' }} title="Signal Green (#059669)" />
                          <span className="w-4 h-4 rounded border" style={{ backgroundColor: '#D97706', borderColor: '#CBD5E1' }} title="Warning (#D97706)" />
                          <span className="w-4 h-4 rounded border" style={{ backgroundColor: '#DC2626', borderColor: '#CBD5E1' }} title="Critical (#DC2626)" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            Instant dynamic re-theming without page reload.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-mono font-bold tracking-wider rounded uppercase transition-all shadow-md hover:scale-105"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: '#07111F'
            }}
          >
            Apply &amp; Return
          </button>
        </div>
      </div>
    </div>
  );
};
