"use client";
import { useEffect, useState } from "react";
import ReportFilter from "@/app/component/ReportFilter";
import exportPDF from "@/app/component/PDFexport";
import exportCSV from "@/app/component/CSVexport";
import ExportButton from "@/app/component/ExportButton";
import { FileText, Table2, BarChart3, Search, Package, Calendar, Pill, X, Eye, CalendarDays, CheckCircle } from "lucide-react";
import Header from "@/app/component/Header";
import { FormatDate, FormatDateTime } from "@/app/component/formatDate";

export default function ExpiredMedicineReportPage() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0", status: "all" });
  const [startDate, setStartDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

  // Fetch expired medicine data
  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        const response = await fetch(`https://dispensesystem-production.up.railway.app/medicine/expired`, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error("Expired medicine API response is not an array:", data);
          setAllData([]);
          setFilteredData([]);
          setError("ได้รับข้อมูลยาหมดอายุไม่ถูกต้องจากเซิร์ฟเวอร์");
          return;
        }

        console.log("Fetched data:", data); // Debug: Log fetched data
        setAllData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        setAllData([]);
        setFilteredData([]);
        setError("ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อและลองอีกครั้ง");
      }
    }
    fetchData();
  }, []);


  // Filter function
  const applyFilter = (settings = { days: 0, month: "0", year: "0", status: "all" }, startDate = "") => {
    const { days = 0, month = "0", year = "0", status = "all" } = settings;
    let filtered = [...allData];

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Set to start of the day
      const end = new Date(startDate);
      end.setHours(23, 59, 59, 999); // Set to end of the day

      filtered = filtered.filter(item => {
        const expDate = new Date(item.exp_date);
        return expDate >= start && expDate <= end;
      });
    } else if (days > 0) {
      const cutoff = new Date(Date.now() - days * 86400000);
      filtered = filtered.filter(item => {
        const expDate = new Date(item.exp_date);
        return expDate >= cutoff;
      });
    } else {
      if (month && month !== "0") {
        filtered = filtered.filter(item => {
          const expDate = new Date(item.exp_date);
          return expDate.getMonth() + 1 === parseInt(month); // Month is 1-12
        });
      }
      if (year && year !== "0") {
        filtered = filtered.filter(item => {
          const expDate = new Date(item.exp_date);
          return expDate.getFullYear() === parseInt(year);
        });
      }
    }

    if (status && status !== "all") {
      filtered = filtered.filter(item => item.status === status);
    }

    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        (item.med_showname || "").toLowerCase().includes(lowerTerm) ||
        (item.med_thai_name || "").toLowerCase().includes(lowerTerm) ||
        (item.med_name || "").toLowerCase().includes(lowerTerm) ||
        (item.med_generic_name || "").toLowerCase().includes(lowerTerm) ||
        (item.med_marketing_name || "").toLowerCase().includes(lowerTerm) ||
        String(item.med_sid || "").includes(lowerTerm) ||
        String(item.expired_med_id || "").includes(lowerTerm)
      );
    }

    console.log("Filtered data:", filtered); // Debug: Log filtered results
    setFilteredData(filtered);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterSettings({ days: 0, month: "0", year: "0", status: "all" });
    setStartDate("");
    setSearchTerm("");
    applyFilter({ days: 0, month: "0", year: "0", status: "all" }, "");
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setFilterSettings({ ...filterSettings, status: e.target.value });
    applyFilter({ ...filterSettings, status: e.target.value }, startDate);
  };

  // Trigger filtering on changes
  useEffect(() => {
    applyFilter(filterSettings, startDate);
  }, [filterSettings, startDate, searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return "-";
    }
  };

  // Prepare table data
  const prepareTableData = () => {
    const columns = ["รหัสยาหมดอายุ", "รหัสยา", "ชื่อยา", "วันที่หมดอายุ", "สถานะ", "จำนวน", "สถานที่จัดเก็บ", "ดูรายละเอียด"];
    const rows = filteredData.map(item => [
      item.expired_med_id,
      item.med_sid,
      item.med_showname || item.med_thai_name || item.med_name || item.med_generic_name || item.med_marketing_name || `ID: ${item.med_sid}`,
      formatDate(item.exp_date),
      item.status === "pending" ? "รอดำเนินการ" : item.status,
      item.med_quantity,
      item.location || "-",
      "" // Placeholder for "ดูรายละเอียด" column
    ]);
    return { columns, rows };
  };

  // Export to PDF
  const tableToPDF = async () => {
    setIsExporting(true);
    try {
      const { columns, rows } = prepareTableData();
      const currentDate = new Date().toLocaleString('th-TH', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok'
      });
      await exportPDF({
        filename: `expired_medicine_report_${currentDate}.pdf`,
        columns: columns.slice(0, -1), // Remove "ดูรายละเอียด" column
        rows: rows.map(row => row.slice(0, -1)), // Remove "ดูรายละเอียด" column
        title: `รายงานยาหมดอายุ ณ วันที่ ${currentDate}`,
        orientation: 'landscape'
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setError("เกิดข้อผิดพลาดในการส่งออก PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // Export to CSV
  const tableToCSV = () => {
    setIsExporting(true);
    try {
      const { columns, rows } = prepareTableData();
      const currentDate = new Date().toLocaleString('th-TH', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok'
      });
      exportCSV({
        filename: `expired_medicine_report_${currentDate}.csv`,
        columns: columns.slice(0, -1), // Remove "ดูรายละเอียด" column
        rows: rows.map(row => row.slice(0, -1)), // Remove "ดูรายละเอียด" column
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setError("เกิดข้อผิดพลาดในการส่งออก CSV");
    } finally {
      setIsExporting(false);
    }
  };

  // Determine status display
  const getStatusDisplay = (item) => {
    if (item.status === "pending") {
      return { status: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-800", icon: Calendar };
    } else if (item.status === "disposed") {
      return { status: "ถูกกำจัด", color: "bg-red-100 text-red-800", icon: X };
    } else if (item.status === "quarantined") {
      return { status: "กักกัน", color: "bg-purple-100 text-purple-800", icon: Package };
    }
    return { status: item.status, color: "bg-gray-100 text-gray-800", icon: Calendar };
  };

  return (
    <div className="font-sarabun">
      <div className=" mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <Header
            header="รายงานยาหมดอายุ"
            description="ตรวจสอบและจัดการข้อมูลยาที่หมดอายุ"
            icon={Pill}
          />
          <div className="flex gap-3 mt-4 lg:mt-0">
            <ExportButton
              key="pdf-export"
              onExport={tableToPDF}
              description="ดาวน์โหลด PDF"
              icon={FileText}
              color="red"
              isExporting={isExporting}
              disabled={isExporting}
            />
            <ExportButton
              key="csv-export"
              onExport={tableToCSV}
              description="ดาวน์โหลด CSV"
              icon={Table2}
              color="green"
              isExporting={isExporting}
              disabled={isExporting}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-xl mb-4">
            <p>{error}</p>
          </div>
        )}

        

        {/* Filter and Search Section */}
        <div className="flex flex-col gap-4">
          <ReportFilter
            onFilterChange={(newSettings) => {
              const updatedSettings = { ...filterSettings, ...newSettings };
              setFilterSettings(updatedSettings);
              applyFilter(updatedSettings, startDate);
            }}
          />
          <div className="grid grid-cols-5 lg:flex-row gap-4 items-center w-full">
            <div className="relative col-span-2">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ค้นหาด้วยรหัสยา, ชื่อยา (ไทย/อังกฤษ/ทั่วไป/การค้า), หรือรหัสยาหมดอายุ..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
              />
            </div>
            
            <div className="relative col-span-1">
              <select
                id="status-filter"
                value={filterSettings.status}
                onChange={handleStatusChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none"
              >
                <option value="all">สถานะ: ทั้งหมด</option>
                <option value="pending">รอดำเนินการ</option>
                <option value="disposed">ถูกกำจัด</option>
                <option value="quarantined">กักกัน</option>
                
              </select>
              <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <div className="relative col-span-1">
              <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                placeholder="วันที่"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
              />
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center px-4 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
            >
              <X className="w-4 h-4 mr-1" />
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-6 mb-4">
          {filteredData.length === 0 && (searchTerm || startDate || filterSettings.days > 0 || filterSettings.month !== "0" || filterSettings.year !== "0" || filterSettings.status !== "all") ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">ไม่พบข้อมูลยาหมดอายุ</p>
              <p className="text-gray-400">ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div style={{ maxHeight: "65vh", overflowY: "auto" }} className="relative">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        <div className="flex items-center">
                          <Pill className="mr-2 h-4 w-4 text-gray-500" />
                          รหัสยาหมดอายุ
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">รหัสยา</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อยา</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">วันที่หมดอายุ</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">สถานะ</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">จำนวน</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">สถานที่จัดเก็บ</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ดูรายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredData.map((item, index) => {
                      const statusDisplay = getStatusDisplay(item);
                      const StatusIcon = statusDisplay.icon;
                      return (
                        <tr
                          key={item.expired_med_id}
                          className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                              </div>
                              {item.expired_med_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">{item.med_sid}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">
                            {item.med_showname || item.med_thai_name || item.med_name || item.med_generic_name || item.med_marketing_name || `ID: ${item.med_sid}`}
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">{formatDate(item.exp_date)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                              <StatusIcon className="w-4 h-4 mr-1" />
                              {statusDisplay.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">{item.med_quantity}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">{item.location || "-"}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setSelectedMedicine(item)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              ดูรายละเอียด
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Medicine Detail Modal */}
        {selectedMedicine && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">รายละเอียดยาหมดอายุ</h2>
                      <p className="text-blue-100 text-sm">รหัสยาหมดอายุ: {selectedMedicine.expired_med_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMedicine(null)}
                    className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="space-y-4 border-r border-gray-300 pr-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <Pill className="h-5 w-5 text-blue-600" />
                      ข้อมูลพื้นฐาน
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: "รหัสยาหมดอายุ", value: selectedMedicine.expired_med_id || "-", key: "expired_med_id" },
                        { label: "รหัสยาในคลัง", value: selectedMedicine.med_sid || "-", key: "med_sid" },
                        { label: "รหัสยา", value: selectedMedicine.med_id || "-", key: "med_id" },
                        { 
                          label: "ชื่อยา", 
                          value: selectedMedicine.med_thai_name || selectedMedicine.med_showname || selectedMedicine.med_name || selectedMedicine.med_generic_name || selectedMedicine.med_marketing_name || "ไม่พบชื่อยา", 
                          key: "med_name" 
                        },
                        { label: "ประเภทบรรจุภัณฑ์", value: selectedMedicine.packaging_type || "-", key: "packaging_type" },
                        { label: "สถานที่จัดเก็บ", value: selectedMedicine.location || "-", key: "location" },
                        { label: "หน่วยนับ", value: selectedMedicine.med_counting_unit || "-", key: "med_counting_unit" },
                      ].map((item) => (
                        <div key={`basic-info-${item.key}`} className="flex justify-between py-2">
                          <span className="text-sm text-gray-600">{item.label}:</span>
                          <span className="font-medium text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4 pl-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <CalendarDays className="h-5 w-5 text-green-600" />
                      สถานะและวันที่
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">สถานะ</p>
                          <div className="mt-2">
                            {(() => {
                              const status = getStatusDisplay(selectedMedicine);
                              const StatusIcon = status.icon;
                              return (
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                  <StatusIcon className="w-4 h-4 mr-1" />
                                  {status.status}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">จำนวน:</span>
                        <span className="font-medium text-gray-900">{selectedMedicine.med_quantity || "-"}</span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          ข้อมูลวันที่
                        </h4>
                        <div className="space-y-2 text-sm">
                          {[
                            { label: "วันที่หมดอายุ", value: <FormatDateTime dateString={selectedMedicine.exp_date} />, key: "exp_date" },
                            { label: "วันที่ผลิต", value: <FormatDateTime dateString={selectedMedicine.mfg_date} />, key: "mfg_date" },
                            { label: "วันที่ย้ายไปตารางยาหมดอายุ", value: <FormatDateTime dateString={selectedMedicine.moved_at} />, key: "moved_at" },
                          ].map((item) => (
                            <div key={`date-info-${item.key}`} className="flex justify-between">
                              <span className="text-gray-600">{item.label}:</span>
                              <span className="text-gray-900">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}