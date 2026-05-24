
import { useEffect, useState } from 'react'
import API from './api/axios'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

function HabitCard({
  habit,
  completeHabit,
  getHabitStreak
}) {

  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStreak()
  }, [])

  const loadStreak = async () => {

    try {

      const value = await getHabitStreak(habit.id)

      setStreak(value)

    } catch (err) {

      console.log(err)

    }

  }

  const handleComplete = async () => {

    try {

      setLoading(true)

      await completeHabit(habit.id)

      await loadStreak()

    } catch (err) {

      console.log(err)

    } finally {

      setLoading(false)

    }

  }

  return (

    <div
      style={{
        background: '#1e293b',
        borderRadius: '20px',
        padding: '25px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        transition: '0.3s',
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>

        <h2 style={{
          margin: 0,
          fontSize: '24px'
        }}>
          {habit.title}
        </h2>

        <div style={{
          background: '#f97316',
          padding: '10px 16px',
          borderRadius: '999px',
          fontWeight: 'bold',
          fontSize: '15px'
        }}>
          🔥 {streak} Day Streak
        </div>

      </div>

      <p style={{
        color: '#cbd5e1',
        marginBottom: '25px',
        lineHeight: '1.6'
      }}>
        {habit.description}
      </p>

      <button
        onClick={handleComplete}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          border: 'none',
          borderRadius: '12px',
          background: loading
            ? '#64748b'
            : 'linear-gradient(135deg,#22c55e,#16a34a)',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >

        {
          loading
            ? 'Updating...'
            : '✅ Complete Today'
        }

      </button>

    </div>

  )

}
function Heatmap() {

  const days = Array.from({ length: 30 })

  return (

    <div style={{
      background: '#1e293b',
      padding: '25px',
      borderRadius: '20px',
      marginBottom: '30px'
    }}>

      <h2 style={{
        marginBottom: '20px'
      }}>
        📅 Consistency Heatmap
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(10, 1fr)',
        gap: '10px'
      }}>

        {
          days.map((_, index) => {

            const completed =
              Math.random() > 0.3

            return (

              <div
                key={index}
                style={{
                  aspectRatio: '1',
                  borderRadius: '8px',
                  background:
                    completed
                      ? '#22c55e'
                      : '#334155'
                }}
              />

            )

          })
        }

      </div>

    </div>

  )

}
function WeeklyChart() {

  const data = [
    { day: 'Mon', completed: 2 },
    { day: 'Tue', completed: 4 },
    { day: 'Wed', completed: 3 },
    { day: 'Thu', completed: 5 },
    { day: 'Fri', completed: 4 },
    { day: 'Sat', completed: 6 },
    { day: 'Sun', completed: 7 }
  ]

  return (

    <div style={{
      background: '#1e293b',
      padding: '25px',
      borderRadius: '20px',
      marginBottom: '30px',
      height: '350px'
    }}>

      <h2 style={{
        marginBottom: '20px'
      }}>
        📈 Weekly Progress
      </h2>

      <ResponsiveContainer
        width="100%"
        height="85%"
      >

        <LineChart data={data}>

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="completed"
            stroke="#22c55e"
            strokeWidth={4}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  )

}
function App() {

  const [isLogin, setIsLogin] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loggedIn, setLoggedIn] = useState(false)

  const [habits, setHabits] = useState([])

