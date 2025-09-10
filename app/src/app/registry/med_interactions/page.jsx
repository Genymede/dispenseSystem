"use client";
import { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import {
  Share2,
  Search,
  Eye,
  AlertTriangle,
  Info,
  CheckCircle,
  Edit3,
  Trash2,
  X,
  Pill,
  Plus,
  XCircle,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FileText
} from "lucide-react";
import Header from "@/app/component/Header";
import { m } from "framer-motion";

const isClient = typeof window !== "undefined";
const host = isClient ? window.location.hostname : "localhost";

async function getMedicines() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch medicines");
  return res.json();
}

async function getInteractions() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/interactions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch interactions");
  return res.json();
}

export default function MedInteractionList() {
  const [interactions, setInteractions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [form, setForm] = useState({
    med_id_1: "",
    med_id_2: "",
    description: "",
    severity: "",
    evidence_level: "",
    source_reference: "",
    is_active: null,
    interaction_type: "unknown",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchMedicine1, setSearchMedicine1] = useState("");
  const [searchMedicine2, setSearchMedicine2] = useState("");
  const [filteredMedicines1, setFilteredMedicines1] = useState([]);
  const [filteredMedicines2, setFilteredMedicines2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [interactionData, medicineData] = await Promise.all([
          getInteractions(),
          getMedicines(),
        ]);
        setInteractions(Array.isArray(interactionData) ? interactionData : []);
        setMedicines(Array.isArray(medicineData) ? medicineData : []);
      } catch (error) {
        console.error("Error loading data:", error);
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
    loadData();
  }, []);

  const findMedName = (id) => {
    const med = medicines.find((m) => m.med_id === id);
    return med ? med.med_name : "-";
  };

  const findMedNameTH = (id) => {
    const med = medicines.find((m) => m.med_id === id);
    return med ? med.med_thai_name || "-" : "-";
  };

  const findMedGenName = (id) => {
    const med = medicines.find((m) => m.med_id === id);
    return med ? med.med_generic_name || "-" : "-";
  };

  const findMedMarketName = (id) => {
    const med = medicines.find((m) => m.med_id === id);
    return med ? med.med_marketing_name || "-" : "-";
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical": return "bg-red-100 text-red-800";
      case "Severe": return "bg-red-50 text-red-600";
      case "Moderate": return "bg-yellow-100 text-yellow-800";
      case "Mild": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityDotColor = (severity) => {
    switch (severity) {
      case "Critical": return "bg-red-600";
      case "Severe": return "bg-red-500";
      case "Moderate": return "bg-yellow-500";
      case "Mild": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getInteractionTypeColor = (type) => {
    switch (type) {
      case "compatible": return "bg-green-100 text-green-800";
      case "incompatible": return "bg-red-100 text-red-800";
      case "neutral": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getInteractionTypeDotColor = (type) => {
    switch (type) {
      case "compatible": return "bg-green-600";
      case "incompatible": return "bg-red-600";
      case "neutral": return "bg-blue-600";
      default: return "bg-gray-600";
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getStatusDotColor = (isActive) => {
    return isActive ? "bg-green-600" : "bg-red-600";
  };

  const getSeverityStatus = (severity) => {
    switch (severity) {
      case "Critical": return { status: "อันตรายมาก", color: "bg-red-100 text-red-800", icon: AlertTriangle };
      case "Severe": return { status: "รุนแรง", color: "bg-red-50 text-red-600", icon: AlertTriangle };
      case "Moderate": return { status: "ปานกลาง", color: "bg-yellow-100 text-yellow-800", icon: Info };
      case "Mild": return { status: "ต่ำ", color: "bg-green-100 text-green-800", icon: CheckCircle };
      default: return { status: "ไม่ระบุ", color: "bg-gray-100 text-gray-800", icon: X };
    }
  };

  const handleSearchMedicine1 = (e) => {

    const value = e.target.value.toLowerCase();
      
    setSearchMedicine1(value);
      if (value.trim() === "") {
          setFilteredMedicines1([]);
          return; // Exit the function to prevent further filtering
      }

      const filteredResults = medicines.filter(m => {
          // Use a boolean variable to check if any field matches
          const matchesName = m.med_name && m.med_name.toLowerCase().includes(value);
          const matchesThaiName = m.med_thai_name && m.med_thai_name.toLowerCase().includes(value);
          const matchesGenericName = m.med_generic_name && m.med_generic_name.toLowerCase().includes(value);
          const matchesMarketingName = m.med_marketing_name && m.med_marketing_name.toLowerCase().includes(value);

          return matchesName || matchesThaiName || matchesGenericName || matchesMarketingName;
      });
    setFilteredMedicines1(filteredResults);
  };

  const handleSearchMedicine2 = (e) => {
    
    const value = e.target.value.toLowerCase();
      
    setSearchMedicine2(value);
      if (value.trim() === "") {
          setFilteredMedicines1([]);
          return; // Exit the function to prevent further filtering
      }

      const filteredResults = medicines.filter(m => {
          // Use a boolean variable to check if any field matches
          const matchesName = m.med_name && m.med_name.toLowerCase().includes(value);
          const matchesThaiName = m.med_thai_name && m.med_thai_name.toLowerCase().includes(value);
          const matchesGenericName = m.med_generic_name && m.med_generic_name.toLowerCase().includes(value);
          const matchesMarketingName = m.med_marketing_name && m.med_marketing_name.toLowerCase().includes(value);

          return matchesName || matchesThaiName || matchesGenericName || matchesMarketingName;
      });
    setFilteredMedicines2(filteredResults);
  };

  const handleViewDetail = (interaction) => {
    setSelectedInteraction(interaction);
    setShowDetailModal(true);
  };

  const handleEdit = (interaction) => {
    setSelectedInteraction(interaction);
    setIsEditing(true);
    const med1 = medicines.find((m) => m.med_id === interaction.med_id_1);
    const med2 = medicines.find((m) => m.med_id === interaction.med_id_2);
    setForm({
      med_id_1: med1 ? med1.med_id : "",
      med_id_2: med2 ? med2.med_id : "",
      description: interaction.description || "",
      severity: interaction.severity || "",
      evidence_level: interaction.evidence_level || "",
      source_reference: interaction.source_reference || "",
      is_active: interaction.is_active,
      interaction_type: interaction.interaction_type || "unknown",
    });
    setSearchMedicine1(med1 ? med1.med_name : "");
    setSearchMedicine2(med2 ? med2.med_name : "");
    setShowEditModal(true);
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setForm({
      med_id_1: "",
      med_id_2: "",
      description: "",
      severity: "",
      evidence_level: "",
      source_reference: "",
      is_active: null,
      interaction_type: "unknown",
    });
    setSearchMedicine1("");
    setSearchMedicine2("");
    setFilteredMedicines1([]);
    setFilteredMedicines2([]);
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.med_id_1 || !form.med_id_2 || !form.description) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "กรุณากรอกข้อมูลที่จำเป็นทั้งหมด (ยา 1, ยา 2, คำอธิบาย)",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
      return;
    }
    if (form.med_id_1 === form.med_id_2) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่สามารถเลือกยาเดียวกันได้",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `https://dispensesystem-production.up.railway.app/medicine/interactions/${selectedInteraction.interaction_id}`
      : `https://dispensesystem-production.up.railway.app/medicine/interactions`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = isEditing
          ? interactions.map((i) => (i.interaction_id === data.interaction_id ? data : i))
          : [...interactions, data];
        setInteractions(updated);
        Swal.fire({
          icon: "success",
          title: isEditing ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ",
          text: `ข้อมูลได้รับการ${isEditing ? "แก้ไข" : "เพิ่ม"}เรียบร้อย`,
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
      console.error("Error saving interaction:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleDelete = async (interactionId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบปฏิกิริยานี้หรือไม่?",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/interactions/${interactionId}`, {
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
        setInteractions(interactions.filter((i) => i.interaction_id !== interactionId));
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
      console.error("Error deleting interaction:", error);
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
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedInteraction(null);
    setFilteredMedicines1([]);
    setFilteredMedicines2([]);
  };

  const filteredInteractions = useMemo(() => {
    return interactions.filter((interaction) => {
      const med1Name = findMedName(interaction.med_id_1).toLowerCase();
      const med2Name = findMedName(interaction.med_id_2).toLowerCase();
      const med1NameTH = findMedNameTH(interaction.med_id_1).toLowerCase();
      const med2NameTH = findMedNameTH(interaction.med_id_2).toLowerCase();
      const description = interaction.description?.toLowerCase() || "";
      const searchLower = searchTerm.toLowerCase();
      const medGeneric1 = findMedGenName(interaction.med_id_1).toLowerCase()
      const medGeneric2 = findMedGenName(interaction.med_id_2).toLowerCase()
      const medMarket1 = findMedMarketName(interaction.med_id_1).toLowerCase()
      const medMarket2 = findMedMarketName(interaction.med_id_2).toLowerCase()

      const matchesSearch =
        !searchTerm ||
        med1Name.includes(searchLower) ||
        med2Name.includes(searchLower) ||
        med1NameTH.includes(searchLower) ||
        med2NameTH.includes(searchLower) ||
        description.includes(searchLower) ||
        medGeneric1.includes(searchLower) ||
        medGeneric2.includes(searchLower) ||
        medMarket1.includes(searchLower) ||
        medMarket2.includes(searchLower);

      const matchesSeverity = !severityFilter || interaction.severity === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [interactions, searchTerm, severityFilter]);

  const totalItems = filteredInteractions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredInteractions.slice(startIndex, endIndex);

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
          header="ทะเบียนปฏิกิริยาระหว่างยา"
          description="จัดการและติดตามปฏิกิริยาระหว่างยาต่างๆ"
          icon={Share2}
        />
      </div>

      

      {/* Filters Section */}
      <div className="my-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
          <div className="relative col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="ค้นหายาหรือคำอธิบาย..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
            />
          </div>
          <div className="col-span-1 relative">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full pl-4 pr-8 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            >
              <option value="">ทุกระดับความรุนแรง</option>
              <option value="Critical">อันตรายมาก</option>
              <option value="Severe">รุนแรง</option>
              <option value="Moderate">ปานกลาง</option>
              <option value="Mild">ต่ำ</option>
            </select>
          </div>
          <div className="col-span-1 flex gap-2">
            <button
              onClick={handleAddNew}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              เพิ่มปฏิกิริยา
            </button>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSeverityFilter("");
                  setCurrentPage(1);
                }}
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
              <p className="text-gray-500 text-lg mb-2">ไม่พบปฏิกิริยาระหว่างยา</p>
              <p className="text-gray-400">ลองปรับเปลี่ยนเงื่อนไขการค้นหา</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center">
                      <Pill className="h-4 w-4 mr-2" />
                      ยา 1
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center">
                      <Pill className="h-4 w-4 mr-2" />
                      ยา 2
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      ความรุนแรง
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center justify-center">
                      <Share2 className="h-4 w-4 mr-2" />
                      ความเข้ากัน
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
                      <Edit3 className="h-4 w-4 mr-2" />
                      การดำเนินการ
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((interaction, index) => (
                  <tr key={interaction.interaction_id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{findMedName(interaction.med_id_1)}</div>
                          <div className="text-xs text-gray-400">ID: {interaction.med_id_1 || "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{findMedName(interaction.med_id_2)}</div>
                        <div className="text-xs text-gray-400">ID: {interaction.med_id_2 || "-"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(interaction.severity)}`}>
                        <div className={`w-2 h-2 rounded-full ${getSeverityDotColor(interaction.severity)}`}></div>
                        {interaction.severity === "Critical" ? "อันตรายมาก" :
                         interaction.severity === "Severe" ? "รุนแรง" :
                         interaction.severity === "Moderate" ? "ปานกลาง" :
                         interaction.severity === "Mild" ? "ต่ำ" : "ไม่ระบุ"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getInteractionTypeColor(interaction.interaction_type)}`}>
                        <div className={`w-2 h-2 rounded-full ${getInteractionTypeDotColor(interaction.interaction_type)}`}></div>
                        {interaction.interaction_type === "compatible" ? "เข้ากัน" :
                         interaction.interaction_type === "incompatible" ? "ไม่เข้ากัน" :
                         interaction.interaction_type === "neutral" ? "ไม่เกิดปฏิกิริยา" : "ไม่ระบุ"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interaction.is_active)}`}>
                        <div className={`w-2 h-2 rounded-full ${getStatusDotColor(interaction.is_active)}`}></div>
                        {interaction.is_active ? "ใช้งาน" : "ไม่ใช้งาน"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition-colors"
                          onClick={() => handleViewDetail(interaction)}
                          aria-label="ดูรายละเอียด"
                        >
                          <FileText size={14} />
                          ดู
                        </button>
                        <button
                          className="flex items-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg text-xs font-medium transition-colors"
                          onClick={() => handleEdit(interaction)}
                          aria-label="แก้ไข"
                        >
                          <Edit3 size={14} />
                          แก้ไข
                        </button>
                        <button
                          className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors"
                          onClick={() => handleDelete(interaction.interaction_id)}
                          aria-label="ลบ"
                        >
                          <Trash2 size={14} />
                          ลบ
                        </button>
                      </div>
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

      {/* Detail Modal */}
      {showDetailModal && selectedInteraction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Share2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">รายละเอียดปฏิกิริยาระหว่างยา</h2>
                    <p className="text-blue-100 text-sm">รหัสปฏิกิริยา: {selectedInteraction.interaction_id || "-"}</p>
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
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="space-y-4 border-r border-gray-300 pr-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Pill className="h-5 w-5 text-blue-600" />
                    ข้อมูลพื้นฐาน
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "รหัสปฏิกิริยา", value: selectedInteraction.interaction_id || "-", key: "interaction_id" },
                      { label: "ยา 1", value: `${findMedName(selectedInteraction.med_id_1)} (ID: ${selectedInteraction.med_id_1 || "-"})`, key: "med_id_1" },
                      { label: "ชื่อยา 1 (ภาษาไทย)", value: findMedNameTH(selectedInteraction.med_id_1), key: "med_name_th_1" },
                      { label: "ยา 2", value: `${findMedName(selectedInteraction.med_id_2)} (ID: ${selectedInteraction.med_id_2 || "-"})`, key: "med_id_2" },
                      { label: "ชื่อยา 2 (ภาษาไทย)", value: findMedNameTH(selectedInteraction.med_id_2), key: "med_name_th_2" },
                      { label: "คำอธิบาย", value: selectedInteraction.description || "-", key: "description" },
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
                    <Share2 className="h-5 w-5 text-blue-600" />
                    สถานะและข้อมูลเพิ่มเติม
                  </h3>
                  <div className="space-y-3">
                    <div className="rounded-xl p-4 border border-2 border-blue-100">
                      <div className="flex items-center gap-4 text-center">
                        <p className="text-sm text-gray-600 ">ความรุนแรง:</p>
                        <div className="">
                          {(() => {
                            const status = getSeverityStatus(selectedInteraction.severity);
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
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">ความเข้ากัน:</span>
                      <span className={`font-medium ${getInteractionTypeColor(selectedInteraction.interaction_type)} px-3 py-1 rounded-full`}>
                        <span className={`w-2 h-2 rounded-full ${getInteractionTypeDotColor(selectedInteraction.interaction_type)} inline-block mr-1`}></span>
                        {selectedInteraction.interaction_type === "compatible" ? "เข้ากัน" :
                         selectedInteraction.interaction_type === "incompatible" ? "ไม่เข้ากัน" :
                         selectedInteraction.interaction_type === "neutral" ? "ไม่เกิดปฏิกิริยา" : "ไม่ระบุ"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">สถานะ:</span>
                      <span className={`font-medium ${getStatusColor(selectedInteraction.is_active)} px-3 py-1 rounded-full`}>
                        <span className={`w-2 h-2 rounded-full ${getStatusDotColor(selectedInteraction.is_active)} inline-block mr-1`}></span>
                        {selectedInteraction.is_active ? "ใช้งาน" : "ไม่ใช้งาน"}
                      </span>
                    </div>
                    {selectedInteraction.evidence_level && (
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">ระดับหลักฐาน:</span>
                        <span className="font-medium text-gray-900">{selectedInteraction.evidence_level}</span>
                      </div>
                    )}
                    {selectedInteraction.source_reference && (
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">แหล่งอ้างอิง:</span>
                        <a
                          href={selectedInteraction.source_reference}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline break-all"
                        >
                          {selectedInteraction.source_reference}
                        </a>
                      </div>
                    )}
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
                    <Share2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {isEditing ? "แก้ไขปฏิกิริยาระหว่างยา" : "เพิ่มปฏิกิริยาระหว่างยาใหม่"}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {isEditing ? `รหัสปฏิกิริยา: ${selectedInteraction?.interaction_id || "-"}` : "กรอกข้อมูลเพื่อเพิ่มปฏิกิริยาใหม่"}
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
                    <Pill className="h-5 w-5 text-blue-600" />
                    ข้อมูลยา
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ยา 1 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          value={searchMedicine1}
                          onChange={handleSearchMedicine1}
                          placeholder="ค้นหายา..."
                          required
                        />
                        {filteredMedicines1.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {filteredMedicines1.map((m) => (
                              <div
                                key={m.med_id}
                                className="cursor-pointer hover:bg-gray-100 p-3 border-b border-gray-100 last:border-b-0 text-sm"
                                onClick={() => {
                                  setForm({ ...form, med_id_1: m.med_id });
                                  setSearchMedicine1(m.med_name);
                                  setFilteredMedicines1([]);
                                }}
                              >
                                {m.med_name} (ID: {m.med_id})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ยา 2 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          value={searchMedicine2}
                          onChange={handleSearchMedicine2}
                          placeholder="ค้นหายา..."
                          required
                        />
                        {filteredMedicines2.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {filteredMedicines2.map((m) => (
                              <div
                                key={m.med_id}
                                className="cursor-pointer hover:bg-gray-100 p-3 border-b border-gray-100 last:border-b-0 text-sm"
                                onClick={() => {
                                  setForm({ ...form, med_id_2: m.med_id });
                                  setSearchMedicine2(m.med_name);
                                  setFilteredMedicines2([]);
                                }}
                              >
                                {m.med_name} (ID: {m.med_id})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
                        placeholder="อธิบายรายละเอียดของปฏิกิริยาระหว่างยา..."
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Share2 className="h-5 w-5 text-blue-600" />
                    สถานะและข้อมูลเพิ่มเติม
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ความรุนแรง</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        value={form.severity}
                        onChange={(e) => setForm({ ...form, severity: e.target.value })}
                      >
                        <option value="">-- เลือก --</option>
                        <option value="Mild">ต่ำ</option>
                        <option value="Moderate">ปานกลาง</option>
                        <option value="Severe">รุนแรง</option>
                        <option value="Critical">อันตรายมาก</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ความเข้ากัน</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        value={form.interaction_type}
                        onChange={(e) => setForm({ ...form, interaction_type: e.target.value })}
                      >
                        <option value="unknown">ไม่ระบุ</option>
                        <option value="compatible">เข้ากัน</option>
                        <option value="incompatible">ไม่เข้ากัน</option>
                        <option value="neutral">ไม่เกิดปฏิกิริยา</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        value={form.is_active === null ? "" : form.is_active.toString()}
                        onChange={(e) => {
                          const value = e.target.value;
                          const parsed = value === "true" ? true : value === "false" ? false : null;
                          setForm({ ...form, is_active: parsed });
                        }}
                      >
                        <option value="">-- เลือก --</option>
                        <option value="true">ใช้งาน</option>
                        <option value="false">ไม่ใช้งาน</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ระดับหลักฐาน</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={form.evidence_level}
                        onChange={(e) => setForm({ ...form, evidence_level: e.target.value })}
                        placeholder="ระบุระดับหลักฐาน..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">แหล่งอ้างอิง</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={form.source_reference}
                        onChange={(e) => setForm({ ...form, source_reference: e.target.value })}
                        placeholder="https://example.com/study"
                        required={false}
                      />
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