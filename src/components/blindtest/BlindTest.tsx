import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { AudioPlayer } from "../audio/AudioPlayer";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Accent, AudioFile } from "../VoiceFairApp";
import { cn } from "@/lib/utils";
import { CheckCircle2Icon, RefreshCcwIcon } from "lucide-react";

interface BlindTestProps {
  originalAudio: AudioFile;
  transformedAudio: AudioFile;
  accent: Accent;
}

type TestAudio = {
  id: string;
  label: string;
  src: string;
  isTransformed: boolean;
};

export function BlindTest({ 
  originalAudio, 
  transformedAudio, 
  accent 
}: BlindTestProps) {
  const [testAudios, setTestAudios] = useState<TestAudio[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Prepare and randomize the test audios
  useEffect(() => {
    const audioA: TestAudio = {
      id: 'A',
      label: 'Audio A',
      src: originalAudio.url,
      isTransformed: false
    };
    
    const audioB: TestAudio = {
      id: 'B',
      label: 'Audio B',
      src: transformedAudio.url,
      isTransformed: true
    };
    
    // Randomly swap the order
    const randomOrder = Math.random() > 0.5 
      ? [audioA, audioB] 
      : [audioB, audioA];
    
    setTestAudios(randomOrder);
    setSelectedAudio(null);
    setHasSubmitted(false);
    setIsCorrect(null);
  }, [originalAudio, transformedAudio]);

  const handleSubmit = () => {
    if (!selectedAudio) return;
    
    const selected = testAudios.find(audio => audio.id === selectedAudio);
    setHasSubmitted(true);
    
    if (selected) {
      setIsCorrect(selected.isTransformed);
    }
  };

  const resetTest = () => {
    // Randomize the order again
    setTestAudios(prev => [...prev].sort(() => Math.random() - 0.5));
    setSelectedAudio(null);
    setHasSubmitted(false);
    setIsCorrect(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blind Test</CardTitle>
        <CardDescription>
          Can you identify which audio has been transformed to the {accent.name} accent?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {testAudios.map((audio) => (
            <div key={audio.id} className="space-y-3">
              <div className="font-medium">{audio.label}</div>
              <AudioPlayer src={audio.src} />
            </div>
          ))}
        </div>
        
        {!hasSubmitted ? (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="font-medium mb-3">Which audio has the transformed accent?</div>
              <RadioGroup 
                value={selectedAudio || ''} 
                onValueChange={setSelectedAudio}
              >
                {testAudios.map((audio) => (
                  <div key={audio.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={audio.id} id={`audio-${audio.id}`} />
                    <Label htmlFor={`audio-${audio.id}`}>{audio.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <Button
              className="w-full"
              disabled={!selectedAudio}
              onClick={handleSubmit}
            >
              Submit Answer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={cn(
              "p-4 rounded-lg flex items-center gap-3",
              isCorrect 
                ? "bg-success/10 text-success-foreground border border-success/50" 
                : "bg-destructive/10 text-destructive-foreground border border-destructive/50"
            )}>
              {isCorrect ? (
                <CheckCircle2Icon className="h-5 w-5 flex-shrink-0" />
              ) : (
                <CheckCircle2Icon className="h-5 w-5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">
                  {isCorrect 
                    ? "Correct identification!" 
                    : "Incorrect identification."
                  }
                </p>
                <p className="text-sm">
                  {testAudios.find(a => a.isTransformed)?.label} was the transformed audio with the {accent.name} accent.
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={resetTest}
            >
              <RefreshCcwIcon className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}