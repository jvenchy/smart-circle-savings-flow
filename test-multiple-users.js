// Comprehensive test cases for multiple users with different spending patterns
import { summarizeUserTransactions } from './src/transactionService.js';
import { classifyUserProfile } from './src/classificationService.js';
import { updateUserLifeStage, getCurrentUserClassification } from './src/databaseService.js';

// Test user scenarios based on REAL data from your database
const TEST_USERS = [
  {
    id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345',
    name: 'Taylor Martin',
    expectedStage: 'new_parent',
    description: 'Parent with baby purchases - baby puffs, wipes, apples',
    currentStage: 'Parent',
    transactionCount: 13
  },
  {
    id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234',
    name: 'Jesse Jones',
    expectedStage: 'young_professional',
    description: 'Young professional - avocado, coffee beans, ready meals',
    currentStage: 'Young Professional',
    transactionCount: 17
  },
  {
    id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    name: 'Skyler Moore',
    expectedStage: 'student',
    description: 'Student - cheap snacks, ramen, energy drinks',
    currentStage: 'Student',
    transactionCount: 16
  },
  {
    id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12',
    name: 'Quinn Anderson',
    expectedStage: 'health_conscious',
    description: 'Athlete - Greek yogurt, Gatorade, chicken breast',
    currentStage: 'Athlete',
    transactionCount: 20
  },
  {
    id: 'd4e5f6a7-b8c9-0123-4567-890abcdef123',
    name: 'Riley Wilson',
    expectedStage: 'retiree',
    description: 'Senior - single portions, salmon, tea, bread',
    currentStage: 'Senior',
    transactionCount: 16
  },
  {
    id: '5e6f7a8b-9c0d-1234-5678-efabcd901234',
    name: 'Jesse Moore',
    expectedStage: 'young_professional',
    description: 'Young professional - sparkling water, hummus, brie cheese',
    currentStage: 'Young Professional',
    transactionCount: 3
  }
];

// Test scenarios with different time periods
const TEST_SCENARIOS = [
  { days: 7, description: '1 week analysis' },
  { days: 30, description: '1 month analysis' },
  { days: 90, description: '3 month analysis' }
];

async function testMultipleUsers() {
  console.log('🧪 COMPREHENSIVE USER CLASSIFICATION TESTING');
  console.log('═'.repeat(60));
  console.log(`Testing ${TEST_USERS.length} users across ${TEST_SCENARIOS.length} time periods\n`);

  const results = [];
  let totalTests = 0;
  let successfulTests = 0;

  for (const user of TEST_USERS) {
    console.log(`👤 TESTING USER: ${user.name} (${user.id})`);
    console.log(`📋 Expected: ${user.expectedStage}`);
    console.log(`📝 Profile: ${user.description}`);
    console.log('─'.repeat(50));

    const userResults = [];

    for (const scenario of TEST_SCENARIOS) {
      totalTests++;
      
      try {
        console.log(`\n⏱️  ${scenario.description} (${scenario.days} days)`);
        
        // Get transaction summary
        const transactionSummary = await summarizeUserTransactions(user.id, scenario.days);
        
        if (!transactionSummary) {
          console.log(`   ❌ No transactions found for ${scenario.days} days`);
          userResults.push({
            days: scenario.days,
            status: 'no_data',
            error: 'No transactions found'
          });
          continue;
        }

        console.log(`   📊 Summary: "${transactionSummary}"`);

        // Get AI classification
        const classification = await classifyUserProfile(transactionSummary);
        
        console.log(`   🤖 AI Result: ${classification.primary_stage}`);
        console.log(`   📈 Confidence: ${(classification.confidence_score * 100).toFixed(1)}%`);
        console.log(`   🔗 Secondary: ${classification.secondary_stages.join(', ') || 'None'}`);
        
        // Check if classification matches expectation
        const isCorrect = classification.primary_stage === user.expectedStage;
        const highConfidence = classification.confidence_score >= 0.8;
        
        if (isCorrect) {
          console.log(`   ✅ CORRECT classification!`);
          successfulTests++;
        } else {
          console.log(`   ⚠️  Expected ${user.expectedStage}, got ${classification.primary_stage}`);
        }

        if (highConfidence) {
          console.log(`   💪 High confidence (${(classification.confidence_score * 100).toFixed(1)}%)`);
        } else {
          console.log(`   🤔 Low confidence (${(classification.confidence_score * 100).toFixed(1)}%)`);
        }

        userResults.push({
          days: scenario.days,
          status: 'success',
          transactionSummary,
          classification,
          isCorrect,
          highConfidence
        });

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        userResults.push({
          days: scenario.days,
          status: 'error',
          error: error.message
        });
      }
    }

    results.push({
      user,
      results: userResults
    });

    console.log('\n' + '═'.repeat(60) + '\n');
  }

  // Summary report
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('═'.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Successful: ${successfulTests}`);
  console.log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%\n`);

  // Detailed results by user
  results.forEach(({ user, results: userResults }) => {
    const successCount = userResults.filter(r => r.status === 'success' && r.isCorrect).length;
    const totalCount = userResults.filter(r => r.status === 'success').length;
    
    console.log(`👤 ${user.name}:`);
    console.log(`   Expected: ${user.expectedStage}`);
    console.log(`   Accuracy: ${totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : 0}% (${successCount}/${totalCount})`);
    
    userResults.forEach(result => {
      if (result.status === 'success') {
        const icon = result.isCorrect ? '✅' : '❌';
        const confidence = `${(result.classification.confidence_score * 100).toFixed(1)}%`;
        console.log(`   ${result.days}d: ${icon} ${result.classification.primary_stage} (${confidence})`);
      } else {
        console.log(`   ${result.days}d: ❌ ${result.status}`);
      }
    });
    console.log('');
  });

  return results;
}

