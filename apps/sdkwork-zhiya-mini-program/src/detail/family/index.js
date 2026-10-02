// 我的家庭 (PRD §20/§42): 儿童列表 + 添加/删除.
const { appApi } = require('../../runtime/app.js');

Page({
  data: { children: [], showForm: false, nickname: '', birthDate: '2018-01-01', stageIndex: 1, saving: false },
  stages: ['kindergarten', 'primary-low', 'primary-high', 'junior', 'senior'],
  stageLabels: ['幼儿园', '小学低年级', '小学高年级', '初中', '高中'],

  onLoad() {
    this.refresh();
  },

  async refresh() {
    const children = await appApi.profile.children();
    this.setData({ children, showForm: false, nickname: '' });
  },

  toggleForm() {
    this.setData({ showForm: !this.data.showForm });
  },

  onNickname(event) { this.setData({ nickname: event.detail.value }); },
  onBirthDate(event) { this.setData({ birthDate: event.detail.value }); },
  onStage(event) { this.setData({ stageIndex: Number(event.detail.value) }); },

  async onSave() {
    if (this.data.saving || this.data.nickname.trim().length === 0) {
      wx.showToast({ title: '请填写孩子昵称', icon: 'none' });
      return;
    }
    this.setData({ saving: true });
    const message = await appApi.profile.saveChild(null, {
      nickname: this.data.nickname.trim(),
      gender: 'secret',
      birthDate: this.data.birthDate,
      stage: this.stages[this.data.stageIndex],
      interests: [],
    });
    this.setData({ saving: false });
    wx.showToast({ title: message, icon: 'none' });
    this.refresh();
  },

  async onRemove(event) {
    await appApi.profile.removeChild(event.currentTarget.dataset.id);
    this.refresh();
  },
});
