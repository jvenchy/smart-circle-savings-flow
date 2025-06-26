// Check what users exist in the database
import supabase from './src/supabaseClient.js';

async function exploreUsers() {
  console.log('🔍 EXPLORING USERS IN DATABASE\n');

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, life_stage, postal_code')
      .limit(10);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    console.log(`Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name || 'No name'} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Life Stage: ${user.life_stage || 'Not set'}`);
      console.log(`   Location: ${user.postal_code || 'Not set'}`);
      console.log('');
    });

    // Check transaction counts for each user
    console.log('📊 TRANSACTION ANALYSIS PER USER:\n');
    
    for (const user of users) {
      const { count, error: countError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.log(`❌ Error counting transactions for ${user.full_name}: ${countError.message}`);
        continue;
      }

      // Get sample transactions
      const { data: sampleTransactions, error: sampleError } = await supabase
        .from('transactions')
        .select('category, product_name, price, quantity, timestamp')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(3);

      console.log(`👤 ${user.full_name}:`);
      console.log(`   Total transactions: ${count}`);
      console.log(`   Current life stage: ${user.life_stage || 'None'}`);
      
      if (sampleTransactions && sampleTransactions.length > 0) {
        console.log(`   Recent purchases:`);
        sampleTransactions.forEach(tx => {
          const date = new Date(tx.timestamp).toLocaleDateString();
          console.log(`     - ${tx.product_name} (${tx.category}) $${tx.price} x${tx.quantity} [${date}]`);
        });
      } else {
        console.log(`   No recent transactions found`);
      }
      console.log('');
    }

    // Get category distribution
    console.log('📈 CATEGORY DISTRIBUTION ACROSS ALL USERS:\n');
    
    const { data: categories, error: catError } = await supabase
      .from('transactions')
      .select('category, price, quantity')
      .order('category');

    if (catError) {
      console.log(`❌ Error fetching categories: ${catError.message}`);
    } else {
      const categoryStats = categories.reduce((acc, tx) => {
        const cat = tx.category;
        if (!acc[cat]) {
          acc[cat] = { count: 0, totalAmount: 0 };
        }
        acc[cat].count += 1;
        acc[cat].totalAmount += tx.price * tx.quantity;
        return acc;
      }, {});

      Object.entries(categoryStats)
        .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
        .forEach(([category, stats]) => {
          console.log(`${category}: ${stats.count} transactions, $${stats.totalAmount.toFixed(2)} total`);
        });
    }

  } catch (error) {
    console.error('❌ Failed to explore users:', error.message);
  }
}

// Run the exploration
exploreUsers(); 