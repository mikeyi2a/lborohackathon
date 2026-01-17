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

  // Add detailed logging for the accent parameter
  console.log('Transform request with accent:', accent);
  console.log('Accent ID:', accent.id);
  console.log('Accent name:', accent.name);

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
    // Add a cache-busting timestamp to prevent caching
    const timestamp = new Date().getTime();
    const apiUrl = `${API_BASE_URL}/speech-to-speech/${voiceId}?cache_bust=${timestamp}`;
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
        console.error('ElevenLabs API Error (Full):', JSON.stringify(errorData, null, 2));

        // Handle various error response formats from ElevenLabs
        let errorDetail = '';
        if (errorData.detail) {
          // Handle both string and object detail
          if (typeof errorData.detail === 'string') {
            errorDetail = errorData.detail;
          } else if (errorData.detail.message) {
            errorDetail = errorData.detail.message;
          } else if (errorData.detail.status) {
            errorDetail = `${errorData.detail.status}: ${errorData.detail.message || JSON.stringify(errorData.detail)}`;
          } else {
            errorDetail = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorDetail = errorData.message;
        } else if (errorData.error) {
          errorDetail = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        } else {
          errorDetail = JSON.stringify(errorData);
        }

        errorMessage = `API error: ${response.status} - ${errorDetail}`;
      } catch (jsonError) {
        console.error('Failed to parse error response as JSON:', jsonError);
        try {
          const textError = await response.text();
          console.error('Error response as text:', textError);
          errorMessage = `API error: ${response.status} - ${textError || 'Unknown error'}`;
        } catch {
          errorMessage = `API error: ${response.status} - Could not parse error response`;
        }
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
export function getVoiceIdForAccent(accent: Accent): string {
  // Ensure we're using the latest voice mappings
  // These are real Eleven Labs voice IDs for premium voices
  const voiceMap: Record<string, string> = {
    'british': '21m00Tcm4TlvDq8ikWAM', // Rachel (unchanged)
    'american': '6xPz2opT0y5qtoRh1U1Y', // New American voice
    'australian': 'ys3XeJJA4ArWMhRpcX1D', // New Australian voice
    'indian': 'A7AUsa1uITCDpK29MG3m', // New Indian voice
    'french': 'dDpKZ6xv1gpboV4okVbc', // New French voice
    'spanish': '3l9iCMrNSRR0w51JvFB0', // New Spanish voice
    'german': 'BIvP0GN1cAtSRTxNHnWS', // New German voice
    'japanese': 'Yko7PKHZNXotIFUBG7I9', // Takeshi (unchanged - no new ID provided)
    'polish': 'fRyGt0sxyEEgH08Fy7r', // Jan (unchanged - no new ID provided)
    'irish': 'hmMWXCj9K7N5mCPcRkfC', // New Irish voice
    'default': '21m00Tcm4TlvDq8ikWAM', // Default voice (Rachel)
  };

  const accentId = accent.id.toLowerCase();
  const voiceId = voiceMap[accentId] || voiceMap['default'];

  // More aggressive console logging to debug the issue
  console.log('-----------------------------------');
  console.log('VOICE MAPPING DEBUG - UPDATED VALUES');
  console.log(`- Requested accent: ${accentId}`);
  console.log(`- Selected voice ID: ${voiceId}`);
  console.log(`- Voice map contents: `, JSON.stringify(voiceMap, null, 2));
  console.log('-----------------------------------');

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