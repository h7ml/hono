const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'
const enableMock = (import.meta.env.VITE_ENABLE_MOCK ?? 'false') === 'true'

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
  const requestPath = enableMock && path === '/users' ? '/users?page=1&pageSize=10' : path
  const response = await fetch(`${baseUrl}${requestPath}`)
  return parseJson<T>(response)
}
