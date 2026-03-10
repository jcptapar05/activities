"use client"

import { Person } from "@/lib/types"

function getCid(value: string) {
  if (!value) return ""
  return value.startsWith("ipfs://") ? value.replace("ipfs://", "") : value
}

function toGatewayUrl(value: string) {
  const cid = getCid(value)
  return cid ? `https://gateway.pinata.cloud/ipfs/${cid}` : ""
}

export default function PersonCard({
  person,
  index,
}: {
  person: Person
  index?: number
}) {
  const fullName =
    `${person.first_name} ${person.middle_name} ${person.last_name}`
      .replace(/\s+/g, " ")
      .trim()

  const photoUrl = toGatewayUrl(person.photo)
  const cvCid = getCid(person.cv)
  const cvUrl = toGatewayUrl(person.cv)

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      {index !== undefined && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-zinc-600">#{index + 1}</span>
          <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
            {person.position}
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
          {photoUrl ? (
            <a href={photoUrl} target="_blank" rel="noreferrer">
              <img
                src={photoUrl}
                alt={fullName || "Person photo"}
                className="h-full w-full object-cover"
              />
            </a>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
              No photo
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="pt-0.5 text-xs text-zinc-500">Name</span>
            <span className="font-mono text-xs break-all text-zinc-300">
              {fullName || "—"}
            </span>
          </div>

          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="pt-0.5 text-xs text-zinc-500">Position</span>
            <span className="font-mono text-xs break-all text-zinc-300">
              {person.position || "—"}
            </span>
          </div>

          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="pt-0.5 text-xs text-zinc-500">Address</span>
            <span className="font-mono text-xs break-all text-zinc-300">
              {person.id || "—"}
            </span>
          </div>

          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="pt-0.5 text-xs text-zinc-500">Photo</span>
            {photoUrl ? (
              <a
                href={photoUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs break-all text-blue-400 hover:underline"
              >
                {getCid(person.photo)}
              </a>
            ) : (
              <span className="font-mono text-xs text-zinc-300">—</span>
            )}
          </div>

          <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="pt-0.5 text-xs text-zinc-500">CV CID</span>
            {cvUrl ? (
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs break-all text-blue-400 hover:underline"
              >
                {cvCid}
              </a>
            ) : (
              <span className="font-mono text-xs text-zinc-300">—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
