import React, { useEffect, useState } from "react"
import axios from "axios"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts"

const DAILY_GOAL = 500

const COLORS = [
  "#a855f7",
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#ef4444",
  "#eab308"
]

export default function Dashboard() {

  const [expenses, setExpenses] = useState([])

  /* ================= FETCH EXPENSE DATA ================= */

  useEffect(() => {
    fetchExpenses()
  }, [])

 const fetchExpenses = async () => {
  try {
    const res = await axios.get("/api/expenses")

    const data = res.data.expenses || res.data

    setExpenses(Array.isArray(data) ? data : [])

  } catch (err) {
    console.error(err)
    setExpenses([])
  }
}

  /* ================= TODAY EXPENSE ================= */

  const today = new Date().toISOString().slice(0, 10)

  const todayTotal = expenses
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + Number(e.amount), 0)

  /* ================= CATEGORY DATA ================= */

  const categoryMap = {}

  expenses.forEach(exp => {
    if (!categoryMap[exp.category]) {
      categoryMap[exp.category] = 0
    }

    categoryMap[exp.category] += Number(exp.amount)
  })

  const categoryData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key]
  }))

  /* ================= DAILY DATA ================= */

  const dailyMap = {}

  expenses.forEach(exp => {

    const day = exp.date

    if (!dailyMap[day]) {
      dailyMap[day] = 0
    }

    dailyMap[day] += Number(exp.amount)

  })

  const dailyData = Object.keys(dailyMap).map(day => ({
    day,
    amount: dailyMap[day]
  }))

  /* ================= MONTHLY DATA ================= */

  const monthMap = {}

  expenses.forEach(exp => {

    const month = exp.date.slice(0, 7)

    if (!monthMap[month]) {
      monthMap[month] = 0
    }

    monthMap[month] += Number(exp.amount)

  })

  const monthlyComparisonData = Object.keys(monthMap).map(month => ({
    month,
    amount: monthMap[month]
  }))

  /* ================= UI ================= */

  return (

    <div className="min-h-screen bg-[#09090f] text-white p-10">

      <h1 className="text-4xl font-bold mb-10 text-purple-300">
        SmartExpense Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* ================= MAIN SECTION ================= */}

        <div className="md:col-span-2 space-y-8">

          {/* TODAY SPENDING */}

          <div className="bg-[#12101a] p-6 rounded-xl">

            <h2 className="text-xl mb-4 text-purple-200">
              Today Spending
            </h2>

            <p className="text-3xl font-bold">
              ₹{todayTotal}
            </p>

          </div>

          {/* EXPENSE LIST */}

          <div className="bg-[#12101a] p-6 rounded-xl">

            <h2 className="text-xl mb-6 text-purple-200">
              Recent Expenses
            </h2>

            <div className="space-y-4">

              {expenses.map((exp, i) => (

                <div
                  key={i}
                  className="flex justify-between bg-[#1a1625] p-4 rounded-lg"
                >

                  <div>
                    <p className="font-semibold">
                      {exp.title}
                    </p>

                    <p className="text-sm text-gray-400">
                      {exp.category}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="font-bold text-purple-300">
                      ₹{exp.amount}
                    </p>

                    <p className="text-xs text-gray-500">
                      {exp.date}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* ================= ANALYTICS ================= */}

        <aside className="space-y-10">

          {/* BUDGET PROGRESS */}

          <div className="bg-[#12101a] p-6 rounded-xl">

            <h2 className="text-lg mb-4 text-purple-200">
              Daily Budget
            </h2>

            <div className="bg-gray-700 h-2 rounded-full overflow-hidden">

              <div
                className="bg-purple-500 h-full"
                style={{
                  width: `${Math.min((todayTotal / DAILY_GOAL) * 100, 100)}%`
                }}
              />

            </div>

            <p className="text-sm mt-2 text-gray-400">
              ₹{todayTotal} / ₹{DAILY_GOAL}
            </p>

          </div>

          {/* CATEGORY PIE CHART */}

         <div className="bg-[#12101a] p-6 rounded-xl min-h-[260px]">

            <h2 className="text-lg mb-4 text-purple-200">
              Expense Categories
            </h2>

            <ResponsiveContainer width="100%" height="100%">

              <PieChart>

                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                >

                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

          {/* DAILY EXPENSE GRAPH */}

         <div className="bg-[#12101a] p-6 rounded-xl min-h-[260px]">

            <h2 className="text-lg mb-4 text-purple-200">
              Daily Spending Trend
            </h2>

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={dailyData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="day" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#a855f7"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* MONTHLY BAR GRAPH */}

         <div className="bg-[#12101a] p-6 rounded-xl min-h-[260px]">

            <h2 className="text-lg mb-4 text-purple-200">
              Monthly Expenses
            </h2>

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={monthlyComparisonData}>

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Bar dataKey="amount" fill="#a855f7" />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </aside>

      </div>

    </div>

  )
}