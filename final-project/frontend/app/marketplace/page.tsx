"use client"

import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import { useQueryStates, parseAsBoolean, parseAsString } from "nuqs"
import { useState, useMemo, useEffect } from "react"
import BookCard from "@/components/card/book-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Filter, Grid3x3, List } from "lucide-react"
import { MarketplaceFilters } from "@/components/marketplace-filters"
import { fetchBooks } from "@/lib/contract"

const ITEMS_PER_PAGE = 9

function MarketplaceContent() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)

  const [filters] = useQueryStates({
    search: parseAsString.withDefault(""),
    genre: parseAsString.withDefault(""),
    author: parseAsString.withDefault(""),
    owner: parseAsString.withDefault(""),
    minPrice: parseAsString.withDefault(""),
    maxPrice: parseAsString.withDefault(""),
    listed: parseAsBoolean.withDefault(true),
    sort: parseAsString.withDefault("newest"),
  })

  const {
    data: books,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["books", filters.owner],
    queryFn: () => fetchBooks(filters.owner || undefined),
  })

  const filteredBooks = useMemo(() => {
    if (!books) return []

    let filtered = [...books]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter((book) =>
        book.title.toLowerCase().includes(searchLower)
      )
    }

    if (filters.genre && filters.genre !== "all" && filters.genre !== " ") {
      filtered = filtered.filter(
        (book) => book.genre?.toLowerCase() === filters.genre.toLowerCase()
      )
    }

    if (filters.author) {
      const authorLower = filters.author.toLowerCase()
      filtered = filtered.filter((book) =>
        book.author.toLowerCase().includes(authorLower)
      )
    }

    if (filters.minPrice) {
      filtered = filtered.filter(
        (book) => book.price >= Number(filters.minPrice)
      )
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (book) => book.price <= Number(filters.maxPrice)
      )
    }

    if (filters.listed !== false) {
      filtered = filtered.filter((book) => book.listed === false)
    }

    switch (filters.sort) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "title_asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "title_desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      case "newest":
      default:
        filtered.sort((a, b) => b.createdAt! - a.createdAt!)
        break
    }

    return filtered
  }, [books, filters])

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE)
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load books. Please try again.
            <Button variant="link" onClick={() => refetch()} className="ml-2">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">
            {filteredBooks.length} books available
            {filters.owner &&
              ` for address ${filters.owner.slice(0, 6)}...${filters.owner.slice(-4)}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-lg border p-1 sm:flex">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 sm:w-[400px]">
              <MarketplaceFilters />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="hidden w-64 shrink-0 lg:block">
          <MarketplaceFilters />
        </div>
        <div className="flex-1">
          {paginatedBooks.length === 0 ? (
            <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <p className="text-lg font-medium">No books found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col gap-4"
                }
              >
                {paginatedBooks.map((book) => (
                  <BookCard key={book.id} book={book} refetch={refetch} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Marketplace() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[300px] rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  )
}
