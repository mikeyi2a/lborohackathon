import { useState, useEffect } from "react";
import { AudioUpload } from "./audio/AudioUpload";
import { AccentSelector } from "./accent/AccentSelector";
import { AudioComparison } from "./audio/AudioComparison";
import { TransformControls } from "./controls/TransformControls";
import { BlindTest } from "./blindtest/BlindTest";
import { transformVoice, getVoiceIdForAccent } from "@/lib/elevenlabs-api";
import { checkNeedsReload, markForReload } from "@/lib/force-reload";
import { BlurFade } from "@/components/ui/blur-fade";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

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
  const [showBlindTest, setShowBlindTest] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Check if we need to force reload on component mount
  useEffect(() => {
    checkNeedsReload();

    // Clear any cached data in localStorage
    if (typeof window !== 'undefined') {
      // Add a version number to track when we need to clear cache
      const currentVersion = '1.0.3'; // Bumped for new layout
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
    setShowBlindTest(false);
  };

  const handleTransform = async () => {
    if (!originalAudio || !selectedAccent) return;

    setIsProcessing(true);
    setProcessingError(null);

    try {
      if (!originalAudio.url) {
        throw new Error("Audio file is invalid or not properly loaded.");
      }

      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (originalAudio.size > MAX_FILE_SIZE) {
        throw new Error("Audio file is too large. Maximum size is 10MB.");
      }

      const voiceId = getVoiceIdForAccent(selectedAccent);
      const result = await transformVoice(originalAudio, selectedAccent);

      if (!result) {
        throw new Error("Voice transformation failed. Please try again.");
      }

      setTransformedAudio({
        ...result,
        voiceId: voiceId,
      });

      // Auto-scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

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

  return (
    <div className="container max-w-screen-lg mx-auto px-4 sm:px-6 py-6 space-y-12 pb-24">
      {/* Step 1: Upload */}
      <BlurFade delay={0.1} inView>
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm ring-4 ring-primary/5">1</div>
            <h2 className="text-xl font-semibold tracking-tight">Upload Audio</h2>
          </div>
          <AudioUpload onAudioUploaded={handleAudioUpload} />
        </section>
      </BlurFade>

      {/* Step 2: Voice Selection */}
      <BlurFade delay={0.2} inView>
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm ring-4 ring-primary/5">2</div>
            <h2 className="text-xl font-semibold tracking-tight">Select Target Voice</h2>
          </div>
          <AccentSelector
            onAccentSelected={setSelectedAccent}
            selectedAccent={selectedAccent}
            disabled={isProcessing}
          />
        </section>
      </BlurFade>

      {/* Step 3: Transform Action */}
      <BlurFade delay={0.3} inView>
        <div className="sticky bottom-6 z-10 pt-4 pb-2">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md -z-10 -mx-4 px-4 sm:-mx-6 sm:px-6 rounded-t-xl border-t border-border/50 shadow-[0_-8px_20px_-12px_rgba(0,0,0,0.1)] opacity-0 data-[visible=true]:opacity-100 transition-opacity" data-visible={!!(originalAudio && selectedAccent)}></div>
          <TransformControls
            onTransform={handleTransform}
            isProcessing={isProcessing}
            disabled={!originalAudio || !selectedAccent || isProcessing}
            error={processingError}
          />
        </div>
      </BlurFade>

      {/* Step 4: Results */}
      {transformedAudio && (
        <BlurFade delay={0.1} inView>
          <div id="results-section" className="pt-8 scroll-mt-24">
            <Separator className="mb-12 opacity-50" />

            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/10 text-success font-bold text-sm ring-4 ring-success/5">✓</div>
                  <h2 className="text-xl font-semibold tracking-tight">Transformation Complete</h2>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBlindTest(!showBlindTest)}
                  className="gap-2"
                >
                  {showBlindTest ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showBlindTest ? "Hide Blind Test" : "Start Blind Test"}
                </Button>
              </div>

              {showBlindTest ? (
                <BlindTest
                  originalAudio={originalAudio!}
                  transformedAudio={transformedAudio}
                  accent={selectedAccent!}
                />
              ) : (
                <AudioComparison
                  originalAudio={originalAudio}
                  transformedAudio={transformedAudio}
                  accent={selectedAccent}
                />
              )}
            </section>
          </div>
        </BlurFade>
      )}

      <Separator className="my-12" />

      {/* Educational Section: How it Works & Why */}
      <section className="grid gap-12 md:grid-cols-2 lg:gap-16 py-12">
        <BlurFade delay={0.4} inView>
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
              Technology
            </div>
            <h2 className="text-3xl font-bold tracking-tight">How it Works</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              VoiceFair leverages state-of-the-art **Speech-to-Speech (STS)** AI. Unlike traditional voice cloning, our system preserves your original:
            </p>
            <ul className="space-y-4">
              {[
                { title: "Emotional Intelligence", desc: "Preserves the subtle nuances and feelings in your delivery." },
                { title: "Rhythm & Cadence", desc: "Maintains your natural speaking pace and pauses." },
                { title: "Vocal Performance", desc: "Transfers your unique energy into a new target accent." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex-none h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </BlurFade>

        <BlurFade delay={0.5} inView>
          <div className="space-y-6 p-8 rounded-3xl bg-secondary/50 border border-border/50">
            <div className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-600 ring-1 ring-inset ring-amber-500/20">
              Our Mission
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Why VoiceFair?</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Accent bias exists. People are often unfairly judged based on their pronunciation rather than the value of their ideas.
              </p>
              <p className="font-medium text-foreground">
                VoiceFair is an ethical tool designed to level the playing field.
              </p>
              <p>
                By allowing individuals to transform their vocal delivery while maintaining their unique performance, we aim to focus conversation on **what** is being said, not **how** it sounds.
              </p>
            </div>
            <div className="pt-4 flex gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold">Ethical AI Framework</h4>
                <p className="text-xs text-muted-foreground">Built to empower creators and professionals through inclusive technology.</p>
              </div>
            </div>
          </div>
        </BlurFade>
      </section>
    </div>
  );
}

// Correct icons import at bottom if I'm using them
import { CheckCircle2 } from "lucide-react";