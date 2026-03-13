import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

import {
PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
LineChart, Line, XAxis, YAxis, CartesianGrid,
BarChart, Bar
} from "recharts";

const API = process.env.REACT_APP_API_URL || "http://localhost:8080";

const COLORS = ["#a855f7","#6366f1","#22c55e","#f97316","#ef4444"];

function Dashboard(){

const [expenses,setExpenses] = useState([]);
const [showModal,setShowModal] = useState(false);

const [form,setForm] = useState({
title:"",
amount:"",
category:"Food",
date:""
});

useEffect(()=>{
fetchExpenses();

const interval = setInterval(()=>{
fetchExpenses();
},60000);

return ()=>clearInterval(interval);

},[]);

const fetchExpenses = async () => {
try{

const token = localStorage.getItem("token");

const res = await axios.get(`${API}/api/expenses`,{
headers:{Authorization:`Bearer ${token}`}
});

setExpenses(res.data);

}catch(err){
console.log(err);
}
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

try{

const token = localStorage.getItem("token");

await axios.post(`${API}/api/expenses`,form,{
headers:{Authorization:`Bearer ${token}`}
});

setShowModal(false);
fetchExpenses();

}catch(err){
console.log(err);
}
};

const today = new Date().toISOString().split("T")[0];
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

const dailyExpense = expenses
.filter(exp => exp.date === today)
.reduce((sum,e)=>sum+Number(e.amount),0);

const monthlyExpense = expenses
.filter(exp=>{
const d = new Date(exp.date);
return d.getMonth()===currentMonth && d.getFullYear()===currentYear;
})
.reduce((sum,e)=>sum+Number(e.amount),0);

const todayExpenses = expenses.filter(exp=>exp.date===today);

const categoryData = Object.values(
expenses.reduce((acc,exp)=>{

const cat = exp.category || "Other";

if(!acc[cat]) acc[cat]={name:cat,value:0};

acc[cat].value += Number(exp.amount);

return acc;

},{})
);

const dailyChart = Object.values(
expenses.reduce((acc,exp)=>{

const date = exp.date;

if(!acc[date]) acc[date]={date,amount:0};

acc[date].amount += Number(exp.amount);

return acc;

},{})
);

const monthlyChart = Object.values(
expenses.reduce((acc,exp)=>{

const month = new Date(exp.date)
.toLocaleString("default",{month:"short"});

if(!acc[month]) acc[month]={month,amount:0};

acc[month].amount += Number(exp.amount);

return acc;

},{})
);

const monthlyFolders = expenses.reduce((acc,exp)=>{

const month = new Date(exp.date)
.toLocaleString("default",{month:"long"});

if(!acc[month]) acc[month]=[];

acc[month].push(exp);

return acc;

},{});

return(

<div className="min-h-screen text-white relative overflow-hidden">

<div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-black to-purple-900"></div>

<div className="relative z-10 p-10">

<h1 className="text-4xl font-bold mb-10">
Smart Expense Tracker
</h1>

{/* Monthly Expense */}

<div className="text-center mb-6">

<h1 className="text-6xl font-extrabold text-purple-400">
₹{monthlyExpense}
</h1>

<p className="text-lg text-gray-300">
Monthly Expense
</p>

</div>

{/* Daily Expense */}

<div className="text-center mb-10">

<h2 className="text-4xl font-bold text-pink-400">
₹{dailyExpense}
</h2>

<p className="text-lg text-gray-300">
Today's Expense
</p>

</div>

<button
onClick={()=>setShowModal(true)}
className="bg-purple-600 px-6 py-3 rounded-xl font-bold mb-12"
>
+ Add Expense
</button>

{/* Today's Feed */}

<div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl mb-12">

<h2 className="text-xl font-bold mb-4">
Today's Spending
</h2>

{todayExpenses.length===0 && <p>No spending today</p>}

{todayExpenses.map(exp=>(
<div
key={exp.id}
className="flex justify-between border-b border-white/20 py-2"
>
<span>{exp.title}</span>
<span>₹{exp.amount}</span>
</div>
))}

</div>

{/* Charts */}

<div className="grid md:grid-cols-3 gap-8 mb-16">

<div className="bg-white/10 p-6 rounded-2xl">

<h3 className="mb-4">Category Analysis</h3>

<ResponsiveContainer width="100%" height={250}>

<PieChart>

<Pie
data={categoryData}
dataKey="value"
nameKey="name"
outerRadius={90}
>

{categoryData.map((entry,index)=>(
<Cell key={index} fill={COLORS[index % COLORS.length]} />
))}

</Pie>

<Tooltip/>
<Legend/>

</PieChart>

</ResponsiveContainer>

</div>

<div className="bg-white/10 p-6 rounded-2xl">

<h3 className="mb-4">Monthly Analysis</h3>

<ResponsiveContainer width="100%" height={250}>

<BarChart data={monthlyChart}>

<XAxis dataKey="month"/>
<YAxis/>
<Tooltip/>

<Bar dataKey="amount" fill="#6366f1"/>

</BarChart>

</ResponsiveContainer>

</div>

<div className="bg-white/10 p-6 rounded-2xl">

<h3 className="mb-4">Daily Analysis</h3>

<ResponsiveContainer width="100%" height={250}>

<LineChart data={dailyChart}>

<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="date"/>
<YAxis/>
<Tooltip/>

<Line
type="monotone"
dataKey="amount"
stroke="#a855f7"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

{/* Expense History */}

<h2 className="text-2xl font-bold mb-6">
Expense History
</h2>

<div className="grid md:grid-cols-3 gap-6">

{Object.keys(monthlyFolders).map(month=>(
<div
key={month}
className="bg-white/10 p-6 rounded-2xl"
>

<h3 className="text-xl mb-4">
{month}
</h3>

{monthlyFolders[month].map(exp=>(
<div
key={exp.id}
className="flex justify-between border-b border-white/20 py-2"
>
<span>{exp.title}</span>
<span>₹{exp.amount}</span>
</div>
))}

</div>
))}

</div>

{/* Modal */}

{showModal &&(

<div className="fixed inset-0 bg-black/60 flex items-center justify-center">

<div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl w-[400px]">

<h2 className="text-2xl mb-6">
Add Expense
</h2>

<form onSubmit={addExpense} className="space-y-4">

<input
name="title"
placeholder="Title"
className="w-full p-3 rounded bg-black/30"
onChange={handleChange}
/>

<input
name="amount"
type="number"
placeholder="Amount"
className="w-full p-3 rounded bg-black/30"
onChange={handleChange}
/>

<select
name="category"
className="w-full p-3 rounded bg-black/30"
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
type="date"
className="w-full p-3 rounded bg-black/30"
onChange={handleChange}
/>

<button
type="submit"
className="bg-purple-600 w-full py-3 rounded-xl font-bold"
>
Save Expense
</button>

</form>

</div>

</div>

)}

</div>

</div>

);

}

export default Dashboard;