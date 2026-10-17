# Change Log

All notable changes to the "scorpio" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Initial release

### Security

- Gradle prewarm's execution of the cloned repository's `./gradlew` wrapper is now configurable
  via the `GRADLE_PREWARM_AUTO_CONFIRM` environment variable. It defaults to `true` (prewarm runs
  automatically, so the long first build is still skipped where exercise templates are provisioned
  by a trusted platform). Set it to `false` to require the student to explicitly confirm before any
  repository-controlled Gradle build is executed, removing the silent remote-code-execution path
  for deployments that do not trust templates. `GRADLE_PREWARM=off` still disables prewarm entirely.
- The VCS/Git access token is no longer embedded in the clone URL or passed on the git command
  line. It is injected through the git process environment (`GIT_CONFIG_*`) during clone and
  persisted only into `.git/config` for later in-IDE fetch/push.
- STOMP/WebSocket frame logging is disabled so the Artemis JWT in the CONNECT frame is never
  written to the debug console.
- The `ARTEMIS_URL` environment override is validated against the configured Artemis origin
  (scheme + host + port) before it is used as the API base, preventing the Bearer token from
  being sent to an untrusted host.
