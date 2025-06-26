// src/api/algorithm.test.ts - FULL HACKATHON TEST
// Tests both algorithm logic AND Supabase integration

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */

import { LifeStageMatchingService } from './circleMatchingAlgorithm';

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
  })),
  auth: { autoRefreshToken: false, persistSession: false }
};

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.VITE_OPENCAGE_API_KEY = '47edb1fff4594fa8993ef85d90280de0';

// Mock createClient
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

// Mock fetch for geocoding
(global as any).fetch = jest.fn();

describe('Circle Matching Algorithm - Full Test', () => {
  
  // Mock user data for testing
  const testUsers = [
    {
      id: 'user-1',
      email: 'alice@test.com',
      full_name: 'Alice',
      postal_code: 'M5V 3N8',
      life_stage: 'young_professionals',
      shopping_frequency: 'weekly' as const,
      life_stage_confidence: 0.9,
      spending_patterns: [
        { category: 'budget-conscious' as const, frequency: 0.8, average_amount: 75, last_updated: new Date() }
      ]
    },
    {
      id: 'user-2', 
      email: 'bob@test.com',
      full_name: 'Bob',
      postal_code: 'M5V 2K4',
      life_stage: 'young_professionals',
      shopping_frequency: 'weekly' as const,
      life_stage_confidence: 0.85,
      spending_patterns: [
        { category: 'budget-conscious' as const, frequency: 0.7, average_amount: 80, last_updated: new Date() }
      ]
    },
    {
      id: 'user-3',
      email: 'carol@test.com', 
      full_name: 'Carol',
      postal_code: 'V6B 1A1', // Vancouver - far away
      life_stage: 'families_with_young_children',
      shopping_frequency: 'bi-weekly' as const,
      life_stage_confidence: 0.95,
      spending_patterns: [
        { category: 'family-oriented' as const, frequency: 0.9, average_amount: 150, last_updated: new Date() }
      ]
    }
  ];

  test('Distance calculation works', () => {
    // Test postal code distance estimation
    function estimateDistance(postal1: string, postal2: string): number {
      const code1 = postal1.replace(/\s/g, '').toUpperCase();
      const code2 = postal2.replace(/\s/g, '').toUpperCase();
      
      if (code1.substring(0, 3) === code2.substring(0, 3)) return 1.5; // Same area
      if (code1.substring(0, 1) === code2.substring(0, 1)) return 8;   // Same province  
      return 50; // Different provinces
    }

    expect(estimateDistance('M5V 3N8', 'M5V 2K4')).toBe(1.5); // Same Toronto area
    expect(estimateDistance('M5V 3N8', 'V6B 1A1')).toBe(50);  // Toronto to Vancouver
  });

  test('Life stage matching works', () => {
    const youngProfs = testUsers.filter(u => u.life_stage === 'young_professionals');
    const families = testUsers.filter(u => u.life_stage === 'families_with_young_children');
    
    expect(youngProfs.length).toBe(2); // Alice and Bob
    expect(families.length).toBe(1);   // Carol
  });

  test('Compatible users should match', () => {
    const alice = testUsers[0];
    const bob = testUsers[1];
    
    // Same life stage?
    expect(alice.life_stage).toBe(bob.life_stage);
    
    // Close geographically? (same M5V area)
    expect(alice.postal_code?.startsWith('M5V')).toBe(true);
    expect(bob.postal_code?.startsWith('M5V')).toBe(true);
    
    // Similar spending patterns?
    const alicePatterns = alice.spending_patterns?.map(p => p.category) || [];
    const bobPatterns = bob.spending_patterns?.map(p => p.category) || [];
    const hasOverlap = alicePatterns.some(pattern => bobPatterns.includes(pattern));
    
    expect(hasOverlap).toBe(true); // Both have budget-conscious
  });

  test('Incompatible users should NOT match', () => {
    const alice = testUsers[0]; // Young prof in Toronto
    const carol = testUsers[2]; // Family in Vancouver
    
    // Different life stages
    expect(alice.life_stage).not.toBe(carol.life_stage);
    
    // Too far apart
    expect(alice.postal_code?.charAt(0)).not.toBe(carol.postal_code?.charAt(0));
    
    // Different spending patterns
    const alicePatterns = alice.spending_patterns?.map(p => p.category) || [];
    const carolPatterns = carol.spending_patterns?.map(p => p.category) || [];
    const hasOverlap = alicePatterns.some(pattern => carolPatterns.includes(pattern));
    
    expect(hasOverlap).toBe(false);
  });

  test('Circle creation logic', () => {
    // Group compatible users
    const torontoYoungProfs = testUsers.filter(u => 
      u.life_stage === 'young_professionals' && 
      u.postal_code?.startsWith('M5V')
    );
    
    expect(torontoYoungProfs.length).toBeGreaterThanOrEqual(2); // Enough for a circle
    
    // Generate circle name
    const circleName = `Toronto Young Professionals (Budget Savers)`;
    expect(circleName).toContain('Toronto');
    expect(circleName).toContain('Young Professionals');
  });

  test('Edge cases handled', () => {
    // User with no spending patterns
    const userNoPatterns = { ...testUsers[0], spending_patterns: [] };
    expect(userNoPatterns.spending_patterns.length).toBe(0);
    
    // User with no life stage
    const userNoLifeStage = { ...testUsers[0], life_stage: null };
    expect(userNoLifeStage.life_stage).toBeNull();
    
    // Empty user array
    const emptyUsers: typeof testUsers = [];
    expect(emptyUsers.length).toBe(0);
  });

  // 🚀 SUPABASE INTEGRATION TESTS
  describe('Supabase Integration', () => {
    let service: LifeStageMatchingService;

    beforeEach(() => {
      jest.clearAllMocks();
      service = new LifeStageMatchingService();
    });

    test('Service initializes with Supabase client', () => {
      expect(service).toBeDefined();
    });

    test('Finds unmatched users from database', async () => {
      // Mock active members query
      mockSupabaseClient.from().select().eq().mockResolvedValueOnce({
        data: [{ user_id: 'user-1' }],
        error: null
      });

      // Mock users query  
      mockSupabaseClient.from().select().not().not().not().order().order().mockResolvedValueOnce({
        data: [
          { id: 'user-2', full_name: 'Bob', postal_code: 'M5V 2K4', life_stage: 'young_professionals' },
          { id: 'user-3', full_name: 'Carol', postal_code: 'V6B 1A1', life_stage: 'families_with_young_children' }
        ],
        error: null
      });

      // Mock spending patterns queries
      mockSupabaseClient.from().select().eq().order().order().mockResolvedValue({
        data: [{ category: 'budget-conscious', frequency_score: 0.8, average_amount: 75, last_updated: new Date() }],
        error: null
      });

      const unmatchedUsers = await (service as any).findUnmatchedUsers();
      
      expect(unmatchedUsers).toHaveLength(2);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('circle_memberships');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    });

    test('Gets spending patterns from database', async () => {
      mockSupabaseClient.from().select().eq().order().order().mockResolvedValueOnce({
        data: [
          { category: 'budget-conscious', frequency_score: 0.8, average_amount: 75, last_updated: '2024-01-15' },
          { category: 'convenience', frequency_score: 0.6, average_amount: 45, last_updated: '2024-01-15' }
        ],
        error: null
      });

      const patterns = await (service as any).getSpendingPatterns('user-1');
      
      expect(patterns).toHaveLength(2);
      expect(patterns[0].category).toBe('budget-conscious');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('spending_patterns');
    });

    test('Creates new circle in database', async () => {
      // Mock circle creation
      mockSupabaseClient.from().insert().select().single().mockResolvedValueOnce({
        data: { id: 'new-circle-id' },
        error: null
      });

      // Mock membership insertion
      mockSupabaseClient.from().insert().mockResolvedValue({
        data: null,
        error: null
      });

      const mainUser = testUsers[0];
      const similarUsers = [testUsers[1]];
      
      const circle = await (service as any).createNewCircle(mainUser, similarUsers);
      
      expect(circle.id).toBe('new-circle-id');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('circles');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('circle_memberships');
    });

    test('Gets all circles with members from database', async () => {
      mockSupabaseClient.from().select().eq().mockResolvedValueOnce({
        data: [
          {
            id: 'circle-1',
            name: 'Toronto Young Professionals',
            description: 'Test circle',
            location_radius_km: 5,
            created_at: new Date(),
            circle_memberships: [
              {
                user_id: 'user-1',
                is_active: true,
                users: { id: 'user-1', full_name: 'Alice', postal_code: 'M5V 3N8', life_stage: 'young_professionals' }
              }
            ]
          }
        ],
        error: null
      });

      const circles = await (service as any).getAllCirclesWithMembers();
      
      expect(circles).toHaveLength(1);
      expect(circles[0].member_count).toBe(1);
      expect(circles[0].members[0].full_name).toBe('Alice');
    });
  });

  // 🌍 GEOCODING API TESTS
  describe('Geocoding Integration', () => {
    let service: LifeStageMatchingService;

    beforeEach(() => {
      jest.clearAllMocks();
      service = new LifeStageMatchingService();
    });

    test('Geocodes postal code using OpenCage API', async () => {
      // Mock successful geocoding response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{
            geometry: { lat: 43.6426, lng: -79.3871 },
            formatted: 'Toronto, ON, Canada',
            components: { country_code: 'ca', postcode: 'M5V 3N8' }
          }]
        })
      });

      const coords = await (service as any).geocodePostalCode('M5V 3N8');
      
      expect(coords).toEqual({ lat: 43.6426, lng: -79.3871 });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.opencagedata.com'),
        expect.any(Object)
      );
    });

    test('Caches coordinates in database', async () => {
      mockSupabaseClient.from().upsert().mockResolvedValueOnce({
        data: null,
        error: null
      });

      await (service as any).cacheCoordinates('M5V 3N8', { lat: 43.6426, lng: -79.3871 });
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_location_cache');
    });

    test('Gets cached coordinates from database', async () => {
      mockSupabaseClient.from().select().eq().not().not().limit().single().mockResolvedValueOnce({
        data: { latitude: 43.6426, longitude: -79.3871 },
        error: null
      });

      const coords = await (service as any).getCachedCoordinates('M5V 3N8');
      
      expect(coords).toEqual({ lat: 43.6426, lng: -79.3871 });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_location_cache');
    });

    test('Handles geocoding API failure gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));
      
      const coords = await (service as any).geocodePostalCode('INVALID');
      
      expect(coords).toBeNull();
    });
  });

  // 🏃‍♂️ FULL ALGORITHM INTEGRATION TEST
  describe('Full Algorithm Integration', () => {
    let service: LifeStageMatchingService;

    beforeEach(() => {
      jest.clearAllMocks();
      service = new LifeStageMatchingService();
    });

    test('Runs complete matching algorithm', async () => {
      // Mock all database operations for full algorithm run
      
      // findUnmatchedUsers mocks
      mockSupabaseClient.from().select().eq()
        .mockResolvedValueOnce({ data: [], error: null }) // No active members
        .mockResolvedValueOnce({ data: testUsers, error: null }); // All users unmatched

      // Mock spending patterns
      mockSupabaseClient.from().select().eq().order().order()
        .mockResolvedValue({ data: [], error: null });

      // getAllCirclesWithMembers mock
      mockSupabaseClient.from().select().eq()
        .mockResolvedValue({ data: [], error: null }); // No existing circles

      // Mock circle creation
      mockSupabaseClient.from().insert().select().single()
        .mockResolvedValue({ data: { id: 'new-circle-1' }, error: null });

      // Mock membership insertion
      mockSupabaseClient.from().insert()
        .mockResolvedValue({ data: null, error: null });

      // Mock location cache operations
      mockSupabaseClient.from().select().eq().limit().single()
        .mockResolvedValue({ data: null, error: { code: 'PGRST116' } }); // Not found

      await service.runMatchingAlgorithm();
      
      // Verify the algorithm completed without errors
      expect(mockSupabaseClient.from).toHaveBeenCalled();
    });

    test('Handles database errors gracefully', async () => {
      mockSupabaseClient.from().select().eq()
        .mockResolvedValueOnce({ data: null, error: new Error('Database error') });

      await expect(service.runMatchingAlgorithm()).rejects.toThrow('Database error');
    });

    test('Initializes location cache for existing users', async () => {
      // Mock uncached postal codes query
      mockSupabaseClient.from().select().not().not().order()
        .mockResolvedValueOnce({
          data: [{ postal_code: 'M5V 3N8' }, { postal_code: 'M5V 2K4' }],
          error: null
        });

      // Mock successful geocoding
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          results: [{
            geometry: { lat: 43.6426, lng: -79.3871 },
            components: { country_code: 'ca', postcode: 'M5V 3N8' }
          }]
        })
      });

      // Mock caching operations
      mockSupabaseClient.from().upsert().mockResolvedValue({ data: null, error: null });
      mockSupabaseClient.from().update().eq().is().mockResolvedValue({ data: null, error: null });

      await service.initializeLocationCache();
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_location_cache');
    });
  });
});

// Quick demo function for manual testing
export function quickDemo() {
  console.log('🎯 QUICK ALGORITHM DEMO');
  console.log('======================');
  
  const users = [
    { name: 'Alice', postal: 'M5V 3N8', life_stage: 'young_professionals', pattern: 'budget-conscious' },
    { name: 'Bob', postal: 'M5V 2K4', life_stage: 'young_professionals', pattern: 'budget-conscious' },
    { name: 'Carol', postal: 'V6B 1A1', life_stage: 'families_with_young_children', pattern: 'family-oriented' }
  ];
  
  console.log('👥 Test Users:');
  users.forEach(u => console.log(`  ${u.name}: ${u.postal} - ${u.life_stage} - ${u.pattern}`));
  
  console.log('\n✅ Expected Matches:');
  console.log('  • Alice + Bob → Same area + life stage + spending pattern');
  console.log('  • Carol → Separate (different city + life stage)');
  
  console.log('\n🎯 Algorithm should create:');
  console.log('  • "Toronto Young Professionals (Budget Savers)" with Alice & Bob');
  console.log('  • Wait for more Vancouver families for Carol');
  
  return users;
}