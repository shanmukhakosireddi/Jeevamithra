import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Languages, 
  Volume2, 
  VolumeX, 
  Heart, 
  Wheat,
  Send,
  Loader2
} from 'lucide-react';
import { ChatInput } from './ChatInput';
import { AgricultureNewsSection } from './AgricultureNewsSection';
import { WeatherFarmerSection } from './WeatherFarmerSection';
import { FarmMateRentals } from './FarmMateRentals';
import { VerticalHealthInputMode } from './VerticalHealthInputMode';

type AssistantMode = 'general' | 'farming' | 'health' | 'news' | 'schemes';

interface ModeInputPageProps {
  mode: AssistantMode;
  teluguMode: boolean;
  onToggleLanguage: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onSubmit: (text: string, mode: AssistantMode) => void;
  onBackToHome: () => void;
  isLoading: boolean;
}

export const ModeInputPage: React.FC<ModeInputPageProps> = ({
  mode,
  teluguMode,
  onToggleLanguage,
  voiceEnabled,
  onToggleVoice,
  onSubmit,
  onBackToHome,
  isLoading
}) => {
  const [inputText, setInputText] = useState('');

  const getModeInfo = () => {
    switch (mode) {
      case 'farming':
        return {
          icon: Wheat,
          title: teluguMode ? 'వ్యవసాయ సహాయం చాట్' : 'Farming Help Chat',
          subtitle: teluguMode ? 'పంటలు, మట్టి, కీటకాలు మరియు దిగుబడి ఆప్టిమైజేషన్‌పై నిపుణుల సలహా పొందండి' : 'Get expert advice on crops, soil, pests, and yield optimization',
          bgGradient: 'from-green-100 to-emerald-100',
          iconBg: 'from-green-500 to-emerald-600',
          placeholder: teluguMode ? 'వ్యవసాయ ప్రశ్న అడగండి (ఉదా: ఏ పంట పండించాలి?)' : 'Ask a farming question (e.g. What crop should I grow?)',
          quickQuestions: teluguMode ? [
            'ఈ సీజన్‌లో ఏ పంట పండించాలి?',
            'వరికి ఉత్తమ ఎరువు ఏది?',
            'టమాటో అధిక దిగుబడితో ఎలా పండించాలి?'
          ] : [
            'What crop can I grow this season?',
            'What fertilizer is best for rice?',
            'How to grow tomatoes with high yield?'
          ]
        };
      case 'health':
        return {
          icon: Heart,
          title: teluguMode ? 'AI ఆరోగ్య సహాయకుడు' : 'AI Health Assistant',
          subtitle: teluguMode ? 'లక్షణాలు, మందుల సలహా మరియు ఆరోగ్యంగా ఉండటానికి వ్యక్తిగతీకరించిన సహాయం పొందండి' : 'Get personalized help for symptoms, medicine advice, and health tips',
          bgGradient: 'from-pink-100 to-red-100',
          iconBg: 'from-red-500 to-pink-600',
          placeholder: teluguMode ? 'ఆరోగ్య ప్రశ్న అడగండి (ఉదా: తలనొప్పి వచ్చింది, ఏం చేయాలి?)' : 'Ask a health question (e.g. I have a headache, what should I do?)',
          quickQuestions: teluguMode ? [
            'పారాసిటమాల్ వాడుక ఏమిటి?',
            'తలనొప్పి వచ్చింది. ఏం చేయాలి?',
            'రోగనిరోధక శక్తి పెంచే ఆహారం ఏది?'
          ] : [
            'What is the use of Paracetamol?',
            'I have a headache. What should I do?',
            'What food boosts immunity?'
          ]
        };
      default:
        return {
          icon: Heart,
          title: 'Assistant',
          subtitle: 'How can I help you?',
          bgGradient: 'from-blue-100 to-indigo-100',
          iconBg: 'from-blue-500 to-indigo-600',
          placeholder: 'Ask a question...',
          quickQuestions: []
        };
    }
  };

  const modeInfo = getModeInfo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSubmit(inputText.trim(), mode);
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setInputText(transcript);
  };

  const handleVoiceError = (error: string) => {
    console.error('Voice input error:', error);
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${modeInfo.bgGradient} flex flex-col relative`}>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200/50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
            title={teluguMode ? 'హోమ్‌కు వెళ్లండి' : 'Back to Home'}
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          
          <div className="flex items-center space-x-3">
            {/* Voice Toggle */}
            <button
              onClick={onToggleVoice}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                voiceEnabled 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="text-sm font-medium hidden sm:inline">
                {teluguMode ? (voiceEnabled ? 'వాయిస్' : 'వాయిస్ ఆఫ్') : (voiceEnabled ? 'Voice' : 'Voice Off')}
              </span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                teluguMode 
                  ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              <Languages size={16} />
              <span className="text-sm font-medium">
                {teluguMode ? 'తెలుగు' : 'English'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12">
        <div className="w-full max-w-6xl mx-auto">
          {/* Mode Header */}
          <div className="text-center mb-12">
            <div className={`w-24 h-24 bg-gradient-to-br ${modeInfo.iconBg} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
              <modeInfo.icon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {modeInfo.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {modeInfo.subtitle}
            </p>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative max-w-3xl mx-auto">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={modeInfo.placeholder}
                className={`w-full px-6 py-4 pr-24 text-lg border-2 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent bg-white shadow-lg transition-all duration-200 ${
                  mode === 'farming' 
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-red-300 focus:ring-red-500'
                }`}
                disabled={isLoading}
              />
              
              {/* Voice Input Button */}
              <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => {/* Voice input logic */}}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  🎤
                </button>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                  mode === 'farming'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
                }`}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </form>

          {/* Voice Mode Info */}
          <div className="text-center mb-8">
            <p className="text-sm text-gray-600">
              🎤 {teluguMode 
                ? 'మైక్రోఫోన్ తెలుగు మోడ్‌లో సెట్ చేయబడింది - తెలుగులో మాట్లాడండి!'
                : 'Microphone set to English mode - Speak in English!'
              }
            </p>
          </div>

          {/* Quick Questions */}
          {modeInfo.quickQuestions.length > 0 && (
            <div className="text-center mb-12">
              <p className="text-sm text-gray-600 mb-4 font-medium">
                {teluguMode ? 'త్వరిత ప్రశ్నలు:' : 'Quick questions:'}
              </p>
              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {modeInfo.quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    disabled={isLoading}
                    className={`px-4 py-2 text-sm rounded-full transition-all duration-200 border shadow-sm hover:shadow-md disabled:opacity-50 ${
                      mode === 'farming' 
                        ? 'bg-green-50 hover:bg-green-100 border-green-200 text-green-800'
                        : 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-800'
                    }`}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center mt-8">
              <div className="inline-flex items-center space-x-3 bg-white/80 px-6 py-3 rounded-2xl shadow-lg">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-gray-700 font-medium">
                  {teluguMode ? 'చాట్‌కు వెళ్తున్నాము...' : 'Redirecting to chat...'}
                </span>
              </div>
            </div>
          )}

          {/* Health Input Mode - Only show for health mode */}
          {mode === 'health' && !isLoading && (
            <VerticalHealthInputMode teluguMode={teluguMode} />
          )}

          {/* Farming Mode Specific Sections */}
          {mode === 'farming' && !isLoading && (
            <>
              {/* Weather & Farmer Help Section */}
              <WeatherFarmerSection teluguMode={teluguMode} />
              
              {/* FarmMate Rentals Section */}
              <FarmMateRentals teluguMode={teluguMode} />
              
              {/* Agriculture News Section */}
              <AgricultureNewsSection teluguMode={teluguMode} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};