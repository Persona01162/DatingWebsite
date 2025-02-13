import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, UserCircle2, Send } from 'lucide-react';
import { auth, database } from '../services/firebase';
import { ref, get, onValue, off, push, serverTimestamp } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
}

interface Match {
  id: string;
  username: string;
  lastMessage?: Message;
  unreadCount?: number;
}

const MessagesPage = () => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    // Fetch matches and listen for updates
    const matchesRef = ref(database, `users/${currentUser.uid}/matches`);
    const unsubscribeMatches = onValue(matchesRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setMatches([]);
        setLoading(false);
        return;
      }

      try {
        const matchesData = snapshot.val();
        const matchPromises = Object.keys(matchesData).map(async (matchId) => {
          const userRef = ref(database, `users/${matchId}`);
          const userSnapshot = await get(userRef);
          const userData = userSnapshot.val();

          // Get last message and unread count
          const chatRef = ref(database, `chats/${currentUser.uid}_${matchId}/messages`);
          const chatSnapshot = await get(chatRef);
          const messages = chatSnapshot.exists() ? Object.entries(chatSnapshot.val()).map(([id, msg]: [string, any]) => ({
            id,
            ...msg
          })) : [];

          const unreadCount = messages.filter(msg => 
            msg.senderId === matchId && msg.status !== 'read'
          ).length;

          const lastMessage = messages[messages.length - 1];

          return {
            id: matchId,
            username: userData.username,
            lastMessage,
            unreadCount
          };
        });

        const matchesWithData = await Promise.all(matchPromises);
        setMatches(matchesWithData.sort((a, b) => {
          const timeA = a.lastMessage?.timestamp || 0;
          const timeB = b.lastMessage?.timestamp || 0;
          return timeB - timeA;
        }));
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      off(matchesRef);
      if (selectedMatch) {
        const chatRef = ref(database, `chats/${currentUser.uid}_${selectedMatch.id}/messages`);
        off(chatRef);
      }
    };
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectMatch = async (match: Match) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setSelectedMatch(match);
    
    // Subscribe to messages
    const chatRef = ref(database, `chats/${currentUser.uid}_${match.id}/messages`);
    onValue(chatRef, (snapshot) => {
      if (!snapshot.exists()) {
        setMessages([]);
        return;
      }

      const messagesData = snapshot.val();
      const messagesList = Object.entries(messagesData).map(([id, msg]: [string, any]) => ({
        id,
        ...msg
      }));

      setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp));

      // Mark messages as read
      messagesList.forEach(msg => {
        if (msg.senderId === match.id && msg.status !== 'read') {
          const messageRef = ref(database, `chats/${currentUser.uid}_${match.id}/messages/${msg.id}`);
          push(messageRef, { status: 'read' });
        }
      });
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatch || !auth.currentUser || sending) return;

    try {
      setSending(true);
      const currentUser = auth.currentUser;
      const messageData = {
        senderId: currentUser.uid,
        content: newMessage,
        timestamp: serverTimestamp(),
        status: 'sent'
      };

      // Add message to both users' chat references
      const chatRef1 = ref(database, `chats/${currentUser.uid}_${selectedMatch.id}/messages`);
      const chatRef2 = ref(database, `chats/${selectedMatch.id}_${currentUser.uid}/messages`);

      await Promise.all([
        push(chatRef1, messageData),
        push(chatRef2, messageData)
      ]);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-3 h-[calc(100vh-8rem)]">
          {/* Matches List */}
          <div className="col-span-1 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {matches.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No matches yet
                </div>
              ) : (
                matches.map((match) => (
                  <motion.button
                    key={match.id}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                    onClick={() => handleSelectMatch(match)}
                    className={`w-full p-4 flex items-center space-x-3 text-left relative ${
                      selectedMatch?.id === match.id ? 'bg-pink-50' : ''
                    }`}
                  >
                    <UserCircle2 className="h-10 w-10 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {match.username}
                      </p>
                      {match.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {match.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {match.unreadCount ? (
                      <span className="absolute top-4 right-4 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                        {match.unreadCount}
                      </span>
                    ) : null}
                  </motion.button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-2 flex flex-col">
            {selectedMatch ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
                  <UserCircle2 className="h-8 w-8 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedMatch.username}
                  </h3>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${
                          message.senderId === auth.currentUser?.uid
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.senderId === auth.currentUser?.uid
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-75">
                            {format(message.timestamp, 'HH:mm')}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-lg border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                      disabled={sending}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={sending}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                    </motion.button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    Select a conversation
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a match to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;