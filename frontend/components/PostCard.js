'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { togglePostLike } from '../store/slices/appSlice';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PostCard({ post }) {
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [localPost, setLocalPost] = useState(post);

  const isLiked = localPost.likes?.includes(currentUser?._id);

  const handleLike = async () => {
    if (!currentUser?._id) return;
    const userId = currentUser._id;
    dispatch(togglePostLike({ postId: localPost._id, userId }));
    setLocalPost(prev => {
      const likes = [...(prev.likes || [])];
      const idx = likes.indexOf(userId);
      if (idx === -1) likes.push(userId);
      else likes.splice(idx, 1);
      return { ...prev, likes };
    });
    try {
      await axios.put(`${API_URL}/api/posts/${localPost._id}/like`, { userId });
    } catch (e) {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !currentUser?._id) return;
    const newComment = { author: currentUser, text: comment, createdAt: new Date().toISOString() };
    setLocalPost(prev => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
    const text = comment;
    setComment('');
    setShowComment(false);
    try {
      await axios.post(`${API_URL}/api/posts/${localPost._id}/comment`, {
        author: currentUser._id,
        text
      });
    } catch (e) {}
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const author = localPost.author || {};

  return (
    <div className="card mb-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Link href={`/profile/${author._id || 'me'}`}>
          <img
            src={author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name || 'User')}&background=2BC0B4&color=fff`}
            alt={author.name || 'User'}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${author._id || 'me'}`} className="font-semibold text-[#1a1a2e] dark:text-gray-100 text-sm hover:text-[#2BC0B4]">
              {author.name}
            </Link>
            <span className={`tag text-xs px-2 py-0.5 ${
              author.role === 'alumni'
                ? 'bg-[#FF8C42]/10 text-[#FF8C42]'
                : author.role === 'student'
                ? 'bg-[#2BC0B4]/10 text-[#2BC0B4]'
                : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            }`}>
              {author.role}
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {author.occupation || author.education || author.yearOfStudy} &bull; {timeAgo(localPost.createdAt)}
          </p>
          {localPost.flagged && localPost.moderationStatus !== 'approved' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 012 0v3a1 1 0 11-2 0V7zm1 7a1 1 0 100-2 1 1 0 000 2z"/></svg>
              Flagged · {Math.round((localPost.spamScore || 0) * 100)}% spam
            </span>
          )}
        </div>
        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3 whitespace-pre-line">{localPost.content}</p>

      {/* Image */}
      {localPost.image && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <img src={localPost.image} alt="Post" className="w-full object-cover max-h-72" />
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between py-2 border-t border-b border-gray-100 dark:border-gray-700 mb-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {(localPost.likes?.length || 0)} likes &bull; {(localPost.comments?.length || 0)} comments
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
            isLiked ? 'text-[#2BC0B4] bg-[#e8faf9] dark:bg-teal-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <svg className="w-4 h-4" fill={isLiked ? '#2BC0B4' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          Like
        </button>
        <button
          onClick={() => setShowComment(!showComment)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex-1 justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Comment
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex-1 justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>

      {/* Comment Input */}
      {showComment && (
        <form onSubmit={handleComment} className="mt-3 flex gap-2">
          <img
            src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=2BC0B4&color=fff`}
            alt={currentUser?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="input-field text-sm"
            />
            <button type="submit" className="btn-primary text-sm px-3 py-2">Post</button>
          </div>
        </form>
      )}

      {/* Comments */}
      {localPost.comments?.slice(-2).map((c, i) => (
        <div key={i} className="flex gap-2 mt-2">
          <img
            src={c.author?.avatar || `https://ui-avatars.com/api/?name=${c.author?.name || 'U'}&background=2BC0B4&color=fff`}
            alt={c.author?.name}
            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          />
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 flex-1">
            <span className="text-xs font-semibold text-[#1a1a2e] dark:text-gray-100">{c.author?.name || 'User'}</span>
            <p className="text-xs text-gray-600 dark:text-gray-300">{c.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
