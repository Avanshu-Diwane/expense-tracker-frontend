import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // Added for pop-up logic
  const navigate = useNavigate();
  const loginRef = useRef(null);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // This wakes up the Render server as soon as the page loads
    fetch(process.env.REACT_APP_API_URL).catch(() => {});
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* ---------------- AUTH FUNCTION ---------------- */
  const handleAuth = async () => {
    setLoading(true);
    const API_URL = process.env.REACT_APP_API_URL;

    if (isSignup) {
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/users/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: fullName, email: email, password: password })
        });

        if (response.ok) {
          alert("Account created successfully!");
          setIsSignup(false);
        } else {
          alert("Signup failed: User may already exist");
        }
      } catch (error) {
        console.error("Signup Error:", error);
        alert("Cannot connect to server. It might still be waking up.");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const response = await fetch(`${API_URL}/api/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, password: password })
        });

        if (!response.ok) throw new Error("Invalid Credentials");

        const contentType = response.headers.get("content-type");
        let token;
        
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await response.json();
          token = data.token;
        } else {
          token = await response.text();
        }

        const extractedName = email.split('@')[0];
        localStorage.setItem("token", token);
        localStorage.setItem("username", extractedName); 

        navigate("/dashboard");
      } catch (error) {
        console.error("Login Error:", error);
        alert("Invalid email or password. Note: If this is the first try, the server may take 30s to wake up.");
      } finally {
        setLoading(false);
      }
    }
  };

  /* ---------------- 3D CARD EFFECT ---------------- */
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * -10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      
      {/* ---------------- NAVBAR ---------------- */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/40 border-b border-white/10 px-10 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
          SmartExpense
        </h1>
        <button 
          onClick={() => setShowLoginModal(true)}
          className="px-6 py-2 rounded-full border border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all"
        >
          Login / Sign Up
        </button>
      </nav>

      {/* ---------------- BACKGROUND ---------------- */}
      <motion.div
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="fixed inset-0 -z-10 bg-[linear-gradient(120deg,#0a0a0a,#1a1a1a,#2a2a2a,#4b2a63,#1a1a1a,#0a0a0a)] bg-[length:400%_400%] opacity:70"
      />

      <motion.div
        animate={{ x: [-100, 100, -100], y: [-30, 60, -30] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="fixed w-[600px] h-[600px] bg-gray-400/10 blur-[160px] rounded-full top-20 left-10"
      />

      <motion.div
        animate={{ x: [100, -100, 100], y: [30, -60, 30] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="fixed w-[600px] h-[600px] bg-purple-500/10 blur-[130px] rounded-full bottom-20 right-10"
      />

      {/* ---------------- LOGIN POP-UP (MODAL) ---------------- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute -top-12 right-0 text-white text-3xl hover:text-yellow-400 transition"
            >
              ✕
            </button>

            <div className="backdrop-blur-2xl bg-white/10 border border-white/20 p-10 rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.25)] w-96">
              <h2 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-yellow-400 via-gray-200 to-purple-400 bg-clip-text text-transparent">
                {isSignup ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-400 text-sm text-center mb-6">
                {isSignup ? "Experience luxury expense management" : "Sign in to continue"}
              </p>

              <div className="space-y-4">
                {isSignup && (
                  <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-yellow-400/50 transition" />
                )}
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-yellow-400/50 transition" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-yellow-400/50 transition" />
                {isSignup && (
                  <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-yellow-400/50 transition" />
                )}
              </div>

              <button 
                onClick={handleAuth} 
                disabled={loading}
                className={`w-full mt-6 p-3 rounded-xl bg-gradient-to-r from-yellow-400 via-gray-300 to-gray-400 text-black font-semibold hover:scale-105 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? "Waking up server..." : (isSignup ? "Sign Up" : "Login")}
              </button>

              <p onClick={() => setIsSignup(!isSignup)} className="mt-4 text-gray-400 text-sm text-center cursor-pointer hover:text-yellow-400 transition">
                {isSignup ? "Already have account? Login" : "Don't have account? Sign Up"}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* ---------------- FEATURES ---------------- */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="min-h-screen flex flex-col items-center justify-center px-10 py-20 mt-10"
      >
        <h2 className="text-5xl font-bold mb-16 text-center bg-gradient-to-r from-gray-200 via-yellow-400 to-purple-300 bg-clip-text text-transparent">
          Powerful Expense Tracking
        </h2>
        <div className="grid md:grid-cols-3 gap-10 [perspective:1000px]">
          {[
            { title: "Easy Expense Entry", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f", shadow: "rgba(255,215,0,0.25)", text: "yellow-400" },
            { title: "Smart Expense Overview", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71", shadow: "rgba(200,200,200,0.25)", text: "gray-300" },
            { title: "Secure & Reliable", img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43", shadow: "rgba(180,140,255,0.25)", text: "purple-300" }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: "preserve-3d" }}
              className={`group bg-gradient-to-br from-black via-gray-900 to-black p-8 rounded-3xl border border-gray-700 shadow-lg transition-all duration-300 hover:shadow-[0_0_70px_${item.shadow}]`}
            >
              <img src={item.img} className="rounded-xl mb-6 transition-transform duration-500 group-hover:scale-110" alt={item.title} />
              <h3 className={`text-2xl font-semibold text-${item.text} mb-3`}>{item.title}</h3>
              <p className="text-gray-400">Quickly add and organize your daily expenses with a simple interface.</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ---------------- USERS SECTION ---------------- */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="min-h-screen flex flex-col items-center justify-center px-10"
      >
        <h2 className="text-5xl font-bold mb-16 text-gray-200">Built For Everyone</h2>
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl">
          {[
            { name: "Students", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", color: "yellow-400" },
            { name: "Professionals", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf", color: "purple-300" },
            { name: "Families", img: "https://images.unsplash.com/photo-1521791136064-7986c2920216", color: "gray-200" }
          ].map((user, index) => (
            <motion.div 
              key={index}
              whileHover={{ scale: 1.05 }}
              className="group rounded-3xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 transition"
            >
              <img src={user.img} className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110" alt={user.name}/>
              <div className="p-6">
                <h3 className={`text-xl font-bold text-${user.color}`}>{user.name}</h3>
                <p className="text-gray-300">Manage finances and track daily spending easily.</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ---------------- WHY USE SECTION ---------------- */}
      <motion.section 
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="min-h-screen flex flex-col items-center justify-center px-10"
      >
        <h2 className="text-5xl font-bold mb-16 text-center bg-gradient-to-r from-gray-200 via-yellow-400 to-purple-300 bg-clip-text text-transparent">
          Why Use Smart Expense Tracker
        </h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl">
          <motion.div whileHover={{ scale: 1.05 }} className="p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(192,192,192,0.2)]">
            <h3 className="text-2xl font-semibold mb-4 text-yellow-400">Track Expenses</h3>
            <p className="text-gray-300">Easily record daily spending like food, travel, shopping and subscriptions.</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(192,192,192,0.2)]">
            <h3 className="text-2xl font-semibold mb-4 text-purple-300">Understand Spending</h3>
            <p className="text-gray-300">Visualize where your money goes and build better financial habits.</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(192,192,192,0.2)]">
            <h3 className="text-2xl font-semibold mb-4 text-gray-200">Smart Budgeting</h3>
            <p className="text-gray-300">Set limits and manage savings with ease.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* ---------------- CTA ---------------- */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-10">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-5xl font-bold mb-6 text-yellow-400">Take Control of Your Money</motion.h2>
        <p className="text-gray-400 max-w-xl mb-10 text-lg">Smart Expense Tracker helps you build better financial habits.</p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowLoginModal(true)} // Changed to trigger pop-up
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-purple-400 text-black font-semibold shadow-[0_0_40px_rgba(255,215,0,0.35)]"
        >
          Get Started Now
        </motion.button>
      </section>
    </div>
  );
}

export default Login;