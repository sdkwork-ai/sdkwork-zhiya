# Product Roadmap

Phases follow PRD §2/§44/§50.

| Phase | Scope | State |
| --- | --- | --- |
| P0 (this repo, `0.1.x`) | 登录、家庭/儿童、首页、活动列表/详情/搜索、报名、支付（mock）、我的活动、核销、评价、优惠券、消息、机构工作台（活动 CRUD/报名管理/核销）、AI 问答/搜索/推荐（rule-based）—— **四个端全部落地**：H5（主端）+ PC（导航栏桌面布局）+ 微信小程序（5 Tab + detail 分包，`wx.*` 仅经类型化宿主适配）+ Flutter 移动端（Dart 域模型镜像 + 路由对齐测试）；商业化路径见 PRD §43（活动佣金 → 体验包分账 → 商城佣金 → 机构 SaaS → AI 增值） | implemented against mock services |
| P1 | AI 升级（LLM 网关）、体验包购买与权益预约、多机构联合体验、商城交易、机构聊天、AI 机构客服、平台运营后台（独立 PC surface） | planned |
| P2 | 城市体验通票、AI 家庭教育档案、AI 学习规划、AI 成长分析、AI 营销/生成活动、推荐系统升级、cloud 部署 profile | planned |

Platform wiring (IAM, payment, IM transport, LLM gateway) lands with the
`cloud` deployment profile in P1; the current milestone is standalone with
mock-backed services (`TECH_ARCHITECTURE.md` §5).
