import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Edit3,
  FileEdit,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import {fiwiApi} from '../lib/api';
import {useFiwiStore} from '../stores/useFiwiStore';
import type {SubmissionStatus, WebsiteSubmissionRecord} from '../types/fiwi';

interface MySubmissionsSectionProps {
  submissions: WebsiteSubmissionRecord[];
  onStartNew: () => void;
  onEditSubmission: (submission: WebsiteSubmissionRecord) => void;
  onBack: () => void;
}

const STATUS_META: Record<
  SubmissionStatus,
  {label: string; toneClass: string; Icon: typeof Clock}
> = {
  draft: {
    label: 'Draft',
    toneClass: 'bg-[#F4F6FA] text-[#02031A] border-[#02031A]/18',
    Icon: FileEdit,
  },
  pending: {
    label: 'Pending Review',
    toneClass: 'bg-[#EEF2FF] text-[#1020F5] border-[#1020F5]/30',
    Icon: Clock,
  },
  approved: {
    label: 'Published',
    toneClass: 'bg-[#ECFDF5] text-[#166534] border-[#16A34A]/35',
    Icon: CheckCircle2,
  },
  under_review: {
    label: 'Under Review',
    toneClass: 'bg-[#FFFBEB] text-[#B45309] border-[#F59E0B]/35',
    Icon: Clock,
  },
  changes_requested: {
    label: 'Changes Requested',
    toneClass: 'bg-[#FFF7ED] text-[#C2410C] border-[#EA580C]/35',
    Icon: AlertCircle,
  },
  rejected: {
    label: 'Needs Changes',
    toneClass: 'bg-[#FEF2F2] text-[#991B1B] border-[#B91C1C]/35',
    Icon: XCircle,
  },
};

export default function MySubmissionsSection({
  submissions,
  onStartNew,
  onEditSubmission,
  onBack,
}: MySubmissionsSectionProps) {
  const openConfirm = useFiwiStore((s) => s.openConfirm);
  const pushToast = useFiwiStore((s) => s.pushToast);
  const refreshUserWorkspace = useFiwiStore((s) => s.refreshUserWorkspace);

  const handleDelete = (sub: WebsiteSubmissionRecord) => {
    openConfirm({
      title: 'Delete submission?',
      message: `Remove "${sub.title}" (${STATUS_META[sub.status].label})? This action cannot be undone.`,
      confirmLabel: 'Delete submission',
      destructive: true,
      onConfirm: async () => {
        try {
          await fiwiApi.deleteSubmission(sub.id);
          await refreshUserWorkspace();
          pushToast({title: 'Submission deleted', tone: 'info'});
        } catch (err) {
          pushToast({
            title: 'Delete failed',
            description: err instanceof Error ? err.message : 'Unable to delete submission.',
            tone: 'error',
          });
        }
      },
    });
  };

  return (
    <div className="relative z-[2] mt-[52px] mb-24 w-full max-w-[960px] flex flex-col items-center text-center">
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="btn h-[40px] px-4 btn-square bg-white/85 text-[#02031A] hover:bg-white text-[13px] inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onStartNew}
          className="btn h-[40px] px-5 bg-[#02031A] text-white hover:bg-[#1020F5] text-[13px] inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New submission</span>
        </button>
      </div>

      <h1 className="font-display text-[52px] sm:text-[68px] font-medium leading-[0.95] tracking-[-0.015em] text-white">
        My submissions.
      </h1>
      <p className="mt-2.5 max-w-[560px] text-[16px] text-white/90 font-medium">
        Resume saved drafts, check moderation status, or revise listings after feedback.
      </p>

      <div className="fiwi-submit-glass w-full mt-7 p-5 sm:p-7 text-left">
        {submissions.length === 0 ? (
          <div className="py-10 text-center">
            <div className="font-display text-[28px] font-semibold text-[#02031A]">
              No submissions yet
            </div>
            <p className="mt-1.5 text-[14px] text-[#02031A]/70">
              Submit a website to Normal, Vibecoded, Connect, or Test, or save a draft anytime.
            </p>
            <button
              type="button"
              onClick={onStartNew}
              className="mt-4 btn h-[42px] px-6 bg-[#02031A] text-white hover:bg-[#1020F5] text-[14px]"
            >
              Start submission
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => {
              const meta = STATUS_META[sub.status];
              const StatusIcon = meta.Icon;
              const canEdit = sub.status !== 'approved';
              return (
                <div
                  key={sub.id}
                  className="bg-white border border-[#02031A]/14 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border mono text-[10.5px] uppercase tracking-[0.06em] font-semibold ${meta.toneClass}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {meta.label}
                      </span>
                      <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/60">
                        {sub.category}
                        {sub.subCategory ? ` · ${sub.subCategory}` : ''}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
                      <h2 className="font-display text-[28px] font-semibold leading-none text-[#02031A]">
                        {sub.title}
                      </h2>
                      <a
                        href={sub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[12.5px] text-[#1020F5] hover:underline break-all"
                      >
                        <span>{sub.url}</span>
                        <ArrowUpRight className="w-3 h-3 shrink-0" />
                      </a>
                    </div>

                    {sub.description && (
                      <p className="mt-1.5 mb-0 text-[13.5px] text-[#02031A]/75 line-clamp-2">
                        {sub.description}
                      </p>
                    )}

                    {sub.reviewerNotes && (
                      <div className="mt-2.5 p-2.5 bg-[#F7F9FC] border border-[#02031A]/12 text-[12.5px] text-[#02031A]/85">
                        <span className="mono text-[10px] uppercase tracking-[0.08em] text-[#02031A]/55 block mb-0.5">
                          Moderator note
                        </span>
                        {sub.reviewerNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onEditSubmission(sub)}
                        className="btn h-[38px] px-4 btn-square bg-[#02031A] text-white hover:bg-[#1020F5] text-[12.5px] inline-flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{sub.status === 'draft' ? 'Resume draft' : 'Edit'}</span>
                      </button>
                    )}
                    {sub.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(sub)}
                        aria-label={`Delete ${sub.title}`}
                        className="btn h-[38px] px-3 btn-square border border-[#B91C1C]/25 bg-white text-[#991B1B] hover:bg-[#FEF2F2] text-[12.5px] inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
