import "./index.css";
// Load shared primitives first so page modules that compose them can override.
import "./styles/shared.module.css";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
