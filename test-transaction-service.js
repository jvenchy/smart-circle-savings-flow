// Test script for transaction service
import { summarizeUserTransactions } from './src/transactionService.js';

async function testTransactionService() {
  console.log('🧪 Testing Transaction Service...\n');

  try {
    // Test with an actual user ID from the database
    const testUserId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
    const testDays = 30;

    console.log(`📊 Fetching transactions for user: ${testUserId}`);
    console.log(`📅 Looking back: ${testDays} days\n`);

    const result = await summarizeUserTransactions(testUserId, testDays);

    if (result === null) {
      console.log('✅ Connection successful!');
      console.log('ℹ️  No transactions found for this user (this is expected for a test user)');
    } else {
      console.log('✅ Connection successful!');
      console.log('📋 Transaction summary:');
      console.log(result);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('SUPABASE_URL') || error.message.includes('SUPABASE_ANON_KEY')) {
      console.log('\n💡 Please update your .env file with your actual Supabase credentials:');
      console.log('   SUPABASE_URL=your_actual_supabase_url');
      console.log('   SUPABASE_ANON_KEY=your_actual_anon_key');
    }
  }
}

// Run the test
testTransactionService(); 