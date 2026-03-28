import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Unauthorized Access</h2>
      <p>Your session has expired or you do not have permission.</p>

      <button onClick={() => navigate("/login")}>
        Go to Login
      </button>
    </div>
  );
}

export default Unauthorized;
