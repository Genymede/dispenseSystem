"use client";
import { useEffect, useState } from "react";
import ReportFilter from "@/app/component/ReportFilter";
import exportPDF from "@/app/component/PDFexport";
import exportCSV from "@/app/component/CSVexport";
import ExportButton from "@/app/component/ExportButton";
import { FileText, Table2, BarChart3, Search, Package, AlertTriangle, CheckCircle, Eye, X, Calendar, Pill, TrendingDown, TrendingUp } from "lucide-react";
import Header from "@/app/component/Header";
import {FormatDate, FormatDateTime} from "@/app/component/formatDate";

export default function StockReportPage() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

  useEffect(() => {
    async function fetchStockData() {
      try {
        const res = await fetch(`https://dispensesystem-production.up.railway.app/medicine/stock`);
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
        filtered = filtered.filter(m => new Date(m.updated_at).getMonth() + 1 === parseInt(month));
      }
      if (year !== "0") {
        filtered = filtered.filter(m => new Date(m.updated_at).getFullYear() === parseInt(year));
      }
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(med => {
        if (statusFilter === "outOfStock") return med.med_quantity === 0;
        if (statusFilter === "lowStock") return med.med_quantity > 0 && med.med_quantity < med.min_quantity;
        if (statusFilter === "inStock") return med.med_quantity >= med.min_quantity;
        return true;
      });
    }

    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((med) =>
        String(med.med_showname || "").toLowerCase().includes(lowerTerm) ||
        String(med.med_id || "").toLowerCase().includes(lowerTerm) ||
        String(med.packaging_type || "").toLowerCase().includes(lowerTerm) ||
        String(med.location || "").toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredData(filtered);
  };

  const handleSearchMedicine = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const resetFilters = () => {
    setFilterSettings({ days: 0, month: "0", year: "0" });
    setStatusFilter("all");
    setSearchTerm("");
  };

  useEffect(() => {
    applyFilter(filterSettings);
  }, [allData, searchTerm, statusFilter]);


  const prepareTableData = () => {
    const columns = [
      "รหัส",
      "ชื่อยา",
      "จำนวนคงเหลือ",
      "ประเภทบรรจุภัณฑ์",
      "สถานที่จัดเก็บ",
      "สถานะ"
    ];
    const rows = filteredData.map((row) => [
      row.med_id,
      row.med_showname,
      row.med_quantity,
      row.packaging_type,
      row.location,
      row.med_quantity === 0 ? "หมด" : row.med_quantity < row.min_quantity ? "ใกล้หมด" : "ปกติ"
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

  const getStockStatus = (med) => {
    if (med.med_quantity === 0) {
      return { status: "หมด", color: "bg-red-100 text-red-800", icon: AlertTriangle };
    } else if (med.med_quantity > 0 && med.med_quantity < med.min_quantity) {
      return { status: "ใกล้หมด", color: "bg-yellow-100 text-yellow-800", icon: TrendingDown };
    } else {
      return { status: "ปกติ", color: "bg-green-100 text-green-800", icon: CheckCircle };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="">
      <div className=" mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <Header
            header="รายงานยาคงคลัง"
            description="ตรวจสอบสถานะและจำนวนยาคงเหลือในระบบ"
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
          
            <div className="flex flex-col lg:flex-col gap-4 items-center">
              <ReportFilter onFilterChange={applyFilter} />
              <div className="flex-1 flex gap-4 items-center w-full">
                <div className="relative min-w-[200px]">
                  <select
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none"
                  >
                    <option value="all">สถานะ: ทั้งหมด</option>
                    <option value="inStock">ปกติ</option>
                    <option value="lowStock">ใกล้หมด</option>
                    <option value="outOfStock">หมด</option>
                  </select>
                  <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="ค้นหาด้วยรหัส, ชื่อยา, ประเภทบรรจุภัณฑ์, หรือสถานที่จัดเก็บ..."
                    value={searchTerm}
                    onChange={handleSearchMedicine}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
            <div style={{ maxHeight: "65vh", overflowY: "auto" }} className="relative">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                      <div className="flex items-center">
                        <Pill className="mr-2 h-4 w-4 text-gray-500" />
                        รหัสยา
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">ชื่อยา</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                      <div className="flex items-center justify-center">
                        <BarChart3 className="mr-2 h-4 w-4 text-gray-500" />
                        คงเหลือ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ประเภทบรรจุภัณฑ์</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">สถานที่จัดเก็บ</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">สถานะ</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">ดูรายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((med, index) => {
                    const stockStatus = getStockStatus(med);
                    const StatusIcon = stockStatus.icon;

                    return (
                      <tr
                        key={med.med_sid}
                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                            </div>
                            {med.med_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{med.med_showname}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${med.med_quantity === 0 ? 'bg-red-100 text-red-800' :
                              med.med_quantity < med.min_quantity ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                            {med.med_quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{med.packaging_type}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{med.location}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {stockStatus.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedMedicine(med)}
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
        {/* Medicine Detail Modal */}
        {selectedMedicine && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Pill className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">รายละเอียดยา</h2>
                      <p className="text-blue-100 text-sm">รหัสยา: {selectedMedicine.med_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMedicine(null)}
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
                      <Pill className="h-5 w-5 text-blue-600" />
                      ข้อมูลพื้นฐาน
                    </h3>
                    <div className="space-y-1">
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">รหัสยา:</span>
                        <span className="text-end font-medium text-gray-900">{selectedMedicine.med_id}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">รหัสสต็อก:</span>
                        <span className="text-end font-medium text-gray-900">{selectedMedicine.med_sid}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">ประเภทบรรจุภัณฑ์:</span>
                        <span className="text-end font-medium text-gray-900">{selectedMedicine.packaging_type}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">แบ่งได้:</span>
                        <span className={`text-end font-medium px-2 py-1 rounded-full text-xs ${selectedMedicine.is_divisible
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                          {selectedMedicine.is_divisible ? "ใช่" : "ไม่ได้"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">สถานที่จัดเก็บ:</span>
                        <span className="text-end font-medium text-gray-900">{selectedMedicine.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      ข้อมูลสต็อก
                    </h3>
                    <div className="space-y-3 pt-4">
                      <div className=" rounded-xl p-4 border-2 border-blue-100">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">จำนวนคงเหลือ</p>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl font-bold text-blue-700">{selectedMedicine.med_quantity}</span>
                            <span className="text-gray-500">หน่วย</span>
                          </div>
                          <div className="mt-2">
                            {(() => {
                              const status = getStockStatus(selectedMedicine);
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
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-600">จำนวนขั้นต่ำ:</span>
                          <span className="font-medium text-gray-900">{selectedMedicine.min_quantity}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-600">จำนวนสูงสุด:</span>
                          <span className="font-medium text-gray-900">{selectedMedicine.max_quantity}</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          ข้อมูลวันที่
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">สร้าง:</span>
                            <span className="text-gray-900"><FormatDate dateString={selectedMedicine.created_at} /></span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">อัพเดท:</span>
                            <span className="text-gray-900"><FormatDate dateString={selectedMedicine.updated_at} /></span>
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