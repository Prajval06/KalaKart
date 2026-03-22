import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ChevronRight, RefreshCw } from 'lucide-react';
import { getSuggestedProducts, getStyleProfileDescription, StyleTag } from '../utils/discoveryUtils';
import { Product } from '../data/products';
import { Link } from 'react-router';

// Define the steps of out chat
const QUESTIONS = [
  {
    text: "Welcome to KalaKart Discovery! ✨ I'm here to help you find the perfect handcrafted item. Let's start: What's your primary reason for shopping today?",
    options: [
      { text: "Upgrading home decor 🏡", values: { eco: 1, minimal: 1 } },
      { text: "Buying a gift 🎁", values: { traditional: 1, festive: 1 } },
      { text: "Finding traditional wear 👗", values: { traditional: 2 } },
      { text: "Just browsing unique items 👀", values: { festive: 1, eco: 1 } }
    ]
  },
  {
    text: "Nice! Which of these materials appeals to you the most?",
    options: [
      { text: "Terracotta or Clay 🏺", values: { eco: 2 } },
      { text: "Fine Silk or Cotton 🧵", values: { traditional: 1, festive: 1 } },
      { text: "Brass, Gold or Silver ✨", values: { festive: 2 } },
      { text: "Simple Wood 🪵", values: { minimal: 2 } }
    ]
  },
  {
    text: "Got it. How would you describe your personal style?",
    options: [
      { text: "Less is more (Minimal) 🤍", values: { minimal: 2 } },
      { text: "Rooted in culture 🛕", values: { traditional: 2 } },
      { text: "Bold and vibrant 🌟", values: { festive: 2 } },
      { text: "Earthy and natural 🌿", values: { eco: 2 } }
    ]
  },
  {
    text: "What vibe do you want to create in your space or outfit?",
    options: [
      { text: "Calm & Serene 🧘", values: { minimal: 1, eco: 1 } },
      { text: "Warm & Cozy ☕", values: { traditional: 1, eco: 1 } },
      { text: "Luxurious & Grand 👑", values: { festive: 2 } },
      { text: "Clean & Organized 📐", values: { minimal: 2 } }
    ]
  },
  {
    text: "Finally, choose a color palette you gravitate towards:",
    options: [
      { text: "Neutrals & Whites ⚪", values: { minimal: 2 } },
      { text: "Deep Reds & Golds 🔴", values: { festive: 2, traditional: 1 } },
      { text: "Greens & Earth Tones 🟢", values: { eco: 2 } },
      { text: "Bright & Multicolored 🌈", values: { festive: 1, traditional: 1 } }
    ]
  }
];

