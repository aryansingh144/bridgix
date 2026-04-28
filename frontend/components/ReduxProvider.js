'use client';
import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import axios from 'axios';
import { store } from '../store/store';
import { hydrateMockUsers } from '../store/slices/userSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function UserHydrator() {
  const dispatch = useDispatch();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users`);
        if (!cancelled && Array.isArray(res.data) && res.data.length) {
          dispatch(hydrateMockUsers(res.data));
        }
      } catch (e) {
        // Backend not up — keep the placeholder mock IDs; UI degrades to mock-only.
        console.warn('[bridgix] backend unreachable; staying on mock IDs:', e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [dispatch]);
  return null;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <UserHydrator />
      {children}
    </Provider>
  );
}
