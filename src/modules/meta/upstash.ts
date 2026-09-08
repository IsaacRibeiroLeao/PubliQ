interface UpstashResponse<T> {
  result?: T;
  error?: string;
}

export async function runUpstashCommand<T>(
  command: readonly (string | number)[],
): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("O armazenamento temporário OAuth não está configurado.");
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const result = (await response.json()) as UpstashResponse<T>;
  if (!response.ok || result.error) {
    throw new Error("Falha no armazenamento temporário OAuth.");
  }
  return result.result as T;
}
