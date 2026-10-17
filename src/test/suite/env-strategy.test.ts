import * as assert from "assert";

import {
  DEFAULT_GRADLE_PREWARM_AUTO_CONFIRM,
  KNOWN_ENV_KEYS,
  parseTheiaEnv,
} from "../../theia/env-strategy";

suite("env-strategy GIT_TOKEN handling", () => {
  test("parseTheiaEnv returns GIT_TOKEN when present", () => {
    const parsed = parseTheiaEnv({
      THEIA: "1",
      ARTEMIS_TOKEN: undefined,
      ARTEMIS_URL: undefined,
      GIT_URI: "https://gitea.example.com/course/repo.git",
      GIT_USER: "student",
      GIT_MAIL: "student@example.com",
      GIT_TOKEN: "gitea-oidc-token",
      GRADLE_PREWARM: "daemon",
    });

    assert.strictEqual(parsed.GIT_TOKEN, "gitea-oidc-token");
  });

  test("GIT_TOKEN is queried by the env strategy", () => {
    // GIT_TOKEN must be fetched when available (it is part of the queried key set),
    // even though it is optional.
    assert.ok(KNOWN_ENV_KEYS.has("GIT_TOKEN"), "GIT_TOKEN must be among the queried keys");
  });

  test("GIT_TOKEN is optional: a payload without it still parses to a valid env", () => {
    // The data-bridge readiness gate is injection-based (it proceeds once the bridge reports
    // an applied injection) and therefore never requires GIT_TOKEN. Parsing a full payload
    // that omits GIT_TOKEN must still yield a complete, valid TheiaEnv with GIT_TOKEN unset.
    const parsed = parseTheiaEnv({
      THEIA: "1",
      ARTEMIS_TOKEN: "artemis-token",
      ARTEMIS_URL: "https://artemis.example.com",
      GIT_URI: "https://gitea.example.com/course/repo.git",
      GIT_USER: "student",
      GIT_MAIL: "student@example.com",
      GRADLE_PREWARM: "daemon",
    });

    assert.strictEqual(parsed.GIT_TOKEN, undefined);
    assert.strictEqual(parsed.THEIA_FLAG, true);
    assert.strictEqual(parsed.ARTEMIS_TOKEN, "artemis-token");
    assert.strictEqual(parsed.GIT_USER, "student");
    assert.strictEqual(parsed.GRADLE_PREWARM, "daemon");
  });
});

suite("env-strategy GRADLE_PREWARM_AUTO_CONFIRM handling", () => {
  function parse(value: string | undefined) {
    return parseTheiaEnv({
      THEIA: "1",
      GRADLE_PREWARM: "daemon",
      GRADLE_PREWARM_AUTO_CONFIRM: value,
    }).GRADLE_PREWARM_AUTO_CONFIRM;
  }

  test("defaults to automatic prewarm (true) when unset", () => {
    assert.strictEqual(DEFAULT_GRADLE_PREWARM_AUTO_CONFIRM, true);
    assert.strictEqual(parse(undefined), true);
  });

  test("is queried by the env strategy", () => {
    assert.ok(
      KNOWN_ENV_KEYS.has("GRADLE_PREWARM_AUTO_CONFIRM"),
      "GRADLE_PREWARM_AUTO_CONFIRM must be among the queried keys",
    );
  });

  test("parses falsy values as false (require confirmation)", () => {
    for (const value of ["false", "0", "no", "off", "FALSE", " Off "]) {
      assert.strictEqual(parse(value), false, `"${value}" should disable auto-confirm`);
    }
  });

  test("parses truthy values as true", () => {
    for (const value of ["true", "1", "yes", "on", "TRUE"]) {
      assert.strictEqual(parse(value), true, `"${value}" should enable auto-confirm`);
    }
  });

  test("falls back to the default on an unrecognized value", () => {
    assert.strictEqual(parse("maybe"), DEFAULT_GRADLE_PREWARM_AUTO_CONFIRM);
  });
});
