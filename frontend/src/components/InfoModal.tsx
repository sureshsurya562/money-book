import { useEffect, type CSSProperties } from 'react';
import { X } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

type InfoModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  tagline?: string;
  color?: string;
  icon?: string;
  description?: string;
  whyUseful?: string;
  benefits?: string[];
  howItWorks?: string;
};

export default function InfoModal({
  open,
  onClose,
  title,
  tagline,
  color = '#0f3d3e',
  icon,
  description,
  whyUseful,
  benefits,
  howItWorks,
}: InfoModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{ '--pillar': color } as CSSProperties}
      >
        <div className="modal-top">
          <div className="modal-title-row">
            {icon && (
              <div className="pillar-icon-wrap" style={{ width: 48, height: 48 }}>
                <CategoryIcon name={icon} size={24} color={color} />
              </div>
            )}
            <div>
              <h2 id="info-modal-title">{title}</h2>
              {tagline && <p className="modal-tagline">{tagline}</p>}
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {description && (
            <section>
              <h3>What is this?</h3>
              <p>{description}</p>
            </section>
          )}
          {whyUseful && (
            <section>
              <h3>Why it helps long term</h3>
              <p>{whyUseful}</p>
            </section>
          )}
          {benefits && benefits.length > 0 && (
            <section>
              <h3>Benefits</h3>
              <ul className="benefit-list">
                {benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </section>
          )}
          {howItWorks && (
            <section>
              <h3>How to use it</h3>
              <p>{howItWorks}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
