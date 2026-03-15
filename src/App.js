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
        // This pings your specific Render link
        await axios.get("https://smart-expense-4g4x.onrender.com/api/users"); 
      } catch (err) {
        // We don't care about the error, we just want the server to wake up!
        console.log("Please wait...");
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