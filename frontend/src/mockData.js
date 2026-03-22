export const mockChats = [
  {
    id: 'chat1',
    name: 'Elon Musk',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elon',
    lastMessage: 'Let\'s colonize Mars next week!',
    timestamp: '10:45 AM',
    unreadCount: 2,
    online: true,
  },
  {
    id: 'chat2',
    name: 'Bill Gates',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bill',
    lastMessage: 'Did you check the new Windows update?',
    timestamp: 'Yesterday',
    unreadCount: 0,
    online: false,
  },
  {
    id: 'chat3',
    name: 'Mark Zuckerberg',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark',
    lastMessage: 'Metaverse is the future 🕶️',
    timestamp: 'Wednesday',
    unreadCount: 0,
    online: true,
  },
  {
    id: 'chat4',
    name: 'Steve Jobs',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Steve',
    lastMessage: 'One more thing...',
    timestamp: 'Monday',
    unreadCount: 0,
    online: false,
  },
];

export const mockMessages = {
  chat1: [
    { id: 1, text: 'Hey, what are you up to?', sender: 'chat1', timestamp: '10:30 AM' },
    { id: 2, text: 'Just building a WhatsApp clone with an AI agent!', sender: 'user1', timestamp: '10:32 AM' },
    { id: 3, text: 'Awesome! Can it launch rockets?', sender: 'chat1', timestamp: '10:33 AM' },
    { id: 4, text: 'Not yet, maybe in the next version 🚀', sender: 'user1', timestamp: '10:35 AM' },
    { id: 5, text: 'Let\'s colonize Mars next week!', sender: 'chat1', timestamp: '10:45 AM' },
  ],
  chat2: [
    { id: 1, text: 'Hello! I heard you like coding.', sender: 'chat2', timestamp: 'Yesterday' },
  ],
  chat3: [
    { id: 1, text: 'Metaverse is starting to look great.', sender: 'chat3', timestamp: 'Wednesday' },
  ],
  chat4: [
    { id: 1, text: 'Stay hungry, stay foolish.', sender: 'chat4', timestamp: 'Monday' },
  ],
};
