import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Logo } from './Logo';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Store,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  X,
  ShieldCheck,
  CheckCircle2,
  Users,
  Handshake,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    footerConfig,
    navigateToHome,
    navigateToCmsGuide,
    navigateToClothingGuide,
    navigateToTracking,
  } = useShop();

  const [activeModal, setActiveModal] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const [isOutletModalOpen, setIsOutletModalOpen] = useState(false);

  // Social URLs
  const facebookUrl = footerConfig.facebookUrl || 'https://facebook.com/bastrashoily';
  const instagramUrl = footerConfig.instagramUrl || 'https://instagram.com/bastrashoily';
  const youtubeUrl = footerConfig.youtubeUrl || 'https://youtube.com/@bastrashoily';
  const tiktokUrl = 'https://tiktok.com/@bastrashoily';

  const email = 'bastrashoily@gmail.com';
  const phone = '+8801864-528488';
  const address = 'Dariyapur, Shahjadpur, Sirajganj, Bangladesh';

  const handleOpenPolicy = (title: string, content: string) => {
    setActiveModal({ title, content });
  };

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      {/* 1. TOP ROW: SOCIAL MEDIA ICON BUTTONS (Facebook, Instagram, TikTok, YouTube) */}
      <div className="border-b border-stone-900 bg-stone-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>সোশ্যাল মিডিয়ায় যুক্ত থাকুন (Connect With Us)</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Facebook */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-stone-900 hover:bg-[#1877F2] text-stone-300 hover:text-white flex items-center justify-center border border-stone-800 hover:border-[#1877F2] transition-all shadow-md group cursor-pointer"
              title="Facebook"
              aria-label="Facebook"
            >
              <Facebook className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            </a>

            {/* Instagram */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-stone-900 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] text-stone-300 hover:text-white flex items-center justify-center border border-stone-800 hover:border-transparent transition-all shadow-md group cursor-pointer"
              title="Instagram"
              aria-label="Instagram"
            >
              <Instagram className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            </a>

            {/* TikTok */}
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-stone-900 hover:bg-black text-stone-300 hover:text-[#00f2fe] flex items-center justify-center border border-stone-800 hover:border-[#00f2fe] transition-all shadow-md group cursor-pointer"
              title="TikTok"
              aria-label="TikTok"
            >
              {/* TikTok Custom SVG */}
              <svg className="w-4.5 h-4.5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.87-4.47V8.71a8.19 8.19 0 0 0 4.9 1.63v-3.45a4.85 4.85 0 0 1-1-.2z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-stone-900 hover:bg-[#FF0000] text-stone-300 hover:text-white flex items-center justify-center border border-stone-800 hover:border-[#FF0000] transition-all shadow-md group cursor-pointer"
              title="YouTube"
              aria-label="YouTube"
            >
              <Youtube className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Contact Info Block */}
          <div className="lg:col-span-2 space-y-4">
            <div className="scale-95 origin-left">
              <Logo variant="light" />
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-md">
              {footerConfig.aboutUs ||
                'বাস্ত্র শৈলি (BASTRA SHOILY) সিরাজগঞ্জ ও পাবনার ঐতিহ্যবাহী তাঁতের খাঁটি লুঙ্গি, প্রিমিয়াম উৎসব পাঞ্জাবি এবং ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ির সবচেয়ে বিশ্বস্ত অনলাইন প্ল্যাটফর্ম।'}
            </p>

            {/* Contact Info Block */}
            <div className="pt-2 space-y-2.5 text-xs text-stone-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">ঠিকানা (Address):</span>
                  <span className="text-stone-400">{address}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-white">হটলাইন (Phone): </span>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-amber-400 hover:underline font-bold">
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-white">ইমেইল (Email): </span>
                  <a href={`mailto:${email}`} className="text-amber-400 hover:underline">
                    {email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Services & Help */}
          <div className="space-y-3.5">
            <h4 className="text-white font-extrabold text-sm tracking-wide border-l-2 border-amber-500 pl-2.5">
              Services & Help (সেবা ও সহায়তা)
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() =>
                    handleOpenPolicy(
                      'Refund and Returns Policy (রিটার্ন ও রিফান্ড পলিসি)',
                      footerConfig.returnPolicy ||
                        'পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে যেকোনো ত্রুটি বা সাইজ পরিবর্তনের জন্য আমাদের সহজ রিটার্ন ও এক্সচেঞ্জ পলিসি প্রযোজ্য। ডেলিভারিম্যানের সামনে চেক করে নেওয়ার পূর্ণ সুযোগ রয়েছে।'
                    )
                  }
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-stone-400 hover:text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                  <span>Refund and Returns Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    handleOpenPolicy(
                      'Terms & Conditions (শর্তাবলী)',
                      footerConfig.termsAndConditions ||
                        'বাস্ত্র শৈলী থেকে অর্ডারকৃত প্রতিটি পণ্য ১০০% অরিজিনাল ও গুণমান নিশ্চিত করে সরবরাহ করা হয়। অর্ডার কনফার্মেশনের ২৪ ঘণ্টার মধ্যে ডেলিভারি প্রক্রিয়া শুরু হয়।'
                    )
                  }
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-stone-400 hover:text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                  <span>Terms & Conditions</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    handleOpenPolicy(
                      'Privacy Policy (গোপনীয়তা নীতি)',
                      footerConfig.privacyPolicy ||
                        'গ্রাহকের ব্যক্তিগত তথ্য যেমন নাম, ফোন নম্বর এবং ঠিকানা সম্পূর্ণ গোপন ও সুরক্ষিত থাকে। কোনো তৃতীয় পক্ষের নিকট তথ্য হস্তান্তর করা হয় না।'
                    )
                  }
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-stone-400 hover:text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    handleOpenPolicy(
                      'About Us (আমাদের সম্পর্কে)',
                      'বাস্ত্র শৈলী সিরাজগঞ্জ জেলার শাহজাদপুর অঞ্চলের ঐতিহ্যবাহী তাঁত শিল্পীদের নিপুণ হাতের ছোঁয়ায় তৈরি খাঁটি সুতি লুঙ্গি, জামদানি শাড়ি ও পাঞ্জাবির একটি নির্ভরযোগ্য ব্র্যান্ড। আমরা সরাসরি তাঁতীদের থেকে সেরা কাপড়ে ক্রেতাদের সন্তুষ্টি নিশ্চিত করি।'
                    )
                  }
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-stone-400 hover:text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    handleOpenPolicy(
                      'Contact Us (যোগাযোগ)',
                      `যেকোনো প্রশ্ন, অর্ডার অনুসন্ধান বা পরামর্শের জন্য আমাদের সাথে যোগাযোগ করুন:\n\nহটলাইন: ${phone}\nইমেইল: ${email}\nঠিকানা: ${address}\n\nসকাল ৯:০০টা থেকে রাত ১১:০০টা পর্যন্ত আমাদের কাস্টমার কেয়ার প্রতিনিধি সক্রিয় থাকেন।`
                    )
                  }
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-stone-400 hover:text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                  <span>Contact us</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Join Us */}
          <div className="space-y-3.5">
            <h4 className="text-white font-extrabold text-sm tracking-wide border-l-2 border-emerald-500 pl-2.5">
              Join Us (আমাদের সাথে যুক্ত হোন)
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() =>
                    handleOpenPolicy(
                      'Become Our Local Partner (লোকাল পার্টনার হোন)',
                      'আপনি কি আপনার এলাকায় বাস্ত্র শৈলীর এক্সক্লুসিভ লুঙ্গি, পাঞ্জাবি ও জামদানি শাড়ির ডিলারশিপ বা লোকাল পার্টনার হতে চান? আকর্ষণীয় কমিশন ও পাইকারি মূল্যে অংশীদার হতে যোগাযোগ করুন: +8801864-528488 অথবা bastrashoily@gmail.com'
                    )
                  }
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-stone-400 hover:text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500/70 shrink-0" />
                  <span>Become Our Local Partner</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    handleOpenPolicy(
                      'Supplier / Vendor Registration (তাঁত ও সাপ্লায়ার নিবন্ধন)',
                      'শাহজাদপুর, সিরাজগঞ্জ, বেলকুচি ও পাবনার তাঁত কারিগর ও সুতা সরবরাহকারীরা বাস্ত্র শৈলীতে ভেন্ডর হিসেবে যুক্ত হতে পারেন। সরাসরি আমাদের অফিসে বা ফোনে যোগাযোগ করুন: +8801864-528488।'
                    )
                  }
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-stone-400 hover:text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500/70 shrink-0" />
                  <span>Supplier/Vendor Registration</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    handleOpenPolicy(
                      'Customer Feedback (গ্রাহক মতামত ও পরামর্শ)',
                      'বাস্ত্র শৈলীর পণ্যের গুণমান ও সেবার মান নিয়ে আপনার মূল্যবান মতামত আমাদের জন্য অত্যন্ত গুরুত্বপূর্ণ। অনুগ্রহ করে আপনার পরামর্শ bastrashoily@gmail.com ঠিকানায় পাঠান।'
                    )
                  }
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-stone-400 hover:text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500/70 shrink-0" />
                  <span>Customer Feedback</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    handleOpenPolicy(
                      'Careers (ক্যারিয়ার / নিয়োগ)',
                      'বাস্ত্র শৈলীতে কাজের সুযোগ! আমরা উদ্যমী ও পরিশ্রমী তরুণ-তরুণীদের আমাদের মার্কেটিং, কাস্টমার সার্ভিস ও লজিস্টিকস টিমে স্বাগত জানাই। আপনার সিভি পাঠান: bastrashoily@gmail.com'
                    )
                  }
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer text-stone-400 hover:text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500/70 shrink-0" />
                  <span>Careers</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM BAR (Outlet Button, Copyright Text, Page Link) */}
      <div className="border-t border-stone-800 bg-black/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Outlet Button */}
          <button
            onClick={() => setIsOutletModalOpen(true)}
            className="px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>BASTRASHOILY SHOPPING OUTLETS</span>
          </button>

          {/* Copyright Text */}
          <div className="text-xs text-stone-400 text-center">
            © {new Date().getFullYear()} <span className="text-white font-bold">BASTRASHOILY</span>. All Rights Reserved.
          </div>

          {/* Page Link */}
          <div>
            <a
              href="https://www.bastrashoily.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold hover:underline flex items-center gap-1"
            >
              <span>www.bastrashoily.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Policy / Info Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 text-stone-200 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full bg-stone-800 hover:bg-stone-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-black text-amber-400 mb-3 pr-8">{activeModal.title}</h3>
            <div className="text-xs text-stone-300 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
              {activeModal.content}
            </div>
            <div className="mt-5 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Outlets Modal */}
      {isOutletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 text-stone-200 shadow-2xl relative">
            <button
              onClick={() => setIsOutletModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full bg-stone-800 hover:bg-stone-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-amber-500 font-extrabold text-sm mb-1">
              <Store className="w-5 h-5" />
              <span>BASTRASHOILY SHOPPING OUTLETS</span>
            </div>
            <p className="text-xs text-stone-400 mb-4">আমাদের প্রধান শোরুম ও আউটলেটের তথ্য</p>

            <div className="space-y-3 text-xs bg-stone-950 p-4 rounded-2xl border border-stone-800">
              <div>
                <span className="font-bold text-amber-400 block">শাহজাদপুর ফ্ল্যাগশিপ আউটলেট:</span>
                <span className="text-stone-300">দ্বারিয়াপুর বাজার মোড়, শাহজাদপুর, সিরাজগঞ্জ - ৬৭৭০</span>
              </div>
              <div>
                <span className="font-bold text-amber-400 block">খোলা থাকার সময়:</span>
                <span className="text-stone-300">সকাল ৯:০০টা থেকে রাত ১০:০০টা (প্রতিদিন)</span>
              </div>
              <div>
                <span className="font-bold text-amber-400 block">আউটলেট হটলাইন:</span>
                <span className="text-stone-300">+8801864-528488</span>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setIsOutletModalOpen(false)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
