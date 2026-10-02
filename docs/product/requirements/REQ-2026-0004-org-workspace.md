| Field | Value |
| --- | --- |
| ID | REQ-2026-0004 |
| Title | 机构工作台：活动 CRUD + 报名管理 + 核销 (PRD §22, §44 P0) |
| Status | implemented (mock-backed, embedded H5) |
| Updated | 2026-10-02 |

# REQ-2026-0004: Organization Workspace

## Requirement

- 工作台指标：今日报名/待核销/销售额/在架活动/机构评分（PRD §22.1）。
- 活动 CRUD：新建/编辑/上架/下架/删除，状态 草稿/已上架/已下架（PRD §22.2 简化子集）；上架后 C 端可见可报名。
- 报名管理：按活动查看报名（儿童/凭证/状态），扫码/输入凭证核销，活动结束确认（PRD §22.4/§11）。

## Acceptance

- 机构创建的活动即时进入 C 端活动列表；核销与 C 端订单状态联动。
