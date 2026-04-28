'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import RoleSwitcher from '../../components/RoleSwitcher';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const STATUS_TABS = [
  { key: 'pending', label: 'Pending', color: '#FF8C42' },
  { key: 'approved', label: 'Approved', color: '#2BC0B4' },
  { key: 'removed', label: 'Removed', color: '#ef4444' },
  { key: 'all', label: 'All', color: '#6C63FF' }
];

function ScoreBar({ value, label, color }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 w-20">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono text-gray-600 dark:text-gray-300 w-10 text-right">{pct}%</span>
    </div>
  );
}

function DetectionCard({ item, onReview, busy }) {
  const author = item.author || {};
  const created = new Date(item.createdAt).toLocaleString();
  const reviewed = item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : null;

  const statusBadge =
    item.status === 'pending'
      ? 'bg-[#FF8C42]/10 text-[#FF8C42]'
      : item.status === 'approved'
      ? 'bg-[#2BC0B4]/10 text-[#2BC0B4]'
      : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';

  return (
    <div className="card mb-3">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={author.avatar || `https://ui-avatars.com/api/?name=${author.name || 'U'}&background=2BC0B4&color=fff`}
          alt={author.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-[#1a1a2e] dark:text-gray-100">
              {author.name || 'Unknown user'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {item.contentType}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge}`}>
              {item.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{created}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: item.score >= 0.5 ? '#ef4444' : '#2BC0B4' }}>
            {Math.round((item.score || 0) * 100)}
          </div>
          <p className="text-xs text-gray-400">spam score</p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3 mb-3">
        <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{item.text}</p>
      </div>

      <div className="space-y-1.5 mb-3">
        <ScoreBar value={item.bertScore} label="BERT" color="#6C63FF" />
        <ScoreBar value={item.graphsageScore} label="GraphSAGE" color="#2BC0B4" />
        <ScoreBar value={item.xgboostScore} label="XGBoost" color="#FF8C42" />
      </div>

      {item.reasons?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.reasons.map((r, i) => (
            <span
              key={i}
              className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full"
            >
              {r}
            </span>
          ))}
        </div>
      )}

      {item.status === 'pending' ? (
        <div className="flex gap-2">
          <button
            disabled={busy}
            onClick={() => onReview(item._id, 'approve')}
            className="flex-1 btn-outline text-xs py-2 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            disabled={busy}
            onClick={() => onReview(item._id, 'remove')}
            className="flex-1 text-xs py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ) : (
        reviewed && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Reviewed {reviewed} {item.reviewedBy?.name ? `by ${item.reviewedBy.name}` : ''}
          </p>
        )
      )}
    </div>
  );
}

export default function ModerationPage() {
  const { currentUser } = useSelector(state => state.user);
  const [status, setStatus] = useState('pending');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, removed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  // Tester widget
  const [testText, setTestText] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const load = async (s = status) => {
    setLoading(true);
    try {
      const [list, st] = await Promise.all([
        axios.get(`${API_URL}/api/moderation`, { params: { status: s } }),
        axios.get(`${API_URL}/api/moderation/stats`)
      ]);
      setItems(list.data);
      setStats(st.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(status); /* eslint-disable-next-line */ }, [status]);

  const handleReview = async (id, decision) => {
    setBusyId(id);
    try {
      await axios.put(`${API_URL}/api/moderation/${id}`, {
        decision,
        reviewerId: currentUser?._id
      });
      await load(status);
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  const runTester = async () => {
    if (!testText.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const { data } = await axios.post(`${API_URL}/api/moderation/classify`, { text: testText });
      setTestResult(data);
    } catch (e) {
      setTestResult({ error: e.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-gray-950">
      <RoleSwitcher />
      <Navbar type="app" />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1a1a2e] dark:text-gray-100">Moderation Queue</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Content flagged by the hybrid spam detector (BERT + GraphSAGE + XGBoost)
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Pending', value: stats.pending, color: '#FF8C42' },
            { label: 'Approved', value: stats.approved, color: '#2BC0B4' },
            { label: 'Removed', value: stats.removed, color: '#ef4444' },
            { label: 'Total', value: stats.total, color: '#6C63FF' }
          ].map(s => (
            <div key={s.label} className="card">
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Queue */}
          <div className="lg:col-span-2">
            <div className="flex gap-1 mb-4 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-100 dark:border-gray-700">
              {STATUS_TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setStatus(t.key)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                    status === t.key
                      ? 'bg-[#2BC0B4] text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="card text-center py-10 text-sm text-gray-500">Loading…</div>
            ) : items.length === 0 ? (
              <div className="card text-center py-10 text-sm text-gray-500">
                Nothing in this bucket. The detector hasn't flagged anything matching this filter.
              </div>
            ) : (
              items.map(it => (
                <DetectionCard key={it._id} item={it} onReview={handleReview} busy={busyId === it._id} />
              ))
            )}
          </div>

          {/* Tester widget */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <h3 className="font-semibold text-sm text-[#1a1a2e] dark:text-gray-100 mb-1">Try the detector</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Run any text through the live model without saving content.
              </p>
              <textarea
                value={testText}
                onChange={e => setTestText(e.target.value)}
                placeholder='Try: "CONGRATULATIONS! You won $1000. Click here to claim now!!!"'
                className="input-field text-sm h-24 resize-none"
              />
              <button
                disabled={testing}
                onClick={runTester}
                className="btn-primary w-full mt-2 text-sm py-2 disabled:opacity-50"
              >
                {testing ? 'Classifying…' : 'Classify'}
              </button>

              {testResult && !testResult.error && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Verdict</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        testResult.is_spam
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-[#2BC0B4]/10 text-[#2BC0B4]'
                      }`}
                    >
                      {testResult.label?.toUpperCase()} ({Math.round(testResult.score * 100)}%)
                    </span>
                  </div>
                  <ScoreBar value={testResult.bert_score} label="BERT" color="#6C63FF" />
                  <ScoreBar value={testResult.graphsage_score} label="GraphSAGE" color="#2BC0B4" />
                  <ScoreBar value={testResult.xgboost_score} label="XGBoost" color="#FF8C42" />
                  {testResult.reasons?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {testResult.reasons.map((r, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {testResult?.error && (
                <p className="text-xs text-red-500 mt-3">{testResult.error}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
