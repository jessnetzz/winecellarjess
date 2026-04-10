import { ReactNode, useEffect } from 'react';

interface ModalProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export default function Modal({ title, description, isOpen, onClose, children, size = 'lg' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = {
    md: 'max-w-xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }[size];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm animate-[fadeIn_160ms_ease-out]" role="dialog" aria-modal="true">
      <div className={`mx-auto my-8 ${sizeClass}`}>
        <div className="panel overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-ink/10 bg-porcelain px-5 py-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-ink">{title}</h2>
              {description ? <p className="mt-1 text-sm text-smoke">{description}</p> : null}
            </div>
            <button className="ghost-button" type="button" onClick={onClose} aria-label="Close modal">
              Close
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
