import { Link, NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Logo from "./Logo";
import styles from "../styles/NavBar.module.css";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/search", label: "Search" },
  { to: "/about", label: "About" },
];

function NavBar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout().then(() => navigate("/"));
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <Logo size={30} />
          <span className={styles.wordmark}>Ambient</span>
        </Link>

        <nav className={styles.links}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {user ? (
          <div className={styles.account}>
            <span className={styles.user}>
              <span className={styles.avatar} aria-hidden="true">
                {user.username?.[0]?.toUpperCase()}
              </span>
              <span className={styles.username}>{user.username}</span>
            </span>
            <button className={styles.logout} onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : (
          <button className={styles.signIn} onClick={() => navigate("/login")}>
            Sign in
          </button>
        )}
      </div>
      <div className={styles.rule} />
    </header>
  );
}

export default NavBar;
