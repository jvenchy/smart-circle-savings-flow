// Test script for classification service
import { classifyUserProfile } from './src/classificationService.js';
import { summarizeUserTransactions } from './src/transactionService.js';

async function testClassificationService() {
  console.log('🤖 Testing OpenAI Classification Service...\n');

  try {
    // Test 1: Use our previous transaction summary
    console.log('📊 Step 1: Getting transaction summary...');
    const testUserId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
    const testDays = 30;
    
    const transactionSummary = await summarizeUserTransactions(testUserId, testDays);
    
    if (!transactionSummary) {
      console.log('❌ No transaction data found for user');
      return;
    }
    
    console.log('✅ Transaction summary retrieved:');
    console.log(`"${transactionSummary}"\n`);

    // Test 2: Classify the user profile
    console.log('🔍 Step 2: Classifying user profile with OpenAI...');
    const classification = await classifyUserProfile(transactionSummary);

    console.log('✅ Classification successful!\n');
    console.log('📋 CLASSIFICATION RESULTS:');
    console.log('═══════════════════════════════════════');
    console.log(`🎯 Primary Life Stage: ${classification.primary_stage}`);
    console.log(`🔗 Secondary Stages: ${classification.secondary_stages.join(', ') || 'None'}`);
    console.log(`📈 Confidence Score: ${(classification.confidence_score * 100).toFixed(1)}%`);
    console.log('💭 AI Reasoning:');
    console.log(`   ${classification.reasoning}`);
    console.log('═══════════════════════════════════════\n');

    // Test 3: Test with a custom summary
    console.log('🧪 Step 3: Testing with custom transaction summary...');
    const customSummary = "User has made 8 line-item purchases in the last 30 days. Key categories purchased: Electronics (60% of spend), Coffee & Beverages (25% of spend). Notable products: iPhone 15, MacBook Pro, Starbucks Coffee.";
    
    console.log('📝 Custom summary:');
    console.log(`"${customSummary}"\n`);
    
    const customClassification = await classifyUserProfile(customSummary);
    
    console.log('✅ Custom classification successful!');
    console.log('📋 CUSTOM CLASSIFICATION RESULTS:');
    console.log('═══════════════════════════════════════');
    console.log(`🎯 Primary Life Stage: ${customClassification.primary_stage}`);
    console.log(`🔗 Secondary Stages: ${customClassification.secondary_stages.join(', ') || 'None'}`);
    console.log(`📈 Confidence Score: ${(customClassification.confidence_score * 100).toFixed(1)}%`);
    console.log('💭 AI Reasoning:');
    console.log(`   ${customClassification.reasoning}`);
    console.log('═══════════════════════════════════════');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('OPENAI_API_KEY')) {
      console.log('\n💡 Please add your OpenAI API key to your .env file:');
      console.log('   OPENAI_API_KEY=your_openai_api_key_here');
    }
    
    if (error.message.includes('rate limit') || error.message.includes('quota')) {
      console.log('\n💡 OpenAI rate limit or quota exceeded. Check your OpenAI account.');
    }
  }
}

// Run the test
testClassificationService(); 