import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileIcon, MicIcon, UploadIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AudioFile } from "../VoiceFairApp";

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
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio.",
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
    <Card>
      <CardHeader>
        <CardTitle>Audio Input</CardTitle>
        <CardDescription>Upload an audio file or record directly</CardDescription>
      </CardHeader>
      <CardContent>
        {!audioFile ? (
          <>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="mb-2 text-sm text-muted-foreground">
                Drag and drop audio files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                MP3 or WAV, max 10MB, 30 seconds max
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Select Audio File
              </Button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="audio/mp3, audio/wav"
                onChange={handleFileInputChange}
              />
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-border"></div>
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border"></div>
            </div>
            
            {!isRecording ? (
              <Button 
                className="w-full mt-4 gap-2" 
                onClick={startRecording}
              >
                <MicIcon className="h-4 w-4" />
                Record Audio
              </Button>
            ) : (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-destructive animate-pulse">
                    Recording...
                  </span>
                  <span className="text-sm">
                    {formatTime(recordingTime)} / 00:30
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-destructive h-2 rounded-full transition-all"
                    style={{ width: `${(recordingTime / 30) * 100}%` }}
                  ></div>
                </div>
                <Button 
                  className="w-full mt-2"
                  variant="outline"
                  onClick={stopRecording}
                >
                  Stop Recording
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <FileIcon className="h-8 w-8 flex-shrink-0 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{audioFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearAudio}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
            
            <audio 
              src={audioFile.url} 
              controls 
              className="w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}