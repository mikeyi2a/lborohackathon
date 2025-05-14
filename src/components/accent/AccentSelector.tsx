import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Accent } from "../VoiceFairApp";

interface AccentSelectorProps {
  onAccentSelected: (accent: Accent) => void;
  selectedAccent: Accent | null;
  disabled?: boolean;
}

const AVAILABLE_ACCENTS: Accent[] = [
  {
    id: "british",
    name: "Voice 1",
    description: "Received Pronunciation (RP) accent from Southern England"
  },
  {
    id: "american",
    name: "Voice 2",
    description: "General American accent commonly heard in media"
  },
  {
    id: "indian",
    name: "Voice 3",
    description: "Indian English accent with characteristic intonation patterns"
  },
  {
    id: "australian",
    name: "Voice 4",
    description: "Australian English accent with distinctive vowels"
  },
  {
    id: "french",
    name: "Voice 5",
    description: "English spoken with a French accent"
  },
  {
    id: "spanish",
    name: "Voice 6",
    description: "English spoken with a Spanish accent"
  },
  {
    id: "german",
    name: "Voice 7",
    description: "English spoken with a German accent"
  },
  {
    id: "japanese",
    name: "Voice 8",
    description: "English spoken with a Japanese accent"
  },
  {
    id: "polish",
    name: "Voice 9",
    description: "English spoken with a Polish accent"
  },
  {
    id: "irish",
    name: "Voice 10",
    description: "Irish English accent with distinctive intonation"
  }
];

export function AccentSelector({ 
  onAccentSelected, 
  selectedAccent,
  disabled = false 
}: AccentSelectorProps) {
  
  const handleAccentChange = (accentId: string) => {
    const accent = AVAILABLE_ACCENTS.find(a => a.id === accentId);
    if (accent) {
      onAccentSelected(accent);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Selection</CardTitle>
        <CardDescription>
          Choose the target voice for transformation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          disabled={disabled}
          value={selectedAccent?.id || ""}
          onValueChange={handleAccentChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_ACCENTS.map((accent) => (
              <SelectItem key={accent.id} value={accent.id}>
                {accent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedAccent && (
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedAccent.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}