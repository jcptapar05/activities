const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export async function uploadFileToIPFS(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error(`File upload failed: ${res.statusText}`);
  const data = await res.json();

  return `ipfs://${data.IpfsHash}`;
}

export async function uploadJSONToIPFS(json) {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
  });

  if (!res.ok) throw new Error(`JSON upload failed: ${res.statusText}`);
  const data = await res.json();

  return `ipfs://${data.IpfsHash}`;
}
