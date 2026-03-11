import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const COLORS = ["#a855f7", "#9333ea", "#c084fc", "#7e22ce", "#6d28d9"];

function Dashboard() {

  const API = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [openMonth, setOpenMonth] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/api/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setExpenses(Array.isArray(res.data) ? res.data : []);

    } catch (err) {
      console.error(err);
    }
  };

  const monthlyTotal = useMemo(() => {

    const now = new Date();

    return expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);

  }, [expenses]);

  const todayExpenses = useMemo(() => {
    return expenses.filter(e => e.date.split("T")[0] === today);
  }, [expenses, today]);

  const todayTotal = todayExpenses.reduce((s, e) => s + Number(e.amount), 0);

  const categoryData = useMemo(() => {

    const map = {};

    expenses.forEach(e => {
      if (!map[e.category]) map[e.category] = 0;
      map[e.category] += Number(e.amount);
    });

    return Object.keys(map).map(k => ({ name: k, value: map[k] }));

  }, [expenses]);

  const monthlyData = useMemo(() => {

    const map = {};

    expenses.forEach(e => {

      const m = new Date(e.date).toLocaleString("default", { month: "short" });

      if (!map[m]) map[m] = 0;

      map[m] += Number(e.amount);

    });

    return Object.keys(map).map(k => ({ month: k, amount: map[k] }));

  }, [expenses]);

  const dailyData = useMemo(() => {

    const map = {};

    expenses.forEach(e => {

      const d = new Date(e.date).getDate();

      if (!map[d]) map[d] = 0;

      map[d] += Number(e.amount);

    });

    return Object.keys(map).map(k => ({ day: k, amount: map[k] }));

  }, [expenses]);

  const groupedExpenses = useMemo(() => {

    const map = {};

    expenses.forEach(e => {

      const key = new Date(e.date).toLocaleString("default", {
        month: "long",
        year: "numeric"
      });

      if (!map[key]) map[key] = [];

      map[key].push(e);

    });

    return map;

  }, [expenses]);

  const toggleMonth = (month) => {
    setOpenMonth(openMonth === month ? null : month);
  };

  return (

    <div className="min-h-screen bg-[#07050c] text-white p-8 relative">

      {/* BACKGROUND GLOW */}

      <div className="absolute w-[500px] h-[500px] bg-purple-700 opacity-20 blur-[160px] top-0 left-0" />
      <div className="absolute w-[500px] h-[500px] bg-pink-600 opacity-20 blur-[160px] bottom-0 right-0" />

      {/* HEADER */}

      <div className="mb-16">

        <h2 className="text-purple-400 text-sm">Monthly Expense</h2>

        <h1 className="text-7xl font-black text-yellow-300">
          ₹{monthlyTotal}
        </h1>

        <div className="mt-8">
          <p className="text-purple-400">Today</p>
          <h2 className="text-4xl text-purple-300 font-bold">
            ₹{todayTotal}
          </h2>
        </div>

      </div>

      {/* LIVE FEED */}

      <div className="mb-16">

        <h2 className="text-xl font-bold mb-6 text-purple-300">
          Live Feed (Today)
        </h2>

        <div className="flex gap-6 overflow-x-auto">

          {todayExpenses.map(exp => (

            <motion.div
              key={exp.id}
              whileHover={{ scale: 1.08, rotateX: 3 }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="min-w-[240px] bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-xl"
            >

              <h3 className="font-bold text-lg">{exp.title}</h3>

              <p className="text-yellow-300 text-2xl">
                ₹{exp.amount}
              </p>

              <p className="text-xs text-purple-300">
                {exp.category}
              </p>

            </motion.div>

          ))}

        </div>

      </div>

      {/* CHARTS */}

      <div className="grid md:grid-cols-3 gap-8 mb-16">

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white/5 p-6 rounded-3xl backdrop-blur-xl"
        >

          <h3 className="mb-4">Category</h3>

          <ResponsiveContainer width="100%" height={220}>

            <PieChart>

              <Pie data={categoryData} dataKey="value" outerRadius={80}>

                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white/5 p-6 rounded-3xl backdrop-blur-xl"
        >

          <h3 className="mb-4">Monthly</h3>

          <ResponsiveContainer width="100%" height={220}>

            <BarChart data={monthlyData}>

              <XAxis dataKey="month" />

              <Bar dataKey="amount" fill="#9333ea" />

              <Tooltip />

            </BarChart>

          </ResponsiveContainer>

        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white/5 p-6 rounded-3xl backdrop-blur-xl"
        >

          <h3 className="mb-4">Daily</h3>

          <ResponsiveContainer width="100%" height={220}>

            <LineChart data={dailyData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="day" />

              <YAxis />

              <Line type="monotone" dataKey="amount" stroke="#c084fc" strokeWidth={3} />

              <Tooltip />

            </LineChart>

          </ResponsiveContainer>

        </motion.div>

      </div>

      {/* HISTORY FOLDERS */}

      <div>

        <h2 className="text-2xl font-bold mb-6 text-purple-300">
          Expense History
        </h2>

        {Object.keys(groupedExpenses).map(month => (

          <div key={month} className="mb-6">

            <button
              onClick={() => toggleMonth(month)}
              className="w-full flex justify-between bg-purple-900/30 p-4 rounded-xl"
            >
              <span className="font-bold text-lg">📁 {month}</span>
            </button>

            {openMonth === month && (

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 space-y-2"
              >

                {groupedExpenses[month]
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map(exp => (

                    <div
                      key={exp.id}
                      className="flex justify-between bg-white/5 p-3 rounded-lg"
                    >

                      <div>
                        <p className="font-bold">{exp.title}</p>
                        <p className="text-xs text-purple-300">
                          {new Date(exp.date).toDateString()}
                        </p>
                      </div>

                      <p className="text-yellow-300 font-bold">
                        ₹{exp.amount}
                      </p>

                    </div>

                  ))}

              </motion.div>

            )}

          </div>

        ))}

      </div>

      {/* ADD EXPENSE BUTTON */}

      <button
        onClick={() => navigate("/add-expense")}
        className="fixed bottom-10 right-10 bg-purple-600 hover:bg-purple-700
        text-white px-6 py-4 rounded-full shadow-2xl transition transform hover:scale-110"
      >
        + Add Expense
      </button>

    </div>
  );
}

export default Dashboard;
