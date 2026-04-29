'use client';
import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import axios from 'axios';
import { store } from '../store/store';
import { hydrateMockUsers, setAuth, clearAuth } from '../store/slices/userSlice';
import api, { API_URL, TOKEN_KEY } from '../lib/api';

function Bootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1. If we have a token, restore the real session.
      const startingToken = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
      if (startingToken) {
        try {
          const { data } = await api.get('/api/auth/me');
          if (!cancelled) dispatch(setAuth({ user: data }));
        } catch (e) {
          // Only clear if the token in storage is still the one we
          // started with. A fresh login mid-flight replaces it, and
          // we must not wipe that out.
          if (typeof window !== 'undefined') {
            const current = window.localStorage.getItem(TOKEN_KEY);
            if (current === startingToken) {
              window.localStorage.removeItem(TOKEN_KEY);
              if (!cancelled) dispatch(clearAuth());
            }
          }
        }
      }

      // 2. Always hydrate the mock identities so the role switcher demo flow
      //    has real Mongo ObjectIds backing each role even when not signed in.
      try {
        const res = await axios.get(`${API_URL}/api/users`);
        if (!cancelled && Array.isArray(res.data) && res.data.length) {
          dispatch(hydrateMockUsers(res.data));
        }
      } catch (e) {
        // backend down — keep placeholder mock IDs
      }
    })();

    return () => { cancelled = true; };
  }, [dispatch]);

  return null;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <Bootstrap />
      {children}
    </Provider>
  );
}
