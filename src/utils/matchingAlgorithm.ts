import stringSimilarity from 'string-similarity';
import { getRandomFakeProfiles } from './fakeProfiles';

interface UserProfile {
  id: string;
  bio: string;
  gender: 'male' | 'female' | 'other';
  genderSeeking: 'male' | 'female' | 'other';
  answers: Record<string, string>;
  username: string;
  age: number;
}

export class MatchingAlgorithm {
  private static calculateTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    return stringSimilarity.compareTwoStrings(text1.toLowerCase(), text2.toLowerCase());
  }

  private static calculateAnswerSimilarity(
    answers1: Record<string, string>,
    answers2: Record<string, string>
  ): number {
    if (!answers1 || !answers2) return 0;
    
    const questions = ['hobby', 'music', 'travel', 'food'];
    let totalSimilarity = 0;
    let validQuestions = 0;

    questions.forEach(question => {
      const answer1 = answers1[question];
      const answer2 = answers2[question];
      
      if (answer1 && answer2) {
        const similarity = this.calculateTextSimilarity(answer1, answer2);
        totalSimilarity += similarity;
        validQuestions++;
      }
    });

    return validQuestions > 0 ? totalSimilarity / validQuestions : 0;
  }

  static async findMatches(
    currentUser: UserProfile,
    potentialMatches: UserProfile[]
  ): Promise<UserProfile[]> {
    try {
      const matches: Array<{ user: UserProfile; compatibility: number }> = [];

      // Process potential matches
      for (const potentialMatch of potentialMatches) {
        try {
          // Skip if genders don't match preferences
          if (potentialMatch.gender !== currentUser.genderSeeking ||
              potentialMatch.genderSeeking !== currentUser.gender) {
            continue;
          }

          // Calculate bio similarity
          const bioSimilarity = this.calculateTextSimilarity(
            currentUser.bio || '',
            potentialMatch.bio || ''
          );

          // Calculate answer similarity
          const answerSimilarity = this.calculateAnswerSimilarity(
            currentUser.answers || {},
            potentialMatch.answers || {}
          );

          // Calculate age compatibility (prefer matches within 5 years)
          const ageDifference = Math.abs(currentUser.age - potentialMatch.age);
          const ageCompatibility = Math.max(0, 1 - (ageDifference / 10));

          // Calculate overall compatibility (weighted average)
          const compatibility = (
            (bioSimilarity * 0.3) + 
            (answerSimilarity * 0.5) + 
            (ageCompatibility * 0.2)
          ) * 100;

          // Check if compatibility is between 50-60%
          if (compatibility >= 50 && compatibility <= 60) {
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

      // If no matches found, get random fake profiles
      if (matches.length === 0) {
        console.log('No matches found, fetching random fake profiles');
        const fakeProfiles = await getRandomFakeProfiles(10);
        return fakeProfiles;
      }

      // Sort by compatibility and return top matches
      return matches
        .sort((a, b) => b.compatibility - a.compatibility)
        .slice(0, 10) // Limit to top 10 matches
        .map(match => match.user);
    } catch (error) {
      console.error('Error in findMatches:', error);
      // Fallback to random fake profiles on error
      const fakeProfiles = await getRandomFakeProfiles(10);
      return fakeProfiles;
    }
  }
}