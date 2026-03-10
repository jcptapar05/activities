"use client"

import { Person } from "@/lib/types"

export default function PersonCard({
  person,
  index,
}: {
  person: Person
  index?: number
}) {
  const rows: [string, string][] = [
    [
      "Name",
      `${person.first_name} ${person.middle_name} ${person.last_name}`
        .replace(/\s+/g, " ")
        .trim(),
    ],
    ["Position", person.position],
    ["Address", person.id],
    ["Photo", person.photo],
    ["CV", person.cv],
  ]

  return (
    <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      {index !== undefined && (
        <div className="mb-1 flex items-center justify-between">
          <span className="font-mono text-xs text-zinc-600">#{index + 1}</span>
          <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
            {person.position}
          </span>
        </div>
      )}

      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[80px_1fr] gap-2">
          <span className="pt-0.5 text-xs text-zinc-500">{label}</span>
          <span className="font-mono text-xs break-all text-zinc-300">
            {value || "—"}
          </span>
        </div>
      ))}
    </div>
  )
}
