"use client"

import React, { useEffect, useState } from "react"
import { Button } from "../ui/button"
import useAccount from "@/stores/Account"
import AddBookNftModal from "./AddBookNftModal"

const WalletConnectBtn = () => {
  const { setAccount } = useAccount()
  const [localAccount, setLocalAccount] = useState("")

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask")
      return
    }

    try {
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAccount(accounts[0])
        setLocalAccount(accounts[0])
      }
    } catch (error) {
      console.log(error)
    }
  }

  const disconnectWallet = () => {
    setAccount("")
    setLocalAccount("")
  }

  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // user disconnected wallet in MetaMask
        disconnectWallet()
      } else {
        setAccount(accounts[0])
        setLocalAccount(accounts[0])
      }
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)

    return () => {
      ;(window.ethereum as any)?.removeListener(
        "accountsChanged",
        handleAccountsChanged
      )
    }
  }, [setAccount])

  if (!localAccount) {
    return <Button onClick={connectWallet}>Connect Wallet</Button>
  }

  return (
    <div className="flex items-center gap-2">
      <AddBookNftModal />
      <p className="text-sm">
        {localAccount.slice(0, 6) + "..." + localAccount.slice(-4)}
      </p>
      <Button onClick={disconnectWallet}>Disconnect Wallet</Button>
    </div>
  )
}

export default WalletConnectBtn
