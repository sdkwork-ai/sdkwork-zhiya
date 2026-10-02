import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { ScreenState, useAsyncData } from '@sdkwork/zhiya-pc-commons';
import {
  CHILD_STAGES,
  getZhiyaClient,
} from '@sdkwork/zhiya-pc-core';
import type { ChildGender, ChildStage, EducationTag } from '@sdkwork/zhiya-pc-core';

import { cx } from '../utils/format.js';

const INTERESTS: readonly EducationTag[] = [
  'programming',
  'robotics',
  'science',
  'art',
  'music',
  'english',
  'sports',
  'thinking',
  'drama',
  'nature',
];

interface ChildForm {
  nickname: string;
  gender: ChildGender;
  birthDate: string;
  stage: ChildStage;
  interests: EducationTag[];
  notes: string;
}

const EMPTY_FORM: ChildForm = {
  nickname: '',
  gender: 'secret',
  birthDate: '2018-01-01',
  stage: 'primary-low',
  interests: [],
  notes: '',
};

/** 添加/编辑孩子 (PRD §3.2): 昵称/性别/出生日期/兴趣/教育阶段/备注. */
export function ChildEditScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const familyClient = getZhiyaClient('family');
  const [form, setForm] = useState<ChildForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const existing = useAsyncData(
    () => (childId === undefined ? Promise.resolve(null) : familyClient.getChild(childId)),
    [familyClient, childId],
  );

  useEffect(() => {
    if (existing.state === 'ready' && existing.data !== null) {
      setForm({
        nickname: existing.data.nickname,
        gender: existing.data.gender,
        birthDate: existing.data.birthDate,
        stage: existing.data.stage,
        interests: [...existing.data.interests],
        notes: existing.data.notes ?? '',
      });
    }
  }, [existing]);

  if (existing.state === 'loading') {
    return <ScreenState state="loading" />;
  }

  const submit = async (): Promise<void> => {
    if (form.nickname.trim().length === 0) {
      setError('nickname');
      return;
    }
    setError(null);
    if (childId === undefined) {
      await familyClient.addChild({
        nickname: form.nickname.trim(),
        gender: form.gender,
        birthDate: form.birthDate,
        stage: form.stage,
        interests: form.interests,
        notes: form.notes.trim().length > 0 ? form.notes.trim() : undefined,
      });
    } else {
      await familyClient.updateChild(childId, {
        nickname: form.nickname.trim(),
        gender: form.gender,
        birthDate: form.birthDate,
        stage: form.stage,
        interests: form.interests,
        notes: form.notes.trim().length > 0 ? form.notes.trim() : undefined,
      });
    }
    navigate('/profile/family');
  };

  return (
    <div className="pb-28">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">
          {childId === undefined ? t('zhiya.profile.childEdit.newTitle') : t('zhiya.profile.childEdit.editTitle')}
        </h1>
      </header>

      <div className="space-y-4 px-4 pt-2">
        <label className="block">
          <span className="mb-1 block text-xs text-secondary">{t('zhiya.profile.childEdit.nickname')}</span>
          <input
            data-testid="child-nickname"
            value={form.nickname}
            onChange={(event) => {
              setForm((previous) => ({ ...previous, nickname: event.target.value }));
            }}
            placeholder={t('zhiya.profile.childEdit.nicknamePlaceholder')}
            className="w-full rounded-xl border border-border-subtle bg-panel px-3 py-2.5 text-sm outline-none placeholder:text-muted"
          />
        </label>

        <div>
          <span className="mb-1 block text-xs text-secondary">{t('zhiya.profile.childEdit.gender')}</span>
          <div className="flex gap-2">
            {(
              [
                { value: 'boy', label: t('zhiya.profile.childEdit.boy') },
                { value: 'girl', label: t('zhiya.profile.childEdit.girl') },
                { value: 'secret', label: t('zhiya.profile.childEdit.secret') },
              ] as const
            ).map((entry) => (
              <button
                key={entry.value}
                type="button"
                onClick={() => {
                  setForm((previous) => ({ ...previous, gender: entry.value }));
                }}
                className={cx(
                  'flex-1 rounded-xl border px-3 py-2 text-xs font-medium',
                  form.gender === entry.value ? 'border-brand bg-brand-soft text-brand' : 'border-border-subtle bg-panel text-secondary',
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs text-secondary">{t('zhiya.profile.childEdit.birthDate')}</span>
          <input
            data-testid="child-birthdate"
            type="date"
            value={form.birthDate}
            onChange={(event) => {
              setForm((previous) => ({ ...previous, birthDate: event.target.value }));
            }}
            className="w-full rounded-xl border border-border-subtle bg-panel px-3 py-2.5 text-sm outline-none"
          />
        </label>

        <div>
          <span className="mb-1 block text-xs text-secondary">{t('zhiya.profile.childEdit.stage')}</span>
          <div className="flex flex-wrap gap-2">
            {CHILD_STAGES.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => {
                  setForm((previous) => ({ ...previous, stage }));
                }}
                className={cx(
                  'rounded-full border px-3 py-1.5 text-xs',
                  form.stage === stage ? 'border-brand bg-brand-soft text-brand' : 'border-border-subtle bg-panel text-secondary',
                )}
              >
                {t(`zhiya.commons.childStage.${stage}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1 block text-xs text-secondary">{t('zhiya.profile.childEdit.interests')}</span>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((tag) => {
              const selected = form.interests.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  data-testid={`interest-${tag}`}
                  onClick={() => {
                    setForm((previous) => ({
                      ...previous,
                      interests: selected
                        ? previous.interests.filter((entry) => entry !== tag)
                        : [...previous.interests, tag],
                    }));
                  }}
                  className={cx(
                    'rounded-full border px-3 py-1.5 text-xs',
                    selected ? 'border-brand bg-brand-soft text-brand' : 'border-border-subtle bg-panel text-secondary',
                  )}
                >
                  {t(`zhiya.commons.educationTag.${tag}`)}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs text-secondary">{t('zhiya.profile.childEdit.notes')}</span>
          <textarea
            value={form.notes}
            onChange={(event) => {
              setForm((previous) => ({ ...previous, notes: event.target.value }));
            }}
            rows={3}
            placeholder={t('zhiya.profile.childEdit.notesPlaceholder')}
            className="w-full resize-none rounded-xl border border-border-subtle bg-panel px-3 py-2.5 text-sm outline-none placeholder:text-muted"
          />
        </label>

        {error !== null ? (
          <p data-testid="child-error" className="text-xs text-danger">
            {t(`zhiya.profile.childEdit.error.${error}`)}
          </p>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[42rem] border-t border-border-subtle bg-panel px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <button
          type="button"
          data-testid="child-save"
          onClick={() => {
            void submit();
          }}
          className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
        >
          {t('zhiya.profile.childEdit.save')}
        </button>
      </div>
    </div>
  );
}
