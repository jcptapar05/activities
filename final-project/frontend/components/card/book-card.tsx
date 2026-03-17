"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { IconCurrencyEthereum } from "@tabler/icons-react"
import { toast } from "sonner"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Book } from "@/lib/types"
import useAccount from "@/stores/Account"
import { viewBook, listBook, buyBook, unlistBook } from "@/lib/contract"

interface BookCardProps {
  book: Book
  refetch: () => void
}

const BookCard = ({ book, refetch }: BookCardProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showPriceInput, setShowPriceInput] = useState(false)
  const [price, setPrice] = useState("")

  const { account } = useAccount()

  const isOwner = useMemo(
    () =>
      !!account &&
      !!book.owner &&
      (account as string).toLowerCase() === book.owner.toLowerCase(),
    [account, book.owner]
  )

  async function withLoading(fn: () => Promise<void>) {
    try {
      setIsLoading(true)
      await fn()
      refetch()
    } catch (error) {
      console.error(error)
      toast("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = () => withLoading(() => viewBook(book.id))

  const handleBuy = () =>
    withLoading(() => buyBook(book.id, book.price.toString()))

  const handleUnlist = () => withLoading(() => unlistBook(book.id))

  const handleList = () =>
    withLoading(async () => {
      await listBook(book.id, price)
      setShowPriceInput(false)
      setPrice("")
    })

  const handleSellClick = () => setShowPriceInput(true)

  const handleCancelSell = () => {
    setShowPriceInput(false)
    setPrice("")
  }

  const showViewBtn = isOwner && !showPriceInput
  const showSellBtn = isOwner && !book.listed && !showPriceInput
  const showUnlistBtn = isOwner && book.listed
  const showBuyBtn = !isOwner && book.listed
  const showPriceForm = isOwner && !book.listed && showPriceInput

  return (
    <Card className="group overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <Image
          src={book.image}
          alt={book.title}
          width={300}
          height={200}
          className="h-[200px] w-full object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      </div>
      <CardContent className="space-y-1 px-4 pt-4">
        <h3 className="line-clamp-1 text-base font-semibold tracking-tight">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground">{book.author}</p>
        <p className="text-sm text-muted-foreground">{book.genre}</p>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-3 px-4 pt-2 pb-4">
        <div className="flex w-full items-center justify-between">
          {!showPriceInput && (
            <span className="flex items-center gap-1 bg-gradient-to-r from-violet-500 via-purple-400 to-yellow-400 bg-clip-text text-lg font-bold text-transparent">
              <IconCurrencyEthereum className="text-violet-500" />
              {book.price}
            </span>
          )}

          {account != "" && (
            <div>
              {showViewBtn && (
                <ActionButton onClick={handleView} loading={isLoading}>
                  View Book
                </ActionButton>
              )}

              {showSellBtn && (
                <ActionButton onClick={handleSellClick} loading={isLoading}>
                  Sell
                </ActionButton>
              )}

              {showUnlistBtn && (
                <ActionButton onClick={handleUnlist} loading={isLoading}>
                  Unlist
                </ActionButton>
              )}

              {showBuyBtn && (
                <ActionButton onClick={handleBuy} loading={isLoading}>
                  Buy
                </ActionButton>
              )}

              {showPriceForm && (
                <div className="flex w-full items-center gap-2">
                  <Input
                    type="number"
                    step="0.00001"
                    min="0"
                    placeholder="Price in ETH (e.g., 0.00001 for 0.00001 ETH)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    size="sm"
                    onClick={handleList}
                    disabled={isLoading || !price}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelSell}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

interface ActionButtonProps {
  onClick: () => void
  loading: boolean
  children: React.ReactNode
}

function ActionButton({ onClick, loading, children }: ActionButtonProps) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={loading}
      className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </Button>
  )
}

export default BookCard
