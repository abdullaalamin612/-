import React, { useState, useEffect } from 'react';
import { adminFetch } from '../adminApi';
import { useShop } from '../../context/ShopContext';
import {
  Palette,
  Layout,
  Type,
  Sliders,
  Save,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Monitor,
  Smartphone,
  Eye,
} from 'lucide-react';

export const StoreDesignModule: React.FC = () => {
  const { showToast } = useShop();
  const [design, setDesign] = useState({
    primaryColor: '#92400E',
    accentColor: '#B45309',
    bannerHeight: 'compact', // compact, medium, tall
    announcementBarText: '✨ সিরাজগঞ্জের আসল তাঁতের লুঙ্গি ও প্রিমিয়াম পাঞ্জাবিতে বিশেষ ছাড়! ক্যাশ অন ডেলিভারি সুবিধা।',
    showAnnouncementBar: true,
    fontFamily: 'Hind Siliguri',
    showFloatingChat: true,
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    adminFetch('/api/admin/store-design')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.design) {
          setDesign(data.design);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await adminFetch('/api/admin/store-design', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(design),
      });
      const data = await res.json();
      if (data.success) {
        showToast('স্টোর ডিজাইন সেটিংস সফলভাবে সংরক্ষিত হয়েছে');
      } else {
        showToast(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-amber-600" />
            <span>স্টোর ডিজাইন ও ভিজ্যুয়াল থিম (Store Design &amp; Theme)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            স্লাইডার ব্যানার উচ্চতা, অ্যানাউন্সমেন্ট বার, কালার প্যালেট ও ফ্রন্টএন্ড লেআউট কাস্টমাইজেশন
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'ডিজাইন সেভ করুন'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Design Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Height & Dimensions */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>হোমপেজ ও প্রোডাক্ট স্লাইডার ব্যানার উচ্চতা (Banner Height)</span>
            </h2>

            <p className="text-xs text-stone-500">
              গ্রাহকের অনুরোধ অনুযায়ী ব্যানারের হাইট কমিয়ে স্ক্রিনে বেশি প্রোডাক্ট ও তথ্য দেখানোর অপশন:
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'compact', label: 'কমপ্যাক্ট (Compact / কম উচ্চতা)', desc: 'উচ্চতা কম (~২৮০px), দ্রুত লোড' },
                { id: 'medium', label: 'মিডিয়াম (Standard)', desc: 'স্বাভাবিক ব্যানার (~৩৬০px)' },
                { id: 'tall', label: 'উঁচু (Spacious)', desc: 'বড় সিনেমাটিক ব্যানার (~৪৫০px)' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setDesign({ ...design, bannerHeight: opt.id })}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    design.bannerHeight === opt.id
                      ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <p className="text-xs font-bold text-stone-900">{opt.label}</p>
                  <p className="text-[11px] text-stone-500 mt-1">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Announcement Bar */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Layout className="w-4 h-4 text-amber-600" />
                <span>হেডার অ্যানাউন্সমেন্ট ও অফার বার (Top Announcement Bar)</span>
              </h2>
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={design.showAnnouncementBar}
                  onChange={(e) => setDesign({ ...design, showAnnouncementBar: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>চালু রাখুন</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">অ্যানাউন্সমেন্ট টেক্সট</label>
              <textarea
                rows={2}
                value={design.announcementBarText}
                onChange={(e) => setDesign({ ...design, announcementBarText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                placeholder="যেমন: বিশেষ অফার চলছে..."
              />
            </div>
          </div>

          {/* Brand Colors */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-600" />
              <span>ব্র্যান্ড কালার থিম (Brand Color Palette)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">প্রাইমারি কালার (Primary Brand Color)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.primaryColor}
                    onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={design.primaryColor}
                    onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">অ্যাকসেন্ট কালার (Accent / Highlight Color)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.accentColor}
                    onChange={(e) => setDesign({ ...design, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={design.accentColor}
                    onChange={(e) => setDesign({ ...design, accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mockup Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-stone-600" />
              <span>লাইভ প্রিভিউ (Live Preview)</span>
            </h2>

            {/* Simulated Mobile Mockup */}
            <div className="border border-stone-300 rounded-2xl overflow-hidden bg-[#FBFBFB] shadow-inner text-xs">
              {/* Top Announcement Bar */}
              {design.showAnnouncementBar && (
                <div
                  style={{ backgroundColor: design.primaryColor }}
                  className="px-3 py-1.5 text-[10px] text-white text-center font-medium truncate"
                >
                  {design.announcementBarText}
                </div>
              )}

              {/* Simulated Header */}
              <div className="p-3 bg-white border-b border-stone-200 flex items-center justify-between">
                <span className="font-bold text-stone-900">BASTRA SHOILY</span>
                <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded font-bold">🛒 কার্ট (২)</span>
              </div>

              {/* Simulated Slider Banner */}
              <div
                className={`w-full bg-stone-800 text-white flex flex-col items-center justify-center p-4 transition-all ${
                  design.bannerHeight === 'compact' ? 'h-24' : design.bannerHeight === 'medium' ? 'h-32' : 'h-40'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">সিরাজগঞ্জ তাঁতের লুঙ্গি</span>
                <span className="text-xs font-black mt-0.5">ঐতিহ্যবাহী খাঁটি সুতি ফ্যাশন</span>
              </div>

              {/* Simulated Product Card */}
              <div className="p-3 space-y-2">
                <div className="h-16 bg-stone-200 rounded-lg animate-pulse" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 text-[11px]">৮০ কাউন্ট সিরাজগঞ্জ লুঙ্গি</span>
                  <span style={{ color: design.primaryColor }} className="font-mono font-bold">৳৮৫০</span>
                </div>
                <button
                  type="button"
                  style={{ backgroundColor: design.primaryColor }}
                  className="w-full py-1 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  অর্ডার করুন
                </button>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 text-center">
              সব পরিবর্তন সরাসরি সেভ বাটনে ক্লিক করলেই মূল ওয়েবসাইটে সক্রিয় হবে।
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
