import { BrowserRouter, Routes, Route } from "react-router-dom"
import SearchPage from "./pages/searchPage"
import LyricsPage from "./pages/lyricsPage"
import LandingPage from "./pages/landingPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/lyrics" element={<LyricsPage />} />
      </Routes>
    </BrowserRouter>
  )
}