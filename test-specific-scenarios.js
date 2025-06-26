// Specific test scenarios for different use cases and edge conditions
import { summarizeUserTransactions } from './src/transactionService.js';
import { classifyUserProfile } from './src/classificationService.js';

// Specific scenario tests
const SCENARIO_TESTS = [
  {
    name: 'High-Volume User (Most Transactions)',
    userId: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12', // Quinn Anderson - 20 transactions
    description: 'Athlete with highest transaction count',
    expectedPattern: 'health_conscious',
    tests: [7, 14, 30, 60] // Different time periods
  },
  {
    name: 'Low-Volume User (Few Transactions)',
    userId: '5e6f7a8b-9c0d-1234-5678-efabcd901234', // Jesse Moore - 3 transactions
    description: 'Young professional with minimal data',
    expectedPattern: 'young_professional',
    tests: [7, 30, 90] // May have no data for shorter periods
  },
  {
    name: 'Parent vs New Parent Classification',
    userId: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', // Taylor Martin - Parent
    description: 'Test if AI correctly identifies new parent vs established parent',
    expectedPattern: 'new_parent',
    tests: [30]
  },
  {
    name: 'Student Budget Patterns',
    userId: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', // Skyler Moore - Student
    description: 'Budget-conscious student with cheap foods',
    expectedPattern: 'student',
    tests: [30]
  },
  {
    name: 'Senior vs Retiree Classification',
    userId: 'd4e5f6a7-b8c9-0123-4567-890abcdef123', // Riley Wilson - Senior
    description: 'Senior with single-serving purchases',
    expectedPattern: 'retiree',
    tests: [30]
  },
  {
    name: 'Athlete vs Health Conscious',
    userId: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12', // Quinn Anderson - Athlete
    description: 'Test if athlete gets classified as health_conscious',
    expectedPattern: 'health_conscious',
    tests: [30]
  }
];

