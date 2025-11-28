'use client'; // Required for interactivity (useState)

import React, { useState } from 'react';
// Import the dictionary directly
import biasDictionary from '../data/bias_dictionary.json';

// Define the shape of our dictionary items
interface BiasItem {
  term: string;
  category: string;
  severity: string;
  suggestion: string;
  explanation: string;
}

// Define the shape of a found match
interface AnalysisResult extends BiasItem {
  count: number;
}

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);

  // The Core Logic Engine
  const handleAnalyze = () => {
    if (!inputText.trim()) return;

    const foundMatches: AnalysisResult[] = [];
    const lowerCaseText = inputText.toLowerCase();

    // 1. Scan text against the dictionary
    biasDictionary.forEach((item) => {
      // Create a regex for whole word matching (prevents "male" matching inside "female")
      const regex = new RegExp(`\\b${item.term}\\b`, 'gi');
      const matchCount = (lowerCaseText.match(regex) || []).length;

      if (matchCount > 0) {
        foundMatches.push({ ...item, count: matchCount });
      }
    });

    // 2. Sort results by severity (Critical first)
    foundMatches.sort((a, b) => {
      const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return (
        (severityOrder[b.severity as keyof typeof severityOrder] || 0) -
        (severityOrder[a.severity as keyof typeof severityOrder] || 0)
      );
    });

    setResults(foundMatches);
    setIsAnalyzed(true);
  };

  const handleReset = () => {
    setIsAnalyzed(false);
    setResults([]);
  };

  // Helper to render text with highlights
  const renderHighlightedText = () => {
    if (!inputText) return null;

    let parts = [inputText];
    
    // Break the text apart based on found words
    results.forEach((result) => {
      const newParts: any[] = [];
      parts.forEach((part) => {
        if (typeof part === 'string') {
          // Split this string segment by the bias term (case insensitive)
          const regex = new RegExp(`(\\b${result.term}\\b)`, 'gi');
          const split = part.split(regex);
          
          // Map the split array: if it matches the term, wrap it in a span
          split.forEach((s) => {
            if (s.toLowerCase() === result.term.toLowerCase()) {
              newParts.push(
                <span 
                  key={Math.random()} 
                  className={`
                    px-1 rounded cursor-help border-b-2 font-semibold
                    ${result.severity === 'critical' ? 'bg-red-100 border-red-500 text-red-800' : ''}
                    ${result.severity === 'high' ? 'bg-orange-100 border-orange-500 text-orange-800' : ''}
                    ${result.severity === 'medium' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' : ''}
                    ${result.severity === 'low' ? 'bg-blue-100 border-blue-500 text-blue-800' : ''}
                  `}
                  title={`${result.category}: ${result.explanation}`}
                >
                  {s}
                </span>
              );
            } else {
              newParts.push(s);
            }
          });
        } else {
          // It's already a React element (highlight), keep it
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return (
      <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-700">
        {parts}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Decorative background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50 to-transparent opacity-50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <header className="mb-10 text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium uppercase tracking-wide">
             <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Client-Side Only • 100% Private
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Job Description <span className="text-indigo-600">Bias Decoder</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            Paste your job description below to identify subtle gender, age, and ableist biases. 
            Ensure your hiring language includes everyone.
          </p>
        </header>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[75vh] min-h-[600px]">
          
          {/* Left Column: Input / Highlight Area */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <div className={`
              bg-white rounded-2xl shadow-xl border overflow-hidden flex flex-col h-full transition-all duration-300
              ${isAnalyzed ? 'border-indigo-200 shadow-indigo-500/10' : 'border-slate-200 shadow-slate-200/50'}
            `}>
              
              {/* Card Header */}
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  {isAnalyzed ? (
                     <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M2 12h10"></path><path d="M9 4v16"></path><path d="m3 9 3 3-3 3"></path><path d="M14 8V7c0-1.1.9-2 2-2h6"></path><path d="M14 12v4.72c0 .53.21 1.04.58 1.41l3.7 3.7c.38.38 1.4.15 1.56-.43l.61-2.43 1.14-4.57a2 2 0 0 0-2-2"></path></svg>
                      Decoded Text
                     </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      Input Text
                    </>
                  )}
                </label>
                {isAnalyzed && (
                   <button 
                     onClick={handleReset}
                     className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline decoration-indigo-300"
                   >
                     Edit Original Text
                   </button>
                )}
              </div>

              {/* Content Area */}
              <div className="flex-1 relative overflow-auto">
                {isAnalyzed ? (
                  <div className="p-6 h-full overflow-y-auto">
                    {renderHighlightedText()}
                  </div>
                ) : (
                  <textarea
                    id="jd-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full h-full p-6 bg-white focus:bg-slate-50/50 outline-none resize-none transition-colors font-mono text-sm text-slate-700 leading-relaxed placeholder:text-slate-300"
                    placeholder="Paste your job description here (Ctrl+V)..."
                    maxLength={5000}
                    spellCheck={false}
                  />
                )}
              </div>

              {/* Action Bar */}
              {!isAnalyzed && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-xs text-slate-400 hidden sm:block">
                    Analysis runs locally. No data leaves your browser.
                  </p>
                  <button 
                    onClick={handleAnalyze}
                    disabled={!inputText.trim()}
                    className="ml-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center gap-2 active:scale-95"
                  >
                    <span>Analyze Text</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results Sidebar */}
          <div className="lg:col-span-5 h-full">
            <div className="bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-800 overflow-hidden flex flex-col h-full">
              
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Analysis Report
                </h2>
                {isAnalyzed && (
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-full border border-indigo-500/30">
                    {results.length} Issues Found
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!isAnalyzed ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 ring-4 ring-slate-800/50">
                      <span className="text-3xl">✨</span>
                    </div>
                    <h3 className="text-slate-200 font-medium mb-2">Ready to Decode</h3>
                    <p className="text-sm max-w-xs mx-auto text-slate-500">
                      Paste your text on the left and hit Analyze to see potential biases and suggested alternatives.
                    </p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                     <div className="w-16 h-16 bg-green-900/30 text-green-400 rounded-full flex items-center justify-center mb-4 ring-4 ring-green-900/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h3 className="text-white font-medium mb-2">No Biases Detected!</h3>
                    <p className="text-sm text-slate-400">Great job! We didn't find any flagged terms in our dictionary.</p>
                  </div>
                ) : (
                  // Result Cards
                  results.map((result, index) => (
                    <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`
                            text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mr-2
                            ${result.severity === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : ''}
                            ${result.severity === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : ''}
                            ${result.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : ''}
                            ${result.severity === 'low' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : ''}
                          `}>
                            {result.severity}
                          </span>
                          <span className="text-indigo-300 font-mono text-sm">"{result.term}"</span>
                        </div>
                        <span className="text-xs text-slate-500">{result.category}</span>
                      </div>
                      
                      <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                        {result.explanation}
                      </p>

                      <div className="bg-slate-900/50 rounded p-2 border border-slate-800 flex items-center gap-2">
                        <span className="text-green-400 text-xs font-bold uppercase">Try:</span>
                        <span className="text-slate-200 text-sm">{result.suggestion}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}