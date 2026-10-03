// 问知鸭 AI tab (PRD §14): 对话 + 推荐 + 体验计划.
import { appApi } from '../../runtime/app.js';
import type { PageApi } from '../../bootstrap/runtime';

type AiTurn = Awaited<ReturnType<PageApi['ai']['send']>>;
type IdTapEvent = WechatMiniprogram.CustomEvent<Record<string, never>, Record<string, never>, { id: string }>;
type TextTapEvent = WechatMiniprogram.CustomEvent<Record<string, never>, Record<string, never>, { text: string }>;

Page({
  data: { turns: [] as AiTurn[], input: '', sending: false, suggestions: [] as readonly string[] },

  onLoad() {
    this.setData({ suggestions: appApi.ai.suggestions });
  },

  onInput(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.setData({ input: event.detail.value });
  },

  async onSuggestion(event: TextTapEvent) {
    await this.send(event.currentTarget.dataset.text);
  },

  async onSend() {
    const text = this.data.input.trim();
    if (text.length > 0) {
      await this.send(text);
    }
  },

  async send(text: string) {
    if (this.data.sending) {
      return;
    }
    const turns = [...this.data.turns, { role: 'user' as const, text }];
    this.setData({ turns, input: '', sending: true });
    const reply = await appApi.ai.send(text);
    this.setData({ turns: [...turns, reply], sending: false });
  },

  goDetail(event: IdTapEvent) {
    wx.navigateTo({ url: `/detail/activity-detail/index?id=${event.currentTarget.dataset.id}` });
  },
});
