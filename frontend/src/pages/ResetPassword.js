import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, CheckCircle2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/apiService";
import AuthSidebar from "../components/layout/AuthSidebar";
import "../styles/AuthLayout.css";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post(`/auth/reset-password/${token}`, { password });
            setMessage(res.data.message);
            setDone(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Reset failed. The link may have expired.");
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, x: -20 },
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
                            whileHover={{ rotate: -10, scale: 1.1 }}
                            className="auth-brand-icon"
                        >
                            <GraduationCap size={40} />
                        </motion.span>
                        <h2 className="brand-name">CampusHub</h2>
                    </motion.header>

                    <motion.div variants={itemVariants} className="auth-welcome">
                        <AnimatePresence mode="wait">
                            {done ? (
                                <motion.div 
                                    key="done-title"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                                        Password Reset! <CheckCircle2 color="#22c55e" />
                                    </h2>
                                    <p>Your password has been updated. Redirecting to login...</p>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="form-title"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <h2>Set New Password</h2>
                                    <p>Enter your new password below.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="status-alert error" 
                                style={{ marginBottom: "1.5rem" }}
                            >
                                {error}
                            </motion.div>
                        )}
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="status-alert success" 
                                style={{ marginBottom: "1.5rem" }}
                            >
                                {message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!done && (
                        <motion.form variants={itemVariants} className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-field">
                                <label>New Password</label>
                                <div className="auth-input-wrapper">
                                    <Lock size={16} className="field-icon-left" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                    <input
                                        className="auth-input"
                                        type={showPass ? "text" : "password"}
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        minLength={6}
                                        required
                                        style={{ paddingLeft: '36px' }}
                                    />
                                    <button
                                        type="button"
                                        className="auth-eye-btn"
                                        onClick={() => setShowPass((p) => !p)}
                                        tabIndex={-1}
                                    >
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-field">
                                <label>Confirm New Password</label>
                                <div className="auth-input-wrapper">
                                    <Lock size={16} className="field-icon-left" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                    <input
                                        className="auth-input"
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        style={{ paddingLeft: '36px' }}
                                    />
                                    <button
                                        type="button"
                                        className="auth-eye-btn"
                                        onClick={() => setShowConfirm((p) => !p)}
                                        tabIndex={-1}
                                    >
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Password strength indicator */}
                            <AnimatePresence>
                                {password.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="password-strength"
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div className="strength-bar-container" style={{ background: 'var(--border-color)', height: '4px', borderRadius: '2px', marginTop: '0.5rem', position: 'relative' }}>
                                            <motion.div
                                                className="password-strength__bar"
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width:
                                                        password.length < 6 ? "25%" :
                                                        password.length < 10 ? "60%" :
                                                        "100%",
                                                    background:
                                                        password.length < 6 ? "#ef4444" :
                                                        password.length < 10 ? "#f97316" :
                                                        "#22c55e",
                                                }}
                                                style={{ height: '100%', borderRadius: 'inherit' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                                            <span style={{
                                                fontSize: "11px",
                                                fontWeight: '600',
                                                color:
                                                    password.length < 6 ? "#ef4444" :
                                                    password.length < 10 ? "#f97316" :
                                                    "#22c55e",
                                            }}>
                                                Strength: {password.length < 6 ? "Weak" : password.length < 10 ? "Medium" : "Strong"}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" 
                                className="auth-btn" 
                                disabled={loading}
                                style={{ marginTop: '1.5rem' }}
                            >
                                {loading ? "Resetting..." : "Update Password"}
                            </motion.button>
                        </motion.form>
                    )}

                    <motion.footer variants={itemVariants} className="auth-footer">
                        <Link to="/login" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>← Back to Sign In</Link>
                    </motion.footer>
                </motion.div>
            </div>
        </div>
    );
}

export default ResetPassword;
