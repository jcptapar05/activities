"use client"

import { useQuery } from "@tanstack/react-query"
import BookCard from "@/components/card/book-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import useAccount from "@/stores/Account"
import { fetchOwnedBooks } from "@/lib/contract"
import { Button } from "@/components/ui/button"

const MyLibrary = () => {
  const { account } = useAccount()

  const {
    data: books = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ownedBooks", account],
    queryFn: () => fetchOwnedBooks(account!),
    enabled: !!account,
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[300px] rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error instanceof Error ? error.message : "Failed to load books"}
        </AlertDescription>
      </Alert>
    )
  }

  if (!account) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium">No Wallet Connected</p>
          <p className="text-sm text-muted-foreground">
            Please connect your wallet to view your books
          </p>
        </div>
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium">No Books Found</p>
          <p className="text-sm text-muted-foreground">
            You don&apos;t own any books yet. Mint or purchase some books to see
            them here. Try{" "}
            <button
              onClick={() => refetch()}
              className="mx-2 cursor-pointer text-sm text-muted-foreground underline hover:text-foreground"
            >
              refresh
            </button>
            the page or check your wallet address
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Library</h1>
          <p className="text-muted-foreground">
            You own {books.length} book{books.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <BookCard key={book.id} book={book} refetch={refetch} />
        ))}
      </div>
    </div>
  )
}

export default MyLibrary
