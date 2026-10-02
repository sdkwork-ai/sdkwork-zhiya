import { useTranslation } from 'react-i18next';

import { cx, formatPrice, trimPrice } from '../utils/format.js';

export interface PriceProps {
  value: number;
  originalValue?: number | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string | undefined;
}

const SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
} as const;

/** Price display with free-label handling and strikethrough original price (PRD §7.3). */
export function Price({ value, originalValue, size = 'md', className }: PriceProps) {
  const { t } = useTranslation();
  return (
    <span className={cx('inline-flex items-baseline gap-1', className)}>
      {value === 0 ? (
        <span className={cx('font-semibold text-success', SIZE_CLASSES[size])}>
          {t('zhiya.commons.price.free')}
        </span>
      ) : (
        <>
          <span className={cx('font-semibold text-brand', SIZE_CLASSES[size])}>{formatPrice(value)}</span>
          {originalValue !== undefined && originalValue > value ? (
            <span className="text-xs text-muted line-through">¥{trimPrice(originalValue)}</span>
          ) : null}
        </>
      )}
    </span>
  );
}
