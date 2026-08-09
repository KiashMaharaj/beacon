import Link from 'next/link';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { FieldError } from '@/components/ui/Field';

/**
 * Required consent shown when publishing a listing: the poster agrees to the
 * Terms and consents to their report details (and any contact detail) being
 * shared with neighbours so they can be contacted.
 */
export function ConsentCheckbox({
  registration,
  error,
}: {
  registration: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <div>
      <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white/70 p-4 dark:border-stone-700 dark:bg-stone-900/50">
        <input
          type="checkbox"
          {...registration}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-stone-300 text-beacon-500 accent-beacon-500 focus:ring-beacon-400"
        />
        <span className="text-sm text-ink-soft dark:text-stone-300">
          I agree to Beacon&rsquo;s{' '}
          <Link
            href="/terms"
            target="_blank"
            className="font-semibold text-beacon-600 underline dark:text-beacon-400"
          >
            Terms
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            target="_blank"
            className="font-semibold text-beacon-600 underline dark:text-beacon-400"
          >
            Privacy Policy
          </Link>
          , and consent to the details in this report, including any contact detail I add, being
          shared with neighbours so they can help reunite this pet.
        </span>
      </label>
      <FieldError>{error}</FieldError>
    </div>
  );
}
