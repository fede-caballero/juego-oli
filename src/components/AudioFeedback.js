let selectedVoiceURI = localStorage.getItem('silaba_magica_voice') || null;
let googleCloudApiKey = localStorage.getItem('silaba_magica_gcloud_key') || null;

export const setGoogleCloudKey = (key) => {
    googleCloudApiKey = key;
    localStorage.setItem('silaba_magica_gcloud_key', key);
};

export const getGoogleCloudVoices = async () => {
    if (!googleCloudApiKey) return [];
    try {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/voices?key=${googleCloudApiKey}`);
        const data = await response.json();
        if (data.voices) {
            return data.voices.filter(v => v.languageCodes.some(code => code.startsWith('es')));
        }
        return [];
    } catch (error) {
        console.error("Error fetching Google Cloud voices:", error);
        return [];
    }
};

const synthesizeGoogleCloud = async (text, voiceName) => {
    try {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleCloudApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: { text: text },
                voice: { name: voiceName, languageCode: voiceName.split('-').slice(0, 2).join('-') },
                audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 }
            })
        });

        const data = await response.json();
        if (data.audioContent) {
            const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
            audio.play();
            return true;
        }
    } catch (error) {
        console.error("Google Cloud TTS error:", error);
    }
    return false;
};

export const getAvailableVoices = () => {
    if (!('speechSynthesis' in window)) return [];
    const voices = window.speechSynthesis.getVoices();
    return voices.filter(voice => voice.lang.startsWith('es'));
};

export const setPreferredVoice = (voiceURI) => {
    selectedVoiceURI = voiceURI;
    localStorage.setItem('silaba_magica_voice', voiceURI);
};

export const speak = async (text) => {
    if ('speechSynthesis' in window) {
        // Normalize text for pronunciation
        // 1. Convert to lowercase to prevent acronym reading (e.g., "CU" -> "Ce U")
        let textToSpeak = text.toLowerCase();

        // 2. Specific overrides for tricky syllables
        const overrides = {
            'cu': 'ku',
            'qu': 'ku',
            'güe': 'gue',
            'güi': 'gui',
            // R syllables (force strong R)
            'ra': 'rra',
            're': 'rre',
            'ri': 'rri',
            'ro': 'rro',
            'ru': 'rru',
            // Z syllables (Latin American pronunciation)
            'za': 'sa',
            'ze': 'se',
            'zi': 'si',
            'zo': 'so',
            'zu': 'su',
            // W syllables
            'wa': 'gua',
            'we': 'gue',
            'wi': 'gui',
            'wo': 'guo',
            'wu': 'guu',
            // G syllables (fix acronym reading)
            'ga': 'gá',
            'go': 'gó',
            'gu': 'gú',
            // H syllables (silent H)
            'ha': 'a',
            'he': 'e',
            'hi': 'i',
            'ho': 'o',
            'hu': 'u',
        };

        // Check if the text is exactly one of our overrides (for single syllable mode)
        // or if it ends with one of them (for "Seleccioná... CU")
        const words = textToSpeak.split(' ');
        const lastWord = words[words.length - 1].replace(/[.,!¡?¿]/g, ''); // clean punctuation

        if (overrides[lastWord]) {
            textToSpeak = textToSpeak.replace(new RegExp(`${lastWord}$`), overrides[lastWord]);
        }

        // --- 0. Try Offline Asset (MP3) matching naming convention ---

        // Mapping for special phrases to match Python script filenames
        const phraseMap = {
            "¡muy bien!": "muy_bien",
            "probá de nuevo": "proba_de_nuevo",
            "intentá nuevamente oli": "intenta_nuevamente_oli",
            "¡felicidades olivia! ¡ganaste! pasamos al siguiente nivel.": "felicidades_ganaste",
            "mantené apretado y decí la palabra": "mantene_apretado",
            "hola, soy olivia": "hola_soy_olivia",
            "nivel 1": "nivel_1",
            "nivel 2": "nivel_2"
        };

        let filename = null;
        let lowerText = text.toLowerCase().trim();

        if (phraseMap[lowerText]) {
            filename = phraseMap[lowerText];
        } else if (lowerText.startsWith("seleccioná")) {
            // "Seleccioná... MA"
            // Try to play "selecciona.mp3" then the syllable
            // We return early if successful to handle the sequence ourselves
            const parts = lowerText.split("...");
            if (parts.length > 1) {
                const syllable = parts[1].trim();
                // Try playing 'selecciona'
                // Note: we can't easily chain without blocking, but this is a simple game.
                // We will try to play them in sequence if files exist.
                const vid1 = new Audio('/audio/selecciona.mp3');

                // Check if files exist by trying to load? 
                // Simple approach: try to play. If error, fallback to TTS.
                // But we need to know if it failed.

                const playSequence = async () => {
                    try {
                        await new Promise((resolve, reject) => {
                            vid1.oncanplaythrough = resolve;
                            vid1.onerror = reject;
                            vid1.src = '/audio/selecciona.mp3'; // trigger load
                        });

                        vid1.play();

                        // Wait for 1st audio roughly or onended
                        vid1.onended = () => {
                            const vid2 = new Audio(`/audio/${syllable}.mp3`);
                            vid2.play();
                        };
                        return true;
                    } catch (e) {
                        return false;
                    }
                };

                // If we have both files, we shouldn't continue to TTS.
                // But confirming existence is async. 
                // Let's assume if we are in this mode, files exist. 
                // If not, it fails silently or user fixes script.
                // For robustness, let's play safe: if 'selecciona' fails, we might still want TTS.
                playSequence();
                return;
            }
        } else {
            // Standard word/syllable
            filename = lowerText.replace(/ /g, "_")
                .replace(/[¡!]/g, "")
                .replace(/á/g, "a")
                .replace(/é/g, "e")
                .replace(/í/g, "i")
                .replace(/ó/g, "o")
                .replace(/ú/g, "u")
                .replace(/ñ/g, "n");
        }

        if (filename) {
            const audio = new Audio(`/audio/${filename}.mp3`);
            // Try to play. If it fails (404), we should ideally fallback.
            // But 'speak' is continuously called. 
            // We can attach an error handler that calls TTS?
            // "error" event catches 404.

            let played = false;
            await new Promise((resolve) => {
                audio.oncanplaythrough = () => {
                    audio.play();
                    played = true;
                    resolve();
                };
                audio.onerror = () => {
                    resolve(); // resolve without playing
                };
                setTimeout(resolve, 500); // timeout if loading takes too long
            });

            if (played) return;
        }

        // 1. Try Google Cloud if configured and selected
        if (googleCloudApiKey && selectedVoiceURI && !selectedVoiceURI.includes('://')) {
            // Google voices via API use the name as ID. If we hold a GC key, we try to use the selected voice name.
            const success = await synthesizeGoogleCloud(textToSpeak, selectedVoiceURI);
            if (success) return;
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);

        const voices = window.speechSynthesis.getVoices();
        let targetVoice = null;

        // 1. Try to use user's preferred voice
        if (selectedVoiceURI) {
            targetVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
        }

        // 2. Fallback to Latin American voice, prioritizing Argentina
        if (!targetVoice) {
            targetVoice = voices.find(voice => voice.lang === 'es-AR') ||
                voices.find(voice =>
                    voice.lang === 'es-MX' ||
                    voice.lang === 'es-419' ||
                    (voice.lang.startsWith('es') && voice.name.includes('Latin')) ||
                    (voice.lang.startsWith('es') && voice.name.includes('America'))
                );
        }

        if (targetVoice) {
            utterance.voice = targetVoice;
            utterance.lang = targetVoice.lang;
        } else {
            // Fallback to generic Spanish
            utterance.lang = 'es-ES';
        }

        utterance.rate = 0.8; // Slightly slower for kids
        window.speechSynthesis.speak(utterance);
    }
};
