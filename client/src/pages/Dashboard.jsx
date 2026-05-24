import {
  useEffect,
  useState
} from 'react'

import DashboardLayout
from '../layouts/DashboardLayout'

import Header
from '../components/layout/Header'

import SummaryCards
from '../components/analytics/SummaryCards'

import XPCard
from '../components/analytics/XPCard'

import Heatmap
from '../components/analytics/Heatmap'

import HabitList
from '../components/habits/HabitList'

import {
  getAnalytics
} from '../services/analytics.service'

import InsightCard
from '../components/analytics/InsightCard'

export default function Dashboard() {

  const [analytics, setAnalytics]
    = useState(null)

  const [loading, setLoading]
    = useState(true)

  useEffect(() => {

    fetchAnalytics()

  }, [])

  const fetchAnalytics =
  async () => {

    try {

      const data =
        await getAnalytics()

      setAnalytics(data)

    } catch (err) {

      console.log(err)

    } finally {

      setLoading(false)

    }

  }

  if (loading || !analytics) {

    return (

      <div className="
        text-white
        text-center
        mt-20
      ">

        Loading dashboard...

      </div>

    )

  }

  return (

    <DashboardLayout>

      <Header />

      <div className="
        p-5
        pb-32
      ">

        <SummaryCards
          analytics={analytics}
        />

        <XPCard
          analytics={analytics}
        />

        <InsightCard
          analytics={analytics}
        />

        <Heatmap
          analytics={analytics}
        />

        <HabitList
          refreshAnalytics={
            fetchAnalytics
          }
        />

      </div>

    </DashboardLayout>

  )

}