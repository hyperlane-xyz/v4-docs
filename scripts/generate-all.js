import { execSync } from "child_process";

const scripts = [
  "generate-deployments.js",
  "generate-ism-validators.js",
  "generate-latencies.js",
  "generate-domains.js",
];

console.log("🚀 Running all documentation generators...\n");

for (const script of scripts) {
  try {
    console.log(`📝 Running ${script}...`);
    execSync(`node ${script}`, { stdio: "inherit" });
    console.log(`✅ ${script} completed\n`);
  } catch (error) {
    console.error(`❌ ${script} failed:`, error.message);
    process.exit(1);
  }
}

console.log("🎉 All documentation generated successfully!");
