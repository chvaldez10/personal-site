import { kokoroVoices } from "./kokoro";
import { audioRequestText, type AudioRequest } from "./schema";

const modelId = "onnx-community/Kokoro-82M-v1.0-ONNX";
type Engine = Awaited<
  ReturnType<typeof import("kokoro-js").KokoroTTS.from_pretrained>
>;
let engine: Promise<Engine> | null = null;

export async function generateKokoroAudio(
  request: AudioRequest,
  onProgress: (message: string) => void,
): Promise<Blob> {
  const voice = kokoroVoices.find((option) => option.id === request.voiceId);
  if (!voice) throw new Error("Choose an available Kokoro voice.");
  if (!engine) {
    onProgress("Loading Kokoro on this device…");
    engine = import("kokoro-js")
      .then(({ KokoroTTS }) =>
        KokoroTTS.from_pretrained(modelId, {
          device: "wasm",
          dtype: "q8",
          progress_callback: (event) => {
            if (event.status === "progress" && event.file.endsWith(".onnx"))
              onProgress(
                `Downloading Kokoro model: ${Math.round(event.progress)}%`,
              );
            else if (event.status === "done" && event.file.endsWith(".onnx"))
              onProgress("Loading Kokoro model into memory…");
            else if (event.status === "ready")
              onProgress("Kokoro is ready. Generating speech…");
          },
        }),
      )
      .catch((error: unknown) => {
        engine = null;
        throw error;
      });
  }

  try {
    const tts = await engine;
    onProgress("Generating speech on this device…");
    const audio = await tts.generate(audioRequestText(request), {
      voice: voice.id,
      speed: 1.08,
    });
    const blob = audio.toBlob();
    if (blob.size < 44) throw new Error("Kokoro returned an empty clip.");
    return blob;
  } catch (error) {
    throw new Error(
      error instanceof Error &&
        error.message === "Kokoro returned an empty clip."
        ? error.message
        : "Kokoro could not generate audio on this device. Check your connection and available memory, then try again.",
    );
  }
}
