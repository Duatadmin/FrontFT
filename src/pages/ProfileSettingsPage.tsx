import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useUserStore } from '@/lib/stores/useUserStore';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase/schema.types';
import { toast } from '@/lib/utils/toast';
import { Link } from 'react-router-dom';

// Types

type DbUserRow = Database['public']['Tables']['users']['Row'];
type DbUserUpdate = Database['public']['Tables']['users']['Update'];

const defaultState: Partial<DbUserRow> = {
  user_name: '',
  goal: '',
  level: '',
  available_days_per_week: null,
  session_duration_minutes: null,
  sleep_hours_normalized: null,
  injuries: '',
  location: '',
  age: null,
  sex: '',
  height_cm: null,
  weight_kg: null,
};

const numberOrNull = (v: any): number | null => {
  if (v === '' || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const clamp = (val: number | null, min: number, max: number) => {
  if (val === null) return null;
  return Math.min(max, Math.max(min, val));
};

export default function ProfileSettingsPage() {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<DbUserRow>>(defaultState);

  const userId = user?.id ?? null;

  // Note: Using system locale is not required in this form; removed to avoid unused lint

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        if (error) throw error;
        const initial: Partial<DbUserRow> = {
          ...defaultState,
          ...data,
        };
        setForm(initial);
      } catch (err: any) {
        console.error('[ProfileSettings] load error', err);
        toast.error(err.message ?? 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleChange = (key: keyof DbUserRow, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      setSaving(true);

      // Basic normalization and validation
      const payload: DbUserUpdate = {
        user_name: (form.user_name ?? '').toString().trim() || null,
        goal: (form.goal ?? '').toString().trim() || null,
        level: (form.level ?? '').toString().trim() || null,
        available_days_per_week: clamp(numberOrNull(form.available_days_per_week), 0, 7),
        session_duration_minutes: clamp(numberOrNull(form.session_duration_minutes), 10, 300),
        sleep_hours_normalized: clamp(numberOrNull(form.sleep_hours_normalized), 0, 24),
        injuries: (form.injuries ?? '').toString().trim() || null,
        location: (form.location ?? '').toString().trim() || null,
        age: clamp(numberOrNull(form.age), 10, 120),
        sex: (form.sex ?? '').toString().trim() || null,
        height_cm: clamp(numberOrNull(form.height_cm), 100, 250),
        weight_kg: clamp(numberOrNull(form.weight_kg), 30, 400),
        updated_at: new Date().toISOString(),
      };

      const { error: updateErr } = await supabase
        .from('users')
        .update(payload)
        .eq('id', userId);

      if (updateErr) throw updateErr;

      // Keep auth metadata in sync for display name
      if (payload.user_name) {
        const { error: authErr } = await supabase.auth.updateUser({
          data: { full_name: payload.user_name },
        });
        if (authErr) {
          console.warn('[ProfileSettings] Failed to update auth metadata:', authErr);
        }
        // Don't manually update the store - let the auth listener handle it
        // This prevents race conditions and state conflicts
      }

      toast.success('Profile updated');
    } catch (err: any) {
      console.error('[ProfileSettings] save error', err);
      toast.error(err.message ?? 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const displayEmail = user?.email ?? '';

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            <p className="text-gray-400 text-sm">Manage your personal info and training preferences</p>
          </div>
          <Link
            to="/profile"
            className="text-sm text-accent-lime hover:text-accent-lime/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime rounded px-3 py-2"
          >
            Back to Profile
          </Link>
        </div>

        <Card className="p-6 bg-white/5 backdrop-blur-md border-white/10">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!saving) handleSave();
              }}
              className="space-y-8"
            >
              {/* Basic Info */}
              <section>
                <h2 className="text-lg font-semibold text-white mb-4">Basic Info</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="user_name" className="block text-sm text-gray-300 mb-1">Display Name</label>
                    <input
                      id="user_name"
                      type="text"
                      value={(form.user_name ?? '') as string}
                      onChange={(e) => handleChange('user_name', e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Email</label>
                    <div className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400">
                      {displayEmail}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm text-gray-300 mb-1">Location</label>
                    <input
                      id="location"
                      type="text"
                      value={(form.location ?? '') as string}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="City, Country"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime"
                    />
                  </div>
                  <div>
                    <label htmlFor="sex" className="block text-sm text-gray-300 mb-1">Sex</label>
                    <select
                      id="sex"
                      value={(form.sex ?? '') as string}
                      onChange={(e) => handleChange('sex', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent-lime"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Training Preferences */}
              <section>
                <h2 className="text-lg font-semibold text-white mb-4">Training Preferences</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="goal" className="block text-sm text-gray-300 mb-1">Goal</label>
                    <input
                      id="goal"
                      type="text"
                      value={(form.goal ?? '') as string}
                      onChange={(e) => handleChange('goal', e.target.value)}
                      placeholder="e.g. Hypertrophy"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime"
                    />
                  </div>
                  <div>
                    <label htmlFor="level" className="block text-sm text-gray-300 mb-1">Experience Level</label>
                    <select
                      id="level"
                      value={(form.level ?? '') as string}
                      onChange={(e) => handleChange('level', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent-lime"
                    >
                      <option value="">Select</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="available_days_per_week" className="block text-sm text-gray-300 mb-1">Days/Week</label>
                    <input
                      id="available_days_per_week"
                      type="number"
                      min={0}
                      max={7}
                      value={form.available_days_per_week ?? ''}
                      onChange={(e) => handleChange('available_days_per_week', e.target.value)}
                      placeholder="0-7"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime"
                    />
                  </div>
                  <div>
                    <label htmlFor="session_duration_minutes" className="block text-sm text-gray-300 mb-1">Session Duration (min)</label>
                    <input
                      id="session_duration_minutes"
                      type="number"
                      min={10}
                      max={300}
                      value={form.session_duration_minutes ?? ''}
                      onChange={(e) => handleChange('session_duration_minutes', e.target.value)}
                      placeholder="e.g. 60"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime"
                    />
                  </div>
                  <div>
                    <label htmlFor="sleep_hours_normalized" className="block text-sm text-gray-300 mb-1">Sleep (hrs)</label>
                    <input
                      id="sleep_hours_normalized"
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      value={form.sleep_hours_normalized ?? ''}
                      onChange={(e) => handleChange('sleep_hours_normalized', e.target.value)}
                      placeholder="e.g. 7.5"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="injuries" className="block text-sm text-gray-300 mb-1">Injuries / Notes</label>
                    <textarea
                      id="injuries"
                      value={(form.injuries ?? '') as string}
                      onChange={(e) => handleChange('injuries', e.target.value)}
                      placeholder="Any injuries, constraints, or notes"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime min-h-[88px]"
                    />
                  </div>
                </div>
              </section>

              {/* Body Metrics */}
              <section>
                <h2 className="text-lg font-semibold text-white mb-4">Body Metrics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-sm text-gray-300 mb-1">Age</label>
                    <input
                      id="age"
                      type="number"
                      min={10}
                      max={120}
                      value={form.age ?? ''}
                      onChange={(e) => handleChange('age', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent-lime"
                    />
                  </div>
                  <div>
                    <label htmlFor="height_cm" className="block text-sm text-gray-300 mb-1">Height (cm)</label>
                    <input
                      id="height_cm"
                      type="number"
                      min={100}
                      max={250}
                      value={form.height_cm ?? ''}
                      onChange={(e) => handleChange('height_cm', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent-lime"
                    />
                  </div>
                  <div>
                    <label htmlFor="weight_kg" className="block text-sm text-gray-300 mb-1">Weight (kg)</label>
                    <input
                      id="weight_kg"
                      type="number"
                      min={30}
                      max={400}
                      step={0.1}
                      value={form.weight_kg ?? ''}
                      onChange={(e) => handleChange('weight_kg', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent-lime"
                    />
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  to="/profile"
                  className="px-4 py-2 rounded-lg bg-white/5 text-white border border-white/10 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-lime/20 text-accent-lime hover:bg-accent-lime/30 border border-accent-lime/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime disabled:opacity-60"
                >
                  {saving && <LoadingSpinner size={16} />}
                  <span>Save changes</span>
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
