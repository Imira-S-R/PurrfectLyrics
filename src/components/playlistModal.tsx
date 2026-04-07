import { Minus, Music } from "lucide-react"
import type { PlaylistSong } from "../types"

interface PlaylistModalProps {
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    playlist: PlaylistSong[],
    setPlaylist: React.Dispatch<React.SetStateAction<PlaylistSong[]>>,
    navigate: (path: string, options?: any) => void,
}

export default function PlaylistModal({ setIsModalOpen, playlist, setPlaylist, navigate }: PlaylistModalProps) {
    return (
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
                                    const updatedPlaylist = playlist.filter((_song) => _song.trackName !== song.trackName)
                                    localStorage.setItem('playlist', JSON.stringify(updatedPlaylist))
                                    setPlaylist((prev) => prev.filter((_song) => _song.trackName !== song.trackName))
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
    )
}