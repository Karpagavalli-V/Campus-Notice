import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { loginUser } from "../services/authService";
import { useToast } from "../context/ToastContext";
import AuthSidebar from "../components/layout/AuthSidebar";
import "../styles/AuthLayout.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await loginUser({ email, password });

            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.id);
            localStorage.setItem("role", data.role);
            localStorage.setItem("name", data.name);
            localStorage.setItem("email", email);
            localStorage.setItem("profilePic", data.profilePic || "");

            showToast(`Welcome back, ${data.name}!`, "success");

            if (data.role === "admin") navigate("/admin");
            else if (data.role === "faculty") navigate("/faculty");
            else navigate("/student");
        } catch (err) {
            showToast(err.response?.data?.message || "Invalid credentials", "error");
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
                        <h2>Welcome Back</h2>
                        <p>Sign in to your campus portal.</p>
                    </div>

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

                        <div className="form-field">
                            <label>Password</label>
                            <input
                                className="auth-input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" /> Remember me
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <footer className="auth-footer">
                        <p>
                            New here? <Link to="/signup">Create Account</Link>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default Login;
