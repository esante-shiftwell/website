export async function submitContribution(payload: unknown) {
  const endpoint = process.env.NEXT_PUBLIC_SHIFTWELL_COLLECTOR_URL;

  if (!endpoint) {
    throw new Error('MISSING_COLLECTOR_ENDPOINT');
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Google Apps Script / endpoint JSON
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`COLLECTOR_ERROR:${res.status}:${text}`);
  }

  return true;
}