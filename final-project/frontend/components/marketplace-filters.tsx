"use client"

import { useQueryState, useQueryStates } from "nuqs"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Filter, RotateCcw } from "lucide-react"
import { GENRES } from "@/utils/genre"

export type FilterValues = {
  search?: string
  genre?: string
  minPrice?: number
  maxPrice?: number
  author?: string
  contractAddress?: string
  onlyListed?: boolean
  sortBy?: "price_asc" | "price_desc" | "title_asc" | "title_desc" | "newest"
}

interface MarketplaceFiltersProps {
  onFilterChange?: (filters: FilterValues) => void
  className?: string
  defaultExpanded?: boolean
}

export const MarketplaceFilters = ({
  onFilterChange,
  className = "",
  defaultExpanded = true,
}: MarketplaceFiltersProps) => {
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: false,
  })
  const [genre, setGenre] = useQueryState("genre", {
    defaultValue: "",
    shallow: false,
  })
  const [author, setAuthor] = useQueryState("author", {
    defaultValue: "",
    shallow: false,
  })
  const [owner, setOwner] = useQueryState("owner", {
    defaultValue: "",
    shallow: false,
  })
  const [minPrice, setMinPrice] = useQueryState("minPrice", {
    defaultValue: "",
    shallow: false,
    parse: (value) => (value ? Number(value) : undefined),
    serialize: (value) => value?.toString() ?? "",
  })
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice", {
    defaultValue: "",
    shallow: false,
    parse: (value) => (value ? Number(value) : undefined),
    serialize: (value) => value?.toString() ?? "",
  })
  const [onlyListed, setOnlyListed] = useQueryState("listed", {
    defaultValue: "true",
    shallow: false,
    parse: (value) => value === "true",
    serialize: (value) => value.toString(),
  })
  const [sortBy, setSortBy] = useQueryState("sort", {
    defaultValue: "newest",
    shallow: false,
  })

  // Price range for slider
  const [priceRange, setPriceRange] = useQueryState("priceRange", {
    defaultValue: "",
    shallow: false,
    parse: (value) => {
      if (!value) return [0, 10]
      const [min, max] = value.split("-").map(Number)
      return [min || 0, max || 10]
    },
    serialize: (value) => {
      if (!value) return ""
      return `${value[0]}-${value[1]}`
    },
  })

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (search) count++
    if (genre) count++
    if (author) count++
    if (owner) count++
    if (minPrice || maxPrice) count++
    if (sortBy !== "newest") count++
    return count
  }, [search, genre, author, owner, minPrice, maxPrice, sortBy])

  const handleReset = () => {
    setSearch(null)
    setGenre(null)
    setAuthor(null)
    setOwner(null)
    setMinPrice(null)
    setMaxPrice(null)
    setPriceRange(null)
    setSortBy("newest")
    setOnlyListed("true")
  }

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value)
    setMinPrice(value[0].toString())
    setMaxPrice(value[1].toString())
  }

  return (
    <Card className={`w-full py-4 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        <CardDescription>
          Filter and sort books in the marketplace
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-3">
        <Accordion
          type="multiple"
          defaultValue={
            defaultExpanded ? ["search", "filters", "price", "sort"] : []
          }
          className="w-full"
        >
          {/* Search Filter */}
          <AccordionItem value="search">
            <AccordionTrigger className="py-2 text-sm">Search</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                <Input
                  placeholder="Search by title..."
                  value={search || ""}
                  onChange={(e) => setSearch(e.target.value || null)}
                  className="w-full"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Main Filters */}
          <AccordionItem value="filters">
            <AccordionTrigger className="py-2 text-sm">
              Book Details
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-4 pt-2">
                  {/* Genre Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Select
                      value={genre || ""}
                      onValueChange={(val) => setGenre(val || null)}
                    >
                      <SelectTrigger id="genre">
                        <SelectValue placeholder="All Genres" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">All Genres</SelectItem>
                        {GENRES.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Author Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      placeholder="Filter by author..."
                      value={author || ""}
                      onChange={(e) => setAuthor(e.target.value || null)}
                    />
                  </div>

                  {/* Contract Address Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="owner">Owner Address</Label>
                    <Input
                      id="owner"
                      placeholder="0x..."
                      value={owner || ""}
                      onChange={(e) => setOwner(e.target.value || null)}
                      className="font-mono text-xs"
                    />
                  </div>

                  {/* Listed Only Toggle */}
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="listed">Listed Only</Label>
                      <p className="text-xs text-muted-foreground">
                        Show only listed books
                      </p>
                    </div>
                    <Switch
                      id="listed"
                      checked={onlyListed === "true"}
                      onCheckedChange={(checked) =>
                        setOnlyListed(checked ? "true" : "false")
                      }
                    />
                  </div>
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>

          {/* Price Range Filter */}
          <AccordionItem value="price">
            <AccordionTrigger className="py-2 text-sm">
              Price Range (ETH)
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <Slider
                  min={0}
                  max={10}
                  step={0.1}
                  value={priceRange || [0, 10]}
                  onValueChange={handlePriceRangeChange}
                  className="w-full"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      placeholder="Min"
                      value={minPrice || ""}
                      onChange={(e) => {
                        const val = e.target.value
                        setMinPrice(val || null)
                        if (maxPrice) {
                          setPriceRange([Number(val) || 0, Number(maxPrice)])
                        }
                      }}
                    />
                  </div>
                  <span className="text-muted-foreground">to</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      placeholder="Max"
                      value={maxPrice || ""}
                      onChange={(e) => {
                        const val = e.target.value
                        setMaxPrice(val || null)
                        if (minPrice) {
                          setPriceRange([Number(minPrice), Number(val) || 0])
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Sort Options */}
          <AccordionItem value="sort">
            <AccordionTrigger className="py-2 text-sm">
              Sort By
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                <Select value={sortBy || "newest"} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price_desc">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="title_asc">Title: A to Z</SelectItem>
                    <SelectItem value="title_desc">Title: Z to A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

      <CardFooter className="flex gap-2 border-t pt-4">
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex-1"
          >
            <RotateCcw className="mr-2 h-3 w-3" />
            Reset
          </Button>
        )}
        <Button
          variant="default"
          size="sm"
          onClick={() =>
            onFilterChange?.({
              search: search || undefined,
              genre: genre || undefined,
              author: author || undefined,
              contractAddress: contractAddress || undefined,
              minPrice: minPrice || undefined,
              maxPrice: maxPrice || undefined,
              onlyListed: onlyListed,
              sortBy: sortBy as any,
            })
          }
          className={activeFiltersCount > 0 ? "flex-1" : "w-full"}
        >
          Apply Filters
        </Button>
      </CardFooter>
    </Card>
  )
}
