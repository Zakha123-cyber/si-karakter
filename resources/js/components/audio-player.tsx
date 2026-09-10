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

export function AudioPlayer({
    src,
    originalName,
    durationSeconds,
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(durationSeconds || 0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [volume, setVolume] = useState(1.0);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () =>
            setDuration(audio.duration || durationSeconds || 0);
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

        if (!audio) {
            return;
        }

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio
                .play()
                .then(() => setIsPlaying(true))
                .catch((err: unknown) =>
                    console.warn('Audio playback prevented:', err),
                );
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleSpeedChange = (rate: number) => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        audio.playbackRate = rate;
        setPlaybackRate(rate);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        const newVol = parseFloat(e.target.value);
        audio.volume = newVol;
        setVolume(newVol);
        setIsMuted(newVol === 0);
    };

    const toggleMute = () => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        if (isMuted) {
            audio.muted = false;
            setIsMuted(false);
        } else {
            audio.muted = true;
            setIsMuted(true);
        }
    };

    const formatTime = (timeInSec: number) => {
        if (isNaN(timeInSec) || timeInSec < 0) {
            return '00:00';
        }

        const mins = Math.floor(timeInSec / 60);
        const secs = Math.floor(timeInSec % 60);

        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <AudioLines
                        className={`h-4 w-4 ${isPlaying ? 'animate-pulse text-emerald-600' : 'text-slate-400'}`}
                    />
                    <span>{originalName || 'Rekaman Suara Santri'}</span>
                </div>
                <a
                    href={src}
                    download={originalName || 'audio_santri.mp3'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100"
                >
                    <Download className="h-3 w-3" />
                    Unduh Audio
                </a>
            </div>

            {/* Waveform Visualizer simulation */}
            <div className="my-3 flex items-center justify-center gap-1 py-1">
                {[
                    40, 70, 30, 90, 50, 80, 40, 60, 100, 45, 75, 35, 85, 65, 40,
                    95, 55, 75, 45,
                ].map((height, i) => (
                    <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${
                            isPlaying
                                ? 'animate-pulse bg-emerald-500'
                                : (currentTime / (duration || 1)) * 19 >= i
                                  ? 'bg-emerald-400'
                                  : 'bg-slate-200'
                        }`}
                        style={{
                            height: `${isPlaying ? Math.max(12, height * (i % 2 === 0 ? 0.9 : 0.6)) : 16}px`,
                        }}
                    />
                ))}
            </div>

            {/* Seek Bar */}
            <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] font-medium text-slate-500">
                    {formatTime(currentTime)}
                </span>
                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600"
                />
                <span className="font-mono text-[11px] font-medium text-slate-500">
                    {formatTime(duration)}
                </span>
            </div>

            {/* Controls Row */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
                {/* Play / Pause button */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePlay}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95"
                    >
                        {isPlaying ? (
                            <Pause className="h-5 w-5" />
                        ) : (
                            <Play className="ml-0.5 h-5 w-5" />
                        )}
                    </button>

                    <button
                        onClick={() => {
                            if (audioRef.current) {
                                audioRef.current.currentTime = 0;
                                setCurrentTime(0);
                            }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-white hover:text-slate-800"
                        title="Putar Ulang Dari Awal"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm">
                    <FastForward className="ml-1 h-3.5 w-3.5 text-slate-400" />
                    {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                        <button
                            key={rate}
                            onClick={() => handleSpeedChange(rate)}
                            className={`rounded px-2 py-0.5 text-[10px] font-bold transition ${
                                playbackRate === rate
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-emerald-50'
                            }`}
                        >
                            {rate}x
                        </button>
                    ))}
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMute}
                        className="text-slate-500 hover:text-emerald-600"
                    >
                        {isMuted || volume === 0 ? (
                            <VolumeX className="h-4 w-4" />
                        ) : (
                            <Volume2 className="h-4 w-4" />
                        )}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="h-1.5 w-16 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600"
                    />
                </div>
            </div>
        </div>
    );
}
