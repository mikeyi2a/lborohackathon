import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "./AudioPlayer";
import { Download } from "lucide-react";
import { Accent, AudioFile } from "../VoiceFairApp";
import { Badge } from "@/components/ui/badge";

interface AudioComparisonProps {
  originalAudio: AudioFile | null;
  transformedAudio: AudioFile;
  accent: Accent | null;
}

export function AudioComparison({ 
  originalAudio, 
  transformedAudio,
  accent 
}: AudioComparisonProps) {
  
  // Early return if originalAudio is null (should not happen in practice)
  if (!originalAudio) {
    return null;
  }
  
  const downloadAudio = (audio: AudioFile) => {
    const link = document.createElement('a');
    link.href = audio.url;
    link.download = audio.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      <CardHeader>
        <CardTitle>Results Comparison</CardTitle>
        <CardDescription>
          Compare your original audio with the transformed version
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Original Audio</h3>
              <p className="text-sm text-muted-foreground">Your uploaded recording</p>
            </div>
            
            <AudioPlayer src={originalAudio.url} />
            
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => downloadAudio(originalAudio)}
            >
              <Download className="h-4 w-4" />
              Download Original
            </Button>
          </div>
          
          <div className="space-y-4 md:relative">
            <div className="md:absolute md:inset-y-0 md:left-0 hidden md:block">
              <Separator orientation="vertical" className="h-full mx-auto" />
            </div>
            
            <div className="md:pl-8">
              <h3 className="font-semibold text-lg">Transformed Audio</h3>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">
                  {accent ? `With ${accent.name} accent` : 'Transformed version'}
                </p>
                {transformedAudio.voiceId && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Voice ID: {transformedAudio.voiceId}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {accent?.id === 'american' ? 'Antoni' : 
                       accent?.id === 'indian' ? 'Anika' : 
                       accent?.id === 'british' ? 'Rachel' : 
                       accent?.id === 'australian' ? 'Josh' : ''}
                    </Badge>
                  </div>
                )}
              </div>
              
              <AudioPlayer src={transformedAudio.url} className="mt-4" />
              
              <Button
                className="w-full gap-2 mt-4"
                onClick={() => downloadAudio(transformedAudio)}
              >
                <Download className="h-4 w-4" />
                Download Transformed
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}