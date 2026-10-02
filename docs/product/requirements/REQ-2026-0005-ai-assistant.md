| Field | Value |
| --- | --- |
| ID | REQ-2026-0005 |
| Title | 问知鸭 AI：问答 + 活动搜索 + 推荐 + 体验计划 (PRD §14, §50) |
| Status | implemented (rule-based mock) |
| Updated | 2026-10-02 |

# REQ-2026-0005: 问知鸭 AI Assistant

## Requirement

- AI Tab 对话入口，示例问题引导（8 岁孩子适合学什么？/ 周末有什么亲子活动？/ 预算 100 元周末体验计划）。
- 自然语言意图识别（年龄段/分类/预算/时间/免费），检索在架活动并推荐，推荐卡可直接去报名。
- 按预算生成 4 周体验计划（PRD §14.2 AI体验计划）。

## Acceptance

- 意图识别为纯函数并测试覆盖；推荐必须来自真实（mock）在架活动数据。
