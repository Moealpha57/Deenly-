
import React, { useState, useRef, useEffect } from 'react';
import { Message, Source, UserProgress, Badge } from '../types';
import { getChatStream, initializeChat, generateSpeech } from '../services/geminiService';
import { XP_PER_QUESTION } from '../constants';
import MarkdownRenderer from './MarkdownRenderer';
import MicrophoneIcon from './icons/MicrophoneIcon';
import SpeakerOnIcon from './icons/SpeakerOnIcon';
import SpeakerOffIcon from './icons/SpeakerOffIcon';
import SourceIcon from './icons/SourceIcon';
import { useLanguage } from '../contexts/LanguageContext';

// Add type definition for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatViewProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userProgress: UserProgress;
  setUserProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, setMessages, userProgress, setUserProgress }) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const recognitionRef = useRef<any>(null);
  
  const { t } = useLanguage();

  // Sync the AI session with the current message history on mount
  useEffect(() => {
      if (messages.length > 0) {
          initializeChat(messages);
      } else {
          initializeChat([]);
      }
      return () => {
          stopAudio(); // Cleanup audio on unmount
          if (recognitionRef.current) {
              recognitionRef.current.stop();
          }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const stopAudio = () => {
      if (audioSourceRef.current) {
          try {
              audioSourceRef.current.stop();
          } catch (e) {
              // Ignore if already stopped
          }
          audioSourceRef.current = null;
      }
      setPlayingMessageId(null);
  };

  const decodeAndPlayAudio = async (base64Audio: string, messageId: string) => {
      try {
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }

          if (audioContextRef.current.state === 'suspended') {
              await audioContextRef.current.resume();
          }

          const binaryString = atob(base64Audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
          }

          const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer.slice(0));
          
          stopAudio(); // Stop any currently playing audio

          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current.destination);
          
          source.onended = () => {
              setPlayingMessageId(null);
              audioSourceRef.current = null;
          };

          audioSourceRef.current = source;
          source.start(0);
          setPlayingMessageId(messageId);
      } catch (error) {
          console.error("Error decoding or playing audio:", error);
          setPlayingMessageId(null);
      }
  };

  const handlePlayAudio = async (messageId: string, text: string) => {
      // If already playing this message, stop it
      if (playingMessageId === messageId) {
          stopAudio();
          return;
      }

      setIsLoadingAudio(messageId);
      stopAudio(); // Stop others

      // Strip markdown for speech
      const plainText = text.replace(/[*_#\[\]>]/g, ''); 
      const base64Data = await generateSpeech(plainText);
      
      setIsLoadingAudio(null);
      
      if (base64Data) {
          await decodeAndPlayAudio(base64Data, messageId);
      }
  };

  const toggleListening = () => {
      if (isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
          return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
          alert("Speech recognition is not supported in this browser.");
          return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US'; 
      recognition.interimResults = true; // Changed to true for better feedback
      recognition.maxAlternatives = 1;

      // Capture the input state at the moment we start listening
      const startInput = input;

      recognition.onstart = () => {
          setIsListening(true);
      };

      recognition.onresult = (event: any) => {
          // Iterate through results to build the full transcript for this session
          let currentSessionTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
              currentSessionTranscript += event.results[i][0].transcript;
          }

          // Combine the baseline input with the new transcript
          // This prevents duplication because we always rebuild from startInput
          const separator = startInput && !startInput.endsWith(' ') ? ' ' : '';
          setInput(startInput + separator + currentSessionTranscript);
      };

      recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
      };

      recognition.onend = () => {
          setIsListening(false);
      };

      recognition.start();
  };

  const handleSend = async () => {
    if (input.trim() === '' || isSending) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    
    // Award XP and Beginner badge on first question
    const hasBeginnerBadge = userProgress.badges.includes(Badge.Beginner);
    setUserProgress(prev => ({
        ...prev,
        xp: prev.xp + XP_PER_QUESTION,
        badges: !hasBeginnerBadge ? [...prev.badges, Badge.Beginner] : prev.badges
    }));

    const botTypingId = `bot-typing-${Date.now()}`;
    const botTypingMessage: Message = { id: botTypingId, text: '', sender: 'bot', isTyping: true };
    setMessages(prev => [...prev, botTypingMessage]);

    try {
        const stream = await getChatStream(input);
        let botResponse = '';
        const sources: Source[] = [];
        const seenUris = new Set<string>();

        for await (const chunk of stream) {
            const chunkText = chunk.text;
            if (chunkText) {
                botResponse += chunkText;
            }

            const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (groundingChunks) {
                for (const groundChunk of groundingChunks) {
                    if (groundChunk.web) {
                        const { uri, title } = groundChunk.web;
                        if (uri && !seenUris.has(uri)) {
                            sources.push({ uri, title: title || uri });
                            seenUris.add(uri);
                        }
                    }
                }
            }
            
            // Sanitize response to remove potential leaked "tool_code" or "thought" blocks
            const cleanedResponse = botResponse.replace(/^tool_code[\s\S]*?thought[\s\S]*?(\n|$)/i, '').replace(/^thought[\s\S]*?(\n|$)/i, '').trim();
            
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === botTypingId ? { ...msg, text: cleanedResponse || botResponse, isTyping: false, sources } : msg
                )
            );
        }
        
        setMessages(prev => prev.map(msg => msg.id === botTypingId ? { ...msg, id: Date.now().toString() + '-bot' } : msg));

    } catch (error) {
        console.error('Error getting chat stream:', error);
        setMessages(prev => prev.filter(msg => msg.id !== botTypingId));
        setMessages(prev => [...prev, { id: 'error-msg', text: 'Sorry, I encountered an error. Please try again.', sender: 'bot' }]);
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto min-h-0 space-y-4 pr-2">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
              message.sender === 'user'
                ? 'bg-brand-primary text-white rounded-br-none ltr:rounded-br-none rtl:rounded-bl-none'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none ltr:rounded-bl-none rtl:rounded-br-none'
            }`}>
              {message.isTyping ? (
                <div className="flex items-center space-x-1 py-2">
                  <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                </div>
              ) : (
                <>
                  <MarkdownRenderer content={message.text} />
                  {message.sender === 'bot' && (
                    <p className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[8px] leading-tight text-slate-300 dark:text-slate-600 italic">
                        {t('aiDisclaimer')}
                    </p>
                  )}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 mb-2">
                        <SourceIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('sources')}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((source, index) => (
                          <a
                            key={index}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            title={source.title}
                          >
                            {source.title.length > 50 ? source.title.substring(0, 47) + '...' : source.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
             {message.sender === 'bot' && !message.isTyping && (
                <button 
                  onClick={() => handlePlayAudio(message.id, message.text)} 
                  disabled={isLoadingAudio === message.id}
                  className={`p-1.5 rounded-full transition-colors text-slate-500 ${
                    playingMessageId === message.id ? 'bg-brand-light dark:bg-brand-dark text-brand-primary' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Listen to response"
                >
                    {isLoadingAudio === message.id ? (
                      <span className="h-5 w-5 block border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      playingMessageId === message.id ? <SpeakerOnIcon className="h-5 w-5 animate-pulse" /> : <SpeakerOffIcon className="h-5 w-5" />
                    )}
                </button>
             )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex-shrink-0 mt-4 flex items-center space-x-2">
        <div className="relative w-full">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening..." : t('chatPlaceholder')}
            disabled={isSending}
            className={`w-full p-3 pl-4 pr-12 border rounded-full bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary ${
              isListening ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-600'
            }`}
            />
            <button 
                onClick={toggleListening}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
                    isListening 
                    ? 'text-red-500 bg-red-100 animate-pulse' 
                    : 'text-slate-500 hover:text-brand-primary hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Use microphone"
            >
                <MicrophoneIcon className="h-5 w-5" />
            </button>
        </div>
        <button
          onClick={handleSend}
          disabled={isSending || input.trim() === ''}
          className="bg-brand-primary text-white rounded-full p-3 disabled:bg-slate-400 disabled:cursor-not-allowed flex-shrink-0"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </div>
    </div>
  );
};

export default ChatView;
