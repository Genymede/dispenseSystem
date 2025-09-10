"use client";
import { useEffect, useState } from "react";
import ReportFilter from "@/app/component/ReportFilter";
import exportPDF from "@/app/component/PDFexport";
import exportCSV from "@/app/component/CSVexport";
import ExportButton from "@/app/component/ExportButton";
import Header from "@/app/component/Header";
import { FileText, Table2, BarChart3, Search, Stethoscope, CheckCircle, X, AlertTriangle, Eye, Calendar, XCircle, Clock } from "lucide-react";
import { FormatDate, FormatDateTime } from "@/app/component/formatDate";

const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

async function getADRs() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/patient/adr`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res.json();
}

async function getMedicines() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch medicines");
  return res.json();
}

async function getPatients() {
  const res = await fetch(`https://dispensesystem-production.up.railway.app/patient`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
}

export default function ADRReportPage() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [medNames, setMedNames] = useState({});
  const [patientNames, setPatientNames] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0" });
  const [severityFilter, setSeverityFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedADR, setSelectedADR] = useState(null);

  // ดึงข้อมูลเมื่อ Component ถูก Render ครั้งแรก
  useEffect(() => {
    async function fetchAll() {
      try {
        setError(null);
        const [adrRes, medicines, patients] = await Promise.all([
          getADRs(),
          getMedicines(),
          getPatients(),
        ]);

        if (!Array.isArray(adrRes)) {
          console.error("API response for ADRs is not an array:", adrRes);
          setAllData([]);
          setFilteredData([]);
          setError("ได้รับข้อมูลรายงานยาไม่พึงประสงค์ไม่ถูกต้องจากเซิร์ฟเวอร์ กรุณาลองอีกครั้ง");
          return;
        }

        const medMap = {};
        medicines.forEach((med) => {
          medMap[med.med_id] = {
            name: med.med_name || `ID: ${med.med_id}`,
            thaiName: med.med_thai_name || "-",
          };
        });

        const patientMap = {};
        patients.forEach((patient) => {
          patientMap[patient.patient_id] = {
            name: `${patient.first_name} ${patient.last_name}`,
            hn: patient.hn_number || "-",
            nationalId: patient.national_id ? `${patient.national_id}` : "-",
          };
        });

        const validatedData = adrRes.map((item, index) => ({
          ...item,
          adr_id: item.adr_id != null ? String(item.adr_id) : `fallback-${index}`,
          med_id: item.med_id ?? null,
          patient_id: item.patient_id ?? "-",
          symptoms: item.symptoms ?? "-",
          severity: item.severity ?? "Unknown",
          outcome: item.outcome ?? "Unknown",
          description: item.description ?? "-",
          notes: item.notes ?? "-",
          reported_at: item.reported_at ?? null,
          med_name: medMap[item.med_id]?.name || `ID: ${item.med_id || "ไม่ระบุ"}`,
          med_thai_name: medMap[item.med_id]?.thaiName || "-",
          patient_name: patientMap[item.patient_id]?.name || "-",
          patient_hn: patientMap[item.patient_id]?.hn || "-",
          patient_national_id: patientMap[item.patient_id]?.nationalId || "-",
        }));

        setAllData(validatedData);
        setFilteredData(validatedData);
        setMedNames(medMap);
        setPatientNames(patientMap);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        setAllData([]);
        setFilteredData([]);
        setMedNames({});
        setPatientNames({});
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

    // กรองตามความรุนแรง
    if (severityFilter !== "all") {
      filtered = filtered.filter(item => item.severity === severityFilter);
    }

    // กรองด้วยการค้นหา
    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        const medName = (item.med_name || "").toLowerCase();
        const medThaiName = (item.med_thai_name || "").toLowerCase();
        const patientName = (item.patient_name || "").toLowerCase();
        const patientHn = (item.patient_hn || "").toLowerCase();
        const patientNationalId = (item.patient_national_id || "").toLowerCase();
        const symptoms = (item.symptoms || "").toLowerCase();
        const description = (item.description || "").toLowerCase();

        return (
          medName.includes(lowerTerm) ||
          medThaiName.includes(lowerTerm) ||
          patientName.includes(lowerTerm) ||
          patientHn.includes(lowerTerm) ||
          patientNationalId.includes(lowerTerm) ||
          symptoms.includes(lowerTerm) ||
          description.includes(lowerTerm)
        );
      });
    }

    setFilteredData(filtered);
  }, [allData, filterSettings, severityFilter, searchTerm]);

  // ฟังก์ชันจัดการการค้นหา
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleSeverityFilter = (e) => setSeverityFilter(e.target.value);
  const handleDateFilter = (newSettings) => setFilterSettings(newSettings);

  // ฟังก์ชันรีเซ็ตตัวกรอง
  const resetFilters = () => {
    setFilterSettings({ days: 0, month: "0", year: "0" });
    setSeverityFilter("all");
    setSearchTerm("");
  };

  // ฟังก์ชันกำหนดความรุนแรง
  const getSeverityDisplay = (severity) => {
    switch (severity) {
      case "Mild":
        return { text: "เล็กน้อย", color: "bg-green-100 text-green-800", icon: AlertTriangle };
      case "Moderate":
        return { text: "ปานกลาง", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle };
      case "Severe":
        return { text: "รุนแรง", color: "bg-red-100 text-red-800", icon: AlertTriangle };
      default:
        return { text: "ไม่ระบุ", color: "bg-gray-100 text-gray-800", icon: AlertTriangle };
    }
  };

  // ฟังก์ชันกำหนดผลลัพธ์
  const getOutcomeDisplay = (outcome) => {
    switch (outcome) {
      case "Recovered":
        return { text: "หายแล้ว", color: "bg-green-100 text-green-800", icon: CheckCircle };
      case "Recovering":
        return { text: "กำลังหาย", color: "bg-blue-100 text-blue-800", icon: Clock };
      case "Not Recovered":
        return { text: "ยังไม่หาย", color: "bg-red-100 text-red-800", icon: XCircle };
      case "Unknown":
        return { text: "ไม่ทราบ", color: "bg-gray-100 text-gray-800", icon: Clock };
      default:
        return { text: "ไม่ระบุ", color: "bg-gray-100 text-gray-800", icon: Clock };
    }
  };

  // ส่งออกเป็น PDF
  const tableToPDF = async () => {
    setIsExporting(true);
    try {
      const columns = [
        "รหัสรายงาน",
        "ผู้ป่วย",
        "HN",
        "ยา",
        "อาการ",
        "ความรุนแรง",
        "วันที่รายงาน",
        "ผลลัพธ์",
      ];
      const rows = filteredData.map((row) => [
        row.adr_id,
        row.patient_name,
        row.patient_hn,
        row.med_name,
        row.symptoms,
        getSeverityDisplay(row.severity).text,
        formatDate(row.reported_at),
        getOutcomeDisplay(row.outcome).text,
      ]);
      await exportPDF({
        filename: `adr_report_${new Date().toISOString().split("T")[0]}.pdf`,
        title: "รายงานยาไม่พึงประสงค์",
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
        "รหัสรายงาน",
        "ผู้ป่วย",
        "HN",
        "ยา",
        "อาการ",
        "ความรุนแรง",
        "วันที่รายงาน",
        "ผลลัพธ์",
      ];
      const rows = filteredData.map((row) => [
        row.adr_id,
        row.patient_name,
        row.patient_hn,
        row.med_name,
        row.symptoms,
        getSeverityDisplay(row.severity).text,
        formatDate(row.reported_at),
        getOutcomeDisplay(row.outcome).text,
      ]);
      exportCSV({
        filename: `adr_report_${new Date().toISOString().split("T")[0]}.csv`,
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

  return (
    <div className="">
      <div className=" mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <Header
            header="รายงานยาไม่พึงประสงค์"
            description="ตรวจสอบและจัดการข้อมูลรายงานยาไม่พึงประสงค์ในระบบ"
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
                  value={severityFilter}
                  onChange={handleSeverityFilter}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none"
                >
                  <option value="all">ความรุนแรง: ทั้งหมด</option>
                  <option value="Mild">เล็กน้อย</option>
                  <option value="Moderate">ปานกลาง</option>
                  <option value="Severe">รุนแรง</option>
                </select>
                <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ค้นหาด้วยชื่อผู้ป่วย, HN, เลขบัตรประชาชน, ชื่อยา, อาการ..."
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
                      <Stethoscope className="mr-2 h-4 w-4 text-gray-500" />
                      รหัสรายงาน
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ผู้ป่วย</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ยา</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">อาการ</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ความรุนแรง</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">วันที่รายงาน</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ผลลัพธ์</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ดูรายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => {
                    const severityInfo = getSeverityDisplay(item.severity);
                    const outcomeInfo = getOutcomeDisplay(item.outcome);
                    const SeverityIcon = severityInfo.icon;
                    const OutcomeIcon = outcomeInfo.icon;
                    return (
                      <tr
                        key={item.adr_id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                            </div>
                            {item.adr_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{item.patient_name}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{item.med_name}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600 max-w-[20vh] truncate">{item.symptoms}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${severityInfo.color}`}>
                            <SeverityIcon className="w-4 h-4 mr-1" />
                            {severityInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{formatDate(item.reported_at)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${outcomeInfo.color}`}>
                            <OutcomeIcon className="w-4 h-4 mr-1" />
                            {outcomeInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedADR(item)}
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

        {/* ADR Detail Modal */}
        {selectedADR && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-lg">
              {/* Header */}
              <div className="bg-orange-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-5 w-5 text-white" />
                    <div>
                      <h2 className="text-lg font-semibold text-white">รายละเอียดรายงานยาไม่พึงประสงค์</h2>
                      <p className="text-orange-100 text-sm">รหัสรายงาน: {selectedADR.adr_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedADR(null)}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <Stethoscope className="h-4 w-4 text-orange-600" />
                      ข้อมูลพื้นฐาน
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600">รหัสรายงาน:</span>
                          <span className="font-medium text-gray-900 text-sm">{selectedADR.adr_id}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600">ผู้ป่วย:</span>
                          <span className="font-medium text-gray-900 text-sm">{selectedADR.patient_name}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600">HN:</span>
                          <span className="font-medium text-gray-900 text-sm">{selectedADR.patient_hn}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600">เลขบัตรประชาชน:</span>
                          <span className="font-medium text-gray-900 text-sm">{selectedADR.patient_national_id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-3">ข้อมูลยา</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">ชื่อยา:</span>
                          <span className="font-medium text-gray-900 text-sm">{selectedADR.med_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">ชื่อยาภาษาไทย:</span>
                          <span className="font-medium text-gray-900 text-sm">{selectedADR.med_thai_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Details */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                      รายละเอียด
                    </h3>

                    {/* Severity & Outcome */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ความรุนแรง:</span>
                        <div>
                          {(() => {
                            const severityInfo = getSeverityDisplay(selectedADR.severity);
                            const SeverityIcon = severityInfo.icon;
                            return (
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${severityInfo.color}`}>
                                <SeverityIcon className="w-3 h-3 mr-1" />
                                {severityInfo.text}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ผลลัพธ์:</span>
                        <div>
                          {(() => {
                            const outcomeInfo = getOutcomeDisplay(selectedADR.outcome);
                            const OutcomeIcon = outcomeInfo.icon;
                            return (
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${outcomeInfo.color}`}>
                                <OutcomeIcon className="w-3 h-3 mr-1" />
                                {outcomeInfo.text}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Date Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        วันที่รายงาน
                      </h4>
                      <p className="text-sm text-gray-900">
                        <FormatDate dateString={selectedADR.reported_at} />
                      </p>
                    </div>

                    {/* Symptoms & Details */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">อาการ:</label>
                        <p className="text-sm text-gray-900 bg-gray-50 rounded p-2">{selectedADR.symptoms}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">รายละเอียด:</label>
                        <p className="text-sm text-gray-900 bg-gray-50 rounded p-2">{selectedADR.description}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">หมายเหตุ:</label>
                        <p className="text-sm text-gray-900 bg-gray-50 rounded p-2">{selectedADR.notes || "ไม่มี"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons (if needed) */}
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedADR(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}