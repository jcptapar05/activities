import { Book, ContractBook } from "@/lib/types"
import BookStore from "@/utils/BookStore.json"
import { ethers } from "ethers"
import { toast } from "sonner"
export const CONTRACT_ADDRESS = "0xBdeAB1b84741e40039194F9C5662076da5880151"

const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
]

export const ipfsToGateway = (uri: string, gatewayIndex = 0) => {
  if (!uri.startsWith("ipfs://")) return uri
  const cid = uri.replace("ipfs://", "")
  return `${IPFS_GATEWAYS[gatewayIndex]}${cid}`
}

export const fetchBooks = async (ownerAddress?: string): Promise<Book[]> => {
  if (!window.ethereum) throw new Error("MetaMask not found")

  const provider = new ethers.BrowserProvider(window.ethereum)
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    BookStore.abi,
    provider
  )

  let books: ContractBook[]

  try {
    if (ownerAddress && ethers.isAddress(ownerAddress)) {
      console.log("Fetching books for owner:", ownerAddress)
      books = await contract.getBooksByOwner(ownerAddress)
      console.log("Books by owner:", books)
    } else {
      console.log("Fetching all books")
      books = await contract.getAllBooks()
      console.log("All books:", books)
    }
  } catch (error) {
    console.error("Error fetching books:", error)
    books = await contract.getAllBooks()
  }

  const booksWithMetadata = await Promise.all(
    books.map(async (book, index) => {
      try {
        return {
          id: Number(book.id),
          title: book.title,
          author: book.authorName,
          price: Number(ethers.formatEther(book.price)),
          image: ipfsToGateway(book.image),
          genre: book.genre || "Unknown",
          isbn: book.isbn || "",
          owner: book.owner,
          listed: book.listed,
          createdAt: Date.now() - index * 86400000,
        }
      } catch (error) {
        return {
          id: Number(book.id),
          title: book.title,
          author: book.authorName,
          price: Number(ethers.formatEther(book.price)),
          image: ipfsToGateway(book.image),
          owner: book.owner,
          listed: book.listed,
          createdAt: Date.now() - index * 86400000,
        }
      }
    })
  )
  return booksWithMetadata
}

export const fetchOwnedBooks = async (userAddress: string): Promise<Book[]> => {
  if (!window.ethereum) throw new Error("MetaMask not found")
  if (!userAddress) return []

  const provider = new ethers.BrowserProvider(window.ethereum)
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    BookStore.abi,
    provider
  )

  const books: ContractBook[] = await contract.getBooksByOwner(userAddress)

  return books.map((book) => ({
    id: Number(book.id),
    title: book.title,
    author: book.authorName,
    price: Number(ethers.formatEther(book.price)),
    image: ipfsToGateway(book.image),
    listed: book.listed,
    owner: book.owner,
    genre: book.genre || "Unknown",
    isbn: book.isbn || "",
  }))
}

function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask is not installed.")
  return new ethers.BrowserProvider(window.ethereum)
}

async function getSignerContract() {
  const provider = getProvider()
  const signer = await provider.getSigner()
  return new ethers.Contract(CONTRACT_ADDRESS, BookStore.abi, signer)
}

function getReadonlyContract() {
  const provider = getProvider()
  return new ethers.Contract(CONTRACT_ADDRESS, BookStore.abi, provider)
}

export async function viewBook(id: number): Promise<void> {
  const contract = getReadonlyContract()
  const book = await contract.getBook(id)
  if (!book?.bookfile) return
  window.open(book.bookfile, "_blank")
}

export async function listBook(id: number, price: string): Promise<void> {
  if (!price || parseFloat(price) <= 0) {
    toast("Please enter a valid price")
    return
  }
  const contract = await getSignerContract()
  const priceInWei = ethers.parseEther(price)
  const tx = await contract.listBook(id, priceInWei)
  await tx.wait()
  toast("Book listed successfully!")
}

export async function buyBook(id: number, price: string): Promise<void> {
  const contract = await getSignerContract()
  const priceInWei = ethers.parseEther(price.toString())
  const tx = await contract.buyBook(id, { value: priceInWei })
  await tx.wait()
  toast("Book purchased successfully!")
}

export async function unlistBook(id: number): Promise<void> {
  const contract = await getSignerContract()
  const tx = await contract.cancelListing(id)
  await tx.wait()
  toast("Book unlisted successfully!")
}
