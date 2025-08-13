import { chainAddresses, chainMetadata } from "@hyperlane-xyz/registry";

const ABACUS_WORKS_DEPLOYER_NAME = "abacus works";
const CHAIN_STATUS = "disabled";

// Chains that Abacus Works has deployed (formerly known as 'core' chains)
export function getAbacusWorksChains(isTestnet = false, requireMailbox = true) {
  return Object.values(chainMetadata).filter((metadata) => {
    // Filter to chains whose deployer is Abacus Works
    const isRightDeployer =
      metadata.deployer?.name.trim().toLowerCase() ===
      ABACUS_WORKS_DEPLOYER_NAME;

    // Filter to only mainnets or testnets
    const isRightChainType = !!metadata.isTestnet === isTestnet;

    // If required, filter to chains that have a mailbox addresses in the registry
    const hasMailboxAddress =
      !requireMailbox || !!chainAddresses[metadata.name]?.mailbox;

    // Filter out chains that have status: disabled
    const isNotDisabled = metadata.availability?.status !== CHAIN_STATUS;

    return (
      isRightDeployer && isRightChainType && hasMailboxAddress && isNotDisabled
    );
  });
}

export function getAbacusWorksChainNames(isTestnet = false) {
  return getAbacusWorksChains(isTestnet).map((metadata) => metadata.name);
}
