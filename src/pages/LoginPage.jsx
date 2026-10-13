import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Logo from "../components/Logo";
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

  function switchMode(login) {
    setIsLogin(login);
    setError(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <Logo size={112} ringWidth={0.5} />
        <h1 className={styles.title}>Put on a soundscape. Breathe deeper. Stay awhile.</h1>
        <p className={styles.lede}>
          An account keeps your saved Freesound recordings with you across sessions.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.seg} role="tablist" aria-label="Account">
          <button
            type="button"
            role="tab"
            aria-selected={isLogin}
            className={isLogin ? styles.segOn : styles.segOpt}
            onClick={() => switchMode(true)}
          >
            Log in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isLogin}
            className={isLogin ? styles.segOpt : styles.segOn}
            onClick={() => switchMode(false)}
          >
            Sign up
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            Username
            <input
              className={styles.input}
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            Password
            <input
              className={styles.input}
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <button className={styles.submit} type="submit">
            {isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <p className={styles.note}>
          {isLogin
            ? "New here? Switch to Sign up — it takes a username and a password."
            : "Usernames are unique. You can start saving sounds right away."}
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
