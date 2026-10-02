import { StrictMode } from 'react';

import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import {
  createZhiyaI18n,
  mergeZhiyaResources,
  readStoredLocale,
} from '@sdkwork/zhiya-h5-core';
import { commonsI18nResources } from '@sdkwork/zhiya-h5-commons';
import { shellI18nResources } from '@sdkwork/zhiya-h5-shell';
import { homeI18nResources } from '@sdkwork/zhiya-h5-home';
import { activityI18nResources } from '@sdkwork/zhiya-h5-activity';
import { aiI18nResources } from '@sdkwork/zhiya-h5-ai';
import { mallI18nResources } from '@sdkwork/zhiya-h5-mall';
import { tradeI18nResources } from '@sdkwork/zhiya-h5-trade';
import { profileI18nResources } from '@sdkwork/zhiya-h5-profile';
import { orgI18nResources } from '@sdkwork/zhiya-h5-org';

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
