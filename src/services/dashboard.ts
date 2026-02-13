export interface DashboardStats {
  activeUsers: number
  requestsToday: number
  alerts: number
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return {
    activeUsers: 1284,
    requestsToday: 9430,
    alerts: 2
  }
}
