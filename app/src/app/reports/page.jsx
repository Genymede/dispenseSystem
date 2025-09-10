"use client";
import { useEffect, useState } from "react";
import {
  FileText,
  Package,
  Pill,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  X,
  ChevronRight,
  BarChart3,
  Activity,
  Shield,
  Archive,
  History,
  Truck,
  CalendarClock,
  TimerOff,
  CircleAlert,
  Biohazard,
  ShieldAlert,
  CircleX,
  CalendarX,
} from "lucide-react";
import Header from "../component/Header";

// กำหนด URL จาก hostname
const isClient = typeof window !== "undefined";
const host = isClient ? window.location.hostname : "localhost";
const url = `http://${host}:3000/reports/`;

// รายการรายงาน แบ่งตามหมวดหมู่ (เพิ่ม icon ใน items)
const reportItems = [
  {
    group: "เบิก-จ่ายยา",
    description: "จัดการคำขอ การตัดรอบ และประวัติการจ่ายยา",
    color: "blue",
    items: [
      { label: "คำขอการเบิก–จ่ายยา", table: "med_request", desc: "ดูรายการคำขอเบิกจ่ายยาทั้งหมด", icon: Pill },
      { label: "ตัดรอบการเบิก–จ่ายยา", table: "cut_off", desc: "รายงานการตัดรอบยาประจำเดือน", icon: Clock },
      { label: "รายงานประวัติการจ่ายยา", table: "med_order_history", desc: "ประวัติการจ่ายยาของผู้ป่วย", icon: History },
      { label: "รายงานประวัติการจัดส่งยา", table: "med_delivery", desc: "ประวัติการจัดส่งยาของผู้ป่วย", icon: Truck },
      { label: "รายงานยาค้างจ่าย", table: "overdue_med", desc: "รายการยาที่ค้างการจ่าย", icon: TimerOff },
      { label: "รายงานการแพ้ยา", table: "allergy_registry", desc: "ทะเบียนการแพ้ยาของผู้ป่วย", icon: CircleAlert },
      { label: "รายงานยาปฏิชีวนะควบคุม", table: "rad_registry", desc: "การใช้ยาปฏิชีวนะที่ต้องควบคุม", icon: Biohazard },
      { label: "รายงานเหตุการณ์ไม่พึงประสงค์", table: "adr_registry", desc: "บันทึกอาการไม่พึงประสงค์จากยา", icon: ShieldAlert },
    ],
  },
  {
    group: "คลังและการใช้ยา",
    description: "จัดการสต็อกยา การจ่ายผิดพลาด และปฏิกิริยา",
    color: "green",
    items: [
      { label: "รายงานยาคงคลัง", table: "med_subwarehouse", desc: "สถานะยาคงเหลือในคลัง", icon: Package },
      { label: "รายงานการจ่ายยาผิดพลาด", table: "error_medication", desc: "บันทึกข้อผิดพลาดในการจ่ายยา", icon: CircleX },
      { label: "รายงานปฏิกิริยาของยา", table: "med_interaction", desc: "ปฏิกิริยาระหว่างยาต่างประเภท", icon: Activity },
      { label: "รายงานยาหมดอายุ", table: "med_expired", desc: "ยาในคลังที่หมดอายุ", icon: CalendarX },
    ],
  },
  {
    group: "การขึ้นทะเบียน/ใช้ยา",
    description: "ทะเบียนยา ประวัติการใช้ และสภาพแวดล้อม",
    color: "purple",
    items: [
      { label: "รายงานการขึ้นทะเบียนยา", table: "med_table", desc: "ทะเบียนยาทั้งหมดในระบบ", icon: Package },
      { label: "รายงานประวัติการใช้ยา", table: "med_usage_history", desc: "ประวัติการใช้ยาของผู้ป่วย", icon: History },
      { label: "รายงานปัญหาการใช้ยา", table: "med_problem", desc: "ปัญหาที่เกิดขึ้นจากการใช้ยา", icon: AlertTriangle },
    ],
  },
];

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");

  // สถิติรวม
  const totalReports = reportItems.reduce((sum, group) => sum + group.items.length, 0);

  // กรองรายงานตามการค้นหาและกลุ่ม
  const filteredReports = reportItems
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.desc.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(
      (group) =>
        (selectedGroup === "all" || group.group === selectedGroup) &&
        group.items.length > 0
    );

  // นับจำนวนรายงานที่กรองได้
  const filteredReportsCount = filteredReports.reduce(
    (sum, group) => sum + group.items.length,
    0
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Header
          header="ระบบรายงานเภสัชกรรม"
          description="จัดการและดูรายงานต่างๆ ของระบบเภสัชกรรม"
          icon={BarChart3}
        />
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหารายงาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              aria-label="ค้นหารายงาน"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-w-[200px]"
              aria-label="กรองตามกลุ่มรายงาน"
            >
              <option value="all">ทุกกลุ่ม ({totalReports})</option>
              {reportItems.map((group, index) => (
                <option key={index} value={group.group}>
                  {group.group} ({group.items.length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedGroup !== "all") && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">ตัวกรอง:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  "{searchTerm}"
                  <button onClick={() => setSearchTerm("")}>
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedGroup !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {selectedGroup}
                  <button onClick={() => setSelectedGroup("all")}>
                    <X size={14} />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedGroup("all");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ล้างทั้งหมด
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reports by Group */}
      {filteredReports.length > 0 ? (
        <div className="space-y-8">
          {filteredReports.map((group) => (
            <div
              key={group.group}
              className="p-8 shadow-md shadow-gray-100 border border-gray-200 rounded-xl"
            >
              {/* Group Header */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{group.group}</h2>
                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
              </div>

              {/* Report Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map((item, itemIndex) => {
                  const IconComponent = item.icon || FileText;
                  return (
                    <a
                      key={`${item.table}-${itemIndex}`}
                      href={`${url}${item.table}`}
                      className="group relative block p-px rounded-2xl shadow-sm transition-all duration-300 hover:scale-[1.02] bg-gradient-to-tr from-blue-500 to-sky-300 hover:shadow-lg hover:shadow-blue-200"
                      aria-label={`ไปที่รายงาน ${item.label}`}
                    >
                      <div className="flex items-center justify-between gap-4 p-5 bg-white rounded-2xl h-full border-none">
                        {/* ไอคอน */}
                        <div className="p-4 rounded-xl bg-white shadow-sm text-blue-500 flex-shrink-0">
                          <IconComponent className="h-8 w-8" />
                        </div>

                        {/* ข้อความ */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 ">
                            {item.label}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{item.desc}</p>
                        </div>

                        {/* ลูกศร */}
                        <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบรายงานที่ตรงตามเงื่อนไข</h3>
          <p className="text-gray-600 mb-4">ลองเปลี่ยนคำค้นหาหรือเลือกกลุ่มอื่น</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedGroup("all");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            แสดงทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
}