"use client"

import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getWriteContract, requestWallet } from "@/lib/ethers"
import { uploadToPinata } from "@/lib/pinata"
import { Field, FieldError, inputCls } from "./ui"

const schema = z.object({
  firstName: z.string().min(1, "Required").max(50),
  lastName: z.string().min(1, "Required").max(50),
  middleName: z.string().min(1, "Required").max(50),
  cv: z.string().min(1, "Required").max(50),
  photo: z.string().min(1, "Required").max(50),
  position: z.string().min(1, "Required").max(100),
})

type FormValues = z.infer<typeof schema>

type Status = {
  type: "info" | "success" | "error"
  message: string
}

export default function AddPersonForm() {
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [cv, setCv] = useState<File | null>(null)
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const photoRef = useRef<HTMLInputElement>(null)
  const cvRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    if (!photo) {
      setStatus({ type: "error", message: "Photo is required." })
      return
    }

    if (!cv) {
      setStatus({ type: "error", message: "CV is required." })
      return
    }

    setLoading(true)
    setTxHash("")

    try {
      setStatus({ type: "info", message: "Connecting wallet..." })
      const { address } = await requestWallet()
      setWalletAddress(address)

      setStatus({ type: "info", message: "Uploading photo to IPFS..." })
      const photoHash = await uploadToPinata(photo, `${values.firstName}_photo`)

      setStatus({ type: "info", message: "Uploading CV to IPFS..." })
      const cvHash = await uploadToPinata(cv, `${values.firstName}_cv`)

      setStatus({ type: "info", message: "Opening wallet for transaction..." })
      const contract = await getWriteContract()

      const tx = await contract.addNewPerson(
        address,
        values.firstName,
        values.lastName,
        values.middleName ?? "",
        values.position,
        cvHash,
        photoHash
      )

      setTxHash(tx.hash)
      setStatus({
        type: "info",
        message: "Waiting for transaction confirmation...",
      })

      await tx.wait()

      setStatus({
        type: "success",
        message: "Person registered successfully.",
      })

      reset()
      setPhoto(null)
      setPhotoPreview(null)
      setCv(null)
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Transaction failed.",
      })
    } finally {
      setLoading(false)
    }
  }

  const statusCls: Record<Status["type"], string> = {
    info: "border-blue-800 bg-blue-950/50 text-blue-300",
    success: "border-emerald-800 bg-emerald-950/50 text-emerald-300",
    error: "border-rose-800 bg-rose-950/50 text-rose-300",
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Add New Person</h2>
      </div>

      <Field label="Connected Wallet">
        <div className={`${inputCls} font-mono text-zinc-400`}>
          {walletAddress || "Will use the wallet that signs the transaction"}
        </div>
      </Field>

      <Field label="2×2 Photo" required>
        <button
          type="button"
          onClick={() => photoRef.current?.click()}
          className="w-full rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 p-4 text-center transition-colors hover:border-zinc-500 hover:bg-zinc-800/50"
        >
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="preview"
              className="mx-auto h-16 w-16 rounded-md border border-zinc-700 object-cover"
            />
          ) : (
            <span className="text-sm text-zinc-500">
              {photo ? `✓ ${photo.name}` : "Click to upload photo"}
            </span>
          )}
        </button>

        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) {
              setPhoto(f)
              setPhotoPreview(URL.createObjectURL(f))
            }
          }}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" required>
          <input
            className={inputCls}
            placeholder="Juan"
            {...register("firstName")}
          />
          <FieldError message={errors.firstName?.message} />
        </Field>

        <Field label="Last Name" required>
          <input
            className={inputCls}
            placeholder="Dela Cruz"
            {...register("lastName")}
          />
          <FieldError message={errors.lastName?.message} />
        </Field>
      </div>

      <Field label="Middle Name">
        <input
          className={inputCls}
          placeholder="Santos"
          {...register("middleName")}
        />
        <FieldError message={errors.middleName?.message} />
      </Field>

      <Field label="Position" required>
        <input
          className={inputCls}
          placeholder="Blockchain Developer"
          {...register("position")}
        />
        <FieldError message={errors.position?.message} />
      </Field>

      <Field label="Resume / CV" required>
        <button
          type="button"
          onClick={() => cvRef.current?.click()}
          className="w-full rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 p-4 text-center transition-colors hover:border-zinc-500 hover:bg-zinc-800/50"
        >
          <span
            className={`text-sm ${cv ? "text-emerald-400" : "text-zinc-500"}`}
          >
            {cv ? `✓ ${cv.name}` : "Click to upload PDF / DOCX"}
          </span>
        </button>

        <input
          ref={cvRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) setCv(f)
          }}
        />
      </Field>

      {status && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${statusCls[status.type]}`}
        >
          {status.message}
        </div>
      )}

      {txHash && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
          <p className="text-xs text-zinc-500">Transaction Hash</p>
          <p className="mt-1 font-mono text-xs break-all text-zinc-300">
            {txHash}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-zinc-100 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Processing..." : "Upload & Register"}
      </button>
    </form>
  )
}
