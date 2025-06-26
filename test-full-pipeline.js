// Full pipeline test: Transactions → Classification → Database Updates
import { summarizeUserTransactions } from './src/transactionService.js';
import { classifyUserProfile } from './src/classificationService.js';
import { 
  updateUserLifeStage, 
  getCurrentUserClassification, 
  getUserLifeStageHistory 
} from './src/databaseService.js';

async function testFullPipeline() {
  console.log('🚀 Testing Full Pipeline: Transactions → AI → Database\n');
  
  const testUserId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  const testDays = 30;

  try {
    console.log('═══════════════════════════════════════');
    console.log('📊 STEP 1: TRANSACTION ANALYSIS');
    console.log('═══════════════════════════════════════');
    
    console.log(`🔍 Analyzing transactions for user: ${testUserId}`);
    console.log(`📅 Looking back: ${testDays} days\n`);

    const transactionSummary = await summarizeUserTransactions(testUserId, testDays);
    
    if (!transactionSummary) {
      console.log('❌ No transaction data found');
      return;
    }
    
    console.log('✅ Transaction summary generated:');
    console.log(`📋 "${transactionSummary}"\n`);

    console.log('═══════════════════════════════════════');
    console.log('🤖 STEP 2: AI CLASSIFICATION');
    console.log('═══════════════════════════════════════');
    
    console.log('🔍 Sending to OpenAI for classification...\n');
    
    const classification = await classifyUserProfile(transactionSummary);
    
    console.log('✅ Classification completed:');
    console.log(`🎯 Primary Stage: ${classification.primary_stage}`);
    console.log(`🔗 Secondary Stages: ${classification.secondary_stages.join(', ') || 'None'}`);
    console.log(`📈 Confidence: ${(classification.confidence_score * 100).toFixed(1)}%`);
    console.log(`💭 Reasoning: ${classification.reasoning}\n`);

    console.log('═══════════════════════════════════════');
    console.log('💾 STEP 3: DATABASE UPDATES');
    console.log('═══════════════════════════════════════');
    
    console.log('🔍 Checking current user classification...\n');
    
    const currentClassification = await getCurrentUserClassification(testUserId);
    
    if (currentClassification) {
      console.log('📋 Current classification in database:');
      console.log(`   Primary: ${currentClassification.primary_stage || 'None'}`);
      console.log(`   Secondary: ${currentClassification.secondary_stages?.join(', ') || 'None'}`);
      console.log(`   Confidence: ${currentClassification.confidence_score ? (currentClassification.confidence_score * 100).toFixed(1) + '%' : 'None'}\n`);
    } else {
      console.log('📋 No existing classification found\n');
    }

    console.log('🔄 Updating user life stage in database...\n');
    
    await updateUserLifeStage(testUserId, classification);
    
    console.log('\n═══════════════════════════════════════');
    console.log('📋 STEP 4: VERIFICATION');
    console.log('═══════════════════════════════════════');
    
    console.log('🔍 Fetching updated user classification...\n');
    
    const updatedClassification = await getCurrentUserClassification(testUserId);
    
    if (updatedClassification) {
      console.log('✅ Updated classification verified:');
      console.log(`   Primary: ${updatedClassification.primary_stage}`);
      console.log(`   Secondary: ${updatedClassification.secondary_stages?.join(', ') || 'None'}`);
      console.log(`   Confidence: ${(updatedClassification.confidence_score * 100).toFixed(1)}%\n`);
    }

    console.log('🔍 Fetching life stage history...\n');
    
    const history = await getUserLifeStageHistory(testUserId);
    
    console.log(`📚 Life stage history (${history.length} entries):`);
    
    if (history.length > 0) {
      history.forEach((entry, index) => {
        const startDate = new Date(entry.started_at).toLocaleDateString();
        const endDate = entry.ended_at ? new Date(entry.ended_at).toLocaleDateString() : 'Present';
        console.log(`   ${index + 1}. ${entry.life_stage} (${startDate} - ${endDate})`);
        console.log(`      Confidence: ${(entry.confidence_score * 100).toFixed(1)}%`);
        if (entry.transition_evidence) {
          console.log(`      Evidence: ${entry.transition_evidence.substring(0, 100)}...`);
        }
        console.log('');
      });
    } else {
      console.log('   No history entries found');
    }

    console.log('═══════════════════════════════════════');
    console.log('🎉 PIPELINE COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════');
    
    console.log('📊 Summary:');
    console.log(`✅ Transactions analyzed: ${transactionSummary.match(/\d+/)[0]} line items`);
    console.log(`✅ AI classification: ${classification.primary_stage} (${(classification.confidence_score * 100).toFixed(1)}%)`);
    console.log(`✅ Database updated: User profile and history`);
    console.log(`✅ History entries: ${history.length} total`);

  } catch (error) {
    console.error('❌ Pipeline failed:', error.message);
    
    if (error.message.includes('OPENAI_API_KEY')) {
      console.log('\n💡 Please ensure your OpenAI API key is set in .env');
    }
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('\n💡 Please run the database-update.sql script in your Supabase SQL editor to create the required tables and columns');
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure database-update.sql has been run');
    console.log('   2. Check that OPENAI_API_KEY is in your .env file');
    console.log('   3. Verify SUPABASE_SERVICE_ROLE_KEY is set correctly');
  }
}

// Run the full pipeline test
testFullPipeline(); 