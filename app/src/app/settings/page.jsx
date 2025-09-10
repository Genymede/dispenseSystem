"use client";
import { useEffect, useState, useCallback } from "react";
import { Package, Check, X, Edit, Save, Undo2,Bolt } from "lucide-react";
import Swal from "sweetalert2";
import Header from "../component/Header";

const isClient = typeof window !== "undefined";
const host = process.env.NEXT_PUBLIC_API_HOST || (isClient ? window.location.hostname : "localhost");

// Centralized error handler
const handleError = (title, message, error) => {
  console.error(`${title}:`, error);
  return { message, status: "error" };
};

// API fetch functions
async function getRuleById(ruleId) {
  try {
    const res = await fetch(`https://dispensesystem-production.up.railway.app/settings/${ruleId}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleError("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูลการตั้งค่าได้", error);
  }
}

async function getCutOffPeriods() {
  try {
    const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/med_cut_off_period`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleError("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูลรอบตัดยอดได้", error);
  }
}

async function setCutOffPeriod(cutOffId, period_day, is_active) {
  try {
    const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/med_cut_off_period/${cutOffId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period_day, is_active }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleError("ข้อผิดพลาด", "ไม่สามารถอัปเดตรอบตัดยอดได้", error);
  }
}

async function setRule(ruleId, trigger_condition) {
  try {
    const res = await fetch(`https://dispensesystem-production.up.railway.app/settings/${ruleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trigger_condition }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    return handleError("ข้อผิดพลาด", "ไม่สามารถอัปเดตการตั้งค่าได้", error);
  }
}

export default function Settings() {
  const [expDay, setExpDay] = useState(7);
  const [initialExpDay, setInitialExpDay] = useState(7);
  const [cutOffDay, setCutOffDay] = useState(7);
  const [initialCutOffDay, setInitialCutOffDay] = useState(7);
  const [subwarehouseData, setSubwarehouseData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const cutOffPeriods = await getCutOffPeriods();
    if (cutOffPeriods.message) {
      setError(cutOffPeriods.message);
    } else {
      setSubwarehouseData(cutOffPeriods);
      setError(null);
    }
    setLoading(false);
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const expAlertRule = await getRuleById(2);
    if (expAlertRule.message) {
      setError(expAlertRule.message);
    } else if (expAlertRule?.trigger_condition?.value) {
      const match = expAlertRule.trigger_condition.value.match(/(\d+)\s+days/);
      if (match) {
        const value = parseInt(match[1], 10);
        setExpDay(value);
        setInitialExpDay(value);
        setCutOffDay(value); // Assume cutOffDay uses same rule for consistency
        setInitialCutOffDay(value);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData();
    fetchSettings();
  }, [fetchAllData, fetchSettings]);

  const handleSetExp = useCallback((event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setExpDay(value);
    }
  }, []);

  const handleSetCutOff = useCallback((event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setCutOffDay(value);
    }
  }, []);

  const handleSaveExp = useCallback(async () => {
    setLoading(true);
    const saveJson = {
      field: "med_exp",
      value: `now()::date + interval '${expDay} days'`,
      operator: "<",
    };
    const res = await setRule(2, saveJson);
    if (res.message) {
      setError(res.message);
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: res.message, timer: 3000, showConfirmButton: true });
    } else {
      setInitialExpDay(expDay);
      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "ตั้งค่าเวลาแจ้งเตือนยาหมดอายุสำเร็จ",
        timer: 3000,
        showConfirmButton: true,
      });
    }
    setLoading(false);
  }, [expDay]);

  const handleSaveCutOff = useCallback(async () => {
    setLoading(true);
    const updatedData = await setCutOffPeriod(1, cutOffDay, true);
    if (updatedData.message) {
      setError(updatedData.message);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: updatedData.message,
        timer: 3000,
        showConfirmButton: true,
      });
    } else {
      setInitialCutOffDay(cutOffDay);
      await fetchAllData();
      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "ตั้งค่าเวลาแจ้งเตือนตัดรอบสำเร็จ",
        timer: 3000,
        showConfirmButton: true,
      });
    }
    setLoading(false);
  }, [cutOffDay, fetchAllData]);

  const handleEditClick = useCallback((sw) => {
    setEditingId(sw.med_period_id);
    setEditedData({
      period_day: sw.period_day,
      is_active: sw.is_active,
    });
  }, []);

  const handleCancelClick = useCallback(() => {
    setEditingId(null);
    setEditedData({});
  }, []);

  const handleSaveClick = useCallback(
    async (id) => {
      const { period_day, is_active } = editedData;
      if (!period_day || period_day < 1 || period_day > 31) {
        Swal.fire({
          icon: "error",
          title: "ข้อมูลไม่ถูกต้อง",
          text: "วันที่ตัดรอบต้องอยู่ระหว่าง 1-31",
          timer: 3000,
          showConfirmButton: true,
        });
        return;
      }
      setLoading(true);
      const updatedData = await setCutOffPeriod(id, period_day, is_active);
      if (updatedData.message) {
        setError(updatedData.message);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: updatedData.message,
          timer: 3000,
          showConfirmButton: true,
        });
      } else {
        await fetchAllData();
        setEditingId(null);
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "ตั้งค่ารอบตัดยอดสำเร็จ",
          timer: 3000,
          showConfirmButton: true,
        });
      }
      setLoading(false);
    },
    [editedData, fetchAllData]
  );

  const handleInputChange = useCallback((e, field) => {
    const value = field === "is_active" ? e.target.checked : parseInt(e.target.value, 10);
    setEditedData((prev) => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <X size={20} />
            <span>{error}</span>
          </div>
        )}
        <Header header="การตั้งค่าการแจ้งเตือน" description="จัดการระบบแจ้งเตือนต่างๆ ของคลัง" icon={Bolt} />
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                แจ้งเตือนยาใกล้หมดอายุ
              </h2>
              <p className="text-blue-600 text-xs mt-1">ตั้งค่าจำนวนวันที่จะแจ้งเตือนก่อนยาหมดอายุ</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <input
                  id="expDay"
                  type="number"
                  value={expDay}
                  onChange={handleSetExp}
                  className="w-16 h-10 text-center font-semibold border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                  min="1"
                  aria-label="จำนวนวันก่อนหมดอายุ"
                  aria-required="true"
                />
                <span className="text-gray-600 text-sm flex-1">วันก่อนหมดอายุ</span>
                <button
                  onClick={handleSaveExp}
                  disabled={loading || expDay === initialExpDay}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                แจ้งเตือนการตัดรอบ
              </h2>
              <p className="text-blue-600 text-xs mt-1">ตั้งค่าวันที่ตัดรอบสำหรับการแจ้งเตือน</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <input
                  id="cutOffDay"
                  type="number"
                  value={cutOffDay}
                  onChange={handleSetCutOff}
                  className="w-16 h-10 text-center font-semibold border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                  min="1"
                  max="31"
                  aria-label="วันที่ตัดรอบ"
                  aria-required="true"
                />
                <span className="text-gray-600 text-sm flex-1">วันที่ตัดรอบ</span>
                <button
                  onClick={handleSaveCutOff}
                  disabled={loading || cutOffDay === initialCutOffDay}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-blue-800 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              การตั้งค่าวันตัดยอดสำหรับคลังย่อย
            </h2>
            <p className="text-blue-600 text-xs mt-1">แก้ไขวันที่ตัดยอดของคลังย่อยแต่ละแห่ง</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    รหัสคลัง
                  </th>
                  <th scope="col" className="px-4 py-3">
                    ชื่อคลัง
                  </th>
                  <th scope="col" className="px-4 py-3">
                    วันที่ตัดรอบ
                  </th>
                  <th scope="col" className="px-4 py-3">
                    สถานะ
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    การกระทำ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subwarehouseData.length > 0 ? (
                  subwarehouseData.map((sw) => {
                    const isEditing = editingId === sw.med_period_id;
                    return (
                      <tr key={sw.med_period_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">{sw.sub_warehouse_id}</td>
                        <td className="px-4 py-4">{sw.sub_warehouse_name}</td>
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedData.period_day || ""}
                              onChange={(e) => handleInputChange(e, "period_day")}
                              className="w-16 text-center border rounded px-1 focus:border-blue-500 focus:outline-none"
                              min="1"
                              max="31"
                              aria-label="วันที่ตัดรอบ"
                            />
                          ) : (
                            sw.period_day
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <input
                              type="checkbox"
                              checked={editedData.is_active}
                              onChange={(e) => handleInputChange(e, "is_active")}
                              aria-label="สถานะการใช้งาน"
                            />
                          ) : sw.is_active ? (
                            <div className="flex items-center text-green-500">
                              <Check className="w-4 h-4 mr-1" /> เปิดใช้งาน
                            </div>
                          ) : (
                            <div className="flex items-center text-red-500">
                              <X className="w-4 h-4 mr-1" /> ปิดใช้งาน
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSaveClick(sw.med_period_id)}
                                className="text-green-600 hover:text-green-800 transition-colors"
                                disabled={loading}
                                aria-label="บันทึกการเปลี่ยนแปลง"
                              >
                                <Save size={20} />
                              </button>
                              <button
                                onClick={handleCancelClick}
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                                disabled={loading}
                                aria-label="ยกเลิกการแก้ไข"
                              >
                                <Undo2 size={20} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditClick(sw)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              disabled={loading}
                              aria-label={`แก้ไขรอบตัดยอด ${sw.sub_warehouse_name}`}
                            >
                              <Edit size={20} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <Package size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">ไม่มีข้อมูลคลังย่อย</h3>
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