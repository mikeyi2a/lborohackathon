import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export function AppIntro() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          VoiceFair
        </h1>
        <p className="mt-3 text-xl text-muted-foreground">
          Addressing voice bias in hiring with ethical AI voice transformation
        </p>
      </div>
      
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription>
          Upload your audio file or record directly, select a voice, and transform your recording while preserving content and tone. 
          Compare the original and transformed versions, or use the blind test feature to evaluate without bias.
        </AlertDescription>
      </Alert>
    </div>
  );
}