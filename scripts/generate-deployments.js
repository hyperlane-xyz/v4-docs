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
  const environments = [
    { name: "mainnet", isTestnet: false },
    { name: "testnet", isTestnet: true },
  ];

  for (const env of environments) {
    const outDir = path.join(outputBase, env.name);
    fs.mkdirSync(outDir, { recursive: true });

    const chains = getChains(env.isTestnet);

    for (const key of CONTRACT_KEYS) {
      const rows = generateTableRows(chains, key);
      if (!rows) continue;

      const frontmatter = `---
title: "${capitalize(key)}"
description: "${capitalize(key)} deployments on ${capitalize(env.name)}"
---`;

      const tableHeader = `| Chain | Domain ID | Chain ID | Address | Explorer |
|-------|-----------|----------|---------|----------|`;

      const content = `${frontmatter}

${tableHeader}
${rows}
`;

      const filePath = path.join(outDir, `${key}.mdx`);
      fs.writeFileSync(filePath, content.trim() + "\n", "utf-8");
      console.log(`✅ Wrote ${key}.mdx to deployments/${env.name}/`);
    }
  }
}

// Run the generator
generateDeploymentDocs().catch(console.error);
