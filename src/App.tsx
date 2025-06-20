import React, { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { ChatPage } from './components/ChatPage';
import { ModeInputPage } from './components/ModeInputPage';
import { Message } from './types/chat';
import { sendMessage } from './services/api';
import { useLocalStorage } from './hooks/useLocalStorage';
import { speakText, isTTSAvailable } from './services/googleTTS';

type Page = 'home' | 'health-input' | 'farming-input' | 'health-chat' | 'farming-chat';
type AssistantMode = 'general' | 'farming' | 'health' | 'news' | 'schemes';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [assistantMode, setAssistantMode] = useState<AssistantMode>('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teluguMode, setTeluguMode] = useLocalStorage('teluguMode', false);
  const [voiceEnabled, setVoiceEnabled] = useLocalStorage('voiceEnabled', true);
  const [pendingUserMessage, setPendingUserMessage] = useState<string>('');

  // Add welcome message when entering chat with mode-specific content
  useEffect(() => {
    if ((currentPage === 'health-chat' || currentPage === 'farming-chat') && messages.length === 0) {
      const getModeWelcomeMessage = () => {
        switch (assistantMode) {
          case 'farming':
            return teluguMode 
              ? '🌾 నమస్కారం! నేను మీ AI వ్యవసాయ సహాయకుడిని. పంటలు, మట్టి, కీటకాలు, నీటిపారుదల మరియు దిగుబడి ఎలా పెంచాలో నన్ను అడగండి.'
              : '🌾 Hello! I\'m your AI Farming Assistant. Ask me anything about crops, soil, pests, irrigation, and how to increase yield.';
          case 'health':
            return teluguMode 
              ? '👩‍⚕️ నమస్కారం! నేను మీ AI ఆరోగ్య సహాయకుడిని. లక్షణాలు, మందులు, చికిత్సలు మరియు ఆరోగ్యంగా ఎలా ఉండాలో నేను మీకు సహాయం చేయగలను.'
              : '👩‍⚕️ Hello! I\'m your AI Health Assistant. I can help you with symptoms, medicines, treatments, and how to stay healthy.';
          default:
            return teluguMode 
              ? 'నమస్కారం! నేను జీవమిత్ర. మీకు ఆరోగ్యం, వ్యవసాయం లేదా ఏదైనా సందేహాలు ఉంటే అడగండి.'
              : 'Namaste! I am Jeevamithra, your village assistant. Ask me about health, farming, or any daily questions.';
        }
      };

      const welcomeMessage: Message = {
        id: 'welcome',
        content: getModeWelcomeMessage(),
        isUser: false,
        timestamp: new Date(),
      };
      
      const initialMessages = [welcomeMessage];
      
      // If there's a pending user message, add it and get AI response
      if (pendingUserMessage.trim()) {
        const userMessage: Message = {
          id: 'user-initial',
          content: pendingUserMessage,
          isUser: true,
          timestamp: new Date(),
        };
        initialMessages.push(userMessage);
        setMessages(initialMessages);
        
        // Get AI response for the user message
        handleInitialMessage(pendingUserMessage);
        setPendingUserMessage('');
      } else {
        setMessages(initialMessages);
        
        // Speak welcome message if voice is enabled
        if (voiceEnabled && isTTSAvailable()) {
          setTimeout(() => {
            speakText(welcomeMessage.content, teluguMode).catch(console.log);
          }, 1000);
        }
      }
    }
  }, [currentPage, teluguMode, voiceEnabled, messages.length, assistantMode, pendingUserMessage]);

  const handleInitialMessage = async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage(text, undefined, teluguMode, assistantMode);
      
      const botMessage: Message = {
        id: 'bot-initial',
        content: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      // Auto-speak response if voice is enabled
      if (voiceEnabled && response.trim() && isTTSAvailable()) {
        setTimeout(() => {
          speakText(response, teluguMode).catch(console.log);
        }, 800);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (teluguMode ? 'ఏదో తప్పు జరిగింది. మళ్లీ ప్రయత్నించండి.' : 'Something went wrong. Please try again.');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (
    text: string,
    image?: { file: File; base64: string; preview: string }
  ) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text || (teluguMode ? 'ఈ చిత్రాన్ని చూడండి' : 'Please look at this image'),
      isUser: true,
      timestamp: new Date(),
      image: image?.preview,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage(text, image?.base64, teluguMode, assistantMode);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      // Auto-speak response if voice is enabled
      if (voiceEnabled && response.trim() && isTTSAvailable()) {
        setTimeout(() => {
          speakText(response, teluguMode).catch(console.log);
        }, 800);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (teluguMode ? 'ఏదో తప్పు జరిగింది. మళ్లీ ప్రయత్నించండి.' : 'Something went wrong. Please try again.');
      setError(errorMessage);
      
      // Remove the user message if the API call failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    
    // Re-add welcome message
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        content: teluguMode 
          ? 'చాట్ క్లియర్ అయ్యింది. మళ్లీ ప్రారంభిద్దాం!'
          : 'Chat cleared. Let\'s start fresh!',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }, 100);
  };

  // Navigate to mode input page
  const navigateToModeInput = (mode: AssistantMode) => {
    setAssistantMode(mode);
    if (mode === 'health') {
      setCurrentPage('health-input');
    } else if (mode === 'farming') {
      setCurrentPage('farming-input');
    }
  };

  // Navigate directly to chat with mode
  const navigateToChat = async (mode: AssistantMode, userMessage?: string) => {
    setAssistantMode(mode);
    setMessages([]); // Clear existing messages
    
    if (userMessage) {
      setPendingUserMessage(userMessage);
    }
    
    // Navigate to mode-specific chat page
    if (mode === 'health') {
      setCurrentPage('health-chat');
    } else if (mode === 'farming') {
      setCurrentPage('farming-chat');
    }
  };

  // Handle message submission from mode input pages
  const handleModeSubmit = (text: string, mode: AssistantMode) => {
    // Show loading transition
    setIsLoading(true);
    
    // Simulate brief loading for smooth transition
    setTimeout(() => {
      setIsLoading(false);
      navigateToChat(mode, text);
    }, 1000);
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    setAssistantMode('general');
    setMessages([]);
    setError(null);
    setPendingUserMessage('');
  };

  const toggleLanguage = () => {
    setTeluguMode(!teluguMode);
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  // Render appropriate page
  if (currentPage === 'home') {
    return (
      <HomePage 
        onStartChat={navigateToModeInput}
        teluguMode={teluguMode}
        onToggleLanguage={toggleLanguage}
        voiceEnabled={voiceEnabled}
        onToggleVoice={toggleVoice}
      />
    );
  }

  if (currentPage === 'health-input' || currentPage === 'farming-input') {
    return (
      <ModeInputPage
        mode={assistantMode}
        teluguMode={teluguMode}
        onToggleLanguage={toggleLanguage}
        voiceEnabled={voiceEnabled}
        onToggleVoice={toggleVoice}
        onSubmit={handleModeSubmit}
        onBackToHome={navigateToHome}
        isLoading={isLoading}
      />
    );
  }

  // Chat pages (health-chat or farming-chat)
  return (
    <ChatPage
      messages={messages}
      isLoading={isLoading}
      error={error}
      onSendMessage={handleSendMessage}
      onClearChat={handleClearChat}
      onBackToHome={navigateToHome}
      teluguMode={teluguMode}
      onToggleLanguage={toggleLanguage}
      voiceEnabled={voiceEnabled}
      onToggleVoice={toggleVoice}
      assistantMode={assistantMode}
    />
  );
}

export default App;