"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Script from "next/script";
import {
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Star,
  History as HistoryIcon,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { HistoryEntry, getHistory, addEntry, deleteEntry, clearHistory, togglePin, getDisplayHistory } from "@/lib/history";
import { generateText, LoremMode } from "@/lib/lorem";

const firebaseConfig = {
  apiKey: "AIzaSyBTFYW79t3Hd8ldCfc6tw6VFG34FjsjGgU",
  authDomain: "freeq-one.firebaseapp.com",
  projectId: "freeq-one",
  storageBucket: "freeq-one.firebasestorage.app",
  messagingSenderId: "905128076747",
  appId: "1:905128076747:web:5c7e293432301f611b824e",
  measurementId: "G-DT3XNM6TPG",
};

const app = initializeApp(firebaseConfig);
export { app };

const MODE_STORAGE_KEY = "lorem-mode";
const COUNT_STORAGE_KEY = "lorem-count";

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export default function Home() {
  const [mode, setMode] = useState<LoremMode>(() => {
    if (typeof window !== "undefined") {
      try {
        return (localStorage.getItem(MODE_STORAGE_KEY) as LoremMode) || "paragraphs";
      } catch {
        return "paragraphs";
      }
    }
    return "paragraphs";
  });
  const [count, setCount] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(COUNT_STORAGE_KEY);
        return saved ? parseInt(saved, 10) : 5;
      } catch {
        return 5;
      }
    }
    return 5;
  });
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return getHistory();
      } catch {
        return [];
      }
    }
    return [];
  });
  const lastRecordedRef = useRef<string>("");

  useEffect(() => {
    getAnalytics(app);
  }, []);

  const persistMode = useCallback((m: LoremMode) => {
    setMode(m);
    try {
      localStorage.setItem(MODE_STORAGE_KEY, m);
    } catch {
      // storage full
    }
  }, []);

  const persistCount = useCallback((val: number) => {
    setCount(val);
    try {
      localStorage.setItem(COUNT_STORAGE_KEY, String(val));
    } catch {
      // storage full
    }
  }, []);

  const limits = useMemo((): { min: number; max: number } => {
    switch (mode) {
      case "paragraphs": return { min: 1, max: 20 };
      case "words": return { min: 1, max: 9999 };
      case "bytes": return { min: 1, max: 100000 };
    }
  }, [mode]);

  const handleGenerate = useCallback(() => {
    const text = generateText(mode, count);
    setOutput(text);
  }, [mode, count]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }, [output]);

  const handleCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      persistCount(clamp(val, limits.min, limits.max));
    }
  }, [persistCount, limits]);

  const handleCountStep = useCallback((delta: number) => {
    persistCount(clamp(count + delta, limits.min, limits.max));
  }, [count, persistCount, limits]);

  const outputSize = useMemo(() => {
    if (!output) return 0;
    return new TextEncoder().encode(output).length;
  }, [output]);

  const outputWords = useMemo(() => {
    if (!output) return 0;
    return output.split(/\s+/).filter(Boolean).length;
  }, [output]);

  useEffect(() => {
    if (output) {
      const key = `${mode}::${count}::${output.slice(0, 40)}`;
      if (key !== lastRecordedRef.current) {
        lastRecordedRef.current = key;
        const label = `${count} ${mode} — ${output.slice(0, 40)}`;
        const updated = addEntry(label, mode, output);
        setHistory(updated);
      }
    }
  }, [output, mode, count]);

  const displayHistory = useMemo(() => getDisplayHistory(), [history]);

  const handleHistoryLoad = useCallback((entry: HistoryEntry) => {
    setOutput(entry.output);
    const match = entry.input.match(/^(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num)) {
        persistCount(clamp(num, limits.min, limits.max));
      }
    }
    persistMode(entry.mode);
    lastRecordedRef.current = `${entry.mode}::${entry.input.slice(0, 40)}`;
  }, [persistMode, persistCount, limits]);

  const handleHistoryTogglePin = useCallback((id: string) => {
    const result = togglePin(id);
    setHistory(result.entries);
    if (result.limitReached) {
      toast.warning("Maximum 10 pinned items");
    }
  }, []);

  const handleHistoryDelete = useCallback((id: string) => {
    const updated = deleteEntry(id);
    setHistory(updated);
  }, []);

  const handleHistoryClear = useCallback(() => {
    const updated = clearHistory();
    setHistory(updated);
    toast.success("History cleared");
  }, []);

  function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }

  function truncate(str: string, len: number): string {
    if (str.length <= len) return str;
    return str.slice(0, len) + "...";
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">
          Lorem Ipsum Generator
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">
          Generate placeholder text by paragraphs, words, or bytes
        </p>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => persistMode("paragraphs")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "paragraphs"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Paragraphs
            </button>
            <button
              onClick={() => persistMode("words")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "words"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Words
            </button>
            <button
              onClick={() => persistMode("bytes")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "bytes"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Bytes
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Controls */}
          <div className="space-y-4 bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Options
            </h2>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCountStep(-1)}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={count}
                  onChange={handleCountChange}
                  min={limits.min}
                  max={limits.max}
                  className="w-20 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleCountStep(1)}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  +
                </button>
              </div>

              <span className="text-sm text-gray-400">
                {mode === "paragraphs" && "paragraphs"}
                {mode === "words" && "words"}
                {mode === "bytes" && "bytes"}
              </span>

              <span className="text-xs text-gray-500">
                {limits.min}–{limits.max}
              </span>

              <button
                onClick={handleGenerate}
                className="ml-auto flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white transition-colors"
              >
                <RefreshCw size={14} />
                Generate
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                value={count}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    persistCount(val);
                  }
                }}
                min={limits.min}
                max={limits.max}
                className="flex-1 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-sm text-blue-400 font-mono w-16 text-right">
                {count.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Generated Text
              </h2>
              {output && (
                <span className="inline-flex items-center px-2 py-0.5 bg-green-900/50 text-green-400 text-xs font-medium rounded-full border border-green-800">
                  Ready
                </span>
              )}
            </div>

            <div className="min-h-[200px] bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              {!output ? (
                <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
                  Configure options and generate
                </div>
              ) : (
                <div className="p-4 overflow-auto max-h-[500px]">
                  <pre className="text-sm text-gray-300 font-sans whitespace-pre-wrap break-words leading-relaxed">
                    {output}
                  </pre>
                </div>
              )}
            </div>

            {output && (
              <>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-700 hover:bg-green-600 rounded-lg text-xs text-gray-300 transition-colors"
                  >
                    {copied ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                    Copy
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white transition-colors"
                  >
                    <RefreshCw size={14} />
                    Regenerate
                  </button>
                </div>

                <div className="flex gap-4 text-xs text-gray-500">
                  <span>{outputWords.toLocaleString()} words</span>
                  <span>{outputSize.toLocaleString()} bytes</span>
                </div>
              </>
            )}

            {/* History Panel */}
            <div className="space-y-2 mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HistoryIcon size={14} />
                  History
                </h2>
                {displayHistory.length > 0 && (
                  <button
                    onClick={handleHistoryClear}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-colors"
                  >
                    <Trash2 size={12} />
                    Clear All
                  </button>
                )}
              </div>

              {displayHistory.length === 0 ? (
                <div className="text-gray-500 text-sm text-center py-8">
                  No history yet
                </div>
              ) : (
                <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
                  {displayHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="group flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => handleHistoryLoad(entry)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHistoryTogglePin(entry.id);
                        }}
                        className="shrink-0 p-0.5 transition-colors"
                        title={entry.pinned ? "Unpin" : "Pin"}
                      >
                        <Star
                          size={14}
                          className={entry.pinned ? "text-yellow-400 fill-yellow-400" : "text-gray-500 hover:text-gray-300"}
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-medium px-1 py-0.5 rounded bg-purple-900/50 text-purple-300">
                            {entry.mode === "paragraphs" ? "PAR" : entry.mode === "words" ? "WRD" : "BYT"}
                          </span>
                          <span className="text-[10px] text-gray-500 truncate">
                            {truncate(entry.input, 48)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={10} className="text-gray-600" />
                          <span className="text-[10px] text-gray-600">{timeAgo(entry.timestamp)}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHistoryDelete(entry.id);
                        }}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600/30 rounded transition-all text-gray-500 hover:text-red-400 shrink-0"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>
            Generate placeholder text instantly. Part of the{" "}
            <a
              href="https://freeq.one"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              freeq.one
            </a>{" "}
            tools suite.
          </p>
        </div>
      </div>

      <ContentSection />

      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=AW-971442831"
        strategy="afterInteractive"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'AW-971442831');
        gtag('event', 'conversion', {
            'send_to': 'AW-971442831/vGudCLGrjq4cEI-VnM8D',
            'value': 1.0,
            'currency': 'CAD'
        });
      `,
        }}
      />
    </main>
  );
}

function ContentSection() {
  return (
    <section className="max-w-3xl mx-auto mt-16 space-y-8 text-gray-300 text-sm leading-relaxed">
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">About This Tool</h2>
        <p>Generate placeholder text for your designs, layouts, and mockups. Choose between paragraphs, words, or exact byte counts to fit your needs.</p>
        <h3 className="text-base font-semibold text-white">Common Use Cases</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Filling content layouts during website and app design</li>
          <li>Creating mockups for client presentations and approvals</li>
          <li>Testing typography, spacing, and responsive layouts</li>
        </ul>
        <h3 className="text-base font-semibold text-white">Pro Tips</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Generate by paragraphs for long-form layout testing</li>
          <li>Use the words mode for small placeholders like buttons and labels</li>
          <li>Try meaningful variations for more realistic client mockups</li>
        </ul>
        <p className="text-gray-400 text-xs mt-4">
          Also check out the <a href="https://words.freeq.one" className="text-blue-400 hover:underline">Word Counter</a> for text statistics. Part of the <a href="https://freeq.one" className="text-blue-400 hover:underline">FreeQ.One</a> tools suite.
        </p>
      </div>
    </section>
  )
}
