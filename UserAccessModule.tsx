import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { adminFetch } from '../adminApi';
import {
  ShieldCheck,
  UserCheck,
  Plus,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  User,
  Shield,
  Clock,
} from 'lucide-react';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  permissions: string[];
  status: 'active' | 'suspended';
  avatar?: string;
  last_login?: string;
  created_at?: string;
}

const AVAILABLE_PERMISSIONS: { key: string; label: string; group: string }[] = [
  { key: 'products.view', label: 'প্রোডাক্ট দেখা (View Products)', group: 'ক্যাটালগ' },
  { key: 'products.create', label: 'নতুন প্রোডাক্ট তৈরি (Add Product)', group: 'ক্যাটালগ' },
  { key: 'products.edit', label: 'প্রোডাক্ট ও দাম আপডেট (Edit Product)', group: 'ক্যাটালগ' },
  { key: 'products.archive', label: 'প্রোডাক্ট মোছা/আর্কাইভ (Archive)', group: 'ক্যাটালগ' },
  { key: 'inventory.view', label: 'স্টক ইনভেন্টরি পর্যবেক্ষণ (View Stock)', group: 'ইনভেন্টরি' },
  { key: 'inventory.adjust', label: 'স্টক বাড়ানো/কমানো (Stock Adjust)', group: 'ইনভেন্টরি' },
  { key: 'orders.view', label: 'গ্রাহকের অর্ডার দেখা (View Orders)', group: 'অর্ডার' },
  { key: 'orders.edit', label: 'অর্ডার কনফার্ম ও স্ট্যাটাস বদল (Update Orders)', group: 'অর্ডার' },
  { key: 'orders.cancel', label: 'অর্ডার বাতিলকরণ (Cancel Orders)', group: 'অর্ডার' },
  { key: 'customers.view', label: 'গ্রাহক তথ্য ও ফোন দেখা (Customers)', group: 'গ্রাহক' },
  { key: 'payments.manage', label: 'পেমেন্ট ও ট্রানজেকশন কন্ট্রোল', group: 'অর্থ ও পেমেন্ট' },
  { key: 'reports.view', label: 'বিক্রয় ও লাভ-ক্ষতির রিপোর্ট দেখা', group: 'রিপোর্ট' },
  { key: 'settings.manage', label: 'দোকান ও ডেলিভারি সেটিংস বদল', group: 'সেটিংস' },
  { key: 'admins.manage', label: 'ইউজার ও এক্সেস পারমিশন কন্ট্রোল', group: 'নিরাপত্তা' },
];

