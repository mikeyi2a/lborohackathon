import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { PauseIcon, PlayIcon, Volume2Icon, VolumeXIcon } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export function AudioPlayer({ src, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      cancelAnimationFrame(animationRef.current as number);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      cancelAnimationFrame(animationRef.current as number);
    } else {
      audio.play().catch(error => {
        console.error("Error playing audio:", error);
      });
      animationRef.current = requestAnimationFrame(updateProgress);
    }

    setIsPlaying(!isPlaying);
  };

  const updateProgress = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(audio.currentTime);
    animationRef.current = requestAnimationFrame(updateProgress);
  };

  const handleTimeChange = (newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = newValue[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newValue: number[]) => {
    const newVolume = newValue[0];
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Waveform visualization
  const generateWaveform = () => {
    // Increase segments for better resolution on wider screens
    const segments = 64;
    const minHeight = 4;
    const maxHeight = 40;

    return (
      <div className="flex items-center justify-between gap-[3px] h-12 mt-4 px-4 w-full">
        {Array.from({ length: segments }).map((_, i) => {
          // Generate semi-random heights weighted toward the center for a natural waveform look
          const position = Math.abs((i / segments) * 2 - 1); // 0 in middle, 1 at edges
          const randomFactor = Math.random() * 0.5 + 0.5; // 0.5-1.0 random factor
          // Use a sine wave modulation for a more musical look
          const sineMod = Math.sin(i * 0.2) * 0.2 + 0.8;

          const height = minHeight + (maxHeight - minHeight) * (1 - position * 0.8) * randomFactor * sineMod;

          const isActive = (i / segments) <= (currentTime / duration);

          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-300 ${isActive ? 'bg-primary' : 'bg-primary/20'
                }`}
              style={{ height: `${Math.max(4, height)}px` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("rounded-md border bg-card shadow-sm", className)}>
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => {
          setIsPlaying(false);
          cancelAnimationFrame(animationRef.current as number);
        }}
        onTimeUpdate={() => {
          setCurrentTime(audioRef.current?.currentTime || 0);
        }}
      />

      {generateWaveform()}

      <div className="flex items-center gap-2 px-4 pb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <PauseIcon className="h-4 w-4" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
        </Button>

        <div className="text-sm w-16 text-center">
          {formatTime(currentTime)}
        </div>

        <Slider
          className="flex-1"
          value={[currentTime]}
          max={duration || 100}
          step={0.01}
          onValueChange={handleTimeChange}
        />

        <div className="text-sm w-16 text-center">
          {formatTime(duration)}
        </div>

        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeXIcon className="h-4 w-4" />
            ) : (
              <Volume2Icon className="h-4 w-4" />
            )}
          </Button>

          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-24 p-2 bg-popover rounded-md shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
            <Slider
              className="my-2"
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              orientation="vertical"
            />
          </div>
        </div>
      </div>
    </div>
  );
}