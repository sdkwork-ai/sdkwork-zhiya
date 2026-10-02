// Zhiya 知鸭 mini-program application entry (MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md).
const { appApi } = require('./runtime/app.js');

// eslint-disable-next-line no-unused-vars
const runtime = appApi; // typed runtime bound in bootstrap/runtime.ts

App({
  onLaunch() {
    console.log('[zhiya] mini-program launched');
  },
  globalData: {
    appApi,
  },
});
