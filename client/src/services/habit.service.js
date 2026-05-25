import API from '../api/axios'

export const getHabits = async () => {

  const token =
    localStorage.getItem('token')

  const res = await API.get(
    '/habits',
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  )

  return res.data.habits

}

export const createHabit = async (
  title
) => {

  const token =
    localStorage.getItem('token')

  const res = await API.post(
    '/habits',
    {
      title,
      description: ''
    },
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  )

  return res.data.data[0]

}

export const completeHabit = async (
  habitId
) => {

  const token =
    localStorage.getItem('token')

  const res = await API.post(
    `/habits/${habitId}/complete`,
    {},
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  )

  return res.data

}