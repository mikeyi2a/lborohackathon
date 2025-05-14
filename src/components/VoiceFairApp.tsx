import { useState } from "react";
import { AudioUpload } from "./audio/AudioUpload";
import { AccentSelector } from "./accent/AccentSelector";
import { AudioComparison } from "./audio/AudioComparison";
import { TransformControls } from "./controls/TransformControls";
import { AppIntro } from "./AppIntro";
import { BlindTestToggle } from "./blindtest/BlindTestToggle";
import { BlindTest } from "./blindtest/BlindTest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { transformVoice } from "@/lib/elevenlabs-api";
import { SettingsPage } from "./settings/SettingsPage";
import { Layout } from "./layout/Layout";

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
};

export default function VoiceFairApp() {
  const [originalAudio, setOriginalAudio] = useState<AudioFile | null>(null);
  const [transformedAudio, setTransformedAudio] = useState<AudioFile | null>(null);
  const [selectedAccent, setSelectedAccent] = useState<Accent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBlindTestMode, setIsBlindTestMode] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleAudioUpload = (audio: AudioFile) => {
    setOriginalAudio(audio);
    setTransformedAudio(null);
    setProcessingError(null);
  };

  const handleTransform = async () => {
    if (!originalAudio || !selectedAccent) return;

    setIsProcessing(true);
    setProcessingError(null);

    try {
      if (!originalAudio.url) {
        throw new Error("Audio file is invalid or not properly loaded.");
      }

      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (originalAudio.size > MAX_FILE_SIZE) {
        throw new Error("Audio file is too large. Maximum size is 10MB.");
      }

      const result = await transformVoice(originalAudio, selectedAccent);
      
      if (!result) {
        throw new Error("Voice transformation failed. Please try again.");
      }
      
      setTransformedAudio(result);
    } catch (error) {
      console.error("Transformation error:", error);
      
      if (error instanceof Error && error.message.includes('API key not found')) {
        setProcessingError('ElevenLabs API key not found. Please add your API key in the settings.');
      } 
      else if (error instanceof Error && error.message.includes('402')) {
        setProcessingError('API subscription limit reached. Please check your ElevenLabs account.');
      }
      else if (error instanceof Error && error.message.includes('401')) {
        setProcessingError('Invalid API key. Please check your ElevenLabs API key in settings.');
      }
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

  if (showSettings) {
    return <SettingsPage onBack={() => setShowSettings(false)} />;
  }

  return (
    <Layout onSettingsClick={() => setShowSettings(true)}>
      <div className="container py-8 md:py-12">
        <AppIntro />
        
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
                    onSettingsClick={() => setShowSettings(true)}
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
    </Layout>
  );
}