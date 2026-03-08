import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
} from "recharts";

const COLORS = [
  "#c084fc",
  "#a855f7",
  "#9333ea",
  "#7e22ce",
  "#6d28d9"
];

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split("T")[0];
};

function Dashboard() {
  const navigate = useNavigate();


const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/");
};

<div className="absolute top-4 left-30 flex items-center gap-2 cursor-pointer"
     onClick={() => navigate("/dashboard")}
>
  <img src="https://img.icons8.com/ios_filled/1200/expense.jpg" alt="logo" className="w-10 h-10" />

 <span className="text-xl font-bold bg-gradient-to-r from-yellow-200 to-purple-400 bg-clip-text text-transparent">
  SmartExpense
</span>
</div>
  const todayStr = useMemo(() => getLocalDate(), []);
  const DAILY_GOAL = 5000;

  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  // ADD THIS LINE BELOW:
  const [userName, setUserName] = useState("User");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: todayStr
  });

  // Inside Dashboard function

useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedName = localStorage.getItem("username"); // Look for the name here
      
      if (!token) {
        navigate("/");
        return;
      }

      if (storedName) {
        setUserName(storedName); // Update the state with the real name
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const date = new Date();

      const [expRes, totalRes] = await Promise.all([
        axios.get("http://localhost:8080/api/expenses", config),
        axios.get(`http://localhost:8080/api/expenses/total?month=${date.getMonth() + 1}&year=${date.getFullYear()}`, config)
      ]);

      setExpenses(expRes.data || []);
      setTotal(Number(totalRes.data?.total || 0));
    } catch (err) {
      if (err.response?.status === 403) navigate("/");
    }
  };

  fetchDashboardData();
}, [navigate]); // Add navigate to dependency array

  const fetchDashboardData = async () => {

    try {

      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const date = new Date();

      const [expRes, totalRes] = await Promise.all([
        axios.get("http://localhost:8080/api/expenses", config),
        axios.get(
          `http://localhost:8080/api/expenses/total?month=${date.getMonth() + 1}&year=${date.getFullYear()}`,
          config
        )
      ]);

      setExpenses(expRes.data || []);
      setTotal(Number(totalRes.data?.total || 0));

    } catch (err) {
      if (err.response?.status === 403) navigate("/");
    }

  };

  const handleFormSubmit = async (e) => {

    e.preventDefault();

    try {

      const token = localStorage.getItem("token");

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingId) {

        await axios.put(
          `http://localhost:8080/api/expenses/${editingId}`,
          payload,
          config
        );

      } else {

        await axios.post(
          "http://localhost:8080/api/expenses",
          payload,
          config
        );

      }

      setShowModal(false);
      setEditingId(null);

      setFormData({
        title: "",
        amount: "",
        category: "Food",
        date: todayStr
      });

      fetchDashboardData();

    } catch {
      alert("Action Failed");
    }

  };

  const handleDelete = async (id) => {

    if (!window.confirm("Delete Expense?")) return;

    try {

      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:8080/api/expenses/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchDashboardData();

    } catch {
      alert("Delete Failed");
    }

  };

  const liveActivityList = useMemo(() =>
      expenses
        .filter((e) => e.date.split("T")[0] === todayStr)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [expenses, todayStr]
  );

  const todayTotal = useMemo(() =>
      liveActivityList.reduce((s, i) => s + Number(i.amount || 0), 0),
    [liveActivityList]
  );

  const monthlyFolders = useMemo(() => {

    const sorted = [...expenses].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return sorted.reduce((acc, curr) => {

      const month = new Date(curr.date).toLocaleString(
        "default",
        { month: "long", year: "numeric" }
      );

      if (!acc[month]) acc[month] = [];

      acc[month].push(curr);

      return acc;

    }, {});

  }, [expenses]);

  const categoryData = useMemo(() => {

  const map = {};

  expenses.forEach((e) => {
    if (!map[e.category]) map[e.category] = 0;
    map[e.category] += Number(e.amount);
  });

  return Object.keys(map).map((key) => ({
    name: key,
    value: map[key]
  }));

}, [expenses]);

