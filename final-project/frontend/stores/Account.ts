import { create } from "zustand"

interface Account {
  account: string
  setAccount: (account: string) => void
}

const useAccount = create<Account>((set) => ({
  account: "",
  setAccount: (account: string) =>
    set({ account }),
}))

export default useAccount
