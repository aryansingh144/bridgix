'use client';
import { createSlice } from '@reduxjs/toolkit';

// Mock identities used for the role switcher. The `_id` values here are
// placeholders — on app load we hydrate them from the backend so they map to
// real seeded users (and real Mongo ObjectIds the API can persist against).
const mockUsers = {
  student: {
    _id: 'mock-student-1',
    name: 'Aryan Singh',
    email: 'aryan.singh@example.com',
    role: 'student',
    avatar: 'https://ui-avatars.com/api/?name=Aryan+Singh&background=2BC0B4&color=fff&size=128',
    age: 21,
    education: 'B.Tech Computer Science',
    status: 'Active',
    yearOfStudy: '3rd Year',
    location: 'New Delhi, India',
    topSkills: ['React', 'Node.js', 'Python'],
    bio: 'Passionate computer science student with a keen interest in full-stack development and AI.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB', 'Git'],
    coreNeeds: ['Mentorship in AI/ML', 'Internship Opportunities', 'Career Guidance'],
    points: 55,
    college: 'IIT Delhi',
    quote: '"The best way to predict the future is to invent it." — Alan Kay'
  },
  alumni: {
    _id: 'mock-alumni-1',
    name: 'Mohit Singh',
    email: 'mohit.singh@example.com',
    role: 'alumni',
    avatar: 'https://ui-avatars.com/api/?name=Mohit+Singh&background=FF8C42&color=fff&size=128',
    age: 28,
    education: 'B.Tech Computer Science',
    status: 'Working',
    occupation: 'Senior Software Engineer at Google',
    location: 'Bengaluru, India',
    topSkills: ['System Design', 'Distributed Systems', 'Go'],
    techLiteracy: 'Expert',
    bio: 'Senior Software Engineer at Google with 5+ years of experience.',
    services: ['Technical Interviews Preparation', 'Resume Review', 'Career Counseling'],
    workExperience: ['Senior Software Engineer - Google (2021-Present)', 'Software Engineer - Amazon (2019-2021)'],
    points: 105,
    college: 'IIT Delhi',
    quote: '"The journey of a thousand miles begins with one step."'
  },
  college: {
    _id: 'mock-college-1',
    name: 'IIT Delhi Admin',
    email: 'admin@iitd.ac.in',
    role: 'college',
    avatar: 'https://ui-avatars.com/api/?name=IIT+Delhi&background=1a9e93&color=fff&size=128',
    college: 'IIT Delhi',
    location: 'New Delhi, India'
  }
};

const initialState = {
  currentUser: mockUsers.student,
  activeRole: 'student',
  mockUsers,
  users: [],
  hydrated: false,
  authUser: null,            // populated when a real session is active
  isAuthenticated: false,
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setActiveRole: (state, action) => {
      // Role switcher only affects the demo session — real authenticated users
      // shouldn't be silently swapped out.
      state.activeRole = action.payload;
      if (!state.isAuthenticated) {
        state.currentUser = state.mockUsers[action.payload];
      }
    },
    setAuth: (state, action) => {
      const user = action.payload?.user || action.payload;
      state.authUser = user || null;
      state.isAuthenticated = !!user;
      if (user) {
        state.currentUser = user;
        state.activeRole = user.role || state.activeRole;
      }
    },
    clearAuth: (state) => {
      state.authUser = null;
      state.isAuthenticated = false;
      state.currentUser = state.mockUsers[state.activeRole] || state.mockUsers.student;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    /**
     * Replace mockUsers' placeholder _ids with real ObjectIds from the
     * seeded backend, picking the first user of each role. Called once on
     * app boot so chat / posts / discussion can persist against real users
     * without needing real auth.
     */
    hydrateMockUsers: (state, action) => {
      const real = action.payload || [];
      const firstStudent = real.find(u => u.role === 'student');
      const firstAlumni = real.find(u => u.role === 'alumni');

      if (firstStudent) {
        state.mockUsers.student = {
          ...state.mockUsers.student,
          ...firstStudent,
          _id: firstStudent._id
        };
      }
      if (firstAlumni) {
        state.mockUsers.alumni = {
          ...state.mockUsers.alumni,
          ...firstAlumni,
          _id: firstAlumni._id
        };
      }

      // Only refresh currentUser when not signed in — otherwise we'd clobber
      // the real authenticated user with a hydrated mock identity.
      if (!state.isAuthenticated) {
        state.currentUser = state.mockUsers[state.activeRole] || state.currentUser;
      }
      state.users = real;
      state.hydrated = true;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateCurrentUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    }
  }
});

export const {
  setActiveRole,
  setUsers,
  hydrateMockUsers,
  setAuth,
  clearAuth,
  setLoading,
  setError,
  updateCurrentUser
} = userSlice.actions;
export default userSlice.reducer;
