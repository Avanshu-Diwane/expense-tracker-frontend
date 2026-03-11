import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
PieChart, Pie, Cell, Tooltip,
ResponsiveContainer,
BarChart, Bar,
LineChart, Line,
XAxis, YAxis, CartesianGrid
} from "recharts";

const COLORS = ["#c084fc","#9333ea","#7e22ce","#6d28d9","#a855f7"];

function Dashboard(){

const API = process.env.REACT_APP_API_URL;

const [expenses,setExpenses] = useState([]);
const [monthlyTotal,setMonthlyTotal] = useState(0);
const [todayTotal,setTodayTotal] = useState(0);

const today = new Date().toISOString().split("T")[0];

useEffect(()=>{

fetchData();

},[]);

const fetchData = async()=>{

const token = localStorage.getItem("token");

const config = {
headers:{Authorization:`Bearer ${token}`}
};

const date = new Date();

const [expRes,totalRes] = await Promise.all([
axios.get(`${API}/api/expenses`,config),
axios.get(`${API}/api/expenses/total?month=${date.getMonth()+1}&year=${date.getFullYear()}`,config)
]);

setExpenses(expRes.data);

setMonthlyTotal(totalRes.data.total || 0);

};

const todayExpenses = useMemo(()=>{

return expenses.filter(e => e.date.split("T")[0] === today);

},[expenses]);

useEffect(()=>{

const total = todayExpenses.reduce((s,e)=>s+Number(e.amount),0);

setTodayTotal(total);

},[todayExpenses]);

const categoryData = useMemo(()=>{

const map = {};

expenses.forEach(e=>{
if(!map[e.category]) map[e.category] = 0;
map[e.category]+=Number(e.amount);
});

return Object.keys(map).map(k=>({name:k,value:map[k]}));

},[expenses]);

const monthlyData = useMemo(()=>{

const map={};

expenses.forEach(e=>{

const m = new Date(e.date).toLocaleString("default",{month:"short"});

if(!map[m]) map[m]=0;

map[m]+=Number(e.amount);

});

return Object.keys(map).map(m=>({month:m,amount:map[m]}));

},[expenses]);

const dailyData = useMemo(()=>{

const map={};

expenses.forEach(e=>{

const d = new Date(e.date).getDate();

if(!map[d]) map[d]=0;

map[d]+=Number(e.amount);

});

return Object.keys(map).map(d=>({day:d,amount:map[d]}));

},[expenses]);

return(

<div className="min-h-screen bg-[#07050c] text-white p-8">

{/* HEADER */}

<div className="mb-16">

<h2 className="text-purple-400 uppercase text-sm mb-2">
Monthly Expense
</h2>

<h1 className="text-7xl font-black text-yellow-300">
₹{monthlyTotal.toLocaleString()}
</h1>

<div className="mt-8">

<h3 className="text-sm text-purple-400">
Today's Spending
</h3>

<h2 className="text-4xl font-bold text-purple-300">
₹{todayTotal}
</h2>

</div>

</div>

{/* LIVE FEED */}

<div className="mb-16">

<h2 className="text-xl mb-6 font-bold text-purple-300">
Live Feed (Today)
</h2>

<div className="flex gap-6 overflow-x-auto">

{todayExpenses.map(exp=>(

<motion.div
key={exp.id}
whileHover={{scale:1.05}}
className="bg-purple-900/20 p-6 rounded-2xl min-w-[250px]"
>

<h3 className="text-lg font-bold">{exp.title}</h3>

<p className="text-yellow-300 text-xl">
₹{exp.amount}
</p>

<p className="text-xs text-purple-300">
{exp.category}
</p>

</motion.div>

))}

</div>

</div>

{/* ANALYTICS */}

<div className="grid md:grid-cols-3 gap-10 mb-16">

{/* PIE */}

<div className="bg-[#120c1f] p-6 rounded-2xl">

<h3 className="mb-4 font-bold">
Category Analysis
</h3>

<ResponsiveContainer width="100%" height={220}>

<PieChart>

<Pie
data={categoryData}
dataKey="value"
outerRadius={80}
>

{categoryData.map((_,i)=>(
<Cell key={i} fill={COLORS[i % COLORS.length]} />
))}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</div>

{/* BAR */}

<div className="bg-[#120c1f] p-6 rounded-2xl">

<h3 className="mb-4 font-bold">
Monthly Comparison
</h3>

<ResponsiveContainer width="100%" height={220}>

<BarChart data={monthlyData}>

<XAxis dataKey="month"/>

<Bar dataKey="amount" fill="#9333ea"/>

<Tooltip/>

</BarChart>

</ResponsiveContainer>

</div>

{/* LINE */}

<div className="bg-[#120c1f] p-6 rounded-2xl">

<h3 className="mb-4 font-bold">
Daily Trend
</h3>

<ResponsiveContainer width="100%" height={220}>

<LineChart data={dailyData}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="day"/>

<YAxis/>

<Line
type="monotone"
dataKey="amount"
stroke="#c084fc"
strokeWidth={3}
/>

<Tooltip/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

{/* HISTORY */}

<div>

<h2 className="text-2xl font-bold mb-6 text-purple-300">
Expense History
</h2>

<div className="space-y-4">

{expenses.map(e=>(

<div
key={e.id}
className="flex justify-between bg-white/5 p-4 rounded-xl"
>

<div>

<p className="font-bold">{e.title}</p>

<p className="text-xs text-purple-300">
{new Date(e.date).toDateString()}
</p>

</div>

<p className="text-yellow-300 font-bold">
₹{e.amount}
</p>

</div>

))}

</div>

</div>

</div>

);

}

export default Dashboard;
