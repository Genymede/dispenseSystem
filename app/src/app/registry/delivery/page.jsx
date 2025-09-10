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
  X,
  AlertTriangle,
  Send,
  Stethoscope,
  Ambulance
} from "lucide-react";
import Header from "@/app/component/Header";
import Swal from "sweetalert2";
import ReportFilter from "@/app/component/ReportFilter";
import { FormatDate, FormatDateTime } from "@/app/component/formatDate";

const isClient = typeof window !== "undefined";
const host = isClient ? window.location.hostname : "localhost";

// Fetch functions
async function getDeliveryHistory() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/patient/med_delivery`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch delivery history");
  return res.json();
}

async function getMedicines() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch medicines");
  return res.json();
}

async function getMedicineStock() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/stock`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch medicine stock");
  return res.json();
}

async function getUserById(userId) {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/user/${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch user ${userId}`);
  return res.json();
}

export default function MedDeliveryHistoryPage() {
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [medicineStock, setMedicineStock] = useState([]);
  const [user, setUser] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0" });
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [selectedMedicines, setSelectedMedicines] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState({});
  const [doctorName, setDoctorName] = useState("-");
  const [showErrMedModal, setShowErrMedModal] = useState(false);
  const [showAdrModal, setShowAdrModal] = useState(false);
  const [selectedErrMed, setSelectedErrMed] = useState({});
  const [formErrMed, setFormErrMed] = useState({
    time: "",
    patient_id: "",
    doctor_id: "",
    med_id: "",
    med_sid: "",
    description: "",
  });
  const [formAdr, setFormAdr] = useState({
    med_id: "",
    patient_id: "",
    description: "",
    severity: "Mild",
    outcome: "Not Recovered",
    reporter_id: "0",
    notes: "",
    symptoms: "",
  });

  useEffect(() => {
    if (isClient) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser || {});
        } else {
          setError("ไม่พบข้อมูลผู้ใช้ใน localStorage");
          Swal.fire({
            icon: "warning",
            title: "คำเตือน",
            text: "ไม่พบข้อมูลผู้ใช้ใน localStorage กรุณาเข้าสู่ระบบใหม่",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#f7a834",
          });
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้จาก localStorage");
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้จาก localStorage",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#d33",
        });
      }
    }

    const loadData = async () => {
      try {
        setError(null);
        const results = await Promise.allSettled([
          getDeliveryHistory(),
          getMedicines(),
          getMedicineStock(),
        ]);

        const [historyResult, medicineResult, stockResult] = results;

        if (historyResult.status === "fulfilled") {
          setDeliveryHistory(historyResult.value || []);
        } else {
          console.error("Failed to load delivery history:", historyResult.reason);
        }

        if (medicineResult.status === "fulfilled") {
          setMedicines(medicineResult.value || []);
        } else {
          console.error("Failed to load medicines:", medicineResult.reason);
        }

        if (stockResult.status === "fulfilled") {
          setMedicineStock(stockResult.value || []);
        } else {
          console.error("Failed to load medicine stock:", stockResult.reason);
        }
      } catch (error) {
        console.error("Unexpected error loading data:", error);
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
    const medicine = medicines.find((m) => m.med_id === medId) || {};
    const stock = medicineStock.find((s) => s.med_sid === medSid) || {};
    return {
      name: medicine.med_thai_name || medicine.med_name || "-",
      nameEng: medicine.med_name || "-",
      stockName: stock.med_showname || "-",
      stockNameEng: stock.med_showname_eng || "-",
      stockQuantity: stock.med_quantity || 0,
      unit: medicine.med_counting_unit || "-",
      detail: medicine.med_dose_dialogue || "-",
      price: stock.unit_price || 0,
      marketing_name: medicine.med_marketing_name || "",
      generic_name: medicine.med_generic_name || "",
    };
  };

  const applyFilter = ({ days, month, year, startDate: filterStartDate }) => {
    setFilterSettings({ days, month, year });
    setStartDate(filterStartDate || "");
    setCurrentPage(1);
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
    if (!Array.isArray(deliveryHistory)) {
      console.warn("deliveryHistory is not an array:", deliveryHistory);
      return [];
    }

    let filtered = deliveryHistory.filter((item) => {
      const fullName = (item.patient_name || "").toLowerCase();
      const hnNum = (item.hn_number || "").toLowerCase();
      const nationalId = (item.national_id || "").toLowerCase();
      const medicines = item.medicine_list || [];
      const medMatch = medicines.some((med) => {
        const medDetails = getMedicineDetails(med.med_id, med.med_sid);
        const normalizedTerm = normalizeThaiText(searchTerm);
        return (
          !searchTerm ||
          normalizeThaiText(medDetails.name).includes(normalizedTerm) ||
          normalizeThaiText(medDetails.nameEng).includes(normalizedTerm) ||
          normalizeThaiText(medDetails.stockName).includes(normalizedTerm) ||
          normalizeThaiText(medDetails.stockNameEng).includes(normalizedTerm) ||
          normalizeThaiText(medDetails.marketing_name).includes(normalizedTerm) ||
          normalizeThaiText(medDetails.generic_name).includes(normalizedTerm)
        );
      });

      const patientMatch =
        !searchTerm ||
        normalizeThaiText(fullName).includes(normalizeThaiText(searchTerm)) ||
        hnNum.includes(searchTerm.toLowerCase()) ||
        nationalId.includes(searchTerm.toLowerCase());

      const itemDate = new Date(item.delivery_date);
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
            aValue = a.patient_name || "";
            bValue = b.patient_name || "";
            break;
          case "date":
            aValue = new Date(a.delivery_date);
            bValue = new Date(b.delivery_date);
            break;
          case "status":
            aValue = a.status || "";
            bValue = b.status || "";
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
  }, [deliveryHistory, searchTerm, startDate, filterSettings, sortConfig]);

  const showMedicineDetails = async (medicines, delivery) => {
    setSelectedMedicines(medicines || []);
    setSelectedDelivery(delivery || {});
    setDoctorName("-");

    try {
      if (delivery.doctor_id) {
        const doctorData = await getUserById(delivery.doctor_id);
        setDoctorName(`${doctorData.user.firstname || "-"} ${doctorData.user.lastname || "-"}`);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: `ไม่สามารถดึงข้อมูลผู้ใช้: ${error.message}`,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
    }
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
      return new Date(dateString).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formattime = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return "-";
    }
  };

  const handleErrMedReportSubmit = async () => {
    if (!formErrMed.description.trim()) {
      Swal.fire({
        icon: "warning",
        title: "คำเตือน",
        text: "กรุณาใส่รายละเอียดปัญหาที่พบ",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f7a834",
      });
      return;
    }
    try {
      const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/med_error`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formErrMed),
      });
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "ส่งรายงานปัญหายาเรียบร้อย",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#28a745",
        });
        setShowErrMedModal(false);
        setFormErrMed({
          time: "",
          patient_id: "",
          doctor_id: "",
          med_id: "",
          med_sid: "",
          description: "",
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "ส่งรายงานไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error submitting error medicine report:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: error.message || "เกิดข้อผิดพลาดในการส่งรายงาน",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleAdrReportSubmit = async () => {
    if (!formAdr.description.trim() || !formAdr.symptoms.trim()) {
      Swal.fire({
        icon: "warning",
        title: "คำเตือน",
        text: "กรุณาใส่รายละเอียดปัญหาและอาการที่พบ",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f7a834",
      });
      return;
    }
    try {
      const res = await fetch(`https://dispensesystem-production.up.railway.app/patient/adr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formAdr),
      });
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "ส่งรายงานยาไม่พึงประสงค์เรียบร้อย",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#28a745",
        });
        setShowAdrModal(false);
        setFormAdr({
          med_id: "",
          patient_id: "",
          description: "",
          severity: "Mild",
          outcome: "Not Recovered",
          reporter_id: "0",
          notes: "",
          symptoms: "",
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "ส่งรายงานไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error submitting ADR report:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: error.message || "เกิดข้อผิดพลาดในการส่งรายงาน",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
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
    <div className="mx-auto font-sarabun">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
        <Header
          header="ประวัติการจัดส่งยา"
          description="แสดงประวัติการจัดส่งยาให้กับผู้ป่วย"
          icon={Ambulance}
        />
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
                placeholder="ค้นหาผู้ป่วย (ชื่อ) หรือยา (ชื่อ, ชื่อสามัญ, ชื่อภาษาอังกฤษ)"
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
              <p className="text-gray-500 text-lg mb-2">ไม่พบประวัติการจัดส่งยา</p>
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
                    <SortButton column="status">
                      <Pill className="h-4 w-4 mr-2 inline-block" />
                      สถานะ
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
                    key={item.delivery_id || index}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-xs">{startIndex + index + 1}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {item.patient_name || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(item.delivery_date)}</div>
                      <div className="text-xs text-gray-500">{formattime(item.delivery_date)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === "pending" ? "text-yellow-600 bg-yellow-100" :
                        item.status === "delivering" ? "text-blue-600 bg-blue-100" :
                        "text-green-600 bg-green-100"
                      }`}>
                        {item.status === "pending" ? "รอดำเนินการ" :
                         item.status === "delivering" ? "กำลังจัดส่ง" : "จัดส่งแล้ว"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => showMedicineDetails(item.medicine_list, item)}
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
          <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">รายละเอียดยาที่จัดส่ง</h2>
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
                ข้อมูลการจัดส่ง
              </h3>
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3 pt-2">
                  {[
                    { label: "ชื่อผู้รับ", value: selectedDelivery.receiver_name || "-", key: "receiver_name" },
                    { label: "HN", value: selectedDelivery.hn_number || "-", key: "hn_number" },
                    { label: "เลขบัตรประชาชน", value: selectedDelivery.national_id || "-", key: "national_id" },
                    { label: "วันที่สั่งยา", value: formatDate(selectedDelivery.created_at) || "-", key: "order_date" },
                    { label: "วันที่จัดส่ง", value: formatDate(selectedDelivery.delivery_date) || "-", key: "delivery_date" },
                  ].map((item) => (
                    <div key={`basic-info-${item.key}`} className="flex items-center justify-start gap-4">
                      <span className="text-sm text-gray-600">{item.label}:</span>
                      <span className="font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="col-span-2 pt-2">
                  {[
                    { label: "วิธีจัดส่ง", value: selectedDelivery.delivery_method || "-", key: "delivery_method" },
                    { label: "หมายเหตุ", value: selectedDelivery.note || "-", key: "note" },
                    { label: "สถานะ", value: selectedDelivery.status === "pending" ? "รอดำเนินการ" : selectedDelivery.status === "delivering" ? "กำลังจัดส่ง" : "จัดส่งแล้ว", key: "status" },
                    { label: "เบอร์โทร", value: selectedDelivery.receiver_phone || "-", key: "receiver_phone" },
                    { label: "ที่อยู่", value: selectedDelivery.address || "-", key: "address" },
                  ].map((item) => (
                    <div key={`basic-info-${item.key}`} className="flex items-center justify-start gap-4">
                      <span className="text-sm text-gray-600">{item.label}:</span>
                      <span className="font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 overflow-y-auto max-h-[calc(85vh-250px)]">
              <div className="flex items-center gap-4 pb-2 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Pill className="h-5 w-5 text-blue-600" />
                  รายการยาที่จัดส่ง
                </h3>
                <p className="text-gray-500">วันที่จัดส่ง {formatDate(selectedDelivery.delivery_date)}</p>
              </div>
              <div className="flex items-center gap-2 relative text-sm py-2">
                <div className="flex items-center justify-start gap-2 pr-2">
                  <span className="text-sm text-gray-600">ผู้สั่งยา:</span>
                  <span className="font-medium">{doctorName}</span>
                </div>
              </div>
              <div className="relative">
                <table className="w-full border-collapse overflow-x-auto">
                  <thead>
                    <tr className="bg-gray-50 sticky top-0 z-10">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อยา</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">วิธีใช้</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">จำนวน</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ราคาต่อหน่วย (บาท)</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ราคารวม (บาท)</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">รายงาน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedMedicines.map((med, index) => {
                      const medDetails = getMedicineDetails(med.med_id, med.med_sid);
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2 text-sm text-gray-900">{medDetails.stockName === "-" ? medDetails.name : medDetails.stockName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{medDetails.detail}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{med.quantity} {medDetails.unit}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{medDetails.price}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{(med.quantity * medDetails.price).toFixed(2)}</td>
                          <td className="px-4 py-2 space-x-2">
                            <button
                              onClick={() => {
                                setShowErrMedModal(true);
                                setSelectedErrMed({
                                  ...med,
                                  med_showname: medDetails.stockName,
                                });
                                setFormErrMed({
                                  time: new Date().toLocaleString("th-TH", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }),
                                  patient_id: selectedDelivery.patient_id || "",
                                  doctor_id: user.user_id || "0",
                                  med_id: med.med_id,
                                  med_sid: med.med_sid,
                                  description: "",
                                });
                              }}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              รายงานปัญหายา
                            </button>
                            <button
                              onClick={() => {
                                setShowAdrModal(true);
                                setSelectedErrMed({
                                  ...med,
                                  med_showname: medDetails.stockName,
                                });
                                setFormAdr({
                                  med_id: med.med_id,
                                  patient_id: selectedDelivery.patient_id || "",
                                  description: "",
                                  severity: "Mild",
                                  outcome: "Not Recovered",
                                  reporter_id: user.user_id || "0",
                                  notes: "",
                                  symptoms: "",
                                });
                              }}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                            >
                              <Stethoscope className="w-3 h-3 mr-1" />
                              รายงาน ADR
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right text-xl font-semibold text-gray-900">
                ราคาสุทธิ:{" "}
                <span className="font-semibold text-gray-900">
                  {selectedMedicines.reduce((total, med) => {
                    const medDetails = getMedicineDetails(med.med_id, med.med_sid);
                    return total + med.quantity * medDetails.price;
                  }, 0).toFixed(2)}
                  {" "}บาท
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Medicine Report Modal */}
      {showErrMedModal && selectedErrMed && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-md">
            <div className="bg-red-600 rounded-t-2xl px-6 py-3 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                รายงานปัญหายา
              </h2>
              <button
                onClick={() => setShowErrMedModal(false)}
                className="p-2 text-red-200 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">ยา</p>
                    <p className="text-gray-900 font-semibold">
                      {selectedErrMed.med_showname || `ยา #${selectedErrMed.med_sid}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">จำนวน</p>
                    <p className="text-gray-900 font-semibold">{selectedErrMed.quantity}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียดปัญหา <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="อธิบายปัญหาที่พบ (เช่น ยาหมดอายุ, ยาเสียหาย)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none text-sm"
                  value={formErrMed.description}
                  onChange={(e) => setFormErrMed({ ...formErrMed, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowErrMedModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors font-medium text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleErrMedReportSubmit}
                  disabled={!formErrMed.description.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  ส่งรายงาน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADR Report Modal */}
      {showAdrModal && selectedErrMed && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-md">
            <div className="bg-orange-600 rounded-t-2xl px-6 py-3 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Stethoscope className="h-6 w-6" />
                รายงานอาการไม่พึงประสงค์จากการใช้ยา (ADR)
              </h2>
              <button
                onClick={() => setShowAdrModal(false)}
                className="p-2 text-orange-200 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">ยา</p>
                    <p className="text-gray-900 font-semibold">
                      {selectedErrMed.med_showname || `ยา #${selectedErrMed.med_sid}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">จำนวน</p>
                    <p className="text-gray-900 font-semibold">{selectedErrMed.quantity}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียดปัญหา <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="อธิบายปัญหาที่พบ (เช่น อาการแพ้, ผลข้างเคียง)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none text-sm"
                  value={formAdr.description}
                  onChange={(e) => setFormAdr({ ...formAdr, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อาการที่พบ <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="ระบุอาการที่พบ (เช่น ผื่น, คลื่นไส้)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none text-sm"
                  value={formAdr.symptoms}
                  onChange={(e) => setFormAdr({ ...formAdr, symptoms: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ความรุนแรง
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                  value={formAdr.severity}
                  onChange={(e) => setFormAdr({ ...formAdr, severity: e.target.value })}
                >
                  <option value="Mild">เล็กน้อย (Mild)</option>
                  <option value="Moderate">ปานกลาง (Moderate)</option>
                  <option value="Severe">รุนแรง (Severe)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ผลลัพธ์
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                  value={formAdr.outcome}
                  onChange={(e) => setFormAdr({ ...formAdr, outcome: e.target.value })}
                >
                  <option value="Not Recovered">ยังไม่หาย (Not Recovered)</option>
                  <option value="Recovered">หายแล้ว (Recovered)</option>
                  <option value="Recovering">กำลังหาย (Recovering)</option>
                  <option value="Unknown">ไม่ทราบ (Unknown)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเหตุ
                </label>
                <textarea
                  rows={3}
                  placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none text-sm"
                  value={formAdr.notes}
                  onChange={(e) => setFormAdr({ ...formAdr, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAdrModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors font-medium text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleAdrReportSubmit}
                  disabled={!formAdr.description.trim() || !formAdr.symptoms.trim()}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  ส่งรายงาน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}