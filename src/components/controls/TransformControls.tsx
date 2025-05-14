import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2Icon, WandIcon, AlertCircleIcon, SettingsIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TransformControlsProps {
  onTransform: () => void;
  onSettingsClick?: () => void;
  isProcessing: boolean;
  disabled?: boolean;
  error: string | null;
}

export function TransformControls({
  onTransform,
  onSettingsClick,
  isProcessing,
  disabled = false,
  error
}: TransformControlsProps) {
  // Check if error is API key related
  const isApiKeyError = error && (
    error.includes('API key') || 
    error.includes('ElevenLabs API key') || 
    error.includes('401')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transform</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full"
          onClick={onTransform}
          disabled={disabled}
        >
          {isProcessing ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <WandIcon className="mr-2 h-4 w-4" />
              Transform Voice
            </>
          )}
        </Button>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{error}</p>
              
              {isApiKeyError && onSettingsClick && (
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onSettingsClick} 
                    className="gap-2"
                  >
                    <SettingsIcon className="h-3 w-3" />
                    Go to Settings
                  </Button>
                  <p className="text-xs mt-2">
                    You'll need to create an account at <a href="https://elevenlabs.io" target="_blank" rel="noreferrer" className="underline">elevenlabs.io</a> and get your API key from the account settings.
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <p className="text-xs text-muted-foreground">
          Audio processing can take up to 15 seconds. Please be patient.
        </p>
      </CardContent>
    </Card>
  );
}