import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chainAddresses, chainMetadata } from "@hyperlane-xyz/registry";
import { getAbacusWorksChainNames } from "./registry.js";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output folder
const outputBase = path.join(
  __dirname,
  "../docs/reference/addresses/deployments"
);

// Define contract types to generate tables for
const CONTRACT_KEYS = [
  "mailbox",
  "interchainAccountRouter",
  "interchainGasPaymaster",
  "validatorAnnounce",
  "merkleTreeHook",
  "proxyAdmin",
  "storageGasOracle",
  "testRecipient",
];

// Utility
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Get chains for a specific environment
function getChains(isTestnet) {
  const chainNames = getAbacusWorksChainNames(isTestnet);
  return chainNames.map((name) => chainMetadata[name]);
}

// Generates an MDX table body string
function generateTableRows(chains, contractKey) {
  return chains
    .map((chain) => {
      const address = chainAddresses[chain.name]?.[contractKey];
      if (!address) return null;

      const displayName = chain.displayName || capitalize(chain.name);
      const domainId = chain.domainId ?? "N/A";
      const chainId = chain.chainId ?? "N/A";
      const explorerUrl = chain.blockExplorers?.[0]?.url ?? "";
      const explorer = explorerUrl
        ? `[${new URL(explorerUrl).hostname}](${explorerUrl})`
        : "N/A";

      return `| ${displayName} | ${domainId} | ${chainId} | \`${address}\` | ${explorer} |`;
    })
    .filter(Boolean)
    .join("\n");
}

// Main generator
async function generateDeploymentDocs() {
  // Create the output directory if it doesn't exist
  fs.mkdirSync(outputBase, { recursive: true });

  const mainnetChains = getChains(false);
  const testnetChains = getChains(true);

  for (const key of CONTRACT_KEYS) {
    const mainnetRows = generateTableRows(mainnetChains, key);
    const testnetRows = generateTableRows(testnetChains, key);

    // Skip if no deployments found for either environment
    if (!mainnetRows && !testnetRows) continue;

    const content = `---
title: "${capitalize(key)}"
description: "${capitalize(key)} deployments across Mainnet and Testnet"
---

## Mainnet

| Chain | Domain ID | Chain ID | Address | Explorer |
|-------|-----------|----------|---------|----------|
${mainnetRows}

## Testnet

| Chain | Domain ID | Chain ID | Address | Explorer |
|-------|-----------|----------|---------|----------|
${testnetRows}
`;

    const filePath = path.join(outputBase, `${key}.mdx`);
    fs.writeFileSync(filePath, content.trim() + "\n", "utf-8");
    console.log(`✅ Wrote ${key}.mdx to deployments/`);
  }
}

// Run the generator
generateDeploymentDocs().catch(console.error);
