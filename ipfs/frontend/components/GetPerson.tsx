"use client"

import { useState } from "react"
import { getReadContract } from "@/lib/ethers"
import { Person } from "@/lib/types"
import PersonCard from "./PersonCard"
import { Field, inputCls } from "./ui"

export default function GetPerson() {
  const [fetchAddr, setFetchAddr] = useState("")
  const [fetchedPerson, setFetchedPerson] = useState<Person | null>(null)
  const [fetchError, setFetchError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleGetPerson = async () => {
    setFetchError("")
    setFetchedPerson(null)

    if (!/^0x[a-fA-F0-9]{40}$/.test(fetchAddr)) {
      setFetchError("Invalid Ethereum address.")
      return
    }

    setLoading(true)

    try {
      const contract = getReadContract()
      const p = await contract.getPerson(fetchAddr)

      const person: Person = {
        id: fetchAddr,
        first_name: p.first_name,
        last_name: p.last_name,
        middle_name: p.middle_name,
        position: p.position,
        cv: p.cv,
        photo: p.photo,
      }

      const isEmpty =
        !person.first_name &&
        !person.last_name &&
        !person.middle_name &&
        !person.position &&
        !person.cv &&
        !person.photo

      if (isEmpty) {
        setFetchError("No person found for this address.")
      } else {
        setFetchedPerson(person)
      }
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : "Failed to fetch person."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Get Person</h2>
      </div>

      <Field label="Wallet Address">
        <div className="flex gap-2">
          <input
            className={`${inputCls} flex-1 font-mono`}
            placeholder="0x..."
            value={fetchAddr}
            onChange={(e) => setFetchAddr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGetPerson()}
          />
          <button
            onClick={handleGetPerson}
            disabled={loading}
            className="rounded-lg bg-zinc-100 px-4 text-sm font-medium whitespace-nowrap text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
          >
            {loading ? "Loading..." : "Fetch"}
          </button>
        </div>
      </Field>

      {fetchError && <p className="text-sm text-rose-400">{fetchError}</p>}
      {fetchedPerson && <PersonCard person={fetchedPerson} />}
    </div>
  )
}
