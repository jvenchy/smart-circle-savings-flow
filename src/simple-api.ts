import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { summarizeUserTransactions } from './transactionService';
import { classifyUserProfile } from './classificationService';
import { updateUserLifeStage } from './databaseService';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Main classification endpoint
app.post('/classify', async (req, res) => {
  try {
    const { userId, days = 30 } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    console.log(`🚀 Starting classification for user: ${userId}`);

    // Step 1: Analyze transactions
    const transactionSummary = await summarizeUserTransactions(userId, days);
    
    if (!transactionSummary) {
      return res.status(404).json({
        success: false,
        error: 'No transactions found'
      });
    }

    // Step 2: Classify with AI
    const classification = await classifyUserProfile(transactionSummary);

    // Step 3: Update database
    await updateUserLifeStage(userId, classification);

    // Return success
    res.json({
      success: true,
      data: {
        userId,
        transactionSummary,
        classification
      }
    });

  } catch (error) {
    console.error('❌ Classification failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🎯 Classify: POST http://localhost:${PORT}/classify`);
});

export default app; 