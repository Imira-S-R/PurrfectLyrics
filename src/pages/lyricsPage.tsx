import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { ArrowLeft } from "lucide-react";

interface LyricLine {
    time: number;
    text: string;
}

interface SongInfo {
    trackName: string;
    artistName: string;
    duration?: number;
}

interface PlaylistSong {
    trackName: string,
    artistName: string
}

function parseLRC(raw: string): LyricLine[] {
    const regex = /\[(\d{2}):(\d{2}\.\d+)\](.*)/;
    return raw
        .split("\n")
        .map((line) => {
            const m = line.match(regex);
            if (!m) return null;
            const time = parseInt(m[1]) * 60 + parseFloat(m[2]);
            return { time, text: m[3].trim() };
        })
        .filter((l): l is LyricLine => l !== null && l.text.length > 0);
}

function useLyrics(track: string, artist: string) {
    const [lines, setLines] = useState<LyricLine[]>([]);
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [songInfo, setSongInfo] = useState<SongInfo>({ trackName: "", artistName: "" });

    useEffect(() => {
        setStatus("loading");
        const url = `https://lrclib.net/api/search?q=${encodeURIComponent(`${track} ${artist}`)}`;
        fetch(url)
            .then((r) => r.json())
            .then((data) => {
                const match = data?.find((item: any) => item.syncedLyrics) ?? data?.[0];
                if (match?.syncedLyrics) {
                    setSongInfo({
                        trackName: match.trackName,
                        artistName: match.artistName,
                        duration: match.duration,
                    });
                    setLines(parseLRC(match.syncedLyrics));
                    setStatus("done");
                } else {
                    setStatus("error");
                }
            })
            .catch(() => setStatus("error"));
    }, [track, artist]);

    return { lines, status, songInfo };
}

function useActiveIndex(lines: LyricLine[], currentTime: number): number {
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (currentTime >= lines[i].time) idx = i;
        else break;
    }
    return idx;
}

