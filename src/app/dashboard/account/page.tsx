'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
  subscriptionTier: string;
  subscriptionExpiresAt: string | null;
  newsletter: {
    subscribed: boolean;
    confirmed: boolean;
    unsubscribed: boolean;
    subscribedAt: string | null;
    source: string | null;
  };
}

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name ?? '');
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  function flash(type: 'success' | 'error', text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  }

  async function handleSaveName() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        flash('success', 'Name updated.');
        loadProfile();
      } else {
        flash('error', data.error ?? 'Failed to update name.');
      }
    } catch {
      flash('error', 'Network error.');
    }
    setSaving(false);
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) {
      flash('error', 'Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      flash('error', 'Passwords do not match.');
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        flash('success', 'Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        flash('error', data.error ?? 'Failed to change password.');
      }
    } catch {
      flash('error', 'Network error.');
    }
    setSaving(false);
  }

  async function handleToggleNewsletter(unsub: boolean) {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/user/newsletter/unsubscribe', {
        method: unsub ? 'POST' : 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        flash('success', unsub ? 'You have been unsubscribed from AMORA Weekly.' : 'You have been re-subscribed to AMORA Weekly.');
        loadProfile();
      } else {
        flash('error', data.error ?? 'Failed to update subscription.');
      }
    } catch {
      flash('error', 'Network error.');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Failed to load profile.</p>
      </div>
    );
  }

  const isPro = profile.subscriptionTier === 'pro';
  const isSubscribed = profile.newsletter.subscribed && !profile.newsletter.unsubscribed;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">My Account</h1>
        <p className="text-gray-400 mt-1">Manage your profile, subscription, and preferences.</p>
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-green-900/30 text-green-300 border border-green-800' : 'bg-red-900/30 text-red-300 border border-red-800'}`}>
          {msg.text}
        </div>
      )}

      {/* Profile info card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-semibold">Profile</h2>

        {/* Email (read-only) */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
          <div className="text-sm text-white font-mono bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
            {profile.email}
          </div>
        </div>

        {/* Member since */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Member since</label>
          <div className="text-sm text-gray-300">
            {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Display Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSaveName}
              disabled={saving || name === (profile.name ?? '')}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Subscription tier card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Subscription</h2>
          {isPro && (
            <span className="text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full font-medium">
              PRO
            </span>
          )}
        </div>

        {isPro ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm font-medium">Active Pro Subscription</span>
            </div>
            {profile.subscriptionExpiresAt && (
              <p className="text-xs text-gray-500">
                Expires: {new Date(profile.subscriptionExpiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            <p className="text-sm text-gray-400">You have full access to all premium reports, deep-dive analysis, and company intelligence.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">Free</span>
              <span className="text-sm">Free tier — limited access</span>
            </div>
            <p className="text-sm text-gray-500">Upgrade to AMORA Pro for full reports, deep-dive analysis, and complete company intelligence.</p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-amber-600/15 text-amber-400 border border-amber-600/30 rounded-lg hover:bg-amber-600/25 transition"
            >
              Upgrade to Pro &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Newsletter subscription card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Newsletter</h2>

        {isSubscribed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Subscribed to AMORA Weekly</span>
            </div>
            <p className="text-sm text-gray-500">
              {profile.newsletter.subscribedAt
                ? `Since ${new Date(profile.newsletter.subscribedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`
                : 'Active subscription'}
              {profile.newsletter.source ? ` via ${profile.newsletter.source}` : ''}
            </p>
            <p className="text-xs text-gray-600">Delivered every Friday &middot; Six frontier technology tracks</p>
            <button
              onClick={() => handleToggleNewsletter(true)}
              disabled={saving}
              className="text-sm text-red-400 hover:text-red-300 transition"
            >
              Unsubscribe
            </button>
          </div>
        ) : profile.newsletter.subscribed && profile.newsletter.unsubscribed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">Unsubscribed from AMORA Weekly</span>
            </div>
            <button
              onClick={() => handleToggleNewsletter(false)}
              disabled={saving}
              className="text-sm text-blue-400 hover:text-blue-300 transition"
            >
              Re-subscribe
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">You&apos;re not subscribed to AMORA Weekly yet.</p>
            <button
              onClick={() => handleToggleNewsletter(false)}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
            >
              Subscribe Now
            </button>
          </div>
        )}
      </div>

      {/* Password card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="Repeat new password"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
            className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white rounded-lg transition"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-red-900/30 rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
        <p className="text-sm text-gray-500">To delete your account, please contact support at support@amorainsights.com.</p>
      </div>
    </div>
  );
}
