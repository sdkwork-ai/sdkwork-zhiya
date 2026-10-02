import { cx } from '../utils/format.js';

export interface AvatarProps {
  /** Emoji glyph stand-in for the avatar image. */
  glyph: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: 'h-8 w-8 text-base',
  md: 'h-10 w-10 text-xl',
  lg: 'h-14 w-14 text-3xl',
} as const;

export function Avatar({ glyph, size = 'md' }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cx('flex items-center justify-center rounded-full bg-brand-soft', SIZES[size])}
    >
      {glyph}
    </span>
  );
}
