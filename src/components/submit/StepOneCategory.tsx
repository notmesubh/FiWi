import {AnimatePresence, motion} from 'motion/react';
import {Check} from 'lucide-react';
import {CategoryCardIcon} from './BrandLogoBadge';
import {
  CATEGORY_CARDS,
  SUBCATEGORIES_BY_CATEGORY,
  type SubmitCategoryId,
  type ValidationErrors,
} from './submitData';
import {FIWI_TAP, fiwiPanelRevealVariants} from '../../lib/motion';

interface StepOneCategoryProps {
  selectedCategory: SubmitCategoryId | null;
  selectedSubCategory: string;
  customSubCategory: string;
  errors: ValidationErrors;
  onSelectCategory: (category: SubmitCategoryId) => void;
  onSelectSubCategory: (subCategory: string) => void;
  onCustomSubCategoryChange: (value: string) => void;
}

export default function StepOneCategory({
  selectedCategory,
  selectedSubCategory,
  customSubCategory,
  errors,
  onSelectCategory,
  onSelectSubCategory,
  onCustomSubCategoryChange,
}: StepOneCategoryProps) {
  const availableSubCategories = selectedCategory
    ? SUBCATEGORIES_BY_CATEGORY[selectedCategory]
    : [];

  return (
    <div className="text-left">
      <div>
        <h2 className="font-display text-[36px] sm:text-[44px] font-medium leading-[0.98] tracking-[-0.015em] text-[#02031A]">
          What are you submitting?
        </h2>
        <p className="mt-2 text-[15px] sm:text-[16px] text-[#02031A]/75 leading-[1.45]">
          Select the category that best describes your website.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Website category"
        className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5"
      >
        {CATEGORY_CARDS.map((card) => {
          const isSelected = selectedCategory === card.id;
          return (
            <motion.button
              key={card.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              whileTap={FIWI_TAP}
              onClick={() => onSelectCategory(card.id)}
              className={`group relative text-left p-5 border transition-colors duration-200 cursor-pointer flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1020F5] ${
                isSelected
                  ? 'bg-white border-[#1020F5] shadow-[0_14px_32px_-12px_rgba(16,32,245,0.24)]'
                  : 'bg-white/75 hover:bg-white border-[#02031A]/14 hover:border-[#02031A]/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <CategoryCardIcon category={card.id} selected={isSelected} />

                <span
                  aria-hidden="true"
                  className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#1020F5] border-[#1020F5] text-white scale-100'
                      : 'border-[#02031A]/20 bg-white/80 text-transparent group-hover:border-[#02031A]/35'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>

              <div className="mt-4">
                <div className="mono text-[10px] uppercase tracking-[0.08em] text-[#02031A]/55">
                  {card.tagline}
                </div>
                <div className="mt-1 font-display text-[28px] font-semibold leading-none tracking-[-0.01em] text-[#02031A]">
                  {card.name}
                </div>
                <p className="mt-2 text-[13.5px] leading-[1.45] text-[#02031A]/75">
                  {card.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {errors.category && (
        <p role="alert" className="mt-3 text-[13px] font-medium text-[#991B1B]">
          {errors.category}
        </p>
      )}

      <AnimatePresence initial={false}>
        {selectedCategory && (
          <motion.div
            key={selectedCategory}
            variants={fiwiPanelRevealVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mt-7 pt-6 border-t border-[#02031A]/12"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="text-[16px] font-semibold text-[#02031A]">
                  Select a {selectedCategory} subcategory
                </h3>
                <p className="text-[13px] text-[#02031A]/65 mt-0.5">
                  Help visitors discover your site under the right topic.
                </p>
              </div>
              {selectedSubCategory && (
                <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#1020F5] font-semibold">
                  Selected: {selectedSubCategory === 'Other' && customSubCategory.trim() ? customSubCategory.trim() : selectedSubCategory}
                </span>
              )}
            </div>

            <div
              role="radiogroup"
              aria-label="Website subcategory"
              className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5"
            >
              {availableSubCategories.map((sub) => {
                const isSelected = selectedSubCategory === sub;
                return (
                  <motion.button
                    key={sub}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    whileTap={FIWI_TAP}
                    onClick={() => onSelectSubCategory(sub)}
                    className={`px-3 py-2.5 border text-[13px] font-medium text-left flex items-center justify-between gap-2 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1020F5] ${
                      isSelected
                        ? 'bg-[#02031A] border-[#02031A] text-white'
                        : 'bg-white/80 hover:bg-white border-[#02031A]/14 text-[#02031A] hover:border-[#02031A]/30'
                    }`}
                  >
                    <span className="truncate">{sub}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence initial={false}>
              {selectedSubCategory === 'Other' && (
                <motion.div
                  key="custom-subcategory-field"
                  variants={fiwiPanelRevealVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="mt-4 max-w-[380px]"
                >
                  <label className="flex flex-col gap-1.5">
                    <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                      Custom subcategory *
                    </span>
                    <input
                      type="text"
                      value={customSubCategory}
                      onChange={(e) => onCustomSubCategoryChange(e.target.value)}
                      placeholder="e.g. Hardware Interface, Architecture"
                      className="fiwi-field"
                    />
                  </label>
                  {errors.customSubCategory && (
                    <p role="alert" className="mt-1.5 text-[12.5px] font-medium text-[#991B1B]">
                      {errors.customSubCategory}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {errors.subCategory && (
              <p role="alert" className="mt-3 text-[13px] font-medium text-[#991B1B]">
                {errors.subCategory}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
