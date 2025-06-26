// Test the API server endpoints
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';
const TEST_USER_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

async function testAPIServer() {
  console.log('🧪 Testing Smart Circle Savings API Server\n');

  try {
    // Test 1: Health check
    console.log('═══════════════════════════════════════');
    console.log('🏥 HEALTH CHECK');
    console.log('═══════════════════════════════════════');
    
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    
    console.log(`Status: ${healthResponse.status}`);
    console.log('Response:', JSON.stringify(healthData, null, 2));
    
    if (healthResponse.ok) {
      console.log('✅ Health check passed\n');
    } else {
      console.log('❌ Health check failed\n');
      return;
    }

    // Test 2: Get current user classification
    console.log('═══════════════════════════════════════');
    console.log('📋 GET USER CLASSIFICATION');
    console.log('═══════════════════════════════════════');
    
    const classificationResponse = await fetch(`${API_BASE}/user/${TEST_USER_ID}/classification`);
    const classificationData = await classificationResponse.json();
    
    console.log(`Status: ${classificationResponse.status}`);
    console.log('Response:', JSON.stringify(classificationData, null, 2));
    console.log('');

    // Test 3: Get transaction summary
    console.log('═══════════════════════════════════════');
    console.log('📊 GET TRANSACTION SUMMARY');
    console.log('═══════════════════════════════════════');
    
    const summaryResponse = await fetch(`${API_BASE}/user/${TEST_USER_ID}/transactions/summary?days=30`);
    const summaryData = await summaryResponse.json();
    
    console.log(`Status: ${summaryResponse.status}`);
    console.log('Response:', JSON.stringify(summaryData, null, 2));
    console.log('');

    // Test 4: Main classification endpoint
    console.log('═══════════════════════════════════════');
    console.log('🎯 POST /CLASSIFY (MAIN ENDPOINT)');
    console.log('═══════════════════════════════════════');
    
    const classifyResponse = await fetch(`${API_BASE}/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        days: 30
      })
    });
    
    const classifyData = await classifyResponse.json();
    
    console.log(`Status: ${classifyResponse.status}`);
    console.log('Response:', JSON.stringify(classifyData, null, 2));
    
    if (classifyResponse.ok) {
      console.log('\n✅ Classification completed successfully!');
      
      if (classifyData.data) {
        console.log('📋 Summary:');
        console.log(`   User ID: ${classifyData.data.userId}`);
        console.log(`   Classification: ${classifyData.data.classification.primary_stage}`);
        console.log(`   Confidence: ${(classifyData.data.classification.confidence_score * 100).toFixed(1)}%`);
        console.log(`   Secondary Stages: ${classifyData.data.classification.secondary_stages.join(', ') || 'None'}`);
        console.log(`   Transaction Summary: "${classifyData.data.transactionSummary}"`);
      }
    } else {
      console.log('\n❌ Classification failed');
    }

    // Test 5: Error handling - invalid user ID
    console.log('\n═══════════════════════════════════════');
    console.log('❌ ERROR HANDLING TEST');
    console.log('═══════════════════════════════════════');
    
    const errorResponse = await fetch(`${API_BASE}/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'invalid-user-id'
      })
    });
    
    const errorData = await errorResponse.json();
    
    console.log(`Status: ${errorResponse.status}`);
    console.log('Response:', JSON.stringify(errorData, null, 2));
    
    if (errorResponse.status >= 400) {
      console.log('✅ Error handling working correctly');
    }

    console.log('\n═══════════════════════════════════════');
    console.log('🎉 API TESTING COMPLETED');
    console.log('═══════════════════════════════════════');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the API server is running:');
      console.log('   npm run dev or npx tsx src/index.ts');
    }
  }
}

// Run the API tests
testAPIServer(); 