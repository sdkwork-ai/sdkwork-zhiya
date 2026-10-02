import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { ScreenState, useAsyncData } from '@sdkwork/zhiya-h5-commons';
import { ACTIVITY_CATEGORIES, getZhiyaClient } from '@sdkwork/zhiya-h5-core';
import type { ActivityCategory, ActivityMode, EducationTag } from '@sdkwork/zhiya-h5-core';

import { cx } from '../utils/format.js';

const TAGS: readonly EducationTag[] = ['programming', 'robotics', 'science', 'art', 'music', 'english', 'sports', 'thinking', 'drama', 'nature'];

interface ActivityForm {
  title: string;
  subtitle: string;
  category: ActivityCategory;
  mode: ActivityMode;
  price: string;
  originalPrice: string;
  quota: string;
  ageMin: string;
  ageMax: string;
  startTime: string;
  endTime: string;
  address: string;
  onlineLink: string;
  introduction: string;
  notice: string;
  tags: EducationTag[];
}

function defaultTimes(): { start: string; end: string } {
  const start = new Date();
  start.setDate(start.getDate() + 7);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start.getTime() + 1.5 * 3_600_000);
  const pad = (input: number): string => String(input).padStart(2, '0');
  const local = (date: Date): string =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return { start: local(start), end: local(end) };
}

const EMPTY_FORM: ActivityForm = {
  title: '',
  subtitle: '',
  category: 'trial',
  mode: 'offline',
  price: '19',
  originalPrice: '199',
  quota: '12',
  ageMin: '5',
  ageMax: '12',
  startTime: defaultTimes().start,
  endTime: defaultTimes().end,
  address: '',
  onlineLink: '',
  introduction: '',
  notice: '',
  tags: [],
};

