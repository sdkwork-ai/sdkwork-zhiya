/// Mock session store for the Zhiya Flutter surface (PRD §3.1 P0 登录).
/// Phase 1: any phone + 6-digit code signs in (mock); Phase 2 swaps the body
/// for the IAM login integration — the store shape is the seam.
library;

/// Signed-in family account (mock 用户体系).
class ZhiyaSessionUser {
  const ZhiyaSessionUser({required this.phone, required this.nickname});

  final String phone;
  final String nickname;
}

class ZhiyaAuthStore {
  ZhiyaAuthStore._();

  ZhiyaSessionUser? user;

  static final ZhiyaAuthStore instance = ZhiyaAuthStore._();

  bool get isSignedIn => user != null;

  /// Mock sign-in: the demo environment accepts any valid phone + code pair.
  ZhiyaSessionUser signIn({required String phone, required String code}) {
    final normalized = phone.trim();
    final next = ZhiyaSessionUser(phone: normalized, nickname: '鸭家长${normalized.substring(normalized.length - 4)}');
    user = next;
    return next;
  }

  void signOut() {
    user = null;
  }
}
