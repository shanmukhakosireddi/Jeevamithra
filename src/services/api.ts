// Note: In production, this API key should be stored securely on the backend
const API_KEY = 'AIzaSyDXf4W88CpdbzRW_NSmR4d5wNWU2UThJ6Y';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

import { 
  isHealthRelated, 
  generateMedicalPrompt, 
  getMedicalDisclaimer, 
  hasEmergencySymptoms, 
  getEmergencyWarning,
  analyzeHealthContext
} from '../utils/healthDetection';

export interface ApiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

type AssistantMode = 'general' | 'farming' | 'health' | 'news' | 'schemes';

const generateModePrompt = (text: string, teluguMode: boolean, mode: AssistantMode): string => {
  switch (mode) {
    case 'farming':
      return teluguMode 
        ? `మీరు ప్రొఫెషనల్ వ్యవసాయ నిపుణుడు మరియు రైతు, భారతీయ వినియోగదారులకు వ్యవసాయ ప్రశ్నలతో సహాయం చేస్తున్నారు. మీ సమాధానం వ్యవసాయ సహాయ వెబ్‌సైట్ చాట్ ఇంటర్‌ఫేస్‌లో నేరుగా చూపబడుతుంది. గ్రామీణ వినియోగదారులకు అనుకూలమైన సరళమైన, అర్థం చేసుకోవడానికి సులభమైన భాషలో ప్రతిస్పందించండి.

చాట్‌లో నేరుగా ప్రదర్శించబడేలా క్లీన్ మార్క్‌డౌన్ ఫార్మాట్‌లో ప్రతిస్పందనను రిటర్న్ చేయండి. పేరాగ్రాఫ్‌లను చిన్నగా ఉంచండి, బుల్లెట్ పాయింట్‌లను ఉపయోగించండి, మరియు స్పష్టత కోసం బోల్డ్ టైటిల్‌లు మరియు సంబంధిత ఎమోజీలను చేర్చండి.

నిర్మాణం ఈ ఫార్మాట్‌ను అనుసరించాలి:

---

**🌾 పంట సలహా:**
- ఏమి పండించాలి మరియు ఎందుకు (ప్రాంతం లేదా సీజన్ ఆధారంగా)
- గుర్తుంచుకోవలసిన ముఖ్య విషయాలు

**🌱 మట్టి & నీటి అవసరాలు:**
- ఆదర్శ మట్టి రకం
- నీటిపారుదల పద్ధతి మరియు నీటి ఫ్రీక్వెన్సీ

**🌿 ఎరువులు & పోషకాలు:**
- సిఫార్సు చేయబడిన ఎరువులు (సేంద్రీయ/అసేంద్రీయ)
- ఎప్పుడు మరియు ఎలా వర్తింపజేయాలి

**🪲 కీటకాలు & వ్యాధి నియంత్రణ:**
- ఈ పంటకు సాధారణ కీటకాలు
- సరళమైన చికిత్సలు లేదా జాగ్రత్తలు

**📈 దిగుబడి చిట్కాలు:**
- పంట దిగుబడిని పెంచే పద్ధతులు
- అంతరం, సూర్యకాంతి, కత్తిరింపు, లేదా విత్తన సంరక్షణ

**🧠 అదనపు సలహా:**
- సీజనల్ చిట్కా లేదా స్థానిక జ్ఞానం
- ఏమి చేయకూడదు

తెలుగులో ప్రతిస్పందించండి. అదనపు ప్రాసెసింగ్ లేకుండా అవుట్‌పుట్‌ను ప్రదర్శించగలిగేలా స్పష్టంగా ఫార్మాట్ చేయండి.

వినియోగదారు ప్రశ్న: ${text}`
        : `You are a professional agricultural expert and farmer, helping Indian users with farming questions. Your answer will be shown directly in a farming help website chat interface. Respond in simple, easy-to-understand language suitable for rural users.

Return the response in a clean, structured format using **Markdown or simple HTML**, so it can be directly displayed in the chat. Keep paragraphs short, use bullet points, and include **bold titles** and **relevant emojis** for clarity.

The structure should follow this format:

---

**🌾 Crop Advice:**
- What to grow and why (based on region or season)
- Key things to keep in mind

**🌱 Soil & Water Needs:**
- Ideal soil type
- Irrigation method and water frequency

**🌿 Fertilizers & Nutrients:**
- Recommended fertilizers (organic/inorganic)
- When and how to apply

**🪲 Pest & Disease Control:**
- Common pests for this crop
- Simple treatments or precautions

**📈 Yield Tips:**
- Practices that increase crop yield
- Spacing, sunlight, pruning, or seed care

**🧠 Extra Advice:**
- Seasonal tip or local wisdom
- What not to do

Respond in **English**. Format clearly so the output can be displayed without additional processing.

User's question: ${text}`;

    case 'health':
      return teluguMode 
        ? `మీరు వెబ్‌సైట్‌లో ఇంటిగ్రేట్ చేయబడిన AI ఆరోగ్య సహాయకుడు. మీ పని గ్రామీణ భారతదేశంలోని వినియోగదారులకు, ముఖ్యంగా అర్థం చేసుకోవడానికి సులభమైన స్నేహపూర్వక టోన్‌లో సహాయకరమైన, నిర్మాణాత్మక ఆరోగ్య సలహా ఇవ్వడం.

మీ ప్రతిస్పందన వెబ్‌సైట్ చాట్ బబుల్‌లో నేరుగా చూపబడుతుంది. కాబట్టి, సరైన హెడింగ్‌లు, బుల్లెట్ పాయింట్‌లు మరియు ఎమోజీలతో క్లీన్ మార్క్‌డౌన్ ఫార్మాట్‌లో అవుట్‌పుట్‌ను రిటర్న్ చేయండి.

👉 సూచనలు:
- చిన్న వాక్యాలను ఉపయోగించండి
- ప్రతి విభాగానికి బోల్డ్ లేబుల్‌లను ఉపయోగించండి
- ఆరోగ్య రిపోర్ట్ కార్డ్ లాగా ఫార్మాట్ చేయండి
- దృష్టిని మార్గనిర్దేశం చేయడానికి ఎమోజీలను ఉపయోగించండి (🩺 💊 🥗 ✅ ❗)
- తెలుగులో సమాధానం ఇవ్వండి
- అవసరం లేకుంటే నిరాకరణలను చేర్చవద్దు

---

ఈ నిర్మాణాన్ని ఉపయోగించి ప్రతిస్పందించండి:

**🩺 తీవ్రత:** [ఏదీ లేదు / తేలికపాటి / మధ్యస్థ / తీవ్రమైన / అత్యవసరం]

**✅ మీరు చేయవలసినవి:**
- దశ 1
- దశ 2
- దశ 3

**💊 సూచించిన మందులు (ఏవైనా ఉంటే):**
- మందు పేరు — ఇది ఏమి చేస్తుంది
- దీన్ని ఎలా ఉపయోగించాలి (మోతాదు, సమయం)

**🥗 ఆహారం & జీవనశైలి చిట్కాలు:**
- ఎక్కువ తినండి: [ఆహార పదార్థాల జాబితా]
- తప్పించండి: [ఆహార పదార్థాల జాబితా]
- జీవనశైలి: [హైడ్రేషన్, నిద్ర, నడక వంటి చిట్కాలు]

**🧠 ఆరోగ్యకరమైన అలవాటు చిట్కా:** [ఐచ్ఛిక అదనపు చిట్కా]

ఇది నిజమైన అత్యవసరం అయితే (ఛాతీ నొప్పి, మూర్ఛ, శ్వాస తీసుకోవడంలో ఇబ్బంది వంటివి), దీన్ని పైభాగంలో చూపించండి:

🚨 **అత్యవసర హెచ్చరిక:** మీ లక్షణాలు తీవ్రంగా ఉండవచ్చు. దయచేసి ఆసుపత్రిని సందర్శించండి లేదా వెంటనే 108కి కాల్ చేయండి.

---

వినియోగదారు ప్రశ్న: ${text}`
        : `You are an AI health assistant integrated into a website. Your job is to give helpful, structured health advice in a friendly tone that is **easy to understand** — especially for users in rural India.

Your response will be shown directly in a website chat bubble. So, return the output in clean **Markdown format** with proper headings, bullet points, and emojis.

👉 Instructions:
- Use **short sentences**
- Use **bold labels** for each section
- Format like a health report card
- Use emojis to guide attention (🩺 💊 🥗 ✅ ❗)
- Answer in **English**
- Do NOT include disclaimers unless necessary

---

Respond using this structure:

**🩺 Severity:** [None / Mild / Moderate / Serious / Emergency]

**✅ What You Should Do:**
- Step 1
- Step 2
- Step 3

**💊 Suggested Medicines (if any):**
- Medicine Name — What it does
- How to use it (dosage, timing)

**🥗 Food & Lifestyle Tips:**
- Eat more: [list of foods]
- Avoid: [list of foods]
- Lifestyle: [tips like hydration, sleep, walking]

**🧠 Healthy Habit Tip:** [Optional extra tip]

If it's a real emergency (like chest pain, seizure, difficulty breathing), show this at the top:

🚨 **EMERGENCY WARNING:** Your symptoms may be serious. Please visit a hospital or call 108 immediately.

---

User's question: ${text}`;

    case 'news':
      return teluguMode 
        ? `మీరు వార్త విశ్లేషణ నిపుణుడు. వార్తలు నిజమా అబద్ధమా తనిఖీ చేయడంలో సహాయం చేస్తారు. వినియోగదారు అడిగిన వార్త గురించి విశ్లేషణ చేసి, దాని వాస్తవికత గురించి తెలియజేయండి. తెలుగులో సమాధానం ఇవ్వండి.

వినియోగదారు ప్రశ్న: ${text}`
        : `You are a news analysis expert who helps verify if news is true or false. Analyze the news item the user is asking about and provide information about its authenticity and factual accuracy.

User's question: ${text}`;

    case 'schemes':
      return teluguMode 
        ? `మీరు ప్రభుత్వ పథకాలు మరియు ప్రయోజనాల నిపుణుడు. భారత ప్రభుత్వ మరియు రాష్ట్ర ప్రభుత్వ పథకాల గురించి వివరణాత్మక సమాచారం అందించండి. అర్హత, దరఖాస్తు ప్రక్రియ మరియు ప్రయోజనాల గురించి తెలియజేయండి. తెలుగులో సమాధానం ఇవ్వండి.

వినియోగదారు ప్రశ్న: ${text}`
        : `You are an expert on government schemes and benefits. Provide detailed information about Indian government and state government schemes. Include eligibility criteria, application process, and benefits.

User's question: ${text}`;

    default:
      return teluguMode 
        ? `దయచేసి తెలుగు భాషలో సమాధానం ఇవ్వండి. వినియోగదారు సందేశం: ${text}`
        : `Please respond in English. User message: ${text}`;
  }
};

