const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT ?? ""

export async function uploadToPinata(
  file: File,
  name: string
): Promise<string> {
  const fd = new FormData()
  fd.append("file", file)
  fd.append("pinataMetadata", JSON.stringify({ name }))

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: fd,
  })

  if (!res.ok) {
    throw new Error("Upload failed")
  }

  const data = await res.json()
  return `ipfs://${data.IpfsHash}`
}
