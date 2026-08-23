import Groq from 'groq-sdk';

// Initialize Groq client
// It will automatically use the GROQ_API_KEY from environment variables
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key_to_prevent_startup_crash' });

export const generatePreVisitSummary = async (symptoms: string) => {
  const prompt = `Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, three suggested questions for the doctor, and the most appropriate medical specialization from this list ONLY: [Cardiology, Neurology, Orthopedics, Dermatology, General Medicine, Pediatrics, Psychiatry, Diagnostic Medicine]. Symptoms: <${symptoms}>

Respond STRICTLY with valid JSON in the following format, with no other text or markdown wrapping:
{
  "urgencyLevel": "Low | Medium | High",
  "chiefComplaint": "Short description",
  "suggestedQuestions": ["Q1", "Q2", "Q3"],
  "recommendedSpecialization": "One of the provided specializations"
}`;

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-120b', // Upgrade to a much smarter model
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No content returned from Groq');
    
    const parsed = JSON.parse(content);
    
    // Sanitize suggested questions to remove hallucinations
    if (Array.isArray(parsed.suggestedQuestions)) {
      parsed.suggestedQuestions = parsed.suggestedQuestions.filter((q: string) => 
        typeof q === 'string' && q.trim().length > 5 && q.trim().endsWith('?')
      ).slice(0, 3); // Keep only max 3
    }

    return parsed;
  } catch (error: any) {
    console.error('Groq AI Error (Pre-visit):', error);
    // REMOVED GRACEFUL FALLBACK FOR DEBUGGING
    throw new Error(`AI Triage Failed: ${error.message || 'Unknown error'}`);
  }
};

export const generatePostVisitSummary = async (notes: string) => {
  const prompt = `Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: <${notes}>

Respond STRICTLY with valid JSON in the following format, with no other text or markdown wrapping:
{
  "patientSummary": "Simple, patient-friendly explanation of the visit",
  "medicationSchedule": [
    { "medicationName": "Name", "dosage": "Dosage", "frequency": "Frequency", "duration": "Duration" }
  ],
  "followUpSteps": ["Step 1", "Step 2"]
}`;

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-120b', // Upgrade to a much smarter model
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No content returned from Groq');
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Groq AI Error (Post-visit):', error);
    // Graceful fallback
    return {
      patientSummary: 'Failed to generate summary. Please refer directly to doctor instructions.',
      medicationSchedule: [],
      followUpSteps: []
    };
  }
};
