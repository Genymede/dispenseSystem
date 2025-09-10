"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { X, Search, AlertTriangle, Trash2, Bell, Printer, Pill, User, Tablets } from "lucide-react";
import Swal from "sweetalert2";
import { getPatients } from "@/app/api/patients";
import { getMedicineById } from "../api/medicines";
import { printLabel } from "@/app/api/print";
import Header from "../component/Header";
import { FormatDate, FormatDateTime } from "../component/formatDate";

const imgPath = "/image/patient_image/";
const PRINTER_STORAGE_KEY = "selected_printer_share_name";
const isClient = typeof window !== "undefined";
const host = process.env.NEXT_PUBLIC_API_HOST || (isClient ? window.location.hostname : "localhost");

// Centralized error handler
const handleError = (title, message, error) => {
  console.error(`${title}:`, error);
  Swal.fire({ icon: "error", title, text: message, confirmButtonText: "ตกลง" });
};

// API fetch functions
const fetchStocks = async () => {
  try {
    const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/stock`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Fetch error in fetchStocks:", error);
    return [];
  }
};

const fetchMedicines = async () => {
  try {
    const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Fetch error in fetchMedicines:", error);
    return [];
  }
};

const fetchAllergy = async () => {
  try {
    const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/allergy`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Fetch error in getAllergy:", error);
    return [];
  }
};

