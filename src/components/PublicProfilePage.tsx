import {useEffect, useState} from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  FolderOpen,
  Globe,
  Heart,
  Loader2,
  Settings,
} from 'lucide-react';
import {fiwiApi} from '../lib/api';
import {SiteCard} from './SiteCard';
import type {
  PersonalCollection,
  PublicProfile,
  SubmittedSite,
} from '../types/fiwi';

interface PublicProfilePageProps {
  username: string;
  viewerUserId?: string | null;
  onBack: () => void;
  onOpenSite: (site: SubmittedSite) => void;
  onOpenCollection: (slugOrId: string) => void;
  onOpenSettings: () => void;
  onToggleSaveSite: (site: SubmittedSite) => void;
  isSiteSaved: (site: SubmittedSite) => boolean;
}

export default function PublicProfilePage({
  username,
  onBack,
  onOpenSite,
  onOpenCollection,
  onOpenSettings,
  onToggleSaveSite,
  isSiteSaved,
}: PublicProfilePageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [websites, setWebsites] = useState<SubmittedSite[]>([]);
  const [collections, setCollections] = useState<PersonalCollection[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fiwiApi
      .getPublicProfile(username)
      .then((res) => {
        if (!active) return;
        setProfile(res.profile);
        setIsOwner(res.isOwner);
        setWebsites(res.websites);
        setCollections(res.collections);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load creator profile.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [username]);

  const socialEntries = profile
    ? [
        {label: 'Website', href: profile.socialLinks.website},
        {label: 'GitHub', href: profile.socialLinks.github},
        {label: 'X / Twitter', href: profile.socialLinks.x},
        {label: 'LinkedIn', href: profile.socialLinks.linkedin},
      ].filter((item): item is {label: string; href: string} => Boolean(item.href))
    : [];

  return (
    <div className="relative z-[2] mt-[52px] mb-24 w-full max-w-[1200px] flex flex-col items-center text-center">
      <div className="w-full flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="btn h-[40px] px-4 btn-square bg-white/85 text-[#02031A] hover:bg-white text-[13px] inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to library</span>
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="btn h-[40px] px-4 btn-square bg-[#02031A] text-white hover:bg-[#1020F5] text-[13px] inline-flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Edit profile</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="glass fiwi-auth-card w-full p-12 flex flex-col items-center justify-center gap-3 min-h-[300px]">
          <Loader2 className="w-6 h-6 animate-spin text-[#1020F5]" />
          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/70">
            Loading creator profile...
          </span>
        </div>
      ) : error || !profile ? (
        <div className="glass fiwi-auth-card w-full max-w-[620px] p-8 text-center">
          <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#991B1B] font-semibold">
            Profile unavailable
          </div>
          <h1 className="mt-2 font-display text-[40px] font-medium leading-none text-[#02031A]">
            @{username}
          </h1>
          <p className="mt-3 text-[14.5px] text-[#02031A]/75">
            {error ?? 'We could not find this FiWi member profile.'}
          </p>
        </div>
      ) : (
        <>
          {/* Creator Header Card */}
          <div className="glass fiwi-auth-card w-full p-6 sm:p-8 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover border border-[#02031A]/15 bg-white shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#02031A] text-white font-display text-[32px] font-semibold flex items-center justify-center shrink-0">
                    {(profile.displayName || profile.username || 'F').slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#1020F5] font-semibold">
                      {profile.handle}
                    </span>
                    <span className="mono text-[10px] uppercase tracking-[0.08em] px-2 py-0.5 border border-[#02031A]/15 bg-white/75 text-[#02031A]/80">
                      {profile.plan} tier
                    </span>
                  </div>
                  <h1 className="mt-1 font-display text-[42px] sm:text-[54px] font-semibold leading-[0.95] tracking-[-0.015em] text-[#02031A] break-words">
                    {profile.displayName}
                  </h1>
                  {profile.bio && (
                    <p className="mt-2.5 mb-0 text-[14.5px] leading-[1.55] text-[#02031A]/80 max-w-[64ch]">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col items-start sm:items-end gap-3 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-[#02031A]/10">
                <div className="flex items-center gap-5">
                  <div>
                    <div className="mono text-[10px] uppercase tracking-[0.08em] text-[#02031A]/55">
                      Published
                    </div>
                    <div className="font-display text-[28px] font-semibold leading-none tabular-nums text-[#02031A]">
                      {websites.length}
                    </div>
                  </div>
                  <div>
                    <div className="mono text-[10px] uppercase tracking-[0.08em] text-[#02031A]/55">
                      Likes received
                    </div>
                    <div className="font-display text-[28px] font-semibold leading-none tabular-nums text-[#02031A] inline-flex items-center gap-1">
                      <Heart className="w-4 h-4 text-[#1020F5]" />
                      <span>{profile.likesReceived}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {socialEntries.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#02031A]/12 flex flex-wrap items-center gap-2.5">
                {socialEntries.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#02031A]/16 bg-white/75 hover:bg-white text-[12.5px] font-medium text-[#02031A]"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#1020F5]" />
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-65" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Published Websites */}
          <section aria-label="Published websites" className="w-full mt-10 text-left">
            <div className="flex items-baseline justify-between gap-2 mb-4">
              <h2 className="font-display text-[32px] font-semibold leading-none text-white">
                Approved Websites ({websites.length})
              </h2>
            </div>

            {websites.length === 0 ? (
              <div className="tile !h-auto py-8 flex-col items-start justify-center">
                <span className="mono text-[12px] uppercase tracking-[0.06em] text-[#02031A]/75">
                  No published websites yet.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {websites.map((site) => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    isSaved={isSiteSaved(site)}
                    onSelect={() => onOpenSite(site)}
                    onToggleSave={() => onToggleSaveSite(site)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Public Collections */}
          <section aria-label="Public collections" className="w-full mt-10 text-left">
            <h2 className="font-display text-[32px] font-semibold leading-none text-white mb-4">
              Public Collections ({collections.length})
            </h2>

            {collections.length === 0 ? (
              <div className="tile !h-auto py-8 flex-col items-start justify-center">
                <span className="mono text-[12px] uppercase tracking-[0.06em] text-[#02031A]/75">
                  No public collections shared by {profile.handle} yet.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px]">
                {collections.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => onOpenCollection(col.slug || col.id)}
                    className="tile !h-auto min-h-[150px] flex-col justify-between items-start text-left cursor-pointer"
                  >
                    <div className="w-full flex items-center justify-between gap-2">
                      <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#1020F5] font-semibold inline-flex items-center gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5" />
                        Public collection
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-[#02031A]/75" />
                    </div>
                    <div className="w-full mt-4">
                      <div className="font-display text-[28px] font-semibold leading-none text-[#02031A] truncate">
                        {col.name}
                      </div>
                      {col.description && (
                        <p className="mt-1.5 mb-0 text-[13px] text-[#02031A]/75 line-clamp-2">
                          {col.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
