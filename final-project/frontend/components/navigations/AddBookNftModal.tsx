"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ethers } from "ethers"
import { useMutation } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/lib/pinata"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import BookStore from "@/utils/BookStore.json"
import { GENRES } from "@/utils/genre"
import { CONTRACT_ADDRESS } from "@/lib/contract"

const ISBN_REGEX = /^(?:\d{9}[\dX]|\d{13})$/
const MAX_IMAGE_SIZE_MB = 10
const MAX_BOOK_SIZE_MB = 50
const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024
const MAX_BOOK_BYTES = MAX_BOOK_SIZE_MB * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]

const formSchema = z.object({
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
  genre: z.enum(GENRES, {
    required_error: "Please select a genre",
  }),
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

type FormValues = z.infer<typeof formSchema>

const ipfsToGateway = (uri: string) => {
  if (!uri.startsWith("ipfs://")) return uri
  return `https://gateway.pinata.cloud/ipfs/${uri.replace("ipfs://", "")}`
}

const AddBookNftModal = () => {
  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      authorName: "",
      isbn: "",
      genre: undefined,
      price: "",
      listed: true,
      coverImage: undefined,
      bookfile: undefined,
    },
  })

  const coverImage = form.watch("coverImage")
  const isListed = form.watch("listed")

  useEffect(() => {
    if (coverImage) {
      const url = URL.createObjectURL(coverImage)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl("")
  }, [coverImage])

  const resetForm = () => {
    form.reset()
    setPreviewUrl("")
  }

  const createBookMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // ── 1. Wallet check ────────────────────────────────────────────────────
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed.")
      }

      const cleanTitle = values.title.trim()
      const cleanAuthorName = values.authorName.trim()

      // ── 2. Upload files to IPFS ────────────────────────────────────────────
      // These only run AFTER zod validation passes, so bad files never upload.
      let imageGatewayUrl: string
      let bookfileGatewayUrl: string
      let metadataGatewayUrl: string

      try {
        imageGatewayUrl = ipfsToGateway(
          await uploadFileToIPFS(values.coverImage)
        )
        bookfileGatewayUrl = ipfsToGateway(
          await uploadFileToIPFS(values.bookfile)
        )
      } catch (err) {
        throw new Error("Failed to upload files to IPFS. Please try again.")
      }

      // ── 3. Upload metadata ─────────────────────────────────────────────────
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

      // ── 4. Send transaction ────────────────────────────────────────────────
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        BookStore.abi,
        signer
      )

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

      // ── 5. Wait for receipt safely ─────────────────────────────────────────
      // ethers v6 tx.wait() can throw a coalesce/parse error even when the tx
      // succeeds on-chain. We fall back to manually fetching the receipt.
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
    },

    onSuccess: () => {
      resetForm()
      setOpen(false)
    },

    onError: (error) => {
      form.setError("root", {
        message:
          error instanceof Error ? error.message : "Failed to create book NFT.",
      })
    },
  })

  const onSubmit = (values: FormValues) => {
    createBookMutation.mutate(values)
  }

  const isPending = createBookMutation.isPending

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return
    setOpen(nextOpen)
    if (!nextOpen) resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg">Add NFT Book</Button>
      </DialogTrigger>

      <DialogContent className="flex h-[85vh] w-full flex-col overflow-hidden rounded-2xl p-0 sm:max-w-[640px]">
        <DialogHeader className="border-b bg-muted/40 px-6 py-5">
          <DialogTitle className="text-2xl">Add Book NFT</DialogTitle>
        </DialogHeader>

        <div className="h-[85vh] flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup className="space-y-6">
              {/* Title */}
              <Field
                orientation="vertical"
                data-invalid={!!form.formState.errors.title}
              >
                <FieldLabel htmlFor="title">Book Title</FieldLabel>
                <FieldContent>
                  <Input
                    id="title"
                    placeholder="Enter book title"
                    {...form.register("title")}
                    disabled={isPending}
                    aria-invalid={!!form.formState.errors.title}
                  />
                  <FieldError errors={[form.formState.errors.title]} />
                </FieldContent>
              </Field>

              {/* Author */}
              <Field
                orientation="vertical"
                data-invalid={!!form.formState.errors.authorName}
              >
                <FieldLabel htmlFor="authorName">Author Name</FieldLabel>
                <FieldContent>
                  <Input
                    id="authorName"
                    placeholder="Enter author name"
                    {...form.register("authorName")}
                    disabled={isPending}
                    aria-invalid={!!form.formState.errors.authorName}
                  />
                  <FieldError errors={[form.formState.errors.authorName]} />
                </FieldContent>
              </Field>

              {/* ISBN */}
              <Field
                orientation="vertical"
                data-invalid={!!form.formState.errors.isbn}
              >
                <FieldLabel htmlFor="isbn">ISBN (Optional)</FieldLabel>
                <FieldContent>
                  <Input
                    id="isbn"
                    placeholder="Enter 10 or 13"
                    {...form.register("isbn")}
                    disabled={isPending}
                    aria-invalid={!!form.formState.errors.isbn}
                  />
                  <FieldDescription className="text-xs text-muted-foreground">
                    Enter 10 (10 digits) or 13 (13 digits). Leave blank to skip.
                  </FieldDescription>
                  <FieldError errors={[form.formState.errors.isbn]} />
                </FieldContent>
              </Field>

              {/* Genre */}
              <Field
                orientation="vertical"
                data-invalid={!!form.formState.errors.genre}
              >
                <FieldLabel htmlFor="genre">Genre</FieldLabel>
                <FieldContent>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("genre", value as any, {
                        shouldValidate: true,
                      })
                    }
                    defaultValue={form.getValues("genre")}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="genre"
                      aria-invalid={!!form.formState.errors.genre}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="z-[100]"
                      sideOffset={5}
                      align="start"
                    >
                      {GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[form.formState.errors.genre]} />
                </FieldContent>
              </Field>

              {/* Price */}
              <Field
                orientation="vertical"
                data-invalid={!!form.formState.errors.price}
              >
                <FieldLabel htmlFor="price">Price (ETH)</FieldLabel>
                <FieldContent>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder="0.001"
                    {...form.register("price")}
                    disabled={isPending || !isListed}
                    aria-invalid={!!form.formState.errors.price}
                  />
                  <FieldDescription className="text-xs text-muted-foreground">
                    {!isListed
                      ? "Price will be set to 0 ETH since this book is unlisted."
                      : "Enter the price in ETH (e.g., 0.001 for 0.001 ETH)"}
                  </FieldDescription>
                  <FieldError errors={[form.formState.errors.price]} />
                </FieldContent>
              </Field>

              {/* Cover Image */}
              <Field
                orientation="vertical"
                data-invalid={!!form.formState.errors.coverImage}
              >
                <FieldLabel htmlFor="coverImage">Book Cover</FieldLabel>
                <FieldContent>
                  <Input
                    id="coverImage"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={isPending}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file)
                        form.setValue("coverImage", file, {
                          shouldValidate: true,
                        })
                    }}
                    aria-invalid={!!form.formState.errors.coverImage}
                  />
                  <FieldDescription className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP or GIF — max {MAX_IMAGE_SIZE_MB}MB
                  </FieldDescription>
                  <FieldError errors={[form.formState.errors.coverImage]} />
                </FieldContent>
              </Field>

              {previewUrl && (
                <Card className="overflow-hidden rounded-xl border-2">
                  <CardContent className="p-0">
                    <div className="relative h-64 w-full">
                      <Image
                        src={previewUrl}
                        alt="Cover preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Book File */}
              <Field
                orientation="vertical"
                data-invalid={!!form.formState.errors.bookfile}
              >
                <FieldLabel htmlFor="bookfile">Book File</FieldLabel>
                <FieldContent>
                  <Input
                    id="bookfile"
                    type="file"
                    accept=".pdf,application/pdf"
                    disabled={isPending}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file)
                        form.setValue("bookfile", file, {
                          shouldValidate: true,
                        })
                    }}
                    aria-invalid={!!form.formState.errors.bookfile}
                  />
                  <FieldDescription className="text-xs text-muted-foreground">
                    PDF only — max {MAX_BOOK_SIZE_MB}MB
                  </FieldDescription>
                  <FieldError errors={[form.formState.errors.bookfile]} />
                </FieldContent>
              </Field>

              {/* Root / server error */}
              {form.formState.errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}
            </FieldGroup>

            <div className="flex w-full items-center justify-between gap-4">
              <Button
                type="submit"
                disabled={isPending}
                size="lg"
                className="min-w-[160px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Minting...
                  </>
                ) : (
                  "Create Book NFT"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddBookNftModal
