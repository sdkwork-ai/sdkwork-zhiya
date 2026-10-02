/// Runtime environment identity (SOURCE_CONFIG_SPEC / ENVIRONMENT_SPEC §5.1),
/// read from `--dart-define-from-file env/sdkwork.<profileId>.json`.
library;

class ZhiyaRuntimeEnvironment {
  const ZhiyaRuntimeEnvironment({
    required this.environment,
    required this.deploymentProfile,
    required this.profileId,
    required this.runtimeTarget,
  });

  final String environment;
  final String deploymentProfile;
  final String profileId;
  final String runtimeTarget;

  static const ZhiyaRuntimeEnvironment fallback = ZhiyaRuntimeEnvironment(
    environment: 'development',
    deploymentProfile: 'standalone',
    profileId: 'standalone.development',
    runtimeTarget: 'flutter-android',
  );

  factory ZhiyaRuntimeEnvironment.fromDefines() {
    const fallbackIdentity = (
      environment: String.fromEnvironment('SDKWORK_ENVIRONMENT', defaultValue: 'development'),
      deploymentProfile: String.fromEnvironment('SDKWORK_DEPLOYMENT_PROFILE', defaultValue: 'standalone'),
      profileId: String.fromEnvironment('SDKWORK_PROFILE_ID', defaultValue: 'standalone.development'),
      runtimeTarget: String.fromEnvironment('SDKWORK_RUNTIME_TARGET', defaultValue: 'flutter-android'),
    );
    return ZhiyaRuntimeEnvironment(
      environment: fallbackIdentity.environment,
      deploymentProfile: fallbackIdentity.deploymentProfile,
      profileId: fallbackIdentity.profileId,
      runtimeTarget: fallbackIdentity.runtimeTarget,
    );
  }
}