const [analytics, setAnalytics] = useState({
  totalHabits: 0,
  totalCompletions: 0,
  activeStreaks: 0,
  consistency: 0
})

  const [habitTitle, setHabitTitle] = useState('')
  const [habitDescription, setHabitDescription] = useState('')

  useEffect(() => {

    const token = localStorage.getItem('token')

    if (token) {

      setLoggedIn(true)

      fetchHabits()

    }

  }, [])

  const registerUser = async () => {

    try {

      await API.post('/auth/register', {
        name,
        email,
        password
      })

      alert('User registered successfully')

    } catch (err) {

      console.log(err)

      alert('Registration failed')

    }

  }

  const loginUser = async () => {

    try {

      const res = await API.post('/auth/login', {
        email,
        password
      })

      localStorage.setItem(
        'token',
        res.data.token
      )

      await fetchHabits()

      setLoggedIn(true)

    } catch (err) {

      console.log(err)

      alert('Login failed')

    }

  }

  const logoutUser = () => {

    localStorage.removeItem('token')

    setLoggedIn(false)

    setHabits([])

  }

  const fetchHabits = async () => {

  try {

    const token = localStorage.getItem('token')

    const res = await API.get('/habits', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    setHabits(res.data.habits)

    const totalHabits =
      res.data.habits.length

    const totalCompletions =
      res.data.habits.length * 3

    const activeStreaks =
      res.data.habits.length

    const consistency =
      totalHabits === 0
        ? 0
        : Math.min(
            100,
            totalCompletions * 5
          )

    setAnalytics({
      totalHabits,
      totalCompletions,
      activeStreaks,
      consistency
    })

  } catch (err) {

    console.log(err)

  }

}

  const createHabit = async () => {

    try {

      if (!habitTitle || !habitDescription) {
        return alert('Please fill all fields')
      }

      const token = localStorage.getItem('token')

      await API.post(
        '/habits',
        {
          title: habitTitle,
          description: habitDescription
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setHabitTitle('')
      setHabitDescription('')

      fetchHabits()

    } catch (err) {

      console.log(err)

    }

  }

  const completeHabit = async (habitId) => {

    try {

      const token = localStorage.getItem('token')

      await API.post(
        `/habits/${habitId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      fetchHabits()

    } catch (err) {

      console.log(err)

    }

  }

  const getHabitStreak = async (habitId) => {

    try {

      const token = localStorage.getItem('token')

      const res = await API.get(
        `/habits/${habitId}/streak`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      return res.data.streak

    } catch (err) {

      console.log(err)

      return 0

    }

  }

  if (!loggedIn) {

    return (

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,#0f172a,#1e293b)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial'
      }}>

        <div style={{
          width: '400px',
          background: 'white',
          padding: '40px',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>

          <h1 style={{
            textAlign: 'center',
            marginBottom: '10px',
            fontSize: '42px'
          }}>
            🔥 Streak Plus
          </h1>

          <p style={{
            textAlign: 'center',
            color: '#64748b',
            marginBottom: '20px'
          }}>
            Build consistency. Track your streaks.
          </p>

          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: '#e2e8f0',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Switch to {
              isLogin ? 'Register' : 'Login'
            }
          </button>

          {
            !isLogin && (
              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1'
                }}
              />
            )
          }

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1'
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1'
            }}
          />

          <button
            onClick={
              isLogin
                ? loginUser
                : registerUser
            }
            style={{
              padding: '15px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >

            {
              isLogin
                ? 'Login'
                : 'Register'
            }

          </button>

        </div>

      </div>

    )

  }

  return (

    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: 'white',
      fontFamily: 'Arial',
      padding: '40px'
    }}>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>

        <div>

          <h1 style={{
            fontSize: '52px',
            marginBottom: '10px'
          }}>
            🔥 Streak Plus
          </h1>

          <p style={{
            color: '#94a3b8'
          }}>
            Stay consistent. Build powerful habits.
          </p>

        </div>

        <button
          onClick={logoutUser}
          style={{
            padding: '12px 20px',
            borderRadius: '12px',
            border: 'none',
            background: '#ef4444',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>

      </div>
<div style={{
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit,minmax(220px,1fr))',
  gap: '20px',
  marginBottom: '30px'
}}>
<Heatmap />
<WeeklyChart />
  <div style={{
    background: '#1e293b',
    padding: '25px',
    borderRadius: '20px'
  }}>

    <h3>🔥 Total Habits</h3>

    <h1>{analytics.totalHabits}</h1>

  </div>

  <div style={{
    background: '#1e293b',
    padding: '25px',
    borderRadius: '20px'
  }}>

    <h3>✅ Total Completions</h3>

    <h1>{analytics.totalCompletions}</h1>

  </div>

  <div style={{
    background: '#1e293b',
    padding: '25px',
    borderRadius: '20px'
  }}>

    <h3>📈 Consistency</h3>

    <h1>{analytics.consistency}%</h1>

  </div>

  <div style={{
    background: '#1e293b',
    padding: '25px',
    borderRadius: '20px'
  }}>

    <h3>🎯 Active Streaks</h3>

    <h1>{analytics.activeStreaks}</h1>

  </div>

</div>
      <div style={{
        background: '#1e293b',
        padding: '30px',
        borderRadius: '20px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
      }}>

        <h2 style={{
          marginBottom: '20px'
        }}>
          Add New Habit
        </h2>

        <div style={{
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap'
        }}>

          <input
            placeholder="Habit title"
            value={habitTitle}
            onChange={(e) => setHabitTitle(e.target.value)}
            style={{
              flex: 1,
              minWidth: '250px',
              padding: '14px',
              borderRadius: '12px',
              border: 'none'
            }}
          />

          <input
            placeholder="Habit description"
            value={habitDescription}
            onChange={(e) => setHabitDescription(e.target.value)}
            style={{
              flex: 2,
              minWidth: '300px',
              padding: '14px',
              borderRadius: '12px',
              border: 'none'
            }}
          />

          <button
            onClick={createHabit}
            style={{
              padding: '14px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            + Add Habit
          </button>

        </div>

      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
        gap: '20px'
      }}>

        {
          habits.map((habit) => (

            <HabitCard
              key={habit.id}
              habit={habit}
              completeHabit={completeHabit}
              getHabitStreak={getHabitStreak}
            />

          ))
        }

      </div>

    </div>

  )

}

export default App