// Confidence level tests
const CONFIDENCE_TESTS = [
  {
    name: 'High Confidence Scenarios',
    description: 'Users with clear spending patterns',
    users: [
      { id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345', name: 'Taylor Martin (Parent)', minConfidence: 0.8 },
      { id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', name: 'Skyler Moore (Student)', minConfidence: 0.7 }
    ]
  },
  {
    name: 'Low Confidence Scenarios',
    description: 'Users with limited or mixed data',
    users: [
      { id: '5e6f7a8b-9c0d-1234-5678-efabcd901234', name: 'Jesse Moore (Low volume)', maxConfidence: 0.7 }
    ]
  }
];

// Time period sensitivity tests
const TIME_SENSITIVITY_TESTS = [
  {
    name: 'Time Period Impact Analysis',
    userId: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', // Jesse Jones - Young Professional
    description: 'How classification changes with different time periods',
    periods: [7, 14, 30, 60, 90]
  }
];

async function testSpecificScenarios() {
  console.log('🎯 SPECIFIC SCENARIO TESTING');
  console.log('═'.repeat(70));
  console.log('Testing targeted scenarios and edge cases\n');

  let totalTests = 0;
  let passedTests = 0;

  // Test 1: Scenario-based testing
  console.log('🎭 SCENARIO-BASED TESTING');
  console.log('─'.repeat(50));

  for (const scenario of SCENARIO_TESTS) {
    console.log(`\n📋 ${scenario.name}`);
    console.log(`   User: ${scenario.userId}`);
    console.log(`   Description: ${scenario.description}`);
    console.log(`   Expected: ${scenario.expectedPattern}`);

    for (const days of scenario.tests) {
      totalTests++;
      
      try {
        console.log(`\n   ⏱️  Testing ${days} days:`);
        
        const summary = await summarizeUserTransactions(scenario.userId, days);
        
        if (!summary) {
          console.log(`      ❌ No data for ${days} days`);
          continue;
        }

        console.log(`      📊 Summary: "${summary}"`);
        
        const classification = await classifyUserProfile(summary);
        
        console.log(`      🤖 Result: ${classification.primary_stage}`);
        console.log(`      📈 Confidence: ${(classification.confidence_score * 100).toFixed(1)}%`);
        
        const isExpected = classification.primary_stage === scenario.expectedPattern;
        if (isExpected) {
          console.log(`      ✅ MATCHES expected pattern!`);
          passedTests++;
        } else {
          console.log(`      ⚠️  Expected ${scenario.expectedPattern}, got ${classification.primary_stage}`);
        }

      } catch (error) {
        console.log(`      ❌ Error: ${error.message}`);
      }
    }
  }

  // Test 2: Confidence level testing
  console.log(`\n\n🎯 CONFIDENCE LEVEL TESTING`);
  console.log('─'.repeat(50));

  for (const confidenceTest of CONFIDENCE_TESTS) {
    console.log(`\n📊 ${confidenceTest.name}`);
    console.log(`   ${confidenceTest.description}`);

    for (const user of confidenceTest.users) {
      totalTests++;
      
      try {
        console.log(`\n   👤 ${user.name}:`);
        
        const summary = await summarizeUserTransactions(user.id, 30);
        
        if (!summary) {
          console.log(`      ❌ No transaction data`);
          continue;
        }

        const classification = await classifyUserProfile(summary);
        const confidence = classification.confidence_score;
        
        console.log(`      🤖 Classification: ${classification.primary_stage}`);
        console.log(`      📈 Confidence: ${(confidence * 100).toFixed(1)}%`);
        
        if (user.minConfidence) {
          if (confidence >= user.minConfidence) {
            console.log(`      ✅ HIGH confidence achieved (>= ${(user.minConfidence * 100).toFixed(0)}%)`);
            passedTests++;
          } else {
            console.log(`      ⚠️  Low confidence (expected >= ${(user.minConfidence * 100).toFixed(0)}%)`);
          }
        }
        
        if (user.maxConfidence) {
          if (confidence <= user.maxConfidence) {
            console.log(`      ✅ LOW confidence as expected (<= ${(user.maxConfidence * 100).toFixed(0)}%)`);
            passedTests++;
          } else {
            console.log(`      ⚠️  Unexpectedly high confidence (expected <= ${(user.maxConfidence * 100).toFixed(0)}%)`);
          }
        }

      } catch (error) {
        console.log(`      ❌ Error: ${error.message}`);
      }
    }
  }

  // Test 3: Time sensitivity analysis
  console.log(`\n\n⏰ TIME SENSITIVITY ANALYSIS`);
  console.log('─'.repeat(50));

  for (const timeTest of TIME_SENSITIVITY_TESTS) {
    console.log(`\n📈 ${timeTest.name}`);
    console.log(`   User: ${timeTest.userId}`);
    console.log(`   Description: ${timeTest.description}`);

    const results = [];
    
    for (const days of timeTest.periods) {
      try {
        const summary = await summarizeUserTransactions(timeTest.userId, days);
        
        if (!summary) {
          results.push({ days, status: 'no_data' });
          continue;
        }

        const classification = await classifyUserProfile(summary);
        results.push({
          days,
          status: 'success',
          classification: classification.primary_stage,
          confidence: classification.confidence_score,
          summary: summary.length
        });

      } catch (error) {
        results.push({ days, status: 'error', error: error.message });
      }
    }

    console.log('\n   📊 Results across time periods:');
    results.forEach(result => {
      if (result.status === 'success') {
        console.log(`      ${result.days}d: ${result.classification} (${(result.confidence * 100).toFixed(1)}%)`);
      } else {
        console.log(`      ${result.days}d: ${result.status}`);
      }
    });

    // Analyze consistency
    const successfulResults = results.filter(r => r.status === 'success');
    if (successfulResults.length > 1) {
      const classifications = successfulResults.map(r => r.classification);
      const uniqueClassifications = [...new Set(classifications)];
      
      if (uniqueClassifications.length === 1) {
        console.log(`      ✅ CONSISTENT classification across all periods`);
        passedTests++;
      } else {
        console.log(`      ⚠️  INCONSISTENT classifications: ${uniqueClassifications.join(', ')}`);
      }
      totalTests++;
    }
  }

  // Summary
  console.log(`\n\n📊 SPECIFIC SCENARIO TEST RESULTS`);
  console.log('═'.repeat(70));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed Tests: ${passedTests}`);
  console.log(`Success Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`);
  
  return { totalTests, passedTests, successRate: (passedTests / totalTests) * 100 };
}

// Run specific scenario tests
testSpecificScenarios(); 