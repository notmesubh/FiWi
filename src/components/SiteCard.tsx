import React from 'react';
import {ArrowUpRight, Bookmark, Heart, Globe, Trash2} from 'lucide-react';
import type {SubmittedSite} from '../types/fiwi';

export interface SiteCardProps {
  site: SubmittedSite;
  isSaved?: boolean;
  onSelect: (site: SubmittedSite) => void;
  onToggleLike?: (site: SubmittedSite) => void;
  onToggleSave?: (site: SubmittedSite) => void;
  onDelete?: (site: SubmittedSite) => void;
  canDelete?: boolean;
  className?: string;
  aspectRatio?: string;
}

export const SiteCard: React.FC<SiteCardProps> = ({
  site,
  isSaved = false,
  onSelect,
  onToggleLike,
  onToggleSave,
  onDelete,
  canDelete = false,
  className = '',
  aspectRatio = 'aspect-[16/10]',
}) => {
  const heroThumb =
    site.media?.hero?.previewUrl ||
    site.media?.hero?.publicUrl ||
    site.thumbnailUrl ||
    site.screenshotUrl ||
    null;

  const subLabel = site.subCategory || site.customSubCategory;
  const domain = site.url ? site.url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0] : '';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(site)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(site);
        }
      }}
      className={`group flex flex-col text-left cursor-pointer transition-transform duration-200 focus:outline-none ${className}`}
    >
      {/* Thumbnail Container: ONLY the thumbnail is visible here */}
      <div
        className={`w-full ${aspectRatio} rounded-2xl overflow-hidden bg-[#0A0D28]/30 dark:bg-white/[0.03] border border-[#02031A]/10 dark:border-white/12 group-hover:border-[#02031A]/30 dark:group-hover:border-white/30 group-hover:shadow-lg transition-all duration-300 relative`}
      >
        {heroThumb ? (
          <img
            src={heroThumb}
            alt={site.title}
            loading="lazy"
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1020F5]/5 to-transparent text-[#02031A]/40 dark:text-white/30">
            <Globe className="w-8 h-8 mb-2 stroke-[1.5]" />
            <span className="mono text-[11px] truncate max-w-[80%] font-medium">
              {domain || 'fiwi.net'}
            </span>
          </div>
        )}
      </div>

      {/* Details BELOW the card, not on it */}
      <div className="mt-2.5 flex items-start justify-between gap-2 px-1">
        <div className="min-w-0 flex-1">
          <div className="font-display text-[17px] sm:text-[18px] font-semibold text-[#02031A] dark:text-white truncate group-hover:text-[#1020F5] dark:group-hover:text-[#60A5FA] transition-colors leading-tight">
            {site.title}
          </div>
          <div className="mono text-[11px] uppercase tracking-[0.06em] text-[#02031A]/60 dark:text-white/50 truncate mt-1">
            {subLabel ? `${site.category} · ${subLabel}` : site.category}
            {site.authorHandle ? ` · ${site.authorHandle}` : ''}
          </div>
        </div>

        {/* Quick action buttons neatly aligned on the right */}
        <div className="flex items-center gap-0.5 shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
          {onToggleLike && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(site);
              }}
              aria-label={`Like ${site.title} (${site.likesCount || 0})`}
              className={`p-1 cursor-pointer inline-flex items-center gap-0.5 text-[11px] mono tabular-nums transition-colors ${
                site.viewerHasLiked
                  ? 'text-[#DC2626]'
                  : 'text-[#02031A]/50 dark:text-white/50 hover:text-[#DC2626]'
              }`}
            >
              <Heart
                className="w-3.5 h-3.5"
                fill={site.viewerHasLiked ? 'currentColor' : 'none'}
              />
              {(site.likesCount ?? 0) > 0 && <span>{site.likesCount}</span>}
            </button>
          )}

          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(site);
              }}
              aria-label={isSaved ? `Remove ${site.title} from saved` : `Save ${site.title}`}
              title={isSaved ? 'Saved in collections' : 'Save to collection'}
              className={`p-1 cursor-pointer transition-colors ${
                isSaved
                  ? 'text-[#1020F5] dark:text-[#60A5FA]'
                  : 'text-[#02031A]/50 dark:text-white/50 hover:text-[#1020F5] dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          )}

          {canDelete && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(site);
              }}
              aria-label={`Remove ${site.title}`}
              className="p-1 text-[#02031A]/50 dark:text-white/50 hover:text-[#DC2626] cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Visit ${site.title}`}
            className="p-1 text-[#02031A]/60 dark:text-white/60 hover:text-[#1020F5] dark:hover:text-[#60A5FA] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
