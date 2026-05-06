import React, { useState, useEffect, useRef, FormEvent } from "react";
import { Bot, User, RotateCcw, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Define Local Message Interface
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface FloatingChatWidgetProps {
  onDirectConsult: () => void;
}

const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  onDirectConsult,
}) => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Inisialisasi messages dari LocalStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ikadi_chat_history");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "initial",
              role: "assistant",
              content:
                "Assalamu'alaikum! Ada yang bisa saya bantu terkait masalah syariah hari ini?",
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ];
    }
    return [];
  });

  // 2. Simpan otomatis ke LocalStorage setiap ada perubahan pesan
  useEffect(() => {
    localStorage.setItem("ikadi_chat_history", JSON.stringify(messages));
  }, [messages]);

  // 3. Auto-scroll ke pesan terbaru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isSending]);

  // 4. Logic Tooltip pembuka
  useEffect(() => {
    const showTimer = setTimeout(() => setShowTooltip(true), 2000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 8000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const clearChat = () => {
    const initial = [messages[0]];
    setMessages(initial);
    localStorage.removeItem("ikadi_chat_history");
  };

  const handleSubmitChat = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim() || isSending) return;

    const userText = chatMessage;
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: userText,
        timestamp: currentTime,
      },
    ]);
    setChatMessage("");
    setIsSending(true);

    try {
      const response = await fetch(
        "https://ikadi-jatim-production.up.railway.app/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userText }),
        },
      );

      if (!response.ok) throw new Error("Gagal terhubung ke Server RAG");

      const resData = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: resData.answer,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: "error",
          role: "assistant",
          content:
            "Mohon maaf, terjadi gangguan koneksi ke server. Silakan coba lagi nanti.",
          timestamp: "Error",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <aside className="fixed bottom-12 md:bottom-5 right-5 z-[100] font-sans">
      {isChatOpen ? (
        <div className="bg-white dark:bg-emerald-950 w-[380px] md:w-[440px] h-[650px] shadow-[0_20px_50px_rgba(6,78,59,0.2)] rounded-3xl border border-emerald-100 dark:border-emerald-800/50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <header className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white relative shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg leading-tight tracking-tight">
                    Konsultasi Syariah AI
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 bg-emerald-300 rounded-full animate-pulse"></span>
                    <span className="text-[11px] font-medium text-emerald-100 uppercase tracking-wider">
                      AI Assistance
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors group"
                  title="Bersihkan Percakapan"
                >
                  <RotateCcw className="h-4 w-4 text-emerald-100 group-hover:rotate-[-45deg] transition-transform" />
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
                >
                  <span className="text-xl text-emerald-50">✕</span>
                </button>
              </div>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 p-6 overflow-y-auto bg-emerald-50/30 dark:bg-emerald-900/10 space-y-6 custom-scrollbar scroll-smooth"
          >
            {messages.map((msg, index) => (
              <div key={msg.id} className="space-y-4">
                <div
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} group animate-in fade-in slide-in-from-bottom-2 duration-500`}
                >
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    {msg.role === "assistant" ? (
                      <>
                        <div className="h-5 w-5 rounded shadow-sm bg-emerald-600 flex items-center justify-center text-[7px] font-bold text-white">
                          <Bot className="h-3 w-3" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-tighter">
                          AI Assistant
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-tighter">
                          Anda
                        </span>
                        <User className="h-3 w-3 text-emerald-600" />
                      </>
                    )}
                  </div>

                  <div
                    className={`p-4 shadow-sm text-[13.5px] leading-relaxed transition-all duration-300 ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-2xl rounded-tr-sm"
                        : "bg-white dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border border-emerald-100 dark:border-emerald-800 rounded-2xl rounded-tl-sm shadow-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert prose-emerald max-w-none prose-p:leading-relaxed prose-p:mb-3 last:prose-p:mb-0 prose-ul:list-disc prose-ul:ml-4 prose-ul:mb-3 prose-ol:list-decimal prose-ol:ml-4 prose-ol:mb-3 prose-strong:text-emerald-700 dark:prose-strong:text-emerald-400 prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:font-bold prose-a:underline underline-offset-2 hover:prose-a:no-underline">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => (
                              <button
                                onClick={() => {
                                  if (href?.startsWith("/")) {
                                    setIsChatOpen(false);
                                    navigate(href);
                                  } else {
                                    window.open(
                                      href,
                                      "_blank",
                                      "noopener,noreferrer",
                                    );
                                  }
                                }}
                                className="text-emerald-600 dark:text-emerald-400 font-bold underline underline-offset-2"
                              >
                                {children}
                              </button>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                    <div
                      className={`text-[9px] mt-2 font-medium opacity-60 ${msg.role === "user" ? "text-emerald-50 text-right" : "text-emerald-800 dark:text-emerald-400 text-left"}`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>

                {msg.role === "assistant" &&
                  index === messages.length - 1 &&
                  (msg.content.toLowerCase().includes("admin ikadi") ||
                    msg.content.toLowerCase().includes("ustadz ikadi")) && (
                    <div className="flex flex-col items-start gap-3 animate-in fade-in slide-in-from-left-4 duration-700 ml-1">
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold px-1">
                        Belum menemukan jawaban?
                      </p>
                      <button
                        onClick={() => {
                          onDirectConsult();
                          setIsChatOpen(false);
                        }}
                        className="relative px-6 py-3 rounded-2xl text-[12px] font-extrabold text-white bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                      >
                        Tanya Ustadz (Langsung)
                      </button>
                    </div>
                  )}
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                </div>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 italic font-medium">
                  Ustadz sedang mengetik...
                </span>
              </div>
            )}
          </div>

          <footer className="p-5 bg-white dark:bg-emerald-950 border-t border-emerald-100 dark:border-emerald-900">
            <div className="relative group">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  (e.preventDefault(), handleSubmitChat())
                }
                placeholder="Tanyakan masalah syariah..."
                disabled={isSending}
                className="w-full bg-emerald-50/50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-4 pr-14 text-[13.5px] transition-all resize-none min-h-[90px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none disabled:opacity-50 text-emerald-950 dark:text-emerald-50"
              />
              <Button
                onClick={() => handleSubmitChat()}
                disabled={isSending || !chatMessage.trim()}
                size="icon"
                className="absolute bottom-3 right-3 h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg transition-all active:scale-95"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-3 text-[11px] text-emerald-600 dark:text-emerald-400 italic font-medium text-center">
              AI Assistant kami menggunakan teknologi <strong>RAG</strong>{" "}
              (Retrieval-Augmented Generation) untuk memberikan jawaban yang
              lebih akurat dan relevan berdasarkan data syariah terkini.
            </div>
          </footer>
        </div>
      ) : (
        <div className="relative">
          <div
            className={`absolute bottom-[120%] right-0 mb-3 whitespace-nowrap px-5 py-3 bg-emerald-900 text-white text-[12px] leading-relaxed rounded-2xl shadow-[0_10px_25px_rgba(6,78,59,0.3)] transition-all duration-500 transform origin-bottom-right border border-emerald-800/50 ${showTooltip ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-4"}`}
          >
            <p className="font-extrabold text-emerald-300 mb-0.5 tracking-tight">
              Konsultasi Syariah AI!
            </p>
            <p className="font-medium opacity-90">
              Klik untuk bertanya langsung
              <br /> Kepada Robot Virtual kami.
            </p>
            <div className="absolute top-full right-8 -translate-y-1/2 rotate-45 h-2.5 w-2.5 bg-emerald-900 border-r border-b border-emerald-800/50"></div>
          </div>

          <Button
            onClick={() => setIsChatOpen(true)}
            size="lg"
            className="relative rounded-full h-16 w-16 md:h-20 md:w-20 shadow-[0_20px_40px_rgba(5,150,105,0.4)] bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 transition-all duration-500 hover:scale-110 active:scale-95 flex items-center justify-center p-0 border-4 border-white dark:border-emerald-900 group"
          >
            <Bot
              className="h-8 w-8 md:h-11 md:w-11 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 text-white drop-shadow-md relative z-10"
              strokeWidth={1.5}
            />
          </Button>
        </div>
      )}
    </aside>
  );
};

export default FloatingChatWidget;
