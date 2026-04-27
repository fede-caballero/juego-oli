import React, { useState, useEffect } from 'react';
import { getAvailableVoices, setPreferredVoice, speak, setGoogleCloudKey, getGoogleCloudVoices } from './AudioFeedback';
import { Settings, Check, Cloud, Key } from 'lucide-react';

const VoiceSelector = () => {
    const [voices, setVoices] = useState([]);
    const [selectedURI, setSelectedURI] = useState(localStorage.getItem('silaba_magica_voice'));
    const [apiKey, setApiKey] = useState(localStorage.getItem('silaba_magica_gcloud_key') || '');
    const [tempKey, setTempKey] = useState(localStorage.getItem('silaba_magica_gcloud_key') || '');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cloudError, setCloudError] = useState(null);

    useEffect(() => {
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, [apiKey]);

    const loadVoices = async () => {
        setLoading(true);
        // 1. Browser Voices
        const browserVoices = getAvailableVoices();

        // 2. Google Cloud Voices (if key is present)
        let cloudVoices = [];
        setCloudError(null);
        if (apiKey) {
            const result = await getGoogleCloudVoices();
            if (result.error) {
                setCloudError(result.error);
            }
            cloudVoices = result.voices;
        }

        // Combine logic
        // Cloud voice object structure needs to act like browser voice (have a name and unique ID)
        const normalizedCloud = cloudVoices.map(v => ({
            name: `${v.name} (${v.ssmlGender})`,
            lang: v.languageCodes[0],
            voiceURI: v.name, // Use name as ID
            isCloud: true
        }));

        setVoices([...normalizedCloud, ...browserVoices]);
        setLoading(false);
    };

    const handleSelect = (voiceURI) => {
        setPreferredVoice(voiceURI);
        setSelectedURI(voiceURI);
        speak('Hola, ¡bienvenido!');
    };

    const handleVerifyKey = () => {
        setApiKey(tempKey);
        setGoogleCloudKey(tempKey);
    };

    return (
        <div className="mt-8 w-full max-w-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center gap-2 w-full bg-white/30 hover:bg-white/50 text-purple-800 font-bold py-3 px-6 rounded-xl transition-colors"
            >
                <Settings className="w-5 h-5" />
                {isOpen ? 'Ocultar Opciones de Voz' : 'Configurar Voz'}
            </button>

            {isOpen && (
                <div className="mt-4 bg-white rounded-xl shadow-xl overflow-hidden p-4">

                    {/* API Key Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Key className="w-4 h-4" /> Google Cloud API Key (Opcional)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                                placeholder="Pega tu API Key aquí"
                                className="flex-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                            />
                            <button
                                onClick={handleVerifyKey}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition-colors"
                            >
                                Validar
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Si tienes una API Key de Google Cloud, pégala aquí para usar voces neuronales de alta calidad.
                        </p>
                        {cloudError && (
                            <p className="text-xs text-red-500 mt-2 p-2 bg-red-50 rounded font-medium">
                                ⚠️ {cloudError}
                            </p>
                        )}
                    </div>

                    <div className="max-h-60 overflow-y-auto border-t pt-2">
                        {loading ? <div className="text-center p-4">Cargando voces...</div> : (
                            voices.map((voice) => (
                                <button
                                    key={voice.voiceURI}
                                    onClick={() => handleSelect(voice.voiceURI)}
                                    className={`
                            w-full text-left px-4 py-3 flex items-center justify-between hover:bg-purple-50 transition-colors border-b last:border-0
                            ${selectedURI === voice.voiceURI ? 'bg-purple-100 text-purple-700 font-bold' : 'text-gray-700'}
                        `}
                                >
                                    <div className="flex items-center gap-2">
                                        {voice.isCloud && <Cloud className="w-4 h-4 text-blue-500" />}
                                        <span className="truncate text-sm">{voice.name}</span>
                                    </div>
                                    {selectedURI === voice.voiceURI && <Check className="w-5 h-5" />}
                                </button>
                            ))
                        )}
                        {voices.length === 0 && !loading && <div className="text-center text-gray-500 p-4">No se encontraron voces.</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceSelector;
