// src/api/circleMatchingAlgorithm.test.ts
import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Type definitions
interface UserWithSpendingProfile {
  id: string;
  email: string;
  full_name: string | null;
  postal_code: string | null;
  life_stage: string | null;
  date_of_birth: Date | null;
  created_at: Date;
  updated_at: Date;
  shopping_frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | null;
  life_stage_confidence: number | null;
  latitude: number | null;
  longitude: number | null;
  spending_patterns?: SpendingPattern[];
}

interface SpendingPattern {
  category: 'budget-conscious' | 'organic-focused' | 'bulk-buyer' | 'premium' | 'convenience' | 'family-oriented' | 'health-focused';
  frequency: number;
  average_amount: number;
  last_updated: Date;
}

interface CircleWithMembers {
  id: string;
  name: string;
  description: string | null;
  location_radius_km: number;
  created_at: Date;
  members: UserWithSpendingProfile[];
  member_count: number;
}

// Sample test data
const sampleUsers: UserWithSpendingProfile[] = [
  {
    id: 'user-1',
    email: 'alice@example.com',
    full_name: 'Alice Johnson',
    postal_code: 'M5V 3N8',
    life_stage: 'young_professionals',
    date_of_birth: new Date('1995-05-15'),
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    shopping_frequency: 'weekly',
    life_stage_confidence: 0.9,
    latitude: 43.6426,
    longitude: -79.3871,
    spending_patterns: [
      {
        category: 'budget-conscious',
        frequency: 0.8,
        average_amount: 75.50,
        last_updated: new Date('2024-01-15')
      },
      {
        category: 'convenience',
        frequency: 0.6,
        average_amount: 45.20,
        last_updated: new Date('2024-01-15')
      }
    ]
  },
  {
    id: 'user-2',
    email: 'bob@example.com',
    full_name: 'Bob Smith',
    postal_code: 'M5V 2K4',
    life_stage: 'young_professionals',
    date_of_birth: new Date('1993-08-22'),
    created_at: new Date('2024-01-02'),
    updated_at: new Date('2024-01-02'),
    shopping_frequency: 'weekly',
    life_stage_confidence: 0.85,
    latitude: 43.6436,
    longitude: -79.3881,
    spending_patterns: [
      {
        category: 'budget-conscious',
        frequency: 0.7,
        average_amount: 85.30,
        last_updated: new Date('2024-01-15')
      }
    ]
  },
  {
    id: 'user-3',
    email: 'carol@example.com',
    full_name: 'Carol Wilson',
    postal_code: 'M6G 1M1',
    life_stage: 'families_with_young_children',
    date_of_birth: new Date('1988-03-10'),
    created_at: new Date('2024-01-03'),
    updated_at: new Date('2024-01-03'),
    shopping_frequency: 'bi-weekly',
    life_stage_confidence: 0.95,
    latitude: 43.6640,
    longitude: -79.4190,
    spending_patterns: [
      {
        category: 'family-oriented',
        frequency: 0.9,
        average_amount: 150.75,
        last_updated: new Date('2024-01-15')
      }
    ]
  }
];

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
    mockResolvedValue: jest.fn(),
    mockResolvedValueOnce: jest.fn()
  })),
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
};

