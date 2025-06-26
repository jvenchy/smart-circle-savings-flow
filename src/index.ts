import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { summarizeUserTransactions } from './transactionService';
import { classifyUserProfile, UserClassification } from './classificationService';
import { updateUserLifeStage, getCurrentUserClassification } from './databaseService';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Types for API requests and responses
interface ClassifyRequest {
  userId: string;
  days?: number; // Optional, defaults to 30
}

interface ClassifyResponse {
  success: boolean;
  data?: {
    userId: string;
    transactionSummary: string;
    classification: UserClassification;
    previousClassification?: {
      primary_stage: string | null;
      secondary_stages: string[] | null;
      confidence_score: number | null;
    } | null;
    updated: boolean;
  };
  error?: string;
  message?: string;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      supabase: 'connected',
      openai: 'available'
    }
  });
});

// Main classification endpoint
app.post('/classify', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validate request body
    const { userId, days = 30 }: ClassifyRequest = req.body;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: userId is required and must be a string'
      } as ClassifyResponse);
    }

    if (days && (typeof days !== 'number' || days < 1 || days > 365)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: days must be a number between 1 and 365'
      } as ClassifyResponse);
    }

    console.log(`🚀 Starting classification for user: ${userId} (${days} days)`);

    // Step 1: Get current classification (for comparison)
    console.log('📋 Fetching current user classification...');
    const previousClassification = await getCurrentUserClassification(userId);
    
    // Step 2: Analyze transactions
    console.log('📊 Analyzing user transactions...');
    const transactionSummary = await summarizeUserTransactions(userId, days);
    
    if (!transactionSummary) {
      return res.status(404).json({
        success: false,
        error: `No transactions found for user ${userId} in the last ${days} days`
      } as ClassifyResponse);
    }

    console.log(`✅ Transaction summary: "${transactionSummary}"`);

    // Step 3: Classify with AI
    console.log('🤖 Classifying user profile with AI...');
    const classification = await classifyUserProfile(transactionSummary);
    
    console.log(`✅ AI Classification: ${classification.primary_stage} (${(classification.confidence_score * 100).toFixed(1)}%)`);

    // Step 4: Update database
    console.log('💾 Updating user profile in database...');
    await updateUserLifeStage(userId, classification);
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Classification completed in ${processingTime}ms`);

    // Return success response
    const response: ClassifyResponse = {
      success: true,
      data: {
        userId,
        transactionSummary,
        classification,
        previousClassification,
        updated: true
      },
      message: `User profile classified as ${classification.primary_stage} with ${(classification.confidence_score * 100).toFixed(1)}% confidence`
    };

    res.status(200).json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Classification failed after ${processingTime}ms:`, error);

    // Handle specific error types
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      if (error.message.includes('User not found')) {
        statusCode = 404;
        errorMessage = 'User not found';
      } else if (error.message.includes('OPENAI_API_KEY')) {
        statusCode = 500;
        errorMessage = 'OpenAI API configuration error';
      } else if (error.message.includes('Failed to fetch transactions')) {
        statusCode = 500;
        errorMessage = 'Database connection error';
      } else if (error.message.includes('rate limit')) {
        statusCode = 429;
        errorMessage = 'OpenAI rate limit exceeded';
      } else {
        errorMessage = error.message;
      }
    }

    const errorResponse: ClassifyResponse = {
      success: false,
      error: errorMessage
    };

    res.status(statusCode).json(errorResponse);
  }
});

// Get current user classification endpoint
app.get('/user/:userId/classification', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    console.log(`📋 Fetching classification for user: ${userId}`);
    
    const classification = await getCurrentUserClassification(userId);
    
    if (!classification) {
      return res.status(404).json({
        success: false,
        error: 'User not found or no classification available'
      });
    }

    res.json({
      success: true,
      data: {
        userId,
        ...classification
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user classification:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Get user transaction summary endpoint
app.get('/user/:userId/transactions/summary', async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    console.log(`📊 Fetching transaction summary for user: ${userId} (${days} days)`);
    
    const summary = await summarizeUserTransactions(userId, days);
    
    if (!summary) {
      return res.status(404).json({
        success: false,
        error: `No transactions found for user in the last ${days} days`
      });
    }

    res.json({
      success: true,
      data: {
        userId,
        days,
        summary
      }
    });

  } catch (error) {
    console.error('❌ Error fetching transaction summary:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Smart Circle Savings API Server Started');
  console.log('═══════════════════════════════════════');
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Main endpoint: POST http://localhost:${PORT}/classify`);
  console.log(`📋 User classification: GET http://localhost:${PORT}/user/:userId/classification`);
  console.log(`📊 Transaction summary: GET http://localhost:${PORT}/user/:userId/transactions/summary`);
  console.log('═══════════════════════════════════════');
  console.log('✅ Ready to process classification requests!');
});

export default app; 