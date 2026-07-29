import {
    AudioLines,
    Download,
    FastForward,
    Pause,
    Play,
    RotateCcw,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
    src: string;
    originalName?: string;
    durationSeconds?: number | null;
}

export function AudioPlayer({ src, originalName, durationSeconds }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(durationSeconds || 0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [volume, setVolume] = useState(1.0);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration || durationSeconds || 0);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [durationSeconds]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().then(() => setIsPlaying(true)).catch((err) => console.warn('Audio playback prevented:', err));
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleSpeedChange = (rate: number) => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.playbackRate = rate;
        setPlaybackRate(rate);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newVol = parseFloat(e.target.value);
        audio.volume = newVol;
        setVolume(newVol);
        setIsMuted(newVol === 0);
    };

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isMuted) {
            audio.muted = false;
            setIsMuted(false);
        } else {
            audio.muted = true;
            setIsMuted(true);
        }
    };

    const formatTime = (timeInSec: number) => {
        if (isNaN(timeInSec) || timeInSec < 0) return '00:00';
        const mins = Math.floor(timeInSec / 60);
        const secs = Math.floor(timeInSec % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-slate-50 p-4 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/20 dark:to-slate-900">
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Header info */}
            <div className="flex items-center justify-between border-b border-indigo-100/60 pb-3 dark:border-indigo-900/30">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                    <AudioLines className={`h-4 w-4 ${isPlaying ? 'animate-pulse text-indigo-600' : 'text-slate-400'}`} />
                    <span>{originalName || 'Rekaman Suara Santri'}</span>
                </div>
                <a
                    href={src}
                    download={originalName || 'audio_santri.mp3'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-1 text-[11px] font-medium text-indigo-700 transition hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300"
                >
                    <Download className="h-3 w-3" />
                    Unduh Audio
                </a>
            </div>

            {/* Waveform Visualizer simulation */}
            <div className="my-3 flex items-center justify-center gap-1 py-1">
                {[40, 70, 30, 90, 50, 80, 40, 60, 100, 45, 75, 35, 85, 65, 40, 95, 55, 75, 45].map((height, i) => (
                    <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${
                            isPlaying
                                ? 'bg-indigo-500 animate-pulse'
                                : (currentTime / (duration || 1)) * 19 >= i
                                ? 'bg-indigo-400'
                                : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                        style={{ height: `${isPlaying ? Math.max(12, (height * (i % 2 === 0 ? 0.9 : 0.6))) : 16}px` }}
                    />
                ))}
            </div>

            {/* Seek Bar */}
            <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                    {formatTime(currentTime)}
                </span>
                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700"
                />
                <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                    {formatTime(duration)}
                </span>
            </div>

            {/* Controls Row */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-indigo-100/60 pt-3 dark:border-indigo-900/30">
                {/* Play / Pause button */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePlay}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-95"
                    >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
                    </button>

                    <button
                        onClick={() => {
                            if (audioRef.current) {
                                audioRef.current.currentTime = 0;
                                setCurrentTime(0);
                            }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title="Putar Ulang Dari Awal"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                    <FastForward className="ml-1 h-3.5 w-3.5 text-slate-400" />
                    {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                        <button
                            key={rate}
                            onClick={() => handleSpeedChange(rate)}
                            className={`rounded px-2 py-0.5 text-[10px] font-bold transition ${
                                playbackRate === rate
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                        >
                            {rate}x
                        </button>
                    ))}
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="text-slate-500 hover:text-indigo-600">
                        {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="h-1.5 w-16 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700"
                    />
                </div>
            </div>
        </div>
    );
}
