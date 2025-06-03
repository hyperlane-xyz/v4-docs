import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chainMetadata } from "@hyperlane-xyz/registry";
import { defaultMultisigConfigs } from "@hyperlane-xyz/sdk";
import { getAbacusWorksChainNames } from "./registry.js";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output folders
const validatorsBase = path.join(
  __dirname,
  "../docs/reference/addresses/validators"
);
const mainnetOutput = path.join(validatorsBase, "mainnet");
const testnetOutput = path.join(validatorsBase, "testnet");

// Utility
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Get chains for a specific environment
function getChains(isTestnet) {
  const chainNames = getAbacusWorksChainNames(isTestnet);
  return chainNames.map((name) => chainMetadata[name]);
}

// Generates an MDX table body string for validators
function generateValidatorTable(chain, config) {
  const { name, displayName, domainId } = chain;
  const displayChainName = displayName ?? capitalize(name);

  return `## ${displayChainName} (${domainId})

Threshold: ${config.threshold} of ${config.validators.length}

| Operator | Address |
|----------|---------|
${config.validators
  .map(({ address, alias }) => `| ${alias} | \`${address}\` |`)
  .join("\n")}
`;
}

// Main generator
async function generateDefaultIsmDocs() {
  // Create the output directories if they don't exist
  fs.mkdirSync(mainnetOutput, { recursive: true });
  fs.mkdirSync(testnetOutput, { recursive: true });

  const environments = [
    {
      name: "mainnet",
      isTestnet: false,
      outputDir: mainnetOutput,
    },
    {
      name: "testnet",
      isTestnet: true,
      outputDir: testnetOutput,
    },
  ];

  for (const env of environments) {
    const chains = getChains(env.isTestnet);
    const content = `---
title: "Default ISM Validators"
---

${chains
  .map((chain) => {
    const config = defaultMultisigConfigs[chain.name];
    if (!config || (env.name === "mainnet" && config.validators.length <= 1))
      return null;
    return generateValidatorTable(chain, config);
  })
  .filter(Boolean)
  .join("\n")}
`;

    const filePath = path.join(env.outputDir, "default-ism-validators.mdx");
    fs.writeFileSync(filePath, content.trim() + "\n", "utf-8");
    console.log(
      `✅ Wrote default-ism-validators.mdx to validators/${env.name}/`
    );
  }
}

// Run the generator
generateDefaultIsmDocs().catch(console.error);