const dailyData = useMemo(() => {

  const map = {};

  expenses.forEach((e) => {

    const day = new Date(e.date).getDate();

    if (!map[day]) map[day] = 0;

    map[day] += Number(e.amount);

  });

  return Object.keys(map).map((day) => ({
    day,
    amount: map[day]
  }));

}, [expenses]);

const monthlyComparisonData = useMemo(() => {

  const map = {};

  expenses.forEach((e) => {

    const month = new Date(e.date).toLocaleString("default", {
      month: "short",
      year: "numeric"
    });

    if (!map[month]) map[month] = 0;

    map[month] += Number(e.amount);

  });

  return Object.keys(map).map((month) => ({
    month,
    amount: map[month]
  }));

}, [expenses]);

  return (

    <div className="relative min-h-screen bg-[#06040a] text-white overflow-hidden">

      {/* FLOATING LAVENDER BACKGROUND */}

      <div className="absolute inset-0 -z-10">

        <motion.div
          animate={{ x:[0,80,-60,0], y:[0,-60,60,0] }}
          transition={{ duration:25, repeat:Infinity }}
          className="absolute top-20 left-20 w-[400px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full"
        />

        <motion.div
          animate={{ x:[0,-70,60,0], y:[0,60,-40,0] }}
          transition={{ duration:28, repeat:Infinity }}
          className="absolute bottom-20 right-20 w-[420px] h-[420px] bg-violet-500/20 blur-[120px] rounded-full"
        />

        <motion.div
          animate={{ x:[0,60,-40,0], y:[0,-50,40,0] }}
          transition={{ duration:30, repeat:Infinity }}
          className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-purple-400/20 blur-[120px] rounded-full"
        />

      </div>

      {/* HEADER */}

      <header className="relative px-12 py-16">

  {/* LOGO - MOVED TO LEFT FOR BETTER SPACING */}
  <div className="absolute top-8 left-12 flex items-center gap-3">
    <img 
      src="https://img.icons8.com/ios_filled/1200/expense.jpg"
      alt="logo"
      className="w-8 h-8 opacity-90"
    />
    <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#fef08a] via-[#c4b5fd] to-[#a855f7] bg-clip-text text-transparent">
      SmartExpense
    </span>
  </div>

  {/* TOP NAVIGATION RIGHT - USER & LOGOUT */}
  <div className="absolute top-8 right-12 flex items-center gap-6 z-50">
    <div className="flex flex-col items-end">
      <p className="text-[10px] font-bold text-purple-400/50 uppercase tracking-[0.3em]">
        Good to see you
      </p>
      <span className="text-lg font-black italic bg-gradient-to-r from-[#d4af37] via-[#c4b5fd] to-[#fef08a] bg-clip-text text-transparent">
        {userName}
      </span>
    </div>

    <button
      onClick={handleLogout}
      className="bg-red-500/10 border border-red-500/40 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
    >
      Logout
    </button>
  </div>

  {/* MONTHLY EXPENSE BIG - THE SHANDY STYLE */}
  <div className="mt-12">
    <p className="text-purple-600 uppercase text-xs tracking-[0.4em] font-bold mb-2">
      MONTHLY EXPENSE BURN
    </p>

    <h1 className="text-9xl font-black italic tracking-tighter leading-none animate-shimmer
      bg-[length:200%_auto] bg-clip-text text-transparent 
      bg-gradient-to-r from-[#d4af37] via-[#c4b5fd] via-[#1a1625] via-[#fef08a] to-[#d4af37]
      drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
      ₹{total.toLocaleString()}
    </h1>
    
    {/* Subtle decorative line */}
    <div className="w-1/3 h-[2px] mt-4 bg-gradient-to-r from-purple-500/40 to-transparent blur-sm" />
  </div>

  <style>{`
    @keyframes shimmer {
      to { bg-position: 200% center; }
    }
    .animate-shimmer {
      animation: shimmer 8s linear infinite;
    }
  `}</style>

  {/* ACTIONS ROW */}
  <div className="flex items-center gap-8 mt-10">
    <button
      onClick={() => {
        setEditingId(null);
        setShowModal(true);
      }}
      className="bg-yellow-400 text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition shadow-lg shadow-yellow-400/20"
    >
      + NEW EXPENSE
    </button>

    <div>
      <p className="text-purple-300/50 text-[10px] uppercase tracking-widest font-bold">
        TODAY EXPENSE BURN
      </p>
      <p className="text-3xl text-purple-400 font-black italic">
        ₹{todayTotal.toLocaleString()}
      </p>
    </div>
  </div>

</header>

      {/* MAIN */}

      <main className="px-12 grid grid-cols-12 gap-30 pb-20">

        {/* LEFT */}

        <div className="col-span-8 space-y-16">

          <section>

           <h2 className="text-purple-300/40 mb-10 uppercase text-[16px] font-bold tracking-[0.6em]">
           TODAY EXPENSE BURN
          </h2>

            <div className="flex gap-6 overflow-x-auto pb-4">

              {liveActivityList.map((exp) => (

                <motion.div
                  key={exp.id}
                  initial={{ opacity:0, y:40 }}
                  animate={{ opacity:1, y:0 }}
                  whileHover={{ scale:1.07 }}
                  className="min-w-[280px] bg-gradient-to-br from-purple-500/20 to-purple-900/20 border border-purple-400/30 p-6 rounded-3xl backdrop-blur-xl shadow-lg"
                >

                  <div className="flex justify-between mb-4">

                    <span className="text-xs text-purple-300">
                      LIVE
                    </span>

                    <span className="text-yellow-400 text-2xl font-bold">
                      ₹{exp.amount}
                    </span>

                  </div>

                  <h3 className="font-bold text-lg mb-3">
                    {exp.title}
                  </h3>

                  <p className="text-xs text-purple-300 mb-3">
                    {new Date(exp.date).toDateString()}
                  </p>

                  <div className="flex gap-3">

                    <button
                      onClick={()=>{
                        setEditingId(exp.id);
                        setFormData({
                          title:exp.title,
                          amount:exp.amount,
                          category:exp.category,
                          date:exp.date.split("T")[0]
                        });
                        setShowModal(true);
                      }}
                      className="text-xs text-purple-300"
                    >
                      Edit
                    </button>

                    <button
                      onClick={()=>handleDelete(exp.id)}
                      className="text-xs text-red-400"
                    >
                      Delete
                    </button>

                  </div>

                </motion.div>

              ))}

            </div>

          </section>

          {/* HISTORY */}

          <section>

            <h2 className="text-purple-300 mb-6 uppercase text-sm tracking-widest">
              Transaction History
            </h2>

            {Object.keys(monthlyFolders).map((month)=>(
              
              <details
                key={month}
                className="mb-6 bg-white/5 p-6 rounded-3xl"
              >

                <summary className="cursor-pointer text-xl font-bold text-yellow-400">
                  {month}
                </summary>

                <div className="mt-4 space-y-4">

                  {monthlyFolders[month].map((e)=>(
                    
                    <div
                      key={e.id}
                      className="flex justify-between border-t border-white/10 pt-4"
                    >

                      <div>

                        <p className="font-semibold">
                          {e.title}
                        </p>

                        <p className="text-xs text-purple-300">
                          {new Date(e.date).toDateString()}
                        </p>

                      </div>

                      <span className="text-yellow-400 font-bold">
                        ₹{e.amount}
                      </span>

                    </div>

                  ))}

                </div>

              </details>

            ))}

          </section>

        </div>

        {/* ANALYTICS */}

        <aside className="col-span-4">

          <div className="bg-[#0d0914] p-10 rounded-3xl border border-purple-400/20 sticky top-10">

            <h2 className="text-3xl font-bold mb-8 text-purple-300">
              Expense Analytics
            </h2>

            <p className="text-sm text-gray-400 mb-2">
              Today's Date
            </p>

            <p className="text-xl mb-6">
              {new Date().toDateString()}
            </p>

            <p className="text-sm text-gray-400 mb-2">
              Monthly Expense
            </p>

            <p className="text-3xl text-yellow-400 font-bold mb-6">
              ₹{total}
            </p>

            <p className="text-sm text-gray-400 mb-2">
              Today Expense
            </p>

            <p className="text-2xl text-purple-400 font-bold">
              ₹{todayTotal}
            </p>

            <div className="mt-6 bg-white/10 h-2 rounded-full">

              <motion.div
                initial={{ width:0 }}
                animate={{
                  width:`${Math.min((todayTotal/DAILY_GOAL)*100,100)}%`
                }}
                className="bg-purple-500 h-2 rounded-full"
              />

            </div>
            {/* CATEGORY PIE CHART */}

<div className="mt-10">

  <p className="text-sm text-gray-400 mb-3">
    Category Breakdown
  </p>

  <div className="h-[220px]">

    <ResponsiveContainer width="100%" height="100%">

      <PieChart>

        <Pie
          data={categoryData}
          dataKey="value"
          nameKey="name"
          outerRadius={80}
        >

          {categoryData.map((entry, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))}

        </Pie>

        <Tooltip />

      </PieChart>

    </ResponsiveContainer>

  </div>

  {/* MONTHLY COMPARISON CHART */}

<div className="mt-10">

  <p className="text-sm text-gray-400 mb-3">
    Monthly Expense Comparison
  </p>

  <div className="h-[220px]">

    <ResponsiveContainer width="100%" height="100%">

      <BarChart data={monthlyComparisonData}>

        <CartesianGrid strokeDasharray="3 3" stroke="#444" />

        <XAxis dataKey="month" stroke="#aaa" />

        <YAxis stroke="#aaa" />

        <Tooltip />

        <Bar
          dataKey="amount"
          fill="#c084fc"
          radius={[6,6,0,0]}
        />

      </BarChart>

    </ResponsiveContainer>

  </div>

</div>

</div>



{/* DAILY LINE CHART */}

<div className="mt-10">

  <p className="text-sm text-gray-400 mb-3">
    Daily Expense Trend
  </p>

  <div className="h-[220px]">

    <ResponsiveContainer width="100%" height="100%">

      <LineChart data={dailyData}>

        <CartesianGrid strokeDasharray="3 3" stroke="#444" />

        <XAxis dataKey="day" stroke="#aaa" />

        <YAxis stroke="#aaa" />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="amount"
          stroke="#c084fc"
          strokeWidth={3}
        />

      </LineChart>

    </ResponsiveContainer>

  </div>

</div>

          </div>

        </aside>

      </main>

      {/* MODAL */}

      <AnimatePresence>

        {showModal && (

          <div className="fixed inset-0 flex items-center justify-center bg-black/80">

            <motion.form
              onSubmit={handleFormSubmit}
              initial={{ scale:0.7, opacity:0 }}
              animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.7, opacity:0 }}
              className="bg-[#0c0813] p-10 rounded-3xl w-[400px]"
            >

              <h2 className="text-2xl mb-6">
                {editingId ? "Edit Expense" : "Add Expense"}
              </h2>

              <input
                required
                placeholder="Title"
                value={formData.title}
                onChange={(e)=>setFormData({...formData,title:e.target.value})}
                className="w-full p-3 mb-4 bg-black/40 rounded-xl"
              />

              <input
                required
                type="number"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e)=>setFormData({...formData,amount:e.target.value})}
                className="w-full p-3 mb-4 bg-black/40 rounded-xl"
              />

              <input
                type="date"
                value={formData.date}
                onChange={(e)=>setFormData({...formData,date:e.target.value})}
                className="w-full p-3 mb-6 bg-black/40 rounded-xl"
              />

              <div className="flex gap-4">

                <button
                  type="submit"
                  className="flex-1 bg-purple-500 py-3 rounded-full"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={()=>setShowModal(false)}
                  className="flex-1 bg-gray-600 py-3 rounded-full"
                >
                  Cancel
                </button>

              </div>

            </motion.form>

          </div>

        )}

      </AnimatePresence>

    </div>
  );
}

export default Dashboard;