// Test edge cases and specific scenarios
async function testEdgeCases() {
  console.log('🔬 EDGE CASE TESTING');
  console.log('═'.repeat(60));

  const edgeCases = [
    {
      name: 'Empty User ID',
      test: async () => {
        try {
          await summarizeUserTransactions('', 30);
          return { status: 'unexpected_success' };
        } catch (error) {
          return { status: 'expected_error', message: error.message };
        }
      }
    },
    {
      name: 'Non-existent User',
      test: async () => {
        try {
          const result = await summarizeUserTransactions('00000000-0000-0000-0000-000000000000', 30);
          return { status: result ? 'unexpected_data' : 'expected_null', result };
        } catch (error) {
          return { status: 'error', message: error.message };
        }
      }
    },
         {
       name: 'Very short time period (1 day)',
       test: async () => {
         try {
           const result = await summarizeUserTransactions('f6a7b8c9-d0e1-2345-6789-0abcdef12345', 1);
           return { status: 'success', hasData: !!result, result };
         } catch (error) {
           return { status: 'error', message: error.message };
         }
       }
     },
     {
       name: 'Very long time period (365 days)',
       test: async () => {
         try {
           const result = await summarizeUserTransactions('f6a7b8c9-d0e1-2345-6789-0abcdef12345', 365);
           return { status: 'success', hasData: !!result, result };
         } catch (error) {
           return { status: 'error', message: error.message };
         }
       }
     }
  ];

  for (const edgeCase of edgeCases) {
    console.log(`🧪 Testing: ${edgeCase.name}`);
    try {
      const result = await edgeCase.test();
      console.log(`   Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.log(`   Unexpected error: ${error.message}`);
    }
    console.log('');
  }
}

// Test API endpoint with multiple users
async function testAPIEndpoints() {
  console.log('🌐 API ENDPOINT TESTING');
  console.log('═'.repeat(60));

  const API_BASE = 'http://localhost:3001';
  
  // Test a few users via API
  const testUsers = TEST_USERS.slice(0, 3); // Test first 3 users
  
  for (const user of testUsers) {
    console.log(`🔗 Testing API for ${user.name}`);
    
    try {
      const response = await fetch(`${API_BASE}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          days: 30
        })
      });

      const data = await response.json();
      
      console.log(`   Status: ${response.status}`);
      if (data.success) {
        console.log(`   Classification: ${data.data.classification.primary_stage}`);
        console.log(`   Confidence: ${(data.data.classification.confidence_score * 100).toFixed(1)}%`);
        console.log(`   Expected: ${user.expectedStage}`);
        console.log(`   Match: ${data.data.classification.primary_stage === user.expectedStage ? '✅' : '❌'}`);
      } else {
        console.log(`   Error: ${data.error}`);
      }
      
    } catch (error) {
      console.log(`   API Error: ${error.message}`);
    }
    
    console.log('');
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 STARTING COMPREHENSIVE TESTING SUITE\n');
  
  try {
    // Run main user tests
    const results = await testMultipleUsers();
    
    // Run edge case tests
    await testEdgeCases();
    
    // Test API endpoints (if server is running)
    try {
      await testAPIEndpoints();
    } catch (error) {
      console.log('⚠️  API tests skipped - server may not be running');
      console.log('   Start server with: npm run api\n');
    }
    
    console.log('🎉 ALL TESTS COMPLETED!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the comprehensive test suite
runAllTests(); 