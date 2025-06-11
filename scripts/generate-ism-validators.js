import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chainMetadata } from "@hyperlane-xyz/registry";
import { defaultMultisigConfigs } from "@hyperlane-xyz/sdk";
import { getAbacusWorksChainNames } from "./registry.js";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output folder
const validatorsBase = path.join(
  __dirname,
  "../docs/reference/addresses/validators"
);

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
  // Create the output directory if it doesn't exist
  fs.mkdirSync(validatorsBase, { recursive: true });

  const environments = [
    {
      name: "mainnet",
      isTestnet: false,
      filename: "mainnet-default-ism-validators.mdx",
    },
    {
      name: "testnet",
      isTestnet: true,
      filename: "testnet-default-ism-validators.mdx",
    },
  ];

  for (const env of environments) {
    const chains = getChains(env.isTestnet);
    const content = `---
title: "${capitalize(env.name)}"
description: "Default ISM validator configurations for ${env.name} chains"
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

    const filePath = path.join(validatorsBase, env.filename);
    fs.writeFileSync(filePath, content.trim() + "\n", "utf-8");
    console.log(`✅ Wrote ${env.filename} to validators/`);
  }
}

// Run the generator
generateDefaultIsmDocs().catch(console.error);
