import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import styles from "../styles/LoginPage.module.css";

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { login, signup } = useUser();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const authFunction = isLogin ? login : signup;

    authFunction(username, password)
      .then(() => navigate("/"))
      .catch(() =>
        setError(
          isLogin ? "Invalid username or password." : "Username already taken.",
        ),
      );
  }

  return (
    <>
      <div className={styles.main}>
        <div className={styles.glow}></div>
        <div className={styles.container}>
          <h1 className={styles.title}>Ambient</h1>

          <div className={styles.toggleContainer}>
            <button
              className={isLogin ? styles.activeToggle : styles.inactiveToggle}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={isLogin ? styles.inactiveToggle : styles.activeToggle}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.submitButton} type="submit">
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
