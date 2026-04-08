import { Plus } from "lucide-react"
import type { PlaylistSong, SongResult } from "../types"

type SearchResultProps = {
    song: SongResult;
    playlist: PlaylistSong[];
    setPlaylist: React.Dispatch<React.SetStateAction<PlaylistSong[]>>;
    navigate: (path: string, options?: any) => void;
};

export default function SearchResult({
    song,
    playlist,
    setPlaylist,
    navigate,
}: SearchResultProps) {
    return (
        <div
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
    )
}