export default function LyricsPage() {
    const [videoId, setVideoId] = useState<string>("");
    const [playerReady, setPlayerReady] = useState(false);
    const [loadingVideo, setLoadingVideo] = useState(false);
    const location = useLocation()
    const playerRef = useRef<any>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [showBack, setShowBack] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const navigate = useNavigate()
    const { lines, status, songInfo } = useLyrics(location.state.trackName, location.state.artistName);
    const playlist: PlaylistSong[] = location.state.playlist;
    const activeIndex = useActiveIndex(lines, currentTime);
    const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
    const [currentIndex, setCurrentIndex] = useState(0)



    useEffect(() => {
        playlist.map((song, index) => {
            if (song.trackName === location.state.trackName) {
                setCurrentIndex(index)
            }
        })
        lineRefs.current[0]?.scrollIntoView({
            block: "center",
        });
        setCurrentTime(0);
    }, [songInfo.trackName, songInfo.artistName]);

    useEffect(() => {
        setPlayerReady(false);
        playerRef.current = null;
    }, [videoId]);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        const handleActivity = () => {
            setShowBack(true);

            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setShowBack(false);
            }, 2500);
        };

        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("touchstart", handleActivity);
        window.addEventListener("keydown", handleActivity);
        window.addEventListener("focus", handleActivity);

        handleActivity();

        return () => {
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("touchstart", handleActivity);
            window.removeEventListener("keydown", handleActivity);
            window.removeEventListener("focus", handleActivity);
            clearTimeout(timeout);
        };
    }, []);

    useEffect(() => {
        if (!songInfo.trackName || !songInfo.artistName || songInfo.duration == null) return;

        playlist.map((song, index) => {
            if (song.trackName === songInfo.trackName) {
                setCurrentIndex(index)
                console.log('current index', currentIndex)
            }
        })

        const fetchVideo = async () => {
            setLoadingVideo(true);
            try {
                const query = `${songInfo.trackName} ${songInfo.artistName} official audio`;

                console.log("Searching for:", query);
                console.log("Expected duration (seconds):", songInfo.duration);

                const res = await fetch(`${BASE_URL}/api/search`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query }),
                });

                const data = await res.json();
                const items = data.results ?? [];
                console.log("Results:", items);

                const songDuration = songInfo.duration!;
                let bestVid = "";
                let bestDiff = Infinity;

                for (const item of items) {
                    const parts = item.duration.split(":").map(Number);

                    if (!item.id || !parts.length || parts.some(isNaN)) {
                        console.warn("Skipping item:", item);
                        continue;
                    }

                    const totalSeconds =
                        parts.length === 3
                            ? parts[0] * 3600 + parts[1] * 60 + parts[2]
                            : parts[0] * 60 + parts[1];

                    const diff = Math.abs(totalSeconds - songDuration);

                    console.log(
                        `"${item.title}" | duration: ${item.duration} (${totalSeconds}s) | expected: ${songDuration}s | diff: ${diff}s`
                    );

                    if (diff < bestDiff && diff <= 5) {
                        bestDiff = diff;
                        bestVid = item.id;
                        console.log(`New best match: ${item.id} with diff ${diff}s`);
                    }
                }

                if (bestVid) {
                    console.log("Selected videoId:", bestVid, "with diff:", bestDiff);
                    setVideoId(bestVid);
                } else {
                    console.warn("No video found within ±5s of duration:", songDuration);
                }
            } catch (err) {
                console.error("Local search fetch failed", err);
            } finally {
                setTimeout(() => setLoadingVideo(false), 3000);
            }
        };

        fetchVideo();
    }, [songInfo]);


    const startPolling = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (playerRef.current) {
                const t = playerRef.current.getCurrentTime?.();
                if (typeof t === "number") setCurrentTime(t);
            }
        }, 250);
    }, []);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, []);

    const togglePlayback = async () => {
        if (!playerRef.current || !playerReady) return;

        const playerState = playerRef.current.getPlayerState?.();

        if (playerState === undefined || playerState === -1) {
            const interval = setInterval(() => {
                const state = playerRef.current.getPlayerState?.();
                if (state !== undefined && state !== -1) {
                    clearInterval(interval);
                    playerRef.current.playVideo();
                    setIsPlaying(true);
                    startPolling();
                }
            }, 100);
            return;
        }

        if (isPlaying) {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
            stopPolling();
        } else {
            playerRef.current.playVideo();
            setIsPlaying(true);
            startPolling();
        }
    };

    useEffect(() => () => stopPolling(), [stopPolling]);

    useEffect(() => {
        if (activeIndex >= 0) {
            lineRefs.current[activeIndex]?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [activeIndex]);

    const onReady = (e: YouTubeEvent) => {
        playerRef.current = e.target;
        setPlayerReady(true);
    };

    const onPlay = () => {
        setIsPlaying(true);
        startPolling();
    };

    const onPause = () => {
        setIsPlaying(false);
        stopPolling();
    };

    const onEnd = () => {
        setIsPlaying(false);
        stopPolling();
        if (currentIndex + 1 < playlist.length) {
            navigate("/lyrics", {
                state: {
                    trackName: playlist[currentIndex + 1].trackName,
                    artistName: playlist[currentIndex + 1].artistName,
                    playlist,
                },
            });
        }
    };

    const opts = {
        height: "0",
        width: "0",
        playerVars: { autoplay: 1 },
    };

    return (
        <div
            className={`
    min-h-screen w-full flex flex-col justify-center items-center px-4 py-6 sm:py-10
    text-white relative overflow-hidden
    ${isPlaying ? "animation-fast" : "animation-slow"}
  `}
        >

            <button
                onClick={() => navigate('/search')}
                className={`
    absolute top-4 left-4 z-50
    flex items-center gap-2
    px-3 py-2
    rounded-lg
    bg-white/10 backdrop-blur-md
    border border-white/10
    text-white/80 text-sm
    hover:bg-white/20 hover:text-white
    transition-all duration-300

    ${showBack ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}
  `}
            >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
            </button>


            <style>{`
    @keyframes gradient {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes orb1 {
      0%, 100% { transform: translate(0%, 0%) scale(1); opacity: 0.5; }
      50%       { transform: translate(8%, -10%) scale(1.15); opacity: 0.7; }
    }
    @keyframes orb2 {
      0%, 100% { transform: translate(0%, 0%) scale(1); opacity: 0.4; }
      50%       { transform: translate(-10%, 8%) scale(1.2); opacity: 0.6; }
    }
    @keyframes orb3 {
      0%, 100% { transform: translate(0%, 0%) scale(1); opacity: 0.3; }
      50%       { transform: translate(6%, 6%) scale(1.1); opacity: 0.5; }
    }

    .animate-gradient { animation: gradient 20s ease infinite; }
    .animation-fast .animate-gradient,
    .animation-fast { --orb-speed: 6s; }
    .animation-slow  { --orb-speed: 18s; }

    .orb1 { animation: orb1 var(--orb-speed, 12s) ease-in-out infinite; }
    .orb2 { animation: orb2 calc(var(--orb-speed, 12s) * 1.3) ease-in-out infinite; }
    .orb3 { animation: orb3 calc(var(--orb-speed, 12s) * 0.8) ease-in-out infinite; }

    .animation-fast .orb1 { animation-duration: 6s; }
    .animation-fast .orb2 { animation-duration: 8s; }
    .animation-fast .orb3 { animation-duration: 5s; }
    .animation-slow  .orb1 { animation-duration: 18s; }
    .animation-slow  .orb2 { animation-duration: 24s; }
    .animation-slow  .orb3 { animation-duration: 14s; }
  `}</style>

            <div
                className="animate-gradient absolute inset-0 -z-10"
                style={{
                    background: "linear-gradient(-45deg, #080d1a, #0d1540, #120824, #080d1a)",
                    backgroundSize: "400% 400%",
                }}
            />

            <div className="orb1 absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full -z-10"
                style={{ background: "radial-gradient(circle, rgba(99,60,220,0.55) 0%, transparent 70%)", filter: "blur(40px)" }} />
            <div className="orb2 absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full -z-10"
                style={{ background: "radial-gradient(circle, rgba(190,24,93,0.4) 0%, transparent 70%)", filter: "blur(50px)" }} />
            <div className="orb3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full -z-10"
                style={{ background: "radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)", filter: "blur(60px)" }} />

            <div className="absolute inset-0 -z-10 opacity-[0.03]"
                style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "repeat", backgroundSize: "128px"
                }} />

            <div className="w-full max-w-2xl md:max-w-4xl flex flex-col items-center">
                {videoId && (
                    <YouTube
                        key={videoId}
                        videoId={videoId}
                        opts={opts}
                        onReady={onReady}
                        onPlay={onPlay}
                        onPause={onPause}
                        onEnd={onEnd}
                    />
                )}

                {status === "loading" && (
                    <p className="text-zinc-300 text-sm animate-pulse">Loading lyrics…</p>
                )}

                {status === "error" && (
                    <p className="text-red-400 text-sm">Could not load lyrics.</p>
                )}

                {status === "done" && (
                    <div
                        className="
              w-full
              h-[60vh] sm:h-[65vh] md:h-[70vh]
              overflow-y-auto
              flex flex-col items-center
              space-y-1
              pt-8
              pb-[25vh]
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
              [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]
              [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]
            "
                    >
                        {lines.map((line, i) => {
                            const isActive = i === activeIndex;
                            const isPast = i < activeIndex;
                            return (
                                <div
                                    key={i}
                                    ref={(el) => { lineRefs.current[i] = el; }}
                                    onClick={() => {
                                        playerRef.current?.seekTo(line.time, true);
                                        setCurrentTime(line.time);
                                    }}
                                    className={`
                    w-full text-left px-4 py-2 rounded-lg cursor-pointer
                    transition-all duration-200
                    ${isActive
                                            ? "text-white font-semibold text-2xl sm:text-3xl md:text-3xl"
                                            : isPast
                                                ? "text-white/40 text-xl"
                                                : "text-white/60 text-xl"
                                        }
                  `}
                                >
                                    {line.text}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center gap-6 mt-10 w-full max-w-md flex-wrap sm:flex-nowrap">

                <button
                    disabled={playlist.length === 0 || currentIndex === 0}
                    onClick={() => {
                        if (currentIndex !== 0) {
                            console.log('prev index', (currentIndex - 1))
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
                        console.log('next index', (currentIndex + 1))
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

                {/* Song Info */}
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
        </div>
    );
}