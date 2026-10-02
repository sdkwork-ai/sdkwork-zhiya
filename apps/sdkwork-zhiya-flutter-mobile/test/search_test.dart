// Activity keyword search tests (PRD §7.2/§32): keyword filters title, org,
// introduction, and tags — shared behavior across surfaces.
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_zhiya_flutter_mobile_core/sdkwork_zhiya_flutter_mobile_core.dart';

void main() {
  late MockZhiyaClient client;

  setUp(() {
    client = MockZhiyaClient(now: () => DateTime(2026, 10, 2, 10));
  });

  test('keyword_filters_activities_by_title_and_org', () {
    final all = client.listActivities();
    expect(all.length, greaterThan(3));

    final byTitle = client.listActivities(keyword: 'Scratch');
    expect(byTitle.every((activity) => activity.title.contains('Scratch')), isTrue);
    expect(byTitle, isNotEmpty);

    final byOrg = client.listActivities(keyword: '科学盒子');
    expect(byOrg.every((activity) => activity.orgName.contains('科学盒子')), isTrue);
    expect(byOrg, isNotEmpty);
  });

  test('keyword_composes_with_category_and_free_filters', () {
    final combined = client.listActivities(category: 'trial', keyword: '火山');
    expect(combined.map((activity) => activity.id), contains('act-103'));

    final noMatch = client.listActivities(freeOnly: true, keyword: ' Scratch');
    expect(noMatch, isEmpty);
  });

  test('empty_keyword_returns_the_unfiltered_list', () {
    expect(client.listActivities(keyword: ' ').length, equals(client.listActivities().length));
  });
}
