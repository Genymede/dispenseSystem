"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Search,
  CalendarDays,
  User,
  Pill,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  RotateCcw,
  Eye,
  FileText,
  Table2,
  X
} from "lucide-react";
import Header from "@/app/component/Header";
import Swal from "sweetalert2";
import ReportFilter from "@/app/component/ReportFilter";
import exportPDF from "@/app/component/PDFexport";
import exportCSV from "@/app/component/CSVexport";
import ExportButton from "@/app/component/ExportButton";
import { FormatDate, FormatDateTime } from "@/app/component/formatDate";

const isClient = typeof window !== "undefined";
const host = isClient ? window.location.hostname : "localhost";

// Fetch functions
async function getDispenseHistory() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/patient/dispensehistory`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch dispense history");
  return res.json();
}

async function getMedicines() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch medicines");
  return res.json();
}

async function getAllerygy() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/allergy`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch medicines");
  return res.json();
}

async function getMedicineStock() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/stock`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch medicine stock");
  return res.json();
}

async function fetchUserById(userId) {
  try {
    const res = await fetch(`https://dispensesystem-production.up.railway.app/user/${userId}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch user ${userId}`);
    const data = await res.json();
    return data.user; // Extract the inner user object
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null; // Return null for failed fetches
  }
}

