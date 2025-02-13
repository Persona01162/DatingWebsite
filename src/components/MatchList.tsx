import React from 'react';
import { UserCircle2, Heart } from 'lucide-react';

interface Match {
  id: string;
  bio: string;
  minioFileUrl?: string;
  answers: {
    hobby: string;
    music: string;
    travel: string;
    food: string;
  };
}

interface MatchListProps {
  matches: Match[];
}

const MatchList: React.FC<MatchListProps> = ({ matches }) => {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No matches yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Keep checking back, your perfect match might be just around the corner!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <div
          key={match.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              {match.minioFileUrl ? (
                <img
                  src={match.minioFileUrl}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <UserCircle2 className="h-16 w-16 text-gray-400" />
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">Match Found!</h3>
                <p className="text-sm text-gray-500">50-60% Compatibility</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">About</h4>
                <p className="mt-1 text-sm text-gray-500 line-clamp-3">{match.bio}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Hobbies</h4>
                  <p className="mt-1 text-sm text-gray-500">{match.answers.hobby}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Music</h4>
                  <p className="mt-1 text-sm text-gray-500">{match.answers.music}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Travel</h4>
                  <p className="mt-1 text-sm text-gray-500">{match.answers.travel}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Food</h4>
                  <p className="mt-1 text-sm text-gray-500">{match.answers.food}</p>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
              <Heart className="h-5 w-5 mr-2" />
              Connect
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchList;