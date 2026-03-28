import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { registerUser } from "../services/authService";
import AuthSidebar from "../components/layout/AuthSidebar";
import "../styles/AuthLayout.css";

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Biotechnology",
  "Chemical Engineering",
  "Mathematics",
  "Physics",
  "Other",
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

function Signup() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        department: "",
        year: "",
        rollNumber: "",
        password: "",
        confirmPassword: "",
        role: "student",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.role === "student") {
            if (!formData.department) { setError("Please select your department."); return; }
            if (!formData.year) { setError("Please select your year."); return; }
            if (!formData.rollNumber.trim()) { setError("Please enter your roll number."); return; }
        }

        setLoading(true);

        try {
            await registerUser({
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                department: formData.department,
                year: formData.year,
                rollNumber: formData.rollNumber,
            });
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isStudent = formData.role === "student";

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
                        <h2>Create Account</h2>
                        <p>Join our campus community today.</p>
                    </div>

                    {error && <div className="status-alert error" style={{ marginBottom: '1rem' }}>{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>

                        {/* Role selector */}
                        <div className="form-field">
                            <label>I am a</label>
                            <select
                                className="auth-input"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                            </select>
                        </div>

                        <div className="form-field">
                            <label>Full Name</label>
                            <input
                                className="auth-input"
                                type="text"
                                name="fullName"
                                placeholder="e.g. Karpagavalli V"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label>Email Address</label>
                            <input
                                className="auth-input"
                                type="email"
                                name="email"
                                placeholder="e.g. name@university.edu"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Student-only fields */}
                        {isStudent && (
                            <>
                                <div className="form-field">
                                    <label>Department</label>
                                    <select
                                        className="auth-input"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {DEPARTMENTS.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="signup-row">
                                    <div className="form-field">
                                        <label>Year</label>
                                        <select
                                            className="auth-input"
                                            name="year"
                                            value={formData.year}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Year</option>
                                            {YEARS.map((y) => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>Roll Number</label>
                                        <input
                                            className="auth-input"
                                            type="text"
                                            name="rollNumber"
                                            placeholder="e.g. 22CS001"
                                            value={formData.rollNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-field">
                            <label>Password</label>
                            <input
                                className="auth-input"
                                type="password"
                                name="password"
                                placeholder="Min. 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                minLength={6}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label>Confirm Password</label>
                            <input
                                className="auth-input"
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                    </form>

                    <footer className="auth-footer">
                        <p>
                            Already have an account? <Link to="/login">Sign In</Link>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default Signup;
