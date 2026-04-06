import { useState } from "react";
import { Search, Music, User, SearchX, ListMusic, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SongResult {
  trackName: string;
  artistName: string;
  duration?: number;
  syncedLyrics?: string;
}

interface PlaylistSong {
  trackName: string,
  artistName: string
}

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
        <div
          className="
      fixed inset-0 z-50
      flex items-center justify-center
      bg-black/40
      backdrop-blur-sm
    "
          onClick={() => setIsModalOpen(false)} // click outside to close
        >
          <div
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking modal
          >

            <h1 className="text-center mb-4 text-xl font-semibold">Current Playlist</h1>

            {playlist.length === 0 && <div className="flex flex-col items-center justify-center py-20 text-white/60">
              <Music size={48} className="text-purple-400 mb-4 animate-bounce" />
              <h1 className="text-center text-xl sm:text-2xl font-semibold">
                No Songs In Playlist
              </h1>
              <p className="text-center text-sm text-white/40 mt-2">
                Add some songs to see them here.
              </p>
            </div>}

            {playlist.map((song, index) => (
              <div
                key={index}
                className="
                    flex items-center justify-between
                    px-4 sm:px-5 py-3.5
                    rounded-xl
                    bg-white/5
                    border border-white/10
                    hover:bg-white/10
                    transition-colors
                    mb-4
                  "
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-[15px] truncate">
                    {song.trackName}
                  </p>
                  <p className="text-xs sm:text-[13px] text-white/50 mt-0.5">
                    {song.artistName}
                  </p>
                </div>

                <div className="flex flex-row">

                  <button
                    onClick={() => {
                      const updatedPlaylist = playlist.filter((_song) => _song.artistName !== song.artistName)
                      localStorage.setItem('playlist', JSON.stringify(updatedPlaylist))
                      setPlaylist((prev) => prev.filter((_song) => _song.artistName !== song.artistName))
                    }}
                    className="
                      ml-3
                      w-9 h-9
                      rounded-full
                      bg-white/10
                      flex items-center justify-center
                      hover:bg-white/20
                      active:scale-95
                      transition-all
                      disabled:opacity-20
                      disabled:cursor-not-allowed
                      shrink-0
                    "
                  >
                    <Minus size={15} />
                  </button>

                  <button
                    onClick={() =>
                      navigate("/lyrics", {
                        state: {
                          trackName: song.trackName,
                          artistName: song.artistName,
                          playlist: []
                        },
                      })
                    }
                    className="
                      ml-3
                      w-9 h-9
                      rounded-full
                      bg-white/10
                      flex items-center justify-center
                      hover:bg-white/20
                      active:scale-95
                      transition-all
                      disabled:opacity-20
                      disabled:cursor-not-allowed
                      shrink-0
                    "
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <div className="w-full flex justify-center">
              {playlist.length !== 0 && <button
                onClick={() => {
                  navigate("/lyrics", {
                    state: {
                      trackName: playlist[0].trackName,
                      artistName: playlist[0].artistName,
                      playlist: playlist
                    },
                  })
                }}
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
                Play All
              </button>}
            </div>

          </div>
        </div>
      )}


      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5 max-w-[1100px] mx-auto w-full">
        <span
          className="font-semibold text-xl sm:text-2xl tracking-tight hover:cursor-pointer"
          onClick={() => navigate('/')}
        >
          PurrfectLyrics
        </span>

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
                <div
                  key={i}
                  className="
                    flex items-center justify-between
                    px-4 sm:px-5 py-3.5
                    rounded-xl
                    bg-white/5
                    border border-white/10
                    hover:bg-white/10
                    transition-colors
                  "
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-[15px] truncate">
                      {song.trackName}
                    </p>
                    <p className="text-xs sm:text-[13px] text-white/50 mt-0.5">
                      {song.artistName}
                    </p>

                    {!song.syncedLyrics && (
                      <p className="text-[11px] text-purple-400/60 mt-0.5">
                        No synced lyrics
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row">
                    <button
                      onClick={() => {
                        let songAlreadyFound = false
                        for (const _song of playlist) {
                          if (_song.trackName === song.trackName && _song.artistName === song.artistName) {
                            songAlreadyFound = true
                          }
                        }

                        if (!songAlreadyFound) {
                          localStorage.setItem('playlist', JSON.stringify([...playlist, { trackName: song.trackName, artistName: song.artistName }]))
                          setPlaylist((prev) => [...prev, { trackName: song.trackName, artistName: song.artistName }])
                        }
                      }}
                      disabled={!song.syncedLyrics}
                      className="
                      ml-3
                      w-9 h-9
                      rounded-full
                      bg-white/10
                      flex items-center justify-center
                      hover:bg-white/20
                      active:scale-95
                      transition-all
                      disabled:opacity-20
                      disabled:cursor-not-allowed
                      shrink-0
                    "
                    >
                      <Plus size={15} />
                    </button>

                    <button
                      onClick={() =>
                        navigate("/lyrics", {
                          state: {
                            trackName: song.trackName,
                            artistName: song.artistName,
                            playlist: []
                          },
                        })
                      }
                      disabled={!song.syncedLyrics}
                      className="
                      ml-3
                      w-9 h-9
                      rounded-full
                      bg-white/10
                      flex items-center justify-center
                      hover:bg-white/20
                      active:scale-95
                      transition-all
                      disabled:opacity-20
                      disabled:cursor-not-allowed
                      shrink-0
                    "
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </button>
                  </div>
                </div>
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