/** 机构活动新建/编辑 (PRD §22.2): 表单 + 保存草稿 / 保存并上架. */
export function OrgActivityEditScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activityId } = useParams<{ activityId: string }>();
  const orgClient = getZhiyaClient('org');
  const [form, setForm] = useState<ActivityForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const existing = useAsyncData(async () => {
    if (activityId === undefined) {
      return null;
    }
    const all = await orgClient.listOrgActivities();
    return all.find((activity) => activity.id === activityId) ?? null;
  }, [orgClient, activityId]);

  useEffect(() => {
    if (existing.state === 'ready' && existing.data !== null) {
      const activity = existing.data;
      const pad = (input: number): string => String(input).padStart(2, '0');
      const local = (iso: string): string => {
        const date = new Date(iso);
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
      };
      setForm({
        title: activity.title,
        subtitle: activity.subtitle,
        category: activity.category,
        mode: activity.mode,
        price: String(activity.price),
        originalPrice: String(activity.originalPrice),
        quota: String(activity.quota),
        ageMin: String(activity.ageMin),
        ageMax: String(activity.ageMax),
        startTime: local(activity.startTime),
        endTime: local(activity.endTime),
        address: activity.address === '线上直播' ? '' : activity.address,
        onlineLink: activity.onlineLink ?? '',
        introduction: activity.introduction,
        notice: activity.notice,
        tags: [...activity.tags],
      });
    }
  }, [existing]);

  if (existing.state === 'loading') {
    return <ScreenState state="loading" />;
  }

  const save = async (publish: boolean): Promise<void> => {
    if (form.title.trim().length === 0) {
      setError('title');
      return;
    }
    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setError('time');
      return;
    }
    setError(null);
    const input = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || form.title.trim(),
      category: form.category,
      mode: form.mode,
      ageMin: Number.parseInt(form.ageMin, 10) || 3,
      ageMax: Number.parseInt(form.ageMax, 10) || 12,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      address: form.mode === 'offline' ? form.address.trim() || t('zhiya.org.edit.addressFallback') : '线上直播',
      onlineLink: form.mode === 'online' && form.onlineLink.trim().length > 0 ? form.onlineLink.trim() : undefined,
      price: Number.parseFloat(form.price) || 0,
      originalPrice: Number.parseFloat(form.originalPrice) || 0,
      quota: Number.parseInt(form.quota, 10) || 10,
      introduction: form.introduction.trim() || form.title.trim(),
      notice: form.notice.trim(),
      tags: form.tags,
    };
    if (activityId === undefined) {
      await orgClient.createActivity(input, publish);
    } else {
      await orgClient.updateActivity(activityId, input);
      if (publish) {
        await orgClient.publishActivity(activityId);
      }
    }
    navigate('/org/activities');
  };

  return (
    <div className="pb-28">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">
          {activityId === undefined ? t('zhiya.org.edit.newTitle') : t('zhiya.org.edit.editTitle')}
        </h1>
      </header>

      <div className="space-y-4 px-4 pt-2">
        <Field label={t('zhiya.org.edit.title')}>
          <input
            data-testid="org-title"
            value={form.title}
            onChange={(event) => {
              setForm((previous) => ({ ...previous, title: event.target.value }));
            }}
            placeholder={t('zhiya.org.edit.titlePlaceholder')}
            className={inputClass}
          />
        </Field>

        <Field label={t('zhiya.org.edit.subtitle')}>
          <input
            value={form.subtitle}
            onChange={(event) => {
              setForm((previous) => ({ ...previous, subtitle: event.target.value }));
            }}
            className={inputClass}
          />
        </Field>

        <Field label={t('zhiya.org.edit.category')}>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_CATEGORIES.slice(0, 8).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setForm((previous) => ({ ...previous, category }));
                }}
                className={cx(
                  'rounded-full border px-3 py-1.5 text-xs',
                  form.category === category ? 'border-brand bg-brand-soft text-brand' : 'border-border-subtle bg-panel text-secondary',
                )}
              >
                {t(`zhiya.commons.category.${category}`)}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t('zhiya.org.edit.mode')}>
          <div className="flex gap-2">
            {(
              [
                { value: 'offline', label: t('zhiya.commons.mode.offline') },
                { value: 'online', label: t('zhiya.commons.mode.online') },
              ] as const
            ).map((entry) => (
              <button
                key={entry.value}
                type="button"
                onClick={() => {
                  setForm((previous) => ({ ...previous, mode: entry.value }));
                }}
                className={cx(
                  'flex-1 rounded-xl border px-3 py-2 text-xs font-medium',
                  form.mode === entry.value ? 'border-brand bg-brand-soft text-brand' : 'border-border-subtle bg-panel text-secondary',
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </Field>

        {form.mode === 'offline' ? (
          <Field label={t('zhiya.org.edit.address')}>
            <input
              value={form.address}
              onChange={(event) => {
                setForm((previous) => ({ ...previous, address: event.target.value }));
              }}
              className={inputClass}
            />
          </Field>
        ) : (
          <Field label={t('zhiya.org.edit.onlineLink')}>
            <input
              value={form.onlineLink}
              onChange={(event) => {
                setForm((previous) => ({ ...previous, onlineLink: event.target.value }));
              }}
              placeholder="https://"
              className={inputClass}
            />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('zhiya.org.edit.price')}>
            <input
              data-testid="org-price"
              inputMode="decimal"
              value={form.price}
              onChange={(event) => {
                setForm((previous) => ({ ...previous, price: event.target.value }));
              }}
              className={inputClass}
            />
          </Field>
          <Field label={t('zhiya.org.edit.originalPrice')}>
            <input
              inputMode="decimal"
              value={form.originalPrice}
              onChange={(event) => {
                setForm((previous) => ({ ...previous, originalPrice: event.target.value }));
              }}
              className={inputClass}
            />
          </Field>
          <Field label={t('zhiya.org.edit.quota')}>
            <input
              inputMode="numeric"
              value={form.quota}
              onChange={(event) => {
                setForm((previous) => ({ ...previous, quota: event.target.value }));
              }}
              className={inputClass}
            />
          </Field>
          <Field label={t('zhiya.org.edit.ageRange')}>
            <div className="flex items-center gap-1">
              <input
                inputMode="numeric"
                value={form.ageMin}
                onChange={(event) => {
                  setForm((previous) => ({ ...previous, ageMin: event.target.value }));
                }}
                className={cx(inputClass, 'w-full')}
              />
              <span className="text-muted">-</span>
              <input
                inputMode="numeric"
                value={form.ageMax}
                onChange={(event) => {
                  setForm((previous) => ({ ...previous, ageMax: event.target.value }));
                }}
                className={cx(inputClass, 'w-full')}
              />
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('zhiya.org.edit.startTime')}>
            <input
              data-testid="org-start"
              type="datetime-local"
              value={form.startTime}
              onChange={(event) => {
                setForm((previous) => ({ ...previous, startTime: event.target.value }));
              }}
              className={inputClass}
            />
          </Field>
          <Field label={t('zhiya.org.edit.endTime')}>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(event) => {
                setForm((previous) => ({ ...previous, endTime: event.target.value }));
              }}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label={t('zhiya.org.edit.tags')}>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => {
              const selected = form.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setForm((previous) => ({
                      ...previous,
                      tags: selected ? previous.tags.filter((entry) => entry !== tag) : [...previous.tags, tag],
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
        </Field>

        <Field label={t('zhiya.org.edit.introduction')}>
          <textarea
            value={form.introduction}
            onChange={(event) => {
              setForm((previous) => ({ ...previous, introduction: event.target.value }));
            }}
            rows={4}
            className={cx(inputClass, 'resize-none')}
          />
        </Field>

        <Field label={t('zhiya.org.edit.notice')}>
          <textarea
            value={form.notice}
            onChange={(event) => {
              setForm((previous) => ({ ...previous, notice: event.target.value }));
            }}
            rows={3}
            className={cx(inputClass, 'resize-none')}
          />
        </Field>

        {error !== null ? (
          <p data-testid="org-edit-error" className="text-xs text-danger">
            {t(`zhiya.org.edit.error.${error}`)}
          </p>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-[42rem] gap-2 border-t border-border-subtle bg-panel px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <button
          type="button"
          data-testid="org-save-draft"
          onClick={() => {
            void save(false);
          }}
          className="flex-1 rounded-full border border-border-default px-4 py-3 text-sm font-medium text-secondary"
        >
          {t('zhiya.org.edit.saveDraft')}
        </button>
        <button
          type="button"
          data-testid="org-save-publish"
          onClick={() => {
            void save(true);
          }}
          className="flex-1 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white"
        >
          {t('zhiya.org.edit.savePublish')}
        </button>
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-border-subtle bg-panel px-3 py-2.5 text-sm outline-none placeholder:text-muted';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-secondary">{label}</span>
      {children}
    </label>
  );
}
