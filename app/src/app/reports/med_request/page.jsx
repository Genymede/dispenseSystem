"use client";
import { useEffect, useState } from "react";
import ReportFilter from "@/app/component/ReportFilter";
import exportPDF from "@/app/component/PDFexport";
import exportCSV from "@/app/component/CSVexport";
import ExportButton from "@/app/component/ExportButton";
import { FileText, Table2, BarChart3, Search, Package, AlertTriangle, CheckCircle, Eye, X, Calendar, Pill } from "lucide-react";
import Header from "@/app/component/Header";
import { FormatDate, FormatDateTime } from "@/app/component/formatDate";

export default function MedicineRequestReportPage() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [medNames, setMedNames] = useState({}); // ใช้ med_id สำหรับ name, thaiName
  const [stockData, setStockData] = useState({}); // เก็บข้อมูลจาก /medicine/stock เป็น object ใช้ med_sid เป็น key
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

  // ดึงข้อมูลคำขอและข้อมูลยาเมื่อ Component ถูก Render ครั้งแรก
  useEffect(() => {
    async function fetchRequestData() {
      try {
        setError(null);
        const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/med_requests`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();

        const sres = await fetch(`https://dispensesystem-production.up.railway.app/medicine/stock`, { cache: "no-store" });
        if (!sres.ok) {
          throw new Error(`HTTP error! Status: ${sres.status}`);
        }
        const sdata = await sres.json();
        // แปลง sdata เป็น object ใช้ med_sid เป็น key
        const stockMap = sdata.reduce((map, stock) => {
          map[stock.med_sid] = stock;
          return map;
        }, {});
        setStockData(stockMap);

        if (!Array.isArray(data)) {
          console.error("API response is not an array:", data);
          setAllData([]);
          setFilteredData([]);
          setError("ได้รับข้อมูลไม่ถูกต้องจากเซิร์ฟเวอร์ กรุณาลองอีกครั้ง");
          return;
        }

        const requestIds = data.map(item => item.request_id);
        const uniqueRequestIds = new Set(requestIds);
        if (uniqueRequestIds.size !== requestIds.length) {
          console.warn("พบ request_id ที่ซ้ำกันในข้อมูล API:", requestIds);
        }

        const validatedData = data.map((item, index) => ({
          ...item,
          request_id: item.request_id ?? `fallback-${index}`,
          med_id: item.med_id ?? null,
          quantity: item.quantity ?? 0,
          unit: item.unit ?? "-",
          requested_by: item.requested_by ?? null,
          approved_by: item.approved_by ?? null,
          status: item.status ?? "ไม่ระบุ",
          request_time: item.request_time ?? null,
          approved_time: item.approved_time ?? null,
          dispensed_time: item.dispensed_time ?? null,
          note: item.note ?? "-",
          created_at: item.created_at ?? null,
          updated_at: item.updated_at ?? null,
          is_approve: item.is_approve ?? false,
          origin: item.origin ?? "-",
          med_sid: item.med_sid ?? null,
        }));

        setAllData(validatedData);
        setFilteredData(validatedData);

        // ดึงข้อมูลยาจาก /medicine สำหรับ modal
        const uniqueMedIds = [...new Set(validatedData.map(item => item.med_id).filter(id => id))];
        const medMap = {};

        for (const id of uniqueMedIds) {
          try {
            const medRes = await fetch(`https://dispensesystem-production.up.railway.app/medicine/${id}`, { cache: "no-store" });
            if (medRes.ok) {
              const med = await medRes.json();
              medMap[id] = {
                name: med.med_name || `ID: ${id}`,
                thaiName: med.med_thai_name || med.med_name || `ID: ${id}`,
              };
            } else {
              medMap[id] = {
                name: `ID: ${id}`,
                thaiName: `ID: ${id}`,
              };
            }
          } catch (err) {
            console.error(`เกิดข้อผิดพลาดในการดึงข้อมูลยา ${id}:`, err);
            medMap[id] = {
              name: `ID: ${id}`,
              thaiName: `ID: ${id}`,
            };
          }
        }

        setMedNames(medMap);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคำขอ:", error);
        setAllData([]);
        setFilteredData([]);
        setError("ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อและลองอีกครั้ง");
      }
    }
    fetchRequestData();
  }, []);

  // ใช้ useEffect เพื่อกรองข้อมูลเมื่อ State ของ Filter หรือ Search เปลี่ยน
  useEffect(() => {
    let filtered = [...allData];

    // กรองตามวันที่
    const filterByDate = (item) => {
      const itemDate = new Date(item.request_time);
      let isMatch = true;

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // ตั้งเวลาเริ่มต้นของวัน
        const end = new Date(startDate);
        end.setHours(23, 59, 59, 999); // ตั้งเวลาสิ้นสุดของวัน
        isMatch = itemDate >= start && itemDate <= end;
      } else if (filterSettings.days > 0) {
        const cutoff = new Date(Date.now() - filterSettings.days * 86400000);
        isMatch = itemDate >= cutoff;
      } else {
        if (filterSettings.month !== "0") {
          isMatch = isMatch && (itemDate.getMonth() + 1 === parseInt(filterSettings.month));
        }
        if (filterSettings.year !== "0") {
          isMatch = isMatch && (itemDate.getFullYear() === parseInt(filterSettings.year));
        }
      }
      return isMatch;
    };

    filtered = filtered.filter(filterByDate);

    // กรองตามสถานะ
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // กรองด้วย searchTerm
    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((request) => {
        const requestId = request.request_id != null ? String(request.request_id) : "";
        const medSid = request.med_sid != null ? String(request.med_sid) : "";
        const medId = request.med_id != null ? String(request.med_id) : "";
        const stock = stockData[request.med_sid];

        return (
          (stock?.med_showname?.toLowerCase()?.includes(lowerTerm) || false) ||
          (stock?.med_showname_eng?.toLowerCase()?.includes(lowerTerm) || false) ||
          (medNames[request.med_id]?.name?.toLowerCase()?.includes(lowerTerm) || false) ||
          (medNames[request.med_id]?.thaiName?.toLowerCase()?.includes(lowerTerm) || false) ||
          (request.note?.toLowerCase()?.includes(lowerTerm) || false) ||
          (request.quantity != null && String(request.quantity).includes(lowerTerm)) ||
          (request.unit?.toLowerCase()?.includes(lowerTerm) || false) ||
          (requestId.toLowerCase().includes(lowerTerm)) ||
          (request.origin?.toLowerCase()?.includes(lowerTerm) || false) ||
          (medSid.toLowerCase().includes(lowerTerm)) ||
          (medId.toLowerCase().includes(lowerTerm))
        );
      });
    }

    setFilteredData(filtered);
  }, [allData, filterSettings, statusFilter, searchTerm, medNames, stockData, startDate]);

  // ฟังก์ชันจัดการการค้นหา
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ฟังก์ชันจัดการการเปลี่ยนสถานะ
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  // ฟังก์ชันจัดการการเปลี่ยนวันที่
  const handleDateFilter = ({ days, month, year, startDate: filterStartDate }) => {
    setFilterSettings({ days, month, year });
    setStartDate(filterStartDate || "");
  };

  // ฟังก์ชันรีเซ็ตตัวกรอง
  const resetFilters = () => {
    setFilterSettings({ days: 0, month: "0", year: "0" });
    setStatusFilter("all");
    setSearchTerm("");
    setStartDate("");
  };

  // เตรียมข้อมูลสำหรับตาราง
  const prepareTableData = () => {
    const columns = [
      "รหัสคำขอ",
      "รหัสยา",
      "ชื่อยา",
      "จำนวน",
      "หน่วย",
      "สถานะ",
      "วันที่ร้องขอ",
      "ที่มา",
      "รหัสสต็อก"
    ];
    const rows = filteredData.map((row) => [
      row.request_id,
      row.med_id || "-",
      stockData[row.med_sid]?.med_showname || medNames[row.med_id]?.thaiName || medNames[row.med_id]?.name || "-",
      row.quantity || "-",
      row.unit || "-",
      getStatusIcon(row.status).status,
      formatDate(row.request_time),
      row.origin || "-",
      row.med_sid || "-",
    ]);
    return { columns, rows };
  };

  // ส่งออกเป็น PDF
  const tableToPDF = async () => {
    setIsExporting(true);
    try {
      const { columns, rows } = prepareTableData();
      await exportPDF({
        filename: `medicine_request_report_${new Date().toISOString().split("T")[0]}.pdf`,
        columns,
        rows,
        title: "รายงานคำขอการเบิกยา",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setError("เกิดข้อผิดพลาดในการส่งออก PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // ส่งออกเป็น CSV
  const tableToCSV = () => {
    setIsExporting(true);
    try {
      const { columns, rows } = prepareTableData();
      exportCSV({
        filename: `medicine_request_report_${new Date().toISOString().split("T")[0]}.csv`,
        columns,
        rows,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setError("เกิดข้อผิดพลาดในการส่งออก CSV");
    } finally {
      setIsExporting(false);
    }
  };

  // ฟังก์ชันกำหนดสถานะ
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return { status: "รออนุมัติ", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle };
      case "approved":
        return { status: "อนุมัติแล้ว", color: "bg-green-100 text-green-800", icon: CheckCircle };
      case "dispensed":
        return { status: "จ่ายยาแล้ว", color: "bg-blue-100 text-blue-800", icon: Calendar };
      default:
        return { status: "ไม่ระบุ", color: "bg-gray-100 text-gray-800", icon: X };
    }
  };

  // ฟังก์ชันจัดรูปแบบวันที่
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

  return (
    <div className="">
      <div className=" mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <Header
            header="รายงานคำขอการเบิกยา"
            description="ตรวจสอบและจัดการข้อมูลคำขอการเบิกยาในระบบ"
            icon={BarChart3}
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
        <div className="mt-6 mb-4">
          <div className="flex flex-col lg:flex-col gap-4 items-center">
            <ReportFilter onFilterChange={handleDateFilter} />
            <div className="flex-1 flex gap-4 items-center w-full">
              <div className="relative min-w-[200px]">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none"
                >
                  <option value="all">สถานะ: ทั้งหมด</option>
                  <option value="pending">รออนุมัติ</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="dispensed">จ่ายยาแล้ว</option>
                </select>
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="ค้นหาด้วยรหัส, ชื่อยา (สต็อก/ไทย/อังกฤษ), จำนวน, หน่วย, หมายเหตุ, ที่มา, หรือรหัสสต็อก..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                />
              </div>
              <div className="relative min-w-[150px]">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  placeholder="วันที่"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                />
              </div>
              <button
                onClick={resetFilters}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
              >
                <X className="w-4 h-4 mr-1" />
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">ไม่พบรายการ</p>
            <p className="text-gray-400">ลองเปลี่ยนเงื่อนไขการค้นหา</p>
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
                        รหัสคำขอ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">รหัสยา</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อยา</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">จำนวน</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">หน่วย</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">สถานะ</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ที่มา</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">รหัสสต็อก</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ดูรายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((request, index) => {
                      const statusInfo = getStatusIcon(request.status);
                      const StatusIcon = statusInfo.icon;
                      const displayName = stockData[request.med_sid]?.med_showname ||
                        medNames[request.med_id]?.thaiName ||
                        medNames[request.med_id]?.name || "-";
                      return (
                        <tr
                          key={request.request_id}
                          className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                              </div>
                              {request.request_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{request.med_id || "-"}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600 max-w-[20vh] truncate" title={displayName}>
                            {displayName}
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">{request.quantity || "-"}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">{request.unit || "-"}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                              <StatusIcon className="w-4 h-4 mr-1" />
                              {statusInfo.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600 max-w-[15vh] truncate">{request.origin || "-"}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">{request.med_sid || "-"}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              ดูรายละเอียด
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr key="no-data">
                      <td colSpan="9" className="text-center py-4 text-gray-600">
                        ไม่พบข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Request Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">รายละเอียดคำขอการเบิกยา</h2>
                      <p className="text-blue-100 text-sm">รหัสคำขอ: {selectedRequest.request_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 border-r border-gray-300 pr-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <Pill className="h-5 w-5 text-blue-600" />
                      ข้อมูลพื้นฐาน
                    </h3>
                    <div className="space-y-1">
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">รหัสคำขอ:</span>
                        <span className="text-end font-medium text-gray-900">{selectedRequest.request_id}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">รหัสยา:</span>
                        <span className="text-end font-medium text-gray-900">{selectedRequest.med_id || "-"}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">ชื่อยา (สต็อก):</span>
                        <span className="text-end font-medium text-gray-900">{stockData[selectedRequest.med_sid]?.med_showname || "-"}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">ชื่อยา (สต็อก อังกฤษ):</span>
                        <span className="text-end font-medium text-gray-900">{stockData[selectedRequest.med_sid]?.med_showname_eng || "-"}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">ชื่อยา (ไทย):</span>
                        <span className="text-end font-medium text-gray-900">{medNames[selectedRequest.med_id]?.thaiName || "-"}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">ชื่อยา (อังกฤษ):</span>
                        <span className="text-end font-medium text-gray-900">{medNames[selectedRequest.med_id]?.name || "-"}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">จำนวน:</span>
                        <span className="text-end font-medium text-gray-900">{selectedRequest.quantity || "-"}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">หน่วย:</span>
                        <span className="text-end font-medium text-gray-900">{selectedRequest.unit || "-"}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">รหัสผู้ร้องขอ:</span>
                        <span className="text-end font-medium text-gray-900">{selectedRequest.requested_by || "-"}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">ที่มา:</span>
                        <span className="text-end font-medium text-gray-900">{selectedRequest.origin || "-"}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">รหัสสต็อก:</span>
                        <span className="text-end font-medium text-gray-900">{selectedRequest.med_sid || "-"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      สถานะและวันที่
                    </h3>
                    <div className="space-y-1 pt-4">
                      <div className="flex items-center justify-start gap-2">
                        <p className="text-sm text-gray-600">สถานะ:</p>
                        <div>
                          {(() => {
                            const statusInfo = getStatusIcon(selectedRequest.status);
                            const StatusIcon = statusInfo.icon;
                            return (
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                                <StatusIcon className="w-4 h-4 mr-1" />
                                {statusInfo.status}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">อนุมัติ:</span>
                        <span className="font-medium text-gray-900">{selectedRequest.is_approve ? "ใช่" : "ไม่"}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">อนุมัติโดย:</span>
                        <span className="font-medium text-gray-900">{selectedRequest.approved_by || "ไม่พบข้อมูล"}</span>
                      </div>
                      <div className="flex justify-start items-center gap-2 py-2">
                        <span className="text-sm text-gray-600">หมายเหตุ:</span>
                        <span className="font-medium text-gray-900">{selectedRequest.note || "-"}</span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          ข้อมูลวันที่
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">วันที่ร้องขอ:</span>
                            <span className="text-gray-900">{<FormatDateTime dateString={selectedRequest.request_time}/>}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">วันที่อนุมัติ:</span>
                            <span className="text-gray-900">{<FormatDateTime dateString={selectedRequest.approved_time}/>}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">วันที่จ่ายยา:</span>
                            <span className="text-gray-900">{<FormatDateTime dateString={selectedRequest.dispensed_time}/>}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">สร้าง:</span>
                            <span className="text-gray-900">{<FormatDateTime dateString={selectedRequest.created_at}/>}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">อัพเดท:</span>
                            <span className="text-gray-900">{<FormatDateTime dateString={selectedRequest.updated_at}/>}</span>
                          </div>
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