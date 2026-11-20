import AiStudioGoogle from '@thesvg/react/ai-studio-google';
import Bolt from '@thesvg/react/bolt';
import ClaudeAi from '@thesvg/react/claude-ai';
import Cursor from '@thesvg/react/cursor';
import GithubCopilot from '@thesvg/react/github-copilot';
import GoogleAntigravity from '@thesvg/react/google-antigravity';
import GoogleGemini from '@thesvg/react/google-gemini';
import Lovable from '@thesvg/react/lovable';
import Openai from '@thesvg/react/openai';
import Replit from '@thesvg/react/replit';
import V0Vercel from '@thesvg/react/v0-vercel';
import Windsurf from '@thesvg/react/windsurf';
import {
  type AiBrandLogoId,
  type BrandToolOption,
  type SubmitCategoryId,
} from './submitData';

interface BrandLogoBadgeProps {
  tool: BrandToolOption;
  size?: 'sm' | 'md';
  inverted?: boolean;
}

function renderAiBrandSvg(
  brandLogoId: AiBrandLogoId,
  size: 'sm' | 'md',
  inverted: boolean,
  name: string,
) {
  const squareClass = size === 'sm' ? 'w-4 h-4' : 'w-[19px] h-[19px]';
  const wideClass = size === 'sm' ? 'w-[22px] h-3' : 'w-[26px] h-[14px]';
  const monoColor = inverted ? 'text-white' : 'text-[#0D0E12]';

  switch (brandLogoId) {
    case 'chatgpt':
      return (
        <Openai
          variant={inverted ? 'dark' : 'light'}
          aria-label={name}
          className={`${squareClass} ${monoColor}`}
        />
      );
    case 'claude':
      return <ClaudeAi aria-label={name} className={squareClass} />;
    case 'cursor':
      return (
        <Cursor
          variant={inverted ? 'dark' : 'light'}
          aria-label={name}
          className={`${squareClass} ${monoColor}`}
        />
      );
    case 'windsurf':
      return (
        <Windsurf
          variant={inverted ? 'dark' : 'light'}
          aria-label={name}
          className={squareClass}
        />
      );
    case 'lovable':
      return <Lovable aria-label={name} className={squareClass} />;
    case 'bolt':
      return (
        <Bolt
          variant={inverted ? 'dark' : 'light'}
          aria-label={name}
          className={wideClass}
        />
      );
    case 'v0':
      return (
        <V0Vercel
          aria-label={name}
          className={`${squareClass} ${monoColor}`}
        />
      );
    case 'replit':
      return <Replit aria-label={name} className={squareClass} />;
    case 'google-ai-studio':
      return (
        <AiStudioGoogle
          aria-label={name}
          className={`${squareClass} ${inverted ? 'text-white' : 'text-[#1A73E8]'}`}
        />
      );
    case 'antigravity':
      return <GoogleAntigravity aria-label={name} className={squareClass} />;
    case 'github-copilot':
      return (
        <GithubCopilot
          variant={inverted ? 'dark' : 'light'}
          aria-label={name}
          className={`${squareClass} ${monoColor}`}
        />
      );
    case 'gemini':
      return <GoogleGemini aria-label={name} className={squareClass} />;
  }
}

