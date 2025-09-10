"use client";
import { useEffect, useState, useMemo } from "react";
import {
  X,
  Search,
  Plus,
  AlertTriangle,
  Trash2,
  Bell,
  Printer,
  FileText,
  Package,
  Pill,
  User,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import styles from "./main.module.css";
import { getPatients } from "@/app/api/patients";
import { getMedicines, getMedicineById } from "@/app/api/medicines";
import { createMedUsage } from "@/app/api/orders";
import Header from "./component/Header";
import { printLabel } from "@/app/api/print"; // Import the print function

const PRINTER_STORAGE_KEY = "selected_printer_share_name";
const isClient = typeof window !== "undefined";
const host = process.env.NEXT_PUBLIC_API_HOST || (isClient ? window.location.hostname : "localhost");

const getRandomDescription = () => {
  const descriptions = [
    "มีอาการไข้และปวดหัว",
    "มีอาการไอและเจ็บคอ",
    "มีอาการท้องเสียและปวดท้อง",
    "มีอาการเหนื่อยล้าและนอนไม่หลับ",
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

// FilterBadge Component
const FilterBadge = ({ label, value, onClear, icon: Icon }) => (
  <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
    <Icon className="h-4 w-4 text-gray-500" />
    <span>
      {label}: {value}
    </span>
    <button
      onClick={onClear}
      className="ml-1 text-gray-500 hover:text-red-600"
      aria-label={`ล้างตัวกรอง ${label}`}
    >
      <X size={16} />
    </button>
  </div>
);

export default function Home() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [diagnosisDescription, setDiagnosisDescription] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [formError, setFormError] = useState(null);

  const printer = useMemo(() => {
    if (isClient) {
      return localStorage.getItem(PRINTER_STORAGE_KEY);
    }
    return "GP"; // Default printer for server-side rendering
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientData, medicineData] = await Promise.all([getPatients(), getMedicines()]);
        setPatients(patientData || []);
        setMedicines(medicineData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    };
    fetchData();
  }, []);

  const validateAddMedicine = (medicines, qty) => {
    if (!medicines || medicines.length === 0) return "กรุณาเลือกยา";
    if (qty <= 0) return "จำนวนต้องมากกว่า 0";
    return null;
  };

  const handleAddMedicineWithValidation = (medicines, qty) => {
    const error = validateAddMedicine(medicines, qty);
    if (error) {
      setFormError(error);
      return;
    }
    setFormError(null);
    handleAddMedicine();
  };

  const handleSelectMedicine = (med) => {
    const newMedicine = {
      ...med,
      quantity: quantity,
      isPrinted: false,
      med_selling_price: parseFloat(med.med_selling_price) || 0,
      med_dose_dialogue: med.med_dose_dialogue || "ไม่ระบุ",
    };
    setSelectedMedicine((prev) => [...prev, newMedicine]);
    setMedicineSearchTerm("");
    setFilteredMedicines([]);
    setQuantity(1);
  };

  const calculateTotalPrice = (medList) => {
    return medList
      .reduce((total, med) => total + (med.quantity || 1) * (parseFloat(med.med_selling_price) || 0), 0)
      .toFixed(2);
  };

  const generateRandomQuantities = (length) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 5) + 1);
  };

  async function updateStockAndHistory(patientId, med) {
    const now = new Date();
    const localTime = now.toISOString().slice(0, 19);
    try {
      const medData = await getMedicineById(med.med_id);
      if (!medData) throw new Error("ไม่พบข้อมูลยา");
      const currentStock = medData.med_quantity || 0;
      const newBalance = currentStock - (med.quantity || 1);

      const stockResponse = await fetch(`http://${host}:3001/medicine/stock_history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          med_id: med.med_id,
          change_type: "dispense",
          quantity_change: -(med.quantity || 1),
          balance_after: newBalance,
          reference_id: null,
        }),
      });
      if (!stockResponse.ok) throw new Error("บันทึก stock history ล้มเหลว");

      if (!med.isPrinted) {
        const overdueResponse = await fetch(`http://${host}:3001/medicine/overdue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            med_id: med.med_id,
            patient_id: patientId,
            time: localTime,
            dispense_status: false,
          }),
        });
        if (!overdueResponse.ok) throw new Error("บันทึก overdue ล้มเหลว");
      }
    } catch (err) {
      console.error("❌ บันทึก stock/overdue ล้มเหลว:", err);
      throw err;
    }
  }

  const handleRandomMedicine = async (patient) => {
    try {
      if (medicines.length === 0) throw new Error("ไม่พบข้อมูลยา");
      const numOfMedicines = Math.floor(Math.random() * 5) + 1;
      const selectedMeds = medicines.sort(() => 0.5 - Math.random()).slice(0, numOfMedicines);
      const randomQuantities = generateRandomQuantities(selectedMeds.length);

      const medicineDataPromises = selectedMeds.map((med) => getMedicineById(med.med_id));
      const medicineData = await Promise.all(medicineDataPromises);

      const medicinesWithQuantity = medicineData
        .filter((med) => med && med.med_id)
        .map((med, index) => ({
          ...med,
          quantity: randomQuantities[index],
          isPrinted: false,
          med_selling_price: parseFloat(med.med_selling_price) || 0,
          med_dose_dialogue: med.med_dose_dialogue || "ไม่ระบุ",
        }));

      setSelectedMedicine(medicinesWithQuantity);
      setSelectedPatient(patient);
      setDiagnosisDescription(getRandomDescription());
      setShowMedicineModal(true);
      setShowPatientModal(false);
    } catch (error) {
      console.error("Error in handleRandomMedicine:", error);
      alert("เกิดข้อผิดพลาดในการเลือกยา");
    }
  };

  const handleAddMedicine = () => {
    const selectedMed = medicines.find((med) => med.med_name.toLowerCase() === medicineSearchTerm.toLowerCase());
    if (!selectedMed) {
      setFormError("กรุณาเลือกยาจากรายการ");
      return;
    }
    const newMedicine = {
      ...selectedMed,
      quantity: quantity,
      isPrinted: false,
      med_selling_price: parseFloat(selectedMed.med_selling_price) || 0,
      med_dose_dialogue: selectedMed.med_dose_dialogue || "ไม่ระบุ",
    };
    setSelectedMedicine((prev) => [...prev, newMedicine]);
    setMedicineSearchTerm("");
    setFilteredMedicines([]);
    setQuantity(1);
    setFormError(null);
  };

  const handleSearchMedicine = (e) => {
    const term = e.target.value;
    setMedicineSearchTerm(term);
    if (term.trim() === "") {
      setFilteredMedicines([]);
    } else {
      const results = medicines.filter((med) =>
        [med.med_name, med.med_generic_name, med.med_thai_name]
          .filter(Boolean)
          .some((name) => name.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredMedicines(results);
    }
  };

  const handleRemoveMedicine = (index) => {
    setSelectedMedicine((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePrintMedicine = async () => {
    const toPrint = selectedMedicine.filter((med) => !med.isPrinted);
    if (toPrint.length === 0) {
      alert("ไม่มีรายการยาที่ยังไม่ได้พิมพ์");
      return;
    }
    // แสดงรายการที่จะพิมพ์
    alert(
      `ยาที่พิมพ์:\n${toPrint
        .map((med) => `${med.med_name} x ${med.quantity}`)
        .join("\n")}`
    );

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // ✅ เพิ่มตัวแปรสำหรับเก็บรายการยาที่พิมพ์ไม่สำเร็จ
    let failedPrints = [];

    for (const med of toPrint) {
      const printText = `${selectedPatient.first_name_eng} ${selectedPatient.last_name_eng}\n\n${med.med_name}\n${med.med_dose_dialogue}\nQuantity: ${med.quantity}`;
      try {
        if (!printer) {
          // ✅ แจ้งเตือนผู้ใช้ให้เลือกเครื่องพิมพ์ และออกจากฟังก์ชัน
          alert("กรุณาเลือกเครื่องพิมพ์ใหม่หรือตรวจสอบการเชื่อมต่อ");
          // ไม่มีการอัปเดตสถานะการพิมพ์ยา
          return; 
        }
        console.log("printer:" + printer)
        await printLabel(printText, printer);
        console.log(`✅ พิมพ์สำเร็จ (${med.med_name})`);

      } catch (err) {
        // ✅ เก็บรายการยาที่พิมพ์ไม่สำเร็จ
        failedPrints.push(med.med_name);
        console.error(`❌ พิมพ์ไม่สำเร็จ (${med.med_name}):`, err);
      }
      await sleep(400);
    }

    // ✅ ตรวจสอบว่ามีการพิมพ์ที่ล้มเหลวหรือไม่
    if (failedPrints.length > 0) {
      alert(`เกิดข้อผิดพลาดในการพิมพ์ยา: ${failedPrints.join(", ")}
  กรุณาเลือกเครื่องพิมพ์ใหม่หรือตรวจสอบการเชื่อมต่อ`);
    } else {
      // หากพิมพ์สำเร็จทั้งหมด ค่อยอัปเดตสถานะของยา
      setSelectedMedicine((prev) =>
        prev.map((med) => (med.isPrinted ? med : { ...med, isPrinted: true }))
      );
      alert("พิมพ์ฉลากยาทั้งหมดเรียบร้อยแล้ว");
    }
  };

const handleDispense = async () => {
  if (!selectedPatient || selectedMedicine.length === 0) {
    alert("กรุณาเลือกผู้ป่วยและยาอย่างน้อยหนึ่งรายการ");
    return;
  }
  try {
    const medicinesData = selectedMedicine.map((med) => ({
      med_id: med.med_id,
      quantity: med.quantity || 1,
    }));
    const response = await fetch(`http://${host}:3001/medicine/orderHistory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: selectedPatient.patient_id,
        doctor_id: 0,
        description: diagnosisDescription,
        medicines: medicinesData,
      }),
    });
    if (!response.ok) throw new Error(`บันทึก order history ล้มเหลว: ${response.statusText}`);

    for (const med of selectedMedicine) {
      await createMedUsage(selectedPatient.patient_id, med);
      await updateStockAndHistory(selectedPatient.patient_id, med);
    }
    alert(`เรียกคิว คุณ ${selectedPatient.first_name} ${selectedPatient.last_name} รับยาค่ะ`);
    setShowMedicineModal(false);
    setSelectedMedicine([]);
    setSelectedPatient(null);
  } catch (error) {
    console.error("Error in handleDispense:", error);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  }
};

  const handleChangeQuantity = (index, value) => {
    const newQuantity = parseInt(value, 10);
    setSelectedMedicine((prev) =>
      prev.map((med, i) =>
        i === index ? { ...med, quantity: isNaN(newQuantity) || newQuantity < 1 ? 1 : newQuantity } : med
      )
    );
  };

  const handleSearchPatient = (e) => {
    const term = e.target.value.toLowerCase().trim();
    setPatientSearchTerm(term);
  };

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString("th-TH");
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH");
  };

  const clearIndividualFilter = (type) => {
    switch (type) {
      case "patient":
        setPatientSearchTerm("");
        break;
      case "date":
        setSearchDate("");
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setPatientSearchTerm("");
    setSearchDate("");
  };

  const hasActiveFilters = patientSearchTerm || searchDate;

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const hn = (p.hn_number || "").toLowerCase();
      const nationalId = (p.national_id || "").toLowerCase();
      const fullNameTh = `${p.first_name} ${p.last_name}`.toLowerCase();
      const fullNameEn = `${p.first_name_en || ""} ${p.last_name_en || ""}`.toLowerCase();
      const patientId = `${p.patient_id}`.toLowerCase();
      const patientMatch =
        !patientSearchTerm ||
        hn.includes(patientSearchTerm) ||
        nationalId.includes(patientSearchTerm) ||
        fullNameTh.includes(patientSearchTerm) ||
        fullNameEn.includes(patientSearchTerm) ||
        patientId.includes(patientSearchTerm);

      // Note: Since the table uses new Date() for date, date filtering is not fully functional
      // If patient data includes a date field (e.g., p.visit_date), update this logic
      const dateMatch = !searchDate || formatDate(new Date()).includes(searchDate);

      return patientMatch && dateMatch;
    });
  }, [patients, patientSearchTerm, searchDate]);

  return (
    <div>
      <Header
        header={"ระบบการจ่ายยา"}
        description={"จัดการรายการยาและผู้ป่วยได้อย่างรวดเร็วและปลอดภัย"}
        icon={Pill}
      />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ผู้ป่วยรอรับยา</h1>
      {/* Filters Section */}
      <div className="mb-6">
        {/* {!isFilterExpanded ? ( */}
        {isFilterExpanded ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterExpanded(true)}
              className="w-40 relative bg-white rounded-full p-3 shadow-sm border border-gray-100 hover:bg-blue-50 transition-all group"
              aria-label="แสดงตัวกรอง"
              aria-expanded="false"
            >
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                <span className="">
                  แสดงตัวกรอง
                </span>
              </div>
            </button>
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {patientSearchTerm && (
                  <FilterBadge
                    label="ผู้ป่วย"
                    value={patientSearchTerm}
                    onClear={() => clearIndividualFilter("patient")}
                    icon={User}
                  />
                )}
                {searchDate && (
                  <FilterBadge
                    label="วันที่"
                    value={formatDate(searchDate)}
                    onClear={() => clearIndividualFilter("date")}
                    icon={CalendarDays}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300"
            role="region"
            aria-labelledby="filter-heading"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Search */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <User className="mr-2 h-4 w-4 text-blue-500" />
                  ค้นหาผู้ป่วย
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ชื่อ, HN, เลขบัตรประชาชน, หรือคิว"
                    value={patientSearchTerm}
                    onChange={handleSearchPatient}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    aria-label="ค้นหาผู้ป่วยโดยชื่อ, HN, เลขบัตรประชาชน, หรือคิว"
                  />
                </div>
              </div>
              {/* Date Search */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <CalendarDays className="mr-2 h-4 w-4 text-orange-500" />
                  วันที่เริ่มใช้
                </label>
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  aria-label="เลือกวันที่เริ่มใช้"
                />
              </div>
            </div>
            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 mr-2">ตัวกรองที่ใช้:</span>
                    {patientSearchTerm && (
                      <FilterBadge
                        label="ผู้ป่วย"
                        value={patientSearchTerm}
                        onClear={() => clearIndividualFilter("patient")}
                        icon={User}
                      />
                    )}
                    {searchDate && (
                      <FilterBadge
                        label="วันที่"
                        value={formatDate(searchDate)}
                        onClear={() => clearIndividualFilter("date")}
                        icon={CalendarDays}
                      />
                    )}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    aria-label="ล้างตัวกรองทั้งหมด"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="font-medium">ล้างทั้งหมด</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl overflow-hidden mb-8 shadow-sm">
        <div className="h-[73vh] overflow-y-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="w-full">
              <thead className="bg-blue-500 sticky top-0 z-10 text-white">
                <tr>
                  <th className="px-4 py-3 text-left ">คิว</th>  
                  <th className="px-4 py-3 text-left ">HN</th>
                  <th className="px-4 py-3 text-left ">ผู้รับบริการ</th>
                  <th className="px-4 py-3 text-left ">วันที่/เวลา</th>
                  <th className="px-4 py-3 text-center">จ่ายยา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPatients.length > 0 || patientSearchTerm || searchDate ? (
                  filteredPatients.map((pat) => (
                    <tr
                      key={pat.patient_id}
                      className="hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSelectedPatient(pat);
                        setDiagnosisDescription(getRandomDescription());
                        setShowPatientModal(true);
                      }}
                    >
                      <td className="px-4 py-4">{pat.patient_id}</td>
                      <td className="px-4 py-4">{pat.hn_number}</td>
                      <td className="px-4 py-4">
                        {pat.first_name} {pat.last_name}
                      </td>
                      <td className="px-4 py-4">{formatDate(new Date())}</td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRandomMedicine(pat);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white cursor-pointer px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                          aria-label={`จ่ายยาให้ ${pat.first_name} ${pat.last_name}`}
                        >
                          จ่ายยา
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  patients.map((pat) => (
                    <tr
                      key={pat.patient_id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedPatient(pat);
                        setDiagnosisDescription(getRandomDescription());
                        setShowPatientModal(true);
                      }}
                    >
                      <td className="border border-gray-200 p-3">{pat.patient_id}</td>
                      <td className="border border-gray-200 p-3">{pat.hn_number}</td>
                      <td className="border border-gray-200 p-3">
                        {pat.first_name} {pat.last_name}
                      </td>
                      <td className="border border-gray-200 p-3">{formatDate(new Date())}</td>
                      <td className="border border-gray-200 p-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRandomMedicine(pat);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white cursor-pointer px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                          aria-label={`จ่ายยาให้ ${pat.first_name} ${pat.last_name}`}
                        >
                          จ่ายยา
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Patient Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-lg transform scale-100 transition-transform duration-300"
            role="dialog"
            aria-modal="true"
            aria-label="ข้อมูลผู้ป่วย"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">ข้อมูลผู้ป่วย</h2>
                <button
                  onClick={() => {
                    setShowPatientModal(false);
                    setSelectedPatient(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="ปิดหน้าต่างข้อมูลผู้ป่วย"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">ข้อมูลทั่วไป</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">HN:</span>
                      <span className="text-gray-600">{selectedPatient.hn_number}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">เลขบัตรประชาชน:</span>
                      <span className="text-gray-600">{selectedPatient.national_id}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">ชื่อ-นามสกุล:</span>
                      <span className="text-gray-600">
                        {selectedPatient.first_name} {selectedPatient.last_name}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="text-gray-600">
                        {selectedPatient.first_name_eng} {selectedPatient.last_name_eng}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">เพศ:</span>
                      <span className="text-gray-600">{selectedPatient.gender}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">วันเกิด:</span>
                      <span className="text-gray-600">{formatDate(selectedPatient.birthday)}</span>
                      <span className="text-gray-600">
                        {selectedPatient.age_y} ปี {selectedPatient.age_m} เดือน {selectedPatient.age_d} วัน
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">กรุ๊ปเลือด:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600">
                        {selectedPatient.blood_group}
                      </span>
                    </p>
                    <div className="text-center mt-4">
                      <img
                        src={
                          selectedPatient.photo ||
                          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/1200px-User_icon_2.svg.png"
                        }
                        alt="รูปภาพผู้ป่วย"
                        className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">ข้อมูลสุขภาพ</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-red-600" />
                      ประวัติแพ้ยา:
                    </span>
                    {selectedPatient.allergy_med_names && selectedPatient.allergy_med_names !== "ไม่มีข้อมูล" ? (
                      <ul className="list-disc pl-5 mt-1 text-red-600 bg-red-50 p-2 rounded-md">
                        {selectedPatient.allergy_med_names.split(", ").map((med, index) => (
                          <li key={index}>{med}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 ml-5">ไม่มี</p>
                    )}
                  </div>
                  <p className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">ประวัติทางการแพทย์ (PMH):</span>
                    <span className="text-gray-600">{selectedPatient.PMH || "ไม่มี"}</span>
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">ส่วนสูง:</span>
                      <span className="text-gray-600">{selectedPatient.height} ซม.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">น้ำหนัก:</span>
                      <span className="text-gray-600">{selectedPatient.weight} กก.</span>
                    </p>
                    <p className="flex items-center gap-2 relative group">
                      <span className="font-medium text-gray-700">BMI:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600">
                        {selectedPatient.bmi}
                      </span>
                      <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        ค่าดัชนีมวลกาย
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">ข้อมูลการติดต่อ</h3>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">เบอร์โทร:</span>
                    <span className="text-gray-600">{selectedPatient.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">ที่อยู่:</span>
                    <span className="text-gray-600">
                      {selectedPatient.house_number} หมู่ {selectedPatient.village_number}, {selectedPatient.road}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">ตำบล/อำเภอ/จังหวัด:</span>
                    <span className="text-gray-600">
                      ต.{selectedPatient.sub_district}, อ.{selectedPatient.district}, จ.{selectedPatient.province}{" "}
                      {selectedPatient.postal_code}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medicine Modal */}
      {showMedicineModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-lg transform scale-100 transition-transform duration-300"
            role="dialog"
            aria-modal="true"
            aria-label="จัดการรายการยา"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">จัดการรายการยา</h2>
                <button
                  onClick={() => {
                    setShowMedicineModal(false);
                    setFormError("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="ปิดหน้าต่างจัดการรายการยา"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      selectedPatient.photo ||
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/1200px-User_icon_2.svg.png"
                    }
                    alt="รูปภาพผู้ป่วย"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-md"
                  />
                  <div className="flex-1">
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">HN:</span>
                      <span className="text-gray-600">{selectedPatient.hn_number}</span>
                      <span className="font-medium text-gray-700 ml-4">เลขบัตรประชาชน:</span>
                      <span className="text-gray-600">{selectedPatient.national_id}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">ชื่อ-นามสกุล:</span>
                      <span className="text-gray-600">
                        {selectedPatient.first_name} {selectedPatient.last_name}
                      </span>
                      <span className="font-medium text-gray-700 ml-4">เพศ:</span>
                      <span className="text-gray-600">{selectedPatient.gender}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">วันเกิด:</span>
                      <span className="text-gray-600">{formatDate(selectedPatient.birthday)}</span>
                      <span className="text-gray-600">
                        {selectedPatient.age_y} ปี {selectedPatient.age_m} เดือน {selectedPatient.age_d} วัน
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 bg-red-50 p-2 rounded-md flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-600" />
                  <p className="text-red-600">
                    <span className="font-medium">ผลวินิจฉัยเบื้องต้น:</span> {diagnosisDescription}
                  </p>
                </div>
              </div>
              {formError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={20} />
                  <span>{formError}</span>
                </div>
              )}
              <div className="mb-4">
                <form className="grid grid-cols-6 gap-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="col-span-4 relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="ค้นหายา..."
                      value={medicineSearchTerm}
                      onChange={handleSearchMedicine}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      aria-label="ค้นหายา"
                    />
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    placeholder="จำนวน"
                    className="col-span-1 border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24"
                    aria-label="จำนวนยา"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddMedicineWithValidation(filteredMedicines, quantity)}
                    className="col-span-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                    aria-label="เพิ่มยา"
                  >
                    <Plus size={18} />
                    เพิ่ม
                  </button>
                </form>
              </div>
              {filteredMedicines.length > 0 && (
                <ul className="bg-white border border-gray-200 shadow-md rounded-lg max-h-48 overflow-y-auto mb-4">
                  {filteredMedicines.map((med) => (
                    <li
                      key={med.med_id}
                      className="p-2 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleSelectMedicine(med)}
                      aria-label={`เลือกยา ${med.med_name}`}
                    >
                      {med.med_name}
                    </li>
                  ))}
                </ul>
              )}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse rounded-lg shadow-sm">
                  <thead>
                    <tr className="bg-blue-50 text-blue-800">
                      <th className="border border-gray-200 p-3 text-left font-semibold">ชื่อยา</th>
                      <th className="border border-gray-200 p-3 text-center font-semibold">สถานะพิมพ์</th>
                      <th className="border border-gray-200 p-3 text-center font-semibold">จำนวน</th>
                      <th className="border border-gray-200 p-3 text-center font-semibold">ราคาต่อหน่วย (บาท)</th>
                      <th className="border border-gray-200 p-3 text-center font-semibold">ราคารวม (บาท)</th>
                      <th className="border border-gray-200 p-3 text-center font-semibold">ขนาดยา</th>
                      <th className="border border-gray-200 p-3 text-center font-semibold">ลบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMedicine.map((medicine, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50 transition-colors ${medicine.isPrinted ? "text-gray-400" : ""}`}
                      >
                        <td className="border border-gray-200 p-3">{medicine.med_name}</td>
                        <td className="border border-gray-200 p-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              medicine.isPrinted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {medicine.isPrinted ? "พิมพ์แล้ว" : "รอพิมพ์"}
                          </span>
                        </td>
                        <td className="border border-gray-200 p-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={medicine.quantity}
                            onChange={(e) => handleChangeQuantity(index, e.target.value)}
                            className="border border-gray-200 p-1 w-16 text-center rounded focus:ring-2 focus:ring-blue-500"
                            aria-label={`จำนวนยา ${medicine.med_name}`}
                          />
                        </td>
                        <td className="border border-gray-200 p-3 text-center">
                          {(parseFloat(medicine.med_selling_price) || 0).toFixed(2)}
                        </td>
                        <td className="border border-gray-200 p-3 text-center">
                          {(parseFloat(medicine.quantity * medicine.med_selling_price) || 0).toFixed(2)}
                        </td>
                        <td className="border border-gray-200 p-3 text-center">{medicine.med_dose_dialogue}</td>
                        <td className="border border-gray-200 p-3 text-center">
                          <button
                            onClick={() => handleRemoveMedicine(index)}
                            className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                            aria-label={`ลบยา ${medicine.med_name}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-green-600">
                  ราคารวม: {calculateTotalPrice(selectedMedicine)} บาท
                </h3>
                <div className="flex gap-4">
                  <button
                    onClick={handleDispense}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center gap-2"
                    aria-label="เรียกคิว"
                  >
                    <Bell size={18} />
                    เรียกคิว
                  </button>
                  <button
                    onClick={handlePrintMedicine}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                    aria-label="พิมพ์ยา"
                  >
                    <Printer size={18} />
                    พิมพ์ยา
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}