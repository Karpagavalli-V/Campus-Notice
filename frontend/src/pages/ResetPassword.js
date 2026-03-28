import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
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

    return (
        <div className="auth-container">
            <AuthSidebar />

            <div className="auth-main">
                <div className="auth-card">
                    <header className="auth-logo-wrapper">
                        <span className="auth-brand-icon">
                            <GraduationCap size={40} />
                        </span>
                        <h2 className="brand-name">CampusHub</h2>
                    </header>

                    <div className="auth-welcome">
                        <h2>{done ? "Password Reset! 🎉" : "Set New Password"}</h2>
                        <p>
                            {done
                                ? "Your password has been updated. Redirecting to login..."
                                : "Enter your new password below."}
                        </p>
                    </div>

                    {error && (
                        <div className="status-alert error" style={{ marginBottom: "1rem" }}>
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="status-alert success" style={{ marginBottom: "1rem" }}>
                            {message}
                        </div>
                    )}

                    {!done && (
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-field">
                                <label>New Password</label>
                                <div className="auth-input-wrapper">
                                    <input
                                        className="auth-input"
                                        type={showPass ? "text" : "password"}
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        minLength={6}
                                        required
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
                                    <input
                                        className="auth-input"
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
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
                            {password.length > 0 && (
                                <div className="password-strength">
                                    <div
                                        className="password-strength__bar"
                                        style={{
                                            width:
                                                password.length < 6 ? "25%" :
                                                password.length < 10 ? "60%" :
                                                "100%",
                                            background:
                                                password.length < 6 ? "#ef4444" :
                                                password.length < 10 ? "#f97316" :
                                                "#22c55e",
                                        }}
                                    />
                                    <span style={{
                                        fontSize: "11px",
                                        color:
                                            password.length < 6 ? "#ef4444" :
                                            password.length < 10 ? "#f97316" :
                                            "#22c55e",
                                    }}>
                                        {password.length < 6 ? "Weak" : password.length < 10 ? "Medium" : "Strong"}
                                    </span>
                                </div>
                            )}

                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    )}

                    <footer className="auth-footer">
                        <p>
                            <Link to="/login">← Back to Sign In</Link>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
