import { Book, ContractBook } from "@/lib/types"
import BookStore from "@/utils/BookStore.json"
import { ethers } from "ethers"
import { toast } from "sonner"
import { z } from "zod"
import { uploadFileToIPFS, uploadJSONToIPFS } from "./pinata"
import { GENRES } from "@/utils/genre"

// You can move these constants to contract.ts as well
export const MAX_IMAGE_SIZE_MB = 10
export const MAX_BOOK_SIZE_MB = 50
export const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024
export const MAX_BOOK_BYTES = MAX_BOOK_SIZE_MB * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]

export const CONTRACT_ADDRESS = "0xBdeAB1b84741e40039194F9C5662076da5880151"

export const ISBN_REGEX = /^(?:\d{9}[\dX]|\d{13})$/

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

const RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`

export const fetchBooks = async (ownerAddress?: string): Promise<Book[]> => {
  let provider

  try {
    if (typeof window !== "undefined" && window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum)
    } else {
      provider = new ethers.JsonRpcProvider(RPC_URL)
    }

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
      console.error("Error fetching specific books, fallback to all:", error)
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
          console.error("Error parsing book:", error)
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
  } catch (error) {
    console.error("Fatal error fetching books:", error)
    throw error
  }
}

export const createBookFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  authorName: z
    .string()
    .min(1, "Author name is required")
    .max(100, "Author name must be less than 100 characters"),
  isbn: z
    .string()
    .refine((val) => val === "" || ISBN_REGEX.test(val), {
      message: "Please enter a valid ISBN-10 or ISBN-13",
    })
    .optional()
    .default(""),
  genre: z.enum(GENRES).optional(),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Price must be a positive number",
    }),
  listed: z.boolean().default(true),
  coverImage: z
    .instanceof(File, { message: "Cover image is required" })
    .refine((f) => ACCEPTED_IMAGE_TYPES.includes(f.type), {
      message: "Cover must be a JPEG, PNG, WebP, or GIF",
    })
    .refine((f) => f.size <= MAX_IMAGE_BYTES, {
      message: `Cover image must be smaller than ${MAX_IMAGE_SIZE_MB}MB`,
    }),
  bookfile: z
    .instanceof(File, { message: "Book file is required" })
    .refine((f) => f.type === "application/pdf", {
      message: "Book file must be a PDF",
    })
    .refine((f) => f.size <= MAX_BOOK_BYTES, {
      message: `Book file must be smaller than ${MAX_BOOK_SIZE_MB}MB`,
    }),
})

export type CreateBookFormValues = z.infer<typeof createBookFormSchema>

export interface CreateBookResult {
  txHash: string
  image: string
  metadataUrl: string
}

export async function createBookNFT(
  values: CreateBookFormValues,
  signer: ethers.Signer
): Promise<CreateBookResult> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.")
  }

  const cleanTitle = values.title.trim()
  const cleanAuthorName = values.authorName.trim()

  let imageGatewayUrl: string
  let bookfileGatewayUrl: string
  let metadataGatewayUrl: string

  try {
    imageGatewayUrl = ipfsToGateway(await uploadFileToIPFS(values.coverImage))
    bookfileGatewayUrl = ipfsToGateway(await uploadFileToIPFS(values.bookfile))
  } catch (err) {
    throw new Error("Failed to upload files to IPFS. Please try again.")
  }

  try {
    const metadata = {
      name: cleanTitle,
      description: `${cleanTitle} by ${cleanAuthorName}`,
      image: imageGatewayUrl,
      bookfile: bookfileGatewayUrl,
      attributes: [
        { trait_type: "Author", value: cleanAuthorName },
        { trait_type: "ISBN", value: values.isbn || "N/A" },
        { trait_type: "Genre", value: values.genre },
        { trait_type: "Listed", value: values.listed ? "Yes" : "No" },
      ],
    }
    metadataGatewayUrl = ipfsToGateway(await uploadJSONToIPFS(metadata))
  } catch (err) {
    throw new Error("Failed to upload metadata to IPFS. Please try again.")
  }

  const provider = signer.provider as ethers.BrowserProvider
  const userAddress = await signer.getAddress()

  const contract = new ethers.Contract(CONTRACT_ADDRESS, BookStore.abi, signer)

  const finalPrice = values.listed ? ethers.parseEther(values.price) : 0n

  const tx = await contract.mint(
    userAddress,
    cleanTitle,
    cleanAuthorName,
    finalPrice,
    imageGatewayUrl,
    bookfileGatewayUrl,
    metadataGatewayUrl,
    values.genre,
    values.isbn || "N/A"
  )

  // Wait for receipt safely
  let receipt: ethers.TransactionReceipt | null = null

  try {
    receipt = await tx.wait()
  } catch (_waitErr) {
    // tx.wait() threw — poll for the receipt manually
    receipt = await provider.getTransactionReceipt(tx.hash)
  }

  // If receipt is still null, keep polling up to ~30 s
  if (!receipt) {
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      receipt = await provider.getTransactionReceipt(tx.hash)
      if (receipt) break
    }
  }

  // Genuine on-chain failure
  if (!receipt || receipt.status === 0) {
    throw new Error("Transaction failed on-chain. Please try again.")
  }

  return {
    txHash: tx.hash,
    image: imageGatewayUrl,
    metadataUrl: metadataGatewayUrl,
  }
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
