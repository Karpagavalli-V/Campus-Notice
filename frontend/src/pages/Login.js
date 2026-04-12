import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser } from "../services/authService";
import { useToast } from "../context/ToastContext";
import AuthSidebar from "../components/layout/AuthSidebar";
import confetti from "canvas-confetti";
import "../styles/AuthLayout.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const playSound = (type) => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            if (type === 'click') {
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); 
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.1);
            } else if (type === 'success') {
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
                oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
                oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.45); // C6
                gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.0);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 1.0);
            }
        } catch(e) {
            console.log("Audio not supported");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        playSound('click'); // Play click sound
        setLoading(true);
        setError(false);
        try {
            const data = await loginUser({ email, password });

            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.id);
            localStorage.setItem("role", data.role);
            localStorage.setItem("name", data.name);
            localStorage.setItem("email", email);
            localStorage.setItem("profilePic", data.profilePic || "");

            playSound('success'); // Play gamified success chime!
            
            // Trigger an awesome gamified confetti explosion
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#4f46e5', '#ec4899', '#10b981', '#f59e0b']
            });

            showToast(`Welcome back, ${data.name}!`, "success");

            // Add a tiny delay for the sound to play before routing
            setTimeout(() => {
                if (data.role === "admin") navigate("/admin");
                else if (data.role === "faculty") navigate("/faculty");
                else navigate("/student");
            }, 600);
            
        } catch (err) {
            setError(true);
            showToast(err.response?.data?.message || "Invalid credentials", "error");
        } finally {
            setLoading(false);
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { 
                duration: 0.5, 
                ease: "easeOut",
                staggerChildren: 0.1
            } 
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="auth-container">
            <AuthSidebar />

            <div className="auth-main">
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="auth-card"
                    style={error ? { border: '1px solid #ef4444' } : {}}
                >
                    <motion.header variants={itemVariants} className="auth-logo-wrapper">
                        <motion.span 
                            className="auth-brand-icon"
                            animate={{ rotate: loading ? 360 : 0 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <GraduationCap size={40} />
                        </motion.span>
                        <h2 className="brand-name">CampusHub</h2>
                    </motion.header>

                    <motion.div variants={itemVariants} className="auth-welcome">
                        <h2>Welcome Back</h2>
                        <p>Sign in to your campus portal.</p>
                    </motion.div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <motion.div variants={itemVariants} className="form-field">
                            <label>Email Address</label>
                            <input
                                className="auth-input"
                                type="email"
                                placeholder="name@university.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="form-field">
                            <label>Password</label>
                            <input
                                className="auth-input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" /> Remember me
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot Password?
                            </Link>
                        </motion.div>

                        <motion.button 
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            className="auth-btn" 
                            disabled={loading}
                        >
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.span
                                        key="loading"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        Signing In...
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="normal"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        Sign In
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </form>

                    <motion.footer variants={itemVariants} className="auth-footer">
                        <p>
                            New here? <Link to="/signup">Create Account</Link>
                        </p>
                    </motion.footer>
                </motion.div>
            </div>
        </div>
    );
}

export default Login;
