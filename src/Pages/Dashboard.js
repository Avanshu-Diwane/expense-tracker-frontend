import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
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

const COLORS = ["#c084fc", "#a855f7", "#9333ea", "#7e22ce", "#6d28d9"];

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split("T")[0];
};

function Dashboard() {
  const navigate = useNavigate();
  const todayStr = useMemo(() => getLocalDate(), []);
  const DAILY_GOAL = 5000;

  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [userName, setUserName] = useState("User");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: todayStr
  });

  // 1. Unified Fetch Function using Environment Variables
  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const storedName = localStorage.getItem("username");
      
      if (!token) {
        navigate("/");
        return;
      }

      if (storedName) setUserName(storedName);

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const date = new Date();
      const API_URL = process.env.REACT_APP_API_URL;

      const [expRes, totalRes] = await Promise.all([
        axios.get(`${API_URL}/api/expenses`, config),
        axios.get(`${API_URL}/api/expenses/total?month=${date.getMonth() + 1}&year=${date.getFullYear()}`, config)
      ]);

      setExpenses(expRes.data || []);
      setTotal(Number(totalRes.data?.total || 0));
    } catch (err) {
      if (err.response?.status === 403) navigate("/");
      console.error("Data Fetch Error:", err);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const API_URL = process.env.REACT_APP_API_URL;
      const payload = { ...formData, amount: parseFloat(formData.amount) };

      if (editingId) {
        await axios.put(`${API_URL}/api/expenses/${editingId}`, payload, config);
      } else {
        await axios.post(`${API_URL}/api/expenses`, payload, config);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({ title: "", amount: "", category: "Food", date: todayStr });
      fetchDashboardData();
    } catch (err) {
      alert("Action Failed: Check console for details");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete Expense?")) return;
    try {
      const token = localStorage.getItem("token");
      const API_URL = process.env.REACT_APP_API_URL;
      await axios.delete(`${API_URL}/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (err) {
      alert("Delete Failed");
    }
  };

  // Memoized Data for Charts
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
    const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted.reduce((acc, curr) => {
      const month = new Date(curr.date).toLocaleString("default", { month: "long", year: "numeric" });
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
    return Object.keys(map).map((key) => ({ name: key, value: map[key] }));
  }, [expenses]);

  const dailyData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const day = new Date(e.date).getDate();
      if (!map[day]) map[day] = 0;
      map[day] += Number(e.amount);
    });
    return Object.keys(map).map((day) => ({ day, amount: map[day] }));
  }, [expenses]);

  const monthlyComparisonData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const month = new Date(e.date).toLocaleString("default", { month: "short", year: "numeric" });
      if (!map[month]) map[month] = 0;
      map[month] += Number(e.amount);
    });
    return Object.keys(map).map((month) => ({ month, amount: map[month] }));
  }, [expenses]);

  return (
    <div className="relative min-h-screen bg-[#06040a] text-white overflow-x-hidden">
      {/* BACKGROUND ANIMATION */}
      <div className="absolute inset-0 -z-10">
        <motion.div animate={{ x: [0, 80, -60, 0], y: [0, -60, 60, 0] }} transition={{ duration: 25, repeat: Infinity }} className="absolute top-20 left-20 w-[400px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full" />
        <motion.div animate={{ x: [0, -70, 60, 0], y: [0, 60, -40, 0] }} transition={{ duration: 28, repeat: Infinity }} className="absolute bottom-20 right-20 w-[420px] h-[420px] bg-violet-500/20 blur-[120px] rounded-full" />
      </div>

      {/* HEADER */}
      <header className="relative px-6 md:px-12 py-16">
        <div className="absolute top-8 left-6 md:left-12 flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
          <img src="https://img.icons8.com/ios_filled/1200/expense.jpg" alt="logo" className="w-8 h-8 opacity-90" />
          <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#fef08a] via-[#c4b5fd] to-[#a855f7] bg-clip-text text-transparent">SmartExpense</span>
        </div>

        <div className="absolute top-8 right-6 md:right-12 flex items-center gap-6 z-50">
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-bold text-purple-400/50 uppercase tracking-[0.3em]">Good to see you</p>
            <span className="text-lg font-black italic bg-gradient-to-r from-[#d4af37] via-[#c4b5fd] to-[#fef08a] bg-clip-text text-transparent">{userName}</span>
          </div>
          <button onClick={handleLogout} className="bg-red-500/10 border border-red-500/40 px-5 py-2 rounded-full text-[9px] font-black uppercase hover:bg-red-500 transition-all">Logout</button>
        </div>

        <div className="mt-12">
          <p className="text-purple-600 uppercase text-xs tracking-[0.4em] font-bold mb-2">MONTHLY EXPENSE BURN</p>
          <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter leading-none bg-gradient-to-r from-[#d4af37] via-[#c4b5fd] to-[#fef08a] bg-clip-text text-transparent drop-shadow-xl">
            ₹{total.toLocaleString()}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-8 mt-10">
          <button onClick={() => { setEditingId(null); setShowModal(true); }} className="bg-yellow-400 text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition shadow-lg shadow-yellow-400/20">+ NEW EXPENSE</button>
          <div>
            <p className="text-purple-300/50 text-[10px] uppercase tracking-widest font-bold">TODAY EXPENSE BURN</p>
            <p className="text-3xl text-purple-400 font-black italic">₹{todayTotal.toLocaleString()}</p>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-10 pb-20">
        <div className="md:col-span-8 space-y-16">
          <section>
            <h2 className="text-purple-300/40 mb-6 uppercase text-sm font-bold tracking-[0.6em]">LIVE FEED</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
              {liveActivityList.map((exp) => (
                <motion.div key={exp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.05 }} className="min-w-[280px] bg-purple-900/10 border border-purple-400/20 p-6 rounded-3xl backdrop-blur-xl">
                  <div className="flex justify-between mb-4">
                    <span className="text-[10px] text-purple-400 font-bold">LIVE</span>
                    <span className="text-yellow-400 text-2xl font-bold">₹{exp.amount}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{exp.title}</h3>
                  <p className="text-xs text-purple-300/60 mb-4">{new Date(exp.date).toDateString()}</p>
                  <div className="flex gap-4">
                    <button onClick={() => { setEditingId(exp.id); setFormData({ title: exp.title, amount: exp.amount, category: exp.category, date: exp.date.split("T")[0] }); setShowModal(true); }} className="text-xs text-purple-400 hover:text-white">Edit</button>
                    <button onClick={() => handleDelete(exp.id)} className="text-xs text-red-400 hover:text-red-200">Delete</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-purple-300/40 mb-6 uppercase text-sm font-bold tracking-[0.6em]">History</h2>
            {Object.keys(monthlyFolders).map((month) => (
              <details key={month} className="mb-4 bg-white/5 rounded-2xl overflow-hidden">
                <summary className="p-6 cursor-pointer font-bold text-yellow-400/80 flex justify-between items-center hover:bg-white/5 transition">
                  {month}
                  <span className="text-xs text-purple-400">View Transactions</span>
                </summary>
                <div className="p-6 pt-0 space-y-4">
                  {monthlyFolders[month].map((e) => (
                    <div key={e.id} className="flex justify-between items-center py-3 border-t border-white/5">
                      <div>
                        <p className="font-medium">{e.title}</p>
                        <p className="text-[10px] text-purple-300/50">{new Date(e.date).toDateString()}</p>
                      </div>
                      <span className="text-yellow-400 font-bold">₹{e.amount}</span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </section>
        </div>

        <aside className="md:col-span-4 space-y-8">
          <div className="bg-[#0d0914] p-8 rounded-3xl border border-purple-400/10 sticky top-10">
            <h2 className="text-2xl font-bold mb-6 text-purple-200">Analytics</h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Budget Progress</p>
                <div className="bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((todayTotal / DAILY_GOAL) * 100, 100)}%` }} className="bg-purple-500 h-full" />
                </div>
              </div>
              
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={60} innerRadius={40} paddingAngle={5}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1625', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyComparisonData}>
                    <XAxis dataKey="month" hide />
                    <Tooltip contentStyle={{ background: '#1a1625', border: 'none' }} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="amount" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* ADD/EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <motion.form onSubmit={handleFormSubmit} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#120d1d] p-8 rounded-[32px] w-full max-w-md border border-purple-500/20">
              <h2 className="text-2xl font-bold mb-8">{editingId ? "Edit Transaction" : "New Transaction"}</h2>
              <div className="space-y-4 mb-8">
                <input required placeholder="Description" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-4 bg-white/5 rounded-2xl outline-none focus:ring-1 ring-purple-500/50" />
                <input required type="number" placeholder="Amount" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full p-4 bg-white/5 rounded-2xl outline-none focus:ring-1 ring-purple-500/50" />
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-4 bg-white/5 rounded-2xl outline-none">
                  <option value="Food">Food</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Travel">Travel</option>
                  <option value="Bills">Bills</option>
                  <option value="Other">Other</option>
                </select>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-4 bg-white/5 rounded-2xl outline-none" />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-purple-600 py-4 rounded-2xl font-bold hover:bg-purple-500 transition">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 py-4 rounded-2xl font-bold hover:bg-white/10 transition">Cancel</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;   