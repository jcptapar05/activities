// lib/ethers.ts
import { BrowserProvider, Contract, JsonRpcProvider } from "ethers"
import { CONTRACT_ABI, CONTRACT_ADDRESS, SEPOLIA_RPC_URL } from "./contract"

declare global {
  interface Window {
    ethereum?: any
  }
}

export async function getBrowserProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed")
  }
  return new BrowserProvider(window.ethereum)
}

export async function requestWallet() {
  const provider = await getBrowserProvider()
  await provider.send("eth_requestAccounts", [])
  const network = await provider.getNetwork()

  if (Number(network.chainId) !== 11155111) {
    throw new Error("Please switch to Sepolia")
  }

  const signer = await provider.getSigner()
  const address = await signer.getAddress()

  return { provider, signer, address }
}

export async function getWriteContract() {
  const { signer } = await requestWallet()
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
}

export function getReadContract() {
  const provider = new JsonRpcProvider(SEPOLIA_RPC_URL)
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
}
