/**
 * Seed catalog for the standalone milestone (PRD example scenarios). Seed
 * dates are computed relative to the injected clock so activities are always
 * upcoming; user-mutable state never lives here (see `state.ts`).
 */

import type {
  Activity,
  ActivitySession,
  CouponTemplate,
  ExperiencePackage,
  Goods,
  Message,
  Org,
} from './types.js';

function iso(date: Date): string {
  return date.toISOString();
}

/** Next occurrence of `weekday` (0=Sun..6=Sat) at hour:minute, strictly after `from`. */
function nextWeekday(from: Date, weekday: number, hour: number, minute: number): Date {
  const result = new Date(from);
  result.setHours(hour, minute, 0, 0);
  let delta = (weekday - result.getDay() + 7) % 7;
  if (delta === 0 && result.getTime() <= from.getTime()) {
    delta = 7;
  }
  result.setDate(result.getDate() + delta);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export interface SeedContext {
  now: () => Date;
}

interface SessionSpec {
  id: string;
  label: string;
  weekday: number;
  hour: number;
  minute: number;
  durationHours: number;
  quota: number;
  enrolled: number;
}

interface ActivitySpec {
  id: string;
  orgId: string;
  orgName: string;
  category: Activity['category'];
  mode: Activity['mode'];
  title: string;
  subtitle: string;
  emoji: string;
  ageMin: number;
  ageMax: number;
  startOffsetDays: number;
  startHour: number;
  durationHours: number;
  price: number;
  originalPrice: number;
  quota: number;
  enrolled: number;
  tags: Activity['tags'];
  introduction: string;
  notice: string;
  address: string;
  onlineLink?: string;
  sessions?: SessionSpec[];
}

const ORGS: readonly Org[] = [
  {
    id: 'org-1',
    name: '童程未来少儿编程',
    logo: '💻',
    summary: '专注 6-16 岁少儿编程与机器人教育，覆盖 Scratch、Python、信息学竞赛。',
    district: '北京·海淀',
    rating: 4.8,
  },
  {
    id: 'org-2',
    name: '科学盒子实验室',
    logo: '🧪',
    summary: '在家中也能做的科学实验课，覆盖物质、生命、地球与太空四大主题。',
    district: '北京·朝阳',
    rating: 4.7,
  },
  {
    id: 'org-3',
    name: '小天鹅艺术中心',
    logo: '🎨',
    summary: '创意美术、书法与展览导览，让孩子在艺术里自由表达。',
    district: '北京·朝阳',
    rating: 4.6,
  },
  {
    id: 'org-4',
    name: '启航少儿体育',
    logo: '⚽',
    summary: '体能、球类与户外运动课程，让运动成为习惯。',
    district: '北京·丰台',
    rating: 4.5,
  },
  {
    id: 'org-5',
    name: '悦读星球英文馆',
    logo: '📚',
    summary: '英文绘本、自然拼读与戏剧表达，拒绝哑巴英语。',
    district: '北京·西城',
    rating: 4.7,
  },
  {
    id: 'org-6',
    name: '阳光亲子俱乐部',
    logo: '🏕️',
    summary: '亲子活动、自然研学与营地教育，把周末还给孩子。',
    district: '北京·昌平',
    rating: 4.9,
  },
];

const ACTIVITY_SPECS: readonly ActivitySpec[] = [
  {
    id: 'act-101',
    orgId: 'org-1',
    orgName: '童程未来少儿编程',
    category: 'trial',
    mode: 'offline',
    title: '少儿编程 Scratch 体验课',
    subtitle: '90 分钟做出第一个小游戏',
    emoji: '💻',
    ageMin: 6,
    ageMax: 12,
    startOffsetDays: 3,
    startHour: 9,
    durationHours: 1.5,
    price: 19,
    originalPrice: 299,
    quota: 12,
    enrolled: 7,
    tags: ['programming', 'thinking'],
    introduction:
      '以Scratch为载体的编程启蒙体验课。孩子将在老师带领下完成一个可以运行的小游戏，学习顺序、循环与条件三大基础结构，现场体验“指令驱动的成就感”。',
    notice: '请自带笔记本电脑（可现场租借）；家长可在后排旁听；请提前 10 分钟到店签到。',
    address: '北京市海淀区中关村大街 27 号 3 层',
    sessions: [
      { id: 'act-101-s1', label: '周六 09:30 场', weekday: 6, hour: 9, minute: 30, durationHours: 1.5, quota: 12, enrolled: 5 },
      { id: 'act-101-s2', label: '周日 15:00 场', weekday: 0, hour: 15, minute: 0, durationHours: 1.5, quota: 12, enrolled: 2 },
    ],
  },
  {
    id: 'act-102',
    orgId: 'org-1',
    orgName: '童程未来少儿编程',
    category: 'online-course',
    mode: 'online',
    title: 'Python 趣味入门直播营',
    subtitle: '四周入门，写出你的第一个程序',
    emoji: '🐍',
    ageMin: 9,
    ageMax: 15,
    startOffsetDays: 5,
    startHour: 19,
    durationHours: 1.5,
    price: 99,
    originalPrice: 599,
    quota: 60,
    enrolled: 31,
    tags: ['programming'],
    introduction:
      '四周线上直播营，从变量、循环到函数，每周一个主题小项目（猜数字、绘制图形、简易问答机器人），配助教答疑与课后练习。',
    notice: '开课前发送直播链接与讲义；支持回放 90 天；需自备电脑。',
    address: '线上直播',
    onlineLink: 'https://live.zhiya.example/python-starter',
  },
  {
    id: 'act-103',
    orgId: 'org-2',
    orgName: '科学盒子实验室',
    category: 'trial',
    mode: 'offline',
    title: '科学实验：火山大爆发',
    subtitle: '动手做一次“安全喷发”',
    emoji: '🌋',
    ageMin: 5,
    ageMax: 10,
    startOffsetDays: 2,
    startHour: 14,
    durationHours: 1,
    price: 29.9,
    originalPrice: 199,
    quota: 10,
    enrolled: 4,
    tags: ['science'],
    introduction:
      '经典科学启蒙实验课。孩子将亲手搭建火山模型，用酸碱反应模拟喷发，理解化学反应与地质构造的有趣联系，并把实验盒带回家。',
    notice: '实验材料由机构提供；请穿不怕弄脏的衣服；实验有轻微气味，敏感儿童请提前告知。',
    address: '北京市朝阳区大悦城写字楼 B 座 12 层',
    sessions: [
      { id: 'act-103-s1', label: '周五 16:30 场', weekday: 5, hour: 16, minute: 30, durationHours: 1, quota: 10, enrolled: 4 },
    ],
  },
  {
    id: 'act-104',
    orgId: 'org-3',
    orgName: '小天鹅艺术中心',
    category: 'trial',
    mode: 'offline',
    title: '创意美术体验课',
    subtitle: '一块画布，一个故事',
    emoji: '🎨',
    ageMin: 4,
    ageMax: 8,
    startOffsetDays: 4,
    startHour: 10,
    durationHours: 1.5,
    price: 0,
    originalPrice: 168,
    quota: 8,
    enrolled: 6,
    tags: ['art'],
    introduction:
      '免费公益体验课。以“我的家庭”为主题进行自由创作，老师引导孩子观察与表达，课后为家长解读孩子的画面语言。',
    notice: '免费名额有限，请按时到场；画材由机构提供；作品可带走。',
    address: '北京市朝阳区望京 SOHO T1 2201',
  },
  {
    id: 'act-105',
    orgId: 'org-4',
    orgName: '启航少儿体育',
    category: 'open-course',
    mode: 'offline',
    title: '少儿体能公开课',
    subtitle: '跑、跳、爬，释放能量',
    emoji: '🏃',
    ageMin: 4,
    ageMax: 12,
    startOffsetDays: 3,
    startHour: 15,
    durationHours: 1,
    price: 0,
    originalPrice: 128,
    quota: 20,
    enrolled: 12,
    tags: ['sports'],
    introduction:
      '面向 4-12 岁的免费体能公开课，按年龄分组进行灵敏、平衡与协调训练，教练同步讲解家庭运动建议。',
    notice: '请穿运动服与运动鞋；自带水杯；体能不佳或近期伤病请提前告知教练。',
    address: '北京市丰台区丽泽体育场 2 号馆',
  },
  {
    id: 'act-106',
    orgId: 'org-6',
    orgName: '阳光亲子俱乐部',
    category: 'parent-child',
    mode: 'offline',
    title: '周末亲子露营会',
    subtitle: '搭帐篷、点篝火、数星星',
    emoji: '⛺',
    ageMin: 3,
    ageMax: 12,
    startOffsetDays: 6,
    startHour: 14,
    durationHours: 22,
    price: 199,
    originalPrice: 458,
    quota: 15,
    enrolled: 9,
    tags: ['nature', 'sports'],
    introduction:
      '一夜露营亲子活动：亲子协作搭帐篷、篝火晚会、夜观星空与晨间徒步。费用含场地、餐食与装备租赁（一大一小）。',
    notice: '自驾前往；营地有热水与卫生间；夜间温度较低，请为孩子准备保暖睡袋。',
    address: '北京市昌平区十三陵镇亲子营地',
  },
  {
    id: 'act-107',
    orgId: 'org-6',
    orgName: '阳光亲子俱乐部',
    category: 'study-tour',
    mode: 'offline',
    title: '自然探索一日研学',
    subtitle: '像博物学家一样观察秋天',
    emoji: '🍂',
    ageMin: 6,
    ageMax: 12,
    startOffsetDays: 7,
    startHour: 8,
    durationHours: 9,
    price: 258,
    originalPrice: 480,
    quota: 24,
    enrolled: 16,
    tags: ['nature', 'science'],
    introduction:
      '跟随自然老师进入山区步道，学习使用放大镜、望远镜与观察手账，完成“植物标本 + 鸟类观察”双任务，往返大巴含午餐。',
    notice: '集合点地铁口发车；请穿长裤运动鞋；山地信号弱，请准时归队。',
    address: '北京市门头沟区妙峰山自然营地（集合点：金安桥地铁站）',
  },
  {
    id: 'act-108',
    orgId: 'org-5',
    orgName: '悦读星球英文馆',
    category: 'open-course',
    mode: 'online',
    title: '英文绘本公开课：The Very Hungry Caterpillar',
    subtitle: '和外教一起“吃”出一周单词',
    emoji: '🐛',
    ageMin: 3,
    ageMax: 8,
    startOffsetDays: 1,
    startHour: 20,
    durationHours: 0.5,
    price: 0,
    originalPrice: 99,
    quota: 100,
    enrolled: 47,
    tags: ['english'],
    introduction:
      '30 分钟免费线上公开课。外教以经典绘本带孩子认识一周七天与食物单词，家长同步获得亲子共读指导。',
    notice: '开课前 15 分钟进入教室；需要麦克风权限；课后领取绘本拓展包。',
    address: '线上直播',
    onlineLink: 'https://live.zhiya.example/caterpillar',
  },
  {
    id: 'act-109',
    orgId: 'org-1',
    orgName: '童程未来少儿编程',
    category: 'trial',
    mode: 'offline',
    title: '机器人搭建体验课',
    subtitle: '从零件到会动的机器人',
    emoji: '🤖',
    ageMin: 6,
    ageMax: 12,
    startOffsetDays: 4,
    startHour: 14,
    durationHours: 1.5,
    price: 39,
    originalPrice: 299,
    quota: 10,
    enrolled: 3,
    tags: ['robotics', 'programming'],
    introduction:
      '使用积木式机器人套件，完成一辆可以避障的小车。孩子将理解传感器、马达与程序的关系，体验“物理世界编程”。',
    notice: '套件由机构提供；适合动手能力较强的孩子；家长可观摩最后 20 分钟成果展示。',
    address: '北京市海淀区中关村大街 27 号 3 层',
  },
  {
    id: 'act-110',
    orgId: 'org-3',
    orgName: '小天鹅艺术中心',
    category: 'exhibition',
    mode: 'offline',
    title: '美术馆儿童展览导览团',
    subtitle: '把看展变成一场寻宝',
    emoji: '🖼️',
    ageMin: 5,
    ageMax: 12,
    startOffsetDays: 8,
    startHour: 13,
    durationHours: 2,
    price: 49,
    originalPrice: 128,
    quota: 15,
    enrolled: 8,
    tags: ['art'],
    introduction:
      '专业儿童导览老师带领参观当季儿童艺术展，设置“寻找名画细节”任务卡，结束后亲子共创一幅小作品。',
    notice: '门票自理（儿童免票）；请提前 15 分钟在美术馆前台集合。',
    address: '北京市朝阳区今日美术馆 2 号馆',
  },
  {
    id: 'act-111',
    orgId: 'org-1',
    orgName: '童程未来少儿编程',
    category: 'training',
    mode: 'offline',
    title: '少儿围棋思维训练营',
    subtitle: '五天入门，一生受用的思维运动',
    emoji: '⚫',
    ageMin: 5,
    ageMax: 12,
    startOffsetDays: 10,
    startHour: 9,
    durationHours: 2,
    price: 199,
    originalPrice: 899,
    quota: 16,
    enrolled: 6,
    tags: ['thinking'],
    introduction:
      '五天营地式训练营：规则入门 → 吃子技巧 → 布局思维 → 对抗实战 → 结业小比赛，锻炼专注力与计算力。',
    notice: '连续五天上课；棋具由机构提供；结业颁发等级证书。',
    address: '北京市海淀区中关村大街 27 号 5 层',
  },
  {
    id: 'act-112',
    orgId: 'org-5',
    orgName: '悦读星球英文馆',
    category: 'competition',
    mode: 'offline',
    title: '"用英语讲中国故事"初选',
    subtitle: '3 分钟英文演讲，展示孩子自己',
    emoji: '🎤',
    ageMin: 7,
    ageMax: 14,
    startOffsetDays: 12,
    startHour: 10,
    durationHours: 3,
    price: 69,
    originalPrice: 198,
    quota: 40,
    enrolled: 22,
    tags: ['english', 'drama'],
    introduction:
      '市级展演活动初选。每位选手 3 分钟英文自我展示，评委现场点评并给出晋级建议，所有选手获得电子参演证书。',
    notice: '题目自选（中国节日/我的家乡/我最爱的书）；可带道具；家长可进入观赛。',
    address: '北京市西城区文化中心小剧场',
  },
];

const PACKAGE_SEEDS: readonly ExperiencePackage[] = [
  {
    id: 'pkg-201',
    title: '儿童科技探索体验包',
    emoji: '🚀',
    summary: '编程、机器人、科学实验、创意美术一次体验，找到孩子的兴趣方向。',
    ageMin: 5,
    ageMax: 12,
    price: 99,
    originalPrice: 399,
    validDays: 90,
    purchasedCount: 326,
    activityIds: ['act-101', 'act-109', 'act-103', 'act-104'],
  },
  {
    id: 'pkg-202',
    title: '周末亲子成长体验包',
    emoji: '🦆',
    summary: '露营、研学、展览导览三大亲子场景，把周末过成小假期。',
    ageMin: 3,
    ageMax: 12,
    price: 159,
    originalPrice: 598,
    validDays: 60,
    purchasedCount: 158,
    activityIds: ['act-106', 'act-107', 'act-110'],
  },
];

const GOODS_SEEDS: readonly Goods[] = [
  {
    id: 'goods-301',
    title: '家庭科学实验套装 · 100 个小实验',
    emoji: '🧫',
    category: 'science',
    price: 129,
    originalPrice: 199,
    summary: '与科学盒子实验课配套的家庭版材料盒。',
    detail:
      '包含 100 个安全科学小实验的材料与图文视频教程，覆盖化学反应、物理现象与自然观察，适合 5-12 岁儿童在家长陪同下操作。',
    spec: '材料盒 ×1 / 图文手册 ×1 / 视频课程卡 ×1',
    sales: 1204,
  },
  {
    id: 'goods-302',
    title: 'Scratch 少儿编程启蒙教材',
    emoji: '📗',
    category: 'books',
    price: 45,
    originalPrice: 59,
    summary: '编程体验课课后练习的官方配套教材。',
    detail: '12 个项目式章节，从第一个动画到完整小游戏，配扫码视频讲解，与线下体验课大纲一一对应。',
    spec: '16 开 / 188 页 / 全彩印刷',
    sales: 862,
  },
  {
    id: 'goods-303',
    title: '儿童绘画蜡笔 48 色',
    emoji: '🖍️',
    category: 'painting',
    price: 29.9,
    originalPrice: 49,
    summary: '创意美术课同款，可水洗不脏手。',
    detail: '48 色丝滑蜡笔，附赠填色本一本，笔身圆润防戳伤，可水洗配方，画到衣服桌面上也能轻松清洗。',
    spec: '48 色 / 填色本 ×1',
    sales: 2310,
  },
  {
    id: 'goods-304',
    title: '入门机器人拼装套件',
    emoji: '🛠️',
    category: 'robotics',
    price: 199,
    originalPrice: 299,
    summary: '机器人体验课同款教具家庭版。',
    detail: '可搭建 6 种造型，含主控、马达与红外传感器，图形化编程 App 配套，支持体验课后续课程全部项目。',
    spec: '零件 218 件 / 充电电池 ×1',
    sales: 536,
  },
  {
    id: 'goods-305',
    title: '错题整理笔记本套装',
    emoji: '📓',
    category: 'stationery',
    price: 15.9,
    originalPrice: 25,
    summary: '语数英三科分册，养成整理好习惯。',
    detail: '语/数/英三科分册设计，左右分区记录原题与反思，附订正计划打卡表，适合小学中高年级。',
    spec: 'A5 / 三册装',
    sales: 3305,
  },
  {
    id: 'goods-306',
    title: '儿童护眼学习台灯',
    emoji: '💡',
    category: 'supplies',
    price: 89,
    originalPrice: 139,
    summary: '网课晚写作业都舒服的光线。',
    detail: 'AA 级照度，无频闪无可视频闪，色温三档调节，60 秒延时关灯，学习网课两相宜。',
    spec: 'AA 级照度 / 三档色温 / Type-C 供电',
    sales: 987,
  },
  {
    id: 'goods-307',
    title: '围棋入门教具套装',
    emoji: '⚫',
    category: 'teaching-aids',
    price: 69,
    originalPrice: 99,
    summary: '思维训练营课后对弈套装。',
    detail: '19 路磁性折叠棋盘配双面棋子，附《亲子对弈入门 20 课》小册子，方便家庭复盘练习。',
    spec: '折叠棋盘 / 棋子 361 颗 / 手册 ×1',
    sales: 431,
  },
  {
    id: 'goods-308',
    title: 'Python 趣味编程练习册',
    emoji: '🐍',
    category: 'programming',
    price: 39,
    originalPrice: 55,
    summary: 'Python 直播营配套课后练习。',
    detail: '40 个阶梯式练习项目，配在线判题码，每章附“家长陪读指南”，与四周直播营进度同步。',
    spec: '16 开 / 132 页 / 附在线题库',
    sales: 645,
  },
];

const COUPON_TEMPLATES: readonly CouponTemplate[] = [
  {
    id: 'tpl-newbie',
    title: '新人立减券',
    scope: 'platform',
    amountOff: 10,
    minSpend: 0,
    validDays: 30,
    total: 10000,
    claimed: 3612,
    newbieOnly: true,
  },
  {
    id: 'tpl-platform-30',
    title: '平台满 199 减 30',
    scope: 'platform',
    amountOff: 30,
    minSpend: 199,
    validDays: 15,
    total: 5000,
    claimed: 2041,
    newbieOnly: false,
  },
  {
    id: 'tpl-org-1-20',
    title: '童程未来编程专享券',
    scope: 'org',
    orgId: 'org-1',
    amountOff: 20,
    minSpend: 0,
    validDays: 30,
    total: 500,
    claimed: 187,
    newbieOnly: false,
  },
  {
    id: 'tpl-act-103-5',
    title: '火山实验课立减 5 元',
    scope: 'activity',
    activityId: 'act-103',
    amountOff: 5,
    minSpend: 0,
    validDays: 7,
    total: 100,
    claimed: 43,
    newbieOnly: false,
  },
  {
    id: 'tpl-pkg-201-15',
    title: '科技探索体验包立减 15',
    scope: 'package',
    packageId: 'pkg-201',
    amountOff: 15,
    minSpend: 0,
    validDays: 30,
    total: 300,
    claimed: 88,
    newbieOnly: false,
  },
];

function buildSessions(spec: ActivitySpec, from: Date): ActivitySession[] {
  if (spec.sessions === undefined) {
    const start = addDays(new Date(from), spec.startOffsetDays);
    start.setHours(spec.startHour, 0, 0, 0);
    const end = new Date(start.getTime() + spec.durationHours * 3_600_000);
    return [
      {
        id: `${spec.id}-s1`,
        label: '正场次',
        startTime: iso(start),
        endTime: iso(end),
        quota: spec.quota,
        enrolled: Math.min(spec.enrolled, spec.quota),
      },
    ];
  }
  return spec.sessions.map((session) => {
    const start = nextWeekday(from, session.weekday, session.hour, session.minute);
    const end = new Date(start.getTime() + session.durationHours * 3_600_000);
    return {
      id: session.id,
      label: session.label,
      startTime: iso(start),
      endTime: iso(end),
      quota: session.quota,
      enrolled: session.enrolled,
    };
  });
}

export function buildSeedCatalog(context: SeedContext): {
  orgs: Org[];
  activities: Activity[];
  packages: ExperiencePackage[];
  goods: Goods[];
  couponTemplates: CouponTemplate[];
} {
  const now = context.now();
  const activities: Activity[] = ACTIVITY_SPECS.map((spec) => {
    const start = addDays(new Date(now), spec.startOffsetDays);
    start.setHours(spec.startHour, 0, 0, 0);
    const end = new Date(start.getTime() + spec.durationHours * 3_600_000);
    return {
      id: spec.id,
      orgId: spec.orgId,
      orgName: spec.orgName,
      category: spec.category,
      mode: spec.mode,
      title: spec.title,
      subtitle: spec.subtitle,
      emoji: spec.emoji,
      ageMin: spec.ageMin,
      ageMax: spec.ageMax,
      startTime: iso(start),
      endTime: iso(end),
      address: spec.address,
      onlineLink: spec.onlineLink,
      price: spec.price,
      originalPrice: spec.originalPrice,
      quota: spec.quota,
      enrolled: spec.enrolled,
      tags: spec.tags,
      introduction: spec.introduction,
      notice: spec.notice,
      status: 'published',
      orgCreated: false,
      sessions: buildSessions(spec, now),
      createdAt: iso(now),
    };
  });
  return {
    orgs: [...ORGS],
    activities,
    packages: [...PACKAGE_SEEDS],
    goods: [...GOODS_SEEDS],
    couponTemplates: [...COUPON_TEMPLATES],
  };
}

export function buildWelcomeMessage(now: Date): Message {
  return {
    id: 'msg-welcome',
    category: 'system',
    title: '欢迎来到知鸭',
    body: '知孩子，也知教育。先为孩子添加资料，再看看附近的体验课吧！',
    createdAt: iso(now),
    read: false,
  };
}
