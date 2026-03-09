/** A user profile returned from the smart contract */
export interface ChatUser {
  name: string;
  ipfs: string;
  isUser: boolean;
  wallet: string;
}

/** A friend entry (same shape as ChatUser) */
export interface Friend {
  name: string;
  ipfs: string;
  isUser: boolean;
  wallet: string;
}

/** A raw message returned from the contract */
export interface ChatMessage {
  /** Unix timestamp in ms (or the chatId used as one) */
  chatId: bigint | number | string;
  sender: string;
  receiver: string;
  message: string;
}

/**
 * Extend the browser Window type to include MetaMask's ethereum provider.
 * Typed to satisfy ethers' Eip1193Provider contract so no casts are needed.
 */
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (eventName: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (eventName: string, handler: (...args: unknown[]) => void) => void;
      send?: (method: string, params?: unknown[]) => Promise<unknown>;
      /** Required by ethers BrowserProvider */
      isMetaMask?: boolean;
    };
  }
}

