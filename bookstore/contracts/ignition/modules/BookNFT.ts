import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BookNFTModule", (m) => {
  const bookNFT = m.contract("BookNFT");

  // m.call(bookNFT, "mintBook", ["https://example.com/metadata"]);

  return { bookNFT };
});
