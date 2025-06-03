import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chainMetadata } from "@hyperlane-xyz/registry";
import { getAbacusWorksChainNames } from "./registry.js";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output folder
const latenciesBase = path.join(
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

// Generates an MDX table body string for reorg periods
function generateTableRows(chains) {
  return chains
    .map((chain) => {
      const displayName = chain.displayName || capitalize(chain.name);
      const domainId = chain.domainId ?? "N/A";
      const reorgPeriod = chain.blocks?.reorgPeriod ?? "N/A";
      const blockTime = chain.blocks?.estimateBlockTime ?? "N/A";

      return `| ${displayName} | ${domainId} | ${reorgPeriod} | ${blockTime} |`;
    })
    .join("\n");
}

// Main generator
async function generateLatencyDocs() {
  // Create the output directory if it doesn't exist
  fs.mkdirSync(latenciesBase, { recursive: true });

  const mainnetChains = getChains(false);
  const testnetChains = getChains(true);

  const mainnetRows = generateTableRows(mainnetChains);
  const testnetRows = generateTableRows(testnetChains);

  const content = `---
title: "Latencies"
---

Validators must wait a certain number of blocks to be mined before they are considered valid and [reorg-safe](https://www.alchemy.com/overviews/what-is-a-reorg). Without this, validators could be slashed since they may have signed a checkpoint that is no longer valid.

Refer to the following sections for block finality configuration used by the Hyperlane validators.

<Tabs>
  <Tab title="Mainnet">
    | Chain | Domain | Reorg Period (blocks) | Estimated Block Time (seconds) |
    |-------|--------|----------------------|-------------------------------|
    ${mainnetRows}
  </Tab>
  
  <Tab title="Testnet">
    | Chain | Domain | Reorg Period (blocks) | Estimated Block Time (seconds) |
    |-------|--------|----------------------|-------------------------------|
    ${testnetRows}
  </Tab>
</Tabs>
`;

  const filePath = path.join(latenciesBase, "latencies.mdx");
  fs.writeFileSync(filePath, content.trim() + "\n", "utf-8");
  console.log(`✅ Wrote latencies.mdx to latencies/`);
}

// Run the generator
generateLatencyDocs().catch(console.error);
