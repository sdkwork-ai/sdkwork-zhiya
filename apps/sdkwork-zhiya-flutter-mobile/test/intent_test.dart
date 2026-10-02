// Intent recognizer tests: the PRD §14/§32 example queries must produce the
// structured intents the AI assistant and search rely on.
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

void main() {
  test('parses_the_prd_age_example', () {
    final intent = recognizeActivityIntent('我家孩子8岁，喜欢动手，周末想找点有趣的课程。');
    expect(intent.age, equals(8));
    expect(intent.time, equals('weekend'));
    expect(intent.isEmpty, isFalse);
  });

  test('parses_budget_and_plan_demand_from_the_prd_plan_example', () {
    final intent = recognizeActivityIntent('预算100元，帮我安排一个周末体验计划。');
    expect(intent.budgetMax, equals(100));
    expect(intent.time, equals('weekend'));
    expect(intent.wantsPlan, isTrue);
  });

  test('recognizes_categories_tags_mode_and_free_demand', () {
    final intent = recognizeActivityIntent('想找免费的线上编程亲子活动');
    expect(intent.categories, contains('parent-child'));
    expect(intent.tags, contains('programming'));
    expect(intent.mode, equals('online'));
    expect(intent.freeOnly, isTrue);
  });

  test('recognizes_science_direction_and_weekend_time', () {
    final intent = recognizeActivityIntent('周六适合7岁孩子的科学类活动');
    expect(intent.age, equals(7));
    expect(intent.tags, contains('science'));
    expect(intent.time, equals('weekend'));
  });

  test('returns_an_empty_intent_for_blank_queries', () {
    expect(recognizeActivityIntent('   ').isEmpty, isTrue);
  });
}
