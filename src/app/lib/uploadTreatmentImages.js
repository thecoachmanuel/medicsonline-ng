const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:7500").replace(/\/+$/, "")

/**
 * Upload a file to Cloudinary using a backend-signed request.
 * @param {File[]} files
 * @param {string} slug - used in storage path, e.g. "treatments/<slug>/..."
 * @param {(pct: number, fileName: string) => void} [onProgress]
 * @returns {Promise<string[]>} download URLs
 */
export async function uploadTreatmentImages(files, slug, onProgress) {
  const list = Array.from(files || []);
  const urls = [];

  for (const file of list) {
    if (onProgress) onProgress(0, file.name)
    const { secureUrl } = await uploadFileToCloudinary(file, `treatments/${slug}`)
    urls.push(secureUrl)
    if (onProgress) onProgress(100, file.name)
  }
  return urls;
}

export async function uploadFileToCloudinary(file, folder) {
  const signRes = await fetch(`${API_BASE}/api/uploads/cloudinary/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
    credentials: "include",
  })
  const signJson = await signRes.json()
  if (!signRes.ok) {
    throw new Error(signJson?.message || "Failed to sign upload")
  }

  const form = new FormData()
  form.append("file", file)
  form.append("api_key", signJson.apiKey)
  form.append("timestamp", String(signJson.timestamp))
  form.append("signature", signJson.signature)
  form.append("folder", signJson.folder)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signJson.cloudName)}/auto/upload`,
    { method: "POST", body: form }
  )
  const uploadJson = await uploadRes.json()
  if (!uploadRes.ok) {
    throw new Error(uploadJson?.error?.message || "Cloudinary upload failed")
  }

  return {
    secureUrl: uploadJson.secure_url,
    publicId: uploadJson.public_id,
    resourceType: uploadJson.resource_type,
  }
}
