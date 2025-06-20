// Health-related keyword detection and medical prompt generation

export interface HealthKeywords {
  symptoms: string[];
  medical: string[];
  body: string[];
  conditions: string[];
  treatments: string[];
  general: string[];
}

// Comprehensive health-related keywords for detection
const healthKeywords: HealthKeywords = {
  symptoms: [
    'fever', 'headache', 'pain', 'ache', 'hurt', 'sore', 'swollen', 'swelling',
    'cough', 'cold', 'flu', 'nausea', 'vomit', 'diarrhea', 'constipation',
    'dizzy', 'tired', 'fatigue', 'weakness', 'breathless', 'shortness of breath',
    'chest pain', 'stomach pain', 'back pain', 'joint pain', 'muscle pain',
    'rash', 'itchy', 'burning', 'tingling', 'numbness', 'bleeding', 'bruise',
    'infection', 'inflammation', 'discharge', 'lump', 'bump', 'growth'
  ],
  medical: [
    'doctor', 'physician', 'medical', 'medicine', 'medication', 'drug', 'pill',
    'tablet', 'capsule', 'injection', 'vaccine', 'treatment', 'therapy',
    'surgery', 'operation', 'procedure', 'diagnosis', 'test', 'examination',
    'prescription', 'dosage', 'side effect', 'allergy', 'allergic'
  ],
  body: [
    'heart', 'lung', 'liver', 'kidney', 'brain', 'stomach', 'intestine',
    'blood', 'pressure', 'bp', 'pulse', 'temperature', 'weight', 'height',
    'skin', 'eye', 'ear', 'nose', 'throat', 'mouth', 'tooth', 'teeth',
    'bone', 'muscle', 'joint', 'nerve', 'organ'
  ],
  conditions: [
    'diabetes', 'hypertension', 'asthma', 'cancer', 'tumor', 'covid', 'corona',
    'dengue', 'malaria', 'typhoid', 'pneumonia', 'bronchitis', 'arthritis',
    'migraine', 'depression', 'anxiety', 'stress', 'insomnia', 'obesity',
    'anemia', 'thyroid', 'cholesterol', 'stroke', 'attack', 'seizure'
  ],
  treatments: [
    'cure', 'heal', 'recover', 'remedy', 'relief', 'prevent', 'avoid',
    'diet', 'exercise', 'rest', 'sleep', 'nutrition', 'vitamin', 'supplement',
    'home remedy', 'natural', 'ayurveda', 'herbal', 'antibiotic', 'painkiller'
  ],
  general: [
    'health', 'healthy', 'sick', 'illness', 'disease', 'condition', 'disorder',
    'syndrome', 'symptom', 'emergency', 'urgent', 'serious', 'chronic', 'acute',
    'hospital', 'clinic', 'appointment', 'checkup', 'consultation'
  ]
};

// Telugu health keywords for better detection in Telugu mode
const teluguHealthKeywords = [
  'జ్వరం', 'తలనొప్పి', 'నొప్పి', 'దగ్గు', 'జలుబు', 'వాంతులు', 'విరేచనలు',
  'వైద్యుడు', 'డాక్టర్', 'మందు', 'మెడిసిన్', 'చికిత్స', 'వైద్యం',
  'గుండె', 'ఊపిరితిత్తులు', 'కాలేయం', 'మూత్రపిండాలు', 'రక్తం', 'ప్రెషర్',
  'మధుమేహం', 'షుగర్', 'బీపీ', 'ఆరోగ్యం', 'అనారోగ్యం', 'వ్యాధి', 'లక్షణాలు'
];

/**
 * Detects if a message contains health-related content
 */
export const isHealthRelated = (message: string): boolean => {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const lowerMessage = message.toLowerCase();
  
  // Check English keywords
  const allKeywords = [
    ...healthKeywords.symptoms,
    ...healthKeywords.medical,
    ...healthKeywords.body,
    ...healthKeywords.conditions,
    ...healthKeywords.treatments,
    ...healthKeywords.general
  ];
  
  const hasEnglishKeywords = allKeywords.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  // Check Telugu keywords
  const hasTeluguKeywords = teluguHealthKeywords.some(keyword => 
    message.includes(keyword)
  );
  
  // Check for common health-related phrases
  const healthPhrases = [
    'what should i do', 'how to treat', 'how to cure', 'is it safe',
    'side effects', 'home remedy', 'natural treatment', 'when to see doctor',
    'symptoms of', 'causes of', 'prevention of', 'risk factors'
  ];
  
  const hasHealthPhrases = healthPhrases.some(phrase => 
    lowerMessage.includes(phrase)
  );
  
  return hasEnglishKeywords || hasTeluguKeywords || hasHealthPhrases;
};

