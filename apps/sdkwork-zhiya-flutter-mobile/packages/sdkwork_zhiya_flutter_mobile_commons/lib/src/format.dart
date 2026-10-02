/// Format helpers shared by the Zhiya Flutter screens.
library;

/// `19` → `¥19`; `29.9` → `¥29.9`; `0` → `免费`.
String formatPrice(double value) {
  if (value == 0) {
    return '免费';
  }
  final text = value == value.roundToDouble() ? value.toStringAsFixed(0) : value.toStringAsFixed(value * 10 % 1 == 0 ? 1 : 2);
  return '¥$text';
}

/// `M/D HH:mm` in local time.
String formatStart(DateTime value) {
  String pad(int input) => input.toString().padLeft(2, '0');
  return '${value.month}/${value.day} ${pad(value.hour)}:${pad(value.minute)}';
}

/// Remaining-quota sentence (PRD §7.3).
String quotaLabel(int quota, int enrolled) {
  final remaining = quota - enrolled;
  return remaining <= 0 ? '已满员' : '仅剩$remaining个名额';
}

const Map<String, String> kCategoryLabels = {
  'trial': '体验课',
  'online-course': '线上课程',
  'open-course': '公开课',
  'parent-child': '亲子活动',
  'study-tour': '研学',
  'summer-camp': '夏令营',
  'winter-camp': '冬令营',
  'competition': '比赛',
  'exhibition': '展览',
  'training': '训练营',
  'other': '其他',
};

const Map<String, String> kStageLabels = {
  'kindergarten': '幼儿园',
  'primary-low': '小学低年级',
  'primary-high': '小学高年级',
  'junior': '初中',
  'senior': '高中',
};
