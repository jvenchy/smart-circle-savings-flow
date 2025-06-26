import OpenAI from 'openai';
import 'dotenv/config';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Valid life stages from project plan
const VALID_LIFE_STAGES = [
  'new_parent',
  'young_professional', 
  'established_family',
  'empty_nester',
  'student',
  'retiree',
  'single_adult',
  'couple_no_children',
  'health_conscious',
  'budget_conscious'
] as const;

// Type definitions for the classification response
export interface UserClassification {
  primary_stage: string;
  secondary_stages: string[];
  confidence_score: number;
  reasoning: string;
}

export async function classifyUserProfile(transactionSummary: string): Promise<UserClassification> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required but not found in environment variables');
  }

  if (!transactionSummary || transactionSummary.trim().length === 0) {
    throw new Error('Transaction summary is required and cannot be empty');
  }

  // Master prompt for retail data analysis
  const masterPrompt = `You are an expert retail data analyst specializing in customer life stage classification based on purchasing behavior. 

Your task is to analyze the provided transaction summary and classify the user into appropriate life stages.

VALID LIFE STAGES (you must only use these):
- new_parent: Recently had a baby, purchases baby products, formula, diapers
- young_professional: Career-focused, convenience foods, tech products, dining out
- established_family: Family with older children, bulk purchases, household items
- empty_nester: Children moved out, smaller quantities, premium products
- student: Budget-conscious, basic necessities, instant foods
- retiree: Fixed income, health products, smaller portions
- single_adult: Individual portions, convenience items, personal care
- couple_no_children: Shared purchases, entertainment, travel items
- health_conscious: Organic foods, supplements, fitness products
- budget_conscious: Sale items, generic brands, bulk basics

INSTRUCTIONS:
1. Analyze the transaction summary for patterns in product categories, spending amounts, and purchase frequency
2. Identify the PRIMARY life stage that best matches the spending patterns
3. Identify up to 2 SECONDARY life stages that may also apply
4. Provide a confidence score from 0.0 to 1.0 (where 1.0 is completely certain)
5. Explain your reasoning based on specific evidence from the transaction data

You must respond with a valid JSON object in this exact format:
{
  "primary_stage": "one_of_the_valid_life_stages",
  "secondary_stages": ["up_to_two_additional_stages"],
  "confidence_score": 0.85,
  "reasoning": "Detailed explanation of classification based on transaction patterns"
}

TRANSACTION SUMMARY TO ANALYZE:
${transactionSummary}

Respond only with the JSON object, no additional text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a retail data analyst. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: masterPrompt
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
      temperature: 0.3 // Lower temperature for more consistent classification
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from OpenAI API');
    }

    // Parse and validate the JSON response
    let classification: UserClassification;
    try {
      classification = JSON.parse(content);
    } catch (parseError) {
      throw new Error(`Failed to parse OpenAI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }

    // Validate the response structure
    if (!classification.primary_stage || typeof classification.primary_stage !== 'string') {
      throw new Error('Invalid response: missing or invalid primary_stage');
    }

    if (!Array.isArray(classification.secondary_stages)) {
      throw new Error('Invalid response: secondary_stages must be an array');
    }

    if (typeof classification.confidence_score !== 'number' || 
        classification.confidence_score < 0 || 
        classification.confidence_score > 1) {
      throw new Error('Invalid response: confidence_score must be a number between 0 and 1');
    }

    if (!classification.reasoning || typeof classification.reasoning !== 'string') {
      throw new Error('Invalid response: missing or invalid reasoning');
    }

    // Validate that stages are from the allowed list
    const validStages = new Set(VALID_LIFE_STAGES);
    if (!validStages.has(classification.primary_stage as any)) {
      throw new Error(`Invalid primary_stage: ${classification.primary_stage}. Must be one of: ${VALID_LIFE_STAGES.join(', ')}`);
    }

    for (const stage of classification.secondary_stages) {
      if (!validStages.has(stage as any)) {
        throw new Error(`Invalid secondary_stage: ${stage}. Must be one of: ${VALID_LIFE_STAGES.join(', ')}`);
      }
    }

    return classification;

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI classification failed: ${error.message}`);
    }
    throw new Error('Unknown error occurred during OpenAI classification');
  }
} 