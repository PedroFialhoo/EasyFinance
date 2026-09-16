const fs = require("fs");
const path = require("path");

const frontendDir = path.resolve(__dirname, "..");
const source = process.env.EASYFINANCE_JRE_PATH || "C:/Java/jdk-21.0.9+10/jre";
const destination = path.join(frontendDir, "jre");

if (!fs.existsSync(source)) {
  console.error("JRE nao encontrado. Defina EASYFINANCE_JRE_PATH com o caminho do JRE.");
  process.exit(1);
}

fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(source, destination, {
  recursive: true,
  dereference: true,
  // Ubuntu's JDK package ships this as a broken source-archive symlink.
  filter: (src) => path.basename(src) !== "src.zip",
});
