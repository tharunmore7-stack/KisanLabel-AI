import { useEffect, useRef, useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  Loader2,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { ChatMessage } from '@/types';
import { askAssistant } from '@/lib/aiChat';
import { getLanguage } from '@/lib/languages';
import { AiModeBadge } from '@/components/StatusBadges';

const SUGGESTED = [
  'What is this pesticide used for?',
  'Which crops are listed on this label?',
  'What does the waiting period mean?',
  'What safety precautions should I follow?',
  'Where is the dosage information on the label?',
  'Is any important information missing?',
];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function AssistantPage() {
  const { lastAnalysis, language, aiMode, navigate } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const lang = getLanguage(language);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (lastAnalysis) {
      setMessages([
        {
          id: uid(),
          role: 'assistant',
          content: `I've loaded your scanned label${
            lastAnalysis.productIdentification.productName
              ? ` for "${lastAnalysis.productIdentification.productName}"`
              : ''
          }. Ask me anything about it — I'll answer only based on what's on the label.`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [lastAnalysis]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    setError('');
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: question, timestamp: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const answer = await askAssistant({
        question,
        analysis: lastAnalysis,
        mode: aiMode,
        language,
        history: messages,
      });
      setMessages((m) => [
        ...m,
        { id: uid(), role: 'assistant', content: answer, timestamp: Date.now() },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach the AI assistant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="text-center mb-6">
        <span className="section-label"><MessageSquare className="w-3.5 h-3.5" /> AI Assistant</span>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Ask about your scanned label</h1>
        <p className="mt-2 text-slate-600">
          Answers are based only on the scanned label — never invented.
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <AiModeBadge />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-medium">
            {lang.flag} {lang.nativeName}
          </span>
        </div>
      </div>

      {!lastAnalysis && (
        <div className="glass-card p-6 mb-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-3">
            <FileText className="w-7 h-7 text-brand-600" />
          </div>
          <h3 className="font-semibold text-slate-800">No label loaded</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            Scan a pesticide label first, then come back to ask questions about it.
          </p>
          <button onClick={() => navigate('scan')} className="mt-4 btn-primary">
            <Sparkles className="w-4 h-4" /> Scan a Label
          </button>
        </div>
      )}

      <div className="glass-card-strong flex flex-col h-[60vh] min-h-[400px]">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {messages.length === 0 && lastAnalysis && (
            <div className="text-center text-slate-400 text-sm py-10">
              Ask a question above or tap a suggestion below.
            </div>
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-brand-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking…</span>
            </div>
          )}
        </div>

        {/* Suggested */}
        {messages.length <= 1 && lastAnalysis && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={loading}
                className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium hover:bg-brand-100 transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mx-4 mb-2 flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 text-rose-700 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-brand-100 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Ask about your label…"
            disabled={!lastAnalysis || loading}
            className="input-field flex-1"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading || !lastAnalysis}
            className="btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {messages.length > 1 && (
        <div className="mt-4 text-center">
          <button
            onClick={() =>
              setMessages([
                {
                  id: uid(),
                  role: 'assistant',
                  content: 'Conversation cleared. Ask me anything about your scanned label.',
                  timestamp: Date.now(),
                },
              ])
            }
            className="btn-ghost text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Clear chat
          </button>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isUser ? 'bg-med-100 text-med-700' : 'bg-brand-100 text-brand-700'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-med-600 text-white rounded-tr-sm'
            : 'bg-white border border-brand-100 text-slate-700 rounded-tl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
