import { StrictMode } from 'react';

import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import {
  createZhiyaI18n,
  mergeZhiyaResources,
  readStoredLocale,
} from '@sdkwork/zhiya-pc-core';
import { commonsI18nResources } from '@sdkwork/zhiya-pc-commons';
import { shellI18nResources } from '@sdkwork/zhiya-pc-shell';
import { homeI18nResources } from '@sdkwork/zhiya-pc-home';
import { activityI18nResources } from '@sdkwork/zhiya-pc-activity';
import { aiI18nResources } from '@sdkwork/zhiya-pc-ai';
import { mallI18nResources } from '@sdkwork/zhiya-pc-mall';
import { tradeI18nResources } from '@sdkwork/zhiya-pc-trade';
import { profileI18nResources } from '@sdkwork/zhiya-pc-profile';
import { adminI18nResources } from '@sdkwork/zhiya-pc-admin-platform';
import { orgI18nResources } from '@sdkwork/zhiya-pc-org';

import { App } from './App.js';
import { bootstrapEnvironment } from './bootstrap/environment.js';
import { bootstrapSdkClients } from './bootstrap/sdkClients.js';
import './index.css';

async function main(): Promise<void> {
  await bootstrapEnvironment();
  bootstrapSdkClients();
  createZhiyaI18n(
    mergeZhiyaResources(
      commonsI18nResources,
      shellI18nResources,
      homeI18nResources,
      activityI18nResources,
      aiI18nResources,
      mallI18nResources,
      tradeI18nResources,
      profileI18nResources,
      orgI18nResources,
      adminI18nResources,
    ),
    readStoredLocale(),
  );

  const container = document.getElementById('root');
  if (container === null) {
    throw new Error('missing #root container');
  }
  ReactDOM.createRoot(container).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

void main();
