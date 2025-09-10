"use client";
import { useEffect, useState, useMemo } from "react";
import ReportFilter from "@/app/component/ReportFilter";
import exportPDF from "@/app/component/PDFexport";
import exportCSV from "@/app/component/CSVexport";
import ExportButton from "@/app/component/ExportButton";
import { FileText, Table2, BarChart3, Search, Package, AlertTriangle, CheckCircle, Eye, X, Calendar, CalendarDays } from "lucide-react";
import Header from "@/app/component/Header";
import { FormatDate, FormatDateTime } from "@/app/component/formatDate";

export default function AntibioticControlPage() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [patients, setPatients] = useState({});
  const [medNames, setMedNames] = useState({});
  const [users, setUsers] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0" });
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

  // Fetch data with individual error handling
  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);

        // Fetch rad_registry
        let radData = [];
        try {
          const radRes = await fetch(`https://dispensesystem-production.up.railway.app/reports/rad_registry`, { cache: "no-store" });
          if (!radRes.ok) {
            const errorText = await radRes.text().catch(() => "No error details available");
            throw new Error(`HTTP error fetching rad_registry! Status: ${radRes.status}, Details: ${errorText}`);
          }
          radData = await radRes.json();
          if (!Array.isArray(radData)) {
            console.error("rad_registry API response is not an array:", radData);
            radData = [];
            setError("ได้รับข้อมูล rad_registry ไม่ถูกต้องจากเซิร์ฟเวอร์");
          }
        } catch (err) {
          console.error("Error fetching rad_registry:", err);
          setError(`ไม่สามารถดึงข้อมูล rad_registry ได้: ${err.message}`);
          radData = [];
        }

        // Fetch patients
        let patientData = [];
        try {
          const patientRes = await fetch(`https://dispensesystem-production.up.railway.app/patient`, { cache: "no-store" });
          if (!patientRes.ok) throw new Error(`HTTP error fetching patients! Status: ${patientRes.status}`);
          patientData = await patientRes.json();
          if (!Array.isArray(patientData)) {
            console.warn("patient API response is not an array:", patientData);
            patientData = [];
          }
        } catch (err) {
          console.error("Error fetching patients:", err);
          patientData = [];
        }

        // Fetch medicines
        let medData = [];
        try {
          const medRes = await fetch(`https://dispensesystem-production.up.railway.app/medicine`, { cache: "no-store" });
          if (!medRes.ok) throw new Error(`HTTP error fetching medicines! Status: ${medRes.status}`);
          medData = await medRes.json();
          if (!Array.isArray(medData)) {
            console.warn("medicine API response is not an array:", medData);
            medData = [];
          }
        } catch (err) {
          console.error("Error fetching medicines:", err);
          medData = [];
        }

        // Fetch users based on accept_by from radData
        let userMap = {};
        if (radData.length > 0) {
          // Extract unique accept_by values
          const uniqueUserIds = [...new Set(radData.map(item => item.accept_by).filter(id => id && id !== "-"))];
          
          // Fetch user data for each unique user_id
          for (const userId of uniqueUserIds) {
            try {
              const userRes = await fetch(`https://dispensesystem-production.up.railway.app/user/${userId}`, { cache: "no-store" });
              if (!userRes.ok) {
                const errorText = await userRes.text().catch(() => "No error details available");
                throw new Error(`HTTP error fetching user/${userId}! Status: ${userRes.status}, Details: ${errorText}`);
              }
              const userData = await userRes.json();
              // Expecting userData to be an object with user_id, username, etc.
              if (userData && userData.user_id && userData.username) {
                userMap[userData.user_id] = userData.username || "-";
              } else {
                console.warn(`Invalid user data for user_id ${userId}:`, userData);
                userMap[userId] = "-";
              }
            } catch (err) {
              console.error(`Error fetching user/${userId}:`, err);
              userMap[userId] = "-";
            }
          }
        }
        setUsers(userMap);

        // Process rad_registry data
        if (radData.length > 0) {
          // Check for duplicate rad_id
          const radIds = radData.map(item => item.rad_id);
          const uniqueRadIds = new Set(radIds);
          if (uniqueRadIds.size !== radIds.length) {
            console.warn("พบ rad_id ที่ซ้ำกันในข้อมูล API:", radIds);
          }

          // Validate and add fallback rad_id
          const validatedData = radData.map((item, index) => ({
            ...item,
            rad_id: item.rad_id ?? `fallback-${index}`,
            med_id: item.med_id ?? "-",
            patient_id: item.patient_id ?? "-",
            accept_by: item.accept_by ?? "-"
          }));

          setAllData(validatedData);
          setFilteredData(validatedData);
        } else {
          setAllData([]);
          setFilteredData([]);
        }

        // Map patient data
        const patientMap = {};
        patientData.forEach(p => {
          patientMap[p.patient_id] = {
            hn: p.hn_number || "-",
            name: `${p.first_name || "-"} ${p.last_name || "-"}`.trim()
          };
        });
        setPatients(patientMap);

        // Map medicine data
        const medMap = {};
        medData.forEach(med => {
          medMap[med.med_id] = {
            thai: med.med_thai_name || `ID: ${med.med_id}`,
            english: med.med_name || `ID: ${med.med_id}`,
            display: med.med_thai_name || med.med_name || `ID: ${med.med_id}`
          };
        });
        setMedNames(medMap);

      } catch (error) {
        console.error("Unexpected error in fetchData:", error);
        setError("เกิดข้อผิดพลาดที่ไม่คาดคิดในการดึงข้อมูล");
      }
    }

    fetchData();
  }, []);

  // Filter function
  const applyFilter = ({ days, month, year, startDate: filterStartDate }) => {
    setFilterSettings({ days, month, year });
    setStartDate(filterStartDate || "");

    let filtered = [...allData];

    if (filterStartDate) {
      const start = new Date(filterStartDate);
      if (isNaN(start.getTime())) {
        setError("วันที่ไม่ถูกต้อง");
        setFilteredData([]);
        return;
      }
      start.setHours(0, 0, 0, 0);
      const end = new Date(filterStartDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        if (!item.submission_time) return false;
        const itemDate = new Date(item.submission_time);
        return itemDate >= start && itemDate <= end;
      });
    } else if (days > 0) {
      const cutoff = new Date(Date.now() - days * 86400000);
      filtered = filtered.filter(d => {
        if (!d.submission_time) return false;
        return new Date(d.submission_time) >= cutoff;
      });
    } else {
      if (month !== "0") {
        filtered = filtered.filter(d => {
          if (!d.submission_time) return false;
          return new Date(d.submission_time).getMonth() + 1 === parseInt(month);
        });
      }
      if (year !== "0") {
        filtered = filtered.filter(d => {
          if (!d.submission_time) return false;
          return new Date(d.submission_time).getFullYear() === parseInt(year);
        });
      }
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(item => {
        if (statusFilter === "approved") return item.acceptance;
        if (statusFilter === "rejected") return !item.acceptance;
        return true;
      });
    }

    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        String(patients[d.patient_id]?.hn || "").toLowerCase().includes(lowerTerm) ||
        String(patients[d.patient_id]?.name || "").toLowerCase().includes(lowerTerm) ||
        String(medNames[d.med_id]?.thai || "").toLowerCase().includes(lowerTerm) ||
        String(medNames[d.med_id]?.english || "").toLowerCase().includes(lowerTerm) ||
        String(d.rad_id || "").toString().includes(lowerTerm) ||
        String(d.specimen || "").toLowerCase().includes(lowerTerm) ||
        String(d.pathogenic || "").toLowerCase().includes(lowerTerm) ||
        String(d.indications || "").toLowerCase().includes(lowerTerm) ||
        String(d.indications_criteria || "").toLowerCase().includes(lowerTerm) ||
        String(d.description || "").toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredData(filtered);
  };

  // Handle search
  const handleSearch = (e) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return "-";
    }
  };

  // Prepare table data
  const prepareTableData = useMemo(() => {
    const columns = [
      "รหัส",
      "วันที่ส่งคำร้อง",
      "HN",
      "ชื่อผู้ป่วย",
      "ชื่อยา",
      "คำอธิบาย",
      "ตัวอย่าง",
      "เชื้อ",
      "ข้อบ่งใช้",
      "เกณฑ์ข้อบ่งใช้",
      "ผลอนุมัติ",
      "ผู้อนุมัติ",
      "วันที่อนุมัติ"
    ];
    const rows = filteredData.map(d => {
      const patient = patients[d.patient_id] || {};
      return [
        d.rad_id,
        formatDate (d.submission_time),
        patient.hn || "-",
        patient.name || "-",
        medNames[d.med_id]?.display || `ID: ${d.med_id}`,
        d.description || "-",
        d.specimen || "-",
        d.pathogenic || "-",
        d.indications || "-",
        d.indications_criteria || "-",
        d.acceptance ? "อนุมัติ" : "ไม่อนุมัติ",
        users[d.accept_by] || d.accept_by || "-",
        formatDate (d.acceptance_time)
      ];
    });
    return { columns, rows };
  }, [filteredData, patients, medNames, users]);

  // Export to PDF
  const tableToPDF = async () => {
    setIsExporting(true);
    try {
      const { columns, rows } = prepareTableData;
      const currentDate = new Date().toLocaleString('th-TH', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok'
      });
      await exportPDF({
        filename: `antibiotic_control_report_${currentDate}.pdf`,
        columns,
        rows,
        title: `รายงานยาปฏิชีวนะควบคุม ณ วันที่ ${currentDate}`,
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
      const { columns, rows } = prepareTableData;
      const currentDate = new Date().toLocaleString('th-TH', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok'
      });
      exportCSV({
        filename: `antibiotic_control_report_${currentDate}.csv`,
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

  // Determine acceptance status
  const getAcceptanceStatus = (item) => {
    if (item.acceptance) {
      return { status: "อนุมัติ", color: "bg-green-100 text-green-800", icon: CheckCircle };
    } else {
      return { status: "ไม่อนุมัติ", color: "bg-red-100 text-red-800", icon: AlertTriangle };
    }
  };

  return (
    <div className="font-sarabun">
      <div className=" mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <Header
            header="รายงานยาปฏิชีวนะควบคุม"
            description="ตรวจสอบและจัดการข้อมูลการขอใช้ยาปฏิชีวนะควบคุมในระบบ"
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
          <div className="flex flex-col gap-4">
            <ReportFilter onFilterChange={applyFilter} />
            <div className="flex-1 flex flex-col lg:flex-row gap-4 items-center w-full">
              <div className="relative min-w-[200px]">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none"
                >
                  <option value="all">สถานะ: ทั้งหมด</option>
                  <option value="approved">อนุมัติ</option>
                  <option value="rejected">ไม่อนุมัติ</option>
                </select>
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="ค้นหาด้วยรหัส, HN, ชื่อผู้ป่วย, ชื่อยา, คำอธิบาย, ตัวอย่าง, เชื้อ, หรือข้อบ่งใช้..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                />
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
        </div>

        {/* Table Section */}
        {filteredData.length === 0 && (searchTerm || startDate || filterSettings.days > 0 || filterSettings.month !== "0" || filterSettings.year !== "0" || statusFilter !== "all") ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">ไม่พบข้อมูลยาปฏิชีวนะควบคุม</p>
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
                        <Package className="mr-2 h-4 w-4 text-gray-500" />
                        รหัส
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">วันที่ส่งคำร้อง</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อผู้ป่วย</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อยา</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">เชื้อ</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ข้อบ่งใช้</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ผลอนุมัติ</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ดูรายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((item, index) => {
                    const status = getAcceptanceStatus(item);
                    const StatusIcon = status.icon;
                    const patient = patients[item.patient_id] || {};

                    return (
                      <tr
                        key={item.rad_id}
                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                            </div>
                            {item.rad_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600"><FormatDateTime dateString={item.submission_time} /></td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{patient.name || "-"}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{medNames[item.med_id]?.display || `ID: ${item.med_id}`}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{item.pathogenic || "-"}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{item.indications || "-"}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {status.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedRecord(item)}
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

        {/* Record Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">รายละเอียดยาปฏิชีวนะควบคุม</h2>
                      <p className="text-blue-100 text-sm">รหัส: {selectedRecord.rad_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1 border-r border-gray-300 pr-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      ข้อมูลพื้นฐาน
                    </h3>
                    <div className="space-y-1 py-4">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">รหัส:</span>
                        <span className="text-end font-medium text-gray-900">{selectedRecord.rad_id}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">รหัสยา:</span>
                        <span className="text-end font-medium text-gray-900">{selectedRecord.med_id || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">ชื่อยา:</span>
                        <span className="text-end font-medium text-gray-900">{medNames[selectedRecord.med_id]?.display || `ID: ${selectedRecord.med_id}`}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">คำอธิบาย:</span>
                        <span className="text-end font-medium text-gray-900">{selectedRecord.description || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">รหัสผู้ป่วย:</span>
                        <span className="text-end font-medium text-gray-900">{selectedRecord.patient_id || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">HN:</span>
                        <span className="text-end font-medium text-gray-900">{patients[selectedRecord.patient_id]?.hn || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">ชื่อผู้ป่วย:</span>
                        <span className="text-end font-medium text-gray-900">{patients[selectedRecord.patient_id]?.name || "-"}</span>
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
                        <p className="text-sm text-gray-600">ผลอนุมัติ:</p>
                        <div>
                          {(() => {
                            const status = getAcceptanceStatus(selectedRecord);
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
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">อนุมัติโดย:</span>
                        <span className="text-end font-medium text-gray-900">{users[selectedRecord.accept_by] || selectedRecord.accept_by || "-"}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600">ตัวอย่าง:</span>
                          <span className="font-medium text-gray-900">{selectedRecord.specimen || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600">เชื้อ:</span>
                          <span className="font-medium text-gray-900">{selectedRecord.pathogenic || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600">ข้อบ่งใช้:</span>
                          <span className="font-medium text-gray-900">{selectedRecord.indications || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600">เกณฑ์ข้อบ่งใช้:</span>
                          <span className="font-medium text-gray-900">{selectedRecord.indications_criteria || "-"}</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          ข้อมูลวันที่
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">วันที่ส่งคำร้อง:</span>
                            <span className="text-gray-900"><FormatDateTime dateString={selectedRecord.submission_time} /></span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">วันที่อนุมัติ:</span>
                            <span className="text-gray-900"><FormatDateTime dateString={selectedRecord.acceptance_time} /></span>
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