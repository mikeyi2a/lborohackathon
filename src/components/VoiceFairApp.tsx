import { useState, useEffect } from "react";
import { AudioUpload } from "./audio/AudioUpload";
import { AccentSelector } from "./accent/AccentSelector";
import { AudioComparison } from "./audio/AudioComparison";
import { TransformControls } from "./controls/TransformControls";
import { AppIntro } from "./AppIntro";
import { BlindTestToggle } from "./blindtest/BlindTestToggle";
import { BlindTest } from "./blindtest/BlindTest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { transformVoice, getVoiceIdForAccent } from "@/lib/elevenlabs-api";
import { checkNeedsReload, markForReload } from "@/lib/force-reload";

export type Accent = {
  id: string;
  name: string;
  description: string;
};

export type AudioFile = {
  url: string;
  name: string;
  type: string;
  size: number;
  voiceId?: string; // Optional voice ID for transformed audio
};

export default function VoiceFairApp() {
  const [originalAudio, setOriginalAudio] = useState<AudioFile | null>(null);
  const [transformedAudio, setTransformedAudio] = useState<AudioFile | null>(null);
  const [selectedAccent, setSelectedAccent] = useState<Accent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBlindTestMode, setIsBlindTestMode] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Check if we need to force reload on component mount
  useEffect(() => {
    checkNeedsReload();
    
    // Clear any cached data in localStorage
    if (typeof window !== 'undefined') {
      // Add a version number to track when we need to clear cache
      const currentVersion = '1.0.2'; // Bumped to force cache refresh
      const storedVersion = localStorage.getItem('app_version');
      
      if (storedVersion !== currentVersion) {
        console.log(`Version change detected: ${storedVersion} -> ${currentVersion}`);
        console.log('Clearing cache and updating version...');
        localStorage.setItem('app_version', currentVersion);
        // Force a reload to ensure all cache is cleared
        markForReload();
        window.location.reload();
      }
    }
  }, []);

  const handleAudioUpload = (audio: AudioFile) => {
    // Reset any previous state
    setOriginalAudio(audio);
    setTransformedAudio(null);
    setProcessingError(null);
  };

  const handleTransform = async () => {
    if (!originalAudio || !selectedAccent) return;

    setIsProcessing(true);
    setProcessingError(null);

    try {
      // Log the selected accent to ensure correct values are being used
      console.log('Starting transformation with accent:', selectedAccent);
      console.log('Accent ID for API call:', selectedAccent.id);
      
      // Check if we have audio data first
      if (!originalAudio.url) {
        throw new Error("Audio file is invalid or not properly loaded.");
      }

      // Check file size
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (originalAudio.size > MAX_FILE_SIZE) {
        throw new Error("Audio file is too large. Maximum size is 10MB.");
      }

      // Get the voice ID before transformation for display
      const voiceId = getVoiceIdForAccent(selectedAccent);

      // Use the Eleven Labs API to transform the voice
      const result = await transformVoice(originalAudio, selectedAccent);
      
      if (!result) {
        throw new Error("Voice transformation failed. Please try again.");
      }
      
      // Add the voice ID to the result for display
      setTransformedAudio({
        ...result,
        voiceId: voiceId, // Store the voice ID for display
      });
    } catch (error) {
      console.error("Transformation error:", error);
      
      // Handle specific API key errors
      if (error instanceof Error && error.message.includes('API key not found')) {
        setProcessingError('ElevenLabs API key not found. Please add your API key in the settings.');
      } 
      // Handle rate limiting or subscription issues
      else if (error instanceof Error && error.message.includes('402')) {
        setProcessingError('API subscription limit reached. Please check your ElevenLabs account.');
      }
      // Handle authentication errors
      else if (error instanceof Error && error.message.includes('401')) {
        setProcessingError('Invalid API key. Please check your ElevenLabs API key in settings.');
      }
      // Handle other errors
      else {
        setProcessingError(
          error instanceof Error 
            ? error.message 
            : "Failed to transform audio. Please try again."
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-6">
        <AppIntro />
      </div>
      
      <div className="mt-8 space-y-8">
        <Tabs defaultValue="transform" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="transform">Transform</TabsTrigger>
            <TabsTrigger value="blind-test" disabled={!transformedAudio}>
              Blind Test
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="transform" className="mt-6 space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <AudioUpload onAudioUploaded={handleAudioUpload} />
              
              <div className="space-y-6">
                <AccentSelector 
                  onAccentSelected={setSelectedAccent} 
                  selectedAccent={selectedAccent}
                  disabled={!originalAudio || isProcessing}
                />
                
                <TransformControls 
                  onTransform={handleTransform}
                  isProcessing={isProcessing}
                  disabled={!originalAudio || !selectedAccent || isProcessing}
                  error={processingError}
                />
              </div>
            </div>
            
            {transformedAudio && (
              <>
                <AudioComparison 
                  originalAudio={originalAudio} 
                  transformedAudio={transformedAudio} 
                  accent={selectedAccent}
                />
                
                <BlindTestToggle 
                  enabled={isBlindTestMode}
                  onToggle={() => setIsBlindTestMode(!isBlindTestMode)}
                />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="blind-test">
            {transformedAudio && originalAudio && selectedAccent && (
              <BlindTest 
                originalAudio={originalAudio} 
                transformedAudio={transformedAudio} 
                accent={selectedAccent}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}