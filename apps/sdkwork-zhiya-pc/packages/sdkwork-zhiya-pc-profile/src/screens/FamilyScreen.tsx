import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import { Avatar, Card, ScreenState, useAsyncData } from '@sdkwork/zhiya-pc-commons';
import { getZhiyaClient } from '@sdkwork/zhiya-pc-core';
import type { Child } from '@sdkwork/zhiya-pc-core';

/** 我的家庭 (PRD §20/§42): 家庭 + 儿童管理. */
export function FamilyScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const familyClient = getZhiyaClient('family');
  const family = useAsyncData(() => familyClient.getFamily(), [familyClient]);

  const removeChild = async (childId: string): Promise<void> => {
    await familyClient.removeChild(childId);
    navigate(0);
  };

  return (
    <div className="pb-6">
      <header className="flex items-center px-4 pt-4 pb-1">
        <h1 className="flex-1 text-lg font-semibold text-primary">{t('zhiya.profile.family.title')}</h1>
        <Link
          to="/profile/child/new"
          data-testid="add-child"
          className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white"
        >
          <Plus aria-hidden="true" className="h-3.5 w-3.5" />
          {t('zhiya.profile.family.addChild')}
        </Link>
      </header>

      <ScreenState
        state={
          family.state === 'loading'
            ? 'loading'
            : family.state === 'error'
              ? 'error'
              : (family.state === 'ready' ? (family.data?.children.length ?? 0) : 0) === 0
                ? 'empty'
                : 'success'
        }
        onRetry={() => undefined}
      >
        <div className="space-y-3 px-4 pt-2">
          {(family.state === 'ready' ? (family.data?.children ?? []) : []).map((child) => (
            <ChildCard key={child.id} child={child} onRemove={() => void removeChild(child.id)} />
          ))}
        </div>
      </ScreenState>
    </div>
  );
}

function ChildCard({ child, onRemove }: { child: Child; onRemove: () => void }) {
  const { t } = useTranslation();
  return (
    <Card className="mx-0 px-4 py-3" >
      <div className="flex items-center gap-3">
        <Avatar glyph={child.emoji} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary">{child.nickname}</p>
          <p className="text-xs text-muted">
            {t(`zhiya.commons.childStage.${child.stage}`)}
            {child.interests.length > 0
              ? ` · ${child.interests.map((tag) => t(`zhiya.commons.educationTag.${tag}`)).join(' / ')}`
              : ''}
          </p>
        </div>
        <Link
          to={`/profile/child/${child.id}`}
          aria-label={t('zhiya.profile.family.edit')}
          className="p-1.5 text-muted"
        >
          <Pencil aria-hidden="true" className="h-4 w-4" />
        </Link>
        <button
          type="button"
          aria-label={t('zhiya.profile.family.remove')}
          data-testid={`remove-child-${child.id}`}
          onClick={onRemove}
          className="p-1.5 text-muted"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
