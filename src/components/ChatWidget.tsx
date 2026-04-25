import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, Mic, MicOff } from 'lucide-react';
import { sendChatMessage, ChatMessage } from '../services/gemini';

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'model',
    text: "Jambo! I'm your Finance AI coach. How can I help you grow your business and build your trust profile today?"
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      // Using Swahili / English (Kenya) locale
      recognition.lang = 'en-KE'; 
      
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setInputValue(prev => prev ? prev + ' ' + transcript : transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Stop listening if sending a message
    if (isListening) {
      recognitionRef.current?.stop();
    }
    
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const responseText = await sendChatMessage(messages, userMessage);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Pole sana, my connection had a small issue. Can you please repeat that?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#008C44] hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 z-50 flex items-center justify-center animate-bounce group"
          aria-label="Open Chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute right-full mr-3 whitespace-nowrap bg-neutral-800 text-white text-xs px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Chat with Finance AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-80 md:w-96 h-[80vh] sm:h-[500px] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-neutral-200 animate-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="bg-[#008C44] text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot className="w-5 h-5 text-yellow-300" />
              </div>
              <h3 className="font-semibold text-sm">Finance AI Coach</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-emerald-100 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-neutral-50 space-y-4">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div 
                  className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#008C44] text-white rounded-br-sm' : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm shadow-sm'}`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 px-1">
                  {msg.role === 'user' ? 'You' : 'Finance AI'}
                </span>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex flex-col max-w-[85%] mr-auto items-start">
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 rounded-bl-sm shadow-sm flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-neutral-100 flex items-center space-x-2">
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
              aria-label={isListening ? "Stop listening" : "Start speaking"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <form onSubmit={handleSend} className="flex items-center space-x-2 flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask about savings, stock..."}
                className="flex-1 min-w-0 bg-neutral-100 text-sm rounded-full px-4 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-[#008C44]/20 focus:border-[#008C44]/50 border border-transparent transition-all"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="bg-[#008C44] text-white p-2.5 rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-[#008C44] transition-colors flex-shrink-0"
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
