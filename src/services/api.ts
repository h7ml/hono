const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'
const enableMock = (import.meta.env.VITE_ENABLE_MOCK ?? 'true') === 'true'

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('401_UNAUTHORIZED')
    }
    throw new Error(`REQUEST_FAILED_${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function apiGet<T>(path: string): Promise<T> {
  if (enableMock && path === '/users') {
    const response = await fetch('/api/users?page=1&pageSize=10')
    return parseJson<T>(response)
  }

  const response = await fetch(`${baseUrl}${path}`)
  return parseJson<T>(response)
}
