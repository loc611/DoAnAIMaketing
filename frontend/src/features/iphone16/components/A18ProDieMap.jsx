import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import chip18proImg from '@imga/iphone/chip18pro.png';
import './A18ProDieMap.css';

gsap.registerPlugin(ScrollTrigger);

export default function A18ProDieMap() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Use gsap.context to properly manage and cleanup ScrollTrigger in React 18 Strict Mode
    let ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          setProgress(self.progress);
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  // Determine active index based on scroll progress
  let scrollIndex = -1;
  if (progress > 0.05 && progress <= 0.28) scrollIndex = 0; // Neural
  else if (progress > 0.28 && progress <= 0.51) scrollIndex = 1; // GPU
  else if (progress > 0.51 && progress <= 0.74) scrollIndex = 2; // CPU
  else if (progress > 0.74 && progress <= 0.98) scrollIndex = 3; // ISP

  // Allow manual hover to override scroll-based active index
  const activeIndex = hoverIndex !== null ? hoverIndex : scrollIndex;
  const showOverlay = (progress > 0 && progress < 0.99) || hoverIndex !== null;

  return (
    <div className="a18-die-container">
      <section className="a18-intro">
        <div className="eyebrow a18-mono">Silicon walkthrough</div>
        <h2>BÃªn trong A18 Pro</h2>
        <p>Cuá»™n Ä‘á»ƒ láº§n lÆ°á»£t khÃ¡m phÃ¡ tá»«ng khá»‘i chá»©c nÄƒng trÃªn die â€” Neural Engine, GPU, CPU vÃ  bá»™ xá»­ lÃ½ hÃ¬nh áº£nh â€” má»—i khá»‘i sÃ¡ng lÃªn Ä‘Ãºng lÃºc kÃ¨m thÃ´ng sá»‘ riÃªng.</p>
        <div className="a18-scroll-cue a18-mono"><div className="bar"></div>CUá»˜N XUá»NG</div>
      </section>

      <div className="a18-stage-wrap" ref={containerRef}>
        <div className="a18-stage">
          <div className={`a18-stage-caption a18-mono ${showOverlay ? 'show' : ''}`}>A18 Pro â€” die map</div>

          <div className={`a18-die-wrap ${showOverlay ? 'dimmed' : ''}`}>
            <img src={chip18proImg} alt="A18 Pro Die Map" />
            <div className={`a18-block ${activeIndex === 0 ? 'active' : ''}`} id="b-neural" onMouseEnter={() => setHoverIndex(0)} onMouseLeave={() => setHoverIndex(null)}></div>
            <div className={`a18-block ${activeIndex === 1 ? 'active' : ''}`} id="b-gpu" onMouseEnter={() => setHoverIndex(1)} onMouseLeave={() => setHoverIndex(null)}></div>
            <div className={`a18-block ${activeIndex === 2 ? 'active' : ''}`} id="b-cpu" onMouseEnter={() => setHoverIndex(2)} onMouseLeave={() => setHoverIndex(null)}></div>
            <div className={`a18-block ${activeIndex === 3 ? 'active' : ''}`} id="b-isp" onMouseEnter={() => setHoverIndex(3)} onMouseLeave={() => setHoverIndex(null)}></div>
          </div>

          <div className="a18-spec-panel">
            <div className={`a18-spec-block ${activeIndex === 0 ? 'active' : ''}`}>
              <div className="tag">16-CORE</div>
              <h3>Neural Engine</h3>
              <ul><li>Nhanh hÆ¡n 15% so vá»›i tháº¿ há»‡ trÆ°á»›c</li><li>Tá»‘i Æ°u Ä‘áº·c biá»‡t cho Apple Intelligence</li></ul>
            </div>
            <div className={`a18-spec-block ${activeIndex === 1 ? 'active' : ''}`}>
              <div className="tag">6-CORE</div>
              <h3>GPU cáº¥p Ä‘á»™ Pro</h3>
              <ul><li>Nhanh hÆ¡n 20%</li><li>Há»— trá»£ Ray Tracing tá»‘c Ä‘á»™ cao</li></ul>
            </div>
            <div className={`a18-spec-block ${activeIndex === 2 ? 'active' : ''}`}>
              <div className="tag">6-CORE</div>
              <h3>CPU cá»±c máº¡nh máº½</h3>
              <ul><li>Nhanh hÆ¡n 15%, tiáº¿t kiá»‡m pin 20%</li><li>Xá»­ lÃ½ tÃ¡c vá»¥ náº·ng mÆ°á»£t mÃ </li></ul>
            </div>
            <div className={`a18-spec-block ${activeIndex === 3 ? 'active' : ''}`}>
              <div className="tag">ADVANCED</div>
              <h3>Bá»™ xá»­ lÃ½ hÃ¬nh áº£nh</h3>
              <ul><li>Xá»­ lÃ½ dá»¯ liá»‡u video nhanh gáº¥p 2 láº§n</li><li>Má»Ÿ khÃ³a kháº£ nÄƒng Camera Control</li></ul>
            </div>
          </div>

          <div className={`a18-stage-hud ${showOverlay ? 'show' : ''}`}>
            <div className="ticks">
              <div className={`tick ${activeIndex === 0 ? 'active' : ''}`}><div className="sw"></div>Neural</div>
              <div className={`tick ${activeIndex === 1 ? 'active' : ''}`}><div className="sw"></div>GPU</div>
              <div className={`tick ${activeIndex === 2 ? 'active' : ''}`}><div className="sw"></div>CPU</div>
              <div className={`tick ${activeIndex === 3 ? 'active' : ''}`}><div className="sw"></div>ISP</div>
            </div>
          </div>
        </div>
      </div>

      <section className="a18-outro">
        <h2>Sá»©c máº¡nh Pro Ä‘Ã­ch thá»±c.</h2>
        <p>Tráº£i nghiá»‡m má»™t chuáº©n má»±c má»›i vá» tá»‘c Ä‘á»™ vÃ  sá»©c máº¡nh vá»›i A18 Pro, giÃºp iPhone 16 Pro Max bá»©t phÃ¡ má»i ranh giá»›i cá»§a cÃ´ng nghá»‡.</p>
      </section>
    </div>
  );
}
