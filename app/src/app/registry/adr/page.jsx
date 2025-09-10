"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Stethoscope,
  User,
  Calendar,
  AlertTriangle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  ClipboardList,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Biohazard
} from "lucide-react";
import Swal from "sweetalert2";
import Header from "@/app/component/Header";
import { FormatDate, FormatDateTime } from "@/app/component/formatDate";

const isClient = typeof window !== "undefined";
const host = isClient ? window.location.hostname : "localhost";

async function getADRs() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/patient/adr`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch ADRs");
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

export default function ADRRegistryPage() {
  const [adrs, setAdrs] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchReportDate, setSearchReportDate] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedADR, setSelectedADR] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [adrData, medicineData, patientData] = await Promise.all([
          getADRs(),
          getMedicines(),
          getPatients(),
        ]);
        setAdrs(Array.isArray(adrData) ? adrData : []);
        setMedicines(Array.isArray(medicineData) ? medicineData : []);
        setPatients(Array.isArray(patientData) ? patientData : []);
      } catch (err) {
        console.error("Error fetching data:", err);
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
    fetchData();
  }, []);

  const getMedName = (id) => medicines.find((m) => m.med_id === id)?.med_name || "-";
  const getMedThaiName = (id) => medicines.find((m) => m.med_id === id)?.med_thai_name || "-";
  const getMedicine = (id) => medicines.find((m) => m.med_id === id);
  const getPatient = (id) => patients.find((pt) => pt.patient_id === id);
  const getPatientName = (id) => {
    const p = patients.find((pt) => pt.patient_id === id);
    return p ? `${p.first_name} ${p.last_name}` : "-";
  };
  const getPatientHN = (id) => patients.find((pt) => pt.patient_id === id)?.hn_number || "-";
  const getPatientNationalId = (id) => {
    const patient = patients.find((pt) => pt.patient_id === id);
    const nationalId = patient?.national_id || "-";
    return nationalId
  };

  const getDateOnly = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  };

  const getSeverityDisplay = (severity) => {
    switch (severity) {
      case "Mild":
        return { text: "เล็กน้อย", color: "bg-green-100 text-green-700", dotColor: "bg-green-500" };
      case "Moderate":
        return { text: "ปานกลาง", color: "bg-yellow-100 text-yellow-700", dotColor: "bg-yellow-500" };
      case "Severe":
        return { text: "รุนแรง", color: "bg-red-100 text-red-700", dotColor: "bg-red-500" };
      default:
        return { text: "-", color: "bg-gray-100 text-gray-700", dotColor: "bg-gray-500" };
    }
  };

  const getOutcomeDisplay = (outcome) => {
    switch (outcome) {
      case "Recovered":
        return { text: "หายแล้ว", color: "bg-green-100 text-green-700", icon: CheckCircle };
      case "Recovering":
        return { text: "กำลังหาย", color: "bg-blue-100 text-blue-700", icon: Clock };
      case "Not Recovered":
        return { text: "ยังไม่หาย", color: "bg-red-100 text-red-700", icon: XCircle };
      case "Unknown":
        return { text: "ไม่ทราบ", color: "bg-gray-100 text-gray-700", icon: Clock };
      default:
        return { text: "-", color: "bg-gray-100 text-gray-700", icon: Clock };
    }
  };

  const deleteReport = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบรายงาน ADR นี้?",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`https://dispensesystem-production.up.railway.app/patient/adr/${id}`, { method: "DELETE" });
      setAdrs((prev) => prev.filter((r) => r.adr_id !== id));
      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        text: "รายงาน ADR ถูกลบเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#28a745",
      });
    } catch (err) {
      console.error("Error deleting ADR report:", err);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการลบรายงาน",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleViewDetail = (adr) => {
    setSelectedADR(adr);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedADR(null);
  };

  const clearIndividualFilter = (type) => {
    switch (type) {
      case "search":
        setSearchTerm("");
        break;
      case "date":
        setSearchReportDate("");
        break;
      case "severity":
        setSelectedSeverity("");
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSearchReportDate("");
    setSelectedSeverity("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || searchReportDate || selectedSeverity;

  const filteredAdrs = useMemo(() => {
    return adrs.filter((item) => {
      const med = medicines.find((m) => m.med_id === item.med_id);
      const patient = patients.find((p) => p.patient_id === item.patient_id);
      if (!med || !patient) return false;

      const medName = (med.med_name || "").toLowerCase();
      const medGenericName = (med.med_generic_name || "").toLowerCase();
      const medThaiName = (med.med_thai_name || "").toLowerCase();
      const patientName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      const patientNameEn = `${patient.first_name_en || ""} ${patient.last_name_en || ""}`.toLowerCase();
      const hn = (patient.hn_number || "").toLowerCase();
      const nationalId = (patient.national_id || "").toLowerCase();
      const patientId = `${patient.patient_id}`.toLowerCase();

      const searchMatch =
        !searchTerm ||
        medName.includes(searchTerm.toLowerCase()) ||
        medGenericName.includes(searchTerm.toLowerCase()) ||
        medThaiName.includes(searchTerm.toLowerCase()) ||
        patientName.includes(searchTerm.toLowerCase()) ||
        patientNameEn.includes(searchTerm.toLowerCase()) ||
        hn.includes(searchTerm.toLowerCase()) ||
        nationalId.includes(searchTerm.toLowerCase()) ||
        patientId.includes(searchTerm.toLowerCase());

      const reportDate = getDateOnly(item.reported_at);
      const matchesDate = !searchReportDate || reportDate === searchReportDate;

      const matchesSeverity = !selectedSeverity || item.severity === selectedSeverity;

      return searchMatch && matchesDate && matchesSeverity;
    });
  }, [adrs, medicines, patients, searchTerm, searchReportDate, selectedSeverity]);

  const totalItems = filteredAdrs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredAdrs.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

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
    <div className=" mx-auto font-sarabun">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
        <Header
          header="ทะเบียนอาการไม่พึงประสงค์จากการใช้ยา (ADR)"
          description="ติดตามและจัดการรายงานยาไม่พึงประสงค์ (ADR)"
          icon={Biohazard}
        />
      </div>

      {/* Filters Section */}
      <div className="my-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="ค้นหาผู้ป่วย (ชื่อ, HN, เลขบัตรประชาชน, รหัสผู้ป่วย) หรือยา (ชื่อ, ชื่อสามัญ, ชื่อไทย)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
            />
          </div>
          <div className="relative col-span-1">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="date"
              value={searchReportDate}
              onChange={(e) => setSearchReportDate(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          <div className="flex gap-2 col-span-1">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full pl-4 pr-8 py-1 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            >
              <option value="">ทุกความรุนแรง</option>
              <option value="Mild">เล็กน้อย</option>
              <option value="Moderate">ปานกลาง</option>
              <option value="Severe">รุนแรง</option>
            </select>
            <button
              onClick={clearFilters}
              className="flex items-center px-4 py-1 bg-red-200 text-red-800 rounded-xl hover:bg-red-300 transition-all duration-200 text-sm font-medium"
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
              <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">ไม่พบรายงานยาไม่พึงประสงค์</p>
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
                      <Stethoscope className="h-4 w-4 mr-2" />
                      ยา
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      อาการ
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      ความรุนแรง
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
                      สถานะผลลัพธ์
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
                  const patient = getPatient(item.patient_id);
                  const medicine = getMedicine(item.med_id);
                  const severityInfo = getSeverityDisplay(item.severity);
                  const outcomeInfo = getOutcomeDisplay(item.outcome);

                  return (
                    <tr key={item.adr_id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-xs">{startIndex + index + 1}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {patient ? `${patient.first_name} ${patient.last_name}` : "-"}
                            </div>
                            <div className="text-sm text-gray-500">HN: {getPatientHN(item.patient_id)}</div>
                            <div className="text-xs text-gray-400">
                              เลขบัตร: {getPatientNationalId(item.patient_id)}
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
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{item.symptoms || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${severityInfo.color}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${severityInfo.dotColor}`}></span>
                          {severityInfo.text}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{<FormatDate dateString={item.reported_at}/>}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.reported_at).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${outcomeInfo.color}`}
                        >
                          <outcomeInfo.icon size={14} />
                          {outcomeInfo.text}
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
                            className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors"
                            onClick={() => deleteReport(item.adr_id)}
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
      {showDetailModal && selectedADR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">รายละเอียดรายงานยาไม่พึงประสงค์</h2>
                    <p className="text-orange-100 text-sm">รหัสรายงาน: {selectedADR.adr_id || "-"}</p>
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
                    <User className="h-5 w-5 text-orange-600" />
                    ข้อมูลผู้ป่วยและยา
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "รหัสรายงาน", value: selectedADR.adr_id || "-", key: "adr_id" },
                      { label: "ผู้ป่วย", value: getPatientName(selectedADR.patient_id), key: "patient_name" },
                      { label: "HN", value: getPatientHN(selectedADR.patient_id), key: "hn" },
                      { label: "เลขบัตรประชาชน", value: getPatientNationalId(selectedADR.patient_id), key: "national_id" },
                      { label: "ยา", value: `${getMedName(selectedADR.med_id)} (ID: ${selectedADR.med_id || "-"})`, key: "med_name" },
                      { label: "ชื่อยาภาษาไทย", value: getMedThaiName(selectedADR.med_id), key: "med_thai_name" },
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
                    <Stethoscope className="h-5 w-5 text-orange-600" />
                    ข้อมูลรายงาน
                  </h3>
                  <div className="space-y-3">
                    <div className="rounded-xl p-4 border-2 border-orange-200">
                      <div className="flex items-center gap-2 text-center">
                        <p className="text-sm text-gray-600">ความรุนแรง</p>
                        <div>
                          {(() => {
                            const severity = getSeverityDisplay(selectedADR.severity);
                            return (
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${severity.color}`}>
                                <span className={`w-2 h-2 rounded-full ${severity.dotColor} mr-1`}></span>
                                {severity.text}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-center mt-2">
                        <p className="text-sm text-gray-600">สถานะผลลัพธ์</p>
                        <div>
                          {(() => {
                            const outcome = getOutcomeDisplay(selectedADR.outcome);
                            const OutcomeIcon = outcome.icon;
                            return (
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${outcome.color}`}>
                                <OutcomeIcon className="w-4 h-4 mr-1" />
                                {outcome.text}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    {[
                      { label: "วันที่รายงาน", value: selectedADR.reported_at ? <FormatDateTime dateString={selectedADR.reported_at} /> : "-", key: "reported_at" },
                      { label: "อาการ", value: selectedADR.symptoms || "-", key: "symptoms" },
                      { label: "รายละเอียด", value: selectedADR.description || "-", key: "description" },
                      { label: "หมายเหตุ", value: selectedADR.notes || "-", key: "notes" },
                    ].map((item) => (
                      <div key={`adr-info-${item.key}`} className="flex justify-between py-2">
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
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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