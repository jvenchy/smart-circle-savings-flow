// Basic database exploration test
import supabase from './src/supabaseClient.js';

async function testBasicQueries() {
  console.log('🔍 Testing Basic Database Queries...\n');

  try {
    // Test 1: Try to query users table (should exist from your schema)
    console.log('📋 Testing users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table accessible!');
      console.log(`👥 Found ${users?.length || 0} users`);
      if (users && users.length > 0) {
        console.log('🔍 Sample user:', users[0]);
      }
    }

    // Test 2: Try to query transactions table
    console.log('\n📋 Testing transactions table...');
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .limit(5);

    if (transError) {
      console.log('❌ Transactions table error:', transError.message);
      console.log('🔍 Full error:', JSON.stringify(transError, null, 2));
    } else {
      console.log('✅ Transactions table accessible!');
      console.log(`💳 Found ${transactions?.length || 0} transactions`);
      if (transactions && transactions.length > 0) {
        console.log('🔍 Sample transaction:', transactions[0]);
      }
    }

    // Test 3: Try a simple count query
    console.log('\n📋 Testing count query...');
    const { count, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Count query error:', countError.message);
    } else {
      console.log('✅ Count query successful!');
      console.log(`🔢 Total transactions: ${count}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBasicQueries(); 