import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddExpense(){

const API = process.env.REACT_APP_API_URL;

const navigate = useNavigate();

const [title,setTitle] = useState("");
const [amount,setAmount] = useState("");
const [category,setCategory] = useState("");

const submit = async(e)=>{

e.preventDefault();

const token = localStorage.getItem("token");

await axios.post(`${API}/api/expenses`,
{title,amount,category},
{
headers:{Authorization:`Bearer ${token}`}
});

navigate("/dashboard");

};

return(

<div className="min-h-screen flex items-center justify-center bg-black text-white">

<form onSubmit={submit} className="bg-white/10 p-8 rounded-xl space-y-4 w-[400px]">

<h2 className="text-2xl font-bold">Add Expense</h2>

<input
placeholder="Title"
value={title}
onChange={(e)=>setTitle(e.target.value)}
className="w-full p-2 bg-black border rounded"
/>

<input
placeholder="Amount"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
className="w-full p-2 bg-black border rounded"
/>

<input
placeholder="Category"
value={category}
onChange={(e)=>setCategory(e.target.value)}
className="w-full p-2 bg-black border rounded"
/>

<button className="w-full bg-purple-600 p-2 rounded">
Add Expense
</button>

</form>

</div>

);

}

export default AddExpense;