export function BrandLogoBadge({
  tool,
  size = 'md',
  inverted = false,
}: BrandLogoBadgeProps) {
  const boxClass = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const svgClass = size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]';
  const containerStyle = inverted
    ? 'bg-white/15 border-white/25'
    : 'bg-white border-[#02031A]/10 shadow-[0_2px_6px_-2px_rgba(2,3,26,0.08)]';

  if (tool.brandLogoId) {
    return (
      <span
        title={tool.name}
        aria-label={`${tool.name} logo`}
        className={`${boxClass} rounded-[8px] border flex items-center justify-center shrink-0 transition-colors ${containerStyle}`}
      >
        {renderAiBrandSvg(tool.brandLogoId, size, inverted, tool.name)}
      </span>
    );
  }

  if (tool.icon) {
    const rawHex = `#${tool.icon.hex}`;
    const isVeryDark =
      tool.icon.hex.toUpperCase() === '000000' ||
      tool.icon.hex.toUpperCase() === '181717' ||
      tool.icon.hex.toUpperCase() === '111827';
    const fillColor = inverted && isVeryDark ? '#FFFFFF' : rawHex;

    return (
      <span
        title={tool.name}
        aria-label={`${tool.name} logo`}
        className={`${boxClass} rounded-[8px] border flex items-center justify-center shrink-0 transition-colors ${containerStyle}`}
      >
        <svg
          role="img"
          aria-label={tool.name}
          viewBox="0 0 24 24"
          className={svgClass}
          fill={fillColor}
        >
          <path d={tool.icon.path} />
        </svg>
      </span>
    );
  }

  return (
    <span
      title={tool.name}
      aria-label={tool.name}
      className={`${boxClass} rounded-[8px] border flex items-center justify-center shrink-0 mono font-semibold tracking-[-0.02em] ${
        size === 'sm' ? 'text-[9px]' : 'text-[10px]'
      } ${
        inverted
          ? 'bg-white/15 border-white/25 text-white'
          : 'bg-[#F4F6FA] border-[#02031A]/12 text-[#02031A]/75'
      }`}
    >
      {tool.monogram ?? tool.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

interface CategoryCardIconProps {
  category: SubmitCategoryId;
  selected: boolean;
}

export function CategoryCardIcon({category, selected}: CategoryCardIconProps) {
  const strokeMain = selected ? '#FFFFFF' : '#02031A';
  const accentFill = selected ? '#CFE0FF' : '#1020F5';

  return (
    <span
      aria-hidden="true"
      className={`w-11 h-11 rounded-[10px] border flex items-center justify-center shrink-0 transition-all duration-200 ${
        selected
          ? 'bg-[#1020F5] border-[#1020F5] shadow-[0_10px_24px_-8px_rgba(16,32,245,0.55)]'
          : 'bg-white/90 border-[#02031A]/12 group-hover:border-[#1020F5]/40'
      }`}
    >
      {category === 'Normal' && (
        <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none">
          <rect
            x="3.5"
            y="5"
            width="21"
            height="18"
            rx="2.5"
            stroke={strokeMain}
            strokeWidth="1.8"
          />
          <path d="M3.5 10H24.5" stroke={strokeMain} strokeWidth="1.6" />
          <circle cx="6.8" cy="7.5" r="0.9" fill={accentFill} />
          <circle cx="9.6" cy="7.5" r="0.9" fill={accentFill} />
          <rect
            x="7"
            y="13.5"
            width="6"
            height="6"
            rx="1"
            fill={accentFill}
            fillOpacity="0.22"
            stroke={accentFill}
            strokeWidth="1.4"
          />
          <path
            d="M15.5 14.5H21M15.5 18H19.5"
            stroke={strokeMain}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}

      {category === 'Vibecoded' && (
        <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none">
          <path
            d="M14 3.5L16.4 10.6L23.5 13L16.4 15.4L14 22.5L11.6 15.4L4.5 13L11.6 10.6L14 3.5Z"
            stroke={strokeMain}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M21 19L21.9 21.6L24.5 22.5L21.9 23.4L21 26L20.1 23.4L17.5 22.5L20.1 21.6L21 19Z"
            fill={accentFill}
          />
          <circle cx="6.5" cy="6.5" r="1.4" fill={accentFill} />
        </svg>
      )}

      {category === 'Test' && (
        <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none">
          <path
            d="M14 3.5L22.5 7V13.4C22.5 18.7 18.8 22.9 14 24.5C9.2 22.9 5.5 18.7 5.5 13.4V7L14 3.5Z"
            stroke={strokeMain}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M10.2 14.2L12.9 16.9L18.2 11.4"
            stroke={accentFill}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {category === 'Connect' && (
        <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none">
          <circle cx="8.5" cy="9" r="3.2" stroke={strokeMain} strokeWidth="1.8" />
          <circle cx="19.5" cy="9" r="3.2" stroke={strokeMain} strokeWidth="1.8" />
          <circle
            cx="14"
            cy="19.5"
            r="3.2"
            stroke={accentFill}
            strokeWidth="1.9"
          />
          <path
            d="M11.6 9.8L16.4 9.8M10 11.8L12.5 16.6M18 11.8L15.5 16.6"
            stroke={strokeMain}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}
