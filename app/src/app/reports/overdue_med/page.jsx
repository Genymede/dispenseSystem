"use client";
import { useEffect, useState, useMemo } from "react";
import ReportFilter from "@/app/component/ReportFilter";
import exportPDF from "@/app/component/PDFexport";
import exportCSV from "@/app/component/CSVexport";
import ExportButton from "@/app/component/ExportButton";
import { FileText, Table2, BarChart3, Search, Package, AlertTriangle, CheckCircle, Eye, X, Calendar, TrendingDown, CalendarDays } from "lucide-react";
import Header from "@/app/component/Header";
import { FormatDate, FormatDateTime } from "@/app/component/formatDate";

export default function OverdueMedPage() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [medNames, setMedNames] = useState({});
  const [patients, setPatients] = useState({});
  const [users, setUsers] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0" });
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOverdue, setSelectedOverdue] = useState(null);

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  
  // Determine status
  const getStatus = (item) => {
    const quantity = item.quantity ?? 0;
    const dispensed = item.dispensed_quantity ?? 0;
    const remaining = quantity - dispensed;

    if (item.dispense_status) {
      return { status: "จ่ายครบแล้ว", color: "bg-green-100 text-green-800", icon: CheckCircle };
    } else if (dispensed > 0 && remaining > 0) {
      return { status: `จ่ายแล้ว ${dispensed} เหลือ ${remaining}`, color: "bg-yellow-100 text-yellow-800", icon: TrendingDown };
    } else {
      return { status: "ค้างจ่าย", color: "bg-red-100 text-red-800", icon: AlertTriangle };
    }
  };

  // Fetch overdue medicine, patient, user, and medicine stock data
  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        const [res, patientRes, medStockRes] = await Promise.all([
          fetch(`https://dispensesystem-production.up.railway.app/reports/overdue_med`, { cache: "no-store" }),
          fetch(`https://dispensesystem-production.up.railway.app/patient`, { cache: "no-store" }),
          fetch(`https://dispensesystem-production.up.railway.app/medicine/stock`, { cache: "no-store" }) // Fetch medicine stock
        ]);

        if (!res.ok) throw new Error(`HTTP error fetching overdue_med! Status: ${res.status}`);
        if (!patientRes.ok) throw new Error(`HTTP error fetching patients! Status: ${patientRes.status}`);
        if (!medStockRes.ok) throw new Error(`HTTP error fetching medicine stock! Status: ${medStockRes.status}`);

        const [data, patientData, medStockData] = await Promise.all([
          res.json(),
          patientRes.json(),
          medStockRes.json(),
        ]);

        if (!Array.isArray(data)) {
          console.error("API response for overdue_med is not an array:", data);
          setAllData([]);
          setFilteredData([]);
          setError("ได้รับข้อมูลไม่ถูกต้องจากเซิร์ฟเวอร์ กรุณาลองอีกครั้ง");
          return;
        }

        // Check for duplicate overdue_id
        const overdueIds = data.map(item => item.overdue_id);
        const uniqueOverdueIds = new Set(overdueIds);
        if (uniqueOverdueIds.size !== overdueIds.length) {
          console.warn("พบ overdue_id ที่ซ้ำกันในข้อมูล API:", overdueIds);
        }

        // Validate and add fallback values
        const validatedData = data.map((item, index) => ({
          ...item,
          overdue_id: item.overdue_id ?? `fallback-${index}`,
          med_id: item.med_id ?? "-",
          patient_id: item.patient_id ?? "-",
          doctor_id: item.doctor_id ?? "-",
          quantity: item.quantity ?? 0,
          dispensed_quantity: item.dispensed_quantity ?? 0,
          time: item.time ?? null
        }));

        setAllData(validatedData);
        setFilteredData(validatedData);

        // Map patient data
        const patientMap = {};
        (Array.isArray(patientData) ? patientData : []).forEach(p => {
          patientMap[p.patient_id] = {
            hn: p.hn_number || "-",
            name: `${p.first_name || "-"} ${p.last_name || "-"}`.trim()
          };
        });
        setPatients(patientMap);

        // Map medicine stock data
        const medMap = {};
        (Array.isArray(medStockData) ? medStockData : []).forEach(med => {
          if (med.med_id) {
            medMap[med.med_id] = {
              thai: med.med_showname || `ID: ${med.med_id}`,
              english: med.med_showname_eng || `ID: ${med.med_id}`,
              display: med.med_showname || `ID: ${med.med_id}` // Use med_showname for display
            };
          }
        });
        setMedNames(medMap);

        // Fetch users based on doctor_id from data
        let userMap = {};
        if (data.length > 0) {
          // Extract unique doctor_id values
          const uniqueDoctorIds = [...new Set(data.map(item => item.doctor_id).filter(id => id && id !== "-"))];
          
          // Fetch user data for each unique doctor_id
          for (const doctorId of uniqueDoctorIds) {
            try {
              const userRes = await fetch(`https://dispensesystem-production.up.railway.app/user/${doctorId}`, { cache: "no-store" });
              if (!userRes.ok) {
                const errorText = await userRes.text().catch(() => "No error details available");
                throw new Error(`HTTP error fetching user/${doctorId}! Status: ${userRes.status}, Details: ${errorText}`);
              }
              const userData = await userRes.json();
              // Expecting userData to be an object with user_id, username, etc.
              if (userData && userData.user_id && userData.username) {
                userMap[userData.user_id] = userData.username || "-";
              } else {
                console.warn(`Invalid user data for user_id ${doctorId}:`, userData);
                userMap[doctorId] = "-";
              }
            } catch (err) {
              console.error(`Error fetching user/${doctorId}:`, err);
              userMap[doctorId] = "-";
            }
          }
        }
        setUsers(userMap);

      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลยาค้างจ่าย:", error);
        setAllData([]);
        setFilteredData([]);
        setMedNames({});
        setPatients({});
        setUsers({});
        setError("ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อและลองอีกครั้ง");
      }
    }

    fetchData();
  }, []);

  // Filter function
  const applyFilter = ({ days, month, year, startDate: filterStartDate }) => {
    setFilterSettings({ days, month, year });
    setStartDate(filterStartDate || "");

    let filtered = [...allData];

    if (filterStartDate) {
      const start = new Date(filterStartDate);
      if (isNaN(start.getTime())) {
        setError("วันที่ไม่ถูกต้อง");
        setFilteredData([]);
        return;
      }
      start.setHours(0, 0, 0, 0);
      const end = new Date(filterStartDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        if (!item.time) return false;
        const itemDate = new Date(item.time);
        return itemDate >= start && itemDate <= end;
      });
    } else if (days > 0) {
      const cutoff = new Date(Date.now() - days * 86400000);
      filtered = filtered.filter(item => {
        if (!item.time) return false;
        return new Date(item.time) >= cutoff;
      });
    } else {
      if (month !== "0") {
        filtered = filtered.filter(item => {
          if (!item.time) return false;
          return new Date(item.time).getMonth() + 1 === parseInt(month);
        });
      }
      if (year !== "0") {
        filtered = filtered.filter(item => {
          if (!item.time) return false;
          return new Date(item.time).getFullYear() === parseInt(year);
        });
      }
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(item => {
        const quantity = item.quantity ?? 0;
        const dispensed = item.dispensed_quantity ?? 0;
        const remaining = quantity - dispensed;
        if (statusFilter === "pending") return !item.dispense_status && dispensed === 0;
        if (statusFilter === "partial") return !item.dispense_status && dispensed > 0 && remaining > 0;
        if (statusFilter === "completed") return item.dispense_status;
        return true;
      });
    }

    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        String(patients[item.patient_id]?.hn || "").toLowerCase().includes(lowerTerm) ||
        String(patients[item.patient_id]?.name || "").toLowerCase().includes(lowerTerm) ||
        String(medNames[item.med_id]?.thai || "").toLowerCase().includes(lowerTerm) || // Search med_showname
        String(medNames[item.med_id]?.english || "").toLowerCase().includes(lowerTerm) || // Search med_showname_eng
        String(item.overdue_id || "").toString().includes(lowerTerm) ||
        String(users[item.doctor_id] || "").toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredData(filtered);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterSettings({ days: 0, month: "0", year: "0" });
    setStartDate("");
    setStatusFilter("all");
    setSearchTerm("");
  };

  // Trigger filtering on changes
  useEffect(() => {
    applyFilter({ ...filterSettings, startDate });
  }, [allData, searchTerm, statusFilter, startDate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Prepare table data
  const prepareTableData = useMemo(() => {
    const columns = [
      "รหัส",
      "เวลา",
      "HN",
      "ชื่อผู้ป่วย",
      "ชื่อยา",
      "ผู้สั่งยา",
      "จำนวนค้าง",
      "สถานะ"
    ];
    const rows = filteredData.map(d => {
      const patient = patients[d.patient_id] || {};
      const quantity = d.quantity ?? 0;
      const dispensed = d.dispensed_quantity ?? 0;
      const remaining = quantity - dispensed;
      const status = getStatus(d);
      return [
        d.overdue_id,
        formatDate(d.time),
        patient.hn || "-",
        patient.name || "-",
        medNames[d.med_id]?.display || `ID: ${d.med_id}`, // Use med_showname
        users[d.doctor_id] || d.doctor_id || "-",
        remaining,
        status.status
      ];
    });
    return { columns, rows };
  }, [filteredData, patients, medNames, users]);

  // Export to PDF
  const tableToPDF = async () => {
    setIsExporting(true);
    try {
      const { columns, rows } = prepareTableData;
      const currentDate = new Date().toLocaleString('th-TH', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok'
      });
      await exportPDF({
        filename: `overdue_med_report_${currentDate}.pdf`,
        columns,
        rows,
        title: `รายงานยาค้างจ่าย ณ วันที่ ${currentDate}`,
        orientation: 'landscape'
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setError("เกิดข้อผิดพลาดในการส่งออก PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // Export to CSV
  const tableToCSV = () => {
    setIsExporting(true);
    try {
      const { columns, rows } = prepareTableData;
      const currentDate = new Date().toLocaleString('th-TH', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok'
      });
      exportCSV({
        filename: `overdue_med_report_${currentDate}.csv`,
        columns,
        rows,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setError("เกิดข้อผิดพลาดในการส่งออก CSV");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="font-sarabun">
      <div className=" mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <Header
            header="รายงานยาค้างจ่าย"
            description="ตรวจสอบและจัดการข้อมูลยาค้างจ่ายของผู้ป่วยในระบบ"
            icon={BarChart3}
          />
          <div className="flex gap-3 mt-4 lg:mt-0">
            <ExportButton
              key="pdf-export"
              onExport={tableToPDF}
              description="ดาวน์โหลด PDF"
              icon={FileText}
              color="red"
              isExporting={isExporting}
              disabled={isExporting}
            />
            <ExportButton
              key="csv-export"
              onExport={tableToCSV}
              description="ดาวน์โหลด CSV"
              icon={Table2}
              color="green"
              isExporting={isExporting}
              disabled={isExporting}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-xl mb-4">
            <p>{error}</p>
          </div>
        )}

        
        {/* Filter and Search Section */}
        <div className="flex flex-col gap-4 mb-4">
          <ReportFilter onFilterChange={applyFilter} />
          <div className="flex-1 flex flex-col lg:flex-row gap-4 items-center w-full">
            <div className="relative min-w-[200px]">
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none"
              >
                <option value="all">สถานะ: ทั้งหมด</option>
                <option value="pending">ค้างจ่าย</option>
                <option value="partial">จ่ายบางส่วน</option>
                <option value="completed">จ่ายครบแล้ว</option>
              </select>
              <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ค้นหาด้วยรหัส, HN, ชื่อผู้ป่วย, ชื่อยา หรือผู้สั่งยา..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
              />
            </div>
            <div className="relative min-w-[150px]">
              <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                placeholder="วันที่"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
              />
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center px-4 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
            >
              <X className="w-4 h-4 mr-1" />
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        {/* Table Section */}
        {filteredData.length === 0 && (searchTerm || startDate || filterSettings.days > 0 || filterSettings.month !== "0" || filterSettings.year !== "0" || statusFilter !== "all") ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">ไม่พบข้อมูลยาค้างจ่าย</p>
            <p className="text-gray-400">ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div style={{ maxHeight: "65vh", overflowY: "auto" }} className="relative">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4 text-gray-500" />
                        รหัส
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">เวลา</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">HN</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อผู้ป่วย</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อยา</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ผู้สั่งยา</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">จำนวนค้าง</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">สถานะ</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ดูรายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((item, index) => {
                    const status = getStatus(item);
                    const StatusIcon = status.icon;
                    const patient = patients[item.patient_id] || {};
                    const quantity = item.quantity ?? 0;
                    const dispensed = item.dispensed_quantity ?? 0;
                    const remaining = quantity - dispensed;

                    return (
                      <tr
                        key={item.overdue_id}
                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                            </div>
                            {item.overdue_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600"><FormatDate dateString={item.time} /></td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{patient.hn || "-"}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{patient.name || "-"}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{medNames[item.med_id]?.display || `ID: ${item.med_id}`}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{users[item.doctor_id] || item.doctor_id || "-"}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{remaining}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {status.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedOverdue(item)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            ดูรายละเอียด
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Overdue Detail Modal */}
        {selectedOverdue && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">รายละเอียดยาค้างจ่าย</h2>
                      <p className="text-blue-100 text-sm">รหัส: {selectedOverdue.overdue_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOverdue(null)}
                    className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 border-r border-gray-300 pr-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      ข้อมูลพื้นฐาน
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: "รหัส", value: selectedOverdue.overdue_id || "-", key: "overdue_id" },
                        { label: "รหัสยา", value: selectedOverdue.med_id || "-", key: "med_id" },
                        { label: "ชื่อยา", value: medNames[selectedOverdue.med_id]?.display || `ID: ${selectedOverdue.med_id}`, key: "med_name" }, // Use med_showname
                        { label: "รหัสผู้ป่วย", value: selectedOverdue.patient_id || "-", key: "patient_id" },
                        { label: "HN", value: patients[selectedOverdue.patient_id]?.hn || "-", key: "hn" },
                        { label: "ชื่อผู้ป่วย", value: patients[selectedOverdue.patient_id]?.name || "-", key: "patient_name" },
                        { label: "ผู้สั่งยา", value: users[selectedOverdue.doctor_id] || selectedOverdue.doctor_id || "-", key: "doctor_id" },
                      ].map(item => (
                        <div key={`basic-info-${item.key}`} className="flex justify-between py-2">
                          <span className="text-sm text-gray-600">{item.label}:</span>
                          <span className="font-medium text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      สถานะและวันที่
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-start gap-2">
                        <p className="text-sm text-gray-600">สถานะ:</p>
                        <div>
                          {(() => {
                            const status = getStatus(selectedOverdue);
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
                      <div className="space-y-2">
                        {[
                          { label: "จำนวนทั้งหมด", value: selectedOverdue.quantity ?? 0, key: "quantity" },
                          { label: "จำนวนที่จ่ายแล้ว", value: selectedOverdue.dispensed_quantity ?? 0, key: "dispensed_quantity" },
                          { label: "จำนวนค้าง", value: (selectedOverdue.quantity ?? 0) - (selectedOverdue.dispensed_quantity ?? 0), key: "remaining" },
                        ].map(item => (
                          <div key={`status-info-${item.key}`} className="flex justify-between py-2">
                            <span className="text-sm text-gray-600">{item.label}:</span>
                            <span className="font-medium text-gray-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          ข้อมูลวันที่
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">วันที่:</span>
                            <span className="text-gray-900"><FormatDateTime dateString={selectedOverdue.time} /></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}