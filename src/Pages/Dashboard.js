import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#c084fc", "#a855f7", "#9333ea", "#7e22ce", "#6d28d9"];

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split("T")[0];
};

function Dashboard() {

  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  const todayStr = useMemo(() => getLocalDate(), []);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchDashboardData = async () => {
    try {

      const token = localStorage.getItem("token");
      const storedName = localStorage.getItem("username");

      if (!token) {
        navigate("/");
        return;
      }

      if (storedName) setUserName(storedName);

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const date = new Date();

      const [expRes, totalRes] = await Promise.all([
        axios.get(`${API}/api/expenses`, config),
        axios.get(
          `${API}/api/expenses/total?month=${date.getMonth()+1}&year=${date.getFullYear()}`,
          config
        )
      ]);

      setExpenses(expRes.data || []);
      setTotal(Number(totalRes.data?.total || 0));

    } catch (err) {
      if (err.response?.status === 403) navigate("/");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
          `${API}/api/expenses/${editingId}`,
          payload,
          config
        );

      } else {

        await axios.post(
          `${API}/api/expenses`,
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

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`${API}/api/expenses/${id}`, config);

      fetchDashboardData();

    } catch {
      alert("Delete Failed");
    }
  };

  const liveActivityList = useMemo(() =>
    expenses
      .filter((e) => e.date.split("T")[0] === todayStr)
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
  [expenses, todayStr]);

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

  return (

    <div className="relative min-h-screen bg-[#06040a] text-white overflow-hidden">

      {/* HEADER */}

      <header className="relative px-12 py-16">

        <div className="absolute top-8 left-12 flex items-center gap-3">

          <img
            src="https://img.icons8.com/ios_filled/1200/expense.jpg"
            alt="logo"
            className="w-8 h-8"
          />

          <span className="text-2xl font-black bg-gradient-to-r from-yellow-200 to-purple-400 bg-clip-text text-transparent">
            SmartExpense
          </span>

        </div>

        <div className="absolute top-8 right-12 flex items-center gap-6">

          <span className="font-bold text-purple-300">
            {userName}
          </span>

          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded"
          >
            Logout
          </button>

        </div>

        <h1 className="text-6xl font-bold mt-16">
          ₹{total.toLocaleString()}
        </h1>

        <button
          onClick={()=>{
            setEditingId(null);
            setShowModal(true);
          }}
          className="bg-yellow-400 text-black px-6 py-3 rounded-full mt-6"
        >
          + NEW EXPENSE
        </button>

      </header>

      {/* TODAY CARDS */}

      <main className="px-12 grid grid-cols-12 gap-16 pb-20">

        <div className="col-span-8 space-y-16">

          <section>

            <h2 className="text-purple-300 mb-10">
              TODAY EXPENSE BURN
            </h2>

            <div className="flex gap-6 overflow-x-auto pb-4">

              {liveActivityList.map((exp) => (

                <motion.div
                  key={exp.id}
                  whileHover={{ scale:1.07 }}
                  className="min-w-[280px] bg-purple-900/20 p-6 rounded-3xl"
                >

                  <span className="text-yellow-400 text-2xl font-bold">
                    ₹{exp.amount}
                  </span>

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
                    >
                      Edit
                    </button>

                    <button
                      onClick={()=>handleDelete(exp.id)}
                      className="text-red-400"
                    >
                      Delete
                    </button>

                  </div>

                </motion.div>

              ))}

            </div>

          </section>

        </div>

        {/* ANALYTICS */}

        <aside className="col-span-4">

          <div className="bg-[#0d0914] p-10 rounded-3xl">

            <h2 className="text-2xl font-bold mb-6">
              Expense Analytics
            </h2>

            <div className="h-[220px]">

              <ResponsiveContainer width="100%" height="100%">

                <PieChart>

                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                  >

                    {categoryData.map((entry,index)=>(
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

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

              <select
                value={formData.category}
                onChange={(e)=>setFormData({...formData,category:e.target.value})}
                className="w-full p-3 mb-4 bg-black/40 rounded-xl"
              >
                <option>Food</option>
                <option>Travel</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Other</option>
              </select>

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