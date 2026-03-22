import { useEffect, useState } from 'react';
import { X, ShoppingCart, Heart } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'cart' | 'wishlist';
  productName: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ type, productName, onClose, duration = 4000 }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const icon = type === 'cart' ? <ShoppingCart className="w-5 h-5" /> : <Heart className="w-5 h-5" />;
  const message = type === 'cart' 
    ? `${productName} added to cart!` 
    : `${productName} added to wishlist!`;
  
  const bgColor = type === 'cart' 
    ? 'linear-gradient(135deg, #7FA99B 0%, #6B8E7F 100%)' // sage green
    : 'linear-gradient(135deg, #A64B3A 0%, #8B3A2A 100%)'; // rust red

  return (
    <div 
      className={`toast-notification ${isClosing ? 'toast-closing' : ''}`}
      style={{ background: bgColor }}
    >
      {/* Icon with pulse animation */}
      <div className="toast-icon">
        {icon}
      </div>

      {/* Content */}
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>

      {/* Close button */}
      <button 
        className="toast-close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div className="toast-progress-container">
        <div 
          className="toast-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
