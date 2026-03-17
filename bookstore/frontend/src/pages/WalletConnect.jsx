import { useEffect } from "react";

export default function WalletConnect({ setAccount, account }) {
  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (err) {
        console.error("User rejected connection:", err);
      }
    } else {
      alert("Please install MetaMask");
    }
  }

  // Handle account change from MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    }
  }, [setAccount]);

  return (
    <div className="bg-[linear-gradient(90deg,rgba(255,94,0,1)_60%,rgba(0,0,194,1)_85%,rgba(7,0,71,1)_100%)] p-6 shadow-md w-full mb-6 flex flex-col items-center">
      <h2 className="text-xl text-white font-bold mb-4">🔗 Wallet Connection</h2>

      {account ? (
        <div className="w-full text-center">
          <p className="text-green-600 font-semibold mb-2">✅ Connected</p>
          <div className="px-3 py-2 text-lg text-white">{account}</div>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md"
        >
          Connect MetaMask
        </button>
      )}
    </div>
  );
}
