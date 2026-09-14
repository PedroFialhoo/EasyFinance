const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const frontendDir = path.resolve(__dirname, "..");
const backendDir = path.resolve(frontendDir, "..", "backend");
const isWindows = process.platform === "win32";
const command = isWindows ? "cmd.exe" : "./mvnw";
const args = isWindows ? ["/d", "/s", "/c", "mvnw.cmd package"] : ["package"];
const result = spawnSync(command, args, {
  cwd: backendDir,
  stdio: "inherit",
});

if (result.error || result.status !== 0) {
  process.exit(result.status || 1);
}

const source = path.join(backendDir, "target", "easyfinance-1.0.0.jar");
const destination = path.join(frontendDir, "backend", "easyfinance.jar");
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);
