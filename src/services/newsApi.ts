// Agriculture News API service using Google Gemini
const API_KEY = 'AIzaSyDXf4W88CpdbzRW_NSmR4d5wNWU2UThJ6Y';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface AgricultureNews {
  headline: string;
  content: string;
  timestamp: Date;
  source?: string;
}

export const fetchLatestAgricultureNews = async (teluguMode: boolean = false): Promise<AgricultureNews> => {
  try {
    const prompt = teluguMode 
      ? `మీరు వ్యవసాయ పరిశోధనా నిపుణుడు. భారతదేశం లేదా ప్రపంచవ్యాప్తంగా ఇటీవలి మరియు సంబంధిత వ్యవసాయ వార్తలను ఒకటి ఇవ్వండి. వ్యవసాయం, మార్కెట్ ధరలు, వాతావరణం, కొత్త పద్ధతులు లేదా ప్రభుత్వ పథకాలపై దృష్టి పెట్టండి. దీన్ని చిన్నగా మరియు స్పష్టంగా ఉంచండి.

ఈ ఫార్మాట్‌లో ప్రతిస్పందించండి:
హెడ్‌లైన్: [బోల్డ్ హెడ్‌లైన్]
కంటెంట్: [2-3 వాక్యాలలో వివరణ]
మూలం: [ఏదైనా ఉంటే]`
      : `You are an expert agriculture researcher. Give me one recent and relevant piece of agricultural news from India or globally. Focus on farming, market prices, climate, new techniques, or government schemes. Keep it short and clear.

Respond in this format:
Headline: [Bold headline]
Content: [2-3 sentence description]
Source: [if any]`;

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`News API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No news response from AI');
    }

    const newsText = data.candidates[0].content.parts[0].text;
    
    // Parse the response to extract headline, content, and source
    const lines = newsText.split('\n').filter(line => line.trim());
    let headline = '';
    let content = '';
    let source = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.toLowerCase().startsWith('headline:')) {
        headline = trimmedLine.replace(/^headline:\s*/i, '').replace(/^\*\*|\*\*$/g, '');
      } else if (trimmedLine.toLowerCase().startsWith('content:')) {
        content = trimmedLine.replace(/^content:\s*/i, '');
      } else if (trimmedLine.toLowerCase().startsWith('source:')) {
        source = trimmedLine.replace(/^source:\s*/i, '');
      } else if (!headline && trimmedLine.length > 10) {
        // If no explicit headline found, use the first substantial line
        headline = trimmedLine.replace(/^\*\*|\*\*$/g, '');
      } else if (headline && !content && trimmedLine.length > 20) {
        // If headline exists but no content, use this as content
        content = trimmedLine;
      }
    }

    // Fallback if parsing fails
    if (!headline) {
      const sentences = newsText.split('.').filter(s => s.trim().length > 10);
      headline = sentences[0]?.trim() || 'Latest Agriculture Update';
      content = sentences.slice(1, 3).join('. ').trim() || newsText.substring(0, 200);
    }

    return {
      headline: headline || 'Agriculture News Update',
      content: content || newsText.substring(0, 200),
      timestamp: new Date(),
      source: source || undefined
    };

  } catch (error) {
    console.error('Agriculture news fetch error:', error);
    
    // Return fallback news
    return {
      headline: teluguMode 
        ? 'వ్యవసాయ వార్తలు లోడ్ చేయడంలో విఫలమైంది'
        : 'Failed to load agriculture news',
      content: teluguMode 
        ? 'దయచేసి కొద్దిసేపు తర్వాత మళ్లీ ప్రయత్నించండి.'
        : 'Please try again in a few moments.',
      timestamp: new Date()
    };
  }
};