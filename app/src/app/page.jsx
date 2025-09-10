"use client";
import { useEffect, useState } from "react";
import { 
  FileText, 
  Package, 
  Pill, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Search, 
  Filter, 
  X, 
  ChevronRight,
  ChevronDown,
  BarChart3,
  Activity,
  Shield,
  Archive,
  History,
  Calendar,
  Users,
  Building2,
  Bell,
  Star,
  Eye
} from "lucide-react";

const isClient = typeof window !== "undefined";
const host = isClient ? window.location.hostname : "localhost";
const url = `http://${host}:3000/reports/`;

// ข่าวสารและประกาศ
const newsItems = [
  {
    id: 1,
    title: "ประกาศเปิดตัวระบบรายงานเภสัชกรรมใหม่",
    excerpt: "ระบบรายงานเภสัชกรรมอัตโนมัติเพื่อการจัดการข้อมูลยาที่มีประสิทธิภาพมากขึ้น",
    date: "2024-08-23",
    category: "ประกาศ",
    priority: "high",
    views: 324,
    isNew: true
  },
  {
    id: 2,
    title: "การอบรมเรื่องความปลอดภัยในการใช้ยา",
    excerpt: "จัดอบรมให้กับเจ้าหน้าที่เรื่องการป้องกันข้อผิดพลาดในการจ่ายยา",
    date: "2024-08-20",
    category: "การฝึกอบรม",
    priority: "medium",
    views: 156,
    isNew: true
  },
  {
    id: 3,
    title: "ผลการตรวจสอบคุณภาพยาประจำเดือนกรกฎาคม",
    excerpt: "สรุปผลการตรวจสอบคุณภาพยาและการเก็บรักษายาในคลังเภสัชกรรม",
    date: "2024-08-15",
    category: "รายงาน",
    priority: "medium",
    views: 89,
    isNew: false
  },
  {
    id: 4,
    title: "แนวทางใหม่การจ่ายยาปฏิชีวนะ",
    excerpt: "ปรับปรุงแนวทางการจ่ายยาปฏิชีวนะให้สอดคล้องกับมาตรฐานใหม่",
    date: "2024-08-10",
    category: "นโยบาย",
    priority: "high",
    views: 267,
    isNew: false
  },
  {
    id: 5,
    title: "การประชุมคณะกรรมการเภสัชกรรม ประจำเดือนสิงหาคม",
    excerpt: "สรุปผลการประชุมและมติที่สำคัญจากการประชุมคณะกรรมการเภสัชกรรม",
    date: "2024-08-05",
    category: "การประชุม",
    priority: "low",
    views: 45,
    isNew: false
  }
];

// ไอคอนสำหรับแต่ละประเภทรายงาน
const getReportIcon = (table) => ({
  medicine_order: <Pill className="w-5 h-5" />,
  cut_off: <Clock className="w-5 h-5" />,
  med_history: <History className="w-5 h-5" />,
  overdue_med: <AlertTriangle className="w-5 h-5" />,
  allergy_registry: <Shield className="w-5 h-5" />,
  rad_registry: <Package className="w-5 h-5" />,
  adr_registry: <AlertTriangle className="w-5 h-5" />,
  med_table: <Archive className="w-5 h-5" />,
  error_medication: <AlertTriangle className="w-5 h-5" />,
  med_interaction: <Activity className="w-5 h-5" />,
  med_usage_history: <History className="w-5 h-5" />,
  med_problem: <AlertTriangle className="w-5 h-5" />,
  temp_humidity: <BarChart3 className="w-5 h-5" />,
}[table] || <FileText className="w-5 h-5" />);

// รายการรายงาน (แบบย่อสำหรับหน้าหลัก)
const quickReports = [
  { label: "คำขอการเบิก–จ่ายยา", table: "med_request", desc: "ดูรายการคำขอเบิกจ่ายยาทั้งหมด" },
  { label: "ตัดรอบการเบิก–จ่ายยา", table: "cut_off", desc: "รายงานการตัดรอบยาประจำเดือน" },
  { label: "รายงานยาค้างจ่าย", table: "overdue_med", desc: "รายการยาที่ค้างการจ่าย" },
  { label: "รายงานยาคงคลัง", table: "med_table", desc: "สถานะยาคงเหลือในคลัง" },
  { label: "รายงานการแพ้ยา", table: "allergy_registry", desc: "ทะเบียนการแพ้ยาของผู้ป่วย" },
  { label: "รายงานการจ่ายยาผิดพลาด", table: "error_medication", desc: "บันทึกข้อผิดพลาดในการจ่ายยา" }
];

const getCategoryColor = (category) => {
  const colors = {
    "ประกาศ": "bg-red-100 text-red-700",
    "การฝึกอบรม": "bg-green-100 text-green-700",
    "รายงาน": "bg-blue-100 text-blue-700",
    "นโยบาย": "bg-purple-100 text-purple-700",
    "การประชุม": "bg-orange-100 text-orange-700"
  };
  return colors[category] || "bg-gray-100 text-gray-700";
};

const getPriorityIcon = (priority) => {
  if (priority === "high") return <AlertTriangle className="w-4 h-4 text-red-500" />;
  if (priority === "medium") return <Bell className="w-4 h-4 text-yellow-500" />;
  return <Bell className="w-4 h-4 text-gray-400" />;
};

export default function HospitalDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // กรองข่าวสาร
  const filteredNews = newsItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(newsItems.map(item => item.category))];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto ">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEioA7lesYMi9Jqe2TLmPd0r-b_jl4FbVsXQ&s" 
                alt="โรงพยาบาลวัดห้วยปลากั้งเพื่อสังคม" 
                className="w-32 h-32 object-contain rounded-lg border border-gray-200" 
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">โรงพยาบาลวัดห้วยปลากั้งเพื่อสังคม</h1>
              <p className="text-lg text-gray-600 mb-4">ระบบงานเภสัชกรรม</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>แผนกเภสัชกรรม</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>อัพเดท: {new Date().toLocaleDateString('th-TH')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>สำหรับเจ้าหน้าที่</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1  gap-8">
          {/* ข่าวสารและประกาศ - คอลัมน์ซ้าย */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">ข่าวสารและประกาศ</h2>
                
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="ค้นหาข่าวสาร..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">ทุกหมวดหมู่</option>
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {filteredNews.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getPriorityIcon(item.priority)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                          {item.isNew && (
                            <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                              ใหม่
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{item.views}</span>
                          </div>
                          <span>{new Date(item.date).toLocaleDateString('th-TH')}</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {item.excerpt}
                      </p>
                    </div>
                  ))}
                </div>

                {filteredNews.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบข่าวสาร</h3>
                    <p className="text-gray-600">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* รายงานด่วน - คอลัมน์ขวา */}
          
        </div>
      </div>
    </div>
  );
}