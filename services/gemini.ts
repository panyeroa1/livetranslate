
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const VOICE_MAP: Record<string, string> = {
  'Athena': 'Zephyr',
  'Hera': 'Kore',
  'Artemis': 'Puck',
  'Hestia': 'Charon',
  'Aphrodite': 'Fenrir'
};

/**
 * Eburon Neural Link Factory
 * Initializes a high-latency bidirectional translation session.
 */
export const createLiveSession = async (
  sourceLang: string,
  targetLang: string,
  staffVoice: string,
  guestVoice: string,
  options: { voiceFocus: boolean; noiseRemoval: boolean },
  onOpen: () => void,
  onMessage: (message: LiveServerMessage) => void,
  onError: (error: any) => void,
  onClose: (event: CloseEvent) => void
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const sessionVoice = VOICE_MAP[staffVoice] || 'Zephyr';

  const filteringDirectives = `
  ${options.noiseRemoval ? 'EBURON NOISE REJECTION: Active. Completely filter background hums, traffic, and non-human environmental audio.' : ''}
  ${options.voiceFocus ? 'EBURON VOICE FOCUS: Active. Prioritize the primary speaker closest to the microphone array. Ignore distant chatter.' : ''}
  `;

  const instructionText = `You are the "Eburon Neural Engine", the professional AI core of Success Invest.
  
  CORE PROTOCOL: ZERO-SKIP TURN
  - You must translate EVERY phrase heard, including short confirmations, greetings, and technical terms.
  - DO NOT summarize. DO NOT skip overlapping speech.
  - If a sentence is cut off, translate the fragment.
  
  CONTEXT: Face-to-face professional meeting.
  - PRIMARY USER (Staff): Speaks ${sourceLang}.
  - SECONDARY USER (Guest): Speaks ${targetLang}.
  
  SIGNAL PROCESSING:${filteringDirectives}
  
  OPERATIONAL DIRECTIVES:
  1. INSTANT BIDIRECTIONAL TRANSLATION: 
     - Translate ${sourceLang} to ${targetLang} immediately.
     - Translate ${targetLang} to ${sourceLang} immediately.
  
  2. TRANSCRIPTION:
     - Generate high-fidelity text for both input and translated output for the Eburon Session Log.
  
  3. VOICE IDENTITY:
     - Use the ${sessionVoice} profile. Clear, helpful, and sophisticated.

  IDENTITY: You are Eburon AI. Absolute fidelity. No skips.`;

  try {
    const session = await ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: onOpen,
        onmessage: (msg) => {
          // Log Eburon telemetry for debugging
          if (msg.serverContent?.modelTurn) {
            console.debug("[Eburon Telemetry] Audio chunk received.");
          }
          onMessage(msg);
        },
        onerror: (err) => {
          console.error("[Eburon Neural Link Error]", err);
          onError(err);
        },
        onclose: (event) => {
          console.debug("[Eburon Session Closed]", event);
          onClose(event);
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: instructionText,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: sessionVoice as any } },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    });
    return session;
  } catch (error) {
    console.error("[Eburon Boot Failure] Neural Link could not be established:", error);
    throw error;
  }
};

export function createPcmBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encodeAudio(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
