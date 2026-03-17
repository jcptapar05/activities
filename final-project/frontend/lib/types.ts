import { GENRES } from "@/utils/genre"
import z from "zod"
import {
  ACCEPTED_IMAGE_TYPES,
  ISBN_REGEX,
  MAX_BOOK_BYTES,
  MAX_BOOK_SIZE_MB,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_SIZE_MB,
} from "./contract"

export type ContractBook = {
  id: bigint
  title: string
  authorName: string
  price: number | bigint
  image: string
  listed: boolean
  metadata?: {
    genre?: string
    isbn?: string
  }
  genre?: string
  isbn?: string
  owner?: string
}

export type Book = {
  id: number
  title: string
  author: string
  price: number
  image: string
  genre?: string
  isbn?: string
  contractAddress?: string
  listed?: boolean
  createdAt?: number
  owner?: string
  metadata?: {
    genre?: string
    isbn?: string
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
