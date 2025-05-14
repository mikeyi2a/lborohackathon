import { useState } from "react";
import { AudioUpload } from "./audio/AudioUpload";
import { AccentSelector } from "./accent/AccentSelector";
import { AudioComparison } from "./audio/AudioComparison";
import { TransformControls } from "./controls/TransformControls";
import { AppIntro } from "./AppIntro";
import { BlindTestToggle } from "./blindtest/BlindTestToggle";
import { BlindTest } from "./blindtest/BlindTest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock transformed audio result
      // In a real app, this would be the result from the API
      setTransformedAudio({
        url: originalAudio.url, // In real app, this would be a different URL
        name: `${originalAudio.name.split('.')[0]}_${selectedAccent.id}.${originalAudio.name.split('.')[1]}`,
        type: originalAudio.type,
        size: originalAudio.size,
      });
    } catch (error) {
      setProcessingError("Failed to transform audio. Please try again.");
      console.error("Transformation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
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
            {transformedAudio && (
              <BlindTest 
                originalAudio={originalAudio!} 
                transformedAudio={transformedAudio} 
                accent={selectedAccent!}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}