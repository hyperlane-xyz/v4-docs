import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chainMetadata } from "@hyperlane-xyz/registry";
import { getAbacusWorksChainNames } from "./registry.js";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output folder
const domainsBase = path.join(__dirname, "../snippets/addresses");

// Utility
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Get chains for a specific environment
function getChains(isTestnet) {
  const chainNames = getAbacusWorksChainNames(isTestnet);
  return chainNames.map((name) => chainMetadata[name]);
}

// Generates an MDX table body string for domain identifiers
function generateTableRows(chains) {
  return chains
    .sort((a, b) => {
      const nameA = a.displayName || capitalize(a.name);
      const nameB = b.displayName || capitalize(b.name);
      return nameA.localeCompare(nameB);
    })
    .map((chain) => {
      const displayName = chain.displayName || capitalize(chain.name);
      const domainId = chain.domainId ?? "N/A";
      return `| ${displayName} | ${domainId} |`;
    })
    .join("\n");
}

// Main generator
async function generateDomainsDocs() {
  // Create the output directory if it doesn't exist
  fs.mkdirSync(domainsBase, { recursive: true });

  const mainnetChains = getChains(false);
  const testnetChains = getChains(true);

  const mainnetRows = generateTableRows(mainnetChains);
  const testnetRows = generateTableRows(testnetChains);

  const content = `
## Mainnet

| Network | Domain Identifier (uint32) |
|---------|---------------------------|
${mainnetRows}

## Testnet

| Network | Domain Identifier (uint32) |
|---------|---------------------------|
${testnetRows}
`;

  const filePath = path.join(domainsBase, "domains.mdx");
  fs.writeFileSync(filePath, content.trim() + "\n", "utf-8");
  console.log(`✅ Wrote domains.mdx to reference/`);
}

// Run the generator
generateDomainsDocs().catch(console.error);
