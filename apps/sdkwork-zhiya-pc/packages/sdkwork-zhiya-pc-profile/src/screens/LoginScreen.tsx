import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bird } from 'lucide-react';

import { useSessionStore } from '@sdkwork/zhiya-pc-core';

/**
 * 登录 (PRD §3.1, P0): 手机号 + 验证码 (standalone 里程碑为 mock 登录,
 * 任意 6 位验证码可通过; Phase 2 换 IAM). Login is the P0 session gate.
 */
export function LoginScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const signIn = useSessionStore((state) => state.signIn);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent): void => {
    event.preventDefault();
    if (!/^1\d{10}$/u.test(phone.trim())) {
      setError('phone');
      return;
    }
    if (!/^\d{4,6}$/u.test(code.trim())) {
      setError('code');
      return;
    }
    setError(null);
    signIn(phone.trim());
    navigate('/home', { replace: true });
  };

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[42rem] flex-col bg-canvas px-6 pb-[max(env(safe-area-inset-bottom),2rem)] pt-20 text-primary">
      <div className="flex flex-col items-center gap-2 text-center">
        <Bird aria-hidden="true" className="h-14 w-14 text-brand" />
        <h1 className="text-xl font-semibold">{t('zhiya.profile.login.title')}</h1>
        <p className="text-sm text-muted">{t('zhiya.profile.login.slogan')}</p>
      </div>

      <form className="mt-10 space-y-4" onSubmit={submit} data-testid="login-form">
        <input
          data-testid="login-phone"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
          }}
          inputMode="numeric"
          maxLength={11}
          placeholder={t('zhiya.profile.login.phonePlaceholder')}
          className="w-full rounded-2xl bg-panel px-4 py-3.5 text-sm outline-none placeholder:text-muted"
        />
        <div className="flex gap-2">
          <input
            data-testid="login-code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
            }}
            inputMode="numeric"
            maxLength={6}
            placeholder={t('zhiya.profile.login.codePlaceholder')}
            className="w-full flex-1 rounded-2xl bg-panel px-4 py-3.5 text-sm outline-none placeholder:text-muted"
          />
          <span className="flex items-center whitespace-nowrap rounded-2xl bg-brand-soft px-3 text-xs font-medium text-brand">
            {t('zhiya.profile.login.sendCode')}
          </span>
        </div>

        {error !== null ? (
          <p data-testid="login-error" className="text-xs text-danger">
            {t(`zhiya.profile.login.error.${error}`)}
          </p>
        ) : null}

        <button
          type="submit"
          data-testid="login-submit"
          className="w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white transition-opacity hover:bg-brand-hover"
        >
          {t('zhiya.profile.login.submit')}
        </button>
        <p className="text-center text-xs text-muted">{t('zhiya.profile.login.mockHint')}</p>
      </form>

      <p className="mt-auto pt-10 text-center text-xs text-muted">
        {t('zhiya.profile.login.agreement')}
      </p>
    </div>
  );
}
