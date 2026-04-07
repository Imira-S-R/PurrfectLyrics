import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import type { PlaylistSong } from "../types";

interface PlayerControlsProps {
    playlist: PlaylistSong[];
    currentIndex: number;
    navigate: (path: string, options?: any) => void;
    togglePlayback: () => void;
    loadingVideo: boolean;
    isPlaying: boolean;
    songInfo: {
        trackName: string;
        artistName: string;
    };
}

export default function PlayerControls({ playlist, currentIndex, togglePlayback, loadingVideo, isPlaying, songInfo, navigate }: PlayerControlsProps) {
    return (
        <div className="flex items-center justify-center gap-6 mt-10 w-full max-w-md flex-wrap sm:flex-nowrap">

            <button
                disabled={playlist.length === 0 || currentIndex === 0}
                onClick={() => {
                    if (currentIndex !== 0) {
                        if (isPlaying) {
                            togglePlayback()
                        }
                        navigate("/lyrics", {
                            state: {
                                trackName: playlist[currentIndex - 1].trackName,
                                artistName: playlist[currentIndex - 1].artistName,
                                playlist: playlist
                            },
                        })
                    }
                }}
                className="
  w-10 h-10 sm:w-12 sm:h-12
  flex items-center justify-center
  rounded-full
  bg-white/10 text-white
  hover:bg-white/20
  active:scale-95
  transition-all

  disabled:opacity-30
  disabled:cursor-not-allowed
  disabled:hover:bg-white/10
"
            >
                <SkipBack size={20} />
            </button>

            <button
                onClick={togglePlayback}
                className="
      w-14 h-14 sm:w-16 sm:h-16
      flex items-center justify-center
      rounded-full
      bg-white text-black
      shadow-xl
      hover:scale-105 active:scale-95
      transition-all
    "
            >
                {loadingVideo ? (
                    <svg
                        className="animate-spin h-6 w-6 text-black"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                        />
                    </svg>
                ) : isPlaying ? (
                    <Pause size={28} />
                ) : (
                    <Play size={28} />
                )}
            </button>

            <button
                disabled={playlist.length === 0 || (currentIndex + 1) === playlist.length}
                onClick={() => {
                    if (isPlaying) {
                        togglePlayback()
                    }
                    navigate("/lyrics", {
                        state: {
                            trackName: playlist[currentIndex + 1].trackName,
                            artistName: playlist[currentIndex + 1].artistName,
                            playlist: playlist
                        },
                    })
                }}
                className="
  w-10 h-10 sm:w-12 sm:h-12
  flex items-center justify-center
  rounded-full
  bg-white/10 text-white
  hover:bg-white/20
  active:scale-95
  transition-all

  disabled:opacity-30
  disabled:cursor-not-allowed
  disabled:hover:bg-white/10
"
            >
                <SkipForward size={20} />
            </button>

            <div className="flex flex-col ml-2 min-w-0">
                <p className="text-sm sm:text-base font-semibold truncate max-w-[160px] sm:max-w-[220px]">
                    {songInfo.trackName.length > 50
                        ? songInfo.trackName.slice(0, 40) + "..."
                        : songInfo.trackName}
                </p>
                <p className="text-xs text-white/70 truncate">
                    {songInfo.artistName}
                </p>
            </div>
        </div>
    )
}