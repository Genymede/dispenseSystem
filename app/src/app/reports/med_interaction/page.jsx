"use client";
import { useEffect, useState } from "react";
import ReportFilter from "@/app/component/ReportFilter";
import exportPDF from "@/app/component/PDFexport";
import exportCSV from "@/app/component/CSVexport";
import ExportButton from "@/app/component/ExportButton";
import { FileText, Table2, BarChart3, Search, Package, AlertTriangle, CheckCircle, Eye, X, Calendar, Pill, TrendingDown } from "lucide-react";
import Header from "@/app/component/Header";
import { getMedicines } from "@/app/api/medicines";
import {FormatDate, FormatDateTime} from "@/app/component/formatDate";

export default function MedInteractionList() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [medNames, setMedNames] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

  // ดึงข้อมูลปฏิกิริยาระหว่างยาและข้อมูลยาเมื่อ Component ถูก Render ครั้งแรก
  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/interactions`);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("API response is not an array:", data);
          setAllData([]);
          setFilteredData([]);
          setError("ได้รับข้อมูลไม่ถูกต้องจากเซิร์ฟเวอร์ กรุณาลองอีกครั้ง");
          return;
        }

        const interactionIds = data.map(item => item.interaction_id);
        const uniqueInteractionIds = new Set(interactionIds);
        if (uniqueInteractionIds.size !== interactionIds.length) {
          console.warn("พบ interaction_id ที่ซ้ำกันในข้อมูล API:", interactionIds);
        }

        const validatedData = data.map((item, index) => ({
          ...item,
          interaction_id: item.interaction_id ?? `fallback-${index}`,
        }));

        setAllData(validatedData);

        const medicines = await getMedicines();
        const medMap = {};
        medicines.forEach(med => {
          medMap[med.med_id] = {
            thai: med.med_thai_name || `ID: ${med.med_id}`,
            english: med.med_name || `ID: ${med.med_id}`,
            display: med.med_thai_name || med.med_name || `ID: ${med.med_id}`
          };
        });
        setMedNames(medMap);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลปฏิกิริยาระหว่างยา:", error);
        setAllData([]);
        setFilteredData([]);
        setError("ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อและลองอีกครั้ง");
      }
    }

    fetchData();
  }, []);

  // ✅ ใช้ useEffect เพื่อกรองข้อมูลเมื่อ State ของ Filter มีการเปลี่ยนแปลง
  useEffect(() => {
    // ฟังก์ชันกรองข้อมูล
    const applyFilter = () => {
      let filtered = [...allData];

      // กรองตามวันที่
      const filterByDate = (p) => {
        const itemDate = new Date(p.created_at);
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
        filtered = filtered.filter(p =>
          statusFilter === "active" ? p.is_active === true : p.is_active === false
        );
      }

      // กรองตามความรุนแรง
      if (severityFilter !== "all") {
        filtered = filtered.filter(p =>
          severityFilter === "none" ? !p.severity : p.severity === severityFilter
        );
      }

      // กรองด้วย searchTerm
      if (searchTerm.trim() !== "") {
        const lowerTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(p => {
          const medName1 = medNames[p.med_id_1];
          const medName2 = medNames[p.med_id_2];

          const matchMed1 = medName1 && (
            (medName1.thai?.toLowerCase().includes(lowerTerm)) ||
            (medName1.english?.toLowerCase().includes(lowerTerm))
          );

          const matchMed2 = medName2 && (
            (medName2.thai?.toLowerCase().includes(lowerTerm)) ||
            (medName2.english?.toLowerCase().includes(lowerTerm))
          );
          
          const matchOther = (p.description?.toLowerCase().includes(lowerTerm)) ||
                             (p.interaction_type?.toLowerCase().includes(lowerTerm)) ||
                             (p.interaction_id?.toString().includes(lowerTerm));

          return matchMed1 || matchMed2 || matchOther;
        });
      }

      setFilteredData(filtered);
    };

    // เรียกใช้ฟังก์ชันกรองเมื่อ Dependencies มีการเปลี่ยนแปลง
    applyFilter();
  }, [allData, filterSettings, statusFilter, severityFilter, searchTerm, medNames]);

  // ฟังก์ชันจัดการการค้นหา (ตอนนี้แค่ SetState อย่างเดียว)
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ฟังก์ชันจัดการการเปลี่ยนสถานะ (ตอนนี้แค่ SetState อย่างเดียว)
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  // ฟังก์ชันจัดการการเปลี่ยนความรุนแรง (ตอนนี้แค่ SetState อย่างเดียว)
  const handleSeverityFilter = (e) => {
    setSeverityFilter(e.target.value);
  };

  // ฟังก์ชันจัดการการเปลี่ยนวันที่ (ส่งมาจาก ReportFilter component)
  const handleDateFilter = (newSettings) => {
    setFilterSettings(newSettings);
  }


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
  // เตรียมข้อมูลสำหรับตาราง
  const prepareTableData = () => {
    const columns = [
      "รหัสปฏิกิริยา",
      "ยา 1",
      "ยา 2",
      "คำอธิบาย",
      "ความรุนแรง",
      "สถานะ",
      "วันที่สร้าง"
    ];
    const rows = filteredData.map(p => [
      p.interaction_id,
      medNames[p.med_id_1]?.display || `ID: ${p.med_id_1}`,
      medNames[p.med_id_2]?.display || `ID: ${p.med_id_2}`,
      p.description || "-",
      getStatusIcon(p.severity).status,
      getActiveStatus(p.is_active).status,
      formatDate(p.created_at)
    ]);
    return { columns, rows };
  };

  // ส่งออกเป็น PDF
  const tableToPDF = async () => {
    setIsExporting(true);
    try {
      const { columns, rows } = prepareTableData();
      await exportPDF({
        filename: `med_interaction_report_${new Date().toISOString().split("T")[0]}.pdf`,
        columns,
        rows,
        title: "รายงานปฏิกิริยาระหว่างยา",
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
      const { columns, rows } = prepareTableData();
      exportCSV({
        filename: `med_interaction_report_${new Date().toISOString().split("T")[0]}.csv`,
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

  // ฟังก์ชันกำหนดสถานะความรุนแรง
  const getStatusIcon = (severity) => {
    switch (severity) {
      case "Mild":
        return { status: "ไม่รุนแรง", color: "bg-green-100 text-green-800", icon: CheckCircle };
      case "Moderate":
        return { status: "ปานกลาง", color: "bg-yellow-100 text-yellow-800", icon: TrendingDown };
      case "Severe":
        return { status: "รุนแรง", color: "bg-red-100 text-red-800", icon: AlertTriangle };
      default:
        return { status: "ไม่ระบุ", color: "bg-gray-100 text-gray-800", icon: X };
    }
  };

  // ฟังก์ชันกำหนดสถานะการใช้งาน
  const getActiveStatus = (isActive) => {
    return isActive
      ? { status: "ใช้งาน", color: "bg-green-100 text-green-800", icon: CheckCircle }
      : { status: "ไม่ใช้งาน", color: "bg-red-100 text-red-800", icon: X };
  };

  const clearFilters = () => {
    setSeverityFilter("all")
    setFilterSettings({ days: 0, month: "0", year: "0" });
    setStatusFilter("all");
    setSearchTerm("");
  };

  return (
    <div className="">
      <div className=" mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <Header
            header="รายงานปฏิกิริยาระหว่างยา"
            description="ตรวจสอบและจัดการข้อมูลปฏิกิริยาระหว่างยาในระบบ"
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
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                </select>
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              <div className="relative min-w-[200px]">
                <select
                  value={severityFilter}
                  onChange={handleSeverityFilter}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none"
                >
                  <option value="all">ความรุนแรง: ทั้งหมด</option>
                  <option value="Mild">ไม่รุนแรง</option>
                  <option value="Moderate">ปานกลาง</option>
                  <option value="Severe">รุนแรง</option>
                  <option value="null">ไม่ระบุ</option>
                </select>
                <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="ค้นหาด้วยรหัส, ชื่อยา, คำอธิบาย, หรือประเภทปฏิกิริยา..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {filteredData.length === 0 && (searchTerm || filterSettings.days > 0 || filterSettings.month !== "0" || filterSettings.year !== "0" || statusFilter !== "all") ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">ไม่พบข้อมูลข้อผิดพลาดยา</p>
              <p className="text-gray-400">ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง</p>
            </div>
          ) : (
          <div style={{ maxHeight: "65vh", overflowY: "auto" }} className="relative">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    <div className="flex items-center">
                      <Pill className="mr-2 h-4 w-4 text-gray-500" />
                      รหัสปฏิกิริยา
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ยา 1</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ยา 2</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">คำอธิบาย</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ความรุนแรง</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">สถานะ</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ดูรายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                  {filteredData.map((item, index) => {
                    const severityInfo = getStatusIcon(item.severity);
                    const SeverityIcon = severityInfo.icon;
                    const activeInfo = getActiveStatus(item.is_active);
                    const ActiveIcon = activeInfo.icon;

                    return (
                      <tr
                        key={item.interaction_id}
                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                            </div>
                            {item.interaction_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600 max-w-[200px] truncate" title={medNames[item.med_id_1]?.display || `ID: ${item.med_id_1}`}>
                          {medNames[item.med_id_1]?.display || `ID: ${item.med_id_1}`}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600 max-w-[200px] truncate" title={medNames[item.med_id_2]?.display || `ID: ${item.med_id_2}`}>
                          {medNames[item.med_id_2]?.display || `ID: ${item.med_id_2}`}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600 max-w-[300px] truncate" title={item.description || "-"}>
                          {item.description || "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${severityInfo.color}`}>
                            <SeverityIcon className="w-4 h-4 mr-1" />
                            {severityInfo.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${activeInfo.color}`}>
                            <ActiveIcon className="w-4 h-4 mr-1" />
                            {activeInfo.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedInteraction(item)}
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
        )}
        </div>

        {/* Interaction Detail Modal */}
        {selectedInteraction && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">รายละเอียดปฏิกิริยาระหว่างยา</h2>
                      <p className="text-blue-100 text-sm">รหัสปฏิกิริยา: {selectedInteraction.interaction_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedInteraction(null)}
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
                      {[
                        { label: "รหัสปฏิกิริยา", value: selectedInteraction.interaction_id || "-", key: "interaction_id" },
                        { label: "ยา 1", value: medNames[selectedInteraction.med_id_1]?.display || `ID: ${selectedInteraction.med_id_1 || "-"}`, key: "med_id_1" },
                        { label: "ยา 2", value: medNames[selectedInteraction.med_id_2]?.display || `ID: ${selectedInteraction.med_id_2 || "-"}`, key: "med_id_2" },
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
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      สถานะและวันที่
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-start gap-2">
                        <p className="text-sm text-gray-600">ความรุนแรง:</p>
                        <div>
                          {(() => {
                            const statusInfo = getStatusIcon(selectedInteraction.severity);
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
                      <div className="flex justify-start items-center gap-2 py-2">
                        <span className="text-sm text-gray-600">ระดับหลักฐาน:</span>
                        <span className="font-medium text-gray-900">{selectedInteraction.evidence_level || "-"}</span>
                      </div>
                      <div className="flex justify-start items-center gap-2 py-2">
                        <span className="text-sm text-gray-600">แหล่งอ้างอิง:</span>
                        <span className="font-medium text-gray-900">
                          {selectedInteraction.source_reference ? (
                            <a
                              href={selectedInteraction.source_reference}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="italic underline hover:text-blue-600"
                            >
                              {selectedInteraction.source_reference}
                            </a>
                          ) : (
                            "-"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-start items-center gap-2 py-2">
                        <span className="text-sm text-gray-600">ประเภทปฏิกิริยา:</span>
                        <span className="font-medium text-gray-900">{selectedInteraction.interaction_type || "-"}</span>
                      </div>
                      <div className="flex justify-start items-center gap-2 py-2">
                        <span className="text-sm text-gray-600">สถานะ:</span>
                        <span className="font-medium text-gray-900">
                          {(() => {
                            const activeInfo = getActiveStatus(selectedInteraction.is_active);
                            const ActiveIcon = activeInfo.icon;
                            return (
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${activeInfo.color}`}>
                                <ActiveIcon className="w-4 h-4 mr-1" />
                                {activeInfo.status}
                              </div>
                            );
                          })()}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          ข้อมูลวันที่
                        </h4>
                        <div className="space-y-2 text-sm">
                          {[
                            { label: "วันที่สร้าง", value: <FormatDateTime dateString={selectedInteraction.created_at}/>, key: "created_at" },
                            { label: "วันที่อัพเดท", value: <FormatDateTime dateString={selectedInteraction.updated_at}/>, key: "updated_at" },
                          ].map((item) => (
                            <div key={`date-info-${item.key}`} className="flex justify-between">
                              <span className="text-gray-600">{item.label}:</span>
                              <span className="text-gray-900">{item.value}</span>
                            </div>
                          ))}
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
