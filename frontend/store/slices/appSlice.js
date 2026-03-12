'use client';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  posts: [],
  discussions: [],
  events: [],
  leaderboard: [],
  messages: [],
  connections: [],
  notifications: [
    { id: 1, text: 'Mohit Singh replied to your discussion', time: '2h ago', read: false },
    { id: 2, text: 'Shivansh Sharma sent you a connection request', time: '5h ago', read: false },
    { id: 3, text: 'New event: Alumni Meetup 2026', time: '1d ago', read: true },
    { id: 4, text: 'Your post received 10 likes', time: '2d ago', read: true }
  ],
  sidebarOpen: true,
  postsLoading: false,
  discussionsLoading: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    togglePostLike: (state, action) => {
      const { postId, userId } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        const index = post.likes.indexOf(userId);
        if (index === -1) {
          post.likes.push(userId);
        } else {
          post.likes.splice(index, 1);
        }
      }
    },
    setDiscussions: (state, action) => {
      state.discussions = action.payload;
    },
    addDiscussion: (state, action) => {
      state.discussions.unshift(action.payload);
    },
    setEvents: (state, action) => {
      state.events = action.payload;
    },
    setLeaderboard: (state, action) => {
      state.leaderboard = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setConnections: (state, action) => {
      state.connections = action.payload;
    },
    markNotificationRead: (state, action) => {
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif) notif.read = true;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setPostsLoading: (state, action) => {
      state.postsLoading = action.payload;
    },
    setDiscussionsLoading: (state, action) => {
      state.discussionsLoading = action.payload;
    }
  }
});

export const {
  setPosts, addPost, togglePostLike,
  setDiscussions, addDiscussion,
  setEvents, setLeaderboard,
  setMessages, addMessage,
  setConnections, markNotificationRead,
  toggleSidebar, setPostsLoading, setDiscussionsLoading
} = appSlice.actions;
export default appSlice.reducer;
