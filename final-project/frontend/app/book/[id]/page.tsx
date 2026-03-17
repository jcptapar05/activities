"use client"

import { useQuery } from "@tanstack/react-query"
import { ethers } from "ethers"
import { useParams } from "next/navigation"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import BookStore from "@/utils/BookStore.json"
import { CONTRACT_ADDRESS } from "@/lib/contract"

const ipfsToGateway = (uri: string) => {
  if (!uri.startsWith("ipfs://")) return uri
  return `https://gateway.pinata.cloud/ipfs/${uri.replace("ipfs://", "")}`
}

const fetchBook = async (id: string) => {
  if (!window.ethereum) throw new Error("MetaMask not found")

  const provider = new ethers.BrowserProvider(window.ethereum)

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    BookStore.abi,
    provider
  )

  const book = await contract.getBook(id)

  return {
    id: Number(book.id),
    title: book.title,
    author: book.authorName,
    price: ethers.formatEther(book.price),
    image: ipfsToGateway(book.image),
    listed: book.listed,
    owner: book.owner,
    genre: book.metadata?.genre,
    isbn: book.metadata?.isbn,
  }
}

const BookDetailsPage = () => {
  const params = useParams()
  const id = params.id as string

  const {
    data: book,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["book", id],
    queryFn: () => fetchBook(id),
  })

  if (isLoading) return <p>Loading book...</p>
  if (error || !book) return <p>Book not found</p>

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <Card className="overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={book.image}
              alt={book.title}
              fill
              className="object-cover"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {book.listed && <Badge>Listed</Badge>}
            {book.genre && <Badge variant="outline">{book.genre}</Badge>}
          </div>

          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
            {book.title}
          </h1>

          <p className="text-lg text-muted-foreground">by {book.author}</p>

          {book.isbn && book.isbn !== "N/A" && (
            <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>
          )}
        </div>

        <div className="flex items-center gap-6 pt-4">
          {book.listed ? (
            <p className="text-3xl font-bold">{book.price} ETH</p>
          ) : (
            <p className="text-lg text-muted-foreground">Not for sale</p>
          )}

          {book.listed && <Button size="lg">Buy Book</Button>}
        </div>

        <p className="truncate text-xs text-muted-foreground">
          Owner: {book.owner}
        </p>
      </div>
    </div>
  )
}

export default BookDetailsPage
