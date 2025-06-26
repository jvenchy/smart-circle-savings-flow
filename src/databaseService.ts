import supabase from './supabaseClient';
import { UserClassification } from './classificationService';

// Type definitions for database tables
interface User {
  id: string;
  email: string;
  full_name?: string;
  postal_code?: string;
  life_stage?: string;
  primary_life_stage?: string;
  secondary_life_stages?: string[];
  stage_confidence_score?: number;
  created_at: string;
  updated_at?: string;
}

interface UserLifeStageHistory {
  id: string;
  user_id: string;
  life_stage: string;
  confidence_score: number;
  transition_evidence?: string;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export async function updateUserLifeStage(
  userId: string, 
  classification: UserClassification
): Promise<void> {
  if (!userId || !classification) {
    throw new Error('Both userId and classification data are required');
  }

  try {
    // Step 1: Fetch the user's current life stage
    console.log(`🔍 Fetching current life stage for user: ${userId}`);
    
    const { data: user, error: userFetchError } = await supabase
      .from('users')
      .select('id, primary_life_stage, life_stage')
      .eq('id', userId)
      .single();

    if (userFetchError) {
      throw new Error(`Failed to fetch user: ${userFetchError.message}`);
    }

    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    // Determine current stage (try primary_life_stage first, fallback to life_stage)
    const currentStage = user.primary_life_stage || user.life_stage;
    const newStage = classification.primary_stage;
    
    console.log(`📊 Current stage: ${currentStage || 'None'} → New stage: ${newStage}`);

    // Step 2: Check if the life stage has changed
    const stageHasChanged = currentStage !== newStage;

    if (stageHasChanged) {
      console.log('🔄 Life stage changed, updating history...');
      
      // Step 3: Find and close the most recent history entry
      if (currentStage) {
        const { data: recentHistory, error: historyFetchError } = await supabase
          .from('user_life_stage_history')
          .select('id, started_at')
          .eq('user_id', userId)
          .eq('life_stage', currentStage)
          .is('ended_at', null)
          .order('started_at', { ascending: false })
          .limit(1)
          .single();

        if (historyFetchError && historyFetchError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is okay
          console.warn('⚠️ Warning fetching history:', historyFetchError.message);
        }

        if (recentHistory) {
          console.log(`📝 Closing previous history entry: ${recentHistory.id}`);
          
          const { error: updateHistoryError } = await supabase
            .from('user_life_stage_history')
            .update({ 
              ended_at: new Date().toISOString() 
            })
            .eq('id', recentHistory.id);

          if (updateHistoryError) {
            throw new Error(`Failed to update history end date: ${updateHistoryError.message}`);
          }
        }
      }

      // Step 4: Insert new history record
      console.log('➕ Creating new history entry...');
      
      const { error: insertHistoryError } = await supabase
        .from('user_life_stage_history')
        .insert({
          user_id: userId,
          life_stage: newStage,
          confidence_score: classification.confidence_score,
          transition_evidence: classification.reasoning,
          started_at: new Date().toISOString()
        });

      if (insertHistoryError) {
        throw new Error(`Failed to insert new history record: ${insertHistoryError.message}`);
      }
    } else {
      console.log('✅ Life stage unchanged, no history update needed');
    }

    // Step 5: Update the users table with new classification data
    console.log('🔄 Updating user record...');
    
    const updateData = {
      primary_life_stage: classification.primary_stage,
      secondary_life_stages: classification.secondary_stages,
      stage_confidence_score: classification.confidence_score,
      updated_at: new Date().toISOString()
    };

    // Also update the legacy life_stage field for backward compatibility
    const legacyUpdateData = {
      ...updateData,
      life_stage: classification.primary_stage
    };

    const { error: userUpdateError } = await supabase
      .from('users')
      .update(legacyUpdateData)
      .eq('id', userId);

    if (userUpdateError) {
      throw new Error(`Failed to update user record: ${userUpdateError.message}`);
    }

    console.log('✅ User life stage updated successfully!');
    
    // Log summary
    console.log('📋 Update Summary:');
    console.log(`   User ID: ${userId}`);
    console.log(`   Stage: ${currentStage || 'None'} → ${newStage}`);
    console.log(`   Confidence: ${(classification.confidence_score * 100).toFixed(1)}%`);
    console.log(`   Secondary Stages: ${classification.secondary_stages.join(', ') || 'None'}`);
    console.log(`   History Updated: ${stageHasChanged ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('❌ Failed to update user life stage:', error);
    throw error;
  }
}

// Helper function to get user's life stage history
export async function getUserLifeStageHistory(userId: string): Promise<UserLifeStageHistory[]> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const { data: history, error } = await supabase
      .from('user_life_stage_history')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user history: ${error.message}`);
    }

    return history || [];
  } catch (error) {
    console.error('❌ Failed to fetch user life stage history:', error);
    throw error;
  }
}

// Helper function to get current user classification
export async function getCurrentUserClassification(userId: string): Promise<{
  primary_stage: string | null;
  secondary_stages: string[] | null;
  confidence_score: number | null;
} | null> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('primary_life_stage, secondary_life_stages, stage_confidence_score, life_stage')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user classification: ${error.message}`);
    }

    if (!user) {
      return null;
    }

    return {
      primary_stage: user.primary_life_stage || user.life_stage,
      secondary_stages: user.secondary_life_stages || [],
      confidence_score: user.stage_confidence_score || null
    };
  } catch (error) {
    console.error('❌ Failed to fetch current user classification:', error);
    throw error;
  }
} 