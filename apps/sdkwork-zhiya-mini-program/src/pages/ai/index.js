// 问知鸭 AI tab (PRD §14): 对话 + 推荐 + 体验计划.
const { appApi } = require('../../runtime/app.js');

Page({
  data: { turns: [], input: '', sending: false, suggestions: [] },

  onLoad() {
    this.setData({ suggestions: appApi.ai.suggestions });
  },

  onInput(event) {
    this.setData({ input: event.detail.value });
  },

  async onSuggestion(event) {
    await this.send(event.currentTarget.dataset.text);
  },

  async onSend() {
    const text = this.data.input.trim();
    if (text.length > 0) {
      await this.send(text);
    }
  },

  async send(text) {
    if (this.data.sending) {
      return;
    }
    const turns = [...this.data.turns, { role: 'user', text }];
    this.setData({ turns, input: '', sending: true });
    const reply = await appApi.ai.send(text);
    this.setData({ turns: [...turns, reply], sending: false });
  },

  goDetail(event) {
    wx.navigateTo({ url: `/detail/activity-detail/index?id=${event.currentTarget.dataset.id}` });
  },
});
