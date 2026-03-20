import { Link, useNavigate } from 'react-router';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string; // omit for the current (last) page
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const navigate = useNavigate();
  const currentItem = items[items.length - 1];

  // Navigate to the explicit parent URL (second-to-last breadcrumb item).
  // This is always reliable, unlike navigate(-1) which depends on browser history.
  const handleBack = () => {
    if (items.length >= 2) {
      const parent = items[items.length - 2];
      navigate(parent.href ?? '/');
    } else {
      navigate('/');
    }
  };

  return (
    <div
      className="w-full"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderBottom: '1px solid rgba(74, 44, 42, 0.09)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-2.5">

          {/* ← Back button */}
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-150 group flex-shrink-0"
            style={{ color: 'var(--dark-brown)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(180,140,90,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <ArrowLeft
              className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5"
            />
            <span className="text-sm hidden sm:inline select-none">Back</span>
          </button>

          {/* Vertical divider */}
          <div
            className="h-5 w-px flex-shrink-0"
            style={{ backgroundColor: 'rgba(74,44,42,0.14)' }}
          />

          {/* Desktop — full trail */}
          <nav
            aria-label="Breadcrumb"
            className="hidden sm:flex items-center gap-1 min-w-0 flex-1 overflow-hidden"
          >
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <div key={index} className="flex items-center gap-1 min-w-0">
                  {index > 0 && (
                    <ChevronRight
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: '#C4B5A5' }}
                    />
                  )}
                  {isLast ? (
                    <span
                      className="text-sm truncate max-w-[200px]"
                      title={item.label}
                      style={{ color: 'var(--rust-red)', fontWeight: 600 }}
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.href!}
                      className="text-sm truncate max-w-[160px] transition-colors duration-150 hover:underline underline-offset-2"
                      title={item.label}
                      style={{ color: 'var(--text-gray)' }}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobile — current page name only */}
          <span
            className="sm:hidden text-sm truncate flex-1"
            style={{ color: 'var(--rust-red)', fontWeight: 600 }}
          >
            {currentItem.label}
          </span>
        </div>
      </div>
    </div>
  );
}