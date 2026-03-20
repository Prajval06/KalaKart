import { useEffect, useRef, useState } from 'react';

export function AnnouncementBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Get bar height for padding compensation
    if (barRef.current) {
      setBarHeight(barRef.current.offsetHeight);
    }

    // Handle scroll
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div 
        ref={barRef}
        className={`announcement-bar-wrapper ${isScrolled ? 'scrolled' : ''}`}
        role="banner" 
        aria-label="Welcome announcement"
      >
        {/* Top Decorative Borders */}
        <div className="border-stripe-top"></div>
        <div className="border-hairline-top"></div>
        <div className="border-paisley-top"></div>
        
        {/* Main Marquee Container */}
        <div className="marquee-container">
          <div className="marquee-content">
            <span className="marquee-item">
              🪔 Namaste! Welcome to <strong>KARIGARKART</strong> — Where Every Craft Tells a Story
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🪔 <span className="hindi">हस्तकला को सलाम!</span> <span className="translation">— Saluting the Art of Handcraft</span>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🏺 Celebrating the <strong>Living Heritage</strong> of Indian Artisans Since Generations
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🧵 <span className="hindi">असली भारतीय शिल्प, सीधे कारीगर से</span> <span className="translation">— Real Indian Craft, Direct from the Artisan</span>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🧵 <strong>100% Authentic</strong> — From the Hands of India's Master Craftspeople to Your Home
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🏺 <span className="hindi">परंपरा की खुशबू, घर तक पहुँचाएं</span> <span className="translation">— Bringing the Fragrance of Tradition to Your Home</span>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🌸 "Kala Ka Kart" — Art is Our Soul, <strong>India is Our Inspiration</strong>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🌸 <span className="hindi">कला हमारी पहचान, भारत हमारी शान</span> <span className="translation">— Craft is Our Identity, India is Our Pride</span>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🛕 Rooted in Tradition · Woven with Pride · <strong>Made in Bharat</strong>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🛕 <span className="hindi">हर धागे में इतिहास, हर रंग में भारत</span> <span className="translation">— History in Every Thread, India in Every Color</span>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              ✂️ <strong>Free Shipping</strong> Across India on Orders Above <strong>₹999</strong>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🎨 Supporting <strong>10,000+ Local Artisans</strong> Across Every State of India
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🪔 Dastkar · Karigar · Shilpkaar — <strong>India's Best, For You</strong>
            </span>
            <span className="divider">✦</span>
            
            {/* Duplicate content for seamless loop */}
            <span className="marquee-item">
              🪔 Namaste! Welcome to <strong>KARIGARKART</strong> — Where Every Craft Tells a Story
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🪔 <span className="hindi">हस्तकला को सलाम!</span> <span className="translation">— Saluting the Art of Handcraft</span>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🏺 Celebrating the <strong>Living Heritage</strong> of Indian Artisans Since Generations
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🧵 <span className="hindi">असली भारतीय शिल्प, सीधे कारीगर से</span> <span className="translation">— Real Indian Craft, Direct from the Artisan</span>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🧵 <strong>100% Authentic</strong> — From the Hands of India's Master Craftspeople to Your Home
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🏺 <span className="hindi">परंपरा की खुशबू, घर तक पहुँचाएं</span> <span className="translation">— Bringing the Fragrance of Tradition to Your Home</span>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🌸 "Kala Ka Kart" — Art is Our Soul, <strong>India is Our Inspiration</strong>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🌸 <span className="hindi">कला हमारी पहचान, भारत हमारी शान</span> <span className="translation">— Craft is Our Identity, India is Our Pride</span>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🛕 Rooted in Tradition · Woven with Pride · <strong>Made in Bharat</strong>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🛕 <span className="hindi">हर धागे में इतिहास, हर रंग में भारत</span> <span className="translation">— History in Every Thread, India in Every Color</span>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              ✂️ <strong>Free Shipping</strong> Across India on Orders Above <strong>₹999</strong>
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🎨 Supporting <strong>10,000+ Local Artisans</strong> Across Every State of India
            </span>
            <span className="divider">✦</span>
            
            <span className="marquee-item">
              🪔 Dastkar · Karigar · Shilpkaar — <strong>India's Best, For You</strong>
            </span>
            <span className="divider">✦</span>
          </div>
        </div>
        
        {/* Bottom Decorative Borders */}
        <div className="border-paisley-bottom"></div>
        <div className="border-hairline-bottom"></div>
        <div className="border-stripe-bottom"></div>
      </div>
      
      {/* Spacer div to prevent content jump when bar becomes fixed */}
      {isScrolled && <div style={{ height: `${barHeight}px` }} />}
    </>
  );
}
