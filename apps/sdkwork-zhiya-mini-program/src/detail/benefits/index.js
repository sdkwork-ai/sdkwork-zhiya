// 体验包权益 (PRD §12.4): 每个活动的已约/可约状态，选孩子+场次后预约.
const { appApi } = require('../../runtime/app.js');

Page({
  data: { orderId: '', benefits: [], children: [], selected: '', childId: '', sessionId: '', error: '', submitting: false },

  onLoad(query) {
    this.setData({ orderId: query.orderId || '' });
    this.refresh();
  },

  async refresh() {
    const benefits = await appApi.activity.packageBenefits(this.data.orderId);
    const children = await appApi.profile.children();
    this.setData({ benefits, children });
  },

  onToggle(event) {
    const id = event.currentTarget.dataset.id;
    const benefit = this.data.benefits.find((entry) => entry.activityId === id);
    if (!benefit || benefit.booked) {
      return;
    }
    this.setData({
      selected: this.data.selected === id ? '' : id,
      childId: this.data.childId || (this.data.children[0] ? this.data.children[0].id : ''),
      sessionId: '',
      error: '',
    });
  },

  onChild(event) {
    this.setData({ childId: event.currentTarget.dataset.id });
  },

  onSession(event) {
    this.setData({ sessionId: event.currentTarget.dataset.id });
  },

  async onSubmit() {
    const { orderId, selected, childId, sessionId, submitting } = this.data;
    if (submitting) {
      return;
    }
    if (!childId) {
      this.setData({ error: '请先到「我的家庭」添加孩子' });
      return;
    }
    if (!selected || !sessionId) {
      this.setData({ error: '请选择场次' });
      return;
    }
    this.setData({ submitting: true, error: '' });
    const result = await appApi.activity.bookBenefit({ orderId, activityId: selected, sessionId, childId });
    this.setData({ submitting: false });
    if (result.ok) {
      wx.showToast({ title: '预约成功', icon: 'success' });
      this.refresh();
    } else {
      this.setData({ error: result.error || '预约失败' });
    }
  },
});
