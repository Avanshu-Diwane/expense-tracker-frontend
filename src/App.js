import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react"; // Import useEffect
import axios from "axios"; // Import axios
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import AddExpense from "./Pages/AddExpense";

function App() {
  
 useEffect(() => {
    const wakeUp = async () => {
      try {
        const API = "https://smart-expense-4g4x.onrender.com"; // Hardcode for a test if env fails
        await axios.get(`${API}/api/users`, {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        console.log("Please Wait...");
      }
    };
    wakeUp();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-expense" element={<AddExpense />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;