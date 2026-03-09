import { BrowserProvider, Contract } from "ethers";
import { chatAbi } from "./chatAbi";

const contractAddress = process.env.NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS!;

export async function getChatContractWithSigner() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new Contract(contractAddress, chatAbi, signer);
}

export async function getChatContractReadOnly() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = new BrowserProvider(window.ethereum);
  return new Contract(contractAddress, chatAbi, provider);
}
