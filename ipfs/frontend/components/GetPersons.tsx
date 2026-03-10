"use client"

import { useState } from "react"
import { getReadContract } from "@/lib/ethers"
import { Person } from "@/lib/types"
import PersonCard from "./PersonCard"

export default function GetPersons() {
  const [allPersons, setAllPersons] = useState<Person[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadAllPersons = async () => {
    setLoading(true)
    setError("")

    try {
      const contract = getReadContract()
      const result = await contract.getPersons()

      let persons: Person[] = []

      if (Array.isArray(result)) {
        // supports either:
        // 1) array of person structs
        // 2) [wallets, persons]
        if (
          result.length === 2 &&
          Array.isArray(result[0]) &&
          Array.isArray(result[1])
        ) {
          const wallets = result[0]
          const records = result[1]

          persons = records.map((p: any, i: number) => ({
            id: wallets[i],
            first_name: p.first_name,
            last_name: p.last_name,
            middle_name: p.middle_name,
            position: p.position,
            cv: p.cv,
            photo: p.photo,
          }))
        } else {
          persons = result.map((p: any) => ({
            id: p.id ?? p.wallet ?? p.addr ?? "",
            first_name: p.first_name,
            last_name: p.last_name,
            middle_name: p.middle_name,
            position: p.position,
            cv: p.cv,
            photo: p.photo,
          }))
        }
      }

      setAllPersons(persons)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load persons.")
      setAllPersons([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Get Persons</h2>
      </div>

      <button
        onClick={loadAllPersons}
        disabled={loading}
        className="w-full rounded-lg bg-zinc-100 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
      >
        {loading ? "Loading..." : "Load All Persons"}
      </button>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      {allPersons === null && !error && (
        <p className="py-4 text-center text-sm text-zinc-600">
          Click above to load all records.
        </p>
      )}

      {allPersons?.length === 0 && (
        <p className="py-4 text-center text-sm text-zinc-600">
          No persons registered yet.
        </p>
      )}

      {allPersons && allPersons.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">
            {allPersons.length} record{allPersons.length !== 1 ? "s" : ""}
          </p>
          {allPersons.map((p, i) => (
            <PersonCard key={`${p.id}-${i}`} person={p} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
