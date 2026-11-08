const apiUrl = 'http://127.0.0.1:3000';

export async function getApiHealth(): Promise<{ status: string }> {
  const response = await fetch(`${apiUrl}/health`);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<{ status: string }>;
}
