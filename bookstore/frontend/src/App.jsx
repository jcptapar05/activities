import { useState, useEffect } from "react";
import WalletConnect from "./pages/WalletConnect";
import BookUploadForm from "./pages/BookUploadForm";
import contractData from "./utils/BookNFT.json";
import { ethers } from "ethers";

const ADDRESS = "0x730C937FCB0A91d82962F66E782dcBBb6813d55E";
const contractABI = contractData.abi;

function resolveIPFS(uri) {
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  }
  return uri;
}

function App() {
  const [account, setAccount] = useState(null);
  const [books, setBooks] = useState([]);

  async function fetchUserNFTs(userAddress) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(ADDRESS, contractABI, provider);

    const filter = contract.filters.BookMinted(null, userAddress);
    const events = await contract.queryFilter(filter);

    const nfts = await Promise.all(
      events.map(async (event) => {
        const tokenId = event.args.tokenId;
        const tokenURI = await contract.tokenURI(tokenId);

        const metadataUrl = resolveIPFS(tokenURI);
        const metadata = await fetch(metadataUrl).then((res) => res.json());

        return {
          tokenId: tokenId.toString(),
          metadata,
        };
      }),
    );

    return nfts;
  }

  useEffect(() => {
    if (!account) return;

    let ignore = false;

    async function loadNFTs() {
      try {
        const nfts = await fetchUserNFTs(account);
        if (!ignore) {
          setBooks(nfts);
        }
      } catch (error) {
        console.error("Failed to fetch NFTs:", error);
      }
    }

    loadNFTs();

    return () => {
      ignore = true;
    };
  }, [account]);

  return (
    <div>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
        <h1 className="text-3xl font-bold mb-6">📚 BookNFT Publisher</h1>
        <WalletConnect
          account={account}
          setAccount={setAccount}
        />
        {account && <BookUploadForm account={account} />}
      </div>

      <div className="flex flex-col items-center p-6">
        <ul>
          {books.map((book) => (
            <li key={book.tokenId}>{book.metadata?.book_title || "Untitled Book"}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
