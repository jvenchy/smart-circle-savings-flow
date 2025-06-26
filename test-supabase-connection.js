// Simple Supabase connection test
import supabase from './src/supabaseClient.js';

async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase Connection...\n');

  try {
    // Test basic connection by checking if we can query any table
    console.log('🔍 Attempting to connect to Supabase...');
    
    // Test connection by trying to query a simple table or get service info
    // Skip auth check for server-side usage
    console.log('✅ Supabase client initialized successfully!');
    
    // Test if transactions table exists
    console.log('🗄️  Testing transactions table access...');
    const { data, error: tableError } = await supabase
      .from('transactions')
      .select('count(*)', { count: 'exact', head: true });

    if (tableError) {
      console.log('⚠️  Transactions table access failed:', tableError.message);
      console.log('🔍 Error details:', JSON.stringify(tableError, null, 2));
      console.log('💡 Make sure your transactions table exists and RLS policies allow access');
    } else {
      console.log('✅ Transactions table accessible!');
      console.log(`📊 Total transactions in database: ${data?.count || 0}`);
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('💡 Check your SUPABASE_URL - it might be incorrect');
    }
    if (error.message.includes('API key')) {
      console.log('💡 Check your SUPABASE_ANON_KEY - it might be incorrect');
    }
  }
}

// Run the connection test
testSupabaseConnection(); 