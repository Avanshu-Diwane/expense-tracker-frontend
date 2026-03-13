import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function AddExpense() {

  const API = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [title,setTitle] = useState("");
  const [amount,setAmount] = useState("");
  const [category,setCategory] = useState("Food");
  const [date,setDate] = useState("");

  const submit = async (e) => {

    e.preventDefault();

    try{

      const token = localStorage.getItem("token");

      await axios.post(
        `${API}/api/expenses`,
        { title, amount, category, date },
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      navigate("/dashboard");

    }catch(err){
      console.log("Error adding expense:",err);
      alert("Failed to add expense");
    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900 to-indigo-900 text-white">

      <motion.form
        onSubmit={submit}
        initial={{opacity:0, scale:0.9}}
        animate={{opacity:1, scale:1}}
        className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl space-y-5 w-[420px] shadow-xl"
      >

        <h2 className="text-3xl font-bold text-center">
          Add Expense
        </h2>

        <input
          placeholder="Title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="w-full p-3 bg-black/40 border border-gray-600 rounded-lg"
          required
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e)=>setAmount(e.target.value)}
          className="w-full p-3 bg-black/40 border border-gray-600 rounded-lg"
          required
        />

        <select
          value={category}
          onChange={(e)=>setCategory(e.target.value)}
          className="w-full p-3 bg-black/40 border border-gray-600 rounded-lg"
        >

          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Bills</option>
          <option>Entertainment</option>
          <option>Other</option>

        </select>

        <input
          type="date"
          value={date}
          onChange={(e)=>setDate(e.target.value)}
          className="w-full p-3 bg-black/40 border border-gray-600 rounded-lg"
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-600 py-3 rounded-xl font-bold hover:scale-105 transition"
        >
          Save Expense
        </button>

        <button
          type="button"
          onClick={()=>navigate("/dashboard")}
          className="w-full bg-gray-700 py-2 rounded-lg"
        >
          Cancel
        </button>

      </motion.form>

    </div>

  );

}

export default AddExpense;
