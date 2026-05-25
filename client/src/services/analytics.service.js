import API from '../api/axios'

export const getAnalytics =
async () => {

  const token =
    localStorage.getItem('token')

  const res = await API.get(
    '/analytics/overview',
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  )

  return res.data.analytics

}