export const sendMessage = async (
  text: string, 
  imageBase64?: string, 
  teluguMode: boolean = false,
  assistantMode: AssistantMode = 'general'
): Promise<string> => {
  try {
    const parts: any[] = [];
    
    // Analyze if the message is health-related (for general mode)
    const healthAnalysis = analyzeHealthContext(text);
    let processedText = text;
    
    // Generate appropriate prompt based on mode
    if (assistantMode === 'health' || (assistantMode === 'general' && healthAnalysis.requiresMedicalPrompt && text.trim())) {
      processedText = generateModePrompt(text, teluguMode, 'health');
      console.log('Health mode or health-related query detected. Using healthcare prompt.');
    } else if (assistantMode !== 'general' && text.trim()) {
      processedText = generateModePrompt(text, teluguMode, assistantMode);
      console.log(`Using ${assistantMode} mode prompt.`);
    } else if (teluguMode && text.trim()) {
      // Regular Telugu mode instruction
      processedText = `Please respond in Telugu language. User message: ${text}`;
    }
    
    // Add the processed text or image analysis instruction
    if (processedText.trim()) {
      parts.push({ text: processedText });
    }
    
    if (imageBase64) {
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: imageBase64
        }
      });
      
      // Add image analysis instruction if no text provided
      if (!text.trim()) {
        const analysisText = teluguMode 
          ? 'ఈ చిత్రాన్ని వివరంగా విశ్లేషించండి మరియు తెలుగులో వివరించండి.'
          : 'Please analyze this image in detail and describe what you see.';
        parts.unshift({ text: analysisText });
      }
    }

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: parts
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        teluguMode 
          ? `API లోపం: ${response.status} - ${response.statusText}`
          : `API Error: ${response.status} - ${response.statusText}`
      );
    }

    const data: ApiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error(
        teluguMode 
          ? 'AI నుండి ప్రతిస్పందన లేదు'
          : 'No response from AI'
      );
    }

    let aiResponse = data.candidates[0].content.parts[0].text;
    
    // For healthcare mode, the structured format already includes appropriate disclaimers
    // Only add additional disclaimers for general mode health queries
    if (assistantMode === 'general' && healthAnalysis.isHealthRelated) {
      aiResponse += getMedicalDisclaimer(teluguMode);
    }
    
    // Emergency warning is already handled in the structured format for healthcare mode
    // Only add for general mode emergency queries
    if (assistantMode === 'general' && healthAnalysis.isEmergency) {
      aiResponse = getEmergencyWarning(teluguMode) + '\n\n' + aiResponse;
    }
    
    return aiResponse;
    
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error(
      teluguMode 
        ? 'AI ప్రతిస్పందన పొందడంలో విఫలమైంది'
        : 'Failed to get AI response'
    );
  }
};