export const UserAccessModule: React.FC = () => {
  const { showToast } = useShop();

  const [users, setUsers] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('staff');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formStatus, setFormStatus] = useState<'active' | 'suspended'>('active');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'orders.view',
    'orders.edit',
    'products.view',
  ]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/staff');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.staff)) {
        setUsers(data.staff);
      }
    } catch (err) {
      console.warn('Failed to load admin staff users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('staff');
    setFormPassword('');
    setFormStatus('active');
    setSelectedPermissions(['orders.view', 'orders.edit', 'products.view']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: StaffUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormRole(user.role);
    setFormPassword('');
    setFormStatus(user.status || 'active');
    setSelectedPermissions(
      user.permissions.includes('all')
        ? AVAILABLE_PERMISSIONS.map((p) => p.key)
        : user.permissions || []
    );
    setIsModalOpen(true);
  };

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSelectAllPerms = () => {
    setSelectedPermissions(AVAILABLE_PERMISSIONS.map((p) => p.key));
  };

  const handleDeselectAllPerms = () => {
    setSelectedPermissions([]);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast('নাম এবং ইমেইল প্রদান করুন');
      return;
    }

    const perms = formRole === 'super_admin' ? ['all'] : selectedPermissions;

    try {
      if (editingUser) {
        const bodyPayload: any = {
          name: formName,
          phone: formPhone,
          role: formRole,
          permissions: perms,
          status: formStatus,
        };
        if (formPassword.trim()) {
          bodyPayload.password = formPassword.trim();
        }

        const res = await adminFetch(`/api/admin/staff/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('ইউজার পারমিশন সফলভাবে আপডেট হয়েছে');
          setIsModalOpen(false);
          loadUsers();
        } else {
          showToast(data.error || 'আপডেট করতে সমস্যা হয়েছে');
        }
      } else {
        const res = await adminFetch('/api/admin/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            phone: formPhone,
            role: formRole,
            permissions: perms,
            password: formPassword.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(data.message || 'নতুন এডমিন/স্টাফ সফলভাবে তৈরি হয়েছে');
          setIsModalOpen(false);
          loadUsers();
        } else {
          showToast(data.error || 'তৈরি করতে সমস্যা হয়েছে');
        }
      }
    } catch {
      showToast('সার্ভার যোগাযোগে সমস্যা হয়েছে');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === 'admin-1') {
      showToast('মূল সুপার এডমিন (Owner) অ্যাকাউন্ট মুছে ফেলা সম্ভব নয়!');
      return;
    }
    if (!confirm(`আপনি কি নিশ্চিত যে "${name}" অ্যাকাউন্টটি মুছে ফেলতে চান?`)) return;

    try {
      const res = await adminFetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('ইউজার সফলভাবে মুছে ফেলা হয়েছে');
        loadUsers();
      } else {
        showToast(data.error || 'মুছে ফেলতে ব্যর্থ');
      }
    } catch {
      showToast('সার্ভার ত্রুটি');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-extrabold text-stone-900">
              ইউজার এক্সেস ও রোল কন্ট্রোল (User Access & Management)
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            এডমিন টিম মেম্বারদের রোল, পারমিশন, পাসওয়ার্ড রিসেট এবং দায়িত্ব বণ্টন কন্ট্রোল
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs transition-colors cursor-pointer"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ইউজার যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400">মোট টিম সদস্য</div>
            <div className="text-lg font-black text-stone-900">{users.length} জন</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400">সক্রিয় ইউজার</div>
            <div className="text-lg font-black text-stone-900">
              {users.filter((u) => u.status === 'active').length} জন
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400">সুপার এডমিন</div>
            <div className="text-lg font-black text-stone-900">
              {users.filter((u) => u.role === 'super_admin').length} জন
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400">নিরাপত্তা স্ট্যাটাস</div>
            <div className="text-sm font-black text-emerald-600">সুরক্ষিত (RBAC Active)</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-stone-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ইউজারের নাম, ইমেইল বা ফোন খুঁজুন..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
              <tr>
                <th className="p-3.5">ইউজার নাম ও বিবরণ</th>
                <th className="p-3.5">যোগাযোগ</th>
                <th className="p-3.5">রোল (Role)</th>
                <th className="p-3.5">অনুমোদিত পারমিশন</th>
                <th className="p-3.5 text-center">স্ট্যাটাস</th>
                <th className="p-3.5">সর্বশেষ লগইন</th>
                <th className="p-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">
                    কোনো ইউজার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isOwner = u.id === 'admin-1';
                  return (
                    <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                            {u.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div>{u.name}</div>
                            {isOwner && (
                              <span className="text-[10px] text-amber-600 font-bold">মূল সুপার এডমিন (Owner)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-stone-700">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            u.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'manager'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {u.role === 'super_admin'
                            ? 'সুপার এডমিন'
                            : u.role === 'manager'
                            ? 'স্টোর ম্যানেজার'
                            : 'অর্ডার স্টাফ'}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        {u.permissions?.includes('all') ? (
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            সম্পূর্ণ সিস্টেম অ্যাক্সেস (All Permissions)
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {u.permissions?.slice(0, 3).map((p) => (
                              <span
                                key={p}
                                className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded"
                              >
                                {p}
                              </span>
                            ))}
                            {(u.permissions?.length || 0) > 3 && (
                              <span className="text-[10px] text-stone-400 font-bold">
                                +{(u.permissions?.length || 0) - 3} আরও
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.status === 'active' ? 'সক্রিয়' : 'ব্লক'}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-500 text-[11px]">
                        {u.last_login || 'সদ্য তৈরি'}
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-amber-600 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="পারমিশন ও রোল সম্পাদনা"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!isOwner && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-stone-100 transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden animate-in fade-in max-h-[92vh] flex flex-col">
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm">
                  {editingUser ? `ইউজার তথ্য ও পারমিশন সম্পাদনা: ${editingUser.name}` : 'নতুন টিম মেম্বার যোগ করুন'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="যেমন: তানভীর রহমান"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">ইমেইল ঠিকানা *</label>
                  <input
                    type="email"
                    required
                    disabled={Boolean(editingUser)}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="staff@bastrashoily.com"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white disabled:bg-stone-100 disabled:text-stone-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">মোবাইল নম্বর (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">রোল (Role) *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  >
                    <option value="super_admin">সুপার এডমিন (Super Admin - সর্বময় ক্ষমতা)</option>
                    <option value="manager">ম্যানেজার (Store Manager - অর্ডার ও পণ্য)</option>
                    <option value="staff">অর্ডার স্টাফ (Order Processing)</option>
                    <option value="inventory">ইনভেন্টরি কর্মী (Stock Control)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {editingUser ? 'পাসওয়ার্ড পরিবর্তন (ফাঁকা রাখলে অপরিবর্তিত থাকবে)' : 'পাসওয়ার্ড (ফাঁকা রাখলে ওয়ান-টাইম পাসওয়ার্ড তৈরি হবে)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড লিখুন..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-3.5 pr-10 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {editingUser && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">অ্যাকাউন্ট স্ট্যাটাস</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  >
                    <option value="active">সক্রিয় (Active)</option>
                    <option value="suspended">ব্লক / সাসপেন্ডেড (Suspended)</option>
                  </select>
                </div>
              )}

              {/* Permissions Checklist */}
              {formRole !== 'super_admin' && (
                <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800">মডিউল পারমিশন নির্বাচন:</span>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={handleSelectAllPerms}
                        className="text-[11px] text-amber-600 hover:underline font-bold cursor-pointer"
                      >
                        সব নির্বাচন
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllPerms}
                        className="text-[11px] text-stone-500 hover:underline cursor-pointer"
                      >
                        সব মুছুন
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <label
                        key={perm.key}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white border border-stone-200 hover:border-amber-400 cursor-pointer text-[11px]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.key)}
                          onChange={() => togglePermission(perm.key)}
                          className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span className="text-stone-800 font-medium">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
