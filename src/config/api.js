// API Configuration
// Replace these with your actual API keys from the respective services
// 
// IMPORTANT: To test your ElevenLabs API key, visit: https://elevenlabs.io/docs/api-reference/quickstart/authentication
// Make sure your API key has enough credits and access to the voice you're trying to use

export const API_KEYS = {
  // Google Gemini AI API Key
  GEMINI_API_KEY: "AIzaSyA4LQ-Ic5Mo35NJ-ECVq3okfbw31uQSrcs",

  // ElevenLabs API Key - Get from https://elevenlabs.io/
  ELEVENLABS_API_KEY: "sk_25f68075f5b9ba2b69405b230e2fe3ca5f9a0313eee1ef11",

  // ElevenLabs Voice ID - Nicole (professional, empathetic)
  ELEVENLABS_VOICE_ID: "XrExE9yKIg1WjnnlVkGX",
};

// Alternative female voice options from ElevenLabs:
// - Rachel: "21m00Tcm4TlvDq8ikWAM" (Professional, warm)
// - Bella: "EXAVITQu4vr4xnSDxMaL" (Young, friendly)
// - Sarah: "VR6AewLTigWG4xSOukaG" (Mature, caring)
// - Nicole: "piTKgcLEGmPE4e6mEKli" (Professional, empathetic)

export const VOICE_SETTINGS = {
  stability: 0.5,        // Controls voice consistency (0-1)
  similarity_boost: 0.5, // Controls voice similarity to original (0-1)
  style: 0.0,           // Controls speaking style (0-1)
  use_speaker_boost: true // Enhances voice clarity
}; 