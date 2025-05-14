import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2Icon, WandIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TransformControlsProps {
  onTransform: () => void;
  isProcessing: boolean;
  disabled?: boolean;
  error: string | null;
}

export function TransformControls({
  onTransform,
  isProcessing,
  disabled = false,
  error
}: TransformControlsProps) {
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
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <p className="text-xs text-muted-foreground">
          Audio processing can take up to 15 seconds. Please be patient.
        </p>
      </CardContent>
    </Card>
  );
}