export default function DispenseHistoryPage() {
  const [dispenseHistory, setDispenseHistory] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [medicineStock, setMedicineStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0" });
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMedicines, setSelectedMedicines] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState({});
  const [patientAllergy, setPatientAllergy] = useState({});
  const [allergy, setAllergy] = useState([]);
  const [user, setUser] = useState({}); // Store users as { [user_id]: user }

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const [historyData, medicineData, stockData, allr] = await Promise.all([
          getDispenseHistory(),
          getMedicines(),
          getMedicineStock(),
          getAllerygy(),
        ]);
        setDispenseHistory(historyData || []);
        setMedicines(medicineData || []);
        setMedicineStock(stockData || []);
        setAllergy(allr || []);

        // Get unique user IDs from doctor_id and dispense_doc_id
        const userIds = new Set();
        historyData.forEach((item) => {
          if (item.doctor_id) userIds.add(item.doctor_id);
          if (item.dispense_doc_id) userIds.add(item.dispense_doc_id);
        });

        // Fetch user data for each unique ID
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
        setUser(userMap);

        if (userIds.size > 0 && userResults.every(({ userData }) => !userData)) {
          setError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองใหม่");
          Swal.fire({
            icon: "error",
            title: "ข้อผิดพลาด",
            text: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองใหม่",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#d33",
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่");
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#d33",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getDateOnly = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  };

  const getMedicineDetails = (medId, medSid) => {
    const medicine = medicines.find((m) => m.med_id === medId);
    const stock = medicineStock.find((s) => s.med_sid === medSid);
    return {
      name: medicine?.med_thai_name || medicine?.med_name || "-",
      nameEng: medicine?.med_name || "-",
      stockName: stock?.med_showname || "-",
      stockNameEng: stock?.med_showname_eng || "-",
      stockQuantity: stock?.med_quantity || 0,
      unit: medicine?.med_counting_unit || "-",
    };
  };

  const applyFilter = ({ days, month, year, startDate: filterStartDate }) => {
    setFilterSettings({ days, month, year });
    setStartDate(filterStartDate || "");
  };

  const normalizeThaiText = (text) => {
    if (!text) return "";
    return text
      .normalize("NFKD")
      .replace(/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g, "")
      .toLowerCase()
      .trim();
  };

  const filteredHistory = useMemo(() => {
    let filtered = dispenseHistory.filter((item) => {
      const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
      const hn = (item.hn_number || "").toLowerCase();
      const nationalId = (item.national_id || "").toLowerCase();
      const medicines = item.medicines || [];
      const medMatch = medicines.some((med) => {
        const medDetails = getMedicineDetails(med.med_id, med.med_sid);
        const normalizedTerm = normalizeThaiText(searchTerm);
        return (
          !searchTerm ||
          normalizeThaiText(medDetails.name).includes(normalizedTerm) ||
          normalizeThaiText(medDetails.nameEng).includes(normalizedTerm) ||
          normalizeThaiText(medDetails.stockName).includes(normalizedTerm) ||
          normalizeThaiText(medDetails.stockNameEng).includes(normalizedTerm)
        );
      });

      const patientMatch =
        !searchTerm ||
        normalizeThaiText(fullName).includes(normalizeThaiText(searchTerm)) ||
        hn.includes(searchTerm.toLowerCase()) ||
        nationalId.includes(searchTerm.toLowerCase());

      const itemDate = new Date(item.date);
      let dateFilterMatch = true;
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(startDate);
        end.setHours(23, 59, 59, 999);
        dateFilterMatch = itemDate >= start && itemDate <= end;
      } else if (filterSettings.days > 0) {
        const cutoff = new Date(Date.now() - filterSettings.days * 86400000);
        dateFilterMatch = itemDate >= cutoff;
      } else {
        if (filterSettings.month !== "0") {
          dateFilterMatch = dateFilterMatch && (itemDate.getMonth() + 1 === parseInt(filterSettings.month));
        }
        if (filterSettings.year !== "0") {
          dateFilterMatch = dateFilterMatch && (itemDate.getFullYear() === parseInt(filterSettings.year));
        }
      }

      return (patientMatch || (searchTerm && medMatch)) && dateFilterMatch;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        switch (sortConfig.key) {
          case "patient":
            aValue = `${a.first_name} ${a.last_name}`;
            bValue = `${b.first_name} ${b.last_name}`;
            break;
          case "date":
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case "description":
            aValue = a.description || "";
            bValue = b.description || "";
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
  }, [dispenseHistory, searchTerm, startDate, filterSettings, sortConfig]);

  const showMedicineDetails = (medicines) => {
    setSelectedMedicines(medicines);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setFilterSettings({ days: 0, month: "0", year: "0" });
    setCurrentPage(1);
  };

  const totalItems = filteredHistory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredHistory.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

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

  const prepareTableData = () => {
    const columns = [
      "ชื่อผู้ป่วย",
      "วันที่จ่ายยา",
      "ยาที่จ่าย",
      "จำนวน",
      "ชื่อผู้สั่งยา",
      "หมายเหตุ"
    ];
    const rows = filteredHistory.flatMap(item => {
      return (item.medicines || []).map(med => {
        const medDetails = getMedicineDetails(med.med_id, med.med_sid);
        const medicineName = medDetails.stockName && medDetails.stockName !== "-" ? medDetails.stockName : medDetails.name;
        const doctorName = item.doctor_id && user[item.doctor_id] 
          ? `${user[item.doctor_id].firstname || "-"} ${user[item.doctor_id].lastname || "-"}` 
          : "-";
        return [
          `${item.first_name} ${item.last_name}`,
          formatDate(item.date),
          medicineName,
          med.quantity || "-",
          doctorName,
          item.description || "-"
        ];
      });
    });
    return { columns, rows };
  };

  const tableToPDF = async () => {
    setIsExporting(true);
    try {
      const { columns, rows } = prepareTableData();
      await exportPDF({
        filename: `dispense_history_report_${new Date().toISOString().split("T")[0]}.pdf`,
        columns,
        rows,
        title: "รายงานประวัติการจ่ายยา",
        orientation: "landscape"
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

  const tableToCSV = () => {
    setIsExporting(true);
    try {
      const { columns, rows } = prepareTableData();
      exportCSV({
        filename: `dispense_history_report_${new Date().toISOString().split("T")[0]}.csv`,
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
          header="รายงานประวัติการจ่ายยา"
          description="แสดงประวัติการจ่ายยาให้กับผู้ป่วย"
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
      <div className="mt-6 mb-4 font-sarabun">
        <div className="flex flex-col gap-4">
          <ReportFilter onFilterChange={applyFilter} />
          <div className="flex-1 flex gap-4 items-center w-full">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ค้นหาผู้ป่วย (ชื่อ, HN, เลขบัตร) หรือยา (ชื่อ, ชื่อสามัญ, ชื่อภาษาอังกฤษ)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
          {currentItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">ไม่พบประวัติการจ่ายยา</p>
              <p className="text-gray-400">ลองเปลี่ยนเงื่อนไขการค้นหา</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <SortButton column="patient">
                      <User className="h-4 w-4 mr-2 inline-block" />
                      ผู้ป่วย
                    </SortButton>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <SortButton column="date">
                      <CalendarDays className="h-4 w-4 mr-2 inline-block" />
                      วันที่
                    </SortButton>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <SortButton column="description">
                      <Pill className="h-4 w-4 mr-2 inline-block" />
                      รายละเอียด
                    </SortButton>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    การกระทำ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item, index) => (
                  <tr
                    key={item.history_id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-xs">{startIndex + index + 1}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {item.first_name} {item.last_name}
                          </div>
                          <div className="text-sm text-gray-500">HN: {item.hn_number || "-"}</div>
                          <div className="text-xs text-gray-400">เลขบัตร: {item.national_id || "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(item.date)}</div>
                      <div className="text-xs text-gray-500">{item.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.description || "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          showMedicineDetails(item.medicines);
                          setSelectedPatient(item);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        ดูข้อมูล
                      </button>
                    </td>
                  </tr>
                ))}
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

      {/* Medicine Details Modal */}
      {selectedMedicines && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">รายละเอียดยาที่จ่าย</h2>
                    <p className="text-blue-100 text-sm">รายการยาทั้งหมด</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMedicines(null)}
                  className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="border-r border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                <User className="h-5 w-5 text-blue-600" />
                ข้อมูลพื้นฐาน
              </h3>
              <div className="grid grid-cols-2">
                <div className="pt-2">
                  {[
                    { label: "ชื่อ-นามสกุล", value: `${selectedPatient.first_name} ${selectedPatient.last_name}`, key: "name" },
                    { label: "HN", value: selectedPatient.hn_number || "-", key: "hn" },
                    { label: "เพศ", value: selectedPatient.gender || "-", key: "gender" },
                    { label: "เลขบัตรประชาชน", value: selectedPatient.national_id || "-", key: "national_id" },
                    { label: "วันเกิด", value: selectedPatient.birthday ? <FormatDate dateString={selectedPatient.birthday} /> : "-", key: "birthday" },
                  ].map((item) => (
                    <div key={`basic-info-${item.key}`} className="flex items-center justify-start gap-4">
                      <span className="text-sm text-gray-600">{item.label}:</span>
                      <span className="font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  {[
                    { label: "ผลการวินิจฉัย", value: selectedPatient.description || "-", key: "description" },
                    {
                      label: "ประวัติการแพ้ยา",
                      value: allergy && selectedPatient.patient_id
                        ? allergy
                            .filter((a) => a.patient_id === selectedPatient.patient_id)
                            .map((a) => medicines.find((e) => e.med_id === a.med_id)?.med_name || "-")
                            .join(", ") || "-"
                        : "-",
                      key: "allergy"
                    },
                    { label: "กรุ๊ปเลือด", value: selectedPatient.blood_group || "-", key: "blood_group" },
                  ].map((item) => (
                    <div key={`basic-info-${item.key}`} className="flex items-center justify-start gap-4">
                      <span className="text-sm text-gray-600">{item.label}:</span>
                      <span className="font-medium text-red-500">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 overflow-y-auto max-h-[calc(85vh-250px)]">
              <div className="flex items-center gap-4 pb-2 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Pill className="h-5 w-5 text-blue-600" />
                  รายการยาที่จ่าย
                </h3>
                <p className="text-gray-500">วันที่จ่าย {<FormatDate dateString={selectedPatient.date} />} เวลา {selectedPatient.time}</p>
              </div>
              <div className="flex items-center gap-2 relative text-sm py-2">
                <div className="flex items-center justify-start gap-2 pr-2 border-r border-gray-400">
                  <span className="text-sm text-gray-600">สั่งยาโดย:</span>
                  <span className="font-medium">{user[selectedPatient.doctor_id] ? `${user[selectedPatient.doctor_id].firstname} ${user[selectedPatient.doctor_id].lastname}` : "-"}</span>
                </div>
                <div className="flex items-center justify-start gap-2">
                  <span className="text-sm text-gray-600">จ่ายยาโดย:</span>
                  <span className="font-medium">{user[selectedPatient.dispense_doc_id] ? `${user[selectedPatient.dispense_doc_id].firstname} ${user[selectedPatient.dispense_doc_id].lastname}` : "-"}</span>
                </div>
              </div>
              <div className="relative">
                <table className="w-full border-collapse overflow-x-auto">
                  <thead>
                    <tr className="bg-gray-50 sticky top-0 z-10">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ยา</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อยา</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">จำนวน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedMedicines.map((med, index) => {
                      const medDetails = getMedicineDetails(med.med_id, med.med_sid);
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2 text-sm text-gray-900">{medDetails.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{medDetails.stockName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{med.quantity}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}