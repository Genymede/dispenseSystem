"use client";
import { useEffect, useState } from "react";
import ReportFilter from "@/app/component/ReportFilter";
import exportPDF from "@/app/component/PDFexport";
import exportCSV from "@/app/component/CSVexport";
import ExportButton from "@/app/component/ExportButton";
import { FileText, Table2, BarChart3, Search, Package, AlertTriangle, CheckCircle, Eye, X, CalendarDays, Pill } from "lucide-react";
import Header from "@/app/component/Header";
import { FormatDate, FormatDateTime } from "@/app/component/formatDate";

export default function ErrorReportPage() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0" });
  const [isExporting, setIsExporting] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [medicineData, setMedicineData] = useState([]);
  const [patientData, setPatientData] = useState([]);
  const [users, setUsers] = useState({}); // Store users as { [user_id]: user }
  const [error, setError] = useState(null);
  const [selectedError, setSelectedError] = useState(null);

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

  // Fetch user by ID
  async function fetchUserById(userId) {
    try {
      const res = await fetch(`https://dispensesystem-production.up.railway.app/user/${userId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch user ${userId}`);
      const data = await res.json();
      return data.user; // Extract the inner user object
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }

  // Fetch error data, stock, medicine, patient data, and user data
  useEffect(() => {
    async function fetchErrorData() {
      try {
        setError(null);
        const [res, sres, mres, pres] = await Promise.all([
          fetch(`https://dispensesystem-production.up.railway.app/medicine/med_error`),
          fetch(`https://dispensesystem-production.up.railway.app/medicine/stock`),
          fetch(`https://dispensesystem-production.up.railway.app/medicine`),
          fetch(`https://dispensesystem-production.up.railway.app/patient`),
        ]);

        if (!res.ok) throw new Error(`HTTP error fetching errors! Status: ${res.status}`);
        if (!sres.ok) throw new Error(`HTTP error fetching stock! Status: ${sres.status}`);
        if (!mres.ok) throw new Error(`HTTP error fetching medicines! Status: ${mres.status}`);
        if (!pres.ok) throw new Error(`HTTP error fetching patients! Status: ${pres.status}`);

        const [data, sdata, mdata, pdata] = await Promise.all([
          res.json(),
          sres.json(),
          mres.json(),
          pres.json(),
        ]);

        if (!Array.isArray(data)) {
          console.error("Error data is not an array:", data);
          setError("ได้รับข้อมูลข้อผิดพลาดไม่ถูกต้องจากเซิร์ฟเวอร์");
          setAllData([]);
          setFilteredData([]);
          return;
        }

        setAllData(data);
        setFilteredData(data);
        setStockData(Array.isArray(sdata) ? sdata : []);
        setMedicineData(Array.isArray(mdata) ? mdata : []);
        setPatientData(Array.isArray(pdata) ? pdata : []);

        // Get unique user IDs from doctor_id
        const userIds = new Set(data.map(item => item.doctor_id).filter(id => id));
        const userPromises = Array.from(userIds).map(async (userId) => {
          const userData = await fetchUserById(userId);
          return { userId, userData };
        });
        const userResults = await Promise.all(userPromises);

        // Build user map
        const userMap = {};
        userResults.forEach(({ userId, userData }) => {
          if (userData) {
            userMap[userId] = userData;
          }
        });
        setUsers(userMap);

        if (userIds.size > 0 && userResults.every(({ userData }) => !userData)) {
          setError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองใหม่");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setAllData([]);
        setFilteredData([]);
        setStockData([]);
        setMedicineData([]);
        setPatientData([]);
        setUsers({});
        setError("ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อและลองอีกครั้ง");
      }
    }
    fetchErrorData();
  }, []);

  // Filter function
  const applyFilter = ({ days, month, year, startDate: filterStartDate }) => {
    setFilterSettings({ days, month, year });
    setStartDate(filterStartDate || "");

    let filtered = [...allData];

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(startDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.time);
        return itemDate >= start && itemDate <= end;
      });
    } else if (days > 0) {
      const cutoff = new Date(Date.now() - days * 86400000);
      filtered = filtered.filter(m => new Date(m.time) >= cutoff);
    } else {
      if (month !== "0") {
        filtered = filtered.filter(m => new Date(m.time).getMonth() + 1 === parseInt(month));
      }
      if (year !== "0") {
        filtered = filtered.filter(m => new Date(m.time).getFullYear() === parseInt(year));
      }
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(item => {
        if (statusFilter === "resolved") return item.resolved;
        if (statusFilter === "unresolved") return !item.resolved;
        return true;
      });
    }

    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(err =>
        String(err.description || "").toLowerCase().includes(lowerTerm) ||
        String(err.err_med_id || "").toString().includes(lowerTerm) ||
        String(err.med_id || "").toLowerCase().includes(lowerTerm) ||
        String(err.med_sid || "").toLowerCase().includes(lowerTerm) ||
        String(patientData.find(p => p.patient_id === err.patient_id)?.first_name || "").toLowerCase().includes(lowerTerm) ||
        String(patientData.find(p => p.patient_id === err.patient_id)?.last_name || "").toLowerCase().includes(lowerTerm) ||
        String(users[err.doctor_id]?.firstname || "").toLowerCase().includes(lowerTerm) ||
        String(users[err.doctor_id]?.lastname || "").toLowerCase().includes(lowerTerm) ||
        String(stockData.find(s => s.med_id === err.med_id)?.med_showname || "").toLowerCase().includes(lowerTerm) ||
        String(stockData.find(s => s.med_id === err.med_id)?.med_showname_eng || "").toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredData(filtered);
  };

  // Handle search
  const handleSearchError = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterSettings({ days: 0, month: "0", year: "0" });
    setStartDate("");
    setStatusFilter("all");
    setSearchTerm("");
  };

  // Trigger filtering on changes
  useEffect(() => {
    applyFilter({ ...filterSettings, startDate });
  }, [allData, searchTerm, statusFilter, startDate]);

  // Prepare table data
  const prepareTableData = () => {
    const columns = [
      "รหัสข้อผิดพลาด",
      "ชื่อยา",
      "ชื่อผู้ป่วย",
      "ชื่อผู้รายงาน",
      "คำอธิบาย",
      "สถานะ",
      "วันที่เกิด"
    ];
    const rows = filteredData.map((row) => {
      const stock = Array.isArray(stockData) ? stockData.find(s => s.med_id === row.med_id) : null;
      const patient = Array.isArray(patientData) ? patientData.find(p => p.patient_id === row.patient_id) : null;
      const medShowname = stock ? stock.med_showname : "ไม่พบชื่อยา";
      const patientName = patient ? `${patient.first_name} ${patient.last_name}` : "-";
      const reporterName = row.doctor_id && users[row.doctor_id] 
        ? `${users[row.doctor_id].firstname || "-"} ${users[row.doctor_id].lastname || "-"}`
        : "-";
      return [
        row.err_med_id,
        medShowname,
        patientName,
        reporterName,
        row.description,
        row.resolved ? "แก้ไขแล้ว" : "ยังไม่แก้ไข",
        formatDate(row.time)
      ];
    });
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
        filename: `รายงานข้อผิดพลาดยา_${currentDate}.pdf`,
        columns,
        rows,
        title: `รายงานข้อผิดพลาดยา ณ วันที่ ${currentDate}`,
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
        filename: `รายงานข้อผิดพลาดยา_${currentDate}.csv`,
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

  // Determine error status
  const getErrorStatus = (err) => {
    if (err.resolved) {
      return { status: "แก้ไขแล้ว", color: "bg-green-100 text-green-800", icon: CheckCircle };
    } else {
      return { status: "ยังไม่แก้ไข", color: "bg-red-100 text-red-800", icon: AlertTriangle };
    }
  };

  // Format date
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
    <div className="font-sarabun">
      <div className=" mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <Header
            header="รายงานข้อผิดพลาดยา"
            description="ตรวจสอบและจัดการข้อผิดพลาดที่เกี่ยวข้องกับยาในระบบ"
            icon={BarChart3}
          />
          <div className="flex gap-3 mt-4 lg:mt-0">
            <ExportButton
              onExport={tableToPDF}
              description="ดาวน์โหลด PDF"
              icon={FileText}
              color="red"
              isExporting={isExporting}
              disabled={isExporting}
            />
            <ExportButton
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
          <ReportFilter onFilterChange={applyFilter} />
          <div className="flex-1 flex flex-col lg:flex-row gap-4 items-center w-full">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ค้นหาด้วยรหัสข้อผิดพลาด, รหัสยา, ชื่อยา, ชื่อผู้ป่วย, ชื่อผู้รายงาน หรือคำอธิบาย..."
                value={searchTerm}
                onChange={handleSearchError}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
              />
            </div>
            <div className="relative min-w-[200px]">
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none"
              >
                <option value="all">สถานะ: ทั้งหมด</option>
                <option value="resolved">แก้ไขแล้ว</option>
                <option value="unresolved">ยังไม่แก้ไข</option>
              </select>
              <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <div className="relative min-w-[150px]">
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
          {filteredData.length === 0 && (searchTerm || startDate || filterSettings.days > 0 || filterSettings.month !== "0" || filterSettings.year !== "0" || statusFilter !== "all") ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">ไม่พบข้อมูลข้อผิดพลาดยา</p>
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
                          รหัสข้อผิดพลาด
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อยา</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อผู้ป่วย</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">คำอธิบาย</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">สถานะ</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ดูรายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredData.map((err, index) => {
                      const errorStatus = getErrorStatus(err);
                      const StatusIcon = errorStatus.icon;
                      const stock = Array.isArray(stockData) ? stockData.find(s => s.med_id === err.med_id) : null;
                      const patient = Array.isArray(patientData) ? patientData.find(p => p.patient_id === err.patient_id) : null;
                      const medShowname = stock ? stock.med_showname : "ไม่พบชื่อยา";
                      const patientName = patient ? `${patient.first_name} ${patient.last_name}` : "-";

                      return (
                        <tr
                          key={err.err_med_id}
                          className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                              </div>
                              {err.err_med_id}
                              </div>
                            </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{medShowname}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">{patientName}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">{err.description}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${errorStatus.color}`}>
                              <StatusIcon className="w-4 h-4 mr-1" />
                              {errorStatus.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setSelectedError(err)}
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

        {/* Error Detail Modal */}
        {selectedError && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">รายละเอียดข้อผิดพลาด</h2>
                      <p className="text-blue-100 text-sm">รหัสข้อผิดพลาด: {selectedError.err_med_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedError(null)}
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
                        { label: "รหัสข้อผิดพลาด", value: selectedError.err_med_id || "-", key: "err_med_id" },
                        { label: "รหัสยา", value: selectedError.med_id || "-", key: "med_id" },
                        { label: "รหัสยาในคลัง", value: selectedError.med_sid || "ไม่พบรหัสยา", key: "med_sid" },
                        { label: "ชื่อยา", value: Array.isArray(stockData) ? stockData.find(s => s.med_id === selectedError.med_id)?.med_showname || "ไม่พบชื่อยา" : "ไม่พบชื่อยา", key: "med_showname" },
                        { label: "ชื่อผู้ป่วย", value: Array.isArray(patientData) ? patientData.find(p => p.patient_id === selectedError.patient_id) ? `${patientData.find(p => p.patient_id === selectedError.patient_id).first_name} ${patientData.find(p => p.patient_id === selectedError.patient_id).last_name}` : "-" : "-", key: "patient_name" },
                        { label: "ชื่อผู้รายงาน", value: users[selectedError.doctor_id] ? `${users[selectedError.doctor_id].firstname} ${users[selectedError.doctor_id].lastname}` : "-", key: "reporter_name" },
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
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      สถานะและวันที่
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-xl p-4 border border-2 border-blue-100">
                        <div className="flex items-center gap-2 text-center">
                          <p className="text-sm text-gray-600 ">สถานะ</p>
                          <div className="">
                            {(() => {
                              const status = getErrorStatus(selectedError);
                              const StatusIcon = status.icon;
                              return (
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                  <StatusIcon className="w-4 h-4 " />
                                  {status.status}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">คำอธิบาย:</span>
                        <span className="font-medium text-gray-900">{selectedError.description || "-"}</span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          ข้อมูลวันที่
                        </h4>
                        <div className="space-y-2 text-sm">
                          {[
                            { label: "วันที่เกิด", value: <FormatDateTime dateString={selectedError.time}/>, key: "time" },
                            { label: "สร้าง", value: <FormatDateTime dateString={selectedError.created_at}/>, key: "created_at" },
                            { label: "อัพเดท", value: <FormatDateTime dateString={selectedError.updated_at}/>, key: "updated_at" },
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