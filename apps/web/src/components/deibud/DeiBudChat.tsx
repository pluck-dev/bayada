"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function DeiBudChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕하세요! 바야다홈헬스케어입니다. 홈헬스케어 서비스에 대해 궁금한 점을 물어보세요.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Mock 응답 (1.5초 후)
    setTimeout(() => {
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content:
          "현재 바야다홈헬스케어 AI 상담 서비스를 준비 중입니다. 빠른 시일 내에 맞춤 케어 상담 서비스를 제공할 예정입니다. 긴급 문의는 1670-1379으로 전화해 주세요.",
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white shadow-2xl"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-3 bg-[#ce0e2d] px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">바야다홈헬스케어</p>
          <p className="text-xs text-white/70">BAYADA 케어 가이드</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/70">온라인</span>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d]/10">
                <Bot className="h-3.5 w-3.5 text-[#ce0e2d]" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#ce0e2d] text-white"
                  : "bg-[color:var(--surface)] text-[color:var(--fg)]"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)]">
                <User className="h-3.5 w-3.5 text-[color:var(--muted)]" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d]/10">
              <Bot className="h-3.5 w-3.5 text-[#ce0e2d]" />
            </div>
            <div className="rounded-2xl bg-[color:var(--surface)] px-4 py-2.5">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-[color:var(--muted)] animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-[color:var(--muted)] animate-bounce [animation-delay:0.15s]" />
                <span className="h-2 w-2 rounded-full bg-[color:var(--muted)] animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <form onSubmit={handleSubmit} className="border-t border-[color:var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 rounded-full bg-[color:var(--surface)] px-4 py-2.5 text-sm text-[color:var(--fg)] placeholder:text-[color:var(--muted)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d] text-white transition-colors hover:bg-[#b00c27] disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
