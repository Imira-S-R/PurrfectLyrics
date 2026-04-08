import { useState } from "react";
import { Search, Music, User, SearchX, ListMusic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from '/logo_img.png'
import PlaylistModal from "../components/playlistModal";
import type { PlaylistSong, SongResult } from "../types";
import SearchResult from "../components/searchResult";

export default function SearchPage() {
  const navigate = useNavigate();
  const [track, setTrack] = useState("");
  const [artist, setArtist] = useState("");
  const [results, setResults] = useState<SongResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [playlist, setPlaylist] = useState<PlaylistSong[]>(() => {
    const stored = localStorage.getItem('playlist');
    return stored ? JSON.parse(stored) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = async () => {
    if (!track.trim() && !artist.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(
        `https://lrclib.net/api/search?q=${encodeURIComponent(
          `${track} ${artist}`
        )}`
      );
      const data = await res.json();

      const sorted = data.sort(
        (a: SongResult, b: SongResult) =>
          (b.syncedLyrics ? 1 : 0) - (a.syncedLyrics ? 1 : 0)
      );

      setResults(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div
      className="min-h-screen flex flex-col text-white font-sans"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #3b1478 0%, #1a0a38 40%, #0d0618 100%)",
      }}
    >

      {isModalOpen && (
        <PlaylistModal setIsModalOpen={setIsModalOpen} playlist={playlist} setPlaylist={setPlaylist} navigate={navigate} />
      )}


      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5 max-w-[1100px] mx-auto w-full">
        <div className="flex items-center gap-x-1">
          <img src={logo} className="w-[50px]" />
          <span
            className="font-semibold text-xl sm:text-2xl tracking-tight hover:cursor-pointer"
            onClick={() => navigate('/')}
          >
            PurrfectLyrics
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="
      flex items-center gap-2
      px-3 py-2
      rounded-lg
      bg-white/10 backdrop-blur-md
      border border-white/10
      text-white/80 text-sm
      hover:bg-white/20 hover:text-white
      transition-all
    "
        >
          <ListMusic size={20} /> Playlist
        </button>
      </nav>

      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-10 sm:py-12">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tighter text-center mb-8 sm:mb-10">
          Search Lyrics
        </h1>

        <div
          className="
          w-full max-w-2xl
          flex flex-col sm:flex-row
          gap-3
          bg-white/5 backdrop-blur-xl
          border border-white/10
          rounded-2xl
          px-4 py-4 sm:py-3
          shadow-lg shadow-black/20
        "
        >
          <div className="flex items-center gap-2 flex-1">
            <Music size={16} className="text-white/40" />
            <input
              type="text"
              placeholder="Song name"
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none text-white text-sm placeholder-white/30"
            />
          </div>

          <div className="hidden sm:block w-px h-6 bg-white/10" />

          <div className="flex items-center gap-2 flex-1">
            <User size={15} className="text-white/40" />
            <input
              type="text"
              placeholder="Artist name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none text-white text-sm placeholder-white/30"
            />
          </div>

          <button
            onClick={handleSearch}
            className="
              w-full sm:w-auto
              flex items-center justify-center gap-2
              px-4 py-2
              rounded-xl
              bg-gradient-to-br from-purple-500 to-indigo-500
              text-white text-sm font-medium
              shadow-md shadow-purple-900/30
              hover:scale-[1.02] hover:shadow-purple-700/40
              active:scale-95
              transition-all
            "
          >
            <Search size={16} />
            <span>Search</span>
          </button>
        </div>

        <div className="w-full max-w-2xl mt-6">
          {loading && (
            <p className="text-center py-12 text-white/40 text-sm animate-pulse">
              Searching…
            </p>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="flex flex-col items-center py-12 gap-3">
              <SearchX size={42} className="text-white/20" />
              <p className="text-white/40 text-sm">No results found</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="flex flex-col gap-2">
              {results.map((song, i) => (
                <SearchResult key={i} song={song} playlist={playlist} setPlaylist={setPlaylist} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
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