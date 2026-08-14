import React from 'react';
import cameraImg from '@imga/iphone/cameraiphone14promax.png';

export default function VisionCamera({ scrollProgress = 0 }) {
  // Global progress for Vision scene is now [0.35, 0.70] based on the parent component's thresholds.
  const localProgress = Math.max(0, Math.min(1, (scrollProgress - 0.35) / 0.35));

  const isIntroVisible = localProgress < 0.30;
  const isImageVisible = localProgress >= 0.25;

  // Animation thresholds for features
  const showF1 = localProgress >= 0.40;
  const showF2 = localProgress >= 0.55;
  const showF3 = localProgress >= 0.70;
  const showF4 = localProgress >= 0.80;
  const showF5 = localProgress >= 0.90;

  return (
    <>
      {/* --- LAYER 1: IMAGE (Multiplied with Background) --- */}
      <div 
        className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none" 
        style={{ zIndex: 10 }}
      >
        <div className={`vision-frame ${isImageVisible ? 'active' : ''}`}>
          <img src={cameraImg} alt="Vision Camera" />
        </div>
      </div>

      {/* --- LAYER 2: UI & LABELS (Normal Blending) --- */}
      <div className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden pointer-events-none">
        <style>{`
          .vision-frame {
            position: relative;
            width: 100vw;
            max-width: 1080px;
            aspect-ratio: 454 / 301;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 1s ease;
          }
          .vision-frame img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: contain;
            -webkit-mask-image: radial-gradient(ellipse at center, black 50%, transparent 75%);
            mask-image: radial-gradient(ellipse at center, black 50%, transparent 75%);
          }
          .vision-frame.active {
            opacity: 1;
          }

          .intro-text {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 30;
            opacity: 0;
            transition: opacity 0.8s ease;
            pointer-events: none;
            width: 100%;
            padding: 0 20px;
          }
          .intro-text.active {
            opacity: 1;
          }
          .intro-text .eyebrow {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: rgba(245,245,244,0.32);
            margin-bottom: 18px;
          }
          .intro-text h2 {
            font-size: clamp(30px, 5.5vw, 58px);
            font-weight: 800;
            letter-spacing: -0.02em;
            line-height: 1.08;
            color: #f5f5f4;
            max-width: 16ch;
            margin: 0 auto;
          }
          .intro-text p {
            margin: 18px auto 0;
            color: rgba(245,245,244,0.55);
            max-width: 44ch;
            font-size: 15.5px;
            line-height: 1.6;
          }
          .intro-text .scroll-cue {
            margin-top: 44px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            letter-spacing: 0.14em;
            color: rgba(245,245,244,0.32);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
          .intro-text .scroll-cue .bar {
            width: 1px; height: 32px;
            background: rgba(255,255,255,0.14);
            position: relative; overflow: hidden;
          }
          .intro-text .scroll-cue .bar::after {
            content: ""; position: absolute; left: 0; top: -100%; width: 100%; height: 100%;
            background: linear-gradient(rgba(245,245,244,0.55), transparent);
            animation: dropline 1.7s ease-in-out infinite;
          }
          @keyframes dropline{ 0%{top:-100%;} 60%{top:100%;} 100%{top:100%;} }

          /* Camera Spec Cards */
          .spec-container {
            position: absolute;
            inset: 0;
            z-index: 20;
            pointer-events: none;
          }
          .spec-card {
            position: absolute;
            color: #f5f5f4;
            max-width: 260px;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .spec-card.active {
            opacity: 1;
            transform: translateY(0);
          }
          .spec-card h3 {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #E87B2C;
            display: flex;
            align-items: center;
            gap: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .spec-card h3::before {
            content: '';
            display: block;
            width: 6px;
            height: 6px;
            background: #E87B2C;
            border-radius: 50%;
            box-shadow: 0 0 10px #E87B2C, 0 0 20px #E87B2C;
            flex-shrink: 0;
          }
          .spec-card p {
            font-size: 14px;
            color: rgba(255,255,255,0.65);
            line-height: 1.5;
            margin: 0;
            font-weight: 300;
          }
          
          .spec-card.left-align h3 { flex-direction: row-reverse; }
          .spec-card.center-align h3 { justify-content: center; }
          .spec-card.center-align h3::before { display: none; }
          .spec-card.center-align p { text-align: center; }
          
          /* Positioning */
          .pos-f1 { top: 25%; right: 10%; text-align: left; }
          .pos-f1 h3 { flex-direction: row; }
          
          .pos-f2 { bottom: 25%; right: 10%; text-align: left; }
          
          .pos-f3 { top: 25%; left: 10%; text-align: right; }
          
          .pos-f4 { bottom: 25%; left: 10%; text-align: right; }
          
          .pos-f5 { bottom: 10%; left: 50%; transform: translate(-50%, 20px); width: 320px; }
          .pos-f5.active { transform: translate(-50%, 0); }

          @media (max-width: 768px) {
            .spec-card { max-width: 140px; }
            .spec-card h3 { font-size: 11px; gap: 6px; margin-bottom: 4px; }
            .spec-card p { font-size: 10px; line-height: 1.3; }
            .pos-f1 { top: 15%; right: 5%; }
            .pos-f2 { bottom: 25%; right: 5%; }
            .pos-f3 { top: 15%; left: 5%; }
            .pos-f4 { bottom: 25%; left: 5%; }
            .pos-f5 { bottom: 8%; width: 220px; }
            .pos-f5 h3 { font-size: 14px; }
          }
        `}</style>

        {/* Intro Text Overlay */}
        <div className={`intro-text ${isIntroVisible ? 'active' : ''}`}>
          <h2>iPhone 14 Pro Max:<br/>Nâng tầm chuẩn mực chụp ảnh.</h2>
          <p>Khám phá sức mạnh của cảm biến 48MP mới và tính năng quay Cinematic 4K. Chế độ Action mode siêu ổn định và quay ProRes cho trải nghiệm chuyên nghiệp.</p>
          <div className="scroll-cue"><div className="bar"></div>CUỘN XUỐNG</div>
        </div>

        {/* Specifications Overlays */}
        <div className="spec-container">
          {/* Feature 1: Camera Chính 48MP */}
          <div className={`spec-card pos-f1 ${showF1 ? 'active' : ''}`}>
            <h3>Camera chính 48MP</h3>
            <p>Cảm biến Quad-pixel tiên tiến, độ phân giải gấp 4 lần.</p>
          </div>

          {/* Feature 2: Zoom quang 3x */}
          <div className={`spec-card pos-f2 ${showF2 ? 'active' : ''}`}>
            <h3>Zoom quang học 3x</h3>
            <p>Ống kính Telephoto hỗ trợ thu phóng quang học 3x.</p>
          </div>

          {/* Feature 3: Camera Trước 12MP */}
          <div className={`spec-card pos-f3 left-align ${showF3 ? 'active' : ''}`}>
            <h3>Camera Trước 12MP</h3>
            <p>Tự động lấy nét, cho những bức ảnh selfie sáng và rõ nét.</p>
          </div>

          {/* Feature 4: Quay video 4K HDR */}
          <div className={`spec-card pos-f4 left-align ${showF4 ? 'active' : ''}`}>
            <h3>Quay video 4K HDR</h3>
            <p>Chế độ Điện ảnh chuẩn 4K HDR.</p>
          </div>

          {/* Feature 5: Photonic Engine */}
          <div className={`spec-card pos-f5 center-align ${showF5 ? 'active' : ''}`}>
            <h3 className="text-[#E87B2C] font-black text-xl">Photonic Engine</h3>
            <p>Tối ưu hóa ánh sáng yếu xuất sắc, màu sắc chân thực.</p>
          </div>
        </div>
      </div>
    </>
  );
}


