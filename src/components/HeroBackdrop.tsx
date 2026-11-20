import {memo} from 'react';

interface HeroBackdropProps {
  idPrefix?: string;
  variant?: 'hero' | 'pricing';
}

const CLOUD_PUFF_BG =
  'radial-gradient(closest-side, rgba(255,255,255,0.94) 0%, rgba(226,238,255,0.72) 52%, rgba(191,214,255,0) 100%)';

const CLOUD_MIST_BG =
  'radial-gradient(closest-side, rgba(242,247,255,0.85) 0%, rgba(191,214,255,0.45) 58%, rgba(191,214,255,0) 100%)';

const HeroBackdrop = memo(function HeroBackdrop({
  variant = 'hero',
}: HeroBackdropProps) {
  const isPricing = variant === 'pricing';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-0 [transform:translate3d(0,0,0)] [contain:strict]"
    >
      {/* Radial radar rays */}
      <div
        className={`fiwi-radar-rays pointer-events-none absolute left-1/2 -ml-[480px] w-[960px] h-[960px] rounded-full ${
          isPricing ? 'top-[20px]' : 'top-[60px]'
        }`}
      />

      {/* Concentric radar rings */}
      <div
        className={`fiwi-radar-rings pointer-events-none absolute left-1/2 -ml-[620px] w-[1240px] h-[1240px] rounded-full ${
          isPricing ? '-top-[80px]' : '-top-[40px]'
        }`}
      />

      {/* Cloud 1 — left mid (pure radial gradients to avoid SVG feGaussianBlur backdrop tearing) */}
      <div
        className={`pointer-events-none absolute -left-[220px] w-[580px] h-[300px] opacity-80 ${
          isPricing ? 'top-[225px]' : 'top-[285px]'
        }`}
      >
        <div
          className="absolute left-[5%] top-[36%] w-[32%] h-[58%] rounded-full"
          style={{background: CLOUD_PUFF_BG}}
        />
        <div
          className="absolute left-[18%] top-[10%] w-[42%] h-[78%] rounded-full"
          style={{background: CLOUD_PUFF_BG}}
        />
        <div
          className="absolute left-[38%] top-[20%] w-[38%] h-[72%] rounded-full"
          style={{background: CLOUD_PUFF_BG}}
        />
        <div
          className="absolute left-[58%] top-[40%] w-[28%] h-[52%] rounded-full"
          style={{background: CLOUD_PUFF_BG}}
        />
        <div
          className="absolute left-[4%] top-[54%] w-[92%] h-[42%] rounded-full"
          style={{background: CLOUD_MIST_BG}}
        />
      </div>

      {/* Cloud 2 — right upper */}
      <div
        className={`pointer-events-none absolute -right-[240px] w-[620px] h-[300px] opacity-75 -scale-x-100 ${
          isPricing ? 'top-[125px]' : 'top-[155px]'
        }`}
      >
        <div
          className="absolute left-[6%] top-[36%] w-[30%] h-[56%] rounded-full"
          style={{background: CLOUD_PUFF_BG}}
        />
        <div
          className="absolute left-[20%] top-[8%] w-[40%] h-[76%] rounded-full"
          style={{background: CLOUD_PUFF_BG}}
        />
        <div
          className="absolute left-[40%] top-[18%] w-[40%] h-[74%] rounded-full"
          style={{background: CLOUD_PUFF_BG}}
        />
        <div
          className="absolute left-[60%] top-[38%] w-[30%] h-[56%] rounded-full"
          style={{background: CLOUD_PUFF_BG}}
        />
        <div
          className="absolute left-[4%] top-[54%] w-[92%] h-[42%] rounded-full"
          style={{background: CLOUD_MIST_BG}}
        />
      </div>

      {/* Cloud 3 — right lower */}
      <div
        className={`pointer-events-none absolute -right-[110px] w-[390px] h-[220px] opacity-60 ${
          isPricing ? 'top-[525px]' : 'top-[585px]'
        }`}
      >
        <div
          className="absolute left-[10%] top-[30%] w-[36%] h-[62%] rounded-full"
          style={{background: CLOUD_PUFF_BG}}
        />
        <div
          className="absolute left-[30%] top-[10%] w-[44%] h-[78%] rounded-full"
          style={{background: CLOUD_PUFF_BG}}
        />
        <div
          className="absolute left-[54%] top-[34%] w-[34%] h-[58%] rounded-full"
          style={{background: CLOUD_PUFF_BG}}
        />
        <div
          className="absolute left-[6%] top-[56%] w-[88%] h-[40%] rounded-full"
          style={{background: CLOUD_MIST_BG}}
        />
      </div>

      {/* Cloud 4 — left lower */}
      <div
        className={`pointer-events-none absolute -left-[120px] w-[370px] h-[220px] opacity-55 -scale-x-100 ${
          isPricing ? 'top-[545px]' : 'top-[605px]'
        }`}
      >
        <div
          className="absolute left-[10%] top-[30%] w-[36%] h-[62%] rounded-full"
          style={{background: CLOUD_PUFF_BG}}
        />
        <div
          className="absolute left-[30%] top-[10%] w-[44%] h-[78%] rounded-full"
          style={{background: CLOUD_PUFF_BG}}
        />
        <div
          className="absolute left-[54%] top-[34%] w-[34%] h-[58%] rounded-full"
          style={{background: CLOUD_PUFF_BG}}
        />
        <div
          className="absolute left-[6%] top-[56%] w-[88%] h-[40%] rounded-full"
          style={{background: CLOUD_MIST_BG}}
        />
      </div>
    </div>
  );
});

export default HeroBackdrop;
