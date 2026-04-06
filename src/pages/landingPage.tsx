import { useNavigate } from "react-router-dom";
import logo from '/logo_img.png'

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col text-white font-sans"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #3b1478 0%, #1a0a38 40%, #0d0618 100%)",
      }}
    >
      <nav className="flex items-center justify-center px-4 sm:px-8 py-4 border-b border-white/5">
      <img src={logo} className="w-[50px]" />
        <span className="font-semibold text-xl sm:text-2xl tracking-tight">
          PurrfectLyrics
        </span>
      </nav>

      <main className="flex-1 flex flex-col justify-center items-center text-center px-6">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tighter mb-6">
          Find Lyrics Instantly
        </h1>

        <p className="text-white/50 text-sm sm:text-base max-w-md sm:max-w-lg mb-8 leading-relaxed">
          Search your favorite songs and explore beautifully synced lyrics in
          seconds. Fast, minimal, and made for music lovers.
        </p>

        <button
          onClick={() => navigate("/search")}
          className="
            flex items-center justify-center gap-2
            px-6 py-3
            rounded-xl
            bg-gradient-to-br from-purple-500 to-indigo-500
            text-white text-sm font-medium
            shadow-md shadow-purple-900/30
            hover:scale-[1.03] hover:shadow-purple-700/40
            active:scale-95
            transition-all
          "
        >
          Get Started
        </button>
      </main>

      <footer className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-8 py-5 border-t border-white/5 text-center">
        <div>
          <p className="text-sm font-semibold text-purple-400/90">
            PurrfectLyrics
          </p>
          <p className="text-xs text-white/30 mt-0.5">
            © 2026 PurrfectLyrics
          </p>
        </div>
      </footer>
    </div>
  );
}