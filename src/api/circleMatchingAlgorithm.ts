import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database table interfaces
interface User {
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
}

interface Circle {
  id: string;
  name: string;
  description: string | null;
  location_radius_km: number;
  created_at: Date;
}

interface CircleMembership {
  id: string;
  user_id: string;
  circle_id: string;
  joined_at: Date;
  is_active: boolean;
}

// Extended interfaces for matching
interface UserWithSpendingProfile extends Omit<User, 'shopping_frequency'> {
  spending_patterns?: SpendingPattern[];
  shopping_frequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  proximity_score?: number;
}

interface SpendingPattern {
  category: 'budget-conscious' | 'organic-focused' | 'bulk-buyer' | 'premium' | 'convenience' | 'family-oriented' | 'health-focused';
  frequency: number;
  average_amount: number;
  last_updated: Date;
}

interface MatchingCriteria {
  max_distance_km: number;
  life_stage_weight: number;
  spending_pattern_weight: number;
  frequency_weight: number;
  min_circle_size: number;
  max_circle_size: number;
}

interface CircleWithMembers extends Circle {
  members: UserWithSpendingProfile[];
  member_count: number;
}

class LifeStageMatchingService {
  private supabase: SupabaseClient;
  private defaultCriteria: MatchingCriteria = {
    max_distance_km: 5,
    life_stage_weight: 0.4,
    spending_pattern_weight: 0.3,
    frequency_weight: 0.2,
    min_circle_size: 3,
    max_circle_size: 8
  };

