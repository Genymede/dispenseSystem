"use client";
import { useEffect, useState } from "react";
import ReportFilter from "@/app/component/ReportFilter";
import exportPDF from "@/app/component/PDFexport";
import exportCSV from "@/app/component/CSVexport";
import ExportButton from "@/app/component/ExportButton";
import { FileText, Table2, BarChart3, Search, Package, Eye, X, Pill } from "lucide-react";
import Header from "@/app/component/Header";

export default function StockReportPage() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0" });
  const [isExporting, setIsExporting] = useState(false);

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

  useEffect(() => {
    async function fetchStockData() {
      try {
        const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine`);
        const data = await res.json();
        setAllData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    }
    fetchStockData();
  }, []);

  const applyFilter = ({ days, month, year }) => {
    setFilterSettings({ days, month, year });
    let filtered = [...allData];

    if (days > 0) {
      const cutoff = new Date(Date.now() - days * 86400000);
      filtered = filtered.filter(m => new Date(m.created_at) >= cutoff);
    } else {
      if (month !== "0") {
        filtered = filtered.filter(m => new Date(m.created_at).getMonth() + 1 === parseInt(month));
      }
      if (year !== "0") {
        filtered = filtered.filter(m => new Date(m.created_at).getFullYear() === parseInt(year));
      }
    }

    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((med) =>
        String(med.med_id || "").toLowerCase().includes(lowerTerm) ||
        String(med.med_name || "").toLowerCase().includes(lowerTerm) ||
        String(med.med_thai_name || "").toLowerCase().includes(lowerTerm) ||
        String(med.med_marketing_name || "").toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredData(filtered);
  };

  const handleSearchMedicine = (e) => {
    setSearchTerm(e.target.value);
  };

  const resetFilters = () => {
    setFilterSettings({ days: 0, month: "0", year: "0" });
    setSearchTerm("");
  };

  useEffect(() => {
    applyFilter(filterSettings);
  }, [allData, searchTerm]);

  const prepareTableData = () => {
    const columns = [
      "รหัสยา",
      "ชื่อยา",
      "ชื่อภาษาไทย",
      "รูปแบบยา",
      "หมวดยา",
      "คำแนะนำการใช้"
    ];
    const rows = filteredData.map((row) => [
      row.med_id,
      row.med_name,
      row.med_thai_name,
      row.med_dosage_form,
      row.med_medical_category,
      row.med_dose_dialogue
    ]);
    return { columns, rows };
  };

  const tableToPDF = async () => {
    setIsExporting(true);
    try {
      const { columns, rows } = prepareTableData();
      await exportPDF({
        filename: `med_stock_${new Date().toISOString().split("T")[0]}.pdf`,
        columns,
        rows,
        title: "รายงานยาคงคลัง",
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
        filename: `med_stock_${new Date().toISOString().split("T")[0]}.csv`,
        columns,
        rows,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <Header
          header="รายงานยาคงคลัง"
          description="ตรวจสอบข้อมูลยาคงคลังทั้งหมดในระบบ"
          icon={BarChart3}
        />
        <div className="flex gap-3 mt-4 lg:mt-0">
          <ExportButton
            onExport={tableToPDF}
            description="ดาวน์โหลด PDF"
            icon={FileText}
            color="red"
            isExporting={isExporting}
            disabled={isExporting}
          />
          <ExportButton
            onExport={tableToCSV}
            description="ดาวน์โหลด CSV"
            icon={Table2}
            color="green"
            isExporting={isExporting}
            disabled={isExporting}
          />
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="mt-6 mb-4">
        <div className="flex flex-col gap-4">
          <ReportFilter onFilterChange={applyFilter} />
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ค้นหาด้วยรหัส, ชื่อยา, ชื่อการค้า, หรือชื่อภาษาไทย..."
                value={searchTerm}
                onChange={handleSearchMedicine}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
              />
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
      {filteredData.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">ไม่พบรายการ</p>
          <p className="text-gray-400">ลองเปลี่ยนเงื่อนไขการค้นหา</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="max-h-[65vh] overflow-y-auto">
            <table className="w-full min-w-screen">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">รหัสยา</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อยา</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อสามัญ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อการค้า</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อภาษาไทย</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ความรุนแรง</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">หน่วยนับ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">รูปแบบยา</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">หมวดยา</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ยาจำเป็น</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">คำแนะนำการใช้</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">รหัส TMT</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">รหัส TPU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">หมวดการตั้งครรภ์</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">กำหนดราคาใหม่</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ดูรายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((med, index) => (
                  <tr
                    key={med.med_id}
                    className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          <span className="text-indigo-600 font-semibold text-xs">{index + 1}</span>
                        </div>
                        {med.med_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{med.med_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{med.med_generic_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{med.med_marketing_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{med.med_thai_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{med.med_severity}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{med.med_counting_unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{med.med_dosage_form}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{med.med_medical_category}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{med.med_essential_med_list}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{med.med_dose_dialogue}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{med.med_TMT_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{med.med_TPU_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{med.med_pregnancy_cagetory}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{med.med_set_new_price ? "ใช่" : "ไม่"}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedMedicine(med)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Medicine Detail Modal */}
      {selectedMedicine && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">รายละเอียดยา</h2>
                    <p className="text-indigo-100 text-sm">รหัสยา: {selectedMedicine.med_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMedicine(null)}
                  className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 border-r border-gray-300 pr-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Pill className="h-5 w-5 text-indigo-600" />
                    ข้อมูลพื้นฐาน
                  </h3>
                  <div className="space-y-1">
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">รหัสยา:</span>
                      <span className="text-end font-medium text-gray-900">{selectedMedicine.med_id}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">ชื่อยา:</span>
                      <span className="text-end font-medium text-gray-900">{selectedMedicine.med_name}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">ชื่อสามัญ:</span>
                      <span className="text-end font-medium text-gray-900">{selectedMedicine.med_generic_name}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">ชื่อการค้า:</span>
                      <span className="text-end font-medium text-gray-900">{selectedMedicine.med_marketing_name}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">ชื่อภาษาไทย:</span>
                      <span className="text-end font-medium text-gray-900">{selectedMedicine.med_thai_name}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">ความรุนแรง:</span>
                      <span className="text-end font-medium text-gray-900">{selectedMedicine.med_severity}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">หน่วยนับ:</span>
                      <span className="text-end font-medium text-gray-900">{selectedMedicine.med_counting_unit}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    ข้อมูลเพิ่มเติม
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">รูปแบบยา:</span>
                      <span className="font-medium text-gray-900">{selectedMedicine.med_dosage_form}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">หมวดยา:</span>
                      <span className="font-medium text-gray-900">{selectedMedicine.med_medical_category}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">ยาจำเป็น:</span>
                      <span className="font-medium text-gray-900">{selectedMedicine.med_essential_med_list}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">คำแนะนำการใช้:</span>
                      <span className="font-medium text-gray-900">{selectedMedicine.med_dose_dialogue}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">รหัส TMT:</span>
                      <span className="font-medium text-gray-900">{selectedMedicine.med_TMT_code}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">รหัส TPU:</span>
                      <span className="font-medium text-gray-900">{selectedMedicine.med_TPU_code}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">หมวดการตั้งครรภ์:</span>
                      <span className="font-medium text-gray-900">{selectedMedicine.med_pregnancy_cagetory}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">กำหนดราคาใหม่:</span>
                      <span className="font-medium text-gray-900">{selectedMedicine.med_set_new_price ? "ใช่" : "ไม่"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}