"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Package, AlertTriangle, CheckCircle, X, Pill, TrendingDown, Plus, Edit, Trash2, Search, Eye, Download, RefreshCw, Warehouse } from "lucide-react";
import Header from "@/app/component/Header";
import Swal from "sweetalert2";
import { FormatDate } from "../component/formatDate";
import debounce from "lodash/debounce";

export default function MedicineStockPage() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("");
  const [expiryStatusFilter, setExpiryStatusFilter] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);
  const [medNames, setMedNames] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [selectedMedicineName, setSelectedMedicineName] = useState("");
  const [userData, setUserData] = useState({
    username: "",
    user_id: 0,
  });
  const [formData, setFormData] = useState({
    med_id: "",
    med_quantity: 0,
    packaging_type: "",
    is_divisible: false,
    location: "",
    med_showname: "",
    min_quantity: "",
    max_quantity: "",
    cost_price: "",
    unit_price: "",
    med_showname_eng: "",
    exp_date: "",
    mfg_date: "",
  });
  const [withdrawFormData, setWithdrawFormData] = useState({
    quantity: "",
    unit: "",
    note: "",
  });
  const [token, setToken] = useState(null);

  const router = useRouter();
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const TOKEN_KEY = "token";

  const packagingOptions = ['เม็ด', 'ซอง', 'กล่อง', 'ขวด', 'หลอด'];

  // Define getStockStatus before it's used in filteredStockData
  const getStockStatus = (stock) => {
    const minQuantity = parseInt(stock.min_quantity) || 0;
    const maxQuantity = parseInt(stock.max_quantity) || Infinity;
    const quantity = parseInt(stock.med_quantity) || 0;

    if (quantity <= minQuantity) {
      return { status: "ต่ำกว่าขั้นต่ำ", color: "bg-red-100 text-red-800", icon: AlertTriangle };
    } else if (quantity >= maxQuantity) {
      return { status: "เกินขั้นสูงสุด", color: "bg-yellow-100 text-yellow-800", icon: TrendingDown };
    } else {
      return { status: "ปกติ", color: "bg-green-100 text-green-800", icon: CheckCircle };
    }
  };

  // Debounced search term update
  const debouncedSetSearchTerm = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  useEffect(() => {
    try {
      const data = window.localStorage.getItem("user");
      const storedToken = window.localStorage.getItem(TOKEN_KEY);
      if (!data || !storedToken) {
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "ไม่พบข้อมูลผู้ใช้หรือ token กรุณาล็อกอินใหม่",
        });
        router.push("/login");
        return;
      }
      const parsedData = JSON.parse(data);
      setUserData({
        username: parsedData.username || "",
        user_id: parseInt(parsedData.user_id) || 0,
      });
      setToken(storedToken);
    } catch (err) {
      console.error("Error parsing user data from localStorage:", err);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองใหม่",
      });
      localStorage.removeItem("user");
      localStorage.removeItem(TOKEN_KEY);
      router.push("/login");
    }
  }, [router]);

  const fetchAndUpdateStock = async () => {
    if (!token) return;
    try {
      const stockRes = await fetch(`https://dispensesystem-production.up.railway.app/medicine/stock`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!stockRes.ok) {
        if (stockRes.status === 401) {
          throw new Error("Token ไม่ถูกต้องหรือหมดอายุ");
        }
        throw new Error(`HTTP error! Status: ${stockRes.status}`);
      }
      const stockData = await stockRes.json();

      if (!Array.isArray(stockData)) {
        console.error("Stock API response is not an array:", stockData);
        setAllData([]);
        setFilteredData([]);
        throw new Error("ได้รับข้อมูลสต็อกไม่ถูกต้องจากเซิร์ฟเวอร์");
      }

      const validatedStockData = stockData.map((item, index) => ({
        ...item,
        med_sid: String(item.med_sid ?? `fallback-${index}`),
        med_id: String(item.med_id ?? ""),
        mfg_date: item.mfg_date || new Date().toISOString(),
        exp_date: item.exp_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        med_showname_eng: String(item.med_showname_eng || item.med_showname || `ID: ${item.med_id}`),
        med_showname: String(item.med_showname || ""),
        location: String(item.location || ""),
        packaging_type: String(item.packaging_type || ""),
        med_quantity: parseInt(item.med_quantity) || 0,
        is_expired: item.exp_date ? new Date(item.exp_date) < new Date() : item.is_expired,
      }));

      setAllData(validatedStockData);
      setFilteredData(validatedStockData);

      const expiredStocks = validatedStockData.filter(stock => stock.is_expired);
      if (expiredStocks.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "แจ้งเตือน",
          text: `พบยาหมดอายุ ${expiredStocks.length} รายการ กรุณาตรวจสอบ!`,
          html: `<pre>${expiredStocks
            .map((med) => `${med.med_showname} (รหัสสต็อก: ${med.med_sid}, หมดอายุ: ${new Date(med.exp_date).toLocaleDateString('th-TH')})`)
            .join("<br>")}</pre>`,
        });
      }

      const lowStock = validatedStockData.filter(stock => stock.med_quantity <= (parseInt(stock.min_quantity) || 0));
      if (lowStock.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "แจ้งเตือน",
          text: `พบยาที่สต็อกต่ำ ${lowStock.length} รายการ กรุณาตรวจสอบ!`,
          html: `<pre>${lowStock
            .map((med) => `${med.med_showname} (รหัสสต็อก: ${med.med_sid}, จำนวน: ${med.med_quantity})`)
            .join("<br>")}</pre>`,
        });
      }

      const uniqueMedIds = [...new Set(validatedStockData.map(item => item.med_id).filter(id => id))];
      const medMap = {};
      for (const id of uniqueMedIds) {
        try {
          const medRes = await fetch(`https://dispensesystem-production.up.railway.app/medicine/${id}`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
          if (medRes.ok) {
            const med = await medRes.json();
            medMap[id] = {
              med_showname: String(med.med_showname || med.med_thai_name || med.med_name || `ID: ${id}`),
              med_showname_eng: String(med.med_showname_eng || med.med_name || `ID: ${id}`),
              med_name: String(med.med_name || ""),
              med_thai_name: String(med.med_thai_name || ""),
              med_generic_name: String(med.med_generic_name || ""),
              med_marketing_name: String(med.med_marketing_name || ""),
            };
          } else {
            if (medRes.status === 401) {
              throw new Error("Token ไม่ถูกต้องหรือหมดอายุ");
            }
            medMap[id] = {
              med_showname: `ID: ${id}`,
              med_showname_eng: `ID: ${id}`,
              med_name: "",
              med_thai_name: "",
              med_generic_name: "",
              med_marketing_name: "",
            };
          }
        } catch (err) {
          console.error(`เกิดข้อผิดพลาดในการดึงข้อมูลยา ${id}:`, err);
          if (err.message.includes("Token")) {
            localStorage.removeItem("user");
            localStorage.removeItem(TOKEN_KEY);
            router.push("/login");
            return;
          }
          medMap[id] = {
            med_showname: `ID: ${id}`,
            med_showname_eng: `ID: ${id}`,
            med_name: "",
            med_thai_name: "",
            med_generic_name: "",
            med_marketing_name: "",
          };
        }
      }
      setMedNames(medMap);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคลังยา:", error);
      setAllData([]);
      setFilteredData([]);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: error.message || "ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อและลองอีกครั้ง",
      });
      if (error.message.includes("Token")) {
        localStorage.removeItem("user");
        localStorage.removeItem(TOKEN_KEY);
        router.push("/login");
      }
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchAndUpdateStock();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    async function fetchMedicineOptions() {
      try {
        const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Token ไม่ถูกต้องหรือหมดอายุ");
          }
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        setMedicineOptions(data);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลยา:", error);
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: error.message || "ไม่สามารถดึงข้อมูลยาได้ กรุณาลองอีกครั้ง",
        });
        if (error.message.includes("Token")) {
          localStorage.removeItem("user");
          localStorage.removeItem(TOKEN_KEY);
          router.push("/login");
        }
      }
    }
    fetchMedicineOptions();
  }, [token, router]);

  const filteredMedicines = useMemo(() => {
    if (!medicineSearchTerm) return medicineOptions;
    const searchLower = medicineSearchTerm.toLowerCase().trim();
    return medicineOptions.filter(med =>
      [
        med.med_name,
        med.med_generic_name,
        med.med_marketing_name,
        med.med_thai_name
      ].some(field =>
        typeof field === "string" && field.toLowerCase().includes(searchLower)
      )
    );
  }, [medicineSearchTerm, medicineOptions]);

  const handleMedicineSelect = (medicine) => {
    setFormData(prev => ({
      ...prev,
      med_id: String(medicine.med_id),
    }));
    setSelectedMedicineName(
      medicine.med_name || medicine.med_thai_name || medicine.med_generic_name || medicine.med_marketing_name || ""
    );
    setMedicineSearchTerm("");
  };

  const handleViewDetails = (stock) => {
    setSelectedStock(stock);
    setIsDetailModalOpen(true);
  };

  const handleOpenWithdrawModal = (stock) => {
    setSelectedStock(stock);
    setWithdrawFormData({
      quantity: "",
      unit: stock.packaging_type || "",
      note: "",
    });
    setIsWithdrawModalOpen(true);
  };

  const handleWithdrawInputChange = (e) => {
    const { name, value } = e.target;
    setWithdrawFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWithdrawStock = async (e) => {
    e.preventDefault();
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่พบ token กรุณาล็อกอินใหม่",
      });
      router.push("/login");
      return;
    }

    const { quantity, unit, note } = withdrawFormData;
    const parsedQuantity = parseInt(quantity) || 0;

    if (parsedQuantity <= 0) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "กรุณาระบุจำนวนที่มากกว่า 0",
      });
      return;
    }
    if (parsedQuantity > parseInt(selectedStock.med_quantity)) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "จำนวนที่เบิกเกินจำนวนที่มีอยู่",
      });
      return;
    }
    if (!unit) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "กรุณาเลือกประเภทบรรจุภัณฑ์",
      });
      return;
    }
    if (!userData.user_id || isNaN(userData.user_id) || userData.user_id <= 0) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่",
      });
      router.push("/login");
      return;
    }
    if (!selectedStock.med_sid) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่พบรหัสสต็อก (med_sid) สำหรับรายการนี้",
      });
      return;
    }

    try {
      const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/med_requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          med_id: selectedStock.med_id,
          med_sid: selectedStock.med_sid,
          quantity: parsedQuantity,
          unit,
          requested_by: parseInt(userData.user_id),
          note,
          origin: "subwareshouse",
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Token ไม่ถูกต้องหรือหมดอายุ");
        }
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
      }

      const updatedStock = {
        ...selectedStock,
        med_quantity: Math.max(0, parseInt(selectedStock.med_quantity) - parsedQuantity),
      };
      setAllData(allData.map(item => (item.med_sid === selectedStock.med_sid ? updatedStock : item)));
      setFilteredData(filteredData.map(item => (item.med_sid === selectedStock.med_sid ? updatedStock : item)));

      setIsWithdrawModalOpen(false);
      setWithdrawFormData({
        quantity: "",
        unit: "",
        note: "",
      });
      setSelectedStock(null);
      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "บันทึกการเบิกยาเรียบร้อยแล้ว",
      });
      await fetchAndUpdateStock();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเบิกยา:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: error.message || "ไม่สามารถเบิกยาได้ กรุณาลองอีกครั้ง",
      });
      if (error.message.includes("Token")) {
        localStorage.removeItem("user");
        localStorage.removeItem(TOKEN_KEY);
        router.push("/login");
      }
    }
  };

  const filteredStockData = useMemo(() => {
    let filtered = allData;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((stock) => {
        const medInfo = medNames[stock.med_id] || {};
        return [
          stock.med_showname,
          stock.med_showname_eng,
          stock.location,
          stock.packaging_type,
          stock.med_id,
          stock.med_sid,
          medInfo.med_name,
          medInfo.med_thai_name,
          medInfo.med_generic_name,
          medInfo.med_marketing_name,
        ].some(field =>
          typeof field === "string" && field.toLowerCase().includes(searchLower)
        );
      });
    }

    if (stockStatusFilter) {
      filtered = filtered.filter((stock) => {
        const status = getStockStatus(stock).status;
        return status === stockStatusFilter;
      });
    }

    if (expiryStatusFilter) {
      filtered = filtered.filter((stock) =>
        expiryStatusFilter === "expired" ? stock.is_expired : !stock.is_expired
      );
    }

    return filtered;
  }, [searchTerm, stockStatusFilter, expiryStatusFilter, allData, medNames]);

  useEffect(() => {
    setFilteredData(filteredStockData);
  }, [filteredStockData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่พบ token กรุณาล็อกอินใหม่",
      });
      router.push("/login");
      return;
    }

    if (!formData.packaging_type) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "กรุณาเลือกประเภทบรรจุภัณฑ์",
      });
      return;
    }

    try {
      const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          med_id: String(formData.med_id),
          med_quantity: parseInt(formData.med_quantity) || 0,
        }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Token ไม่ถูกต้องหรือหมดอายุ");
        }
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const newStock = await res.json();
      setAllData([newStock, ...allData]);
      setFilteredData([newStock, ...filteredData]);
      setIsAddModalOpen(false);
      setFormData({
        med_id: "",
        med_quantity: 0,
        packaging_type: "",
        is_divisible: false,
        location: "",
        med_showname: "",
        min_quantity: "",
        max_quantity: "",
        cost_price: "",
        unit_price: "",
        med_showname_eng: "",
        exp_date: "",
        mfg_date: "",
      });
      setMedicineSearchTerm("");
      setSelectedMedicineName("");
      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "เพิ่มสต็อกยาเรียบร้อยแล้ว",
      });
      await fetchAndUpdateStock();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: error.message || "ไม่สามารถเพิ่มข้อมูลได้ กรุณาลองอีกครั้ง",
      });
      if (error.message.includes("Token")) {
        localStorage.removeItem("user");
        localStorage.removeItem(TOKEN_KEY);
        router.push("/login");
      }
    }
  };

  const handleEditStock = async (e) => {
    e.preventDefault();
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่พบ token กรุณาล็อกอินใหม่",
      });
      router.push("/login");
      return;
    }

    if (!formData.packaging_type) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "กรุณาเลือกประเภทบรรจุภัณฑ์",
      });
      return;
    }

    try {
      const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/stock/${selectedStock.med_sid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          med_id: String(formData.med_id),
          med_quantity: parseInt(formData.med_quantity) || 0,
        }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Token ไม่ถูกต้องหรือหมดอายุ");
        }
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const updatedStock = await res.json();
      setAllData(allData.map(item => (item.med_sid === updatedStock.med_sid ? updatedStock : item)));
      setFilteredData(filteredData.map(item => (item.med_sid === updatedStock.med_sid ? updatedStock : item)));
      setIsEditModalOpen(false);
      setSelectedStock(null);
      setMedicineSearchTerm("");
      setSelectedMedicineName("");
      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "แก้ไขสต็อกยาเรียบร้อยแล้ว",
      });
      await fetchAndUpdateStock();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: error.message || "ไม่สามารถแก้ไขข้อมูลได้ กรุณาลองอีกครั้ง",
      });
      if (error.message.includes("Token")) {
        localStorage.removeItem("user");
        localStorage.removeItem(TOKEN_KEY);
        router.push("/login");
      }
    }
  };

  const handleDeleteStock = async (med_sid) => {
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่พบ token กรุณาล็อกอินใหม่",
      });
      router.push("/login");
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/stock/${med_sid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Token ไม่ถูกต้องหรือหมดอายุ");
        }
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      setAllData(allData.filter(item => item.med_sid !== med_sid));
      setFilteredData(filteredData.filter(item => item.med_sid !== med_sid));
      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "ลบสต็อกยาเรียบร้อยแล้ว",
      });
      await fetchAndUpdateStock();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบข้อมูล:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: error.message || "ไม่สามารถลบข้อมูลได้ กรุณาลองอีกครั้ง",
      });
      if (error.message.includes("Token")) {
        localStorage.removeItem("user");
        localStorage.removeItem(TOKEN_KEY);
        router.push("/login");
      }
    }
  };

  return (
    <div className="font-sarabun">
      <div className="mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <Header
            header="คลังยาย่อย"
            description="ตรวจสอบและจัดการข้อมูลคลังยาในระบบ"
            icon={Warehouse}
          />
          <div className="flex justify-between items-center gap-4 w-150">
            <div className="sm:col-span-1 w-full">
              <button
                onClick={fetchAndUpdateStock}
                className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-lg"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                รีเฟรช
              </button>
            </div>
            <div className="sm:col-span-1 w-full">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-1" />
                เพิ่มสต็อก
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
            <div className="sm:col-span-3 w-full relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ค้นหาด้วยชื่อยา, ชื่อสามัญ, ชื่อการค้า, ชื่อไทย, รหัสยา, รหัสสต็อก, สถานที่จัดเก็บ หรือประเภทบรรจุภัณฑ์..."
                onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white focus:bg-white"
              />
            </div>
            <div className="sm:col-span-1 w-full">
              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">ทุกสถานะสต็อก</option>
                <option value="ต่ำกว่าขั้นต่ำ">ต่ำกว่าขั้นต่ำ</option>
                <option value="ปกติ">ปกติ</option>
                <option value="เกินขั้นสูงสุด">เกินขั้นสูงสุด</option>
              </select>
            </div>
            <div className="sm:col-span-1 w-full">
              <select
                value={expiryStatusFilter}
                onChange={(e) => setExpiryStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">ทุกสถานะหมดอายุ</option>
                <option value="expired">หมดอายุ</option>
                <option value="not_expired">ยังไม่หมดอายุ</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div style={{ maxHeight: "65vh", overflowY: "auto" }} className="relative">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center">
                      <Pill className="mr-2 h-4 w-4 text-gray-500" />
                      รหัสสต็อก
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อยา</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">จำนวน</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ประเภทบรรจุภัณฑ์</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">สถานที่จัดเก็บ</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">สถานะ</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">สถานะหมดอายุ</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((stock, index) => {
                    const stockStatus = getStockStatus(stock);
                    const StatusIcon = stockStatus.icon;

                    return (
                      <tr key={stock.med_sid} className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                            </div>
                            {stock.med_sid}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{stock.med_showname || "-"}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{parseInt(stock.med_quantity) || 0}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{stock.packaging_type || "-"}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{stock.location || "-"}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {stockStatus.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stock.is_expired ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                            {stock.is_expired ? "หมดอายุ" : "ยังไม่หมดอายุ"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleViewDetails(stock)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                              <Eye className="w-4 h-4 mr-1" />
                            </button>
                            <button onClick={() => {
                              setSelectedStock(stock);
                              setFormData({
                                ...stock,
                                med_id: String(stock.med_id),
                                med_quantity: parseInt(stock.med_quantity) || 0,
                                mfg_date: stock.mfg_date || "",
                                exp_date: stock.exp_date || "",
                              });
                              const selectedMedicine = medicineOptions.find(med => med.med_id === stock.med_id);
                              setSelectedMedicineName(
                                selectedMedicine
                                  ? (selectedMedicine.med_name || selectedMedicine.med_thai_name || selectedMedicine.med_generic_name || selectedMedicine.med_marketing_name || "")
                                  : ""
                              );
                              setMedicineSearchTerm("");
                              setIsEditModalOpen(true);
                            }} className="inline-flex items-center px-3 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors duration-200">
                              <Edit className="w-4 h-4 mr-1" />
                            </button>
                            <button onClick={() => handleOpenWithdrawModal(stock)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200">
                              <Download className="w-4 h-4 mr-1" />
                            </button>
                            <button onClick={() => handleDeleteStock(stock.med_sid)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200">
                              <Trash2 className="w-4 h-4 mr-1" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr key="no-data">
                    <td colSpan="8" className="text-center py-4 text-gray-600">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">เพิ่มสต็อกยา</h2>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFormData({
                        med_id: "",
                        med_quantity: 0,
                        packaging_type: "",
                        is_divisible: false,
                        location: "",
                        med_showname: "",
                        min_quantity: "",
                        max_quantity: "",
                        cost_price: "",
                        unit_price: "",
                        med_showname_eng: "",
                        exp_date: "",
                        mfg_date: "",
                      });
                      setMedicineSearchTerm("");
                      setSelectedMedicineName("");
                      setIsAddModalOpen(false);
                    }}
                    className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                <form onSubmit={handleAddStock} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col relative">
                    <label className="text-sm text-gray-600 mb-1">ค้นหายา</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        value={medicineSearchTerm || selectedMedicineName}
                        onChange={(e) => {
                          setMedicineSearchTerm(e.target.value);
                          if (!e.target.value) setSelectedMedicineName("");
                        }}
                        placeholder="ค้นหาด้วยชื่อยา, ชื่อสามัญ, ชื่อการค้า หรือชื่อไทย..."
                        className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {medicineSearchTerm && (
                      <div className="absolute z-10 bg-white border border-gray-200 rounded-xl mt-1 w-full max-h-60 overflow-y-auto top-full">
                        {filteredMedicines.length > 0 ? (
                          filteredMedicines.map(med => (
                            <div
                              key={med.med_id}
                              onClick={() => handleMedicineSelect(med)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              {med.med_name} ({med.med_thai_name})
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-600">ไม่พบยาที่ตรงกัน</div>
                        )}
                      </div>
                    )}
                  </div>
                  {[
                    { label: "รหัสยา", name: "med_id", type: "text", disabled: true },
                    { label: "จำนวน", name: "med_quantity", type: "number" },
                    { label: "สถานที่จัดเก็บ", name: "location", type: "text" },
                    { label: "ชื่อยา (ไทย)", name: "med_showname", type: "text" },
                    { label: "ชื่อยา (อังกฤษ)", name: "med_showname_eng", type: "text" },
                    { label: "จำนวนขั้นต่ำ", name: "min_quantity", type: "number" },
                    { label: "จำนวนสูงสุด", name: "max_quantity", type: "number" },
                    { label: "ราคาทุน", name: "cost_price", type: "text" },
                    { label: "ราคาขาย", name: "unit_price", type: "text" },
                    { label: "วันที่ผลิต", name: "mfg_date", type: "date" },
                    { label: "วันหมดอายุ", name: "exp_date", type: "date" },
                  ].map(({ label, name, type, disabled }) => (
                    <div key={name} className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1">{label}</label>
                      {name === "packaging_type" ? (
                        <select
                          name="packaging_type"
                          value={formData.packaging_type}
                          onChange={handleInputChange}
                          className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          required
                        >
                          <option value="">เลือกประเภทบรรจุภัณฑ์</option>
                          {packagingOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={type}
                          name={name}
                          value={formData[name]}
                          onChange={handleInputChange}
                          className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          disabled={disabled}
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_divisible"
                      checked={formData.is_divisible}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-600">สามารถแบ่งได้</label>
                  </div>
                  <div className="col-span-2 flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          med_id: "",
                          med_quantity: 0,
                          packaging_type: "",
                          is_divisible: false,
                          location: "",
                          med_showname: "",
                          min_quantity: "",
                          max_quantity: "",
                          cost_price: "",
                          unit_price: "",
                          med_showname_eng: "",
                          exp_date: "",
                          mfg_date: "",
                        });
                        setMedicineSearchTerm("");
                        setSelectedMedicineName("");
                        setIsAddModalOpen(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      บันทึก
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full shadow-xl">
              <div className="bg-gradient-to-r rounded-t-3xl from-blue-600 to-blue-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">แก้ไขสต็อกยา</h2>
                      <p className="text-blue-100 text-sm">รหัสสต็อก: {selectedStock.med_sid}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setMedicineSearchTerm("");
                      setSelectedMedicineName("");
                      setFormData({
                        med_id: "",
                        med_quantity: 0,
                        packaging_type: "",
                        is_divisible: false,
                        location: "",
                        med_showname: "",
                        min_quantity: "",
                        max_quantity: "",
                        cost_price: "",
                        unit_price: "",
                        med_showname_eng: "",
                        exp_date: "",
                        mfg_date: "",
                      });
                    }}
                    className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                <form onSubmit={handleEditStock} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col relative">
                    <label className="text-sm text-gray-600 mb-1">ค้นหายา</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        value={medicineSearchTerm || selectedMedicineName}
                        onChange={(e) => {
                          setMedicineSearchTerm(e.target.value);
                          if (!e.target.value) setSelectedMedicineName("");
                        }}
                        placeholder="ค้นหาด้วยชื่อยา, ชื่อสามัญ, ชื่อการค้า หรือชื่อไทย..."
                        className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {medicineSearchTerm && (
                      <div className="absolute z-10 bg-white border border-gray-200 rounded-xl mt-1 w-full max-h-60 overflow-y-auto top-full">
                        {filteredMedicines.length > 0 ? (
                          filteredMedicines.map(med => (
                            <div
                              key={med.med_id}
                              onClick={() => handleMedicineSelect(med)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              {med.med_name} ({med.med_thai_name})
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-600">ไม่พบยาที่ตรงกัน</div>
                        )}
                      </div>
                    )}
                  </div>
                  {[
                    { label: "รหัสยา", name: "med_id", type: "text", disabled: true },
                    { label: "จำนวน", name: "med_quantity", type: "number" },
                    { label: "สถานที่จัดเก็บ", name: "location", type: "text" },
                    { label: "ชื่อยา (ไทย)", name: "med_showname", type: "text" },
                    { label: "ชื่อยา (อังกฤษ)", name: "med_showname_eng", type: "text" },
                    { label: "จำนวนขั้นต่ำ", name: "min_quantity", type: "number" },
                    { label: "จำนวนสูงสุด", name: "max_quantity", type: "number" },
                    { label: "ราคาทุน", name: "cost_price", type: "text" },
                    { label: "ราคาขาย", name: "unit_price", type: "text" },
                    { label: "วันที่ผลิต", name: "mfg_date", type: "date" },
                    { label: "วันหมดอายุ", name: "exp_date", type: "date" },
                  ].map(({ label, name, type, disabled }) => (
                    <div key={name} className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1">{label}</label>
                      {name === "packaging_type" ? (
                        <select
                          name="packaging_type"
                          value={formData.packaging_type}
                          onChange={handleInputChange}
                          className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          required
                        >
                          <option value="">เลือกประเภทบรรจุภัณฑ์</option>
                          {packagingOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={type}
                          name={name}
                          value={name === "mfg_date" || name === "exp_date" ? (formData[name] ? new Date(formData[name]).toISOString().split('T')[0] : "") : formData[name]}
                          onChange={handleInputChange}
                          className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          disabled={disabled}
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_divisible"
                      checked={formData.is_divisible}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-600">สามารถแบ่งได้</label>
                  </div>
                  <div className="col-span-2 flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setMedicineSearchTerm("");
                        setSelectedMedicineName("");
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      บันทึก
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full shadow-xl">
              <div className="bg-gradient-to-r rounded-t-3xl from-blue-600 to-blue-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">รายละเอียดสต็อกยา</h2>
                      <p className="text-blue-100 text-sm">รหัสสต็อก: {selectedStock.med_sid}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "รหัสยา", value: selectedStock.med_id || "-" },
                    { label: "จำนวน", value: selectedStock.med_quantity || "-" },
                    { label: "ประเภทบรรจุภัณฑ์", value: selectedStock.packaging_type || "-" },
                    { label: "สถานที่จัดเก็บ", value: selectedStock.location || "-" },
                    { label: "ชื่อยา (ไทย)", value: selectedStock.med_showname || "-" },
                    { label: "ชื่อยา (อังกฤษ)", value: selectedStock.med_showname_eng || "-" },
                    { label: "จำนวนขั้นต่ำ", value: selectedStock.min_quantity || "-" },
                    { label: "จำนวนสูงสุด", value: selectedStock.max_quantity || "-" },
                    { label: "ราคาทุน", value: selectedStock.cost_price || "-" },
                    { label: "ราคาขาย", value: selectedStock.unit_price || "-" },
                    { label: "วันที่ผลิต", value: <FormatDate dateString={selectedStock.mfg_date || "-"} /> },
                    { label: "วันหมดอายุ", value: <FormatDate dateString={selectedStock.exp_date || "-"} /> },
                    { label: "สถานะหมดอายุ", value: selectedStock.is_expired ? "หมดอายุ" : "ยังไม่หมดอายุ" },
                    { label: "สามารถแบ่งได้", value: selectedStock.is_divisible ? "ใช่" : "ไม่" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1">{label}</label>
                      <p className="border border-gray-200 rounded-xl px-4 py-2 bg-gray-50 text-sm text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-b-3xl px-6 py-4 flex justify-end">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}

        {isWithdrawModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">เบิกยา</h2>
                      <p className="text-green-100 text-sm">รหัสสต็อก: {selectedStock.med_sid}</p>
                      <p className="text-green-100 text-sm">ผู้เบิก: {userData.username || "ไม่ระบุ"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsWithdrawModalOpen(false);
                      setWithdrawFormData({
                        quantity: "",
                        unit: "",
                        note: "",
                      });
                      setSelectedStock(null);
                    }}
                    className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                <form onSubmit={handleWithdrawStock} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">ชื่อยา</label>
                    <p className="border border-gray-200 rounded-xl px-4 py-2 bg-gray-50 text-sm text-gray-900">
                      {selectedStock.med_showname || selectedStock.med_showname_eng || "-"}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">จำนวนคงเหลือ</label>
                    <p className="border border-gray-200 rounded-xl px-4 py-2 bg-gray-50 text-sm text-gray-900">
                      {parseInt(selectedStock.med_quantity) || 0}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">จำนวนที่เบิก</label>
                    <input
                      type="number"
                      name="quantity"
                      value={withdrawFormData.quantity}
                      onChange={handleWithdrawInputChange}
                      className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="ระบุจำนวน"
                      min="1"
                      max={parseInt(selectedStock.med_quantity) || 0}
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">หน่วย</label>
                    <select
                      name="unit"
                      value={withdrawFormData.unit}
                      onChange={handleWithdrawInputChange}
                      className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      required
                    >
                      <option value="">เลือกหน่วย</option>
                      {packagingOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">หมายเหตุ</label>
                    <textarea
                      name="note"
                      value={withdrawFormData.note}
                      onChange={handleWithdrawInputChange}
                      className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="ระบุหมายเหตุ (ถ้ามี)"
                      rows="4"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsWithdrawModalOpen(false);
                        setWithdrawFormData({
                          quantity: "",
                          unit: "",
                          note: "",
                        });
                        setSelectedStock(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      บันทึก
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}