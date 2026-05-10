// src/utils/billing.js
import toast from "react-hot-toast";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

async function postJson(path, body, tries = 3) {
  const url = `${BASE}${path}`;
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastErr;
}

export function startCheckout(planId, cycle = "monthly", doctorId) {
  return toast.promise(
    postJson("/api/billing/checkout", { planId, cycle, doctorId }),
    {
      loading: "Starting checkout…",
      success: (data) => {
        if (data?.url) {
          window.location.href = data.url;
          return "Redirecting to Paystack…";
        }
        throw new Error("No checkout URL received");
      },
      error: "Couldn’t start checkout. Please try again.",
    }
  );
}

export async function verifyPaystack(reference) {
  return await postJson("/api/billing/verify", { reference }, 1)
}