export function DiscoveryWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userScores, setUserScores] = useState<Record<StyleTag, number>>({
    minimal: 0,
    traditional: 0,
    festive: 0,
    eco: 0,
  });
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'bot' | 'user'; text: string }>>([
    { type: 'bot', text: QUESTIONS[0].text }
  ]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [topStyle, setTopStyle] = useState<StyleTag | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load state from localStorage if exists
    const savedState = localStorage.getItem('kalakart_discovery_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.isCompleted) {
          setUserScores(parsed.userScores);
          setTopStyle(parsed.topStyle);
          setSuggestedProducts(parsed.suggestedProducts);
          setIsCompleted(true);
          setChatHistory(parsed.chatHistory || []);
          setHasOpened(true);
        }
      } catch (e) {
        console.error("Failed to parse discovery state", e);
      }
    }

    // Auto trigger logic
    const handleScroll = () => {
      if (!hasOpened && !isOpen && window.scrollY > window.innerHeight * 0.5) {
        setIsOpen(true);
        setHasOpened(true);
      }
    };

    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      if (!hasOpened && !isOpen) {
        idleTimer = setTimeout(() => {
          setIsOpen(true);
          setHasOpened(true);
        }, 10000); // 10 seconds of idle
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keypress', resetIdleTimer);

    resetIdleTimer();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keypress', resetIdleTimer);
      clearTimeout(idleTimer);
    };
  }, [hasOpened, isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen]);

  const handleOptionSelect = (option: { text: string; values: Partial<Record<StyleTag, number>> }) => {
    // Update chat history
    setChatHistory(prev => [...prev, { type: 'user', text: option.text }]);

    // Update scores
    const newScores = { ...userScores };
    for (const [key, value] of Object.entries(option.values)) {
      newScores[key as StyleTag] += value as number;
    }
    setUserScores(newScores);

    // Go to next step or complete
    const nextStep = currentStep + 1;
    if (nextStep < QUESTIONS.length) {
      setTimeout(() => {
        setChatHistory(prev => [...prev, { type: 'bot', text: QUESTIONS[nextStep].text }]);
        setCurrentStep(nextStep);
      }, 600);
    } else {
      setTimeout(() => {
        completeDiscovery(newScores);
      }, 600);
    }
  };

  const completeDiscovery = (finalScores: Record<StyleTag, number>) => {
    setIsCompleted(true);
    
    // Find top style
    const style = Object.keys(finalScores).reduce((a, b) => 
      finalScores[a as StyleTag] > finalScores[b as StyleTag] ? a : b
    ) as StyleTag;
    
    setTopStyle(style);
    
    // Get suggestions
    const suggestions = getSuggestedProducts(finalScores, 3);
    setSuggestedProducts(suggestions);

    const finishMessage = "Great choices! Based on your answers, here is your personalized style profile and some hand-picked recommendations just for you.";
    
    const newHistory: Array<{ type: 'bot' | 'user'; text: string }> = [...chatHistory, { type: 'bot', text: finishMessage }];
    setChatHistory(newHistory);

    // Save to localStorage
    localStorage.setItem('kalakart_discovery_state', JSON.stringify({
      isCompleted: true,
      userScores: finalScores,
      topStyle: style,
      suggestedProducts: suggestions,
      chatHistory: newHistory
    }));
  };

  const resetDiscovery = () => {
    setIsCompleted(false);
    setCurrentStep(0);
    setUserScores({ minimal: 0, traditional: 0, festive: 0, eco: 0 });
    setChatHistory([{ type: 'bot', text: QUESTIONS[0].text }]);
    setTopStyle(null);
    setSuggestedProducts([]);
    localStorage.removeItem('kalakart_discovery_state');
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => {
              setIsOpen(true);
              setHasOpened(true);
            }}
            className="fixed bottom-6 right-6 z-50 p-4 bg-terracotta text-white rounded-full shadow-lg hover:bg-terracotta-dark hover:shadow-xl transition-all flex items-center justify-center group"
            style={{ backgroundColor: 'var(--terracotta)' }}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap ml-0 group-hover:ml-2 font-medium">
              Find Your Style
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-[350px] sm:max-w-[400px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 text-white" style={{ backgroundColor: 'var(--terracotta)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Style Discovery</h3>
                  <p className="text-xs text-white/80">KalaKart Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" style={{ backgroundColor: 'var(--cream-bg)' }}>
              {chatHistory.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.type === 'user'
                        ? 'bg-gray-800 text-white rounded-br-sm'
                        : 'bg-white shadow-sm border border-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isCompleted && topStyle && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm mt-4"
                >
                  <div className="p-4 border-b border-gray-100" style={{ backgroundColor: 'var(--warm-yellow)', opacity: 0.9 }}>
                    <div className="text-xs font-bold tracking-widest text-gray-800 uppercase mb-1">Your Style Profile</div>
                    <h4 className="text-xl font-serif text-gray-900 capitalize">{topStyle} Aesthetics</h4>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {getStyleProfileDescription(topStyle)}
                    </p>
                    
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Picks for You</p>
                      {suggestedProducts.map((product) => (
                        <Link 
                          key={product.id} 
                          to={`/product/${product.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
                        >
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-900 truncate">{product.name}</h5>
                            <p className="text-xs text-gray-500 font-medium">₹{product.price.toLocaleString('en-IN')}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-terracotta" />
                        </Link>
                      ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
                       <button 
                        onClick={resetDiscovery}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Retake Quiz
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area (Options) */}
            {!isCompleted && currentStep < QUESTIONS.length && (
              <div className="p-4 bg-white border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3 font-medium">Choose an option:</p>
                <div className="flex flex-col gap-2">
                  {QUESTIONS[currentStep].options.map((option, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleOptionSelect(option)}
                      className="text-left px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-terracotta hover:bg-terracotta/5 transition-all"
                    >
                      {option.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Progress Bar */}
            {!isCompleted && (
              <div className="h-1 bg-gray-100 w-full">
                <div 
                  className="h-full transition-all duration-300 ease-out"
                  style={{ 
                    width: `${((currentStep) / QUESTIONS.length) * 100}%`,
                    backgroundColor: 'var(--terracotta)'
                  }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
