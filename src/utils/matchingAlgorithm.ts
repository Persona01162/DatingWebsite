import { pipeline, env } from '@xenova/transformers';
import { getRandomFakeProfiles } from './fakeProfiles';

// Configure environment
env.allowLocalModels = false;
env.useBrowserCache = true;

interface UserProfile {
  id: string;
  bio: string;
  gender: 'male' | 'female' | 'other';
  genderSeeking: 'male' | 'female' | 'other';
  answers: Record<string, string>;
  username: string;
  age: number;
  settings?: {
    ageRange?: {
      min: number;
      max: number;
    };
  };
}

export class MatchingAlgorithm {
  private static embeddingPipeline: any = null;
  private static modelName = 'Xenova/all-MiniLM-L6-v2';

  private static async getEmbeddingPipeline() {
    if (!this.embeddingPipeline) {
      this.embeddingPipeline = await pipeline('feature-extraction', this.modelName);
    }
    return this.embeddingPipeline;
  }

  private static async getEmbedding(text: string) {
    try {
      const pipe = await this.getEmbeddingPipeline();
      const output = await pipe(text, { pooling: 'mean', normalize: true });
      return output.data;
    } catch (error) {
      console.error('Error getting embedding:', error);
      return null;
    }
  }

  private static cosineSimilarity(a: Float32Array, b: Float32Array): number {
    try {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      
      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      
      normA = Math.sqrt(normA);
      normB = Math.sqrt(normB);
      
      if (normA === 0 || normB === 0) return 0;
      
      return dotProduct / (normA * normB);
    } catch (error) {
      console.error('Error calculating cosine similarity:', error);
      return 0;
    }
  }

  private static async calculateSemanticSimilarity(text1: string, text2: string): Promise<number> {
    if (!text1 || !text2) return 0;

    try {
      const embedding1 = await this.getEmbedding(text1);
      const embedding2 = await this.getEmbedding(text2);

      if (!embedding1 || !embedding2) return 0;

      return this.cosineSimilarity(embedding1, embedding2);
    } catch (error) {
      console.error('Error calculating semantic similarity:', error);
      return 0;
    }
  }

  private static async calculateAnswerSimilarity(
    answers1: Record<string, string>,
    answers2: Record<string, string>
  ): Promise<number> {
    if (!answers1 || !answers2) return 0;
    
    const questions = ['hobby', 'music', 'travel', 'food'];
    let totalSimilarity = 0;
    let validQuestions = 0;

    for (const question of questions) {
      const answer1 = answers1[question];
      const answer2 = answers2[question];
      
      if (answer1 && answer2) {
        try {
          const similarity = await this.calculateSemanticSimilarity(answer1, answer2);
          totalSimilarity += similarity;
          validQuestions++;
        } catch (error) {
          console.error(`Error calculating similarity for ${question}:, error`);
        }
      }
    }

    return validQuestions > 0 ? totalSimilarity / validQuestions : 0;
  }

  private static checkAgePreference(user1: UserProfile, user2: UserProfile): boolean {
    // Check if user2's age falls within user1's preferred range
    const user1Min = user1.settings?.ageRange?.min ?? 18;
    const user1Max = user1.settings?.ageRange?.max ?? 50;
    
    // Check if user1's age falls within user2's preferred range
    const user2Min = user2.settings?.ageRange?.min ?? 18;
    const user2Max = user2.settings?.ageRange?.max ?? 50;

    return (
      user2.age >= user1Min &&
      user2.age <= user1Max &&
      user1.age >= user2Min &&
      user1.age <= user2Max
    );
  }

  private static checkGenderPreference(user1: UserProfile, user2: UserProfile): boolean {
    return (
      user1.genderSeeking === user2.gender &&
      user2.genderSeeking === user1.gender
    );
  }

  static async findMatches(
    currentUser: UserProfile,
    potentialMatches: UserProfile[]
  ): Promise<UserProfile[]> {
    try {
      console.log('Starting matching process for user:', currentUser.username);
      const matches: Array<{ user: UserProfile; compatibility: number }> = [];

      // Filter potential matches based on gender and age preferences first
      const filteredMatches = potentialMatches.filter(match => 
        this.checkGenderPreference(currentUser, match) &&
        this.checkAgePreference(currentUser, match)
      );

      console.log(`Found ${filteredMatches.length} potential matches after initial filtering`);

      // Process filtered matches
      for (const potentialMatch of filteredMatches) {
        try {
          console.log(`Calculating compatibility with ${potentialMatch.username}`);

          // Calculate bio similarity using semantic matching
          const bioSimilarity = await this.calculateSemanticSimilarity(
            currentUser.bio || '',
            potentialMatch.bio || ''
          );
          console.log(`Bio similarity with ${potentialMatch.username}: ${bioSimilarity}`);

          // Calculate answer similarity using semantic matching
          const answerSimilarity = await this.calculateAnswerSimilarity(
            currentUser.answers || {},
            potentialMatch.answers || {}
          );
          console.log(`Answer similarity with ${potentialMatch.username}: ${answerSimilarity}`);

          // Calculate age compatibility (prefer matches within 5 years)
          const ageDifference = Math.abs(currentUser.age - potentialMatch.age);
          const ageCompatibility = Math.max(0, 1 - (ageDifference / 10));
          console.log(`Age compatibility with ${potentialMatch.username}: ${ageCompatibility}`);

          // Calculate overall compatibility (weighted average)
          const compatibility = (
            (bioSimilarity * 0.3) + 
            (answerSimilarity * 0.5) + 
            (ageCompatibility * 0.2)
          ) * 100;

          console.log(`Overall compatibility with ${potentialMatch.username}: ${compatibility}%`);

          // Check if compatibility is between 50-80%
          if (compatibility >= 50 ) {
            matches.push({
              user: potentialMatch,
              compatibility
            });
          }
        } catch (error) {
          console.error('Error processing potential match:', error);
          continue;
        }
      }

      console.log(`Found ${matches.length} matches within compatibility range`);

      // If no matches found, get random fake profiles based on gender preference
      if (matches.length === 0) {
        console.log('No matches found, fetching fake profiles');
        const fakeProfiles = await getRandomFakeProfiles(10, currentUser.genderSeeking);
        return fakeProfiles;
      }

      // Sort by compatibility and return top matches
      return matches
        .sort((a, b) => b.compatibility - a.compatibility)
        .slice(0, 10) // Limit to top 10 matches
        .map(match => match.user);
    } catch (error) {
      console.error('Error in findMatches:', error);
      // Fallback to random fake profiles based on gender preference
      console.log('Error occurred, falling back to fake profiles');
      const fakeProfiles = await getRandomFakeProfiles(10, currentUser.genderSeeking);
      return fakeProfiles;
    }
  }
}