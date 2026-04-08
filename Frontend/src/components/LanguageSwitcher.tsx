import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', labelKey: 'language.english' },
  { code: 'hi', labelKey: 'language.hindi' },
  { code: 'mr', labelKey: 'language.marathi' },
] as const;

export function LanguageSwitcher({ mobile = false }: { mobile?: boolean }) {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      {!mobile && <Globe className="w-4 h-4" style={{ color: 'var(--dark-brown)' }} />}
      <label className="sr-only" htmlFor={mobile ? 'language-switcher-mobile' : 'language-switcher-desktop'}>
        {t('language.label')}
      </label>
      <select
        id={mobile ? 'language-switcher-mobile' : 'language-switcher-desktop'}
        value={i18n.resolvedLanguage || 'en'}
        onChange={(event) => i18n.changeLanguage(event.target.value)}
        className={`${mobile ? 'w-full' : 'w-28'} rounded-lg border px-2 py-1.5 text-xs font-semibold`}
        style={{ borderColor: 'var(--beige)', color: 'var(--dark-brown)', backgroundColor: 'white' }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {t(lang.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