const fetchDrugInteractions = async () => {
  try {
    const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/interactions`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Fetch error in checkDrugInteractions:", error);
    return [];
  }
};

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// FilterBadge Component
const FilterBadge = ({ label, value, onClear, icon: Icon }) => (
  <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
    <Icon className="h-4 w-4 text-gray-500" />
    <span>{label}: {value}</span>
    <button onClick={onClear} className="ml-1 text-gray-500 hover:text-red-600" aria-label={`ล้างตัวกรอง ${label}`}>
      <X size={16} />
    </button>
  </div>
);

const getRandomDescription = () => {
  const descriptions = [
    "มีอาการไข้และปวดหัว",
    "มีอาการไอและเจ็บคอ",
    "มีอาการท้องเสียและปวดท้อง",
    "มีอาการเหนื่อยล้าและนอนไม่หลับ",
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

export default function Dispense() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [medicineData, setMedicineData] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [diagnosisDescription, setDiagnosisDescription] = useState("");
  const [formError, setFormError] = useState(null);
  const [allergyData, setAllergyData] = useState([]);
  const [user, setUser] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const printer = useMemo(() => (isClient ? localStorage.getItem(PRINTER_STORAGE_KEY) || "GP" : "GP"), []);

  useEffect(() => {
    if (!isClient) return;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        setError("ไม่พบข้อมูลผู้ใช้ใน localStorage");
        setLoading(false);
        return;
      }
      const user = JSON.parse(raw);
      if (!user || typeof user.user_id === "undefined") {
        setError("ข้อมูลผู้ใช้ไม่มี user_id ที่ถูกต้อง");
        setLoading(false);
        return;
      }
      if (user.role !== "pharmacist") {
        setError("ผู้ใช้ไม่มีสิทธิ์เข้าถึงระบบจ่ายยา (ต้องมีบทบาท pharmacist)");
        setLoading(false);
        return;
      }
      setUser(user);
      setLoading(false);
    } catch (err) {
      setError("อ่านข้อมูลผู้ใช้ไม่สำเร็จ: " + (err?.message || String(err)));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientData, stockData, medicineData, interactionData, allergyData] = await Promise.all([
          getPatients(),
          fetchStocks(),
          fetchMedicines(),
          fetchDrugInteractions(),
          fetchAllergy(),
        ]);

        const medicineMap = new Map(medicineData.map((med) => [med.med_id, med]));
        const mergedMedicines = stockData.map((stock) => {
          const medicine = medicineMap.get(stock.med_id) || {};
          return {
            ...stock,
            med_name: medicine.med_name || stock.med_showname,
            med_thai_name: medicine.med_thai_name || stock.med_showname,
            med_showname_en: stock.med_showname_en || "",
            med_selling_price: stock.unit_price || 0,
            med_dose_dialogue: medicine.med_dose_dialogue || "ไม่ระบุ",
            med_marketing_name: medicine.med_marketing_name || "",
          };
        });

        setPatients(patientData || []);
        setMedicines(mergedMedicines || []);
        setMedicineData(medicineData || []);
        setInteractions(interactionData || []);
        setAllergyData(allergyData || []);
      } catch (error) {
        handleError("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการโหลดข้อมูล", error);
      }
    };
    fetchData();
  }, []);

  const patientAllergies = useMemo(() => {
    if (!selectedPatient || !allergyData || allergyData.length === 0) {
      return { medIds: new Set(), details: new Map() };
    }
    const medIds = new Set();
    const details = new Map();
    allergyData
      .filter((allergy) => allergy.patient_id === selectedPatient.patient_id)
      .forEach((allergy) => {
        medIds.add(allergy.med_id);
        details.set(allergy.med_id, {
          symptoms: allergy.symptoms || "ไม่ระบุ",
          severity: allergy.severity || "ไม่ระบุ",
        });
      });
    return { medIds, details };
  }, [selectedPatient, allergyData]);

  const checkAllergy = useCallback(
    (med) => {
      return patientAllergies.medIds.has(med.med_id);
    },
    [patientAllergies]
  );

  const checkInteractions = useCallback(
    (med, selectedMeds) => {
      return interactions.filter(
        (interaction) =>
          interaction.is_active &&
          interaction.interaction_type !== "compatible" &&
          selectedMeds.some(
            (selectedMed) =>
              (interaction.med_id_1 === selectedMed.med_id && interaction.med_id_2 === med.med_id) ||
              (interaction.med_id_2 === selectedMed.med_id && interaction.med_id_1 === med.med_id)
          )
      );
    },
    [interactions]
  );

  const saveAsPending = useCallback(
    async (med, patientId, quantity) => {
      try {
        if (!med.med_id || !med.med_sid || !patientId || isNaN(quantity) || quantity < 1) {
          throw new Error("ข้อมูลสำหรับบันทึกยาค้างจ่ายไม่ครบถ้วน");
        }
        const now = new Date().toISOString();
        const overdueResponse = await fetch(`https://dispensesystem-production.up.railway.app/medicine/overdue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            med_id: med.med_id,
            med_sid: med.med_sid,
            patient_id: patientId,
            quantity: quantity,
            dispense_status: false,
          }),
        });
        if (!overdueResponse.ok) {
          throw new Error(`บันทึกยาค้างจ่ายล้มเหลว: ${overdueResponse.statusText}`);
        }
        return await overdueResponse.json();
      } catch (error) {
        handleError("ข้อผิดพลาดในการบันทึกยาค้างจ่าย", `ไม่สามารถบันทึกยาค้างจ่ายได้: ${error.message}`, error);
        throw error;
      }
    },
    []
  );

  const handleSelectMedicine = useCallback(
    async (med) => {
      if (!selectedPatient) {
        Swal.fire({
          icon: "warning",
          title: "ไม่พบผู้ป่วย",
          text: "กรุณาเลือกผู้ป่วยก่อนเพิ่มยา",
          confirmButtonText: "ตกลง",
        });
        return;
      }

      if (med.is_expired) {
        Swal.fire({
          icon: "error",
          title: "ไม่สามารถเพิ่มยาได้",
          text: `ยา ${med.med_showname} หมดอายุแล้ว (หมดอายุเมื่อ ${new Date(med.exp_date).toLocaleDateString('th-TH')})`,
          confirmButtonText: "ตกลง",
        });
        return;
      }

      if (med.med_quantity < quantity || med.med_quantity < med.min_quantity) {
        Swal.fire({
          icon: "warning",
          title: "สต็อกยาไม่เพียงพอ",
          text: `ยา ${med.med_showname} มีสต็อก ${med.med_quantity} หน่วย (ต่ำกว่าขั้นต่ำ ${med.min_quantity} หน่วย หรือจำนวนที่ต้องการ ${quantity} หน่วย)`,
          confirmButtonText: "ตกลง",
        });
        Swal.fire({
          icon: "warning",
          title: `ยา ${med.med_showname} สต็อกไม่พอ`,
          text: `ต้องการบันทึกยา ${med.med_showname} เป็นยาค้างจ่ายหรือไม่`,
          showCancelButton: true,
          confirmButtonText: "บันทึก",
          cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await saveAsPending(med, selectedPatient.patient_id, quantity);
              Swal.fire({
                icon: "success",
                title: "บันทึกแล้ว!",
                text: `รายการยา ${med.med_showname} ถูกบันทึกเป็นยาค้างจ่ายเรียบร้อยแล้ว`,
                confirmButtonText: "ตกลง",
              });
            } catch (error) {
              // Error handled in saveAsPending
            }
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              icon: "error",
              title: "ยกเลิก",
              text: "คุณยกเลิกการบันทึกรายการยา",
              confirmButtonText: "ตกลง",
            });
          }
        });
        return;
      }

      const isAllergic = checkAllergy(med);
      if (isAllergic) {
        const allergyInfo = patientAllergies.details.get(med.med_id);
        Swal.fire({
          icon: "warning",
          title: "คำเตือนการแพ้ยา",
          text: `ผู้ป่วย ${selectedPatient.first_name} ${selectedPatient.last_name} มีประวัติแพ้ยา ${med.med_showname}\nอาการ: ${allergyInfo.symptoms}\nความรุนแรง: ${allergyInfo.severity}`,
          confirmButtonText: "ตกลง",
        });
        return;
      }

      try {
        const relevantInteractions = checkInteractions(med, selectedMedicine);
        if (relevantInteractions.length > 0) {
          const interactionDetails = relevantInteractions
            .map((interaction) => {
              const med1 = medicines.find((m) => m.med_id === interaction.med_id_1)?.med_showname || `ID ${interaction.med_id_1}`;
              const med2 = medicines.find((m) => m.med_id === interaction.med_id_2)?.med_showname || `ID ${interaction.med_id_2}`;
              return `${med1} และ ${med2}\nความรุนแรง: ${interaction.severity || "ไม่ระบุ"}\nรายละเอียด: ${interaction.description}`;
            })
            .join("\n\n");

          const result = await Swal.fire({
            icon: "warning",
            title: "คำเตือนปฏิกิริยาระหว่างยา",
            text: `พบปฏิกิริยาระหว่างยา:\n\n${interactionDetails}\n\nต้องการเพิ่มยานี้ต่อหรือไม่?`,
            showCancelButton: true,
            confirmButtonText: "เพิ่มต่อ",
            cancelButtonText: "ยกเลิก",
          });

          if (!result.isConfirmed) return;
        }

        setSelectedMedicine((prev) => [
          ...prev,
          {
            ...med,
            med_name: med.med_showname,
            quantity,
            isPrinted: false,
            med_selling_price: parseFloat(med.unit_price) || 0,
            med_dose_dialogue: med.med_dose_dialogue || "ไม่ระบุ",
          },
        ]);
        setMedicineSearchTerm("");
        setFilteredMedicines([]);
        setQuantity(1);
      } catch (error) {
        handleError("ข้อผิดพลาด", "ไม่สามารถตรวจสอบปฏิกิริยาระหว่างยาได้ กรุณาลองเพิ่มยาอีกครั้ง", error);
      }
    },
    [selectedPatient, quantity, medicines, checkAllergy, checkInteractions, saveAsPending]
  );

  const handleSearchMedicine = useCallback(
    debounce((term) => {
      setMedicineSearchTerm(term);
      if (term.trim() === "") {
        setFilteredMedicines([]);
      } else {
        const results = medicines.filter((med) => 
          (med.med_showname?.toLowerCase().includes(term.toLowerCase())) ||
          (med.med_showname_en?.toLowerCase().includes(term.toLowerCase())) ||
          (med.med_name?.toLowerCase().includes(term.toLowerCase())) ||
          (med.med_thai_name?.toLowerCase().includes(term.toLowerCase())) ||
          (med.med_marketing_name?.toLowerCase().includes(term.toLowerCase()))
        );
        setFilteredMedicines(results);
      }
    }, 0),
    [medicines]
  );

  const handleSearchPatient = useCallback(
    debounce((term) => setPatientSearchTerm(term.toLowerCase()), 0),
    []
  );

  const handleRemoveMedicine = useCallback((med) => {
    Swal.fire({
      title: "ยืนยันการลบยา",
      text: `คุณต้องการลบยา ${med.med_showname} ออกจากรายการหรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedMedicine((prev) => prev.filter((item) => item.med_sid !== med.med_sid));
        Swal.fire({
          icon: "success",
          title: "ลบแล้ว!",
          text: `รายการยา ${med.med_showname} ถูกลบเรียบร้อยแล้ว`,
          confirmButtonText: "ตกลง",
        });
      }
    });
  }, []);

  const calculateTotalPrice = useCallback(
    (medList) =>
      medList
        .reduce((total, med) => total + (med.quantity || 1) * (parseFloat(med.unit_price) || 0), 0)
        .toFixed(2),
    []
  );

  const generateRandomQuantities = useCallback((length, maxQuantity) => 
    Array.from({ length }, () => Math.floor(Math.random() * Math.min(maxQuantity, 5)) + 1), 
    []
  );

  const updateStock = async (med_sid, med) => {
    try {
      if (!med_sid || !med || isNaN(med.med_quantity) || !med.med_id) {
        throw new Error("ข้อมูลสต็อกไม่ครบถ้วนหรือไม่ถูกต้อง");
      }

      const stockData = {
        med_sid: med_sid,
        med_id: med.med_id,
        med_quantity: med.med_quantity,
        packaging_type: med.packaging_type,
        is_divisible: med.is_divisible,
        location: med.location,
        med_showname: med.med_showname,
        min_quantity: med.min_quantity,
        max_quantity: med.max_quantity,
        cost_price: med.cost_price,
        unit_price: med.unit_price,
        med_showname_en: med.med_showname_eng || "",
        exp_date: med.exp_date,
        mfg_date: med.mfg_date || null,
        is_expired: med.is_expired || false,
      };
      const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/stock/${med_sid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stockData),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Update stock error:", error);
      throw error;
    }
  };

  const updateStockAndHistory = useCallback(
    async (patientId, med) => {
      const now = new Date().toISOString().slice(0, 19);
      try {
        if (!med.med_id || !med.med_sid || isNaN(med.quantity) || isNaN(med.med_quantity)) {
          throw new Error("ข้อมูลยาไม่ครบถ้วนหรือไม่ถูกต้อง");
        }

        const medData = await getMedicineById(med.med_id);
        if (!medData) throw new Error("ไม่พบข้อมูลยาในระบบ");

        const newBalance = med.med_quantity - (med.quantity || 1);
        if (newBalance < 0) throw new Error(`สต็อกยา ${med.med_showname} ไม่เพียงพอ`);

        await updateStock(med.med_sid, {
          ...med,
          med_quantity: newBalance,
        });

        const stockResponse = await fetch(`https://dispensesystem-production.up.railway.app/medicine/stock_history`, {
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
          const overdueResponse = await fetch(`https://dispensesystem-production.up.railway.app/medicine/overdue`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              med_id: med.med_id,
              med_sid: med.med_sid,
              patient_id: patientId,
              quantity: med.quantity || 1,
              time: now,
              dispense_status: false,
            }),
          });
          if (!overdueResponse.ok) throw new Error("บันทึก overdue ล้มเหลว");
        }
      } catch (err) {
        console.error("❌ บันทึก stock/overdue ล้มเหลว:", err);
        throw err;
      }
    },
    []
  );

  const handleRandomMedicine = useCallback(
    async (patient) => {
      try {
        if (!medicines.length) {
          throw new Error("ไม่พบข้อมูลยาในระบบ");
        }

        const MAX_ATTEMPTS = 5;
        let attempts = 0;
        let medicinesWithQuantity = [];
        let failureReason = "";

        // กรองยาที่เหมาะสม: ไม่แพ้, สต็อกเพียงพอ, ไม่หมดอายุ
        const validMedicines = medicines.filter(
          (med) =>
            !checkAllergy(med) && // ไม่แพ้ยา
            med.med_quantity >= med.min_quantity && // สต็อกเพียงพอ
            !med.is_expired // ไม่หมดอายุ
        );

        if (!validMedicines.length) {
          throw new Error("ไม่มีรายการยาที่ไม่ก่อให้เกิดอาการแพ้ มีสต็อกเพียงพอ และยังไม่หมดอายุ");
        }

        while (attempts < MAX_ATTEMPTS) {
          console.log(`การสุ่มครั้งที่ ${attempts + 1}/${MAX_ATTEMPTS}`);
          
          // สุ่มจำนวนยา (1-5 รายการ หรือเท่ากับจำนวนยาที่มี)
          const numOfMedicines = Math.min(Math.floor(Math.random() * 5) + 1, validMedicines.length);
          
          // สุ่มยาและจำนวน
          const selectedMeds = validMedicines
            .sort(() => 0.5 - Math.random())
            .slice(0, numOfMedicines);
          
          const randomQuantities = generateRandomQuantities(numOfMedicines, Math.max(...validMedicines.map(m => m.med_quantity)));
          
          medicinesWithQuantity = selectedMeds.map((med, index) => ({
            ...med,
            med_name: med.med_showname,
            quantity: Math.min(randomQuantities[index], med.med_quantity),
            isPrinted: false,
            med_selling_price: parseFloat(med.unit_price) || 0,
            med_dose_dialogue: med.med_dose_dialogue || "ไม่ระบุ",
          }));

          // ตรวจสอบปฏิกิริยาระหว่างยา
          let hasInteractions = false;
          const interactionDetails = [];
          
          for (const med of medicinesWithQuantity) {
            const relevantInteractions = checkInteractions(med, medicinesWithQuantity);
            if (relevantInteractions.length > 0) {
              hasInteractions = true;
              interactionDetails.push(
                ...relevantInteractions.map((interaction) => {
                  const med1 = medicines.find((m) => m.med_id === interaction.med_id_1)?.med_showname || `ID ${interaction.med_id_1}`;
                  const med2 = medicines.find((m) => m.med_id === interaction.med_id_2)?.med_showname || `ID ${interaction.med_id_2}`;
                  return `${med1} และ ${med2}`;
                })
              );
              break;
            }
          }

          if (hasInteractions) {
            console.log(`พบปฏิกิริยาระระหว่างยา: ${interactionDetails.join(", ")}`);
            failureReason = `พบปฏิกิริยาระหว่างยา: ${interactionDetails.join(", ")}`;
            attempts++;
            continue;
          }

          // หากผ่านการตรวจสอบทั้งหมด
          break;
        }

        setSelectedMedicine(medicinesWithQuantity);
        setSelectedPatient(patient);
        setDiagnosisDescription(getRandomDescription());
        setShowMedicineModal(true);
        setShowPatientModal(false);
      } catch (error) {
        handleError("ข้อผิดพลาด", error.message || "เกิดข้อผิดพลาดในการสุ่มยา", error);
      }
    },
    [medicines, checkAllergy, checkInteractions, generateRandomQuantities]
  );

  const handlePrintMedicine = useCallback(
    async () => {
      const toPrint = selectedMedicine.filter((med) => !med.isPrinted);
      if (!toPrint.length) {
        Swal.fire({
          icon: "info",
          title: "ไม่มีรายการยา",
          text: "ไม่มีรายการยาที่ยังไม่ได้พิมพ์",
          confirmButtonText: "ตกลง",
        });
        return;
      }
      Swal.fire({
        icon: "info",
        title: "ยาที่จะพิมพ์",
        html: `<pre>${toPrint
          .map((med) => `${med.med_showname_eng} x ${med.quantity} (${med.packaging_type})`)
          .join("<br>")}</pre>`,
        confirmButtonText: "ตกลง",
      });

      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      let failedPrints = [];
      
      for (const [index, med] of toPrint.entries()) {
        const printText = `(${index+1})\n${selectedPatient.first_name_eng} ${selectedPatient.last_name_eng}\n${med.med_showname_eng}\n${med.med_dose_dialogue}\nQuantity: ${med.quantity}\nPrice: ${(med.unit_price * med.quantity).toFixed(2)} THB`;
        console.log(printText)
        try {
          if (!printer) {
            Swal.fire({
              icon: "warning",
              title: "ไม่พบเครื่องพิมพ์",
              text: "กรุณาเลือกเครื่องพิมพ์ใหม่หรือตรวจสอบการเชื่อมต่อ",
              confirmButtonText: "ตกลง",
            });
            return;
          }
          await printLabel(printText, printer);
        } catch (err) {
          failedPrints.push(med.med_showname);
        }
        await sleep(400);
      }

      if (failedPrints.length) {
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาดในการพิมพ์",
          text: `เกิดข้อผิดพลาดในการพิมพ์ยา: ${failedPrints.join(", ")}\nกรุณาเลือกเครื่องพิมพ์ใหม่หรือตรวจสอบการเชื่อมต่อ`,
          confirmButtonText: "ตกลง",
        });
      } else {
        setSelectedMedicine((prev) => prev.map((med) => (med.isPrinted ? med : { ...med, isPrinted: true })));
        Swal.fire({
          icon: "success",
          title: "พิมพ์สำเร็จ",
          text: "พิมพ์ฉลากยาทั้งหมดเรียบร้อยแล้ว",
          confirmButtonText: "ตกลง",
        });
      }
    },
    [selectedMedicine, selectedPatient, printer]
  );

  const handleDispense = useCallback(
    async () => {
      if (!selectedPatient || !selectedMedicine.length) {
        Swal.fire({
          icon: "warning",
          title: "ข้อมูลไม่ครบ",
          text: "กรุณาเลือกผู้ป่วยและยาอย่างน้อยหนึ่งรายการ",
          confirmButtonText: "ตกลง",
        });
        return;
      }

      try {
        const medicinesData = selectedMedicine.map((med) => ({
          med_sid: med.med_sid,
          med_id: med.med_id,
          quantity: med.quantity || 1,
        }));
        const response = await fetch(`https://dispensesystem-production.up.railway.app/medicine/orderHistory`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id: selectedPatient.patient_id,
            dispense_doc_id: user.user_id,
            doctor_id: 77,
            description: diagnosisDescription,
            medicines: medicinesData,
          }),
        });
        if (!response.ok) throw new Error(`บันทึก order history ล้มเหลว: ${response.statusText}`);

        await Promise.all(
          selectedMedicine.map((med) =>
            updateStockAndHistory(selectedPatient.patient_id, med)
          )
        );

        Swal.fire({
          icon: "success",
          title: "เรียกคิวสำเร็จ",
          text: `เรียกคิว คุณ ${selectedPatient.first_name} ${selectedPatient.last_name} รับยาค่ะ`,
          confirmButtonText: "ตกลง",
        });

        setShowMedicineModal(false);
        setQuantity(0);
        setFilteredMedicines([]);
        setMedicineSearchTerm("");
        setSelectedMedicine([]);
        setSelectedPatient(null);
      } catch (error) {
        handleError("ข้อผิดพลาดในการเรียกคิว", `เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message}`, error);
      }
    },
    [selectedPatient, selectedMedicine, diagnosisDescription, user, updateStockAndHistory]
  );

  const handleChangeQuantity = useCallback(
    (index, value) => {
      const newQuantity = parseInt(value, 10);
      setSelectedMedicine((prev) =>
        prev.map((med, i) =>
          i === index
            ? { ...med, quantity: isNaN(newQuantity) || newQuantity < 1 ? 1 : Math.min(newQuantity, med.med_quantity) }
            : med
        )
      );
    },
    []
  );

  const filteredPatients = useMemo(() => {
    if (!patientSearchTerm) return patients;
    return patients.filter((p) => {
      const hn = (p.hn_number || "").toLowerCase();
      const nationalId = (p.national_id || "").toLowerCase();
      const fullNameTh = `${p.first_name} ${p.last_name}`.toLowerCase();
      const fullNameEn = `${p.first_name_en || ""} ${p.last_name_en || ""}`.toLowerCase();
      const patientId = `${p.patient_id}`.toLowerCase();
      return (
        hn.includes(patientSearchTerm) ||
        nationalId.includes(patientSearchTerm) ||
        fullNameTh.includes(patientSearchTerm) ||
        fullNameEn.includes(patientSearchTerm) ||
        patientId.includes(patientSearchTerm)
      );
    });
  }, [patients, patientSearchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 text-red-800 p-4 rounded-xl">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sarabun mx-auto">
      <Header header="ระบบการจ่ายยา" description="จัดการรายการยาและผู้ป่วยได้อย่างรวดเร็วและปลอดภัย" icon={Tablets} />
      <h1 className="text-xl font-bold text-gray-800 mb-4 mt-1">ผู้ป่วยรอรับยา</h1>
      <div className="mb-4 flex items-center gap-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <User className="mr-2 h-4 w-4 text-blue-500" />
          ค้นหาผู้ป่วย:
        </label>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="ชื่อ, HN, เลขบัตรประชาชน, หรือคิว"
            value={patientSearchTerm}
            onChange={(e) => handleSearchPatient(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
          />
        </div>
        {patientSearchTerm && (
          <FilterBadge label="ผู้ป่วย" value={patientSearchTerm} onClear={() => setPatientSearchTerm("")} icon={User} />
        )}
      </div>
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">คิว</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">HN</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ผู้รับบริการ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">วันที่/เวลา</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">จ่ายยา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((pat) => (
                <tr
                  key={pat.patient_id}
                  className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    setSelectedPatient(pat);
                    setDiagnosisDescription(getRandomDescription());
                    setShowPatientModal(true);
                  }}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold text-xs">{pat.patient_id}</span>
                      </div>
                      {pat.patient_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{pat.hn_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{pat.first_name} {pat.last_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(new Date())}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRandomMedicine(pat);
                      }}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                      aria-label={`จ่ายยาให้ ${pat.first_name} ${pat.last_name}`}
                    >
                      <Pill className="w-4 h-4 mr-1" />
                      จ่ายยา
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[120vh] overflow-x-hidden shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">ข้อมูลผู้ป่วย</h2>
                    <p className="text-blue-100 text-sm">HN: {selectedPatient.hn_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPatientModal(false);
                    setSelectedPatient(null);
                  }}
                  className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="px-10 py-6 max-h-[calc(120vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="col-span-2 space-y-4 border-r border-gray-300 pr-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    ข้อมูลทั่วไป
                  </h3>
                  <div className="text-center mt-4">
                    <img
                      src={
                        console.log("selectedPatient.photo", selectedPatient.photo) ||
                        selectedPatient.photo
                          ? `${imgPath}${selectedPatient.photo}`
                          : "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/1200px-User_icon_2.svg.png"
                      }
                      alt="รูปภาพผู้ป่วย"
                      className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow-md mx-auto"
                    />
                  </div>
                  <div className="">
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">HN:</span>
                      <span className="text-end font-medium text-gray-900">{selectedPatient.hn_number}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">เลขบัตรประชาชน:</span>
                      <span className="text-end font-medium text-gray-900">{selectedPatient.national_id}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">ชื่อ-นามสกุล:</span>
                      <span className="text-end font-medium text-gray-900">{selectedPatient.first_name} {selectedPatient.last_name}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-end font-medium text-gray-900">{selectedPatient.first_name_eng} {selectedPatient.last_name_eng}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">เพศ:</span>
                      <span className="text-end font-medium text-gray-900">{selectedPatient.gender}</span>
                    </div>
                  </div>
                </div>
                <div className="col-span-3 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    ข้อมูลสุขภาพ
                  </h3>
                  <div className="pt-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">วันเกิด:</span>
                      <span className="text-end font-medium text-gray-900">
                        <FormatDate dateString={selectedPatient.birthday} /> ({selectedPatient.age_y} ปี {selectedPatient.age_m} เดือน {selectedPatient.age_d} วัน)
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">กรุ๊ปเลือด:</span>
                      <span className="text-end font-medium text-gray-900 inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-600">
                        {selectedPatient.blood_group}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">ประวัติแพ้ยา:</span>
                      <div className="text-start">
                        {patientAllergies.medIds.size > 0 ? (
                          <ul className="list-disc pl-5 text-red-600 bg-red-50 p-2 rounded-md">
                            {[...patientAllergies.medIds].map((medId, index) => {
                              const med = medicines.find((m) => m.med_id === medId);
                              const allergyInfo = patientAllergies.details.get(medId);
                              return (
                                <li key={index} className="text-sm">
                                  {med ? med.med_name : `ยา ID ${medId}`} (อาการ: {allergyInfo.symptoms}, ความรุนแรง: {allergyInfo.severity})
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <span className="text-gray-600">ไม่มี</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">ประวัติทางการแพทย์ (PMH):</span>
                      <span className="text-end font-medium text-gray-900">{selectedPatient.PMH || "ไม่มี"}</span>
                    </div>
                    <div className="items-center grid grid-cols-3 gap-4">
                      <div className="flex justify-between gap-2 py-2 pr-4 border-r border-gray-300">
                        <span className="text-sm text-gray-600">ส่วนสูง:</span>
                        <span className="text-end font-medium text-gray-900">{selectedPatient.height} ซม.</span>
                      </div>
                      <div className="flex justify-between items-center gap-2 py-2 pr-4 border-r border-gray-300">
                        <span className="text-sm text-gray-600">น้ำหนัก:</span>
                        <span className="text-end font-medium text-gray-900">{selectedPatient.weight} กก.</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 py-2 relative group">
                        <span className="text-sm text-gray-600">BMI:</span>
                        <span className="text-end font-medium text-gray-900 inline-flex items-center px-2 py-1 rounded-full text-sm bg-green-100 text-green-600">
                          {selectedPatient.bmi}
                        </span>
                        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          ค่าดัชนีมวลกาย
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    ข้อมูลการติดต่อ
                  </h3>
                  <div className="">
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">เบอร์โทร:</span>
                      <span className="text-end font-medium text-gray-900">{selectedPatient.phone}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">ที่อยู่:</span>
                      <span className="text-end font-medium text-gray-900">{selectedPatient.house_number} หมู่ {selectedPatient.village_number}, {selectedPatient.road}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">ตำบล/อำเภอ/จังหวัด:</span>
                      <span className="text-end font-medium text-gray-900">ต.{selectedPatient.sub_district}, อ.{selectedPatient.district}, จ.{selectedPatient.province} {selectedPatient.postal_code}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMedicineModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[100vh] overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">จัดการรายการยา</h2>
                    <p className="text-blue-100 text-sm">HN: {selectedPatient.hn_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMedicineModal(false);
                    setQuantity(0);
                    setFilteredMedicines([]);
                    setMedicineSearchTerm("");
                    setFormError(null);
                  }}
                  className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-100px)]">
              <div className="grid grid-cols-2 gap-2 space-y-4">
                <div className="flex items-center h-full gap-4 bg-gray-50 rounded-xl p-4">
                  <img
                    src={
                      console.log("selectedPatient.photo", selectedPatient.photo) ||
                      selectedPatient.photo
                        ? `${imgPath}${selectedPatient.photo}`
                        : "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/1200px-User_icon_2.svg.png"
                    }
                    alt="รูปภาพผู้ป่วย"
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow-md mx-auto"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">HN:</span>
                      <span className="font-medium text-gray-900">{selectedPatient.hn_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">ชื่อ-นามสกุล:</span>
                      <span className="font-medium text-gray-900">{selectedPatient.first_name} {selectedPatient.last_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">วันเกิด:</span>
                      <span className="font-medium text-gray-900">
                        <FormatDate dateString={selectedPatient.birthday} /> ({selectedPatient.age_y} ปี)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-red-50 rounded-xl p-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-600">
                      <span className="font-medium">ผลวินิจฉัยเบื้องต้น:</span> {diagnosisDescription}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-gray-600 font-medium">ประวัติแพ้ยา:</span>
                    {patientAllergies.medIds.size > 0 ? (
                      <ul className="list-disc pl-5 text-red-600">
                        {[...patientAllergies.medIds].map((medId, index) => {
                          const med = medicines.find((m) => m.med_id === medId);
                          const allergyInfo = patientAllergies.details.get(medId);
                          return (
                            <li key={index} className="text-sm">
                              {med ? med.med_showname : `ยา ID ${medId}`} (อาการ: {allergyInfo.symptoms}, ความรุนแรง: {allergyInfo.severity})
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span className="text-gray-600 text-sm">ไม่มี</span>
                    )}
                  </div>
                </div>
              </div>
              {formError && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={20} />
                  <span className="text-sm">{formError}</span>
                </div>
              )}
              <div className="mt-4">
                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-4 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="ค้นหายา..."
                      value={medicineSearchTerm}
                      onChange={(e) => handleSearchMedicine(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
              {filteredMedicines.length > 0 && (
                <ul className="bg-white border border-gray-200 shadow-md rounded-xl max-h-48 overflow-y-auto mt-2 mb-4">
                  {filteredMedicines.map((med) => (
                    <li
                      key={med.med_sid}
                      className={`p-2 hover:bg-blue-50 cursor-pointer text-sm ${
                        (med.med_quantity < med.min_quantity || med.is_expired) ? "text-red-600" : ""
                      }`}
                      onClick={() => handleSelectMedicine(med)}
                    >
                      {med.med_showname}
                      {med.is_expired && med.med_quantity < med.min_quantity ? " (หมดอายุ, สต็อกต่ำ)" : 
                        med.is_expired ? " (หมดอายุ)" : 
                        med.med_quantity < med.min_quantity ? " (สต็อกต่ำ)" : 
                        ` (${med.med_quantity} หน่วย)`}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div style={{ maxHeight: "40vh", overflowY: "auto" }}>
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อยา</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">สถานะพิมพ์</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">จำนวน</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ราคาต่อหน่วย (บาท)</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ราคารวม (บาท)</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">วิธีใช้</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ลบ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedMedicine.map((medicine, index) => (
                        <tr key={index} className={`hover:bg-gray-50 transition-colors duration-200 ${medicine.isPrinted ? "text-gray-400" : ""}`}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{medicine.med_showname}</td>
                          <td className="px-6 py-4 text-center text-sm">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                medicine.isPrinted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {medicine.isPrinted ? "พิมพ์แล้ว" : "รอพิมพ์"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-sm">
                            <input
                              type="number"
                              min="1"
                              max={medicine.med_quantity}
                              value={medicine.quantity}
                              onChange={(e) => handleChangeQuantity(index, e.target.value)}
                              className="border border-gray-200 p-1 w-16 text-center rounded focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 text-center text-sm">{(parseFloat(medicine.unit_price) || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-center text-sm">{(parseFloat(medicine.quantity * medicine.unit_price) || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-center text-sm">{medicine.med_dose_dialogue}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleRemoveMedicine(medicine)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              ลบ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-green-600">ราคารวม: {calculateTotalPrice(selectedMedicine)} บาท</h3>
                <div className="flex gap-4">
                  <button
                    onClick={handleDispense}
                    className="inline-flex items-center px-4 py-3 text-sm font-medium text-black bg-yellow-400 rounded-xl hover:bg-yellow-500 transition-colors"
                  >
                    <Bell className="w-4 h-4 mr-1" />
                    เรียกคิว
                  </button>
                  <button
                    onClick={handlePrintMedicine}
                    className="inline-flex items-center px-4 py-3 text-sm font-medium text-black bg-blue-400 rounded-xl hover:bg-blue-500 transition-colors"
                  >
                    <Printer className="w-4 h-4 mr-1" />
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