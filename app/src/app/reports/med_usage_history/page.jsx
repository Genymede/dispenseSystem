"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Calendar,
  CheckCircle,
  AlertTriangle,
  X,
  FileText,
  Table2,
  BarChart3,
  Pill,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "@/app/component/Header";
import ReportFilter from "@/app/component/ReportFilter";
import ExportButton from "@/app/component/ExportButton";
import exportPDF from "@/app/component/PDFexport";
import exportCSV from "@/app/component/CSVexport";
import Swal from "sweetalert2";
import { FormatDate } from "@/app/component/formatDate";

const isClient = typeof window !== "undefined";
const host = isClient ? window.location.hostname : "localhost";

// API ดึงข้อมูล
async function getMedicationUsages() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/med_usage`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res.json();
}

async function getMedicines() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res.json();
}

async function getPatients() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/patient`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res.json();
}

export default function MedUsage() {
  const [allData, setAllData] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUsage, setSelectedUsage] = useState(null);

  // ดึงข้อมูลเมื่อ Component ถูก Render ครั้งแรก
  useEffect(() => {
    async function fetchAll() {
      try {
        setError(null);
        setLoading(true);
        const [usageData, medicineData, patientData] = await Promise.all([
          getMedicationUsages(),
          getMedicines(),
          getPatients(),
        ]);

        if (!Array.isArray(usageData)) {
          console.error("API response for med_usage is not an array:", usageData);
          setAllData([]);
          setError("ได้รับข้อมูลการใช้ยาไม่ถูกต้องจากเซิร์ฟเวอร์ กรุณาลองอีกครั้ง");
          return;
        }

        const validatedData = usageData.map((item, index) => ({
          ...item,
          usage_id: item.usage_id != null ? String(item.usage_id) : `fallback-${index}`,
          patient_id: item.patient_id ?? null,
          med_id: item.med_id ?? null,
          dosage: item.dosage ?? "-",
          frequency: item.frequency ?? "-",
          route: item.route ?? "-",
          usage_status: item.usage_status ?? "-",
          start_datetime: item.start_datetime ?? null,
          created_at: item.created_at ?? null,
          updated_at: item.updated_at ?? null,
        }));

        setAllData(validatedData);
        setMedicines(medicineData || []);
        setPatients(patientData || []);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        setAllData([]);
        setMedicines([]);
        setPatients([]);
        setError("ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อและลองอีกครั้ง");
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#d33",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // ฟังก์ชันช่วยเหลือ
  const getPatientName = (id) => {
    const p = patients.find((pt) => pt.patient_id === id);
    return p ? `${p.first_name || "-"} ${p.last_name || "-"}` : "-";
  };

  const getPatientHN = (id) => patients.find((pt) => pt.patient_id === id)?.hn_number || "-";

  const getPatientNationalId = (id) => patients.find((pt) => pt.patient_id === id)?.national_id || "-";

  const getMedName = (id) => medicines.find((m) => m.med_id === id)?.med_name || "-";

  const getDateOnly = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  };

  const normalizeThaiText = (text) => {
    if (!text) return "";
    return text
      .normalize("NFKD")
      .replace(/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g, "")
      .toLowerCase()
      .trim();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ongoing":
        return { status: "กำลังใช้", color: "bg-green-100 text-green-800", icon: CheckCircle };
      case "completed":
        return { status: "เสร็จสิ้น", color: "bg-blue-100 text-blue-800", icon: CheckCircle };
      case "stopped":
        return { status: "หยุดใช้", color: "bg-red-100 text-red-800", icon: AlertTriangle };
      default:
        return { status: "ไม่ระบุ", color: "bg-gray-100 text-gray-800", icon: X };
    }
  };

  // ฟังก์ชันจัดการการค้นหาและตัวกรอง
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleSearchDate = (e) => setSearchDate(e.target.value);
  const handleStatusFilter = (e) => setStatusFilter(e.target.value);
  const applyFilter = ({ days, month, year }) => {
    setFilterSettings({ days, month, year });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSearchDate("");
    setFilterSettings({ days: 0, month: "0", year: "0" });
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // ฟังก์ชันจัดการการเรียงลำดับ
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // ฟังก์ชันจัดการการแบ่งหน้า
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // กรองและเรียงลำดับข้อมูลด้วย useMemo
  const filteredData = useMemo(() => {
    let filtered = [...allData];

    // กรองตามวันที่
    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.start_datetime);
      let isMatch = true;

      if (searchDate) {
        const usageDate = item.start_datetime ? getDateOnly(item.start_datetime) : "";
        isMatch = usageDate === searchDate;
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
    });

    // กรองตามสถานะ
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.usage_status === statusFilter);
    }

    // กรองด้วยการค้นหา
    if (searchTerm.trim() !== "") {
      const searchLower = normalizeThaiText(searchTerm);
      filtered = filtered.filter((item) => {
        const patient = patients.find((pt) => pt.patient_id === item.patient_id);
        const medicine = medicines.find((m) => m.med_id === item.med_id);
        if (!patient || !medicine) return false;

        const patientFullName = normalizeThaiText(`${patient.first_name || ""} ${patient.last_name || ""}`);
        const hn = normalizeThaiText(patient.hn_number || "");
        const nationalId = normalizeThaiText(patient.national_id || "");
        const medName = normalizeThaiText(medicine.med_thai_name || "");
        const medNameTH = normalizeThaiText(medicine.med_name || "");

        return (
          patientFullName.includes(searchLower) ||
          hn.includes(searchLower) ||
          nationalId.includes(searchLower) ||
          medName.includes(searchLower) ||
          medNameTH.includes(searchLower)
        );
      });
    }

    // เรียงลำดับ
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        switch (sortConfig.key) {
          case "usage_id":
            aValue = a.usage_id;
            bValue = b.usage_id;
            break;
          case "patient":
            aValue = getPatientName(a.patient_id);
            bValue = getPatientName(b.patient_id);
            break;
          case "medicine":
            aValue = getMedName(a.med_id);
            bValue = getMedName(b.med_id);
            break;
          case "start_datetime":
            aValue = new Date(a.start_datetime);
            bValue = new Date(b.start_datetime);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [allData, searchTerm, searchDate, filterSettings, statusFilter, sortConfig, patients, medicines]);

  // คำนวณข้อมูลสำหรับการแบ่งหน้า
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ส่งออกเป็น PDF
  const tableToPDF = async () => {
    setIsExporting(true);
    try {
      const columns = [
        "รหัสการใช้ยา",
        "HN",
        "ชื่อผู้ป่วย",
        "ชื่อยา",
        "วันเริ่มใช้",
        "ขนาดยา",
        "ความถี่",
        "เส้นทางให้ยา",
        "สถานะ",
      ];
      const rows = filteredData.map((row) => [
        row.usage_id,
        getPatientHN(row.patient_id),
        getPatientName(row.patient_id),
        getMedName(row.med_id),
        formatDate(row.start_datetime),
        row.dosage,
        row.frequency,
        row.route,
        getStatusIcon(row.usage_status).status,
      ]);
      await exportPDF({
        filename: `med_usage_report_${new Date().toISOString().split("T")[0]}.pdf`,
        title: "รายงานการใช้ยา",
        columns,
        rows,
        orientation: "landscape",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setError("เกิดข้อผิดพลาดในการส่งออก PDF");
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการส่งออก PDF",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // ส่งออกเป็น CSV
  const tableToCSV = () => {
    setIsExporting(true);
    try {
      const columns = [
        "รหัสการใช้ยา",
        "HN",
        "ชื่อผู้ป่วย",
        "ชื่อยา",
        "วันเริ่มใช้",
        "ขนาดยา",
        "ความถี่",
        "เส้นทางให้ยา",
        "สถานะ",
      ];
      const rows = filteredData.map((row) => [
        row.usage_id,
        getPatientHN(row.patient_id),
        getPatientName(row.patient_id),
        getMedName(row.med_id),
        formatDate(row.start_datetime),
        row.dosage,
        row.frequency,
        row.route,
        getStatusIcon(row.usage_status).status,
      ]);
      exportCSV({
        filename: `med_usage_report_${new Date().toISOString().split("T")[0]}.csv`,
        columns,
        rows,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setError("เกิดข้อผิดพลาดในการส่งออก CSV");
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการส่งออก CSV",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // ปุ่มสำหรับการเรียงลำดับ
  const SortButton = ({ column, children }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
    >
      {children}
      {sortConfig.key === column ? (
        sortConfig.direction === "asc" ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )
      ) : (
        <div className="w-4 h-4" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto font-sarabun">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
        <Header
          header="รายงานการใช้ยา"
          description="ตรวจสอบและจัดการข้อมูลการใช้ยาในระบบ"
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
          <div className="flex-1 flex gap-4 items-center w-full">
            <div className="relative min-w-[200px]">
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none"
              >
                <option value="all">สถานะ: ทั้งหมด</option>
                <option value="ongoing">กำลังใช้</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="stopped">หยุดใช้</option>
              </select>
              <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <div className="relative min-w-[200px]">
              <input
                type="date"
                value={searchDate}
                onChange={handleSearchDate}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ค้นหาผู้ป่วย (ชื่อ, HN, เลขบัตร) หรือชื่อยา"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
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
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
          {currentItems.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">ไม่พบข้อมูลการใช้ยา</p>
              <p className="text-gray-400">ลองเปลี่ยนเงื่อนไขการค้นหา</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <SortButton column="usage_id">
                      <Pill className="mr-2 h-4 w-4 text-gray-500" />
                      รหัสการใช้ยา
                    </SortButton>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <SortButton column="patient">ชื่อผู้ป่วย</SortButton>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <SortButton column="medicine">ชื่อยา</SortButton>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <SortButton column="start_datetime">วันเริ่มใช้</SortButton>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ขนาดยา</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ความถี่</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">เส้นทางให้ยา</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">สถานะ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ดูรายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item, index) => {
                  const statusInfo = getStatusIcon(item.usage_status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr
                      key={item.usage_id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-xs">{startIndex + index + 1}</span>
                          </div>
                          {item.usage_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getPatientName(item.patient_id)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getMedName(item.med_id)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <FormatDate dateString={item.start_datetime} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.dosage}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.frequency}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.route}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusInfo.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedUsage(item)}
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
          )}
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>แสดง {startIndex + 1}-{Math.min(endIndex, totalItems)} จาก {totalItems} รายการ</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5 รายการ</option>
                <option value={10}>10 รายการ</option>
                <option value={20}>20 รายการ</option>
                <option value={50}>50 รายการ</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-xl transition-colors ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-600 px-3">
                หน้า {currentPage} จาก {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-xl transition-colors ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Usage Detail Modal */}
      {selectedUsage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">รายละเอียดการใช้ยา</h2>
                    <p className="text-blue-100 text-sm">รหัสการใช้ยา: {selectedUsage.usage_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUsage(null)}
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
                      { label: "รหัสการใช้ยา", value: selectedUsage.usage_id, key: "usage_id" },
                      { label: "HN", value: getPatientHN(selectedUsage.patient_id), key: "hn" },
                      { label: "ชื่อผู้ป่วย", value: getPatientName(selectedUsage.patient_id), key: "patient_name" },
                      { label: "เลขบัตรประชาชน", value: getPatientNationalId(selectedUsage.patient_id), key: "national_id" },
                      { label: "รหัสยา", value: selectedUsage.med_id || "-", key: "med_id" },
                      { label: "ชื่อยา", value: getMedName(selectedUsage.med_id), key: "med_name" },
                      { label: "ขนาดยา", value: selectedUsage.dosage, key: "dosage" },
                      { label: "ความถี่", value: selectedUsage.frequency, key: "frequency" },
                      { label: "เส้นทางให้ยา", value: selectedUsage.route, key: "route" },
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
                    <div className="flex items-center justify-start gap-2">
                      <p className="text-sm text-gray-600">สถานะ:</p>
                      <div>
                        {(() => {
                          const statusInfo = getStatusIcon(selectedUsage.usage_status);
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
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        ข้อมูลวันที่
                      </h4>
                      <div className="space-y-2 text-sm">
                        {[
                          { label: "วันเริ่มใช้", value: <FormatDate dateString={selectedUsage.start_datetime} />, key: "start_datetime" },
                          { label: "สร้าง", value: <FormatDate dateString={selectedUsage.created_at} />, key: "created_at" },
                          { label: "อัพเดท", value: <FormatDate dateString={selectedUsage.updated_at} />, key: "updated_at" },
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
  );
}