  constructor() {
    // Create dedicated Supabase client for matching service
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin operations
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials for matching service. Add VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY to your environment.');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  /**
   * Main entry point for the matching algorithm
   */
  async runMatchingAlgorithm(): Promise<void> {
    try {
      console.log('🔄 Starting Life-Stage Matching Intelligence...');
      
      // Step 1: Find users not in active circles
      const unmatchedUsers = await this.findUnmatchedUsers();
      console.log(`📊 Found ${unmatchedUsers.length} unmatched users`);

      // Step 2: Analyze existing circles for rebalancing opportunities
      await this.analyzeAndRebalanceCircles();

      // Step 3: Match unmatched users
      if (unmatchedUsers.length > 0) {
        await this.matchUsers(unmatchedUsers);
      }

      // Step 4: Optimize existing circles
      await this.optimizeExistingCircles();

      console.log('✅ Matching algorithm completed successfully');
    } catch (error) {
      console.error('❌ Error in matching algorithm:', error);
      throw error;
    }
  }

  /**
   * Find users who are not currently in any active circle
   */
  private async findUnmatchedUsers(): Promise<UserWithSpendingProfile[]> {
    // Get users not in any active circles
    const { data: activeMembers, error: membersError } = await this.supabase
      .from('circle_memberships')
      .select('user_id')
      .eq('is_active', true);

    if (membersError) {
      console.error('Error fetching active members:', membersError);
      throw membersError;
    }

    const activeMemberIds = activeMembers?.map(m => m.user_id) || [];

    const { data: users, error } = await this.supabase
      .from('users')
      .select('*')
      .not('postal_code', 'is', null)
      .not('life_stage', 'is', null)
      .not('id', 'in', `(${activeMemberIds.map(id => `'${id}'`).join(',') || "''"})`)
      .order('life_stage_confidence', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching unmatched users:', error);
      throw error;
    }
    
    // Enrich with spending profiles
    return Promise.all((users || []).map(async (user) => ({
      ...user,
      spending_patterns: await this.getSpendingPatterns(user.id),
      shopping_frequency: user.shopping_frequency || 'weekly', // Use the field your colleague populates
      life_stage_confidence: user.life_stage_confidence || 0.5
    })));
  }

  /**
   * Get spending patterns from the spending_patterns table
   */
  private async getSpendingPatterns(userId: string): Promise<SpendingPattern[]> {
    const { data: patterns, error } = await this.supabase
      .from('spending_patterns')
      .select('category, frequency_score, average_amount, confidence_score, last_updated')
      .eq('user_id', userId)
      .order('confidence_score', { ascending: false })
      .order('frequency_score', { ascending: false });

    if (error) {
      console.error('Error fetching spending patterns:', error);
      return [];
    }
    
    return (patterns || []).map(p => ({
      category: p.category as SpendingPattern['category'],
      frequency: p.frequency_score,
      average_amount: p.average_amount,
      last_updated: new Date(p.last_updated)
    }));
  }

  /**
   * Analyze and rebalance existing circles based on life stage changes
   */
  private async analyzeAndRebalanceCircles(): Promise<void> {
    const circles = await this.getAllCirclesWithMembers();
    
    for (const circle of circles) {
      const rebalanceNeeded = await this.checkIfRebalanceNeeded(circle);
      
      if (rebalanceNeeded) {
        console.log(`🔄 Rebalancing circle: ${circle.name}`);
        await this.rebalanceCircle(circle);
      }
    }
  }

  /**
   * Check if a circle needs rebalancing based on member life stage changes
   */
  private async checkIfRebalanceNeeded(circle: CircleWithMembers): Promise<boolean> {
    const lifeStageCounts = new Map<string, number>();
    
    // Count life stages in current circle
    circle.members.forEach(member => {
      if (member.life_stage) {
        const count = lifeStageCounts.get(member.life_stage) || 0;
        lifeStageCounts.set(member.life_stage, count + 1);
      }
    });

    // Check if dominant life stage represents less than 60% of members
    const maxCount = Math.max(...lifeStageCounts.values());
    const dominanceRatio = maxCount / circle.members.length;
    
    return dominanceRatio < 0.6 || circle.members.length < this.defaultCriteria.min_circle_size;
  }

  /**
   * Rebalance a circle by moving members to more appropriate circles
   */
  private async rebalanceCircle(circle: CircleWithMembers): Promise<void> {
    const membersToRelocate: UserWithSpendingProfile[] = [];
    const coreMembers: UserWithSpendingProfile[] = [];

    // Identify core vs peripheral members
    const dominantLifeStage = this.findDominantLifeStage(circle.members);
    
    circle.members.forEach(member => {
      if (member.life_stage === dominantLifeStage && (member.life_stage_confidence || 0) > 0.7) {
        coreMembers.push(member);
      } else {
        membersToRelocate.push(member);
      }
    });

    // Start 48-hour overlap period for transitioning members
    for (const member of membersToRelocate) {
      await this.initiateCircleTransition(member, circle.id);
    }
  }

  /**
   * Match unmatched users to existing circles or create new ones
   */
  private async matchUsers(users: UserWithSpendingProfile[]): Promise<void> {
    const existingCircles = await this.getAllCirclesWithMembers();
    
    for (const user of users) {
      const bestMatch = await this.findBestCircleMatch(user, existingCircles);
      
      if (bestMatch && bestMatch.score > 0.7) {
        await this.addUserToCircle(user.id, bestMatch.circle.id);
        console.log(`✨ Matched ${user.full_name} to circle: ${bestMatch.circle.name}`);
      } else {
        // Try to create a new circle with similar users
        const similarUsers = this.findSimilarUsers(user, users);
        
        if (similarUsers.length >= this.defaultCriteria.min_circle_size - 1) {
          const newCircle = await this.createNewCircle(user, similarUsers);
          console.log(`🆕 Created new circle: ${newCircle.name} with ${similarUsers.length + 1} members`);
        }
      }
    }
  }

  /**
   * Find the best matching circle for a user
   */
  private async findBestCircleMatch(
    user: UserWithSpendingProfile, 
    circles: CircleWithMembers[]
  ): Promise<{ circle: CircleWithMembers; score: number } | null> {
    let bestMatch: { circle: CircleWithMembers; score: number } | null = null;

    for (const circle of circles) {
      if (circle.member_count >= this.defaultCriteria.max_circle_size) {
        continue; // Skip full circles
      }

      const score = await this.calculateMatchScore(user, circle);
      
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { circle, score };
      }
    }

    return bestMatch;
  }

