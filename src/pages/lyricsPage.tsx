import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { ArrowLeft } from "lucide-react";
import useLyrics from "../hooks/useLyrics";
import type { PlaylistSong } from "../types";
import { useActiveIndex } from "../hooks/useActiveIndex";
import Lyrics from "../components/lyrics";
import PlayerControls from "../components/playerControls";
import { findCurrentIndex } from "../utils";
import { useVideoSearch } from "../hooks/useVideoSearch";

export default function LyricsPage() {
    const [playerReady, setPlayerReady] = useState(false);
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
    const [currentIndex, setCurrentIndex] = useState(0)
    const { videoId, loadingVideo } = useVideoSearch(songInfo)

    useEffect(() => {
        setCurrentIndex(findCurrentIndex(location.state.trackName, playlist))

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
                    <Lyrics lines={lines} activeIndex={activeIndex} lineRefs={lineRefs} playerRef={playerRef} setCurrentTime={setCurrentTime} />
                )}
            </div>

            <PlayerControls
                playlist={playlist}
                currentIndex={currentIndex}
                navigate={navigate}
                togglePlayback={togglePlayback}
                loadingVideo={loadingVideo}
                isPlaying={isPlaying}
                songInfo={songInfo}
            />

        </div>
    );
}