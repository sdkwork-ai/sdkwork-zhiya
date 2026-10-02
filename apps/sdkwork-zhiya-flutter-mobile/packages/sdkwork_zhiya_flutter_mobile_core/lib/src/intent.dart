/// Rule-based zh-CN intent recognizer for 问知鸭 (PRD §14, §32) — the Dart
/// port of `@sdkwork/zhiya-intent-core`. Pure functions only; behavior is
/// pinned by `test/intent_test.dart`.
library;

/// Structured search intent extracted from a free-form query.
class ActivityIntent {
  ActivityIntent({
    this.age,
    this.budgetMax,
    List<String> categories = const [],
    List<String> tags = const [],
    this.mode,
    this.freeOnly = false,
    this.time,
    List<String> keywords = const [],
    this.wantsPlan = false,
  })  : categories = List.unmodifiable(categories),
        tags = List.unmodifiable(tags),
        keywords = List.unmodifiable(keywords);

  final int? age;
  final int? budgetMax;
  final List<String> categories;
  final List<String> tags;
  final String? mode;
  final bool freeOnly;
  /// `today | weekend | weekday | holiday`.
  final String? time;
  final List<String> keywords;
  final bool wantsPlan;

  bool get isEmpty =>
      age == null &&
      budgetMax == null &&
      categories.isEmpty &&
      tags.isEmpty &&
      mode == null &&
      !freeOnly &&
      time == null &&
      !wantsPlan;
}

class _CategoryRule {
  const _CategoryRule(this.category, this.patterns);
  final String category;
  final List<String> patterns;
}

const List<_CategoryRule> _categoryRules = [
  _CategoryRule('trial', ['体验课', '试听', '体验班']),
  _CategoryRule('online-course', ['线上课', '线上课程', '网课', '直播课']),
  _CategoryRule('open-course', ['公开课', '讲座']),
  _CategoryRule('parent-child', ['亲子', '带娃', '遛娃']),
  _CategoryRule('study-tour', ['研学', '游学']),
  _CategoryRule('summer-camp', ['夏令营']),
  _CategoryRule('winter-camp', ['冬令营']),
  _CategoryRule('competition', ['比赛', '竞赛', '考级']),
  _CategoryRule('exhibition', ['展览', '展会', '博物馆', '美术馆']),
  _CategoryRule('training', ['训练营', '集训', '培训班']),
];

class _TagRule {
  const _TagRule(this.tag, this.patterns);
  final String tag;
  final List<String> patterns;
}

const List<_TagRule> _tagRules = [
  _TagRule('programming', ['编程', 'scratch', 'python', '代码']),
  _TagRule('robotics', ['机器人']),
  _TagRule('science', ['科学', '实验', 'stem']),
  _TagRule('art', ['美术', '绘画', '画画', '艺术', '创意']),
  _TagRule('music', ['音乐', '钢琴', '乐器', '声乐']),
  _TagRule('english', ['英语', '英文']),
  _TagRule('sports', ['体育', '运动', '游泳', '篮球', '足球', '体能']),
  _TagRule('thinking', ['思维', '逻辑', '数学思维', '围棋']),
  _TagRule('drama', ['戏剧', '表演', '口才', '主持']),
  _TagRule('nature', ['自然', '户外', '露营', '农耕']),
];

String _stripAll(String input, List<String> patterns) {
  var result = input;
  for (final pattern in patterns) {
    result = result.replaceAll(pattern, ' ');
  }
  return result;
}

/// Recognize the activity-search intent of a free-form zh query.
ActivityIntent recognizeActivityIntent(String rawQuery) {
  final query = rawQuery.toLowerCase().trim();
  if (query.isEmpty) {
    return ActivityIntent();
  }

  var rest = query;
  int? age;
  int? budgetMax;
  final categories = <String>[];
  final tags = <String>[];
  String? mode;
  var freeOnly = false;
  String? time;
  var wantsPlan = false;

  final ageMatch = RegExp(r'(\d{1,2})\s*岁').firstMatch(rest);
  if (ageMatch != null) {
    final parsed = int.tryParse(ageMatch.group(1)!);
    if (parsed != null && parsed >= 1 && parsed <= 18) {
      age = parsed;
      rest = rest.replaceRange(ageMatch.start, ageMatch.end, ' ');
    }
  }

  for (final pattern in [
    RegExp(r'预算\s*(\d{1,5})\s*(?:元|块)?'),
    RegExp(r'(\d{1,5})\s*(?:元|块)\s*(?:以内|以下|之内)'),
    RegExp(r'(?:不超过|最多)\s*(\d{1,5})\s*(?:元|块)?'),
  ]) {
    final match = pattern.firstMatch(rest);
    final raw = match?.group(1);
    if (raw != null) {
      final value = int.tryParse(raw);
      if (value != null && value > 0) {
        budgetMax = value;
        rest = rest.replaceRange(match!.start, match.end, ' ');
        break;
      }
    }
  }

  for (final rule in _categoryRules) {
    if (rule.patterns.any(rest.contains)) {
      categories.add(rule.category);
      rest = _stripAll(rest, rule.patterns);
    }
  }
  for (final rule in _tagRules) {
    if (rule.patterns.any(rest.contains)) {
      tags.add(rule.tag);
      rest = _stripAll(rest, rule.patterns);
    }
  }

  if (rest.contains('线上')) {
    mode = 'online';
    rest = rest.replaceAll('线上', ' ');
  } else if (rest.contains('线下')) {
    mode = 'offline';
    rest = rest.replaceAll('线下', ' ');
  }

  if (rest.contains('免费')) {
    freeOnly = true;
    rest = rest.replaceAll('免费', ' ');
  }

  if (['今天', '今日', '明天'].any(rest.contains)) {
    time = 'today';
    rest = _stripAll(rest, ['今天', '今日', '明天']);
  } else if (['周末', '周六', '周日', '星期六', '星期日'].any(rest.contains)) {
    time = 'weekend';
    rest = _stripAll(rest, ['周末', '周六', '周日', '星期六', '星期日']);
  } else if (['假期', '节假日', '寒假', '暑假', '国庆', '五一'].any(rest.contains)) {
    time = 'holiday';
    rest = _stripAll(rest, ['假期', '节假日', '寒假', '暑假', '国庆', '五一']);
  }

  if (RegExp(r'(计划|安排|规划|搭配|组合)').hasMatch(rest)) {
    wantsPlan = true;
    rest = rest.replaceAll(RegExp(r'(体验?计划|安排|规划|搭配|组合)'), ' ');
  }

  final keywords = rest
      .split(RegExp(r'''[\s，。！？,.!?、：:；;（）()【】\[\]{}"'·…—]+'''))
      .map((String keyword) => keyword.trim())
      .where((String keyword) => keyword.isNotEmpty)
      .toList();

  return ActivityIntent(
    age: age,
    budgetMax: budgetMax,
    categories: categories,
    tags: tags,
    mode: mode,
    freeOnly: freeOnly,
    time: time,
    keywords: keywords,
    wantsPlan: wantsPlan,
  );
}