  /**
   * Enhanced matching that prioritizes community + shopping alignment
   */
  private async calculateMatchScore(
    user: UserWithSpendingProfile,
    circle: CircleWithMembers
  ): Promise<number> {
    let totalScore = 0;
    let weightSum = 0;

    // 1. Geographic proximity - HIGHEST PRIORITY for community focus
    const proximityScore = await this.calculateProximityScore(user, circle.members);
    if (proximityScore < 0.3) {
      return 0; // Too far = automatic disqualification for community circles
    }
    totalScore += proximityScore * 0.4; // Increased weight for community focus
    weightSum += 0.4;

    // 2. Life stage alignment
    const lifeStageScore = this.calculateLifeStageScore(user, circle.members);
    totalScore += lifeStageScore * 0.25;
    weightSum += 0.25;

    // 3. Spending pattern similarity 
    const spendingScore = this.calculateSpendingPatternScore(user, circle.members);
    totalScore += spendingScore * 0.25;
    weightSum += 0.25;

    // 4. Shopping frequency alignment
    const frequencyScore = this.calculateFrequencyScore(user, circle.members);
    totalScore += frequencyScore * 0.1;
    weightSum += 0.1;

    return weightSum > 0 ? totalScore / weightSum : 0;
  }

  /**
   * Calculate proximity score with emphasis on community (3-5km radius)
   */
  private async calculateProximityScore(
    user: UserWithSpendingProfile,
    members: UserWithSpendingProfile[]
  ): Promise<number> {
    if (!user.postal_code || members.length === 0) return 0;

    const distances = await Promise.all(
      members.map(member => 
        member.postal_code ? 
          this.calculatePostalCodeDistance(user.postal_code!, member.postal_code) : 
          Promise.resolve(Infinity)
      )
    );

    // Filter out members too far away (beyond community radius)
    const nearbyDistances = distances.filter(dist => dist <= this.defaultCriteria.max_distance_km);
    
    if (nearbyDistances.length === 0) return 0; // No one nearby = no community match

    const avgDistance = nearbyDistances.reduce((sum, dist) => sum + dist, 0) / nearbyDistances.length;
    
    // Higher score for closer community members
    // Perfect score (1.0) for 0km, good score (0.8) for 2km, acceptable (0.6) for 5km
    return Math.max(0, 1 - (avgDistance / this.defaultCriteria.max_distance_km));
  }

  /**
   * Calculate distance between postal codes using cached coordinates or geocoding
   */
  private async calculatePostalCodeDistance(postal1: string, postal2: string): Promise<number> {
    try {
      // First try to get coordinates from cache
      let coords1 = await this.getCachedCoordinates(postal1);
      let coords2 = await this.getCachedCoordinates(postal2);

      // If not in cache, geocode and cache the results
      if (!coords1) {
        coords1 = await this.geocodePostalCode(postal1);
        if (coords1) await this.cacheCoordinates(postal1, coords1);
      }
      
      if (!coords2) {
        coords2 = await this.geocodePostalCode(postal2);
        if (coords2) await this.cacheCoordinates(postal2, coords2);
      }

      if (coords1 && coords2) {
        return this.calculateHaversineDistance(coords1, coords2);
      }

      // Fallback to postal code analysis if geocoding fails
      return this.estimateDistanceFromPostalCodes(postal1, postal2);
    } catch (error) {
      console.warn('Error calculating postal code distance:', error);
      return this.estimateDistanceFromPostalCodes(postal1, postal2);
    }
  }

  /**
   * Get cached coordinates for a postal code
   */
  private async getCachedCoordinates(postalCode: string): Promise<{lat: number, lng: number} | null> {
    const { data: result, error } = await this.supabase
      .from('user_location_cache')
      .select('latitude, longitude')
      .eq('postal_code', postalCode.replace(/\s/g, '').toUpperCase())
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .limit(1)
      .single();

    if (error || !result) {
      return null;
    }

    return { lat: result.latitude, lng: result.longitude };
  }

