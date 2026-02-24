import React, { useState, useEffect, useRef } from "react";

const Translator = () => {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [srcLang, setSrcLang] = useState("eng_Latn");
  const [tgtLang, setTgtLang] = useState("hin_Deva");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [srcSearch, setSrcSearch] = useState("");
  const [tgtSearch, setTgtSearch] = useState("");
  const [srcDropdownOpen, setSrcDropdownOpen] = useState(false);
  const [tgtDropdownOpen, setTgtDropdownOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const srcDropdownRef = useRef(null);
  const tgtDropdownRef = useRef(null);
  const detectionTimeoutRef = useRef(null);

  // Fetch Languages
  const fetchLanguages = async () => {
    try {
      const res = await fetch("http://localhost:5000/languages");
      const data = await res.json();
      setLanguages(data);
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  };

  // Fetch History
  const fetchHistory = async () => {
    const res = await fetch("http://localhost:5000/history");
    const data = await res.json();
    setHistory(data);
  };

  useEffect(() => {
    fetchLanguages();
    fetchHistory();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (srcDropdownRef.current && !srcDropdownRef.current.contains(event.target)) {
        setSrcDropdownOpen(false);
      }
      if (tgtDropdownRef.current && !tgtDropdownRef.current.contains(event.target)) {
        setTgtDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter languages based on search
  const filteredSrcLangs = languages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(srcSearch.toLowerCase()) ||
      lang.code.toLowerCase().includes(srcSearch.toLowerCase())
  );

  const filteredTgtLangs = languages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(tgtSearch.toLowerCase()) ||
      lang.code.toLowerCase().includes(tgtSearch.toLowerCase())
  );

  // Detect language with debouncing
  const detectLanguageFromText = async (inputText) => {
    if (!inputText || inputText.length < 3) return;
    
    setDetecting(true);
    try {
      const res = await fetch("http://localhost:5000/detect-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (data.detected_language) {
        setSrcLang(data.detected_language);
      }
    } catch (error) {
      console.error("Error detecting language:", error);
    } finally {
      setDetecting(false);
    }
  };

  // Handle text change with debounced language detection
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Debounce language detection
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }
    detectionTimeoutRef.current = setTimeout(() => {
      detectLanguageFromText(newText);
    }, 500);
  };

  // Translate
  const handleTranslate = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:5000/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        src_lang: srcLang,
        tgt_lang: tgtLang,
      }),
    });

    const data = await res.json();
    setTranslatedText(data.translated_text);
    setLoading(false);
    fetchHistory();
  };

  // 🎤 Speech Recognition
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      setText(event.results[0][0].transcript);
    };
  };

  // Get language name by code
  const getLanguageName = (code) => {
    const lang = languages.find((l) => l.code === code);
    return lang ? lang.name : code;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">
          AI Language Translator
        </h1>

        <textarea
          className="w-full p-3 border rounded mb-3"
          rows="4"
          placeholder="Enter text... (language will be detected automatically)"
          value={text}
          onChange={handleTextChange}
        />

        <div className="flex gap-4 mb-4">
          {/* Source Language Dropdown */}
          <div className="relative flex-1" ref={srcDropdownRef}>
            <input
              type="text"
              placeholder="Search source language..."
              value={srcSearch}
              onChange={(e) => setSrcSearch(e.target.value)}
              onFocus={() => setSrcDropdownOpen(true)}
              className="w-full border p-2 rounded"
            />
            {srcDropdownOpen && (
              <div className="absolute top-full left-0 right-0 border rounded mt-1 bg-white shadow-lg max-h-64 overflow-y-auto z-10">
                {filteredSrcLangs.map((lang) => (
                  <div
                    key={lang.code}
                    onClick={() => {
                      setSrcLang(lang.code);
                      setSrcSearch("");
                      setSrcDropdownOpen(false);
                    }}
                    className="p-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {lang.name} ({lang.code})
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Selected: {getLanguageName(srcLang)} {detecting && <span className="text-blue-500">(detecting...)</span>}
            </div>
          </div>

          {/* Target Language Dropdown */}
          <div className="relative flex-1" ref={tgtDropdownRef}>
            <input
              type="text"
              placeholder="Search target language..."
              value={tgtSearch}
              onChange={(e) => setTgtSearch(e.target.value)}
              onFocus={() => setTgtDropdownOpen(true)}
              className="w-full border p-2 rounded"
            />
            {tgtDropdownOpen && (
              <div className="absolute top-full left-0 right-0 border rounded mt-1 bg-white shadow-lg max-h-64 overflow-y-auto z-10">
                {filteredTgtLangs.map((lang) => (
                  <div
                    key={lang.code}
                    onClick={() => {
                      setTgtLang(lang.code);
                      setTgtSearch("");
                      setTgtDropdownOpen(false);
                    }}
                    className="p-2 hover:bg-green-100 cursor-pointer"
                  >
                    {lang.name} ({lang.code})
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Selected: {getLanguageName(tgtLang)}
            </div>
          </div>

          <button
            onClick={startListening}
            className="bg-blue-500 text-white px-4 rounded"
          >
            🎤 Speak
          </button>
        </div>

        <button
          onClick={handleTranslate}
          className="bg-green-600 text-white px-6 py-2 rounded w-full"
        >
          {loading ? "Translating..." : "Translate"}
        </button>

        <textarea
          className="w-full p-3 border rounded mt-4"
          rows="4"
          value={translatedText}
          readOnly
        />

        {/* History Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">
            Translation History
          </h2>
          <div className="max-h-60 overflow-y-auto">
            {history.map((item, index) => (
              <div
                key={index}
                className="border p-3 rounded mb-2 bg-gray-50"
              >
                <p><strong>Input:</strong> {item.text}</p>
                <p><strong>Output:</strong> {item.translated_text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Translator;