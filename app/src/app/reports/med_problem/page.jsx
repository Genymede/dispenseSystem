"use client";
import { useEffect, useState } from "react";
import ReportFilter from "@/app/component/ReportFilter";
import exportPDF from "@/app/component/PDFexport";
import exportCSV from "@/app/component/CSVexport";
import ExportButton from "@/app/component/ExportButton";
import Header from "@/app/component/Header";
import { FileText, Table2, BarChart3, Search, Package, CheckCircle, X, AlertTriangle, Pill, Eye, Calendar } from "lucide-react";
import { getMedicines } from "@/app/api/medicines";
import {FormatDate, FormatDateTime} from "@/app/component/formatDate";

const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

export default function MedProblem() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [medNames, setMedNames] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);

  // ดึงข้อมูลเมื่อ Component ถูก Render ครั้งแรก
  useEffect(() => {
    async function fetchAll() {
      try {
        setError(null);
        const [problemRes, medicines] = await Promise.all([
          fetch(`https://dispensesystem-production.up.railway.app/medicine/problems`, { cache: "no-store" }).then((res) => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
          }),
          getMedicines(),
        ]);

        if (!Array.isArray(problemRes)) {
          console.error("API response for problems is not an array:", problemRes);
          setAllData([]);
          setFilteredData([]);
          setError("ได้รับข้อมูลปัญหาการใช้ยาไม่ถูกต้องจากเซิร์ฟเวอร์ กรุณาลองอีกครั้ง");
          return;
        }

        const medMap = {};
        medicines.forEach((med) => {
          medMap[med.med_id] = med.med_name || `ID: ${med.med_id}`;
        });

        const validatedData = problemRes.map((item, index) => ({
          ...item,
          mp_id: item.mp_id != null ? String(item.mp_id) : `fallback-${index}`,
          med_id: item.med_id ?? null,
          usage_id: item.usage_id ?? "-",
          problem_type: item.problem_type ?? "ไม่ระบุ",
          description: item.description ?? "-",
          reported_by: item.reported_by ?? "ไม่ระบุ",
          reported_at: item.reported_at ?? null,
          is_resolved: item.is_resolved ?? false,
          created_at: item.created_at ?? null,
          updated_at: item.updated_at ?? null,
          med_name: medMap[item.med_id] || `ID: ${item.med_id || "ไม่ระบุ"}`,
        }));

        setAllData(validatedData);
        setFilteredData(validatedData);
        setMedNames(medMap);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        setAllData([]);
        setFilteredData([]);
        setMedNames({});
        setError("ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อและลองอีกครั้ง");
      }
    }
    fetchAll();
  }, []);

  // กรองข้อมูลเมื่อ State ของ Filter หรือ Search เปลี่ยน
  useEffect(() => {
    let filtered = [...allData];

    // กรองตามวันที่
    const filterByDate = (item) => {
      const itemDate = new Date(item.reported_at);
      let isMatch = true;

      if (filterSettings.days > 0) {
        const cutoff = new Date(Date.now() - filterSettings.days * 86400000);
        isMatch = itemDate >= cutoff;
      } else {
        if (filterSettings.month !== "0") {
          isMatch = isMatch && (itemDate.getMonth() + 1 === parseInt(filterSettings.month));
        }
        if (filterSettings.year !== "0") {
          isMatch = isMatch && (itemDate.getFullYear() === parseInt(filterSettings.year));
        }
      }
      return isMatch;
    };

    filtered = filtered.filter(filterByDate);

    // กรองตามสถานะ
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => String(item.is_resolved) === statusFilter);
    }

    // กรองด้วยการค้นหา
    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        const medName = (item.med_name || "").toLowerCase();
        const problemType = (item.problem_type || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const reportedBy = (item.reported_by || "").toLowerCase();
        const usageId = (item.usage_id || "").toLowerCase();

        return (
          medName.includes(lowerTerm) ||
          problemType.includes(lowerTerm) ||
          description.includes(lowerTerm) ||
          reportedBy.includes(lowerTerm) ||
          usageId.includes(lowerTerm)
        );
      });
    }

    setFilteredData(filtered);
  }, [allData, filterSettings, statusFilter, searchTerm]);

  // ฟังก์ชันจัดการการค้นหา
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleStatusFilter = (e) => setStatusFilter(e.target.value);
  const handleDateFilter = (newSettings) => setFilterSettings(newSettings);

  // ฟังก์ชันรีเซ็ตตัวกรอง
  const resetFilters = () => {
    setFilterSettings({ days: 0, month: "0", year: "0" });
    setStatusFilter("all");
    setSearchTerm("");
  };

  // ฟังก์ชันกำหนดสถานะ
  const getStatusIcon = (isResolved) => {
    return isResolved
      ? { status: "แก้ไขแล้ว", color: "bg-green-100 text-green-800", icon: CheckCircle }
      : { status: "ยังไม่แก้ไข", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle };
  };
