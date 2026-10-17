import * as assert from "assert";

import { GradlePrewarmEffects, warmupGradleDaemon } from "../../participation/gradle.service";

type RunCall = { projectPath: string; args: string[]; level: string };

function makeEffects(overrides: Partial<GradlePrewarmEffects>) {
  const runCalls: RunCall[] = [];
  const effects: GradlePrewarmEffects = {
    gradlewExists: () => true,
    confirm: async () => true,
    makeExecutable: () => {},
    run: (projectPath, args, level) => {
      runCalls.push({ projectPath, args, level });
    },
    ...overrides,
  };
  return { effects, runCalls };
}

suite("warmupGradleDaemon confirmation gate (GRADLE_PREWARM_AUTO_CONFIRM=false)", () => {
  test("does not run the Gradle wrapper when the user declines", async () => {
    const { effects, runCalls } = makeEffects({ confirm: async () => false });

    await warmupGradleDaemon("/repo", "daemon", false, effects);

    assert.strictEqual(runCalls.length, 0, "no build may start without confirmation");
  });

  test("runs the Gradle wrapper only after explicit confirmation", async () => {
    const { effects, runCalls } = makeEffects({ confirm: async () => true });

    await warmupGradleDaemon("/repo", "daemon", false, effects);

    assert.strictEqual(runCalls.length, 1);
    assert.deepStrictEqual(runCalls[0].args, ["--daemon", "help"]);
  });

  test("treats a confirmation failure as a decline", async () => {
    const { effects, runCalls } = makeEffects({
      confirm: async () => {
        throw new Error("prompt failed");
      },
    });

    await warmupGradleDaemon("/repo", "deps", false, effects);

    assert.strictEqual(runCalls.length, 0);
  });
});

suite("warmupGradleDaemon auto-confirm (GRADLE_PREWARM_AUTO_CONFIRM=true, default)", () => {
  test("runs the Gradle wrapper without prompting", async () => {
    let prompted = false;
    const { effects, runCalls } = makeEffects({
      confirm: async () => {
        prompted = true;
        return true;
      },
    });

    await warmupGradleDaemon("/repo", "full", true, effects);

    assert.strictEqual(prompted, false, "auto-confirm must not prompt the student");
    assert.strictEqual(runCalls.length, 1);
    assert.deepStrictEqual(runCalls[0].args, ["--daemon", "build", "-x", "test"]);
  });
});

suite("warmupGradleDaemon skip conditions", () => {
  test("never prompts or runs when prewarming is disabled", async () => {
    let prompted = false;
    const { effects, runCalls } = makeEffects({
      confirm: async () => {
        prompted = true;
        return true;
      },
    });

    await warmupGradleDaemon("/repo", "off", false, effects);

    assert.strictEqual(prompted, false, "disabled prewarm must not prompt");
    assert.strictEqual(runCalls.length, 0);
  });

  test("does not run when the project has no gradlew, even with auto-confirm", async () => {
    const { effects, runCalls } = makeEffects({ gradlewExists: () => false });

    await warmupGradleDaemon("/repo", "full", true, effects);

    assert.strictEqual(runCalls.length, 0, "non-Gradle project must not build");
  });
});
