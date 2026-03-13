import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
LineChart, Line, XAxis, YAxis, CartesianGrid,
BarChart, Bar
} from "recharts";

const API = process.env.REACT_APP_API_URL ;
const navigate = useNavigate();

const COLORS = ["#a855f7","#6366f1","#22c55e","#f97316","#ef4444"];

function Dashboard(){

const [expenses,setExpenses] = useState([]);
const [showModal,setShowModal] = useState(false);
const [editingExpense,setEditingExpense] = useState(null);

const [form,setForm] = useState({
title:"",
amount:"",
category:"Food",
date:""
});

const username = localStorage.getItem("name");

useEffect(()=>{
fetchExpenses();
},[]);

const fetchExpenses = async () => {

const token = localStorage.getItem("token");

const res = await axios.get(`${API}/api/expenses`,{
headers:{Authorization:`Bearer ${token}`}
});

setExpenses(res.data);
};

const handleChange=(e)=>{
const {name,value}=e.target;

setForm({
...form,
[name]: name==="amount" ? Number(value) : value
});
};

const addExpense=async(e)=>{
e.preventDefault();

const token = localStorage.getItem("token");

await axios.post(`${API}/api/expenses`,form,{
headers:{Authorization:`Bearer ${token}`}
});

setShowModal(false);
setForm({title:"",amount:"",category:"Food",date:""});
fetchExpenses();
};

const deleteExpense = async(id)=>{

const token = localStorage.getItem("token");

await axios.delete(`${API}/api/expenses/${id}`,{
headers:{Authorization:`Bearer ${token}`}
});

fetchExpenses();
};

const editExpense = (exp)=>{
setEditingExpense(exp);
setForm(exp);
setShowModal(true);
};

const updateExpense = async(e)=>{

e.preventDefault();

const token = localStorage.getItem("token");

await axios.put(
`${API}/api/expenses/${editingExpense.id}`,
form,
{headers:{Authorization:`Bearer ${token}`}}
);

setShowModal(false);
setEditingExpense(null);
fetchExpenses();
};

const logout = () => {
localStorage.removeItem("token");
localStorage.removeItem("name");
navigate("/login");
};

/* TOTALS */

const totalExpense = expenses.reduce((sum,e)=>sum+Number(e.amount),0);

const today = new Date().toLocaleDateString("en-CA");

const todayExpense = expenses
.filter(e=>e.date===today)
.reduce((sum,e)=>sum+Number(e.amount),0);

/* TOTAL TRANSACTIONS (ADDED) */
const totalTransactions = expenses.length;

/* CATEGORY DATA */

const categoryData = Object.values(
expenses.reduce((acc,exp)=>{

const cat = exp.category || "Other";

if(!acc[cat]) acc[cat]={name:cat,value:0};

acc[cat].value += Number(exp.amount);

return acc;

},{})
);

/* SORTED DATA */

const sortedExpenses = [...expenses].sort(
(a,b)=> new Date(a.date) - new Date(b.date)
);

/* TODAY LIVE FEED */

const todayExpenses = expenses
.filter(e => e.date === today)
.sort((a,b)=> new Date(b.date) - new Date(a.date));

/* MONTHLY DATA */

const monthlyData = Object.values(
expenses.reduce((acc,exp)=>{

const month = new Date(exp.date + "T00:00:00")
.toLocaleString("default",{month:"short",year:"numeric"});

if(!acc[month]) acc[month] = {month,total:0};

acc[month].total += Number(exp.amount);

return acc;

},{})
);

/* HISTORY */

const history = Object.entries(
expenses.reduce((acc,exp)=>{

const month = new Date(exp.date)
.toLocaleString("default",{month:"long",year:"numeric"});

if(!acc[month]) acc[month] = [];

acc[month].push(exp);

return acc;

},{})
)
.sort((a,b)=> new Date(b[1][0].date) - new Date(a[1][0].date));

return(

<div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-900 text-white p-10">

{/* NAVBAR */}

<div className="flex justify-between items-center mb-12">

<h1 className="logo-font text-5xl bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
SmartExpense
</h1>

<div className="flex gap-4 items-center">

<span className="text-purple-300">
👤 {username}
</span>

<button
onClick={logout}
className="bg-red-600 px-4 py-2 rounded-lg"
>
Logout
</button>

</div>

</div>

{/* STATS */}

<div className="grid md:grid-cols-4 gap-6 mb-12">

{/* MONTHLY EXPENSE BURN (LARGEST) */}

<motion.div
whileHover={{scale:1.05}}
className="bg-white/10 p-10 rounded-xl md:col-span-2 flex flex-col justify-center"
>

<h3 className="text-gray-300 text-xl">
Monthly Expense Burn
</h3>

<p className="text-6xl font-bold text-purple-400 mt-2">
₹{totalExpense}
</p>

</motion.div>

{/* TODAY EXPENSE */}

<motion.div
whileHover={{scale:1.05}}
className="bg-white/10 p-8 rounded-xl flex flex-col justify-center"
>

<h3 className="text-gray-300 text-lg">
Today's Expense
</h3>

<p className="text-4xl font-bold text-pink-400 mt-2">
₹{todayExpense}
</p>

</motion.div>

{/* ADD EXPENSE + TOTAL TRANSACTIONS */}

<div className="flex flex-col gap-4 items-center justify-center">

<button
onClick={()=>setShowModal(true)}
className="bg-purple-600 px-6 py-3 rounded-xl"
>
+ Add Expense
</button>

<div className="bg-white/10 px-6 py-3 rounded-xl text-center">
<p className="text-gray-300 text-sm">
Total Transactions
</p>

<p className="text-2xl font-bold text-green-400">
{totalTransactions}
</p>
</div>

</div>

</div>

{/* LIVE FEED */}

<div className="bg-white/10 rounded-xl p-8 mb-12 border border-purple-500/30">

<h2 className="text-2xl font-bold mb-6 text-purple-300">
Today's Live Expenses
</h2>

{todayExpenses.map(exp => (

<div
key={exp.id}
className="flex justify-between items-center border-b border-white/20 py-3"
>

<div>
<p className="font-semibold">{exp.title}</p>
<p className="text-sm text-gray-400">
{exp.category} • {exp.date}
</p>
</div>

<div className="flex gap-4 items-center">

<span className="text-green-400 font-bold">
₹{exp.amount}
</span>

<button
onClick={()=>editExpense(exp)}
className="text-yellow-400"
>
Edit
</button>

<button
onClick={()=>deleteExpense(exp.id)}
className="text-red-400"
>
Delete
</button>

</div>

</div>

))}

</div>

{/* CHARTS */}

<div className="grid md:grid-cols-2 gap-8 mb-16">

<div className="bg-white/10 p-6 rounded-xl">

<h3 className="mb-4">
Category Analysis
</h3>

<ResponsiveContainer width="100%" height={250}>

<PieChart>

<Pie data={categoryData} dataKey="value" nameKey="name">

{categoryData.map((entry,index)=>(
<Cell key={index} fill={COLORS[index % COLORS.length]} />
))}

</Pie>

<Tooltip/>
<Legend/>

</PieChart>

</ResponsiveContainer>

</div>

<div className="bg-white/10 p-6 rounded-xl">

<h3 className="mb-4">
Daily Trend
</h3>

<ResponsiveContainer width="100%" height={250}>

<LineChart data={sortedExpenses}>

<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="date"/>
<YAxis/>
<Tooltip/>

<Line type="monotone" dataKey="amount" stroke="#a855f7"/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

{/* MONTHLY EXPENSE BURN GRAPH */}

<div className="bg-white/10 p-10 rounded-xl mb-16">

<h3 className="mb-6 text-2xl font-bold text-purple-300">
Monthly Expense Burn
</h3>

<ResponsiveContainer width="100%" height={350}>

<BarChart data={monthlyData}>

<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="month"/>
<YAxis/>
<Tooltip/>

<Bar dataKey="total" fill="#6366f1"/>

</BarChart>

</ResponsiveContainer>

</div>

{/* HISTORY */}

<div className="bg-white/10 p-8 rounded-xl mt-16">

<h2 className="text-2xl font-bold text-purple-300 mb-8">
Expense History
</h2>

{history.map(([month,items])=>(

<div key={month} className="mb-8">

<h3 className="text-lg font-semibold text-purple-400 mb-4">
📁 {month}
</h3>

{items
.sort((a,b)=> new Date(b.date) - new Date(a.date))
.map(exp=>(

<div
key={exp.id}
className="flex justify-between items-center border-b border-white/20 py-3"
>

<div>

<p className="font-semibold">
{exp.title}
</p>

<p className="text-sm text-gray-400">
{exp.category} • {exp.date}
</p>

</div>

<div className="flex gap-4 items-center">

<span className="text-green-400 font-bold">
₹{exp.amount}
</span>

<button
onClick={()=>editExpense(exp)}
className="text-yellow-400"
>
Edit
</button>

<button
onClick={()=>deleteExpense(exp.id)}
className="text-red-400"
>
Delete
</button>

</div>

</div>

))}

</div>

))}

</div>

{/* MODAL */}

{showModal && (

<div className="fixed inset-0 bg-black/70 flex items-center justify-center">

<div className="bg-white/10 p-8 rounded-xl w-[400px]">

<div className="flex justify-between items-center mb-6">

<h2 className="text-xl">
{editingExpense ? "Edit Expense" : "Add Expense"}
</h2>

<button
onClick={()=>{
setShowModal(false);
setEditingExpense(null);
}}
className="text-red-400 text-xl"
>
✖
</button>

</div>

<form
onSubmit={editingExpense ? updateExpense : addExpense}
className="space-y-4"
>

<input
name="title"
value={form.title}
placeholder="Title"
className="w-full p-3 rounded bg-black/40"
onChange={handleChange}
/>

<input
name="amount"
value={form.amount}
type="number"
placeholder="Amount"
className="w-full p-3 rounded bg-black/40"
onChange={handleChange}
/>

<select
name="category"
value={form.category}
className="w-full p-3 rounded bg-black/40"
onChange={handleChange}
>

<option>Food</option>
<option>Travel</option>
<option>Shopping</option>
<option>Bills</option>
<option>Other</option>

</select>

<input
name="date"
value={form.date}
type="date"
className="w-full p-3 rounded bg-black/40"
onChange={handleChange}
/>

<button
className="bg-purple-600 w-full py-3 rounded-lg"
>
Save
</button>

</form>

</div>

</div>

)}

</div>

);

}

export default Dashboard;