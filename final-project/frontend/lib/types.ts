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
