"use client";
import { useEffect, useState } from "react";
import ReportFilter from "@/app/component/ReportFilter";
import exportPDF from "@/app/component/PDFexport";
import exportCSV from "@/app/component/CSVexport";
import ExportButton from "@/app/component/ExportButton";
import { FileText, Table2, BarChart3, Search, Package, AlertTriangle, CheckCircle, Eye, X, Calendar, Pill, TrendingDown, CalendarDays } from "lucide-react";
import Header from "@/app/component/Header";
import { FormatDate, FormatDateTime } from "@/app/component/formatDate";

export default function AllergyReportPage() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAllergy, setSelectedAllergy] = useState(null);
  const [patients, setPatients] = useState({});
  const [medNames, setMedNames] = useState({});
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0" });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

  useEffect(() => {
    async function fetchAllergyData() {
      try {
        const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/allergy`);
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

        const allergyIds = data.map(item => item.allr_id);
        const uniqueAllergyIds = new Set(allergyIds);
        if (uniqueAllergyIds.size !== allergyIds.length) {
          console.warn("พบ allergy_id ที่ซ้ำกันในข้อมูล API:", allergyIds);
        }

        const validatedData = data.map((item, index) => ({
          ...item,
          allergy_id: item.allr_id ?? `fallback-${index}`,
        }));

        setAllData(validatedData);
        setFilteredData(validatedData);

        const uniqueMedIds = [...new Set(validatedData.map(item => item.med_id).filter(id => id))];
        const medMap = {
          thai:"",
          eng:""
        };
        for (const id of uniqueMedIds) {
          try {
            const medRes = await fetch(`https://dispensesystem-production.up.railway.app/medicine/${id}`);
            if (medRes.ok) {
              const med = await medRes.json();
              medMap[id] = med.med_name || `ID: ${id}`; // เก็บชื่อยาในภาษาไทย
            } else {
              medMap[id] = `ID: ${id}`;
            }
          } catch (err) {
            console.error(`เกิดข้อผิดพลาดในการดึงข้อมูลยา ${id}:`, err);
            medMap[id] = `ID: ${id}`;
          }
        }
        setMedNames(medMap);

        const patientsRes = await fetch(`https://dispensesystem-production.up.railway.app/patient`);
        if (!patientsRes.ok) {
          throw new Error(`HTTP error fetching patients! Status: ${patientsRes.status}`);
        }
        const patientsData = await patientsRes.json();
        const map = {};
        patientsData.forEach(p => {
          map[p.patient_id] = {
            hn: p.hn_number,
            name: `${p.first_name} ${p.last_name}`
          };
        });
        setPatients(map);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลอาการแพ้:", error);
        setAllData([]);
        setFilteredData([]);
        setError("ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อและลองอีกครั้ง");
      }
    }
    fetchAllergyData();
  }, []);

  const applyFilter = ({ days, month, year, startDate: filterStartDate, endDate: filterEndDate }) => {
    setFilterSettings({ days, month, year });
    setStartDate(filterStartDate || "");
    setEndDate(filterEndDate || "");

    let filtered = [...allData];

    if (startDate && endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.reported_at);
        return itemDate >= new Date(startDate);
      });
    } else if (days > 0) {
      const cutoff = new Date(Date.now() - days * 86400000);
      filtered = filtered.filter(m => new Date(m.reported_at) >= cutoff);
    } else {
      if (month !== "0") {
        filtered = filtered.filter(m => new Date(m.reported_at).getMonth() + 1 === parseInt(month));
      }
      if (year !== "0") {
        filtered = filtered.filter(m => new Date(m.reported_at).getFullYear() === parseInt(year));
      }
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter(allergy => allergy.severity === severityFilter);
    }

    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((allergy) =>
        String(allergy.description || "").toLowerCase().includes(lowerTerm) ||
        String(patients[allergy.patient_id]?.hn || "").toLowerCase().includes(lowerTerm) ||
        String(patients[allergy.patient_id]?.name || "").toLowerCase().includes(lowerTerm) ||
        (medNames[allergy.med_id] && String(medNames[allergy.med_id]).toLowerCase().includes(lowerTerm)) // ค้นหาชื่อยาในภาษาไทย
      );
    }

    setFilteredData(filtered);
  };

  const handleSearchAllergy = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSeverityFilter = (e) => {
    setSeverityFilter(e.target.value);
  };

  const clearFilters = () => {
    setFilterSettings({ days: 0, month: "0", year: "0" });
    setStartDate("");
    setEndDate("");
    setSeverityFilter("all");
    setSearchTerm("");
  };

  useEffect(() => {
    applyFilter({ ...filterSettings, startDate, endDate });
  }, [allData, searchTerm, severityFilter, startDate, endDate]);


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

  const prepareTableData = () => {
    const columns = [
      "รหัสอาการแพ้",
      "รหัสยา",
      "HN",
      "ชื่อผู้ป่วย",
      "ชื่อยา",
      "คำอธิบาย",
      "ความรุนแรง",
      "วันที่รายงาน"
    ];
    const rows = filteredData.map((row) => {
      const patient = patients[row.patient_id] || {};
      return [
        row.allergy_id,
        row.med_id || "-",
        patient.hn || "-",
        patient.name || "-",
        medNames[row.med_id] || `ID: ${row.med_id || "-"}`,
        row.symptoms || "-",
        row.severity || "-",
        formatDate(row.reported_at)
      ];
    });
    return { columns, rows };
  };

  const tableToPDF = async () => {
    setIsExporting(true);
    try {
      const { columns, rows } = prepareTableData();
      await exportPDF({
        filename: `allergy_report_${new Date().toISOString().split("T")[0]}.pdf`,
        columns,
        rows,
        title: "รายงานอาการแพ้ยา",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const tableToCSV = () => {
    setIsExporting(true);
    try {
      const { columns, rows } = prepareTableData();
      exportCSV({
        filename: `allergy_report_${new Date().toISOString().split("T")[0]}.csv`,
        columns,
        rows,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getSeverityStatus = (allergy) => {
    switch (allergy.severity) {
      case "mild":
        return { status: "ไม่รุนแรง", color: "bg-green-100 text-green-800", icon: CheckCircle };
      case "moderate":
        return { status: "ปานกลาง", color: "bg-yellow-100 text-yellow-800", icon: TrendingDown };
      case "severe":
        return { status: "รุนแรง", color: "bg-red-100 text-red-800", icon: AlertTriangle };
      default:
        return { status: "ไม่ระบุ", color: "bg-gray-100 text-gray-800", icon: X };
    }
  };

  return (
    <div className="font-sarabun">
      <div className=" mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <Header
            header="รายงานอาการแพ้ยา"
            description="ตรวจสอบและจัดการข้อมูลอาการแพ้ยาของผู้ป่วยในระบบ"
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
        <div className="flex flex-col gap-4">
          <ReportFilter onFilterChange={applyFilter} />
          <div className="flex-1 flex flex-col lg:flex-row gap-4 items-center w-full">
            <div className="relative min-w-[200px]">
              <select
                value={severityFilter}
                onChange={handleSeverityFilter}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none"
              >
                <option value="all">ความรุนแรง: ทั้งหมด</option>
                <option value="mild">ไม่รุนแรง</option>
                <option value="moderate">ปานกลาง</option>
                <option value="severe">รุนแรง</option>
              </select>
              <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ค้นหาด้วยคำอธิบาย, HN, ชื่อผู้ป่วย หรือชื่อยา (ภาษาไทย)..."
                value={searchTerm}
                onChange={handleSearchAllergy}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
              />
            </div>
            <div className="relative min-w-[150px]">
              <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                placeholder="วันที่เริ่มต้น"
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
      </div>

      {/* Table Section */}
      <div className="mt-6 mb-4">
        {filteredData.length === 0 && (searchTerm || startDate || endDate || filterSettings.days > 0 || filterSettings.month !== "0" || filterSettings.year !== "0" || severityFilter !== "all") ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">ไม่พบข้อมูลอาการแพ้ยา</p>
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
                        <Pill className="mr-2 h-4 w-4 text-gray-500" />
                        รหัสอาการแพ้
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">รหัสยา</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">HN</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อผู้ป่วย</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อยา</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">คำอธิบาย</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ความรุนแรง</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ดูรายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((allergy, index) => {
                    const severityStatus = getSeverityStatus(allergy);
                    const StatusIcon = severityStatus.icon;
                    const patient = patients[allergy.patient_id] || {};

                    return (
                      <tr
                        key={allergy.allergy_id}
                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                            </div>
                            {allergy.allergy_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{allergy.med_id || "-"}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{patient.hn || "-"}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{patient.name || "-"}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{medNames[allergy.med_id] || `ID: ${allergy.med_id || "-"}`}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{allergy.symptoms || "-"}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${severityStatus.color}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {severityStatus.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedAllergy(allergy)}
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

        {/* Allergy Detail Modal */}
        {selectedAllergy && (
          <div className="font-sarabun fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-orange-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">รายละเอียดอาการแพ้ยา</h2>
                <p className="text-orange-100 text-sm">รหัสอาการแพ้: {selectedAllergy.allergy_id}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedAllergy(null)}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                <Pill className="h-4 w-4 text-orange-600" />
                ข้อมูลพื้นฐาน
              </h3>
              <div className="rounded-lg py-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">รหัสอาการแพ้:</span>
                    <span className="font-medium text-gray-900 text-sm">{selectedAllergy.allergy_id}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">รหัสยา:</span>
                    <span className="font-medium text-gray-900 text-sm">{selectedAllergy.med_id || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">ชื่อยา:</span>
                    <span className="font-medium text-gray-900 text-sm">{medNames[selectedAllergy.med_id] || `ID: ${selectedAllergy.med_id || "-"}`}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">รหัสผู้ป่วย:</span>
                    <span className="font-medium text-gray-900 text-sm">{selectedAllergy.patient_id || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">HN:</span>
                    <span className="font-medium text-gray-900 text-sm">{patients[selectedAllergy.patient_id]?.hn || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">ชื่อผู้ป่วย:</span>
                    <span className="font-medium text-gray-900 text-sm">{patients[selectedAllergy.patient_id]?.name || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                <BarChart3 className="h-4 w-4 text-orange-600" />
                สถานะและวันที่
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-600">ความรุนแรง:</span>
                  <div>
                    {(() => {
                      const status = getSeverityStatus(selectedAllergy);
                      const StatusIcon = status.icon;
                      return (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.status}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-600">คำอธิบาย:</span>
                  <span className="font-medium text-gray-900 text-sm">{selectedAllergy.symptoms || "ไม่มี"}</span>
                </div>
              </div>
              <div className="rounded-lg py-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  ข้อมูลวันที่
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">วันที่รายงาน:</span>
                    <span className="text-gray-900"><FormatDateTime dateString={selectedAllergy.reported_at} /></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">สร้าง:</span>
                    <span className="text-gray-900"><FormatDateTime dateString={selectedAllergy.created_at} /></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">อัพเดท:</span>
                    <span className="text-gray-900"><FormatDateTime dateString={selectedAllergy.updated_at} /></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setSelectedAllergy(null)}
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