import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import api from "../services/apiService";
import AuthSidebar from "../components/layout/AuthSidebar";
import "../styles/AuthLayout.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            const res = await api.post("/auth/forgot-password", { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred. Please try again later.");
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
                        <h2>Reset Password</h2>
                        <p>Enter your email to receive a reset link.</p>
                    </div>



                    {error && <div className="status-alert error" style={{ marginBottom: '1rem' }}>{error}</div>}
                    {message && <div className="status-alert success" style={{ marginBottom: '1rem' }}>{message}</div>}


                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label>Email Address</label>
                            <input
                                className="auth-input"
                                type="email"
                                placeholder="name@university.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>


                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? "Sending...." : "Send Reset Link"}
                        </button>
                    </form>


                    <footer className="auth-footer">
                        <p>
                            Remember your password? <Link to="/login">Sign In</Link>
                        </p>
                    </footer>


                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;

