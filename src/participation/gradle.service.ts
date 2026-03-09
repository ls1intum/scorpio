import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

/**
 * Pre-warms the Gradle daemon in the background after cloning a repository.
 * This avoids the ~3s daemon initialization overhead on the first build.
 *
 * Silently skips if:
 * - Running on Windows (not a supported environment)
 * - The project does not contain a `gradlew` file (not a Gradle project)
 */
export function warmupGradleDaemon(projectPath: string): void {
  if (process.platform === "win32") {
    return;
  }

  const gradlewPath = path.join(projectPath, "gradlew");
  if (!fs.existsSync(gradlewPath)) {
    return;
  }

  try {
    fs.chmodSync(gradlewPath, 0o755);

    const child = spawn("./gradlew", ["--daemon"], {
      cwd: projectPath,
      detached: true,
      stdio: "ignore",
    });
    child.unref();
  } catch (error: any) {
    console.warn(`Gradle daemon warmup failed: ${error.message}`);
  }
}
