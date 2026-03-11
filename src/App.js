import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import AddExpense from "./Pages/AddExpense";   // ← add this

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/add-expense" element={<AddExpense />} />   {/* add this */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
