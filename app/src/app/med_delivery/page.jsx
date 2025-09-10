"use client";
import { useRef, useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Package, User, Phone, MapPin, Pill, X, Check, Clock, Truck, AlertTriangle } from "lucide-react";
import Swal from "sweetalert2";
import Header from "../component/Header";

const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

export default function MedDeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [medStock, setMedStock] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [searchMedicine, setSearchMedicine] = useState("");
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [form, setForm] = useState({
    delivery_id: null,
    patient_id: "",
    delivery_method: "จัดส่งถึงบ้าน",
    address: "",
    contact_phone: "",
    receiver_name: "",
    receiver_phone: "",
    status: "pending",
    note: "",
    medicine_list: [],
  });
  const [isFormExpanded, setIsFormExpanded] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deliveriesRes, patientsRes, medicinesRes, stockRes, allergiesRes, interactionsRes] = await Promise.all([
          fetch(`https://dispensesystem-production.up.railway.app/patient/med_delivery`).then(res => res.json()),
          fetch(`https://dispensesystem-production.up.railway.app/patient`).then(res => res.json()),
          fetch(`https://dispensesystem-production.up.railway.app/medicine`).then(res => res.json()),
          fetch(`https://dispensesystem-production.up.railway.app/medicine/stock`).then(res => res.json()),
          fetch(`https://dispensesystem-production.up.railway.app/medicine/allergy`).then(res => res.json()),
          fetch(`https://dispensesystem-production.up.railway.app/medicine/interactions`).then(res => res.json()),
        ]);
        setDeliveries(deliveriesRes);
        setPatients(patientsRes);
        setMedicines(medicinesRes);
        setMedStock(stockRes);
        setAllergies(allergiesRes);
        setInteractions(interactionsRes);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่",
          confirmButtonText: "ตกลง",
        });
      }
    };
    fetchData();
  }, []);

  const mapStatusToBackend = (status) => {
    const statusMap = {
      pending: "pending",
      delivering: "delivering",
      delivered: "delivered",
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const calculateItemCost = (med_sid, quantity) => {
    const stockItem = medStock.find(m => m.med_sid === med_sid);
    if (stockItem && !stockItem.is_expired) {
      return (parseFloat(stockItem.unit_price) || 0) * (parseInt(quantity) || 1);
    }
    return 0;
  };

  const calculateTotalCost = () => {
    return form.medicine_list.reduce((total, item) => {
      return total + calculateItemCost(item.med_sid, item.quantity);
    }, 0).toFixed(2);
  };

  const checkAllergy = (med_id) => {
    if (form.patient_id) {
      return allergies.some(allergy => allergy.patient_id === parseInt(form.patient_id) && allergy.med_id === med_id);
    }
    return false;
  };

  const checkMedicineInteractions = (med, selectedMeds) => {
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
  };

  const handleSubmit = async () => {
    if (!form.patient_id) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "กรุณาเลือกผู้ป่วย",
        confirmButtonText: "ตกลง",
      });
      return;
    }
    if (form.delivery_id == null && form.medicine_list.length === 0) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "กรุณาเพิ่มรายการยา",
        confirmButtonText: "ตกลง",
      });
      return;
    }
    if (!form.status) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "กรุณาเลือกสถานะ",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    setLoading(true);

    try {
      const method = form.delivery_id ? "PUT" : "POST";
      const url = form.delivery_id
        ? `https://dispensesystem-production.up.railway.app/patient/med_delivery/${form.delivery_id}`
        : `https://dispensesystem-production.up.railway.app/patient/med_delivery`;

      const payload = {
        ...form,
        status: mapStatusToBackend(form.status),
        medicine_list: form.medicine_list.map(item => ({
          med_sid: item.med_sid || null,
          med_id: item.med_id,
          quantity: parseInt(item.quantity) || 1,
        })),
      };

      console.log("Sending payload:", payload);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", res.status);
      const responseData = await res.json();
      console.log("Response data:", responseData);

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: form.delivery_id ? "อัปเดตข้อมูลสำเร็จ" : "เพิ่มข้อมูลสำเร็จ",
          text: form.delivery_id ? "ข้อมูลการจัดส่งได้รับการอัปเดตเรียบร้อยแล้ว" : "เพิ่มรายการจัดส่งใหม่เรียบร้อยแล้ว",
          confirmButtonText: "ตกลง",
        });
        const updatedDeliveries = await fetch(`https://dispensesystem-production.up.railway.app/patient/med_delivery`).then(res => res.json());
        setDeliveries(updatedDeliveries);
        setForm({
          delivery_id: null,
          patient_id: "",
          delivery_method: "จัดส่งถึงบ้าน",
          address: "",
          contact_phone: "",
          receiver_name: "",
          receiver_phone: "",
          status: "pending",
          note: "",
          medicine_list: [],
        });
        setSearchTerm("");
      } else {
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: `เกิดข้อผิดพลาดในการบันทึก: ${responseData.message || res.statusText}`,
          confirmButtonText: "ตกลง",
        });
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${error.message}`,
        confirmButtonText: "ตกลง",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (delivery) => {
    setForm({
      delivery_id: delivery.delivery_id,
      patient_id: delivery.patient_id || "",
      delivery_method: delivery.delivery_method || "",
      address: delivery.address || "",
      contact_phone: delivery.contact_phone || delivery.receiver_phone || "",
      receiver_name: delivery.receiver_name || delivery.patient_name || "",
      receiver_phone: delivery.receiver_phone || "",
      status: delivery.status || "pending",
      note: delivery.note || "",
      medicine_list: Array.isArray(delivery.medicine_list) ? delivery.medicine_list : [],
    });
    setSearchTerm(delivery.patient_name || delivery.receiver_name || "");
    setIsFormExpanded(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบรายการจัดส่งนี้หรือไม่?",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`https://dispensesystem-production.up.railway.app/patient/med_delivery/${id}`, { method: "DELETE" });
        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: "ลบสำเร็จ",
            text: "ลบรายการจัดส่งเรียบร้อยแล้ว",
            confirmButtonText: "ตกลง",
          });
          const updatedDeliveries = await fetch(`https://dispensesystem-production.up.railway.app/patient/med_delivery`).then(res => res.json());
          setDeliveries(updatedDeliveries);
        } else {
          Swal.fire({
            icon: "error",
            title: "ข้อผิดพลาด",
            text: "เกิดข้อผิดพลาดในการลบข้อมูล",
            confirmButtonText: "ตกลง",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "เกิดข้อผิดพลาดในการลบข้อมูล",
          confirmButtonText: "ตกลง",
        });
      }
    }
  };

  const handleSearchPatient = (e) => {
    const term = e.target.value.toLowerCase().trim();
    setSearchTerm(term);

    if (term === "") {
      setFilteredPatients([]);
    } else {
      const results = patients.filter((p) => {
        const hn = (p.hn_number || "").toLowerCase();
        const nationalId = (p.national_id || "").toLowerCase();
        const fullNameTh = `${p.first_name} ${p.last_name}`.toLowerCase();
        const fullNameEn = `${p.first_name_en || ""} ${p.last_name_en || ""}`.toLowerCase();

        return (
          hn.includes(term) ||
          nationalId.includes(term) ||
          fullNameTh.includes(term) ||
          fullNameEn.includes(term)
        );
      });

      setFilteredPatients(results);
    }
  };

  const handleSelectPatient = (patient) => {
    setForm({
      ...form,
      patient_id: patient.patient_id,
      receiver_name: `${patient.first_name} ${patient.last_name}`,
      receiver_phone: patient.phone || "",
      address: `${patient.house_number} หมู่ ${patient.village_number} ${patient.road ? `ถนน${patient.road}, ` : ""}ตำบล${patient.sub_district}, อำเภอ${patient.district}, จังหวัด${patient.province} ${patient.postal_code}`
    });
    setFilteredPatients([]);
    setSearchTerm(`${patient.first_name} ${patient.last_name}`);
  };

  const handleAddMedicine = async (med_sid) => {
    const stockItem = medStock.find(m => m.med_sid === med_sid);
    console.log("Selected medicine stock item:", stockItem);
    if (!stockItem) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่พบข้อมูลยาในสต็อก",
        confirmButtonText: "ตกลง",
      });
      return;
    }
    if (stockItem.is_expired) {
      Swal.fire({
        icon: "warning",
        title: "ยาหมดอายุ",
        text: `ยา ${stockItem.med_showname} หมดอายุแล้ว (วันหมดอายุ: ${new Date(stockItem.exp_date).toLocaleDateString('th-TH')}) ไม่สามารถเพิ่มได้`,
        confirmButtonText: "ตกลง",
      });
      return;
    }
    if (stockItem.med_quantity < stockItem.min_quantity) {
      Swal.fire({
        icon: "warning",
        title: "สต็อกต่ำ",
        text: `ยา ${stockItem.med_showname} มีสต็อกต่ำ (${stockItem.med_quantity} หน่วย)`,
        confirmButtonText: "ตกลง",
      });
      return;
    }
    if (checkAllergy(stockItem.med_id)) {
      Swal.fire({
        icon: "warning",
        title: "คำเตือนการแพ้ยา",
        text: `ผู้ป่วยแพ้ยา ${stockItem.med_showname} กรุณาตรวจสอบก่อนเพิ่ม`,
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // ตรวจสอบปฏิกิริยาระหว่างยา
    const relevantInteractions = checkMedicineInteractions(stockItem, form.medicine_list);
    if (relevantInteractions.length > 0) {
      const interactionDetails = relevantInteractions.map((interaction) => {
        const med1 = medicines.find((m) => m.med_id === interaction.med_id_1)?.med_showname || `ID ${interaction.med_id_1}`;
        const med2 = medicines.find((m) => m.med_id === interaction.med_id_2)?.med_showname || `ID ${interaction.med_id_2}`;
        return `${med1} และ ${med2}: ${interaction.description} (ความรุนแรง: ${interaction.severity || "ไม่ระบุ"})`;
      }).join("\n\n");

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

    const exists = form.medicine_list.find(m => m.med_sid === med_sid);
    if (!exists) {
      setForm({
        ...form,
        medicine_list: [...form.medicine_list, { med_id: stockItem.med_id, med_sid: med_sid, quantity: 1 }],
      });
    }
    setSearchMedicine("");
    setFilteredMedicines([]);
  };

  const handleChangeQuantity = (med_sid, quantity) => {
    const stockItem = medStock.find(m => m.med_sid === med_sid && !m.is_expired);
    if (!stockItem) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่พบข้อมูลยาในสต็อก",
        confirmButtonText: "ตกลง",
      });
      return;
    }
    if (quantity > stockItem.med_quantity) {
      Swal.fire({
        icon: "error",
        title: "จำนวนยาเกินสต็อก",
        text: `ยา ${stockItem.med_showname} มีสต็อกเพียง ${stockItem.med_quantity} หน่วย`,
        confirmButtonText: "ตกลง",
      });
      return;
    }
    setForm({
      ...form,
      medicine_list: form.medicine_list.map(item =>
        item.med_sid === med_sid ? { ...item, quantity: parseInt(quantity) || 1 } : item
      ),
    });
  };

  const handleRemoveMedicine = (med_sid) => {
    setForm({ ...form, medicine_list: form.medicine_list.filter(item => item.med_sid !== med_sid) });
  };

  const handleSearchMedicine = (e) => {
    const value = e.target.value;
    setSearchMedicine(value);
    setFilteredMedicines(
      value.trim() === ""
        ? []
        : medStock.filter(m =>
            (m.med_showname || "").toLowerCase().includes(value.toLowerCase()) ||
            (m.med_showname_eng || "").toLowerCase().includes(value.toLowerCase())
          )
    );
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "delivering":
        return "text-blue-600 bg-blue-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "delivering":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <Check className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <div className="mx-auto">
        <Header header={"ระบบจัดการการจัดส่งยา"} description={"จัดการการจัดส่งยาให้กับผู้ป่วยอย่างมีประสิทธิภาพ"} icon={Package}/>
        <div className="mt-8  bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all"
            onClick={() => setIsFormExpanded(!isFormExpanded)}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                {form.delivery_id ? 'แก้ไขข้อมูลการจัดส่ง' : 'เพิ่มการจัดส่งใหม่'}
              </h2>
              <div className={`transform transition-transform ${isFormExpanded ? 'rotate-45' : ''}`}>
                <Plus className="w-5 h-5" />
              </div>
            </div>
          </div>

          {isFormExpanded && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    ค้นหาผู้ป่วย
                  </label>
                  <div className="mt-4">
                    <div className="grid grid-cols-6 gap-4">
                      <div className="col-span-4 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="ค้นหาด้วยชื่อ หรือ HN..."
                          value={searchTerm}
                          onChange={e => {
                            setSearchTerm(e.target.value);
                            handleSearchPatient(e);
                          }}
                        />
                      </div>
                    </div>
                    {filteredPatients.length > 0 && (
                      <ul className="bg-white border border-gray-200 shadow-md rounded-xl max-h-48 overflow-y-auto mt-2 mb-4">
                        {filteredPatients.map(p => (
                          <li
                            key={p.patient_id}
                            className="p-2 hover:bg-blue-50 cursor-pointer text-sm"
                            onClick={() => handleSelectPatient(p)}
                          >
                            <div className="font-medium text-gray-900">{p.first_name} {p.last_name}</div>
                            <div className="text-xs text-gray-500">HN: {p.hn_number} | {p.house_number} หมู่ {p.village_number}, {p.sub_district}, {p.district}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้รับยา</label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
                    value={form.receiver_name} 
                    onChange={e => setForm({ ...form, receiver_name: e.target.value })} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">วิธีจัดส่ง</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={form.delivery_method} 
                    onChange={e => setForm({ ...form, delivery_method: e.target.value })}
                  >
                    <option value="จัดส่งถึงบ้าน">จัดส่งถึงบ้าน</option>
                    <option value="รับที่โรงพยาบาล">รับที่โรงพยาบาล</option>
                    <option value="จัดส่งด่วน">จัดส่งด่วน</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    ที่อยู่จัดส่ง
                  </label>
                  <textarea 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
                    rows={3}
                    value={form.address} 
                    onChange={e => setForm({ ...form, address: e.target.value })} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    เบอร์ติดต่อ
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
                    value={form.receiver_phone} 
                    onChange={e => setForm({ ...form, receiver_phone: e.target.value })} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
                    value={form.status} 
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="pending">รอดำเนินการ</option>
                    <option value="delivering">กำลังจัดส่ง</option>
                    <option value="delivered">จัดส่งแล้ว</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Pill className="w-4 h-4 inline mr-1" />
                    ค้นหายา
                  </label>
                  <div className="mt-4">
                    <div className="grid grid-cols-6 gap-4">
                      <div className="col-span-4 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input 
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
                          placeholder="ค้นหาชื่อยา..."
                          value={searchMedicine} 
                          onChange={handleSearchMedicine} 
                        />
                      </div>
                    </div>
                    {filteredMedicines.length > 0 && (
                      <ul className="w-5xl bg-white border border-gray-200 shadow-md rounded-xl max-h-48 overflow-y-auto mt-2 mb-4">
                        {filteredMedicines.map(m => (
                          <li 
                            key={m.med_sid} 
                            className={`p-2 hover:bg-blue-50 cursor-pointer text-sm ${m.is_expired ? "text-red-600" : m.med_quantity < m.min_quantity ? "text-orange-600" : ""}`}
                            onClick={() => handleAddMedicine(m.med_sid)}
                          >
                            {m.med_showname} {m.is_expired ? "(หมดอายุ)" : m.med_quantity < m.min_quantity ? "(สต็อกต่ำ)" : `(${m.med_quantity} หน่วย)`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">รายการยาที่จะจัดส่ง</label>
                  {form.medicine_list.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500">
                      <Pill className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      ยังไม่ได้เลือกยา
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="space-y-3">
                        {form.medicine_list.map(({ med_id, med_sid, quantity }) => {
                          const med = medicines.find(m => m.med_id === med_id);
                          const stock = medStock.find(m => m.med_sid === med_sid) || 
                                        medStock.find(m => m.med_id === med_id && !m.is_expired && m.med_quantity >= quantity) || 
                                        medStock.find(m => m.med_id === med_id);
                          const itemCost = calculateItemCost(med_sid, quantity);
                          return (
                            <div key={med_sid} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
                              <div className="flex-1">
                                <span className={`font-medium ${stock && stock.is_expired ? "text-red-600 line-through" : stock && stock.med_quantity < stock.min_quantity ? "text-orange-600" : "text-gray-800"}`}>
                                  {stock ? stock.med_showname : med ? med.med_name : "ไม่พบชื่อยา"} {stock && stock.is_expired ? "(หมดอายุ)" : stock && stock.med_quantity < stock.min_quantity ? "(สต็อกต่ำ)" :  ""}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">จำนวน:</span>
                                  <input
                                    type="number"
                                    value={quantity}
                                    onChange={e => handleChangeQuantity(med_sid, e.target.value)}
                                    className="w-16 px-2 py-1 border border-gray-200 rounded-xl text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    min={1}
                                    disabled={stock && stock.is_expired}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 font-medium">ราคา: {itemCost.toFixed(2)} บาท</span>
                                <button
                                  onClick={() => handleRemoveMedicine(med_sid)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                  disabled={stock && stock.is_expired}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        <div className="mt-4 text-right text-lg font-bold text-green-600">
                          ราคาสุทธิ: {calculateTotalCost()} บาท
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
                  <textarea 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
                    rows={3}
                    value={form.note} 
                    onChange={e => setForm({ ...form, note: e.target.value })} 
                  />
                </div>

                <div className="md:col-span-2 flex justify-end space-x-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setForm({
                        delivery_id: null,
                        patient_id: "",
                        delivery_method: "จัดส่งถึงบ้าน",
                        address: "",
                        contact_phone: "",
                        receiver_name: "",
                        receiver_phone: "",
                        status: "pending",
                        note: "",
                        medicine_list: [],
                      });
                      setSearchTerm("");
                    }}
                    className="px-6 py-2 border border-gray-200 rounded-xl shadow-sm text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    <span>{form.delivery_id ? "อัปเดต" : "เพิ่ม"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
            <h2 className="text-2xl font-semibold flex items-center">
              <Package className="w-6 h-6 mr-3" />
              รายการจัดส่งทั้งหมด
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ป่วย</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วิธีจัดส่ง</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveries.length > 0 ? (
                  deliveries.map(d => (
                    <tr key={d.delivery_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{d.patient_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {d.delivery_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(d.status)}`}>
                          {getStatusIcon(d.status)}
                          <span className="ml-1">
                            {d.status.toLowerCase() === 'pending' ? 'รอดำเนินการ' : 
                             d.status.toLowerCase() === 'delivering' ? 'กำลังจัดส่ง' : 'จัดส่งแล้ว'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit(d)} 
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-xl transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(d.delivery_id)} 
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      ไม่พบรายการจัดส่ง
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}