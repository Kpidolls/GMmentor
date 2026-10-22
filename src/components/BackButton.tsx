import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
  fallbackHref: string;
  label?: string;
}

// Goes back when the previous page is on this site, otherwise to the parent page.
export function BackButton({ fallbackHref, label }: BackButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleClick = () => {
    const cameFromSite =
      typeof window !== 'undefined' &&
      window.history.length > 1 &&
      document.referrer.startsWith(window.location.origin);
    if (cameFromSite) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 mb-3 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
    >
      <span aria-hidden="true">←</span> {label || t('common.back', 'Back')}
    </button>
  );
}

export default BackButton;
