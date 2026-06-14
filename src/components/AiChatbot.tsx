import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, X, Sparkles, Loader2, Bot, ArrowRight, CornerDownLeft, Brain } from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
}

const QUICK_PROMPTS = [
  "How can you boost our Amazon sales?",
  "Can you build a high-conversion Shopify store?",
  "Tell me about Nexloop's methodology.",
  "How to setup corporate license in SPC Sharjah?"
];

const DEFAULT_OPTIONS = [
  "Amazon & Noon Support",
  "Shopify & E-commerce Hub",
  "Paid Brand Ads & Growth",
  "Remote UAE Corporate License",
  "Local UAE Product Sourcing"
];

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Hello! I'm your **Nexloop AI Partner**. Let me help you co-strategize your Amazon & Noon A-to-Z setup, dynamic e-commerce platforms, performance paid marketing campaigns, custom web systems, or registering your UAE corporate licensing.\n\nHow can I help you frame your project growth loop today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [activeOptions, setActiveOptions] = useState<string[]>([]);
  const [showAttentionBubble, setShowAttentionBubble] = useState(false);

  const [activeTab, setActiveTab] = useState<"chat" | "brain">("chat");
  const [learnedInsights, setLearnedInsights] = useState<string[]>([]);
  const [totalAnalyzed, setTotalAnalyzed] = useState<number>(0);
  const [lastInsightUpdate, setLastInsightUpdate] = useState<string>("");
  const [isInsightsLoading, setIsInsightsLoading] = useState<boolean>(false);

  const fetchLearnedKnowledge = async () => {
    setIsInsightsLoading(true);
    try {
      const resp = await fetch("/api/learned-knowledge");
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          setLearnedInsights(data.insights || []);
          setTotalAnalyzed(data.totalQueriesProcessed || 0);
          setLastInsightUpdate(data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : "");
        }
      }
    } catch (err) {
      console.error("Failed to fetch learned insights:", err);
    } finally {
      setIsInsightsLoading(false);
    }
  };

  // Fetch insights initially or when changing to brain tab
  useEffect(() => {
    fetchLearnedKnowledge();
  }, []);

  useEffect(() => {
    if (activeTab === "brain") {
      fetchLearnedKnowledge();
    }
  }, [activeTab]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show attention bubble after some idle time (e.g., 9 seconds) on mount if unopened
  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem("nexloop_bubble_dismissed");
      if (!isOpen && !dismissed && messages.length === 1) {
        setShowAttentionBubble(true);
      }
    }, 9000);

    return () => clearTimeout(timer);
  }, [isOpen, messages.length]);

  // Auto Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Signal attention when the widget is closed but initialized
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasNewMessage(true);
    }
  }, [messages, isOpen]);

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
      setShowAttentionBubble(false);
    }
  };

  const dismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAttentionBubble(false);
    sessionStorage.setItem("nexloop_bubble_dismissed", "true");
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const lowerText = text.toLowerCase();

    // 1. Direct WhatsApp Connector Action
    if (lowerText.includes("whatsapp") || lowerText.includes("واتساب")) {
      window.open("https://wa.me/971528131539", "_blank");
      const userMessage: Message = { role: "user", content: text };
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          role: "model",
          content: "🚀 **Direct Connect Initiated!** I have loaded your secure redirection to our WhatsApp business line. We are also available directly on call at **+971 52 813 1539** or via **business@nexlooplive.com**."
        }
      ]);
      setActiveOptions([
        "✉️ Fill Estimate Form",
        "🔄 Start New Conversation"
      ]);
      setInputValue("");
      return;
    }

    // 2. Smooth Scrolling to Contact / Estimate Form Action
    if (lowerText.includes("estimate form") || lowerText.includes("يقدر") || lowerText.includes("تقدير") || lowerText.includes("النموذج")) {
      const contactSec = document.getElementById("contact");
      if (contactSec) {
        contactSec.scrollIntoView({ behavior: "smooth" });
        setIsOpen(false);
      } else {
        const firstForm = document.querySelector("form");
        if (firstForm) {
          firstForm.scrollIntoView({ behavior: "smooth" });
          setIsOpen(false);
        }
      }
      return;
    }

    // 3. Reset/Start Over Action
    if (lowerText.includes("start new") || lowerText.includes("start over") || lowerText.includes("البدء من جديد") || lowerText.includes("تبدأ من جديد") || lowerText.includes("جديد")) {
      setMessages([
        {
          role: "model",
          content: "Hello! I'm your **Nexloop AI Partner**. Let me help you co-strategize your Amazon & Noon A-to-Z setup, dynamic e-commerce platforms, performance paid marketing campaigns, custom web systems, or registering your UAE corporate licensing.\n\nHow can I help you frame your project growth loop today?"
        }
      ]);
      setActiveOptions([]);
      setInputValue("");
      return;
    }

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        // response body is empty or not JSON
      }

      if (response.ok && data.success && data.reply) {
        setMessages((prev) => [...prev, { role: "model", content: data.reply }]);
        if (data.options && Array.isArray(data.options) && data.options.length > 0) {
          setActiveOptions(data.options);
        } else {
          setActiveOptions([]);
        }
      } else {
        const errorMsg = data.error || `The backend server was unable to complete the request (Status Code: ${response.status}).`;
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: `⚠️ **API Error / Connection Issue**:\n\n${errorMsg}\n\n*If you are the developer, please ensure the **GEMINI_API_KEY** environment variable is declared in your Settings. Otherwise, feel free to contact our humans directly at **business@nexlooplive.com**.*`
          }
        ]);
        setActiveOptions([]);
      }
    } catch (networkErr: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: `⚠️ **Network Connection Failed**:\n\nUnable to reach the server. Please check your active internet connection or reload. You can also reach us natively on WhatsApp at **+971 52 813 1539**.`
        }
      ]);
      setActiveOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-emerald-300">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderMessageContent = (text: string) => {
    return text.split("\n").map((line, idx) => {
      // Check for bullet points
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        return (
          <li key={idx} className="ml-4 list-disc list-outside mb-1 text-sm text-zinc-300">
            {parseBold(line.trim().substring(2))}
          </li>
        );
      }
      // Check for numbered lists
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <li key={idx} className="ml-4 list-decimal list-outside mb-1 text-sm text-zinc-300">
            {parseBold(numMatch[2])}
          </li>
        );
      }
      return (
        <p key={idx} className={`${line.trim() === "" ? "h-2" : "mb-2"} text-sm leading-relaxed text-zinc-200`}>
          {parseBold(line)}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[120] font-sans" id="nexloop-ai-chatbot-widget">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-[92vw] sm:w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-[#0F0F12]/95 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden mb-4"
            id="nexloop-chatbot-panel"
          >
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary-brand/30 flex items-center justify-center relative">
                  <Bot className="w-5 h-5 text-primary-brand" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0F0F12] rounded-full animate-pulse"></span>
                </div>
                <div className="text-left">
                  <h4 className="font-display font-bold text-white text-sm leading-none flex items-center gap-1.5">
                    Nexloop AI Agent
                    <div className="inline-flex items-center gap-0.5 h-2 w-4 ml-1">
                      <span className="w-[2px] h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.8s' }}></span>
                      <span className="w-[2px] h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '0.7s' }}></span>
                      <span className="w-[2px] h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '0.9s' }}></span>
                    </div>
                  </h4>
                  <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mt-1">
                    System Consulting Node
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 px-2.2 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono text-zinc-400">
                  <Sparkles className="w-2.5 h-2.5 text-violet-400 animate-pulse" />
                  Gemini Flash
                </div>
                <button
                  onClick={handleOpenToggle}
                  className="p-1.5 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-white/5 bg-white/[0.01] px-4 py-1.5 gap-2 select-none shrink-0">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "chat"
                    ? "bg-indigo-500/10 border border-indigo-400/20 text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Partner Chat
              </button>
              <button
                onClick={() => {
                  setActiveTab("brain");
                  fetchLearnedKnowledge();
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                  activeTab === "brain"
                    ? "bg-emerald-500/10 border border-emerald-400/20 text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-emerald-400" />
                Dynamic Memory
                {learnedInsights.length > 0 && (
                  <span className="absolute top-1.5 right-6 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                )}
              </button>
            </div>

            {activeTab === "chat" ? (
              <>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                  {messages.map((msg, index) => {
                    const isModel = msg.role === "model";
                    return (
                      <div
                        key={index}
                        className={`flex gap-3 max-w-[85%] ${isModel ? "self-start" : "ml-auto flex-row-reverse"}`}
                      >
                        {isModel && (
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0 select-none">
                            <Sparkles className="w-4 h-4 text-primary-brand" />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl p-3.5 text-left text-sm ${
                            isModel
                              ? "bg-white/5 border border-white/5 text-zinc-200"
                              : "bg-primary-container/85 border border-primary-brand/20 text-white"
                          }`}
                        >
                          {isModel ? renderMessageContent(msg.content) : <p className="leading-relaxed">{msg.content}</p>}
                        </div>
                      </div>
                    );
                  })}

                  {/* Loader */}
                  {isLoading && (
                    <div className="flex gap-3 max-w-[80%] self-start" id="chatbot-reply-loading">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0 animate-spin">
                        <Loader2 className="w-4 h-4 text-primary-brand" />
                      </div>
                      <div className="bg-white/3 border border-white/5 rounded-2xl px-4 py-3 text-zinc-400 text-xs italic flex items-center gap-2">
                        Partner is thinking...
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Dynamic Interactive Option Choices (representing questions or pathways) */}
                {!isLoading && activeOptions && activeOptions.length > 0 && (
                  <div className="px-4 pb-2.5 pt-1.5 animate-fade-in text-left border-t border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block mb-2 font-bold select-none">
                      Choose Response Option:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto scrollbar-thin">
                      {activeOptions.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(option)}
                          className="px-3 py-1.5 bg-indigo-500/10 hover:bg-[#4f46e5]/30 border border-indigo-400/20 hover:border-indigo-400/40 rounded-xl text-xs text-indigo-200 hover:text-white transition-all text-left flex items-center gap-1.5 cursor-pointer max-w-full"
                        >
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0"></span>
                          <span className="truncate">{option}</span>
                          <ArrowRight className="w-3 h-3 text-indigo-300 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend(inputValue);
                  }}
                  className="p-3 bg-[#0F0F12] border-t border-white/5 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask our AI Partner anything..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary-brand/50 font-sans"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      inputValue.trim() && !isLoading
                        ? "bg-primary-container text-white hover:scale-105 active:scale-95"
                        : "bg-white/5 text-zinc-600 border border-white/5 cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Cognitive Memory panel */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10 text-left">
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">
                        Self-Learning Engine: Active
                      </span>
                    </div>
                    <h5 className="text-white text-sm font-semibold mb-1">Nexloop Business Cortex</h5>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Every prompt and inquiry from business clients is analyzed. The engine dynamically summarizes these real-world queries to enrich our persistent knowledge cache, formulating advanced strategy models.
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
                      Dynamic Strategic Lessons ({learnedInsights.length})
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                      Inquiries Ingested: {totalAnalyzed}
                    </span>
                  </div>

                  {isInsightsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                      <span className="text-xs text-zinc-500 font-mono">Syncing cognitive core...</span>
                    </div>
                  ) : learnedInsights.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 text-xs font-sans">
                      Our database has initialized. Ask specific questions in chat to trigger autonomous lessons synthesis!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {learnedInsights.map((insight, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-emerald-500/20 transition-all flex gap-3 group"
                        >
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-zinc-300 text-xs leading-relaxed font-sans">
                              {insight}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-center">
                    <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                      Memory caching is persistent server-side. Insights loaded above directly instruct other visitors' sessions.
                    </p>
                  </div>
                </div>

                {/* Return button */}
                <div className="p-3 bg-[#0F0F12] border-t border-white/5 text-center">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Resume Consulting Chat
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {!isOpen && showAttentionBubble && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 250 }}
            onClick={() => {
              setIsOpen(true);
              setShowAttentionBubble(false);
            }}
            className="absolute bottom-20 right-0 w-[280px] sm:w-[320px] bg-[#0F0F12]/95 border border-indigo-500/30 hover:border-indigo-400/50 shadow-2xl rounded-2xl p-4 cursor-pointer backdrop-blur-md select-none text-left z-[110] mb-2"
          >
            {/* Close Button */}
            <button
              onClick={dismissBubble}
              className="absolute top-2.5 right-2.5 p-1 text-zinc-500 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              aria-label="Dismiss chat prompt"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex gap-2.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4.5 h-4.5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold mb-0.5">
                  Partner Consultant
                </p>
                <p className="text-zinc-300 text-xs leading-relaxed font-sans">
                  👋 Hi! Let's co-strategize your <span className="font-semibold text-white">Amazon & Noon launch</span>, <span className="font-semibold text-white">Shopify shop</span>, <span className="font-semibold text-white">Paid Ads</span>, <span className="font-semibold text-white">UAE Licensing</span>, <span className="font-semibold text-white">Sourcing</span>, or <span className="font-semibold text-white">custom Web systems</span>. <span className="font-bold text-indigo-300">How can I help you today?</span>
                </p>
              </div>
            </div>

            {/* Micro speech bubble pointer tail */}
            <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-[#0F0F12] border-r border-b border-indigo-500/30 rotate-45 transform"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing Floating Toggle Button with realistic floating & pulse animations */}
      <motion.button
        onClick={handleOpenToggle}
        animate={isOpen ? { scale: 1 } : { 
          y: [0, -6, 0],
          scale: [1, 1.02, 1]
        }}
        transition={isOpen ? {} : {
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
        whileHover={{ scale: 1.08, shadow: "0 20px 30px rgba(0, 102, 255, 0.4)" }}
        whileTap={{ scale: 0.92 }}
        className="w-16 h-16 bg-gradient-to-tr from-[#0066ff] via-[#4f46e5] to-[#06b6d4] rounded-full flex items-center justify-center text-white shadow-2xl border border-white/20 cursor-pointer relative group z-[130]"
        id="chatbot-trigger-fab"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
            >
              <X className="w-6.5 h-6.5 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
              className="relative flex items-center justify-center"
            >
              <Bot className="w-7 h-7 text-white stroke-[2.2] drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] group-hover:rotate-6 transition-transform duration-300" />
              {hasNewMessage && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#0A0A0A] flex items-center justify-center text-[8px] font-bold text-white shadow-lg animate-bounce">
                  !
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Realistic Multi-layered Concentric Pulse Halos (only active when chatbot is closed) */}
        {!isOpen && (
          <>
            <span className="absolute -inset-1.5 bg-gradient-to-r from-[#0066ff]/40 to-indigo-500/40 rounded-full -z-10 blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300"></span>
            
            {/* Pulsing ring 1 */}
            <span className="absolute -inset-4 bg-[#0066ff]/20 rounded-full -z-20 animate-ping opacity-60 pointer-events-none" style={{ animationDuration: '3s' }}></span>
            
            {/* Pulsing ring 2 */}
            <span className="absolute -inset-8 bg-indigo-500/10 rounded-full -z-30 animate-pulse opacity-40 pointer-events-none" style={{ animationDuration: '4s' }}></span>
          </>
        )}
      </motion.button>
    </div>
  );
}
