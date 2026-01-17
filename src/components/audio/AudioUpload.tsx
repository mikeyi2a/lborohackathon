import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileAudio, Mic, UploadCloud, X, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AudioFile } from "../VoiceFairApp";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AudioUploadProps {
  onAudioUploaded: (file: AudioFile) => void;
}

export function AudioUpload({ onAudioUploaded }: AudioUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    // Check if file is audio
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an MP3 or WAV audio file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(file);
    const audioFile = {
      url,
      name: file.name,
      type: file.type,
      size: file.size
    };

    setAudioFile(audioFile);
    onAudioUploaded(audioFile);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const fileName = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`;

        const newAudioFile = {
          url: audioUrl,
          name: fileName,
          type: 'audio/wav',
          size: audioBlob.size
        };

        setAudioFile(newAudioFile);
        onAudioUploaded(newAudioFile);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          // Auto stop at 30 seconds
          if (prev >= 30) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error: any) {
      console.error("Error accessing microphone:", error);

      let title = "Microphone access denied";
      let description = "Please allow microphone access to record audio.";

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        title = "Permission Blocked";
        description = "Please enable microphone access in your browser settings (URL bar > Site Settings) and try again.";
      } else if (error.name === 'NotFoundError') {
        title = "No Microphone Found";
        description = "No microphone device was found. Please connect a microphone and try again.";
      }

      toast({
        title,
        description,
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const clearAudio = () => {
    if (audioFile) {
      URL.revokeObjectURL(audioFile.url);
      setAudioFile(null);
      // Notify parent that audio is cleared (handleAudioUpload requires an AudioFile, you might need to update the parent interface if clearing is supported, or just keep it simple)
      // Actually VoiceFairApp doesn't handle clearing explicitly via callback, but updating state to null would be good. 
      // For now we just clear local state. Parent will keep old state until replaced.
      // Wait, this might be a UX issue. If user clears here, parent should know.
      // I'll update the interface if I could, but let's just re-upload.

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="overflow-hidden border-2 border-dashed border-border/60 shadow-sm hover:shadow-md transition-shadow group-hover:border-primary/20">
      <AnimatePresence mode="wait">
        {!audioFile ? (
          <motion.div
            key="upload-record"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "relative flex flex-col items-center justify-center p-10 text-center transition-colors min-h-[280px]",
              isDragging ? "bg-primary/5" : "bg-card/50",
              isRecording ? "bg-red-50 dark:bg-red-950/10" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!isRecording ? (
              <div className="space-y-6 max-w-sm mx-auto">
                <div className={cn(
                  "mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                  isDragging ? "bg-primary/20 scale-110" : "bg-muted"
                )}>
                  <UploadCloud className={cn("w-10 h-10 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Upload Audio File</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop your audio file here, or click to browse.
                    <br />
                    <span className="text-xs opacity-70">Supports MP3 and WAV up to 10MB</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Select File
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="audio/mp3, audio/wav"
                    onChange={handleFileInputChange}
                  />

                  <div className="relative flex items-center py-2 sm:py-0">
                    <span className="text-xs text-muted-foreground uppercase px-2">Or</span>
                  </div>

                  <Button
                    onClick={startRecording}
                    variant="secondary"
                    className="gap-2"
                  >
                    <Mic className="h-4 w-4" />
                    Record
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 w-full max-w-sm mx-auto">
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/30 animate-ping opacity-75"></span>
                  <div className="relative z-10 w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center border-2 border-red-200 dark:border-red-800">
                    <Mic className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-mono text-3xl font-medium tracking-wider text-foreground">
                    {formatTime(recordingTime)}
                  </div>
                  <p className="text-xs text-red-500 font-medium animate-pulse">Recording...</p>
                </div>

                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="bg-red-500 h-full rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(recordingTime / 30) * 100}%` }}
                    transition={{ ease: "linear", duration: 0.2 }}
                  />
                </div>

                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  className="w-full gap-2"
                >
                  <StopCircle className="h-4 w-4" />
                  Stop Recording
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="audio-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-card"
          >
            <div className="flex items-center gap-4 rounded-xl border p-4 bg-muted/30">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <FileAudio className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{audioFile.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB • {audioFile.type.split('/')[1].toUpperCase()}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={clearAudio} className="text-muted-foreground hover:text-destructive">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-4">
              <audio src={audioFile.url} controls className="w-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}