  /**
   * Geocode a postal code using OpenCage Data API
   */
  private async geocodePostalCode(postalCode: string): Promise<{lat: number, lng: number} | null> {
    try {
      const API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
      if (!API_KEY) {
        console.warn('OpenCage API key not found. Set VITE_OPENCAGE_API_KEY environment variable.');
        return null;
      }

      const cleanPostal = postalCode.replace(/\s/g, '').toUpperCase();
      
      // Format postal code properly for Canadian addresses
      const formattedPostal = cleanPostal.length === 6 ? 
        `${cleanPostal.slice(0, 3)} ${cleanPostal.slice(3)}` : cleanPostal;
      
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(formattedPostal)},Canada&key=${API_KEY}&countrycode=ca&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CircleMatchingApp/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`OpenCage API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const { lat, lng } = result.geometry;
        
        // Validate that this is actually a Canadian postal code result
        if (result.components?.country_code === 'ca' && result.components?.postcode) {
          console.log(`✅ Geocoded ${postalCode} to ${lat}, ${lng} (${result.formatted})`);
          return { lat, lng };
        } else {
          console.warn(`⚠️ OpenCage result for ${postalCode} doesn't seem to be a valid Canadian postal code`);
        }
      } else {
        console.warn(`📍 No geocoding results found for postal code: ${postalCode}`);
      }
      
      return null;
    } catch (error) {
      console.error('OpenCage geocoding error for postal code:', postalCode, error);
      return null;
    }
  }

  /**
   * Cache coordinates for future use with proper error handling
   */
  private async cacheCoordinates(postalCode: string, coords: {lat: number, lng: number}): Promise<void> {
    try {
      const cleanPostal = postalCode.replace(/\s/g, '').toUpperCase();
      
      // Try to get city/region info for the location cache
      const locationInfo = await this.getLocationDetails(cleanPostal, coords);
      
      const { error } = await this.supabase
        .from('user_location_cache')
        .upsert({
          postal_code: cleanPostal,
          latitude: coords.lat,
          longitude: coords.lng,
          city: locationInfo.city,
          region: locationInfo.region,
          country: 'CA',
          geocoded_at: new Date().toISOString()
        }, {
          onConflict: 'postal_code'
        });

      if (error) {
        throw error;
      }
      
      console.log(`💾 Cached coordinates for ${cleanPostal}: ${coords.lat}, ${coords.lng}`);
    } catch (error) {
      console.error('Error caching coordinates for postal code:', postalCode, error);
      // Don't throw - caching failure shouldn't break matching
    }
  }

  /**
   * Get additional location details (city, region) for a postal code
   */
  private async getLocationDetails(postalCode: string, coords: {lat: number, lng: number}): Promise<{city: string | null, region: string | null}> {
    try {
      const API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
      if (!API_KEY) return { city: null, region: null };

      // Reverse geocode to get detailed location info
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${coords.lat},${coords.lng}&key=${API_KEY}&countrycode=ca&limit=1`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results?.[0]?.components) {
        const components = data.results[0].components;
        return {
          city: components.city || components.town || components.village || components.neighbourhood || null,
          region: components.state || components.province || null
        };
      }
    } catch (error) {
      console.warn('Error getting location details:', error);
    }
    
    return { city: null, region: null };
  }

  /**
   * Calculate distance using Haversine formula
   */
  private calculateHaversineDistance(coords1: {lat: number, lng: number}, coords2: {lat: number, lng: number}): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coords2.lat - coords1.lat);
    const dLng = this.toRadians(coords2.lng - coords1.lng);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(coords1.lat)) * Math.cos(this.toRadians(coords2.lat)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Fallback distance estimation based on postal code patterns (Canadian system)
   */
  private estimateDistanceFromPostalCodes(postal1: string, postal2: string): number {
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

  /**
   * Calculate life stage alignment score
   */
  private calculateLifeStageScore(user: UserWithSpendingProfile, members: UserWithSpendingProfile[]): number {
    if (!user.life_stage || members.length === 0) return 0;

    const sameLifeStageCount = members.filter(member => member.life_stage === user.life_stage).length;
    return sameLifeStageCount / members.length;
  }

  /**
   * Calculate spending pattern similarity score
   */
  private calculateSpendingPatternScore(user: UserWithSpendingProfile, members: UserWithSpendingProfile[]): number {
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

  /**
   * Calculate shopping frequency alignment score
   */
  private calculateFrequencyScore(user: UserWithSpendingProfile, members: UserWithSpendingProfile[]): number {
    if (!user.shopping_frequency) return 0;

    const frequencyMap = { daily: 7, weekly: 1, 'bi-weekly': 0.5, monthly: 0.25 };
    const userFreq = frequencyMap[user.shopping_frequency];

    let totalScore = 0;
    members.forEach(member => {
      if (member.shopping_frequency) {
        const memberFreq = frequencyMap[member.shopping_frequency];
        const similarity = 1 - Math.abs(userFreq - memberFreq) / Math.max(userFreq, memberFreq);
        totalScore += similarity;
      }
    });

    return members.length > 0 ? totalScore / members.length : 0;
  }

  /**
   * Determine shopping frequency from the users table (handled by colleague)
   */
  private async determineShoppingFrequency(userId: string): Promise<'daily' | 'weekly' | 'bi-weekly' | 'monthly'> {
    // Simply return weekly as default since your colleague handles the actual calculation
    // The shopping_frequency field in users table should already be populated
    return 'weekly';
  }

  /**
   * Enhanced circle creation with community focus
   */
  private async createNewCircle(mainUser: UserWithSpendingProfile, similarUsers: UserWithSpendingProfile[]): Promise<Circle> {
    const circleName = await this.generateCommunityCircleName(mainUser, similarUsers);
    const description = this.generateCommunityCircleDescription(mainUser, similarUsers);

    const { data: result, error } = await this.supabase
      .from('circles')
      .insert({
        name: circleName,
        description: description,
        location_radius_km: this.defaultCriteria.max_distance_km
      })
      .select('id')
      .single();

    if (error || !result) {
      console.error('Error creating circle:', error);
      throw error;
    }

    const circleId = result.id;

    // Add all users to the new circle
    const allUsers = [mainUser, ...similarUsers];
    for (const user of allUsers) {
      await this.addUserToCircle(user.id, circleId);
    }

    // Update user location cache if needed
    await this.ensureLocationCacheForUsers(allUsers);

    return {
      id: circleId,
      name: circleName,
      description,
      location_radius_km: this.defaultCriteria.max_distance_km,
      created_at: new Date()
    };
  }

  /**
   * Add a user to a circle
   */
  private async addUserToCircle(userId: string, circleId: string): Promise<void> {
    const { error } = await this.supabase
      .from('circle_memberships')
      .insert({
        user_id: userId,
        circle_id: circleId,
        joined_at: new Date().toISOString(),
        is_active: true
      });

    if (error) {
      console.error('Error adding user to circle:', error);
      throw error;
    }
  }

  /**
   * Initiate a 48-hour circle transition for a user
   */
  private async initiateCircleTransition(user: UserWithSpendingProfile, currentCircleId: string): Promise<void> {
    // Find a better matching circle
    const allCircles = await this.getAllCirclesWithMembers();
    const betterMatch = await this.findBestCircleMatch(user, allCircles.filter(c => c.id !== currentCircleId));

    if (betterMatch && betterMatch.score > 0.8) {
      // Add to new circle (keeping old membership active for 48 hours)
      await this.addUserToCircle(user.id, betterMatch.circle.id);
      
      // Schedule removal from old circle after 48 hours
      setTimeout(async () => {
        const { error } = await this.supabase
          .from('circle_memberships')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('circle_id', currentCircleId);

        if (error) {
          console.error('Error deactivating old circle membership:', error);
        }
      }, 48 * 60 * 60 * 1000); // 48 hours
      
      console.log(`🔄 Initiated transition for ${user.full_name} from current circle to ${betterMatch.circle.name}`);
    }
  }

  // Utility methods
  private async getAllCirclesWithMembers(): Promise<CircleWithMembers[]> {
    const { data: circles, error } = await this.supabase
      .from('circles')
      .select(`
        *,
        circle_memberships!inner(
          user_id,
          is_active,
          users(*)
        )
      `)
      .eq('circle_memberships.is_active', true);

    if (error) {
      console.error('Error fetching circles with members:', error);
      throw error;
    }

    interface CircleMembershipWithUser {
      user_id: string;
      is_active: boolean;
      users: User;
    }

    interface CircleWithMemberships extends Circle {
      circle_memberships: CircleMembershipWithUser[];
    }

    return (circles as CircleWithMemberships[] || []).map(circle => ({
      ...circle,
      members: circle.circle_memberships?.map(cm => cm.users).filter(Boolean) || [],
      member_count: circle.circle_memberships?.length || 0
    }));
  }

  private findDominantLifeStage(members: UserWithSpendingProfile[]): string | null {
    const counts = new Map<string, number>();
    members.forEach(member => {
      if (member.life_stage) {
        counts.set(member.life_stage, (counts.get(member.life_stage) || 0) + 1);
      }
    });
    
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }

  private findSimilarUsers(user: UserWithSpendingProfile, allUsers: UserWithSpendingProfile[]): UserWithSpendingProfile[] {
    return allUsers
      .filter(u => u.id !== user.id)
      .filter(u => u.life_stage === user.life_stage)
      .sort((a, b) => {
        // Sort by similarity (simplified scoring)
        const scoreA = this.calculateUserSimilarity(user, a);
        const scoreB = this.calculateUserSimilarity(user, b);
        return scoreB - scoreA;
      })
      .slice(0, this.defaultCriteria.max_circle_size - 1);
  }

  private calculateUserSimilarity(user1: UserWithSpendingProfile, user2: UserWithSpendingProfile): number {
    let score = 0;
    
    // Life stage match
    if (user1.life_stage === user2.life_stage) score += 0.4;
    
    // Shopping frequency match
    if (user1.shopping_frequency === user2.shopping_frequency) score += 0.3;
    
    // Spending pattern overlap
    if (user1.spending_patterns && user2.spending_patterns) {
      const patterns1 = new Set(user1.spending_patterns.map(p => p.category));
      const patterns2 = new Set(user2.spending_patterns.map(p => p.category));
      const intersection = new Set([...patterns1].filter(x => patterns2.has(x)));
      score += (intersection.size / Math.max(patterns1.size, patterns2.size)) * 0.3;
    }
    
    return score;
  }

  /**
   * Generate community-focused circle name
   */
  private async generateCommunityCircleName(mainUser: UserWithSpendingProfile, similarUsers: UserWithSpendingProfile[]): Promise<string> {
    const allUsers = [mainUser, ...similarUsers];
    
    // Get or determine neighborhood name
    const neighborhood = await this.getNeighborhoodName(mainUser.postal_code || '');
    const lifeStage = mainUser.life_stage || 'Community';
    
    // Determine primary spending focus
    const spendingPatterns = allUsers.flatMap(u => u.spending_patterns || []);
    const dominantPattern = this.getDominantSpendingPattern(spendingPatterns);

    let name = neighborhood ? `${neighborhood} ` : '';
    name += this.formatLifeStage(lifeStage);
    
    if (dominantPattern && !['convenience', 'premium'].includes(dominantPattern)) {
      name += ` (${this.formatSpendingPattern(dominantPattern)})`;
    }

    return name;
  }

  /**
   * Get neighborhood name from postal code or cache
   */
  private async getNeighborhoodName(postalCode: string): Promise<string> {
    if (!postalCode) return 'Local';

    // Try to get from location cache first
    const { data: cached, error } = await this.supabase
      .from('user_location_cache')
      .select('city, region')
      .eq('postal_code', postalCode.replace(/\s/g, '').toUpperCase())
      .limit(1)
      .single();

    if (!error && cached?.city) {
      return cached.city;
    }

    // Fallback to postal code analysis
    return this.extractLocationFromPostalCode(postalCode);
  }

  /**
   * Ensure location cache is populated for circle members
   */
  private async ensureLocationCacheForUsers(users: UserWithSpendingProfile[]): Promise<void> {
    for (const user of users) {
      if (user.postal_code) {
        const cached = await this.getCachedCoordinates(user.postal_code);
        if (!cached) {
          const coords = await this.geocodePostalCode(user.postal_code);
          if (coords) {
            await this.cacheCoordinates(user.postal_code, coords);
          }
        }
      }
    }
  }

  /**
   * Generate community-focused circle description
   */
  private generateCommunityCircleDescription(mainUser: UserWithSpendingProfile, similarUsers: UserWithSpendingProfile[]): string {
    const allUsers = [mainUser, ...similarUsers];
    const lifeStage = mainUser.life_stage;
    const neighborhood = this.extractLocationFromPostalCode(mainUser.postal_code || '');
    
    const dominantPattern = this.getDominantSpendingPattern(
      allUsers.flatMap(u => u.spending_patterns || [])
    );

    let description = `A community of ${allUsers.length} ${this.formatLifeStage(lifeStage || 'neighbors')} `;
    description += `in ${neighborhood}, sharing similar shopping preferences `;
    
    if (dominantPattern) {
      description += `with a focus on ${this.formatSpendingPattern(dominantPattern).toLowerCase()} `;
    }
    
    description += 'to save money together through group buying and local deals.';
    
    return description;
  }

  /**
   * Get dominant spending pattern from a list
   */
  private getDominantSpendingPattern(patterns: SpendingPattern[]): string | null {
    if (!patterns.length) return null;

    const patternCounts = new Map<string, number>();
    patterns.forEach(pattern => {
      const count = patternCounts.get(pattern.category) || 0;
      patternCounts.set(pattern.category, count + pattern.frequency);
    });

    const dominant = Array.from(patternCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];

    return dominant ? dominant[0] : null;
  }

  private extractLocationFromPostalCode(postalCode: string): string {
    // Simplified location extraction - use proper geolocation service
    const areaMap: { [key: string]: string } = {
      'M': 'Toronto',
      'K': 'Ottawa',
      'V': 'Vancouver',
      'T': 'Calgary',
      'R': 'Winnipeg'
    };
    
    const firstChar = postalCode.charAt(0).toUpperCase();
    return areaMap[firstChar] || 'Local';
  }

  private formatLifeStage(lifeStage: string): string {
    const formatted = lifeStage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return formatted;
  }

  private formatSpendingPattern(pattern: string): string {
    const patternMap: { [key: string]: string } = {
      'budget-conscious': 'Budget Savers',
      'organic-focused': 'Organic Buyers',
      'bulk-buyer': 'Bulk Shoppers',
      'premium': 'Premium Shoppers'
    };
    
    return patternMap[pattern] || pattern;
  }

  /**
   * Batch geocode multiple postal codes for efficiency
   */
  private async batchGeocodePostalCodes(postalCodes: string[]): Promise<Map<string, {lat: number, lng: number}>> {
    const results = new Map<string, {lat: number, lng: number}>();
    
    // Process in batches to respect API rate limits (OpenCage allows up to 1 req/sec on free plan)
    const batchSize = 1;
    
    for (let i = 0; i < postalCodes.length; i += batchSize) {
      const batch = postalCodes.slice(i, i + batchSize);
      
      for (const postalCode of batch) {
        const coords = await this.geocodePostalCode(postalCode);
        if (coords) {
          results.set(postalCode, coords);
          await this.cacheCoordinates(postalCode, coords);
        }
        
        // Rate limiting: 1 request per second for free tier
        if (i + 1 < postalCodes.length) {
          await new Promise(resolve => setTimeout(resolve, 1100));
        }
      }
    }
    
    return results;
  }

  /**
   * Initialize location cache for existing users
   */
  async initializeLocationCache(): Promise<void> {
    console.log('🗺️ Initializing location cache for existing users...');
    
    try {
      // Get all unique postal codes that aren't cached yet
      const { data: uncachedPostalCodes, error } = await this.supabase
        .from('users')
        .select('postal_code')
        .not('postal_code', 'is', null)
        .not('id', 'in', 
          this.supabase
            .from('user_location_cache')
            .select('user_id')
        )
        .order('postal_code');

      if (error) {
        throw error;
      }
      
      if (!uncachedPostalCodes || uncachedPostalCodes.length === 0) {
        console.log('✅ All postal codes already cached');
        return;
      }
      
      console.log(`📍 Found ${uncachedPostalCodes.length} postal codes to geocode`);
      
      const postalCodes = [...new Set(uncachedPostalCodes.map(row => row.postal_code))]; // Remove duplicates
      const geocodedResults = await this.batchGeocodePostalCodes(postalCodes);
      
      console.log(`✅ Successfully geocoded ${geocodedResults.size}/${postalCodes.length} postal codes`);
      
      // Update user coordinates where available
      for (const [postalCode, coords] of geocodedResults) {
        const { error: updateError } = await this.supabase
          .from('users')
          .update({ 
            latitude: coords.lat, 
            longitude: coords.lng 
          })
          .eq('postal_code', postalCode)
          .is('latitude', null);

        if (updateError) {
          console.error('Error updating user coordinates:', updateError);
        }
      }
      
    } catch (error) {
      console.error('Error initializing location cache:', error);
    }
  }

  /**
   * Community-focused circle optimization
   */
  private async optimizeExistingCircles(): Promise<void> {
    console.log('🔧 Running community-focused circle optimization...');
    
    const circles = await this.getAllCirclesWithMembers();
    
    for (const circle of circles) {
      // Check if circle maintains good geographic cohesion
      const avgDistance = await this.calculateAverageCircleDistance(circle);
      
      if (avgDistance > this.defaultCriteria.max_distance_km * 1.2) {
        console.log(`🌍 Circle ${circle.name} has poor geographic cohesion (${avgDistance}km avg). Considering splits.`);
        await this.considerCircleSplit(circle);
      }
    }
  }

  /**
   * Calculate average distance between circle members
   */
  private async calculateAverageCircleDistance(circle: CircleWithMembers): Promise<number> {
    const members = circle.members.filter(m => m.postal_code);
    if (members.length < 2) return 0;

    let totalDistance = 0;
    let pairCount = 0;

    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const distance = await this.calculatePostalCodeDistance(
          members[i].postal_code!,
          members[j].postal_code!
        );
        totalDistance += distance;
        pairCount++;
      }
    }

    return pairCount > 0 ? totalDistance / pairCount : 0;
  }

  /**
   * Consider splitting a geographically dispersed circle
   */
  private async considerCircleSplit(circle: CircleWithMembers): Promise<void> {
    // Logic to split circles that have become too geographically dispersed
    // This maintains the community focus of the app
    console.log(`📍 Analyzing ${circle.name} for potential geographic clustering...`);
    
    // Implementation would group members by proximity and create new circles if needed
    // This ensures circles remain truly community-focused
  }
}

// Usage example and export
export { LifeStageMatchingService, type UserWithSpendingProfile, type MatchingCriteria };

/**
 * Setup and Usage Instructions:
 * 
 * 1. Add Environment Variables to your .env file:
 *    VITE_SUPABASE_URL=your_supabase_url
 *    VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  // For admin operations
 *    VITE_OPENCAGE_API_KEY=your_opencage_api_key
 * 
 * 2. Ensure your colleague's shopping frequency calculation is populating 
 *    the users.shopping_frequency field
 * 
 * 3. Usage in your app:
 */

// Example implementation:
/*
import { LifeStageMatchingService } from './path/to/circleMatchingAlgorithm';

// Initialize the matching service (creates its own Supabase client)
const matchingService = new LifeStageMatchingService();

// Pre-populate location cache (run once for existing users)
export async function initializeUserLocations() {
  try {
    await matchingService.initializeLocationCache();
    console.log('✅ Location cache initialized');
  } catch (error) {
    console.error('❌ Error initializing location cache:', error);
  }
}

// Run the matching algorithm
export async function runCircleMatching() {
  try {
    await matchingService.runMatchingAlgorithm();
    console.log('✅ Circle matching completed');
  } catch (error) {
    console.error('❌ Error running circle matching:', error);
  }
}

// Usage in your React component:
function AdminPanel() {
  const handleRunMatching = async () => {
    await runCircleMatching();
  };

  const handleInitializeLocations = async () => {
    await initializeUserLocations();
  };

  return (
    <div>
      <button onClick={handleInitializeLocations}>
        Initialize Location Cache
      </button>
      <button onClick={handleRunMatching}>
        Run Circle Matching
      </button>
    </div>
  );
}
*/