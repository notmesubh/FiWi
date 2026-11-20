import {useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ArrowRight, Check, X} from 'lucide-react';
import {
  FIWI_TRANSITION_FAST,
  FIWI_TRANSITION_REVEAL,
  FIWI_VIEWPORT,
  fiwiPanelRevealVariants,
} from '../lib/motion';

export type BillingCycle = 'monthly' | 'annually';
export type PlanId = 'free' | 'plus' | 'pro';

interface FeatureItem {
  label: string;
  emphasize?: boolean;
}

interface PricingTier {
  id: PlanId;
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  annualTotal?: string;
  periodLabel: string;
  ctaLabel: string;
  featured?: boolean;
  features: FeatureItem[];
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Explore FiWi and start building your personal collections.',
    monthlyPrice: '$0.00',
    annualPrice: '$0.00',
    periodLabel: 'Forever',
    ctaLabel: 'Start for free',
    features: [
      {label: '15 saved websites — enough to experience FiWi'},
      {label: '3 collections'},
      {label: '5 website submissions'},
      {label: 'Basic profile'},
      {label: 'Basic search and discovery'},
      {label: 'Access to All, Normal, Vibecoded, Connect and Test'},
      {label: 'Save and browse websites'},
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    badge: 'Popular',
    description: 'For creators and enthusiasts who want more.',
    monthlyPrice: '$2.99',
    annualPrice: '$2.33',
    annualTotal: '$27.99/yr',
    periodLabel: 'per month',
    ctaLabel: 'Get Plus',
    featured: true,
    features: [
      {label: '100 saved websites — suitable for regular users'},
      {label: 'Unlimited collections'},
      {label: '25 website submissions'},
      {label: 'Advanced search filters'},
      {label: 'Collection and profile analytics'},
      {label: 'Detailed Vibecoded insights'},
      {label: 'Plus profile badge'},
      {label: 'Everything in Free', emphasize: true},
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For businesses, studios and power users.',
    monthlyPrice: '$6.99',
    annualPrice: '$5.45',
    annualTotal: '$65.43/yr',
    periodLabel: 'per month',
    ctaLabel: 'Get Pro',
    features: [
      {label: '500 saved websites — for heavy researchers and creators'},
      {label: 'Everything in Plus', emphasize: true},
      {label: 'Unlimited website submissions'},
      {label: 'Priority submission reviews'},
      {label: '5 promotional credits per month'},
      {label: 'Multiple profiles'},
      {label: 'Enhanced Connect visibility'},
      {label: 'Advanced analytics'},
      {label: 'Business profile badge'},
    ],
  },
];

interface AdditionalPurchaseItem {
  id: string;
  feature: string;
  price: string;
  priceCents: number;
}

const ADDITIONAL_PURCHASES: AdditionalPurchaseItem[] = [
  {id: 'featured-7d', feature: 'Featured Website (7 days)', price: '$1.49', priceCents: 149},
  {id: 'featured-30d', feature: 'Featured Website (30 days)', price: '$3.99', priceCents: 399},
  {
    id: 'promoted-connect-7d',
    feature: 'Promoted Connect listing (7 days)',
    price: '$0.99',
    priceCents: 99,
  },
  {id: 'promoted-test-7d', feature: 'Promoted Test listing (7 days)', price: '$1.49', priceCents: 149},
  {id: 'priority-review', feature: 'Priority submission review', price: '$0.99', priceCents: 99},
  {id: 'startup-spotlight', feature: 'Startup Spotlight', price: '$3.99', priceCents: 399},
];

interface PricingSectionProps {
  variant: 'inline' | 'standalone';
  hasSkyBackground?: boolean;
  billingCycle: BillingCycle;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  selectedPlan: PlanId | null;
  currentPlan?: PlanId;
  onSelectPlan: (planId: PlanId) => void;
  onActivatePlan?: (planId: PlanId) => void;
  onOpenStandalonePricing?: () => void;
  isLoggedIn?: boolean;
  onContinueWithPlan?: (planId: PlanId) => void;
  onOpenSubmitOrAuth?: () => void;
}

export default function PricingSection({
  variant,
  hasSkyBackground = false,
  billingCycle,
  onBillingCycleChange,
  selectedPlan,
  currentPlan,
  onSelectPlan,
  onActivatePlan,
  onOpenStandalonePricing,
  isLoggedIn = false,
  onContinueWithPlan,
  onOpenSubmitOrAuth,
}: PricingSectionProps) {
  const isStandalone = variant === 'standalone';
  const onSky = isStandalone || hasSkyBackground;
  const activeTier = PRICING_TIERS.find((tier) => tier.id === selectedPlan) ?? null;

  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [purchasedAddonIds, setPurchasedAddonIds] = useState<string[]>([]);
  const [lastPurchasedReceipt, setLastPurchasedReceipt] = useState<{
    items: AdditionalPurchaseItem[];
    totalLabel: string;
  } | null>(null);

  const selectedAddons = ADDITIONAL_PURCHASES.filter((item) => selectedAddonIds.includes(item.id));
  const selectedAddonsTotalCents = selectedAddons.reduce((sum, item) => sum + item.priceCents, 0);
  const selectedAddonsTotalLabel = `$${(selectedAddonsTotalCents / 100).toFixed(2)}`;

  const handleToggleAddon = (addonId: string) => {
    setLastPurchasedReceipt(null);
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId],
    );
  };

  const handleCompleteAddonPurchase = () => {
    if (selectedAddons.length === 0) return;
    setPurchasedAddonIds((prev) => Array.from(new Set([...prev, ...selectedAddonIds])));
    setLastPurchasedReceipt({
      items: selectedAddons,
      totalLabel: selectedAddonsTotalLabel,
    });
    setSelectedAddonIds([]);
  };

  return (
    <section
      id={isStandalone ? undefined : 'pricing-section'}
      aria-labelledby="fiwi-pricing-heading"
      className={`relative z-[2] w-full max-w-[1200px] flex flex-col items-center text-center ${
        isStandalone ? 'mt-[56px] mb-20 sm:mb-24' : 'mt-2'
      }`}
    >
      <h2
        id="fiwi-pricing-heading"
        className={`font-display font-medium tracking-[-0.015em] leading-[0.96] text-balance ${
          isStandalone
            ? 'text-[56px] sm:text-[84px] lg:text-[108px] text-white'
            : onSky
              ? 'text-[48px] sm:text-[68px] lg:text-[80px] text-white'
              : 'text-[48px] sm:text-[68px] lg:text-[80px] text-[#02031A] dark:text-white'
        }`}
      >
        FiWi Pricing
      </h2>

      <p
        className={`mt-4 max-w-[600px] text-[17px] sm:text-[19px] font-medium leading-[1.45] text-balance ${
          onSky ? 'text-white/95' : 'text-[#02031A]/75 dark:text-white/75'
        }`}
      >
        Simple, transparent pricing for discovering, showcasing, and promoting websites. Start for
        free and upgrade as you grow.
      </p>

      <div
        role="group"
        aria-label="Billing interval"
        className={`flex flex-wrap sm:flex-nowrap gap-[4px] justify-center mt-8 mb-2 p-[5px] rounded-2xl sm:rounded-full w-fit max-w-full ${
          isStandalone
            ? 'glass fiwi-tabs'
            : hasSkyBackground
              ? 'fiwi-tabs-sky'
              : 'fiwi-tabs-white'
        }`}
      >
        <button
          type="button"
          aria-pressed={billingCycle === 'monthly'}
          onClick={() => onBillingCycleChange('monthly')}
          className={`btn lab tab-btn whitespace-nowrap shrink-0 px-5 sm:px-7 ${
            billingCycle === 'monthly'
              ? 'bg-[#1020F5] text-white'
              : onSky
                ? 'bg-transparent text-[#02031A]'
                : 'bg-transparent text-[#02031A] dark:text-white/80'
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          aria-pressed={billingCycle === 'annually'}
          onClick={() => onBillingCycleChange('annually')}
          className={`btn lab tab-btn whitespace-nowrap shrink-0 px-5 sm:px-7 ${
            billingCycle === 'annually'
              ? 'bg-[#1020F5] text-white'
              : onSky
                ? 'bg-transparent text-[#02031A]'
                : 'bg-transparent text-[#02031A] dark:text-white/80'
          }`}
        >
          <span>Annually</span>
          <span aria-hidden="true" className="mx-1.5 opacity-60">
            ·
          </span>
          <span
            className={
              billingCycle === 'annually'
                ? 'text-[#CFE0FF]'
                : onSky
                  ? 'text-[#1020F5]'
                  : 'text-[#1020F5] dark:text-[#93B4FF]'
            }
          >
            Save 22%
          </span>
        </button>
      </div>

      <div className="mt-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch text-left">
        {PRICING_TIERS.map((tier) => {
          const price = billingCycle === 'annually' ? tier.annualPrice : tier.monthlyPrice;
          const isSelected = selectedPlan === tier.id;
          const isFree = tier.id === 'free';
          const billingSubLabel = isFree
            ? null
            : billingCycle === 'annually'
              ? `billed annually (${tier.annualTotal})`
              : 'billed monthly';

          const cardClass = isStandalone
            ? `glass fiwi-pricing-card ${tier.featured ? 'fiwi-pricing-card--featured' : ''}`
            : hasSkyBackground
              ? `fiwi-pricing-card-sky ${tier.featured ? 'fiwi-pricing-card-sky--featured' : ''}`
              : `fiwi-pricing-card-white ${tier.featured ? 'fiwi-pricing-card-white--featured' : ''}`;

          const isCurrentPlan = isLoggedIn && currentPlan === tier.id;
          return (
            <div
              key={tier.id}
              className={`${cardClass} flex flex-col p-6 sm:p-8 ${
                isSelected ? 'ring-2 ring-[#1020F5] ring-offset-0' : ''
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3
                  className={`font-display text-[34px] font-semibold leading-none tracking-[-0.01em] ${
                    onSky ? 'text-[#02031A]' : 'text-[#02031A] dark:text-white'
                  }`}
                >
                  {tier.name}
                </h3>
                {(isCurrentPlan || tier.badge) && (
                  <span
                    className={`mono text-[11px] font-semibold uppercase tracking-[0.08em] ${
                      onSky ? 'text-[#1020F5]' : 'text-[#1020F5] dark:text-[#93B4FF]'
                    }`}
                  >
                    {isCurrentPlan ? 'Active' : tier.badge}
                  </span>
                )}
              </div>

              <p
                className={`mt-2.5 min-h-[42px] text-[14px] leading-[1.45] font-medium ${
                  onSky ? 'text-[#02031A]/75' : 'text-[#02031A]/70 dark:text-white/70'
                }`}
              >
                {tier.description}
              </p>

              <div className="mt-5 flex items-center gap-3 min-h-[56px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={`${tier.id}-${billingCycle}`}
                    initial={{opacity: 0, y: 4}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -4}}
                    transition={FIWI_TRANSITION_FAST}
                    className={`font-display text-[48px] font-semibold leading-none tracking-[-0.02em] tabular-nums inline-block ${
                      onSky ? 'text-[#02031A]' : 'text-[#02031A] dark:text-white'
                    }`}
                  >
                    {price}
                  </motion.span>
                </AnimatePresence>
                <span
                  className={`text-[12px] leading-[1.35] font-medium tabular-nums ${
                    onSky ? 'text-[#02031A]/65' : 'text-[#02031A]/65 dark:text-white/65'
                  }`}
                >
                  {tier.periodLabel}
                  {billingSubLabel && (
                    <>
                      <br />
                      {billingSubLabel}
                    </>
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectPlan(tier.id);
                  if (isLoggedIn && onActivatePlan) {
                    onActivatePlan(tier.id);
                  }
                }}
                className={`btn mt-6 h-[46px] w-full text-[16px] whitespace-nowrap ${
                  isSelected || isCurrentPlan
                    ? 'bg-[#1020F5] text-white hover:bg-[#0B18C9]'
                    : tier.featured
                      ? onSky
                        ? 'bg-[#02031A] text-white hover:bg-[#1020F5]'
                        : 'bg-[#02031A] text-white hover:bg-[#1020F5] dark:bg-white dark:text-[#02031A] dark:hover:bg-white/85'
                      : onSky
                        ? 'border border-[#02031A]/20 bg-white/80 text-[#02031A] hover:bg-white'
                        : 'border border-[#02031A]/20 bg-white/75 text-[#02031A] hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
                }`}
              >
                {isCurrentPlan
                  ? `Current plan (${tier.name})`
                  : isSelected
                    ? `${tier.name} selected`
                    : tier.ctaLabel}
              </button>

              <div
                className={`mt-6 pt-5 border-t flex-1 flex flex-col ${
                  onSky
                    ? 'border-[#02031A]/12'
                    : 'border-[#02031A]/12 dark:border-white/12'
                }`}
              >
                <ul className="m-0 p-0 list-none flex flex-col gap-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature.label}
                      className={`flex items-start gap-2.5 text-[14px] leading-[1.4] ${
                        feature.emphasize ? 'font-semibold' : 'font-normal'
                      } ${onSky ? 'text-[#02031A]/85' : 'text-[#02031A]/85 dark:text-white/85'}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`inline-flex items-center justify-center w-4 h-4 mt-0.5 rounded-full shrink-0 ${
                          onSky
                            ? 'bg-[#02031A]/12 text-[#02031A]'
                            : 'bg-[#02031A]/12 dark:bg-white/15 text-[#02031A] dark:text-white'
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                      </span>
                      <span>{feature.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {activeTier && onContinueWithPlan && (
          <motion.div
            key="selected-plan-banner"
            variants={fiwiPanelRevealVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="status"
            className={`mt-6 w-full max-w-[760px] px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left ${
              onSky
                ? 'bg-white/80 border border-white/85 text-[#02031A] backdrop-blur-md'
                : 'bg-[#F4F6FB] dark:bg-white/10 border border-[#02031A]/12 dark:border-white/15 text-[#02031A] dark:text-white'
            }`}
          >
            <div className="text-[14px] font-medium">
              <span className="font-semibold">{activeTier.name}</span> selected (
              {activeTier.id === 'free'
                ? '$0.00 Forever'
                : `${billingCycle === 'annually' ? activeTier.annualPrice : activeTier.monthlyPrice} per month, ${
                    billingCycle === 'annually' ? 'billed annually' : 'billed monthly'
                  }`}
              ).
            </div>
            <button
              type="button"
              onClick={() => onContinueWithPlan(activeTier.id)}
              className="inline-flex items-center gap-1.5 lab text-[14px] text-[#1020F5] hover:opacity-80 bg-transparent border-0 p-0 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{isLoggedIn ? 'Submit a website' : 'Continue to sign up'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isStandalone && onOpenStandalonePricing && (
        <button
          type="button"
          onClick={onOpenStandalonePricing}
          className={`mt-8 lab text-[15px] hover:opacity-75 bg-transparent border-0 p-0 cursor-pointer ${
            hasSkyBackground
              ? 'text-white drop-shadow-[0_1px_6px_rgba(2,3,26,0.5)]'
              : 'text-[#1020F5] dark:text-white'
          }`}
        >
          Open dedicated pricing page
        </button>
      )}

      {isStandalone && (
        <motion.div
          initial={{opacity: 0}}
          whileInView={{opacity: 1}}
          viewport={FIWI_VIEWPORT}
          transition={FIWI_TRANSITION_REVEAL}
          aria-labelledby="fiwi-additional-purchases-heading"
          className="mt-10 w-full text-left"
        >
          <div className="glass fiwi-pricing-card w-full p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-5 border-b border-[#02031A]/12">
              <h3
                id="fiwi-additional-purchases-heading"
                className="font-display text-[32px] sm:text-[36px] font-semibold leading-none tracking-[-0.01em] text-[#02031A]"
              >
                Additional purchases
              </h3>
              <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/65">
                Add-ons
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#02031A]/12">
                    <th
                      scope="col"
                      className="py-3.5 pr-4 mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#02031A]/65"
                    >
                      Feature
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 px-4 text-right mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#02031A]/65"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 text-right mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#02031A]/65 w-[132px] sm:w-[152px]"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ADDITIONAL_PURCHASES.map((item, idx) => {
                    const isSelected = selectedAddonIds.includes(item.id);
                    const isPurchased = purchasedAddonIds.includes(item.id);

                    return (
                      <tr
                        key={item.id}
                        className={
                          idx < ADDITIONAL_PURCHASES.length - 1
                            ? 'border-b border-[#02031A]/10'
                            : undefined
                        }
                      >
                        <td className="py-3.5 pr-4 text-[15px] font-medium text-[#02031A]">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{item.feature}</span>
                            {isPurchased && !isSelected && (
                              <span className="mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#1020F5]">
                                Purchased
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-display text-[22px] font-semibold leading-none tracking-[-0.01em] tabular-nums text-[#02031A] whitespace-nowrap">
                          {item.price}
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => handleToggleAddon(item.id)}
                            className={`btn h-[36px] px-4 text-[13px] whitespace-nowrap ${
                              isSelected
                                ? 'bg-[#1020F5] text-white hover:bg-[#0B18C9]'
                                : 'bg-[#02031A] text-white hover:bg-[#1020F5]'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                <span>Added</span>
                              </>
                            ) : (
                              <span>Purchase</span>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <AnimatePresence initial={false}>
              {selectedAddons.length > 0 && (
                <motion.div
                  key="addons-summary"
                  variants={fiwiPanelRevealVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  role="region"
                  aria-label="Selected add-ons summary"
                  className="mt-5 pt-5 border-t border-[#02031A]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/65">
                      Selected {selectedAddons.length === 1 ? 'add-on' : `add-ons (${selectedAddons.length})`}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedAddons.map((addon) => (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => handleToggleAddon(addon.id)}
                          aria-label={`Remove ${addon.feature}`}
                          className="inline-flex items-center gap-1.5 border border-[#02031A]/15 bg-white/75 hover:bg-white px-2.5 py-1 text-[13px] font-medium text-[#02031A] cursor-pointer transition-colors"
                        >
                          <span>
                            {addon.feature} ({addon.price})
                          </span>
                          <X className="w-3.5 h-3.5 text-[#02031A]/60" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedAddonIds([])}
                      className="lab text-[13px] text-[#02031A]/65 hover:text-[#02031A] bg-transparent border-0 p-1 cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleCompleteAddonPurchase}
                      className="btn h-[44px] px-6 text-[15px] bg-[#1020F5] text-white hover:bg-[#0B18C9] whitespace-nowrap"
                    >
                      Purchase {selectedAddons.length === 1 ? 'add-on' : 'add-ons'} ·{' '}
                      {selectedAddonsTotalLabel}
                    </button>
                  </div>
                </motion.div>
              )}

              {lastPurchasedReceipt && selectedAddons.length === 0 && (
                <motion.div
                  key="addons-receipt"
                  variants={fiwiPanelRevealVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  role="status"
                  className="mt-5 pt-5 border-t border-[#02031A]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="text-[14px] font-medium text-[#02031A]">
                    <span className="font-semibold text-[#1020F5]">Purchase confirmed:</span>{' '}
                    {lastPurchasedReceipt.items.map((item) => item.feature).join(', ')} (
                    {lastPurchasedReceipt.totalLabel}).
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {onOpenSubmitOrAuth && (
                      <button
                        type="button"
                        onClick={onOpenSubmitOrAuth}
                        className="inline-flex items-center gap-1.5 lab text-[14px] text-[#1020F5] hover:opacity-80 bg-transparent border-0 p-0 cursor-pointer whitespace-nowrap"
                      >
                        <span>{isLoggedIn ? 'Submit a website' : 'Sign in to apply'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setLastPurchasedReceipt(null)}
                      aria-label="Dismiss purchase confirmation"
                      className="lab text-[13px] text-[#02031A]/60 hover:text-[#02031A] bg-transparent border-0 p-0 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </section>
  );
}
