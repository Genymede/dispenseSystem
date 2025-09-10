"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Bandage,User, Pill, Search, AlertTriangle, Hospital, Loader2, FileText, CheckCircle, Package, X, Plus, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, HeartPulse } from "lucide-react";
import Header from "@/app/component/Header";
import Swal from "sweetalert2";
import debounce from "lodash/debounce";
import { set } from "lodash";

const isClient = typeof window !== "undefined";
const host = isClient ? window.location.hostname : "localhost";

async function getAllergy() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/allergy`, { cache: "no-store" });
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

async function addAllergy(allergyData) {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/allergy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(allergyData),
  });
  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res.json();
}

export default function Allergy() {
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [showPatientModal, setShowPatientModal] = useState(null);
  const [showMedModal, setShowMedModal] = useState(null);
  const [showAddAllergyModal, setShowAddAllergyModal] = useState(false);
  const [patientNameSearch, setPatientNameSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState({});
  const [medicineNameSearch, setMedicineNameSearch] = useState("");
  const [symptomsSearch, setSymptomsSearch] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState({});
  const [severityFilter, setSeverityFilter] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("patients");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState({});
  const [newAllergy, setNewAllergy] = useState({
    med_id: "",
    patient_id: "",
    symptoms: "",
    description: "",
    severity: "mild"
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        setLoading(true);
        const [patientsData, medicinesData, allergiesData] = await Promise.all([
          getPatients(),
          getMedicines(),
          getAllergy(),
        ]);

        const validatedAllergies = Array.isArray(allergiesData)
          ? allergiesData.map((item, index) => ({
              ...item,
              allergy_id: item.allr_id != null ? String(item.allr_id) : `fallback-${index}`,
              patient_id: item.patient_id ?? null,
              med_id: item.med_id ?? null,
              symptoms: item.symptoms ?? "-",
            }))
          : [];

        setPatients(Array.isArray(patientsData) ? patientsData : []);
        setMedicines(Array.isArray(medicinesData) ? medicinesData : []);
        setAllergies(validatedAllergies);
      } catch (error) {
        console.error("Error loading data:", error);
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
    };
    loadData();
  }, []);

  const handleAddAllergy = async (e) => {
    e.preventDefault();
    try {
      if (!newAllergy.med_id || !newAllergy.patient_id || !newAllergy.symptoms) {
        Swal.fire({
          icon: "warning",
          title: "ข้อมูลไม่ครบ",
          text: "กรุณากรอกข้อมูลที่จำเป็นทั้งหมด",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#d33",
        });
        return;
      }

      const allergyData = {
        ...newAllergy,
        med_id: parseInt(newAllergy.med_id),
        patient_id: parseInt(newAllergy.patient_id),
      };

      const newAllergyRecord = await addAllergy(allergyData);
      setAllergies((prev) => [
        {
          ...newAllergyRecord,
          allergy_id: String(newAllergyRecord.allr_id),
        },
        ...prev,
      ]);

      Swal.fire({
        icon: "success",
        title: "เพิ่มข้อมูลสำเร็จ",
        text: "บันทึกข้อมูลการแพ้ยาเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#22c55e",
      });

      setShowAddAllergyModal(false);
      setNewAllergy({
        med_id: "",
        patient_id: "",
        symptoms: "",
        description: "",
        severity: "mild",
      });
      setPatientSearch("");
      setMedicineSearch("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่สามารถเพิ่มข้อมูลการแพ้ยาได้ กรุณาลองใหม่",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
    }
  };

  const normalizeThaiText = (text) => {
    if (!text) return "";
    return text
      .normalize("NFKD")
      .replace(/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g, "")
      .toLowerCase()
      .trim();
  };

  const debouncedSetPatientNameSearch = useCallback((value) => {
    setPatientNameSearch(value);
  }, []);

  const debouncedSetMedicineNameSearch = useCallback((value) => {
    setMedicineNameSearch(value);
  }, []);

  const debouncedSetSymptomsSearch = useCallback((value) => {
    setSymptomsSearch(value);
  }, []);

  const filteredPatientOptions = useMemo(() => {
    if (!patientSearch) return patients;
    const searchLower = normalizeThaiText(patientSearch);
    return patients.filter((p) => {
      const fullName = normalizeThaiText(`${p.first_name} ${p.last_name}`);
      const hn = normalizeThaiText(p.hn_number || "");
      const nationalId = normalizeThaiText(p.national_id || "");
      return (
        fullName.includes(searchLower) ||
        hn.includes(searchLower) ||
        nationalId.includes(searchLower)
      );
    });
  }, [patientSearch, patients]);

  const filteredMedicineOptions = useMemo(() => {
    if (!medicineSearch) return medicines;
    const searchLower = normalizeThaiText(medicineSearch);
    return medicines.filter((m) => {
      const medName = normalizeThaiText(m.med_name || "");
      const medGenericName = normalizeThaiText(m.med_generic_name || "");
      const medThaiName = normalizeThaiText(m.med_thai_name || "");
      return (
        medName.includes(searchLower) ||
        medGenericName.includes(searchLower) ||
        medThaiName.includes(searchLower)
      );
    });
  }, [medicineSearch, medicines]);

  const getPatientAllergies = (patient_id) => {
    const patientAllergies = allergies
      .filter((a) => a.patient_id === patient_id)
      .map((a) => ({
        ...a,
        med: medicines.find((m) => m.med_id === a.med_id) || { med_name: "-", med_id: "-", med_generic_name: "-", med_thai_name: "-" },
      }));

    // Sort allergies: prioritize matches with search terms and severity
    const patientSearchLower = normalizeThaiText(patientNameSearch);
    const medicineSearchLower = normalizeThaiText(medicineNameSearch);
    const symptomsSearchLower = normalizeThaiText(symptomsSearch);

    return patientAllergies.sort((a, b) => {
      const aMatchesSeverity = severityFilter ? a.severity === severityFilter : true;
      const bMatchesSeverity = severityFilter ? b.severity === severityFilter : true;
      const aMatchesMedicine = medicineSearchLower
        ? normalizeThaiText(a.med?.med_name || "").includes(medicineSearchLower) ||
          normalizeThaiText(a.med?.med_generic_name || "").includes(medicineSearchLower) ||
          normalizeThaiText(a.med?.med_thai_name || "").includes(medicineSearchLower)
        : true;
      const bMatchesMedicine = medicineSearchLower
        ? normalizeThaiText(b.med?.med_name || "").includes(medicineSearchLower) ||
          normalizeThaiText(b.med?.med_generic_name || "").includes(medicineSearchLower) ||
          normalizeThaiText(b.med?.med_thai_name || "").includes(medicineSearchLower)
        : true;
      const aMatchesSymptoms = symptomsSearchLower
        ? normalizeThaiText(a.symptoms || "").includes(symptomsSearchLower)
        : true;
      const bMatchesSymptoms = symptomsSearchLower
        ? normalizeThaiText(b.symptoms || "").includes(symptomsSearchLower)
        : true;

      // Prioritize matches
      if (aMatchesSeverity && !bMatchesSeverity) return -1;
      if (!aMatchesSeverity && bMatchesSeverity) return 1;
      if (aMatchesMedicine && !bMatchesMedicine) return -1;
      if (!aMatchesMedicine && bMatchesMedicine) return 1;
      if (aMatchesSymptoms && !bMatchesSymptoms) return -1;
      if (!aMatchesSymptoms && bMatchesSymptoms) return 1;
      return b.allergy_id - a.allergy_id; // Default sort by allr_id desc
    });
  };

  const getMedicineAllergies = (med_id) => {
    const medicineAllergies = allergies
      .filter((a) => a.med_id === med_id)
      .map((a) => ({
        ...a,
        patient: patients.find((p) => p.patient_id === a.patient_id) || { first_name: "-", last_name: "-", hn_number: "-", national_id: "-" },
      }));

    // Sort allergies: prioritize matches with search terms and severity
    const patientSearchLower = normalizeThaiText(patientNameSearch);
    const medicineSearchLower = normalizeThaiText(medicineNameSearch);
    const symptomsSearchLower = normalizeThaiText(symptomsSearch);

    return medicineAllergies.sort((a, b) => {
      const aMatchesSeverity = severityFilter ? a.severity === severityFilter : true;
      const bMatchesSeverity = severityFilter ? b.severity === severityFilter : true;
      const aMatchesPatient = patientSearchLower
        ? normalizeThaiText(`${a.patient?.first_name || ""} ${a.patient?.last_name || ""}`).includes(patientSearchLower) ||
          normalizeThaiText(a.patient?.hn_number || "").includes(patientSearchLower) ||
          normalizeThaiText(a.patient?.national_id || "").includes(patientSearchLower)
        : true;
      const bMatchesPatient = patientSearchLower
        ? normalizeThaiText(`${b.patient?.first_name || ""} ${b.patient?.last_name || ""}`).includes(patientSearchLower) ||
          normalizeThaiText(b.patient?.hn_number || "").includes(patientSearchLower) ||
          normalizeThaiText(b.patient?.national_id || "").includes(patientSearchLower)
        : true;
      const aMatchesSymptoms = symptomsSearchLower
        ? normalizeThaiText(a.symptoms || "").includes(symptomsSearchLower)
        : true;
      const bMatchesSymptoms = symptomsSearchLower
        ? normalizeThaiText(b.symptoms || "").includes(symptomsSearchLower)
        : true;

      // Prioritize matches
      if (aMatchesSeverity && !bMatchesSeverity) return -1;
      if (!aMatchesSeverity && bMatchesSeverity) return 1;
      if (aMatchesPatient && !bMatchesPatient) return -1;
      if (!aMatchesPatient && bMatchesPatient) return 1;
      if (aMatchesSymptoms && !bMatchesSymptoms) return -1;
      if (!aMatchesSymptoms && bMatchesSymptoms) return 1;
      return b.allergy_id - a.allergy_id; // Default sort by allr_id desc
    });
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const fullName = normalizeThaiText(`${p.first_name} ${p.last_name}`);
      const hn = normalizeThaiText(p.hn_number || "");
      const nationalId = normalizeThaiText(p.national_id || "");
      const patientAllergies = getPatientAllergies(p.patient_id);
      const hasAllergies = patientAllergies.length > 0;
      if (!hasAllergies) return false;

      const patientSearchLower = normalizeThaiText(patientNameSearch);
      const medicineSearchLower = normalizeThaiText(medicineNameSearch);
      const symptomsSearchLower = normalizeThaiText(symptomsSearch);

      const matchesPatient = patientSearchLower
        ? fullName.includes(patientSearchLower) ||
          hn.includes(patientSearchLower) ||
          nationalId.includes(patientSearchLower)
        : true;

      const matchesAllergy = patientAllergies.some((a) => {
        const matchesSeverity = severityFilter ? a.severity === severityFilter : true;
        const matchesMedicine = medicineSearchLower
          ? normalizeThaiText(a.med?.med_name || "").includes(medicineSearchLower) ||
            normalizeThaiText(a.med?.med_generic_name || "").includes(medicineSearchLower) ||
            normalizeThaiText(a.med?.med_thai_name || "").includes(medicineSearchLower)
          : true;
        const matchesSymptoms = symptomsSearchLower
          ? normalizeThaiText(a.symptoms || "").includes(symptomsSearchLower)
          : true;
        return matchesSeverity && matchesMedicine && matchesSymptoms;
      });

      return matchesPatient && matchesAllergy;
    });
  }, [patients, allergies, medicines, patientNameSearch, medicineNameSearch, symptomsSearch, severityFilter]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const medName = normalizeThaiText(m.med_name || "");
      const medGenericName = normalizeThaiText(m.med_generic_name || "");
      const medThaiName = normalizeThaiText(m.med_thai_name || "");
      const medicineAllergies = getMedicineAllergies(m.med_id);
      const hasAllergies = medicineAllergies.length > 0;
      if (!hasAllergies) return false;

      const patientSearchLower = normalizeThaiText(patientNameSearch);
      const medicineSearchLower = normalizeThaiText(medicineNameSearch);
      const symptomsSearchLower = normalizeThaiText(symptomsSearch);

      const matchesMedicine = medicineSearchLower
        ? medName.includes(medicineSearchLower) ||
          medGenericName.includes(medicineSearchLower) ||
          medThaiName.includes(medicineSearchLower)
        : true;

      const matchesAllergy = medicineAllergies.some((a) => {
        const matchesSeverity = severityFilter ? a.severity === severityFilter : true;
        const matchesPatient = patientSearchLower
          ? normalizeThaiText(`${a.patient?.first_name || ""} ${a.patient?.last_name || ""}`).includes(patientSearchLower) ||
            normalizeThaiText(a.patient?.hn_number || "").includes(patientSearchLower) ||
            normalizeThaiText(a.patient?.national_id || "").includes(patientSearchLower)
          : true;
        const matchesSymptoms = symptomsSearchLower
          ? normalizeThaiText(a.symptoms || "").includes(symptomsSearchLower)
          : true;
        return matchesSeverity && matchesPatient && matchesSymptoms;
      });

      return matchesMedicine && matchesAllergy;
    });
  }, [medicines, allergies, patients, patientNameSearch, medicineNameSearch, symptomsSearch, severityFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSeverityDisplay = (severity) => {
    const severityMap = {
      mild: {
        text: "ไม่รุนแรง",
        color: "bg-green-100 text-green-700",
        dotColor: "bg-green-500",
      },
      moderate: {
        text: "ปานกลาง",
        color: "bg-yellow-100 text-yellow-700",
        dotColor: "bg-yellow-500",
      },
      severe: {
        text: "รุนแรง",
        color: "bg-red-100 text-red-700",
        dotColor: "bg-red-500",
      },
    };
    return severityMap[severity] || {
      text: "ไม่ระบุ",
      color: "bg-gray-100 text-gray-600",
      dotColor: "bg-gray-400",
    };
  };

  const getPatientName = (id) => {
    const p = patients.find((pt) => pt.patient_id === id);
    return p ? `${p.first_name} ${p.last_name}` : "-";
  };

  const getPatientHN = (id) => patients.find((pt) => pt.patient_id === id)?.hn_number || "-";

  const getPatientNationalId = (id) => {
    const patient = patients.find((pt) => pt.patient_id === id);
    const nationalId = patient?.national_id || "-";
    return nationalId.length > 8 ? `${nationalId.slice(0, 4)}***${nationalId.slice(-3)}` : nationalId;
  };

  const getMedName = (id) => medicines.find((m) => m.med_id === id)?.med_name || "-";

  const getMedThaiName = (id) => medicines.find((m) => m.med_id === id)?.med_thai_name || "-";

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const totalItems = activeTab === "patients" ? filteredPatients.length : filteredMedicines.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);
  const currentMedicines = filteredMedicines.slice(startIndex, endIndex);

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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
        <Header
          header="ทะเบียนการแพ้ยา"
          description="จัดการและติดตามข้อมูลการแพ้ยาของผู้ป่วย"
          icon={HeartPulse}
        />
        <button
          className="mt-4 lg:mt-0 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          onClick={() => setShowAddAllergyModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มข้อมูลการแพ้ยา
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-xl mb-4">
          <p>{error}</p>
        </div>
      )}

      
      <div className="mt-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <div className="flex">
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                activeTab === "patients"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("patients")}
            >
              <User className="w-5 h-5 inline-block mr-2" /> ผู้ป่วยที่แพ้ยา
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                activeTab === "medicines"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("medicines")}
            >
              <Pill className="w-5 h-5 inline-block mr-2" /> ยาที่มีผู้แพ้
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab === "patients" ? "ผู้ป่วยที่แพ้ยา" : "ยาที่มีผู้ป่วยแพ้"}
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white focus:bg-white text-sm"
                  placeholder="ค้นหาด้วยชื่อ, HN, หรือเลขบัตรประชาชน"
                  value={patientNameSearch}
                  onChange={(e) => debouncedSetPatientNameSearch(e.target.value)}
                />
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white focus:bg-white text-sm"
                  placeholder="ค้นหาด้วยชื่อยา, ชื่อสามัญ, หรือชื่อไทย"
                  value={medicineNameSearch}
                  onChange={(e) => debouncedSetMedicineNameSearch(e.target.value)}
                />
              </div>
              <div className="relative w-full sm:w-48">
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white focus:bg-white text-sm appearance-none"
                >
                  <option value="">ทั้งหมด (ความรุนแรง)</option>
                  <option value="mild">ไม่รุนแรง</option>
                  <option value="moderate">ปานกลาง</option>
                  <option value="severe">รุนแรง</option>
                </select>
                <AlertTriangle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
          </div>
          <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
            {activeTab === "patients" ? (
              currentPatients.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">ไม่พบผู้ป่วยที่แพ้ยา</p>
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
                          ยาที่แพ้
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        <div className="flex items-center">
                          <Bandage className="h-4 w-4 mr-2" />
                          อาการแพ้
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                        <div className="flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          ระดับความรุนแรง
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                        <div className="flex items-center justify-center">
                          <FileText className="h-4 w-4 mr-2" />
                          การดำเนินการ
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentPatients.map((patient, index) => {
                      const patientAllergies = getPatientAllergies(patient.patient_id);
                      const isExpanded = expandedRows[patient.patient_id];
                      const displayAllergies = isExpanded ? patientAllergies : patientAllergies.slice(0, 3);
                      return (
                        <tr key={patient.patient_id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-semibold text-xs">{startIndex + index + 1}</span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{`${patient.first_name || "-"} ${patient.last_name || "-"}`}</div>
                                <div className="text-sm text-gray-500">HN: {getPatientHN(patient.patient_id)}</div>
                                <div className="text-xs text-gray-400">เลขบัตร: {getPatientNationalId(patient.patient_id)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              {displayAllergies.map((allergy, i) => {
                                return (
                                  <div key={i} className="text-sm text-gray-900 ">
                                    {allergy.med?.med_name || "-"} <span className="text-xs text-gray-500"></span>
                                  </div>
                                );
                              })}
                              {patientAllergies.length > 3 && (
                                <button
                                  className="text-xs text-blue-600 hover:underline mt-1"
                                  onClick={() => toggleRowExpansion(patient.patient_id)}
                                >
                                  {isExpanded ? "ซ่อน" : `แสดงทั้งหมด (+${patientAllergies.length - 3})`}
                                  {isExpanded ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />}
                                </button>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              {displayAllergies.map((allergy, i) => (
                                <div key={i} className="text-sm  text-gray-900 mb-1">
                                  {allergy.symptoms || "-"}
                                </div>
                              ))}
                              {patientAllergies.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  {isExpanded ? "" : `+${patientAllergies.length - 3} อื่นๆ`}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div>
                              {displayAllergies.map((allergy, i) => {
                                const severityInfo = getSeverityDisplay(allergy.severity);
                                return (
                                  <div key={i} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${severityInfo.color}`}>
                                    <div className={`w-2 h-2 rounded-full ${severityInfo.dotColor}`}></div>
                                    {severityInfo.text}
                                  </div>
                                );
                              })}
                              {patientAllergies.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  {isExpanded ? "" : `+${patientAllergies.length - 3} อื่นๆ`}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 justify-center">
                              <button
                                className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition-colors"
                                onClick={() => setShowPatientModal(patient)}
                                aria-label="ดูรายละเอียด"
                              >
                                <FileText size={14} />
                                ดู
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            ) : (
              currentMedicines.length === 0 ? (
                <div className="text-center py-12">
                  <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">ไม่พบยาที่มีผู้ป่วยแพ้</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        <div className="flex items-center">
                          <Pill className="h-4 w-4 mr-2" />
                          ยา
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          ผู้ป่วยที่แพ้
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                        <div className="flex items-center">
                          <Bandage className="h-4 w-4 mr-2" />
                          อาการที่แพ้
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                        <div className="flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          ระดับความรุนแรง
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                        <div className="flex items-center justify-center">
                          <FileText className="h-4 w-4 mr-2" />
                          การดำเนินการ
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentMedicines.map((medicine, index) => {
                      const medicineAllergies = getMedicineAllergies(medicine.med_id);
                      const isExpanded = expandedRows[medicine.med_id];
                      const displayAllergies = isExpanded ? medicineAllergies : medicineAllergies.slice(0, 3);
                      return (
                        <tr key={medicine.med_id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-semibold text-xs">{startIndex + index + 1}</span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{medicine.med_name || "-"}</div>
                                {medicine.med_thai_name && (
                                  <div className="text-sm text-gray-500">{medicine.med_thai_name}</div>
                                )}
                                <div className="text-xs text-gray-400">รหัส: {medicine.med_id || "-"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              {displayAllergies.map((allergy, i) => {
                                return (
                                  <div key={i} className={`text-sm text-gray-900 `}>
                                    {allergy.patient?.first_name || "-"} {allergy.patient?.last_name || "-"} 
                                  </div>
                                );
                              })}
                              {medicineAllergies.length > 3 && (
                                <button
                                  className="text-xs text-blue-600 hover:underline mt-1"
                                  onClick={() => toggleRowExpansion(medicine.med_id)}
                                >
                                  {isExpanded ? "ซ่อน" : `แสดงทั้งหมด (+${medicineAllergies.length - 3})`}
                                  {isExpanded ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              {displayAllergies.map((allergy, i) => (
                                <div key={i} className="text-sm text-gray-900 ">
                                  {allergy.symptoms || "-"}
                                </div>
                              ))}
                              {medicineAllergies.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  {isExpanded ? "" : `+${medicineAllergies.length - 3} อื่นๆ`}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div>
                              {displayAllergies.map((allergy, i) => {
                                const severityInfo = getSeverityDisplay(allergy.severity);
                                const isHighlighted = severityFilter && allergy.severity === severityFilter;
                                return (
                                  <div key={i} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${severityInfo.color} ${isHighlighted ? "ring-2 ring-blue-500" : ""}`}>
                                    <div className={`w-2 h-2 rounded-full ${severityInfo.dotColor}`}></div>
                                    {severityInfo.text}
                                  </div>
                                );
                              })}
                              {medicineAllergies.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  {isExpanded ? "" : `+${medicineAllergies.length - 3} อื่นๆ`}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 justify-center">
                              <button
                                className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text suos-xs font-medium transition-colors"
                                onClick={() => setShowMedModal(medicine)}
                                aria-label="ดูรายละเอียด"
                              >
                                <FileText size={14} />
                                ดู
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>

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

      {showAddAllergyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">เพิ่มข้อมูลการแพ้ยา</h2>
                    <p className="text-green-100 text-sm">กรอกข้อมูลการแพ้ยาใหม่</p>
                  </div>
                </div>
                <button
                  className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                  onClick={() => {
                    setShowAddAllergyModal(false);
                    setPatientSearch("");
                    setMedicineSearch("");
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleAddAllergy} className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ผู้ป่วย</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      onFocus={() => setPatientSearch(patientSearch || "")}
                      onBlur={() => {
                        if (!newAllergy.patient_id && patientSearch) setPatientSearch("");
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="ค้นหาด้วยชื่อ, HN, หรือเลขบัตรประชาชน"
                    />
                  </div>
                  {patientSearch && !selectedPatient.patient_id && (
                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                      {filteredPatientOptions.length > 0 ? (
                        filteredPatientOptions.map((patient) => (
                          <div
                            key={patient.patient_id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setNewAllergy({ ...newAllergy, patient_id: patient.patient_id });
                              setPatientSearch(`${patient.first_name} ${patient.last_name} (HN: ${patient.hn_number})`);
                              setSelectedPatient(patient); // เพิ่ม state สำหรับผู้ป่วยที่เลือก
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {patient.first_name} {patient.last_name} (HN: {patient.hn_number})
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">ไม่พบผู้ป่วย</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ยา</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={medicineSearch}
                      onChange={(e) => setMedicineSearch(e.target.value)}
                      onFocus={() => setMedicineSearch(medicineSearch || "")}
                      onBlur={() => {
                        if (!newAllergy.med_id && medicineSearch) setMedicineSearch("");
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="ค้นหาด้วยชื่อยา, ชื่อสามัญ, หรือชื่อไทย"
                    />
                  </div>
                  {medicineSearch && !selectedMedicine.med_id &&(
                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                      {filteredMedicineOptions.length > 0 ? (
                        filteredMedicineOptions.map((medicine) => (
                          <div
                            key={medicine.med_id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setNewAllergy({ ...newAllergy, med_id: medicine.med_id });
                              setMedicineSearch(`${medicine.med_name} (${medicine.med_generic_name})`);
                              setSelectedMedicine(medicine); // เพิ่ม state สำหรับยาที่เลือก
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {medicine.med_name} ({medicine.med_generic_name})
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">ไม่พบยา</div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อาการ</label>
                  <input
                    type="text"
                    value={newAllergy.symptoms}
                    onChange={(e) => setNewAllergy({ ...newAllergy, symptoms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="เช่น ผื่นแดง, คัน, หายใจลำบาก"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
                  <textarea
                    value={newAllergy.description}
                    onChange={(e) => setNewAllergy({ ...newAllergy, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ระดับความรุนแรง</label>
                  <select
                    value={newAllergy.severity}
                    onChange={(e) => setNewAllergy({ ...newAllergy, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="mild">ไม่รุนแรง (Mild)</option>
                    <option value="moderate">ปานกลาง (Moderate)</option>
                    <option value="severe">รุนแรง (Severe)</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  onClick={() => {
                    setShowAddAllergyModal(false);
                    setPatientSearch("");
                    setMedicineSearch("");
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPatientModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {showPatientModal.first_name || "-"} {showPatientModal.last_name || "-"}
                    </h2>
                    <p className="text-red-100 text-sm">HN: {showPatientModal.hn_number || "-"}</p>
                  </div>
                </div>
                <button
                  className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                  onClick={() => setShowPatientModal(null)}
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
                    ข้อมูลพื้นฐาน
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "ชื่อ-นามสกุล", value: `${showPatientModal.first_name || "-"} ${showPatientModal.last_name || "-"}`, key: "name" },
                      { label: "HN", value: showPatientModal.hn_number || "-", key: "hn" },
                      { label: "เลขบัตรประชาชน", value: showPatientModal.national_id || "-", key: "national_id" },
                      { label: "อายุ", value: `${showPatientModal.age_y || "-"} ปี`, key: "age" },
                      { label: "กรุ๊ปเลือด", value: showPatientModal.blood_group || "-", key: "blood_group" },
                      { label: "จำนวนยาที่แพ้", value: getPatientAllergies(showPatientModal.patient_id).length, key: "allergies" },
                    ].map((item) => (
                      <div key={`basic-info-${item.key}`} className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">{item.label}:</span>
                        <span className="font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    รายการยาที่แพ้
                  </h3>
                  <div className="space-y-3">
                    {getPatientAllergies(showPatientModal.patient_id).map((allergy, i) => {
                      const isHighlighted = (
                        (severityFilter && allergy.severity === severityFilter) ||
                        (medicineNameSearch && (
                          normalizeThaiText(allergy.med?.med_name || "").includes(normalizeThaiText(medicineNameSearch)) ||
                          normalizeThaiText(allergy.med?.med_generic_name || "").includes(normalizeThaiText(medicineNameSearch)) ||
                          normalizeThaiText(allergy.med?.med_thai_name || "").includes(normalizeThaiText(medicineNameSearch))
                        )) ||
                        (symptomsSearch && normalizeThaiText(allergy.symptoms || "").includes(normalizeThaiText(symptomsSearch)))
                      );
                      return (
                        <div key={i} className={`border border-red-200 rounded-lg p-4 ${isHighlighted ? "bg-blue-50" : "bg-red-50"}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-red-900">{allergy.med?.med_name || "ไม่ทราบชื่อยา"}</h4>
                            <span className="text-xs text-red-600 bg-red-200 px-2 py-1 rounded-full">
                              รหัส: {allergy.med?.med_id || "-"}
                            </span>
                          </div>
                          <p className="text-sm text-red-700">
                            <strong>ชื่อสามัญ:</strong> {allergy.med?.med_generic_name || "-"}
                          </p>
                          <p className="text-sm text-red-700">
                            <strong>ชื่อไทย:</strong> {allergy.med?.med_thai_name || "-"}
                          </p>
                          <p className="text-sm text-red-700">
                            <strong>อาการ:</strong> {allergy.symptoms || "-"}
                          </p>
                          <p className="text-sm text-red-700">
                            <strong>ระดับความรุนแรง:</strong> {allergy.severity === "mild" ? "ไม่รุนแรง" : allergy.severity === "moderate" ? "ปานกลาง" : "รุนแรง"}
                          </p>
                          <p className="text-sm text-red-700">
                            <strong>วันที่รายงาน:</strong> {formatDate(allergy.reported_at)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                onClick={() => setShowPatientModal(null)}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {showMedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{showMedModal.med_name || "-"}</h2>
                    <p className="text-orange-100 text-sm">{showMedModal.med_thai_name || "-"}</p>
                  </div>
                </div>
                <button
                  className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                  onClick={() => setShowMedModal(null)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Pill className="h-5 w-5 text-blue-600" />
                    ข้อมูลยา
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "รหัสยา", value: showMedModal.med_id || "-", key: "med_id" },
                      { label: "ชื่อยา", value: showMedModal.med_name || "-", key: "med_name" },
                      { label: "ชื่อสามัญ", value: showMedModal.med_generic_name || "-", key: "generic_name" },
                      { label: "ชื่อไทย", value: showMedModal.med_thai_name || "-", key: "thai_name" },
                      { label: "จำนวนผู้ป่วยที่แพ้", value: getMedicineAllergies(showMedModal.med_id).length, key: "allergy_count" },
                    ].map((item) => (
                      <div key={`med-info-${item.key}`} className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">{item.label}:</span>
                        <span className="font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <User className="h-5 w-5 text-orange-600" />
                    ผู้ป่วยที่แพ้ยานี้
                  </h3>
                  <div className="space-y-3">
                    {getMedicineAllergies(showMedModal.med_id).map((allergy, i) => {
                      const isHighlighted = (
                        (patientNameSearch && (
                          normalizeThaiText(`${allergy.patient?.first_name || ""} ${allergy.patient?.last_name || ""}`).includes(normalizeThaiText(patientNameSearch)) ||
                          normalizeThaiText(allergy.patient?.hn_number || "").includes(normalizeThaiText(patientNameSearch)) ||
                          normalizeThaiText(allergy.patient?.national_id || "").includes(normalizeThaiText(patientNameSearch))
                        )) ||
                        (symptomsSearch && normalizeThaiText(allergy.symptoms || "").includes(normalizeThaiText(symptomsSearch))) ||
                        (severityFilter && allergy.severity === severityFilter)
                      );
                      return (
                        <div key={i} className={`border border-orange-200 rounded-lg p-4 ${isHighlighted ? "bg-blue-50" : "bg-orange-50"}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-orange-900">
                              {allergy.patient?.first_name || "-"} {allergy.patient?.last_name || "-"}
                            </h4>
                            <span className="text-xs text-orange-600 bg-orange-200 px-2 py-1 rounded-full">
                              HN: {allergy.patient?.hn_number || "-"}
                            </span>
                          </div>
                          <p className="text-sm text-orange-700">
                            <strong>อาการ:</strong> {allergy.symptoms || "-"}
                          </p>
                          <p className="text-sm text-orange-700">
                            <strong>ระดับความรุนแรง:</strong> {allergy.severity === "mild" ? "ไม่รุนแรง" : allergy.severity === "moderate" ? "ปานกลาง" : "รุนแรง"}
                          </p>
                          <p className="text-sm text-orange-700">
                            <strong>วันที่รายงาน:</strong> {formatDate(allergy.reported_at)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                onClick={() => setShowMedModal(null)}
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