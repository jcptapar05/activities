"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { ethers } from "ethers"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
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
import { GENRES } from "@/utils/genre"
import {
  createBookNFT,
  MAX_IMAGE_SIZE_MB,
  MAX_BOOK_SIZE_MB,
} from "@/lib/contract"
import { CreateBookFormValues } from "@/lib/types"

const AddBookNftModal = () => {
  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")

  const form = useForm<CreateBookFormValues>({
    // resolver: zodResolver(createBookFormSchema),
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
    mutationFn: async (values: CreateBookFormValues) => {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      return createBookNFT(values, signer)
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

  const onSubmit = (values: CreateBookFormValues) => {
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
                    step="0.00001"
                    placeholder="0.00001"
                    {...form.register("price")}
                    disabled={isPending || !isListed}
                    aria-invalid={!!form.formState.errors.price}
                  />
                  <FieldDescription className="text-xs text-muted-foreground">
                    {!isListed
                      ? "Price will be set to 0 ETH since this book is unlisted."
                      : "Enter the price in ETH (e.g., 0.00001 for 0.00001 ETH)"}
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

            {/* List instantly */}
            <Field
              orientation="vertical"
              data-invalid={!!form.formState.errors.listed}
              className="w-full"
            >
              {/* <FieldLabel className="mb-2 text-sm font-medium">
                List Instantly
              </FieldLabel> */}

              <FieldContent>
                <div className="flex items-start justify-between rounded-xl border p-4 transition hover:bg-muted/50">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Automatically list after minting
                    </p>
                    <FieldDescription className="text-xs leading-relaxed text-muted-foreground">
                      If enabled, your book will be listed on the marketplace
                      immediately after minting. If disabled, price will be 0
                      ETH and you can list it later.
                    </FieldDescription>
                  </div>

                  {/* Toggle-style checkbox */}
                  <label className="relative inline-flex cursor-pointer items-center">
                    <Input
                      type="checkbox"
                      id="listed"
                      {...form.register("listed")}
                      disabled={isPending}
                      className="peer sr-only"
                    />

                    <div className="h-6 w-11 rounded-full bg-muted transition peer-checked:bg-primary" />

                    <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                  </label>
                </div>

                <FieldError errors={[form.formState.errors.listed]} />
              </FieldContent>
            </Field>

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
