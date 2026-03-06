import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Github, Settings, MessageSquarePlus, X, Check, Sliders, Palette, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { geminiService, Message } from './services/geminiService';
import { cn } from './lib/utils';

interface AppSettings {
  personality: 'default' | 'creative' | 'professional' | 'friendly';
  fontSize: 'sm' | 'base' | 'lg';
  glassIntensity: 'low' | 'medium' | 'high';
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    personality: 'default',
    fontSize: 'base',
    glassIntensity: 'medium',
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCurrentResponse('');

    try {
      const stream = geminiService.streamChat(userMessage.content, messages, settings.personality);
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk;
        setCurrentResponse(fullResponse);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: fullResponse,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentResponse('');
    } catch (error) {
      console.error('Failed to get response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: 'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className={cn(
      "flex h-screen bg-[#030303] text-zinc-100 font-sans selection:bg-violet-500/40 overflow-hidden noise-overlay",
      settings.glassIntensity === 'high' ? 'glass-heavy' : ''
    )}>
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-indigo-600/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col glass-panel p-6 z-20">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="p-2.5 bg-violet-500/20 rounded-2xl shadow-lg shadow-violet-500/10 border border-violet-500/20">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
          <span className="font-bold tracking-tight text-xl bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">Nik0ss</span>
        </div>

        <button
          onClick={clearChat}
          className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-semibold mb-6 group shadow-lg"
        >
          <div className="p-1.5 bg-violet-500/10 rounded-lg group-hover:bg-violet-500/20 transition-colors">
            <MessageSquarePlus className="w-4 h-4 text-violet-400" />
          </div>
          Новый чат
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black mb-6 px-2 opacity-60">
            История
          </div>
          {messages.length === 0 ? (
            <div className="px-2 text-xs text-zinc-600 italic font-medium">История пуста</div>
          ) : (
            <div className="space-y-2">
              {messages.filter(m => m.role === 'user').slice(-8).map(m => (
                <div key={m.id} className="p-3 text-xs truncate text-zinc-400 hover:text-zinc-100 cursor-pointer rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                  {m.content}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-all text-xs text-zinc-400 hover:text-zinc-200 font-medium group"
          >
            <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
            Настройки
          </button>
          <div className="flex items-center justify-between px-2 text-[10px] text-zinc-600 font-bold tracking-wider uppercase">
            <span>v1.1.0</span>
            <span className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-violet-500 rounded-full animate-ping" />
              Online
            </span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/5 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3 md:hidden">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="font-bold text-lg tracking-tight">Nik0ss</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <Bot className="w-4 h-4 text-violet-500" />
            Nik0ss AI Assistant
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="md:hidden p-2.5 text-zinc-500 hover:text-violet-400 transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={clearChat}
              className="p-2.5 text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-xl transition-all"
              title="Очистить чат"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-10 md:px-0 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-10">
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
                  <div className="relative w-24 h-24 glass-card rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                    <Bot className="w-12 h-12 text-violet-400" />
                  </div>
                </div>
                <h1 className="text-5xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                  Nik0ss Chat Bot
                </h1>
                <p className="text-zinc-500 max-w-md text-sm leading-relaxed font-medium">
                  Ваш персональный ИИ-ассистент в усовершенствованном стеклянном дизайне. 
                  Готов помочь с кодом, текстами или просто поддержать беседу.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-xl px-4">
                  {[
                    'Придумай идею для стартапа', 
                    'Напиши код на Python для парсинга', 
                    'Как сделать эффект стекла в CSS?', 
                    'Расскажи интересную историю'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="p-5 text-left text-xs glass-card rounded-2xl hover:bg-white/[0.08] hover:border-violet-500/40 transition-all text-zinc-400 hover:text-zinc-100 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 to-violet-500/0 group-hover:from-violet-500/5 group-hover:to-transparent transition-all" />
                      <span className="relative z-10">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={cn(
                    "flex gap-5 group",
                    message.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg glass-card",
                    message.role === 'user' 
                      ? "bg-violet-500/20 text-violet-400 border-violet-500/30" 
                      : "text-zinc-400"
                  )}>
                    {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] rounded-[1.5rem] px-6 py-4 shadow-xl glass-card",
                    settings.fontSize === 'sm' ? 'text-xs' : settings.fontSize === 'lg' ? 'text-base' : 'text-sm',
                    message.role === 'user' 
                      ? "bg-violet-500/[0.08] text-violet-50 border-violet-500/20" 
                      : "text-zinc-300"
                  )}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {currentResponse && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="flex gap-5 flex-row"
                >
                  <div className="w-10 h-10 rounded-2xl glass-card text-zinc-400 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className={cn(
                    "max-w-[85%] rounded-[1.5rem] px-6 py-4 shadow-xl glass-card text-zinc-300",
                    settings.fontSize === 'sm' ? 'text-xs' : settings.fontSize === 'lg' ? 'text-base' : 'text-sm'
                  )}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{currentResponse}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-8 bg-gradient-to-t from-[#030303] via-[#030303] to-transparent z-30">
          <div className="max-w-3xl mx-auto relative">
            <form 
              onSubmit={handleSubmit}
              className="relative flex items-center group"
            >
              <div className="absolute inset-0 bg-violet-500/10 blur-2xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напишите Nik0ss..."
                disabled={isLoading}
                className="w-full glass-input rounded-3xl py-5 pl-8 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all placeholder:text-zinc-600 shadow-2xl relative z-10"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute right-3 p-3 rounded-2xl transition-all z-20",
                  input.trim() && !isLoading 
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 hover:scale-105 hover:bg-violet-500" 
                    : "bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="mt-4 text-[10px] text-center text-zinc-600 font-bold tracking-widest uppercase opacity-50">
              Nik0ss AI • Advanced Glassmorphism v1.1
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 glass-overlay"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-panel rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-500/20 rounded-xl">
                    <Sliders className="w-5 h-5 text-violet-400" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">Настройки</h2>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Personality */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <BrainCircuit className="w-4 h-4" />
                    Личность Nik0ss
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'default', label: 'Стандартный', desc: 'Сбалансированный' },
                      { id: 'creative', label: 'Творческий', desc: 'Вдохновляющий' },
                      { id: 'professional', label: 'Эксперт', desc: 'Строгий и точный' },
                      { id: 'friendly', label: 'Дружелюбный', desc: 'Неформальный' }
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSettings({ ...settings, personality: p.id as any })}
                        className={cn(
                          "p-4 rounded-2xl text-left transition-all border",
                          settings.personality === p.id 
                            ? "bg-violet-500/20 border-violet-500/50 text-white" 
                            : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                        )}
                      >
                        <div className="font-bold text-sm mb-1 flex items-center justify-between">
                          {p.label}
                          {settings.personality === p.id && <Check className="w-3 h-3 text-violet-400" />}
                        </div>
                        <div className="text-[10px] opacity-60">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Font Size */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <Palette className="w-4 h-4" />
                    Размер текста
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                    {[
                      { id: 'sm', label: 'Мелкий' },
                      { id: 'base', label: 'Средний' },
                      { id: 'lg', label: 'Крупный' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSettings({ ...settings, fontSize: f.id as any })}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                          settings.fontSize === f.id 
                            ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" 
                            : "text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Glass Intensity */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <Sparkles className="w-4 h-4" />
                    Интенсивность стекла
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                    {[
                      { id: 'low', label: 'Слабая' },
                      { id: 'medium', label: 'Средняя' },
                      { id: 'high', label: 'Сильная' }
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setSettings({ ...settings, glassIntensity: g.id as any })}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                          settings.glassIntensity === g.id 
                            ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" 
                            : "text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full mt-10 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/20 transition-all active:scale-[0.98]"
              >
                Сохранить и закрыть
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
