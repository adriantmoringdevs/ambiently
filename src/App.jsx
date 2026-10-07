import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import About from "./pages/About"
import SoundEnviroment from './pages/SoundEnviroment'
import SoundSearch from "./pages/SoundSearch"
import LoginPage from "./pages/LoginPage"
import { AudioProvider } from "./context/AudioContext"
import { UserProvider } from "./context/UserContext"

function App() {

  return (
    <UserProvider>
    <AudioProvider>
    <BrowserRouter basename="/">
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sound/:id" element={<SoundEnviroment />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<SoundSearch />} />
    </Routes>
    </BrowserRouter>
    </AudioProvider>
    </UserProvider>
  );
}

export default App
