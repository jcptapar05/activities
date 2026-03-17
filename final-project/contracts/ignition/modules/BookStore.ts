import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BookStoreModule", (m) => {
  const bookStore = m.contract("BookStore");

  return { bookStore };
});
