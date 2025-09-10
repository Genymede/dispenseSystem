"use client";
import { useEffect, useState } from "react";
import { Calendar, X } from "lucide-react";

export default function ReportFilter({ onFilterChange }) {
  const [filterDays, setFilterDays] = useState(0);
  const [filterMonth, setFilterMonth] = useState("0");
  const [filterYear, setFilterYear] = useState("0");

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const monthList = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  // เรียก onFilterChange เมื่อค่าเปลี่ยน
  useEffect(() => {
    if (typeof onFilterChange === "function") {
      onFilterChange({ days: filterDays, month: filterMonth, year: filterYear });
    }
  }, [filterDays, filterMonth, filterYear]);

  // ฟังก์ชันรีเซ็ตตัวกรอง
  const resetFilters = () => {
    setFilterDays(0);
    setFilterMonth("0");
    setFilterYear("0");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center w-full">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative min-w-[200px]">
          <select
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none"
            value={filterDays}
            onChange={(e) => setFilterDays(Number(e.target.value))}
          >
            <option value={0}>ช่วงเวลา: ทั้งหมด</option>
            <option value={1}>ย้อนหลัง 1 วัน</option>
            <option value={3}>ย้อนหลัง 3 วัน</option>
            <option value={7}>ย้อนหลัง 7 วัน</option>
            <option value={30}>ย้อนหลัง 1 เดือน</option>
            <option value={90}>ย้อนหลัง 3 เดือน</option>
            <option value={180}>ย้อนหลัง 6 เดือน</option>
            <option value={365}>ย้อนหลัง 12 เดือน</option>
          </select>
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>

        <div className="relative min-w-[200px]">
          <select
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="0">เดือน: ทุกเดือน</option>
            {monthList.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>

        <div className="relative min-w-[200px]">
          <select
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="0">ปี: ทุกปี</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
      </div>
    </div>
  );
}