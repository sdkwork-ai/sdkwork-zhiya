// 我的家庭 (PRD §20/§42): 儿童列表 + 添加/删除.
import { appApi } from '../../runtime/app.js';
import type { PageApi } from '../../bootstrap/runtime';

type Children = Awaited<ReturnType<PageApi['profile']['children']>>;

const STAGES = ['kindergarten', 'primary-low', 'primary-high', 'junior', 'senior'];
const STAGE_LABELS = ['幼儿园', '小学低年级', '小学高年级', '初中', '高中'];
type StageInputEvent = WechatMiniprogram.CustomEvent<{ value: string }>;

Page({
  data: { children: [] as Children, showForm: false, nickname: '', birthDate: '2018-01-01', stageIndex: 1, saving: false },
  stages: STAGES,
  stageLabels: STAGE_LABELS,

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

  onNickname(event: WechatMiniprogram.CustomEvent<{ value: string }>) { this.setData({ nickname: event.detail.value }); },
  onBirthDate(event: WechatMiniprogram.CustomEvent<{ value: string }>) { this.setData({ birthDate: event.detail.value }); },
  onStage(event: StageInputEvent) { this.setData({ stageIndex: Number(event.detail.value) }); },

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
      stage: this.stages[this.data.stageIndex] ?? 'primary-low',
      interests: [],
    });
    this.setData({ saving: false });
    wx.showToast({ title: message, icon: 'none' });
    this.refresh();
  },

  async onRemove(event: WechatMiniprogram.CustomEvent<Record<string, never>, Record<string, never>, { id: string }>) {
    await appApi.profile.removeChild(event.currentTarget.dataset.id);
    this.refresh();
  },
});
