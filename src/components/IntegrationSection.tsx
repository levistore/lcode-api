"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Check, Copy } from "lucide-react";

type Language = "curl" | "js" | "python" | "go" | "php";

const languages = [
  { id: "curl", label: "cURL" },
  { id: "js", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "php", label: "PHP" },
];

const codeSnippets: Record<Language, string> = {
  curl: `curl -X GET "https://api.lcode.dev/v1/download/tiktok?url=https://tiktok.com/..." \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  js: `const response = await fetch("https://api.lcode.dev/v1/download/tiktok?url=...", {
  headers: {
    "Authorization": "Bearer YOUR_API_KEY"
  }
});

const data = await response.json();
console.log(data);`,
  python: `import requests

url = "https://api.lcode.dev/v1/download/tiktok"
params = {"url": "https://tiktok.com/..."}
headers = {"Authorization": "Bearer YOUR_API_KEY"}

response = requests.get(url, headers=headers, params=params)
print(response.json())`,
  go: `package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	req, _ := http.NewRequest("GET", "https://api.lcode.dev/v1/download/tiktok?url=...", nil)
	req.Header.Add("Authorization", "Bearer YOUR_API_KEY")

	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}`,
  php: `<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.lcode.dev/v1/download/tiktok?url=...",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer YOUR_API_KEY"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`,
};

export default function IntegrationSection() {
  const [activeLang, setActiveLang] = useState<Language>("curl");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[350px] bg-accent/3 rounded-full blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left info */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-accent font-display">
              Integration
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary font-display leading-[1.1]">
              Integrate in <br />
              Any Language
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed">
              Integrasikan endpoint Lcode API ke dalam stack teknologi apa pun dengan pustaka klien standar. Cukup panggil HTTP requests dan mulailah menerima data terstruktur dalam hitungan milidetik.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setActiveLang(lang.id as Language)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeLang === lang.id
                      ? "bg-accent/15 border-accent text-accent"
                      : "bg-white/[0.02] border-white/5 text-text-secondary hover:text-text-primary hover:border-white/10"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right code block */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-1.5 text-xs text-text-secondary font-mono">
                  <Code className="w-4 h-4 text-accent" />
                  <span>Request Example</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-success" />
                      <span className="text-success font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code */}
              <div className="p-5 font-mono text-xs sm:text-sm text-text-primary leading-relaxed overflow-x-auto min-h-[220px]">
                <AnimatePresence mode="wait">
                  <motion.pre
                    key={activeLang}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="bg-transparent"
                  >
                    <code>{codeSnippets[activeLang]}</code>
                  </motion.pre>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
