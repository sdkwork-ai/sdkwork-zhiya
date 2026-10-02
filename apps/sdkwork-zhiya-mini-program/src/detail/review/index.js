// 评价活动 (PRD §21): 五维评分 + 是否推荐 + 图文.
const { appApi } = require('../../runtime/app.js');

const DIMENSIONS = ['overall', 'experience', 'teacher', 'environment', 'service'];
const LABELS = { overall: '综合评分', experience: '活动体验', teacher: '教师', environment: '环境', service: '服务' };

Page({
  data: {
    dimensions: DIMENSIONS.map((id) => ({ id, label: LABELS[id], score: 5 })),
    scores: { overall: 5, experience: 5, teacher: 5, environment: 5, service: 5 },
    recommend: true,
    content: '',
    orderId: '',
    submitting: false,
  },

  onLoad(query) {
    this.setData({ orderId: query.orderId || '' });
  },

  onScore(event) {
    const { dimension, value } = event.currentTarget.dataset;
    const score = Number(value);
    const dimensions = this.data.dimensions.map((entry) =>
      entry.id === dimension ? { ...entry, score } : entry,
    );
    const scores = { ...this.data.scores, [dimension]: score };
    this.setData({ dimensions, scores });
  },

  onRecommend() {
    this.setData({ recommend: !this.data.recommend });
  },

  onContent(event) {
    this.setData({ content: event.detail.value });
  },

  async onSubmit() {
    if (this.data.submitting) {
      return;
    }
    this.setData({ submitting: true });
    const message = await appApi.trade.submitReview(this.data.orderId, {
      ...this.data.scores,
      recommend: this.data.recommend,
      content: this.data.content,
    });
    this.setData({ submitting: false });
    wx.showToast({ title: message, icon: 'none' });
    if (message.indexOf('成功') >= 0) {
      wx.navigateBack();
    }
  },
});
