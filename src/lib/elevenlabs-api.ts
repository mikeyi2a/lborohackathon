import { AudioFile, Accent } from '@/components/VoiceFairApp';

// Get API key from local storage or use a default value
const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('elevenlabs_api_key') || '';
  }
  return '';
};

const API_BASE_URL = 'https://api.elevenlabs.io/v1';

/**
 * Transform audio file using Eleven Labs Voice Changer API
 */
export async function transformVoice(
  audioFile: AudioFile,
  accent: Accent
): Promise<AudioFile | null> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('ElevenLabs API key not found. Please add your API key in the settings.');
  }
  
  try {
    // Create a FormData instance for the multipart/form-data request
    const formData = new FormData();
    
    // Convert the audio URL to a Blob
    const audioResponse = await fetch(audioFile.url);
    const audioBlob = await audioResponse.blob();
    
    // Append the audio file to the form data
    formData.append('audio', audioBlob, audioFile.name);
    
    // Set the model ID - using the documented model for speech-to-speech
    formData.append('model_id', 'eleven_multilingual_sts_v2');
    
    // Optional parameters for voice quality settings
    formData.append('similarity_boost', '0.75');
    formData.append('stability', '0.5');
    formData.append('style', '0.0'); // Lower style since we're preserving the original speech style
    formData.append('use_speaker_boost', 'true');
    
    // Optional: cleanup background noise
    formData.append('remove_background_noise', 'true');
    
    console.log('Sending request to ElevenLabs with payload:', {
      model_id: 'eleven_multilingual_sts_v2',
      voice_id: getVoiceIdForAccent(accent),
      audio_size: audioBlob.size,
      audio_type: audioBlob.type
    });
    
    // Get the target voice ID
    const voiceId = getVoiceIdForAccent(accent);
    
    // Log the complete API URL for debugging
    const apiUrl = `${API_BASE_URL}/speech-to-speech/${voiceId}`;
    console.log('Making request to ElevenLabs API URL:', apiUrl);
    
    // Make the API request to Eleven Labs - correct endpoint from documentation
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        // Do not set Content-Type header when using FormData
        // The browser will automatically set it with the correct boundary
      },
      body: formData,
    });

    // Debug response information
    console.log('ElevenLabs API Response Status:', response.status);
    console.log('ElevenLabs API Response URL:', response.url);
    
    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('ElevenLabs API Error:', errorData);
        errorMessage = `API error: ${response.status} - ${errorData.message || errorData.detail || 'Unknown error'}`;
      } catch (jsonError) {
        console.error('Failed to parse error response as JSON:', jsonError);
        const textError = await response.text();
        console.error('Error response as text:', textError);
        errorMessage = `API error: ${response.status} - ${textError || 'Unknown error'}`;
      }
      throw new Error(errorMessage);
    }

    // Get the transformed audio as a blob
    const transformedAudioBlob = await response.blob();
    
    // Create a URL for the blob
    const transformedAudioUrl = URL.createObjectURL(transformedAudioBlob);
    
    // Return the transformed audio file object
    return {
      url: transformedAudioUrl,
      name: `${audioFile.name.split('.')[0]}_${accent.id}.${audioFile.name.split('.')[1]}`,
      type: audioFile.type,
      size: transformedAudioBlob.size,
    };
    
  } catch (error) {
    console.error('Error transforming voice:', error);
    throw error; // Re-throw to show specific error message to user
  }
}

/**
 * Map accent to an appropriate voice ID from Eleven Labs
 * In a real implementation, you would have a mapping of accents to voice IDs
 */
function getVoiceIdForAccent(accent: Accent): string {
  // This is a simplified implementation
  // In a real app, you would have a proper mapping of accents to voice IDs
  // These are real Eleven Labs voice IDs for premium voices
  const voiceMap: Record<string, string> = {
    'british': '21m00Tcm4TlvDq8ikWAM', // Rachel
    'american': 'ErXwobaYiN019PkySvjV', // Antoni
    'australian': 'IKne3meq5aSn9XLyUdCD', // Josh 
    'indian': 'ecp3DWciuUyW7BYM7II1', // Anika
    'french': 'jsCqWAovK2LkecY7zXl4', // Nicole
    'spanish': 'lBpO6DxEll8C5xi56kN8', // Paolo
    'german': 'JBFqnCBsd6RMkjVDRZzb', // Sarah
    'japanese': 'Yko7PKHZNXotIFUBG7I9', // Takeshi
    'polish': 'fRyGt0sxyEEgH08Fy7r', // Jan
    'irish': 'PNZXhTVIQQjRbP6afG', // Connor
    'default': '21m00Tcm4TlvDq8ikWAM', // Default voice (Rachel)
  };
  
  const accentId = accent.id.toLowerCase();
  const voiceId = voiceMap[accentId] || voiceMap['default'];
  
  console.log('Voice mapping debug:');
  console.log(`- Requested accent: ${accentId}`);
  console.log(`- Selected voice ID: ${voiceId}`);
  console.log('- Available voice mappings:', voiceMap);
  
  return voiceId;
}

/**
 * Gets available voices from Eleven Labs API
 * Could be used to populate accent options
 */
export async function getAvailableVoices(): Promise<any[]> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('ElevenLabs API key not found. Please add your API key in the settings.');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/voices`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error('Error fetching voices:', error);
    return [];
  }
}

/**
 * Save the API key to localStorage
 */
export function saveApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('elevenlabs_api_key', key);
  }
}

/**
 * Check if the API key is valid
 */
export async function checkApiKey(key: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'GET',
      headers: {
        'xi-api-key': key,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error checking API key:', error);
    return false;
  }
} 