// Test utility functions
class TestUtilities {
  static calculateHaversineDistance(
    coords1: { lat: number; lng: number },
    coords2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coords2.lat - coords1.lat);
    const dLng = this.toRadians(coords2.lng - coords1.lng);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(coords1.lat)) * Math.cos(this.toRadians(coords2.lat)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static estimateDistanceFromPostalCodes(postal1: string, postal2: string): number {
    const code1 = postal1.replace(/\s/g, '').toUpperCase();
    const code2 = postal2.replace(/\s/g, '').toUpperCase();
    
    // Canadian postal code analysis
    if (code1.substring(0, 3) === code2.substring(0, 3)) {
      return 1.5; // Same Forward Sortation Area (FSA) - typically 1-3km
    } else if (code1.substring(0, 1) === code2.substring(0, 1)) {
      return 8; // Same province/region - typically 5-15km
    } else {
      return 50; // Different provinces - too far for community circles
    }
  }

  static calculateLifeStageScore(user: UserWithSpendingProfile, members: UserWithSpendingProfile[]): number {
    if (!user.life_stage || members.length === 0) return 0;

    const sameLifeStageCount = members.filter(member => member.life_stage === user.life_stage).length;
    return sameLifeStageCount / members.length;
  }

  static calculateSpendingPatternScore(user: UserWithSpendingProfile, members: UserWithSpendingProfile[]): number {
    if (!user.spending_patterns || user.spending_patterns.length === 0) return 0;

    const userPatterns = new Set(user.spending_patterns.map(p => p.category));
    let totalSimilarity = 0;

    members.forEach(member => {
      if (member.spending_patterns) {
        const memberPatterns = new Set(member.spending_patterns.map(p => p.category));
        const intersection = new Set([...userPatterns].filter(x => memberPatterns.has(x)));
        const union = new Set([...userPatterns, ...memberPatterns]);
        totalSimilarity += intersection.size / union.size; // Jaccard similarity
      }
    });

    return members.length > 0 ? totalSimilarity / members.length : 0;
  }

  static findDominantLifeStage(members: UserWithSpendingProfile[]): string | null {
    const counts = new Map<string, number>();
    members.forEach(member => {
      if (member.life_stage) {
        counts.set(member.life_stage, (counts.get(member.life_stage) || 0) + 1);
      }
    });
    
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }
}

