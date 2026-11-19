import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Mail, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/apiService";
import AuthSidebar from "../components/layout/AuthSidebar";
import "../styles/AuthLayout.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [devResetLink, setDevResetLink] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setDevResetLink("");
        setLoading(true);
        try {
            const res = await api.post("/auth/forgot-password", { email });
            setMessage(res.data.message);
            if (res.data.devResetLink) {
                setDevResetLink(res.data.devResetLink);
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            if (err.response?.data?.devResetLink) {
                setDevResetLink(err.response.data.devResetLink);
            }
            const serverMsg = err.response?.data?.message || (typeof err.response?.data === "string" ? err.response.data : null);
            if (serverMsg) {
                setError(serverMsg);
            } else if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
                setError("Cannot connect to the backend server. Please verify your backend is running on port 5000.");
            } else {
                setError(err.message || "An error occurred. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { 
                type: "spring", 
                stiffness: 100, 
                damping: 20,
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    const alertVariants = {
        hidden: { opacity: 0, scale: 0.95, y: -10 },
        visible: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: -10 }
    };

    return (
        <div className="auth-container">
            <AuthSidebar />
            <div className="auth-main">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="auth-card"
                >
                    <motion.header variants={itemVariants} className="auth-logo-wrapper">
                        <motion.span 
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            className="auth-brand-icon"
                        >
                            <GraduationCap size={40} />
                        </motion.span>
                        <h2 className="brand-name">CampusHub</h2>
                    </motion.header>

                    <motion.div variants={itemVariants} className="auth-welcome">
                        <h2>Reset Password</h2>
                        <p>Enter your email to receive a reset link.</p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                key="error"
                                variants={alertVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="status-alert error" 
                                style={{ marginBottom: '1.5rem' }}
                            >
                                <p>{error}</p>
                                {devResetLink && (
                                    <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                        <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '0.3rem' }}>
                                            🛠️ Dev fallback:
                                        </p>
                                        <Link 
                                            to={devResetLink.replace(/^https?:\/\/[^/]+/, '')}
                                            style={{ color: '#fff', textDecoration: 'underline', fontWeight: 600, fontSize: '0.85rem' }}
                                        >
                                            Reset Password directly here →
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        )}
                        {message && (
                            <motion.div 
                                key="success"
                                variants={alertVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="status-alert success" 
                                style={{ marginBottom: '1.5rem' }}
                            >
                                <p>{message}</p>
                                {devResetLink && (
                                    <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                        <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '0.3rem' }}>
                                            🛠️ Development Reset Link:
                                        </p>
                                        <Link 
                                            to={devResetLink.replace(/^https?:\/\/[^/]+/, '')}
                                            style={{ color: '#fff', textDecoration: 'underline', fontWeight: 600, fontSize: '0.85rem' }}
                                        >
                                            Reset Password directly here →
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.form variants={itemVariants} className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label>Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={18} className="field-icon" style={{ opacity: 0.6 }} />
                                <input
                                    className="auth-input"
                                    type="email"
                                    placeholder="name@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            className="auth-btn" 
                            disabled={loading}
                        >
                            {loading ? (
                                <motion.span 
                                    animate={{ opacity: [1, 0.5, 1] }} 
                                    transition={{ repeat: Infinity, duration: 1 }}
                                >
                                    Sending Link...
                                </motion.span>
                            ) : "Send Reset Link"}
                        </motion.button>
                    </motion.form>

                    <motion.footer variants={itemVariants} className="auth-footer">
                        <Link to="/login" className="back-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: '600' }}>
                           <ArrowLeft size={16} /> Back to Sign In
                        </Link>
                    </motion.footer>
                </motion.div>
            </div>
        </div>
    );
}

export default ForgotPassword;
