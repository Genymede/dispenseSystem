"use client";
import { useEffect, useState, useMemo } from "react";
import {
  TimerOff,
  Search,
  Calendar,
  User,
  Pill,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trash2,
  Clock,
  Package,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ClipboardList,
  X,
  Stethoscope
} from "lucide-react";
import Header from "@/app/component/Header";
import Swal from "sweetalert2";
import { FormatDate, FormatDateTime, FormatTime } from "@/app/component/formatDate";

const isClient = typeof window !== "undefined";
const host = isClient ? window.location.hostname : "localhost";

async function getOverdueMeds() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/overdue`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch overdue meds");
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

async function getPatients() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/patient`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
}

async function getUserById(userId) {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/user/${userId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch user ${userId}`);
  return res.json();
}

export default function OverdueMedPage() {
  const [overdues, setOverdues] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medStock, setMedStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isToggling, setIsToggling] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOverdue, setSelectedOverdue] = useState(null);
  const [doctorName, setDoctorName] = useState("-");

  useEffect(() => {
    const loadData = async () => {
      try {
        const results = await Promise.allSettled([
          getOverdueMeds(),
          getMedicines(),
          getPatients(),
          getMedicineStock()
        ]);

        const [overdueResult, medicineResult, patientResult, stockResult] = results;

        setOverdues(overdueResult.status === "fulfilled" && Array.isArray(overdueResult.value)
          ? overdueResult.value.map(item => ({
            ...item,
            dispense_status: item.dispense_status ?? false
          }))
          : []);
        setMedicines(medicineResult.status === "fulfilled" && Array.isArray(medicineResult.value) ? medicineResult.value : []);
        setPatients(patientResult.status === "fulfilled" && Array.isArray(patientResult.value) ? patientResult.value : []);
        setMedStock(stockResult.status === "fulfilled" && Array.isArray(stockResult.value) ? stockResult.value : []);

        const errors = results.filter(r => r.status === "rejected").map(r => r.reason.message);
        if (errors.length > 0) {
          console.error("Errors loading data:", errors);
          Swal.fire({
            icon: "error",
            title: "ข้อผิดพลาด",
            text: `ไม่สามารถโหลดข้อมูลบางส่วนได้: ${errors.join(", ")}`,
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#d33",
          });
        }
      } catch (error) {
        console.error("Unexpected error loading data:", error);
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

  const getMedName = (id) => medicines.find((m) => m.med_id === id)?.med_name || "-";
  const getMedThaiName = (id) => medicines.find((m) => m.med_id === id)?.med_thai_name || "-";
  const getMedicine = (id) => medicines.find((m) => m.med_id === id) || {};
  const getMedStock = (id) => medStock.find((m) => m.med_sid === id) || {};
  const getMedStockName = (id) => medStock.find((m) => m.med_sid === id)?.med_showname || "-";
  const getMedStockNameEN = (id) => medStock.find((m) => m.med_sid === id)?.med_showname_en || "-";

  const getPatientName = (id) => {
    const p = patients.find((pt) => pt.patient_id === id);
    return p ? `${p.first_name || ""} ${p.last_name || ""}`.trim() || "-" : "-";
  };

  const getPatientHN = (id) => patients.find((pt) => pt.patient_id === id)?.hn_number || "-";

  const getPatientNationalId = (id) => patients.find((pt) => pt.patient_id === id)?.national_id || "-";

  const getPatient = (id) => patients.find((pt) => pt.patient_id === id) || {};

  const toggleStatus = async (id) => {
    if (isToggling[id]) return;

    const target = overdues.find((item) => item.overdue_id === id);
    if (!target) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่พบรายการยาค้างจ่าย",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
      return;
    }

    // ตรวจสอบว่า dispense_status เป็น true หรือไม่
    if (target.dispense_status) {
      Swal.fire({
        icon: "warning",
        title: "ไม่สามารถเปลี่ยนสถานะ",
        text: `รายการ "${getMedName(target.med_id)}" สำหรับผู้ป่วย ${getPatientName(target.patient_id)} ได้รับการจ่ายยาไปแล้วและไม่สามารถเปลี่ยนสถานะซ้ำได้`,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
      return;
    }

    setIsToggling((prev) => ({ ...prev, [id]: true }));

    const newStatus = true; // ตั้งค่าเป็น true เสมอ เพราะอนุญาตให้เปลี่ยนเป็น "จ่ายแล้ว" เท่านั้น

    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการเปลี่ยนสถานะ",
      text: `คุณต้องการเปลี่ยนสถานะของรายการ "${getMedName(target.med_id)}" สำหรับผู้ป่วย ${getPatientName(target.patient_id)} เป็น จ่ายแล้ว ใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
    });

    if (!result.isConfirmed) {
      setIsToggling((prev) => ({ ...prev, [id]: false }));
      return;
    }

    try {
      const requestBody = { status: newStatus };
      const response = await fetch(`https://dispensesystem-production.up.railway.app/medicine/overdue/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Server responded with status ${response.status}: Failed to update status`;
        throw new Error(errorMessage);
      }

      const updatedItem = await response.json();
      setOverdues((prev) =>
        prev.map((item) =>
          item.overdue_id === id ? { ...item, dispense_status: updatedItem.dispense_status } : item
        )
      );

      if (selectedOverdue && selectedOverdue.overdue_id === id) {
        setSelectedOverdue((prev) => ({ ...prev, dispense_status: updatedItem.dispense_status }));
      }

      Swal.fire({
        icon: "success",
        title: "อัปเดตสถานะสำเร็จ",
        text: `สถานะของรายการ "${getMedName(target.med_id)}" เปลี่ยนเป็น จ่ายแล้ว เรียบร้อยแล้ว`,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#28a745",
      });
    } catch (error) {
      console.error("Error updating status:", error.message);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: error.message.includes("null value in column")
          ? "ไม่สามารถอัปเดตสถานะได้: ค่าสถานะไม่ถูกต้อง กรุณาตรวจสอบข้อมูลในระบบ"
          : error.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะ กรุณาลองใหม่",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsToggling((prev) => ({ ...prev, [id]: false }));
    }
  };

  const deleteOverdue = async (id) => {
    const target = overdues.find((item) => item.overdue_id === id);
    if (!target) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่พบรายการยาค้างจ่าย",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการ "${getMedName(target.med_id)}" ของผู้ป่วย ${getPatientName(target.patient_id)}?`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`https://dispensesystem-production.up.railway.app/medicine/overdue/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete overdue item");
      }
      setOverdues((prev) => prev.filter((item) => item.overdue_id !== id));
      if (selectedOverdue && selectedOverdue.overdue_id === id) {
        setShowDetailModal(false);
        setSelectedOverdue(null);
      }
      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        text: `รายการ "${getMedName(target.med_id)}" ถูกลบเรียบร้อยแล้ว`,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#28a745",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: error.message || "เกิดข้อผิดพลาดในการลบรายการ",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleViewDetail = async (overdue) => {
    setSelectedOverdue(overdue || {});
    setDoctorName("-");
    setShowDetailModal(true);

    try {
      if (overdue.doctor_id) {
        const doctorData = await getUserById(overdue.doctor_id);
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

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedOverdue(null);
    setDoctorName("-");
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const clearIndividualFilter = (type) => {
    switch (type) {
      case "search":
        setSearchTerm("");
        break;
      case "date":
        setSearchDate("");
        break;
      case "status":
        setStatusFilter("all");
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSearchDate("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending":
        return { text: "ค้างจ่าย", color: "bg-red-100 text-red-700", icon: Clock };
      case "completed":
        return { text: "จ่ายแล้ว", color: "bg-green-100 text-green-700", icon: CheckCircle };
      default:
        return { text: "ทุกสถานะ", color: "bg-gray-100 text-gray-600", icon: XCircle };
    }
  };

  const hasActiveFilters = searchTerm || searchDate || statusFilter !== "all";

  const filteredOverdues = useMemo(() => {
    if (!Array.isArray(overdues)) return [];

    let filtered = overdues.filter((item) => {
      const patient = getPatient(item.patient_id);
      const med = getMedicine(item.med_id);
      const stock = getMedStock(item.med_sid);

      const fullName = `${patient.first_name || ""} ${patient.last_name || ""}`.toLowerCase().trim();
      const hn = (patient.hn_number || "").toLowerCase();
      const nationalId = (patient.national_id || "").toLowerCase();
      const medName = (med.med_name || "").toLowerCase();
      const medGeneric = (med.med_generic_name || "").toLowerCase();
      const medThai = (med.med_thai_name || "").toLowerCase();
      const medShowname = (stock.med_showname || "").toLowerCase();
      const medShownameEn = (stock.med_showname_en || "").toLowerCase();

      const searchMatch =
        !searchTerm ||
        fullName.includes(searchTerm.toLowerCase()) ||
        hn.includes(searchTerm.toLowerCase()) ||
        nationalId.includes(searchTerm.toLowerCase()) ||
        medName.includes(searchTerm.toLowerCase()) ||
        medGeneric.includes(searchTerm.toLowerCase()) ||
        medThai.includes(searchTerm.toLowerCase()) ||
        medShowname.includes(searchTerm.toLowerCase()) ||
        medShownameEn.includes(searchTerm.toLowerCase());

      const dateMatch = !searchDate || getDateOnly(item.time) === searchDate;

      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "pending" && !item.dispense_status) ||
        (statusFilter === "completed" && item.dispense_status);

      return searchMatch && dateMatch && statusMatch;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        switch (sortConfig.key) {
          case "patient":
            aValue = getPatientName(a.patient_id);
            bValue = getPatientName(b.patient_id);
            break;
          case "medicine":
            aValue = getMedName(a.med_id);
            bValue = getMedName(b.med_id);
            break;
          case "date":
            aValue = new Date(a.time);
            bValue = new Date(b.time);
            break;
          case "status":
            aValue = a.dispense_status ? 1 : 0;
            bValue = b.dispense_status ? 1 : 0;
            break;
          case "days":
            aValue = Math.floor((new Date() - new Date(a.time)) / (1000 * 60 * 60 * 24));
            bValue = Math.floor((new Date() - new Date(b.time)) / (1000 * 60 * 60 * 24));
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
  }, [overdues, patients, medicines, medStock, searchTerm, searchDate, statusFilter, sortConfig]);

  const totalItems = filteredOverdues.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredOverdues.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
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
          header="ทะเบียนยาค้างจ่าย"
          description="ติดตามและจัดการยาที่ค้างจ่ายให้กับผู้ป่วย"
          icon={TimerOff}
        />
      </div>

      {/* Filters Section */}
      <div className="my-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-2">
          <div className="relative col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="ค้นหาผู้ป่วย (ชื่อ, HN, เลขบัตรประชาชน) หรือยา (ชื่อ, ชื่อสามัญ, ชื่อไทย)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
            />
          </div>
          <div className="relative col-span-1">
            <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          <div className="col-span-1">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-4 pr-8 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="pending">ค้างจ่าย</option>
                <option value="completed">จ่ายแล้ว</option>
              </select>
            </div>
          </div>
          <div className="flex col-span-1">
            <button
              onClick={clearFilters}
              className="w-full flex items-center px-4 py-2 bg-red-200 text-red-800 rounded-xl hover:bg-red-300 transition-all duration-200 text-sm font-medium"
            >
              <RotateCcw className="h-4 w-4" />
              <p>ล้างตัวกรอง</p>
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
              <p className="text-gray-500 text-lg mb-2">ไม่พบรายการยาค้างจ่าย</p>
              <p className="text-gray-400">ลองเปลี่ยนเงื่อนไขการค้นหา</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 max-w-[10vh]">
                    <SortButton column="patient">
                      <User className="h-4 w-4 mr-2 inline-block" />
                      ผู้ป่วย
                    </SortButton>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 max-w-[20vh]">
                    <SortButton column="medicine">
                      <Pill className="h-4 w-4 mr-2 inline-block" />
                      ยา
                    </SortButton>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 max-w-[5vh]">
                    <SortButton column="date">
                      <Calendar className="h-4 w-4 mr-2 inline-block" />
                      วันที่ค้าง
                    </SortButton>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200 max-w-[5vh]">
                    <SortButton column="days">
                      <Clock className="h-4 w-4 mr-2 inline-block" />
                      จำนวนวันค้าง
                    </SortButton>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <SortButton column="status">
                      <CheckCircle className="h-4 w-4 mr-2 inline-block" />
                      สถานะ
                    </SortButton>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 max-w-[10vh]">
                    <Pill className="h-4 w-4 mr-2 inline-block" />
                    จำนวนค้าง
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item, index) => {
                  const patient = getPatient(item.patient_id);
                  const medicine = getMedicine(item.med_id);
                  const stockMed = getMedStockName(item.med_sid);
                  const daysPassed = Math.floor((new Date() - new Date(item.time)) / (1000 * 60 * 60 * 24));
                  return (
                    <tr
                      key={item.overdue_id || index}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-xs">{startIndex + index + 1}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 max-w-[15vh]">
                              {patient.first_name || ""} {patient.last_name || ""}
                            </div>
                            <div className="text-sm text-gray-500">HN: {patient.hn_number || "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 max-w-[10vh] truncate">
                        <div>
                          <div className="font-semibold text-gray-900">{stockMed}</div>
                          <div className="text-sm text-gray-500">{medicine.med_thai_name || "-"}</div>
                          <div className="text-xs text-gray-400">รหัส: {medicine.med_id || "-"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900"><FormatDate dateString={item.time} /></div>
                        <div className="text-sm text-gray-500"><FormatTime dateString={item.time} /></div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${daysPassed > 7
                              ? "bg-red-100 text-red-700"
                              : daysPassed > 3
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                        >
                          <Clock size={12} />
                          {daysPassed} วัน
                          {daysPassed > 7 && " 🚨"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${item.dispense_status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                        >
                          {item.dispense_status ? (
                            <>
                              <CheckCircle size={14} />
                              จ่ายแล้ว
                            </>
                          ) : (
                            <>
                              <Clock size={14} />
                              ค้างจ่าย
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[10vh] truncate">
                        <div>
                          <div className="text-gray-900">{item.quantity || 0}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition-colors"
                            onClick={() => handleViewDetail(item)}
                            aria-label="ดูรายละเอียด"
                          >
                            <ClipboardList size={14} />
                            ดู
                          </button>
                          <button
                            disabled={isToggling[item.overdue_id] || item.dispense_status}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                              item.dispense_status
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            } ${isToggling[item.overdue_id] ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => toggleStatus(item.overdue_id)}
                          >
                            <RotateCcw size={14} />
                            จ่ายแล้ว
                          </button>
                          <button
                            className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors"
                            onClick={() => deleteOverdue(item.overdue_id)}
                          >
                            <Trash2 size={14} />
                            ลบ
                          </button>
                        </div>
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

      {/* Detail Modal */}
      {showDetailModal && selectedOverdue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">รายละเอียดยาค้างจ่าย</h2>
                    <p className="text-blue-100 text-sm">รหัสยาค้างจ่าย: {selectedOverdue.overdue_id || "-"}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
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
                    <User className="h-5 w-5 text-blue-600" />
                    ข้อมูลผู้ป่วยและยา
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "รหัสยาค้างจ่าย", value: selectedOverdue.overdue_id || "-", key: "overdue_id" },
                      { label: "ผู้ป่วย", value: getPatientName(selectedOverdue.patient_id), key: "patient_name" },
                      { label: "HN", value: getPatientHN(selectedOverdue.patient_id), key: "hn" },
                      { label: "เลขบัตรประชาชน", value: getPatientNationalId(selectedOverdue.patient_id), key: "national_id" },
                      { label: "ผู้สั่งยา", value: doctorName, key: "doctor_name"},
                      {
                        label: "ยา", value: `${getMedName(selectedOverdue.med_id)} (ID: ${selectedOverdue.med_id || "-"})`, key: "med_name"
                      },
                      { label: "ชื่อยาภาษาไทย", value: getMedStockName(selectedOverdue.med_sid), key: "med_showname" },
                    ].map((item) => (
                      <div key={`basic-info-${item.key}`} className="flex justify-between py-2 items-center">
                        <div className="flex items-center gap-2">
                          {item.icon && <item.icon className="h-4 w-4 text-gray-600" />}
                          <span className="text-sm text-gray-600">{item.label}:</span>
                        </div>
                        <span className="font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 pl-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Pill className="h-5 w-5 text-blue-600" />
                    ข้อมูลยาค้างจ่าย
                  </h3>
                  <div className="space-y-3">
                    <div className="rounded-xl p-4 border-2 border-blue-200">
                      <div className="flex items-center gap-2 text-center">
                        <p className="text-sm text-gray-600">สถานะ</p>
                        <div>
                          {(() => {
                            const status = getStatusDisplay(selectedOverdue.dispense_status ? "completed" : "pending");
                            const StatusIcon = status.icon;
                            return (
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                <StatusIcon className="w-4 h-4 mr-1" />
                                {status.text}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    {[
                      { label: "วันที่ค้าง", value: selectedOverdue.time ? <FormatDateTime dateString={selectedOverdue.time} /> : "-", key: "time" },
                      { label: "จำนวนวันค้าง", value: Math.floor((new Date() - new Date(selectedOverdue.time)) / (1000 * 60 * 60 * 24)) + " วัน", key: "days_passed" },
                      { label: "จำนวนค้าง", value: selectedOverdue.quantity || 0, key: "quantity" },
                    ].map((item) => (
                      <div key={`usage-info-${item.key}`} className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">{item.label}:</span>
                        <span className="font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}