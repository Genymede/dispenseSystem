"use client";

import { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import {
  Search,
  RotateCcw,
  Loader2,
  ClipboardList,
  User,
  Pill,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import Header from "@/app/component/Header";
import { FormatDateTime } from "@/app/component/formatDate";

const isClient = typeof window !== "undefined";
const host = isClient ? window.location.hostname : "localhost";

async function getMedicationProblems() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/problems`, { cache: "no-store" });
  //if (!res.ok) throw new Error("Failed to fetch medication problems");
  console.log("res",res)
  return res.json();
}

async function getMedicines() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch medicines");
  return res.json();
}

async function getPatients() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/patient`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
}

export default function MedProblems() {
  const [problems, setProblems] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchPatientInput, setSearchPatientInput] = useState("");
  const [searchMedicineInput, setSearchMedicineInput] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [form, setForm] = useState({
    med_id: "",
    description: "",
    usage_id: "",
    problem_type: "",
    reported_by: "",
    reported_at: "",
    is_resolved: false,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [problemData, medicineData, patientData] = await Promise.all([
        getMedicationProblems(),
        getMedicines(),
        getPatients(),
      ]);
      setProblems(Array.isArray(problemData) ? problemData : []);
      setMedicines(Array.isArray(medicineData) ? medicineData : []);
      setPatients(Array.isArray(patientData) ? patientData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
  console.log("problem", problems);
}, [problems]);


  const getPatientName = (id) => {
    const p = patients.find((pt) => pt.patient_id === id);
    return p ? `${p.first_name} ${p.last_name}` : "-";
  };

  const getPatientHN = (id) => patients.find((pt) => pt.patient_id === id)?.hn_number || "-";

  const getPatientNationalId = (id) => {
    const patient = patients.find((pt) => pt.patient_id === id);
    return patient?.national_id || "-";
  };

  const getMedName = (id) => medicines.find((m) => m.med_id === id)?.med_name || "-";

  const getMedThaiName = (id) => medicines.find((m) => m.med_id === id)?.med_thai_name || "-";

  const getDateOnly = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  };

  const getStatusDisplay = (isResolved) => {
    return isResolved
      ? {
          text: "แก้ไขแล้ว",
          color: "bg-green-100 text-green-700",
          dotColor: "bg-green-500",
          icon: CheckCircle,
        }
      : {
          text: "ยังไม่แก้ไข",
          color: "bg-red-100 text-red-700",
          dotColor: "bg-red-500",
          icon: XCircle,
        };
  };

  const handleSearchPatient = (e) => {
    const value = e.target.value;
    setSearchPatientInput(value);
    setFilteredPatients(
      value.trim() === ""
        ? []
        : patients.filter(
            (p) =>
              `${p.first_name} ${p.last_name}`.toLowerCase().includes(value.toLowerCase()) ||
              p.hn_number?.toLowerCase().includes(value.toLowerCase()) ||
              p.national_id?.toLowerCase().includes(value.toLowerCase())
          )
    );
  };

  const handleSearchMedicine = (e) => {
    const value = e.target.value;
    setSearchMedicineInput(value);
    if (value.trim() === "") {
      setFilteredMedicines([]);
      return;
    }
    const lowercasedValue = value.toLowerCase();
    const filtered = medicines.filter((m) => {
      const nameMatch = m.med_name.toLowerCase().includes(lowercasedValue);
      const thaiNameMatch = m.med_thai_name && m.med_thai_name.toLowerCase().includes(lowercasedValue);
      return nameMatch || thaiNameMatch;
    });
    setFilteredMedicines(filtered);
  };

  const handleViewDetail = (problem) => {
    setSelectedProblem(problem);
    setShowDetailModal(true);
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setForm({
      med_id: "",
      description: "",
      usage_id: "",
      problem_type: "",
      reported_by: "",
      reported_at: "",
      is_resolved: false,
    });
    setSearchPatientInput("");
    setSearchMedicineInput("");
    setFilteredPatients([]);
    setFilteredMedicines([]);
    setShowEditModal(true);
  };

  const handleEdit = (problem) => {
    setIsEditing(true);
    setSelectedProblem(problem);
    const patient = patients.find((p) => p.patient_id === problem.reported_by);
    const medicine = medicines.find((m) => m.med_id === problem.med_id);
    setForm({
      med_id: problem.med_id || "",
      description: problem.description || "",
      usage_id: problem.usage_id || "",
      problem_type: problem.problem_type || "",
      reported_by: problem.reported_by || "",
      reported_at: problem.reported_at ? getDateOnly(problem.reported_at) : "",
      is_resolved: problem.is_resolved || false,
    });
    setSearchPatientInput(patient ? `${patient.first_name} ${patient.last_name}` : "");
    setSearchMedicineInput(medicine ? medicine.med_name : "");
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.med_id || !form.description || !form.usage_id || !form.problem_type || !form.reported_by || !form.reported_at) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "กรุณากรอกข้อมูลที่จำเป็นทั้งหมด (ยา, คำอธิบาย, รหัสการใช้ยา, ประเภทปัญหา, ผู้รายงาน, วันที่รายงาน)",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `https://dispensesystem-production.up.railway.app/medicine/problems/${selectedProblem.mp_id}`
      : `https://dispensesystem-production.up.railway.app/medicine/problems`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          reported_at: new Date(form.reported_at).toISOString(),
          is_resolved: form.is_resolved,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = isEditing
          ? problems.map((p) => (p.mp_id === data.mp_id ? data : p))
          : [...problems, data];
        setProblems(updated);
        Swal.fire({
          icon: "success",
          title: isEditing ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ",
          text: `ข้อมูลปัญหาการใช้ยาได้รับการ${isEditing ? "แก้ไข" : "เพิ่ม"}เรียบร้อย`,
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#28a745",
        });
        closeModal();
      } else {
        const errorText = await res.text();
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: `ไม่สามารถบันทึกข้อมูลได้: ${errorText}`,
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error saving problem:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleDelete = async (mpId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบข้อมูลปัญหาการใช้ยานี้หรือไม่?",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/problems/${mpId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "ลบสำเร็จ",
          text: "ข้อมูลถูกลบเรียบร้อยแล้ว",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#28a745",
        });
        setProblems(problems.filter((p) => p.mp_id !== mpId));
      } else {
        const errorText = await res.text();
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: `ไม่สามารถลบข้อมูลได้: ${errorText}`,
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error deleting problem:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการลบข้อมูล",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
    }
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setShowEditModal(false);
    setSelectedProblem(null);
    setSearchPatientInput("");
    setSearchMedicineInput("");
    setFilteredPatients([]);
    setFilteredMedicines([]);
  };

  const filteredProblems = useMemo(() => {
    return problems.filter((item) => {
      const patient = patients.find((pt) => pt.patient_id === item.reported_by);
      const medicine = medicines.find((m) => m.med_id === item.med_id);
      if (!patient || !medicine) return false;

      const patientFullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      const hn = (patient.hn_number || "").toLowerCase();
      const nationalId = (patient.national_id || "").toLowerCase();
      const medName = (medicine.med_name || "").toLowerCase();
      const medThaiName = (medicine.med_thai_name || "").toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const problemDate = item.reported_at ? getDateOnly(item.reported_at) : "";

      const matchesSearch =
        !searchTerm ||
        patientFullName.includes(searchLower) ||
        hn.includes(searchLower) ||
        nationalId.includes(searchLower) ||
        medName.includes(searchLower) ||
        medThaiName.includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.problem_type.toLowerCase().includes(searchLower);

      const matchesDate = !searchDate || problemDate === searchDate;
      const matchesStatus = selectedStatus === "" || item.is_resolved === (selectedStatus === "resolved");

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [problems, patients, medicines, searchTerm, searchDate, selectedStatus]);

  const totalItems = filteredProblems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredProblems.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSearchDate("");
    setSelectedStatus("");
    setCurrentPage(1);
  };

  const clearIndividualFilter = (filterType) => {
    switch (filterType) {
      case "search":
        setSearchTerm("");
        break;
      case "date":
        setSearchDate("");
        break;
      case "status":
        setSelectedStatus("");
        break;
    }
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || searchDate || selectedStatus;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
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
          header="ทะเบียนปัญหาการใช้ยา"
          description="จัดการและติดตามปัญหาการใช้ยาของผู้ป่วย"
          icon={ClipboardList}
        />
      </div>

      {/* Filters Section */}
      <div className="my-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          <div className="relative col-span-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="ค้นหาผู้ป่วย, ยา, คำอธิบาย, หรือประเภทปัญหา"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
            />
          </div>
          <div className="relative col-span-1">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          <div className="flex gap-2 col-span-1">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 pl-4 pr-8 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            >
              <option value="">ทุกสถานะ</option>
              <option value="resolved">แก้ไขแล้ว</option>
              <option value="unresolved">ยังไม่แก้ไข</option>
            </select>
          </div>
          <div className="flex gap-2 col-span-1">
            <button
              onClick={handleAddNew}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              เพิ่มปัญหาการใช้ยา
            </button>
            <button
              onClick={clearFilters}
              className="flex items-center px-4 py-2 bg-red-200 text-red-800 rounded-xl hover:bg-red-300 transition-all duration-200 text-sm font-medium"
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
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">ไม่พบรายการปัญหาการใช้ยา</p>
              <p className="text-gray-400">ลองปรับเปลี่ยนเงื่อนไขการค้นหา</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      ผู้ป่วย
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center">
                      <Pill className="h-4 w-4 mr-2" />
                      ยา
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      ประเภทปัญหา
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      วันที่รายงาน
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      สถานะ
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center justify-center">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      การดำเนินการ
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item, index) => {
                  const patient = patients.find((pt) => pt.patient_id === item.reported_by);
                  const medicine = medicines.find((m) => m.med_id === item.med_id);
                  const statusInfo = getStatusDisplay(item.is_resolved);

                  return (
                    <tr key={item.mp_id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {patient ? `${patient.first_name} ${patient.last_name}` : "-"}
                            </div>
                            <div className="text-sm text-gray-500">HN: {getPatientHN(item.reported_by)}</div>
                            <div className="text-xs text-gray-400">
                              เลขบัตร: {getPatientNationalId(item.reported_by)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{medicine?.med_name || "-"}</div>
                          {medicine?.med_thai_name && (
                            <div className="text-sm text-gray-500">{medicine.med_thai_name}</div>
                          )}
                          <div className="text-xs text-gray-400">รหัส: {medicine?.med_id || "-"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{item.problem_type || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <FormatDateTime dateString={item.reported_at} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          <div className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`}></div>
                          {statusInfo.text}
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
                            className="flex items-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg text-xs font-medium transition-colors"
                            onClick={() => handleEdit(item)}
                            aria-label="แก้ไข"
                          >
                            <ClipboardList size={14} />
                            แก้ไข
                          </button>
                          <button
                            className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors"
                            onClick={() => handleDelete(item.mp_id)}
                            aria-label="ลบ"
                          >
                            <XCircle size={14} />
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
      {showDetailModal && selectedProblem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">รายละเอียดปัญหาการใช้ยา</h2>
                    <p className="text-blue-100 text-sm">รหัสปัญหา: {selectedProblem.mp_id || "-"}</p>
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
                      { label: "รหัสปัญหา", value: selectedProblem.mp_id || "-", key: "mp_id" },
                      { label: "ผู้รายงาน", value: getPatientName(selectedProblem.reported_by), key: "patient_name" },
                      { label: "HN", value: getPatientHN(selectedProblem.reported_by), key: "hn" },
                      { label: "เลขบัตรประชาชน", value: getPatientNationalId(selectedProblem.reported_by), key: "national_id" },
                      { label: "ยา", value: `${getMedName(selectedProblem.med_id)} (ID: ${selectedProblem.med_id || "-"})`, key: "med_name" },
                      { label: "ชื่อยาภาษาไทย", value: getMedThaiName(selectedProblem.med_id), key: "med_thai_name" },
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
                    <Pill className="h-5 w-5 text-blue-600" />
                    ข้อมูลปัญหาการใช้ยา
                  </h3>
                  <div className="space-y-3">
                    <div className="rounded-xl p-4 border-2 border-blue-200">
                      <div className="flex items-center gap-2 text-center">
                        <p className="text-sm text-gray-600">สถานะ</p>
                        <div className="">
                          {(() => {
                            const status = getStatusDisplay(selectedProblem.is_resolved);
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
                      { label: "รหัสการใช้ยา", value: selectedProblem.usage_id || "-", key: "usage_id" },
                      { label: "ประเภทปัญหา", value: selectedProblem.problem_type || "-", key: "problem_type" },
                      { label: "คำอธิบาย", value: selectedProblem.description || "-", key: "description" },
                      { label: "วันที่รายงาน", value: selectedProblem.reported_at ? <FormatDateTime dateString={selectedProblem.reported_at} /> : "-", key: "reported_at" },
                    ].map((item) => (
                      <div key={`problem-info-${item.key}`} className="flex justify-between py-2">
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

      {/* Edit/Add Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl" onSubmit={handleSubmit}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {isEditing ? "แก้ไขปัญหาการใช้ยา" : "เพิ่มปัญหาการใช้ยาใหม่"}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {isEditing ? `รหัสปัญหา: ${selectedProblem?.mp_id || "-"}` : "กรอกข้อมูลเพื่อเพิ่มปัญหาการใช้ยาใหม่"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    ข้อมูลผู้ป่วยและยา
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ผู้รายงาน <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          value={searchPatientInput}
                          onChange={handleSearchPatient}
                          placeholder="ค้นหาผู้ป่วย..."
                          required
                        />
                        {filteredPatients.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {filteredPatients.map((p) => (
                              <div
                                key={p.patient_id}
                                className="cursor-pointer hover:bg-gray-100 p-3 border-b border-gray-100 last:border-b-0 text-sm"
                                onClick={() => {
                                  setForm({ ...form, reported_by: p.patient_id });
                                  setSearchPatientInput(`${p.first_name} ${p.last_name}`);
                                  setFilteredPatients([]);
                                }}
                              >
                                {p.first_name} {p.last_name} (HN: {p.hn_number || "-"}) (ID: {p.patient_id})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ยา <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          value={searchMedicineInput}
                          onChange={handleSearchMedicine}
                          placeholder="ค้นหายา..."
                          required
                        />
                        {filteredMedicines.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {filteredMedicines.map((m) => (
                              <div
                                key={m.med_id}
                                className="cursor-pointer hover:bg-gray-100 p-3 border-b border-gray-100 last:border-b-0 text-sm"
                                onClick={() => {
                                  setForm({ ...form, med_id: m.med_id });
                                  setSearchMedicineInput(m.med_name);
                                  setFilteredMedicines([]);
                                }}
                              >
                                {m.med_name} {m.med_thai_name ? `(${m.med_thai_name})` : ""} (ID: {m.med_id})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        รหัสการใช้ยา <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={form.usage_id}
                        onChange={(e) => setForm({ ...form, usage_id: e.target.value })}
                        placeholder="เช่น 1"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Pill className="h-5 w-5 text-blue-600" />
                    ข้อมูลปัญหาการใช้ยา
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ประเภทปัญหา <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        value={form.problem_type}
                        onChange={(e) => setForm({ ...form, problem_type: e.target.value })}
                        required
                      >
                        <option value="">-- เลือกประเภทปัญหา --</option>
                        <option value="ผื่นแพ้">ผื่นแพ้</option>
                        <option value="คลื่นไส้">คลื่นไส้</option>
                        <option value="อื่นๆ">อื่นๆ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        คำอธิบาย <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        rows="4"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="เช่น ผู้ป่วยมีผื่นคันบริเวณลำตัวหลังใช้ยา"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        วันที่รายงาน <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={form.reported_at}
                        onChange={(e) => setForm({ ...form, reported_at: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-200 rounded"
                          checked={form.is_resolved}
                          onChange={(e) => setForm({ ...form, is_resolved: e.target.checked })}
                        />
                        แก้ไขแล้ว
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {isEditing ? "บันทึก" : "เพิ่ม"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}