const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return "-";
    }
  };
  // ส่งออกเป็น PDF
  const tableToPDF = async () => {
    setIsExporting(true);
    try {
      const columns = [
        "ID",
        "ยา",
        "รหัสการใช้ยา",
        "ประเภทปัญหา",
        "คำอธิบาย",
        "ผู้รายงาน",
        "วันที่รายงาน",
        "สถานะ",
      ];
      const rows = filteredData.map((row) => [
        row.mp_id,
        row.med_name,
        row.usage_id,
        row.problem_type,
        row.description,
        row.reported_by,
        formatDate(row.reported_at),
        getStatusIcon(row.is_resolved).status,
      ]);
      await exportPDF({
        filename: `med_problem_report_${new Date().toISOString().split("T")[0]}.pdf`,
        title: "รายงานปัญหาการใช้ยา",
        columns,
        rows,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setError("เกิดข้อผิดพลาดในการส่งออก PDF");
    } finally {
      setIsExporting(false);
    }
  };
  
  // ส่งออกเป็น CSV
  const tableToCSV = () => {
    setIsExporting(true);
    try {
      const columns = [
        "ID",
        "ยา",
        "รหัสการใช้ยา",
        "ประเภทปัญหา",
        "คำอธิบาย",
        "ผู้รายงาน",
        "วันที่รายงาน",
        "สถานะ",
      ];
      const rows = filteredData.map((row) => [
        row.mp_id,
        row.med_name,
        row.usage_id,
        row.problem_type,
        row.description,
        row.reported_by,
        formatDate(row.reported_at),
        getStatusIcon(row.is_resolved).status,
      ]);
      exportCSV({
        filename: `med_problem_report_${new Date().toISOString().split("T")[0]}.csv`,
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
    <div className="">
      <div className=" mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <Header
            header="รายงานปัญหาการใช้ยา"
            description="ตรวจสอบและจัดการข้อมูลปัญหาการใช้ยาในระบบ"
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
        <div className="mt-6 mb-4">
          <div className="flex flex-col lg:flex-col gap-4 items-center">
            <ReportFilter onFilterChange={handleDateFilter} />
            <div className="flex-1 flex gap-4 items-center w-full">
              <div className="relative min-w-[200px]">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none"
                >
                  <option value="all">สถานะ: ทั้งหมด</option>
                  <option value="true">แก้ไขแล้ว</option>
                  <option value="false">ยังไม่แก้ไข</option>
                </select>
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ค้นหาด้วยชื่อยา, ประเภทปัญหา, คำอธิบาย, หรือผู้รายงาน..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              <button
                onClick={resetFilters}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
              >
                <X className="w-4 h-4 mr-1" />
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div style={{ maxHeight: "65vh", overflowY: "auto" }} className="relative">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center">
                      <Pill className="mr-2 h-4 w-4 text-gray-500" />
                      ID
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ยา</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">รหัสการใช้ยา</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ประเภทปัญหา</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">คำอธิบาย</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ผู้รายงาน</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">วันที่รายงาน</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">สถานะ</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ดูรายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => {
                    const statusInfo = getStatusIcon(item.is_resolved);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr
                        key={item.mp_id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                            </div>
                            {item.mp_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{item.med_name}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{item.usage_id}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{item.problem_type}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600 max-w-[20vh] truncate">{item.description}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{item.reported_by}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{formatDate(item.reported_at)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {statusInfo.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedProblem(item)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            ดูรายละเอียด
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr key="no-data">
                    <td colSpan="9" className="text-center py-4 text-gray-600">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Problem Detail Modal */}
        {selectedProblem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">รายละเอียดปัญหาการใช้ยา</h2>
                      <p className="text-blue-100 text-sm">รหัสปัญหา: {selectedProblem.mp_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProblem(null)}
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
                      <Pill className="h-5 w-5 text-blue-600" />
                      ข้อมูลพื้นฐาน
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">รหัสปัญหา:</span>
                        <span className="font-medium text-gray-900">{selectedProblem.mp_id}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">รหัสยา:</span>
                        <span className="font-medium text-gray-900">{selectedProblem.med_id || "-"}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">ชื่อยา:</span>
                        <span className="font-medium text-gray-900">{selectedProblem.med_name}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">รหัสการใช้ยา:</span>
                        <span className="font-medium text-gray-900">{selectedProblem.usage_id}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">ประเภทปัญหา:</span>
                        <span className="font-medium text-gray-900">{selectedProblem.problem_type}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">คำอธิบาย:</span>
                        <span className="font-medium text-gray-900">{selectedProblem.description}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">ผู้รายงาน:</span>
                        <span className="font-medium text-gray-900">{selectedProblem.reported_by}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 pl-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      สถานะและวันที่
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-start gap-2">
                        <p className="text-sm text-gray-600">สถานะ:</p>
                        <div>
                          {(() => {
                            const statusInfo = getStatusIcon(selectedProblem.is_resolved);
                            const StatusIcon = statusInfo.icon;
                            return (
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                                <StatusIcon className="w-4 h-4 mr-1" />
                                {statusInfo.status}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          ข้อมูลวันที่
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">วันที่รายงาน:</span>
                            <span className="text-gray-900">{<FormatDate dateString={selectedProblem.reported_at}/>}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">สร้าง:</span>
                            <span className="text-gray-900">{<FormatDate  dateString={selectedProblem.created_at}/>}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">อัพเดท:</span>
                            <span className="text-gray-900">{<FormatDate dateString={selectedProblem.updated_at}/>}</span>
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