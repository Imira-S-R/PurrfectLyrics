import type { LyricLine } from "../types";


interface LyricsProps {
    lines: LyricLine[];
    activeIndex: number;
    lineRefs: React.RefObject<(HTMLDivElement | null)[]>;
    playerRef: React.RefObject<any>;
    setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
}

export default function Lyrics({ lines, activeIndex, lineRefs, playerRef, setCurrentTime }: LyricsProps) {
    return (
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
    )
}