/**
 * Generates appropriate medical prompt based on language mode
 */
export const generateMedicalPrompt = (originalMessage: string, teluguMode: boolean): string => {
  const basePrompt = teluguMode
    ? `మీరు ఒక అనుభవజ్ఞుడైన మరియు విశ్వసనీయ వైద్యుడు. ఈ వినియోగదారు ప్రశ్నకు వృత్తిపరమైన, సహాయకరమైన మరియు బాధ్యతాయుతమైన సమాధానం ఇవ్వండి. ఎల్లప్పుడూ తెలుగులో సమాధానం ఇవ్వండి. తీవ్రమైన లక్షణాలు ఉంటే వైద్యుడిని సంప్రదించమని సూచించండి.

వినియోగదారు ప్రశ్న: ${originalMessage}`
    : `You are a qualified, experienced, and trusted medical doctor. Please provide a professional, helpful, and responsible answer to this user's health question. Always include appropriate medical disclaimers and suggest consulting a real doctor for serious symptoms or emergencies.

User's question: ${originalMessage}`;

  return basePrompt;
};

/**
 * Generates medical disclaimer based on language mode
 */
export const getMedicalDisclaimer = (teluguMode: boolean): string => {
  return teluguMode
    ? '\n\n⚠️ వైద్య నిరాకరణ: ఈ సమాచారం సాధారణ మార్గదర్శకత్వం కోసం మాత్రమే. తీవ్రమైన లక్షణాలు లేదా అత్యవసర పరిస్థితుల్లో దయచేసి వెంటనే అర్హత కలిగిన వైద్యుడిని సంప్రదించండి.'
    : '\n\n⚠️ Medical Disclaimer: This information is for general guidance only. Please consult a qualified healthcare professional immediately for serious symptoms or medical emergencies.';
};

/**
 * Checks if message indicates emergency symptoms
 */
export const hasEmergencySymptoms = (message: string): boolean => {
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'stroke', 'seizure', 'unconscious',
    'bleeding heavily', 'severe pain', 'can\'t breathe', 'emergency',
    'urgent', 'critical', 'life threatening', 'ambulance', 'hospital now'
  ];
  
  const teluguEmergencyKeywords = [
    'గుండెనొప్పి', 'గుండెపోటు', 'తీవ్రమైన నొప్పి', 'అత్యవసరం', 'ఆసుపత్రి'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  return emergencyKeywords.some(keyword => lowerMessage.includes(keyword)) ||
         teluguEmergencyKeywords.some(keyword => message.includes(keyword));
};

/**
 * Generates emergency warning message
 */
export const getEmergencyWarning = (teluguMode: boolean): string => {
  return teluguMode
    ? '🚨 అత్యవసర హెచ్చరిక: మీ లక్షణాలు తీవ్రంగా అనిపిస్తున్నాయి. దయచేసి వెంటనే అత్యవసర సేవలను (108) సంప్రదించండి లేదా సమీప ఆసుపత్రికి వెళ్లండి. ఆలస్యం చేయవద్దు!'
    : '🚨 EMERGENCY WARNING: Your symptoms sound serious. Please call emergency services (911/108) immediately or go to the nearest hospital. Do not delay seeking immediate medical attention!';
};

/**
 * Enhanced health detection with context analysis
 */
export const analyzeHealthContext = (message: string) => {
  const isHealth = isHealthRelated(message);
  const isEmergency = hasEmergencySymptoms(message);
  
  // Determine confidence level
  let confidence = 0;
  const lowerMessage = message.toLowerCase();
  
  // High confidence indicators
  if (lowerMessage.includes('doctor') || lowerMessage.includes('medical') || 
      lowerMessage.includes('symptoms') || lowerMessage.includes('pain')) {
    confidence += 0.4;
  }
  
  // Medium confidence indicators
  if (lowerMessage.includes('health') || lowerMessage.includes('medicine') ||
      lowerMessage.includes('treatment') || lowerMessage.includes('cure')) {
    confidence += 0.3;
  }
  
  // Body parts or conditions
  const bodyParts = ['head', 'chest', 'stomach', 'back', 'heart', 'lung'];
  if (bodyParts.some(part => lowerMessage.includes(part))) {
    confidence += 0.2;
  }
  
  // Question patterns
  if (lowerMessage.includes('what should i') || lowerMessage.includes('how to') ||
      lowerMessage.includes('is it safe') || lowerMessage.includes('side effect')) {
    confidence += 0.1;
  }
  
  return {
    isHealthRelated: isHealth,
    isEmergency: isEmergency,
    confidence: Math.min(confidence, 1.0),
    requiresMedicalPrompt: isHealth && confidence > 0.3
  };
};