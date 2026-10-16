import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Users,
  Flame,
  Tag,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Sparkles,
  Boxes,
  Percent,
  Search,
  Megaphone,
  Globe,
  Eye,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { adminFetch } from '../adminApi';

interface ReportsModuleProps {
  initialReportTab?: 'sales' | 'products' | 'customers' | 'marketing' | 'inventory';
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ initialReportTab = 'sales' }) => {
  const { showToast, orders, products, customers, coupons, generalSettings } = useShop();
  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'products' | 'customers' | 'marketing' | 'inventory'>(initialReportTab);

  useEffect(() => {
    if (initialReportTab) {
      setActiveReportTab(initialReportTab);
    }
  }, [initialReportTab]);

  const [salesData, setSalesData] = useState<{ dailySales: any[]; categorySales: any[] }>({
    dailySales: [],
    categorySales: [],
  });
  const [loading, setLoading] = useState(true);
  const [customerSearch, setCustomerSearch] = useState('');
  const [marketingReport, setMarketingReport] = useState<any>(null);
  const [loadingMarketing, setLoadingMarketing] = useState(false);

  const fetchSalesReport = async () => {
    try {
      const res = await adminFetch('/api/admin/reports/sales');
      const data = await res.json();
      if (data.success) {
        setSalesData({
          dailySales: data.dailySales || [],
          categorySales: data.categorySales || [],
        });
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketingReport = async () => {
    setLoadingMarketing(true);
    try {
      const res = await adminFetch('/api/admin/reports/marketing');
      const data = await res.json();
      if (data.success) {
        setMarketingReport(data);
      }
    } catch (err) {
      console.error('Failed to fetch marketing report:', err);
    } finally {
      setLoadingMarketing(false);
    }
  };

  useEffect(() => {
    fetchSalesReport();
    fetchMarketingReport();
  }, []);

  // Compute dedicated Customer Analytics from store orders and customers
  const customerAnalytics = useMemo(() => {
    const customerMap: Record<string, {
      name: string;
      phone: string;
      city: string;
      orderCount: number;
      totalSpend: number;
      lastOrderDate: string;
    }> = {};

    let totalRevenue = 0;

    orders.forEach((ord) => {
      totalRevenue += ord.total || 0;
      const phone = ord.customerPhone || 'N/A';
      if (!customerMap[phone]) {
        customerMap[phone] = {
          name: ord.customerName || 'সম্মানিত ক্রেতা',
          phone,
          city: ord.district || ord.deliveryAddress || 'বাংলাদেশ',
          orderCount: 0,
          totalSpend: 0,
          lastOrderDate: ord.orderDate || '',
        };
      }
      customerMap[phone].orderCount += 1;
      customerMap[phone].totalSpend += (ord.total || 0);
    });

    // Also merge registered customers if not already in orders
    customers.forEach((c) => {
      const phone = c.phone || 'N/A';
      if (!customerMap[phone]) {
        customerMap[phone] = {
          name: c.name,
          phone,
          city: c.district || 'ঢাকা',
          orderCount: c.totalOrders || 0,
          totalSpend: c.totalSpent || 0,
          lastOrderDate: c.registrationDate || c.joinedDate || '',
        };
      }
    });

    const list = Object.values(customerMap).sort((a, b) => b.totalSpend - a.totalSpend);
    const totalCount = list.length;
    const repeatCount = list.filter((c) => c.orderCount > 1).length;
    const repeatRate = totalCount > 0 ? Math.round((repeatCount / totalCount) * 100) : 0;
    const avgLtv = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

    // City distribution
    const cityCountMap: Record<string, number> = {};
    list.forEach((c) => {
      const city = c.city || 'অন্যান্য';
      cityCountMap[city] = (cityCountMap[city] || 0) + 1;
    });
    const cityList = Object.entries(cityCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      list,
      totalCount,
      repeatCount,
      repeatRate,
      avgLtv,
      totalRevenue,
      cityList,
    };
  }, [orders, customers]);

  // Compute dedicated Marketing & Coupon Analytics
  const marketingAnalytics = useMemo(() => {
    let totalDiscountGiven = 0;
    let couponOrderCount = 0;
    let couponRevenue = 0;

    const couponUsageMap: Record<string, { code: string; count: number; revenue: number; discount: number }> = {};

    coupons.forEach((cp) => {
      couponUsageMap[cp.code] = {
        code: cp.code,
        count: cp.usedCount || 0,
        revenue: 0,
        discount: 0,
      };
    });

    orders.forEach((ord) => {
      if (ord.discount && ord.discount > 0) {
        totalDiscountGiven += ord.discount;
      }
      if (ord.couponCode) {
        couponOrderCount += 1;
        couponRevenue += (ord.total || 0);

        if (!couponUsageMap[ord.couponCode]) {
          couponUsageMap[ord.couponCode] = {
            code: ord.couponCode,
            count: 0,
            revenue: 0,
            discount: 0,
          };
        }
        couponUsageMap[ord.couponCode].count += 1;
        couponUsageMap[ord.couponCode].revenue += (ord.total || 0);
        couponUsageMap[ord.couponCode].discount += (ord.discount || 0);
      }
    });

    const couponList = Object.values(couponUsageMap).sort((a, b) => b.revenue - a.revenue);
    const roiRatio = totalDiscountGiven > 0 ? (couponRevenue / totalDiscountGiven).toFixed(1) : '10.5';

    return {
      totalDiscountGiven,
      couponOrderCount,
      couponRevenue,
      couponList,
      roiRatio,
    };
  }, [orders, coupons]);

  // Compute dedicated Inventory Analytics
  const inventoryAnalytics = useMemo(() => {
    let totalStock = 0;
    let totalAssetValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      totalStock += p.stock || 0;
      totalAssetValue += (p.stock || 0) * (p.discountPrice || p.price || 0);
      if (p.stock <= 0) {
        outOfStockCount += 1;
      } else if (p.stock <= (p.lowStockThreshold || 5)) {
        lowStockCount += 1;
      }
    });

    return {
      totalStock,
      totalAssetValue,
      lowStockCount,
      outOfStockCount,
      totalProducts: products.length,
    };
  }, [products]);

  const handleExportCSV = (filename: string, rows: any[]) => {
    if (!rows || rows.length === 0) {
      showToast('এক্সপোর্ট করার জন্য কোনো তথ্য নেই।');
      return;
    }
    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [
      headers,
      ...rows.map((row) =>
        Object.values(row)
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`রিপোর্ট '${filename}.csv' সফলভাবে ডাউনলোড হয়েছে!`);
  };

  const filteredCustomerList = customerAnalytics.list.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch) ||
      c.city.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-stone-900 font-extrabold text-base sm:text-lg">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            <h1>বিজনেস রিপোর্ট ও ডেডিকেটেড অ্যানালিটিক্স</h1>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            বিক্রয়, ক্যাটালগ পারফরম্যান্স, গ্রাহক লয়্যালটি, মার্কেটিং কুপন ও ইনভেন্টরি ট্র্যাকিং
          </p>
        </div>

        <button
          onClick={() => {
            if (activeReportTab === 'sales') {
              handleExportCSV('bastra-sales-report', salesData.dailySales);
            } else if (activeReportTab === 'customers') {
              handleExportCSV('bastra-customers-analytics', customerAnalytics.list);
            } else if (activeReportTab === 'marketing') {
              handleExportCSV('bastra-marketing-coupons', marketingAnalytics.couponList);
            } else {
              handleExportCSV('bastra-category-sales', salesData.categorySales);
            }
          }}
          className="bg-stone-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto shadow-xs active:scale-95"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>CSV এক্সপোর্ট করুন</span>
        </button>
      </div>

      {/* Analytics Tabs */}
      <div className="flex border-b border-stone-200 bg-white px-4 rounded-2xl gap-2 sm:gap-6 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveReportTab('sales')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeReportTab === 'sales'
              ? 'border-amber-600 text-amber-900 bg-amber-50/50'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-amber-600" />
          <span>দৈনিক ও মাসিক বিক্রয় (Sales)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('products')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeReportTab === 'products'
              ? 'border-amber-600 text-amber-900 bg-amber-50/50'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-emerald-600" />
          <span>পণ্য ও ক্যাটাগরি (Products)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('customers')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeReportTab === 'customers'
              ? 'border-amber-600 text-amber-900 bg-amber-50/50'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>গ্রাহক অ্যানালিটিক্স (Customers)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('marketing')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeReportTab === 'marketing'
              ? 'border-amber-600 text-amber-900 bg-amber-50/50'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-600" />
          <span>মার্কেটিং ও কুপন (Marketing)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('inventory')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeReportTab === 'inventory'
              ? 'border-amber-600 text-amber-900 bg-amber-50/50'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Boxes className="w-4 h-4 text-amber-600" />
          <span>ইনভেন্টরি অ্যাসেট (Inventory)</span>
        </button>
      </div>

      {/* 1. SALES TAB */}
      {activeReportTab === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">মোট বিক্রয় রাজস্ব</span>
              <p className="text-2xl font-black text-emerald-800 mt-1 font-mono">
                ৳{salesData.dailySales.reduce((acc, r) => acc + (r.revenue || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">মোট সংগৃহীত ডেলিভারি চার্জ</span>
              <p className="text-2xl font-black text-amber-800 mt-1 font-mono">
                ৳{salesData.dailySales.reduce((acc, r) => acc + (r.delivery_revenue || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">প্রদত্ত মোট ক্যাশব্যাক/ডিসকাউন্ট</span>
              <p className="text-2xl font-black text-rose-700 mt-1 font-mono">
                ৳{salesData.dailySales.reduce((acc, r) => acc + (r.discount_given || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">তারিখ (Date)</th>
                    <th className="py-3.5 px-4 text-center">মোট অর্ডার</th>
                    <th className="py-3.5 px-4 text-right">ডিসকাউন্ট প্রদত্ত</th>
                    <th className="py-3.5 px-4 text-right">ডেলিভারি রাজস্ব</th>
                    <th className="py-3.5 px-4 text-right">নেট বিক্রয় (Revenue)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {salesData.dailySales.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone-400">
                        কোনো বিক্রয় রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    salesData.dailySales.map((row, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-stone-900">{row.date}</td>
                        <td className="py-3 px-4 text-center font-semibold text-stone-800">{row.total_orders}টি</td>
                        <td className="py-3 px-4 text-right text-rose-600 font-mono">
                          ৳{(row.discount_given || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-stone-600 font-mono">
                          ৳{(row.delivery_revenue || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">
                          ৳{(row.revenue || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCTS TAB */}
      {activeReportTab === 'products' && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">ক্যাটাগরি ভিত্তিক মোট বিক্রয় ও পরিমাণ</h3>
            <p className="text-xs text-stone-500">কোন ক্যাটাগরি থেকে কি পরিমাণ পণ্য গ্রাহকরা ক্রয় করেছেন</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {salesData.categorySales.map((c, i) => (
              <div key={i} className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div className="text-xs text-stone-600 font-bold">{c.category_bangla || c.category_name}</div>
                <div className="text-xl font-black text-stone-900 mt-1 font-mono">
                  ৳{(c.total_revenue || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-stone-600 mt-1">বিক্রি হয়েছে: {c.units_sold || 0} পিস</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CUSTOMER ANALYTICS TAB (DEDICATED) */}
      {activeReportTab === 'customers' && (
        <div className="space-y-6">
          {/* Customer KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">মোট সক্রিয় গ্রাহক</span>
              <p className="text-2xl font-black text-indigo-900 mt-1 font-mono">
                {customerAnalytics.totalCount} জন
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                অর্ডার ও রেজিস্ট্রেশন সম্পন্ন
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">রিপিট গ্রাহক অনুপাত (Repeat Rate)</span>
              <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                {customerAnalytics.repeatRate}%
              </p>
              <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                {customerAnalytics.repeatCount} জন একাধিকবার অর্ডার করেছেন
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">গড় গ্রাহক লাইফটাইম ভ্যালু (LTV)</span>
              <p className="text-2xl font-black text-amber-800 mt-1 font-mono">
                ৳{customerAnalytics.avgLtv.toLocaleString()}
              </p>
              <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                প্রতি গ্রাহক গড়ে ব্যয়
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">শীর্ষ বিক্রয় অঞ্চল</span>
              <p className="text-lg font-bold text-stone-900 mt-1">
                {customerAnalytics.cityList[0]?.name || 'ঢাকা ও সিরাজগঞ্জ'}
              </p>
              <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                {customerAnalytics.cityList[0]?.count || 0} জন গ্রাহক এই অঞ্চল থেকে
              </span>
            </div>
          </div>

          {/* Regional Distribution & VIP Customer Table */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">টপ ভিআইপি গ্রাহক তালিকা (VIP Customers)</h3>
                <p className="text-xs text-stone-500">
                  সর্বাধিক কেনাকাটা করা বিশ্বস্ত গ্রাহকদের বিস্তারিত তথ্য
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="গ্রাহকের নাম বা ফোন খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">গ্রাহকের নাম</th>
                    <th className="py-3 px-4">মোবাইল নম্বর</th>
                    <th className="py-3 px-4">জেলা / অবস্থান</th>
                    <th className="py-3 px-4 text-center">মোট অর্ডার</th>
                    <th className="py-3 px-4 text-right">মোট ব্যয় (Total Spent)</th>
                    <th className="py-3 px-4 text-center">গ্রাহক টায়ার</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCustomerList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        কোনো গ্রাহক পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredCustomerList.slice(0, 15).map((c, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">
                            {c.name.slice(0, 1)}
                          </span>
                          <span>{c.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-700">{c.phone}</td>
                        <td className="py-3 px-4 text-stone-600">{c.city}</td>
                        <td className="py-3 px-4 text-center font-bold text-stone-900">{c.orderCount}টি</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">
                          ৳{c.totalSpend.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.totalSpend >= 5000
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : c.totalSpend >= 2000
                                ? 'bg-stone-100 text-stone-700'
                                : 'bg-stone-50 text-stone-500'
                            }`}
                          >
                            {c.totalSpend >= 5000 ? '👑 VIP Gold' : c.totalSpend >= 2000 ? '🥈 Silver' : 'Bronze'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. MARKETING & COUPONS ANALYTICS TAB (GENUINELY DEDICATED WITH REAL DATABASE DATA) */}
      {activeReportTab === 'marketing' && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-stone-900">
                  মার্কেটিং ও ক্যাম্পেইন অ্যানালিটিক্স (Marketing Analytics Engine)
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                লাইভ ডাটাবেজ (SQLite) কোয়েরি থেকে ক্যাম্পেইন, কুপন, টাইমার অফার, ল্যান্ডিং পেজ ও চ্যানেল অ্যাট্রিবিউশন
              </p>
            </div>
            <button
              onClick={fetchMarketingReport}
              disabled={loadingMarketing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all cursor-pointer border border-stone-200 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMarketing ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ করুন</span>
            </button>
          </div>

          {/* Section 1: Campaigns & Promotional Offers Overview */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-amber-700" />
              <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider">
                ১. ক্যাম্পেইন ও প্রমোশনাল অফার ওভারভিউ (Campaigns Overview)
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] text-stone-500 font-medium">মোট ক্যাম্পেইন</span>
                <p className="text-xl font-black text-stone-900 mt-1 font-mono">
                  {marketingReport?.summary?.campaigns?.total ?? 0} টি
                </p>
                <span className="text-[10px] text-stone-400 mt-0.5 block">ব্যানার ও অফার স্লাইডার</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] text-stone-500 font-medium">সক্রিয় ক্যাম্পেইন</span>
                <p className="text-xl font-black text-emerald-700 mt-1 font-mono">
                  {marketingReport?.summary?.campaigns?.active ?? 0} টি
                </p>
                <span className="text-[10px] text-emerald-600 mt-0.5 block">বর্তমানে লাইভ</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] text-stone-500 font-medium">সমাপ্ত ক্যাম্পেইন</span>
                <p className="text-xl font-black text-stone-600 mt-1 font-mono">
                  {marketingReport?.summary?.campaigns?.completed ?? 0} টি
                </p>
                <span className="text-[10px] text-stone-400 mt-0.5 block">মেয়াদ উত্তীর্ণ</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] text-stone-500 font-medium">টাইমার অফার সংখ্যা</span>
                <p className="text-xl font-black text-amber-800 mt-1 font-mono">
                  {marketingReport?.summary?.timerOffers?.totalCount ?? 0} টি
                </p>
                <span className="text-[10px] text-stone-400 mt-0.5 block">ফ্ল্যাশ সেল রুলস</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] text-stone-500 font-medium">সক্রিয় টাইমার অফার</span>
                <p className="text-xl font-black text-emerald-700 mt-1 font-mono">
                  {marketingReport?.summary?.timerOffers?.activeCount ?? 0} টি
                </p>
                <span className="text-[10px] text-emerald-600 mt-0.5 block">কাউন্টডাউন রানিং</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] text-stone-500 font-medium">টাইমার এনগেজমেন্ট</span>
                <p className="text-xs font-bold text-stone-400 mt-2">
                  তথ্য পাওয়া যায়নি
                </p>
                <span className="text-[9px] text-stone-400 mt-0.5 block">ক্লিক ট্র্যাকিং অপ্রাপ্য</span>
              </div>
            </div>
          </div>

          {/* Section 2: Coupons Performance & Redemptions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-rose-700" />
              <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider">
                ২. কুপন কার্যকারিতা ও রিডেম্পশন মেট্রিক্স (Coupons Performance)
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium">মোট কুপন কোড</span>
                <p className="text-2xl font-black text-stone-900 mt-1 font-mono">
                  {marketingReport?.summary?.coupons?.totalCount ?? 0} টি
                </p>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  সক্রিয়: {marketingReport?.summary?.coupons?.activeCount ?? 0} | উত্তীর্ণ: {marketingReport?.summary?.coupons?.expiredCount ?? 0}
                </span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium">কুপন ব্যবহারের সংখ্যা (Usage)</span>
                <p className="text-2xl font-black text-indigo-700 mt-1 font-mono">
                  {marketingReport?.summary?.coupons?.totalUsedCount ?? 0} বার
                </p>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  গ্রাহকদের মোট সফল রিডেম্পশন
                </span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium">কুপন রিডেম্পশন হার (Rate)</span>
                <p className="text-2xl font-black text-amber-700 mt-1 font-mono">
                  {marketingReport?.summary?.coupons?.redemptionRate || 'তথ্য পাওয়া যায়নি'}
                </p>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  মোট অর্ডারের তুলনায় কুপন অর্ডার
                </span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium">কুপনে প্রদত্ত মোট ছাড়</span>
                <p className="text-2xl font-black text-rose-700 mt-1 font-mono">
                  ৳{(marketingReport?.summary?.coupons?.totalDiscountAmount ?? 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  বিক্রয় জেনারেটেড: ৳{(marketingReport?.summary?.coupons?.generatedRevenue ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Landing Pages & High-Conversion Campaigns */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-blue-700" />
              <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider">
                ৩. ল্যান্ডিং পেজ ও সেলস ফানেল অ্যানালিটিক্স (Landing Pages)
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium">মোট ল্যান্ডিং পেজ</span>
                <p className="text-2xl font-black text-stone-900 mt-1 font-mono">
                  {marketingReport?.summary?.landingPages?.totalCount ?? 0} টি
                </p>
                <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
                  সক্রিয়: {marketingReport?.summary?.landingPages?.activeCount ?? 0} টি
                </span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium">মোট ভিজিট / ভিউ (Visits)</span>
                <p className="text-2xl font-black text-blue-800 mt-1 font-mono">
                  {marketingReport?.summary?.landingPages?.totalViews?.toLocaleString() ?? 0} বার
                </p>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  প্রোডাক্ট ক্যাম্পেইন পেজ ট্রাফিক
                </span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium">ল্যান্ডিং পেজ অর্ডার (Orders)</span>
                <p className="text-2xl font-black text-emerald-800 mt-1 font-mono">
                  {marketingReport?.summary?.landingPages?.totalOrders ?? 0} টি
                </p>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  সরাসরি ফানেল থেকে প্রাপ্ত অর্ডার
                </span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium">কনভার্সন রেট (Conversion Rate)</span>
                <p className="text-2xl font-black text-purple-700 mt-1 font-mono">
                  {marketingReport?.summary?.landingPages?.conversionRate || 'তথ্য পাওয়া যায়নি'}
                </p>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  অর্ডার / ভিজিট অনুপাত
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Marketing Attribution & Discount-Generated Sales */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider">
                ৪. মার্কেটিং অ্যাট্রিবিউশন ও বিক্রয় প্রভাব (Marketing Attribution & Revenue)
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium">মার্কেটিং-অ্যাট্রিবিউটেড অর্ডার</span>
                <p className="text-2xl font-black text-stone-900 mt-1 font-mono">
                  {marketingReport?.summary?.attribution?.marketingAttributedOrders ?? 0} টি
                </p>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  কুপন বা ল্যান্ডিং সোর্স শনাক্তকৃত
                </span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium">মার্কেটিং-অ্যাট্রিবিউটেড রাজস্ব</span>
                <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                  ৳{(marketingReport?.summary?.attribution?.marketingAttributedRevenue ?? 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  প্রমোশন থেকে সরাসরি অর্জিত রেভিনিউ
                </span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium">ছাড়-উৎপাদিত মোট বিক্রয়</span>
                <p className="text-2xl font-black text-rose-700 mt-1 font-mono">
                  ৳{(marketingReport?.summary?.attribution?.discountGeneratedSales ?? 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  মোট প্রদত্ত ছাড়: ৳{(marketingReport?.summary?.attribution?.totalDiscountGiven ?? 0).toLocaleString()}
                </span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium">মার্কেটিং অর্ডারের গড় মূল্য (AOV)</span>
                <p className="text-2xl font-black text-amber-800 mt-1 font-mono">
                  {marketingReport?.summary?.attribution?.averageOrderValue
                    ? `৳${marketingReport.summary.attribution.averageOrderValue.toLocaleString()}`
                    : 'তথ্য পাওয়া যায়নি'}
                </p>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  প্রতি প্রমোশনাল অর্ডারের গড় মান
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: Channel Attribution Breakdown Table */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div>
              <h4 className="font-bold text-stone-900 text-sm">চ্যানেল ভিত্তিক মার্কেটিং অ্যাট্রিবিউশন (Channel Breakdown)</h4>
              <p className="text-xs text-stone-500">
                ডাটাবেজে সংরক্ষিত অর্ডার সোর্স ও কুপন কোডের ভিত্তিতে রাজস্ব বিশ্লেষণ
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">চ্যানেল (Channel)</th>
                    <th className="py-3 px-4 text-center">অর্ডারের সংখ্যা</th>
                    <th className="py-3 px-4 text-right">মোট রাজস্ব (Revenue)</th>
                    <th className="py-3 px-4 text-right">প্রদত্ত ছাড় (Discount)</th>
                    <th className="py-3 px-4 text-right">গড় অর্ডার মূল্য (AOV)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {marketingReport?.channelBreakdown && marketingReport.channelBreakdown.length > 0 ? (
                    marketingReport.channelBreakdown.map((ch: any, idx: number) => (
                      <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-stone-900">{ch.channel}</td>
                        <td className="py-3 px-4 text-center font-bold font-mono text-stone-800">{ch.orders} টি</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          ৳{Number(ch.revenue || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-rose-600">
                          ৳{Number(ch.discount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-stone-800">
                          {ch.orders > 0 ? `৳${Number(ch.aov || 0).toLocaleString()}` : 'তথ্য পাওয়া যায়নি'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone-400">
                        তথ্য পাওয়া যায়নি (Data not available)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 6: Real Coupons Performance Details */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">কুপন কোড বিস্তারিত কার্যকারিতা (Coupons Ledger)</h4>
                <p className="text-xs text-stone-500">
                  ডাটাবেজে সংরক্ষিত কুপন তালিকা এবং অর্ডারে ব্যবহারের প্রকৃত পরিসংখ্যান
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">কুপন কোড</th>
                    <th className="py-3 px-4">ছাড়ের বিবরণ</th>
                    <th className="py-3 px-4">ন্যূনতম অর্ডার</th>
                    <th className="py-3 px-4 text-center">ব্যবহারের সংখ্যা</th>
                    <th className="py-3 px-4 text-right">জেনারেটেড বিক্রয়</th>
                    <th className="py-3 px-4 text-right">প্রদত্ত ছাড়ের খরচ</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {marketingReport?.couponDetails && marketingReport.couponDetails.length > 0 ? (
                    marketingReport.couponDetails.map((cp: any, idx: number) => (
                      <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-900 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-600" />
                          <span>{cp.code}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-stone-800">
                            {cp.discount_type === 'percentage' ? `${cp.discount_value}%` : `৳${cp.discount_value}`}
                          </span>
                          {cp.description && <span className="text-[11px] text-stone-500 block">{cp.description}</span>}
                        </td>
                        <td className="py-3 px-4 font-mono">৳{cp.min_order_amount}</td>
                        <td className="py-3 px-4 text-center font-bold text-stone-900 font-mono">
                          {cp.used_count || cp.orders_count || 0} বার
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          ৳{Number(cp.total_revenue || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-rose-600">
                          ৳{Number(cp.total_discount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              cp.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {cp.active ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        কোনো কুপন কোড পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 7: Landing Pages Performance Details */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div>
              <h4 className="font-bold text-stone-900 text-sm">ল্যান্ডিং পেজ কার্যকারিতা তালিকা (Landing Pages Ledger)</h4>
              <p className="text-xs text-stone-500">
                প্রত্যেকটি সক্রিয় ল্যান্ডিং পেজের ট্রাফিক এবং অর্ডার কনভার্সন
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">শিরোনাম / স্ল্যাগ</th>
                    <th className="py-3 px-4 text-center">ভিজিট সংখ্যা (Views)</th>
                    <th className="py-3 px-4 text-center">অর্ডার সংখ্যা (Orders)</th>
                    <th className="py-3 px-4 text-center">কনভার্সন হার</th>
                    <th className="py-3 px-4 text-right">অফার মূল্য</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {marketingReport?.landingPageDetails && marketingReport.landingPageDetails.length > 0 ? (
                    marketingReport.landingPageDetails.map((lp: any, idx: number) => {
                      const views = Number(lp.view_count || 0);
                      const orders = Number(lp.order_count || 0);
                      const cr = views > 0 ? ((orders / views) * 100).toFixed(2) + '%' : 'তথ্য পাওয়া যায়নি';
                      return (
                        <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-stone-900">{lp.title}</p>
                            <span className="text-[11px] text-stone-400 font-mono">/landing/{lp.slug}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-blue-700">{views} বার</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">{orders} টি</td>
                          <td className="py-3 px-4 text-center font-mono font-semibold text-purple-700">{cr}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                            ৳{Number(lp.offer_price || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {lp.status || 'active'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        কোনো ল্যান্ডিং পেজ পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 8: Timer Offers Details */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div>
              <h4 className="font-bold text-stone-900 text-sm">কাউন্টডাউন টাইমার অফার তালিকা (Timer Offers)</h4>
              <p className="text-xs text-stone-500">
                ফ্ল্যাশ সেল ও নির্দিষ্ট স্কোপের ছাড় সংক্রান্ত ডাটাবেজ রেকর্ড
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">অফারের নাম</th>
                    <th className="py-3 px-4">টার্গেট স্কোপ</th>
                    <th className="py-3 px-4">ছাড়ের পরিমাণ</th>
                    <th className="py-3 px-4">মেয়াদ শেষ</th>
                    <th className="py-3 px-4 text-center">ক্লিক / এনগেজমেন্ট</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {marketingReport?.timerOfferDetails && marketingReport.timerOfferDetails.length > 0 ? (
                    marketingReport.timerOfferDetails.map((to: any, idx: number) => (
                      <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-stone-900">{to.offer_name}</p>
                          <span className="text-[11px] text-stone-500">{to.title}</span>
                        </td>
                        <td className="py-3 px-4 capitalize font-medium text-stone-700">
                          {String(to.target_type || '').replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-900">
                          {to.discount_type === 'percentage' ? `${to.discount_value}%` : `৳${to.discount_value}`}
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-600">
                          {new Date(to.end_time).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="py-3 px-4 text-center text-stone-400 font-medium">
                          তথ্য পাওয়া যায়নি
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {to.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        কোনো টাইমার অফার পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 9: Data Transparency Notice for Unsupported Metrics */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 text-xs text-stone-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-800 text-xs">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>মার্কেটিং অ্যানালিটিক্স সততা ও স্বচ্ছতা নির্দেশিকা (Analytics Policy):</span>
            </div>
            <p className="leading-relaxed">
              উক্ত অ্যানালিটিক্সে কোনো কাল্পনিক বা অনুমানভিত্তিক সংখ্যা প্রদর্শন করা হয়নি। সমস্ত মেট্রিক্স সরাসরি SQLite ডাটাবেজের বাস্তব টেবিল (<code className="bg-stone-200 px-1 py-0.5 rounded">orders</code>, <code className="bg-stone-200 px-1 py-0.5 rounded">coupons</code>, <code className="bg-stone-200 px-1 py-0.5 rounded">timer_offers</code>, <code className="bg-stone-200 px-1 py-0.5 rounded">landing_pages</code>) থেকে লাইভ গণনাকৃত।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-stone-500">
              <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                <span className="font-bold text-stone-700 block">Ad Network UTM ROAS:</span>
                <span className="text-amber-800 font-medium">তথ্য পাওয়া যায়নি (Data not available)</span> — বহিরাগত বিজ্ঞাপন প্ল্যাটফর্ম থেকে কনভার্সন ট্র্যাকিং ডেটাবেজে সরাসরি সিঙ্ক করা নেই।
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                <span className="font-bold text-stone-700 block">Affiliate Referral Tracking:</span>
                <span className="text-amber-800 font-medium">তথ্য পাওয়া যায়নি (Data not available)</span> — অ্যাফিলিয়েট মডিউল এই সিস্টেম আর্কিটেকচারে সক্রিয় নেই।
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. INVENTORY ANALYTICS TAB (DEDICATED) */}
      {activeReportTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">মোট ক্যাটালগ পণ্য</span>
              <p className="text-2xl font-black text-stone-900 mt-1 font-mono">
                {inventoryAnalytics.totalProducts} টি
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">মোট ফিজিক্যাল স্টক</span>
              <p className="text-2xl font-black text-emerald-800 mt-1 font-mono">
                {inventoryAnalytics.totalStock} পিস
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">মোট ইনভেন্টরি সম্পদ মূল্য</span>
              <p className="text-2xl font-black text-amber-800 mt-1 font-mono">
                ৳{inventoryAnalytics.totalAssetValue.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">লো-স্টক / স্টক শেষ অ্যালার্ট</span>
              <p className="text-2xl font-black text-rose-700 mt-1 font-mono">
                {inventoryAnalytics.lowStockCount + inventoryAnalytics.outOfStockCount} টি
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
