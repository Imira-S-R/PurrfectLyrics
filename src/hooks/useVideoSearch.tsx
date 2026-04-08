import { useEffect, useState } from "react";
import type { SongInfo } from "../types";

export function useVideoSearch(songInfo: SongInfo) {
    const [videoId, setVideoId] = useState("");
    const [loadingVideo, setLoadingVideo] = useState(false);

    const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

    useEffect(() => {
        if (!songInfo.trackName || !songInfo.artistName || songInfo.duration == null) return;

        const fetchVideo = async () => {
            setLoadingVideo(true);
            try {
                const query = `${songInfo.trackName} ${songInfo.artistName} official audio`;

                const res = await fetch(`${BASE_URL}/api/search`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query }),
                });

                const data = await res.json();
                const items = data.results ?? [];

                const songDuration = songInfo.duration!;
                let bestVid = "";
                let bestDiff = Infinity;

                for (const item of items) {
                    const parts = item.duration.split(":").map(Number);
                    if (!item.id || parts.some(isNaN)) continue;

                    const totalSeconds =
                        parts.length === 3
                            ? parts[0] * 3600 + parts[1] * 60 + parts[2]
                            : parts[0] * 60 + parts[1];

                    const diff = Math.abs(totalSeconds - songDuration);

                    if (diff < bestDiff && diff <= 5) {
                        bestDiff = diff;
                        bestVid = item.id;
                    }
                }

                if (bestVid) setVideoId(bestVid);
            } catch (err) {
                console.error(err);
            } finally {
                setTimeout(() => setLoadingVideo(false), 3000);
            }
        };

        fetchVideo();
    }, [songInfo, BASE_URL]);

    return { videoId, loadingVideo };
}