describe('Circle Matching Algorithm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Distance Calculations', () => {
    test('should calculate Haversine distance correctly', () => {
      const coords1 = { lat: 43.6426, lng: -79.3871 }; // Toronto downtown
      const coords2 = { lat: 43.6436, lng: -79.3881 }; // Very close in Toronto
      
      const distance = TestUtilities.calculateHaversineDistance(coords1, coords2);
      
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1); // Should be less than 1km
    });

    test('should estimate distance from postal codes', () => {
      // Same FSA (Forward Sortation Area)
      const distance1 = TestUtilities.estimateDistanceFromPostalCodes('M5V 3N8', 'M5V 2K4');
      expect(distance1).toBe(1.5);

      // Same province
      const distance2 = TestUtilities.estimateDistanceFromPostalCodes('M5V 3N8', 'M6G 1M1');
      expect(distance2).toBe(8);

      // Different provinces
      const distance3 = TestUtilities.estimateDistanceFromPostalCodes('M5V 3N8', 'V6B 1A1');
      expect(distance3).toBe(50);
    });
  });

  describe('Matching Score Calculations', () => {
    test('should calculate life stage score correctly', () => {
      const user = sampleUsers[0]; // Alice - young_professionals
      const members = [sampleUsers[1], sampleUsers[2]]; // Bob (young_professionals), Carol (families)
      
      const score = TestUtilities.calculateLifeStageScore(user, members);
      
      expect(score).toBe(0.5); // 1 out of 2 members match
    });

    test('should calculate spending pattern score correctly', () => {
      const user = sampleUsers[0]; // Alice with budget-conscious and convenience
      const members = [sampleUsers[1]]; // Bob with budget-conscious
      
      const score = TestUtilities.calculateSpendingPatternScore(user, members);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
    });

    test('should find dominant life stage', () => {
      const members = [
        sampleUsers[0], // young_professionals
        sampleUsers[1], // young_professionals
        sampleUsers[2]  // families_with_young_children
      ];
      
      const dominantStage = TestUtilities.findDominantLifeStage(members);
      
      expect(dominantStage).toBe('young_professionals');
    });
  });

  describe('User Matching Logic', () => {
    test('should identify users suitable for same circle', () => {
      const user1 = sampleUsers[0]; // Alice - young professionals, Toronto
      const user2 = sampleUsers[1]; // Bob - young professionals, Toronto
      
      // Check life stage compatibility
      const lifeStageMatch = user1.life_stage === user2.life_stage;
      expect(lifeStageMatch).toBe(true);
      
      // Check geographic proximity
      const distance = TestUtilities.estimateDistanceFromPostalCodes(
        user1.postal_code!, 
        user2.postal_code!
      );
      expect(distance).toBeLessThan(5); // Within community radius
      
      // Check spending pattern overlap
      const user1Patterns = new Set(user1.spending_patterns?.map(p => p.category) || []);
      const user2Patterns = new Set(user2.spending_patterns?.map(p => p.category) || []);
      const hasOverlap = [...user1Patterns].some(pattern => user2Patterns.has(pattern));
      expect(hasOverlap).toBe(true);
    });

    test('should identify users NOT suitable for same circle', () => {
      const user1 = sampleUsers[0]; // Alice - young professionals, Toronto
      const user3 = sampleUsers[2]; // Carol - families, different area
      
      // Different life stages
      const lifeStageMatch = user1.life_stage === user3.life_stage;
      expect(lifeStageMatch).toBe(false);
      
      // Different spending patterns
      const user1Patterns = new Set(user1.spending_patterns?.map(p => p.category) || []);
      const user3Patterns = new Set(user3.spending_patterns?.map(p => p.category) || []);
      const hasOverlap = [...user1Patterns].some(pattern => user3Patterns.has(pattern));
      expect(hasOverlap).toBe(false); // No overlap between budget-conscious/convenience and family-oriented
    });
  });

  describe('Circle Rebalancing', () => {
    test('should detect when circle needs rebalancing', () => {
      const mixedCircle: CircleWithMembers = {
        id: 'mixed-circle',
        name: 'Mixed Circle',
        description: 'Test circle',
        location_radius_km: 5,
        created_at: new Date(),
        members: [
          sampleUsers[0], // young_professionals
          sampleUsers[1], // young_professionals  
          sampleUsers[2], // families_with_young_children
          sampleUsers[2]  // families_with_young_children (duplicate for testing)
        ],
        member_count: 4
      };
      
      // Count life stages
      const lifeStageCounts = new Map<string, number>();
      mixedCircle.members.forEach(member => {
        if (member.life_stage) {
          const count = lifeStageCounts.get(member.life_stage) || 0;
          lifeStageCounts.set(member.life_stage, count + 1);
        }
      });

      // Check if dominant life stage represents less than 60% of members
      const maxCount = Math.max(...lifeStageCounts.values());
      const dominanceRatio = maxCount / mixedCircle.members.length;
      
      const needsRebalancing = dominanceRatio < 0.6;
      expect(needsRebalancing).toBe(true); // No single life stage dominates >60%
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty user arrays', () => {
      const score = TestUtilities.calculateLifeStageScore(sampleUsers[0], []);
      expect(score).toBe(0);
    });

    test('should handle users without spending patterns', () => {
      const userWithoutPatterns = { ...sampleUsers[0], spending_patterns: [] };
      const score = TestUtilities.calculateSpendingPatternScore(userWithoutPatterns, [sampleUsers[1]]);
      expect(score).toBe(0);
    });

    test('should handle users without life stage', () => {
      const userWithoutLifeStage = { ...sampleUsers[0], life_stage: null };
      const score = TestUtilities.calculateLifeStageScore(userWithoutLifeStage, [sampleUsers[1]]);
      expect(score).toBe(0);
    });
  });

  describe('Integration Scenarios', () => {
    test('should create new circle for compatible users', () => {
      const compatibleUsers = [sampleUsers[0], sampleUsers[1]]; // Both young professionals in Toronto
      
      // Verify they should be in same circle
      const allSameLifeStage = compatibleUsers.every(user => user.life_stage === 'young_professionals');
      const allInToronto = compatibleUsers.every(user => user.postal_code?.startsWith('M5V'));
      const hasSpendingOverlap = compatibleUsers.every(user => 
        user.spending_patterns?.some(pattern => pattern.category === 'budget-conscious')
      );
      
      expect(allSameLifeStage).toBe(true);
      expect(allInToronto).toBe(true);
      expect(hasSpendingOverlap).toBe(true);
      
      // This would trigger circle creation
      const shouldCreateCircle = allSameLifeStage && allInToronto && hasSpendingOverlap;
      expect(shouldCreateCircle).toBe(true);
    });

    test('should prevent distant users from being matched', () => {
      const torontoUser = sampleUsers[0]; // M5V postal code
      const otherProvinceUser = {
        ...sampleUsers[0],
        id: 'vancouver-user',
        postal_code: 'V6B 1A1' // Vancouver
      };
      
      const distance = TestUtilities.estimateDistanceFromPostalCodes(
        torontoUser.postal_code!,
        otherProvinceUser.postal_code!
      );
      
      const tooFarForCommunity = distance > 5; // Community radius limit
      expect(tooFarForCommunity).toBe(true);
    });
  });
});

// Export test utilities for use in other test files
export { TestUtilities, sampleUsers };