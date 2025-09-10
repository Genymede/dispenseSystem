"use client";
import { useEffect, useState } from "react";
import ReportFilter from "@/app/component/ReportFilter";
import exportPDF from "@/app/component/PDFexport";
import exportCSV from "@/app/component/CSVexport";
import ExportButton from "@/app/component/ExportButton";
import { FileText, Table2, BarChart3, Search, Package, Calendar, Pill, CalendarDays, X } from "lucide-react";
import Header from "@/app/component/Header";
import {FormatDate, FormatDateTime} from "@/app/component/formatDate";

export default function DispenseReportPage() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [medNames, setMedNames] = useState({});
  const [filterSettings, setFilterSettings] = useState({ days: 0, month: "0", year: "0" });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

  // Fetch dispense data and medicine data
  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        const [dispenseRes, medRes] = await Promise.all([
          fetch(`https://dispensesystem-production.up.railway.app/patient/dispensehistory`, { cache: "no-store" }),
          fetch(`https://dispensesystem-production.up.railway.app/medicine/stock`, { cache: "no-store" })
        ]);

        if (!dispenseRes.ok) throw new Error(`HTTP error! Status: ${dispenseRes.status}`);
        if (!medRes.ok) throw new Error(`HTTP error fetching medicines! Status: ${medRes.status}`);

        const dispenseData = await dispenseRes.json();
        const medicines = await medRes.json();

        if (!Array.isArray(dispenseData)) {
          console.error("Dispense API response is not an array:", dispenseData);
          setAllData([]);
          setFilteredData([]);
          setError("ได้รับข้อมูลการจ่ายยาไม่ถูกต้องจากเซิร์ฟเวอร์");
          return;
        }

        const aggregatedData = aggregateMedicinesByMonth(dispenseData);
        setAllData(aggregatedData);
        setFilteredData(aggregatedData);

        const medMap = {};
        medicines.forEach(med => {
          medMap[med.med_sid] = {
            thai: med.med_showname || `ID: ${med.med_sid}`,
            english: med.med_showname_eng || `ID: ${med.med_sid}`,
            display: med.med_showname || med.med_showname_eng || `ID: ${med.med_sid}`
          };
        });
        setMedNames(medMap);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        setAllData([]);
        setFilteredData([]);
        setError("ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อและลองอีกครั้ง");
      }
    }
    fetchData();
  }, []);

  // Aggregate medicines by month
  const aggregateMedicinesByMonth = (data) => {
    const monthlyData = {};

    data.forEach((record, index) => {
      const date = new Date(record.date);
      if (isNaN(date)) return; // Skip invalid dates
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {};
      }

      (record.medicines || []).forEach(med => {
        if (!med.med_sid || !med.quantity) return; // Skip invalid med_sid or quantity
        const medId = med.med_sid;
        const quantity = Number(med.quantity) || 0;

        if (!monthlyData[monthYear][medId]) {
          monthlyData[monthYear][medId] = 0;
        }
        monthlyData[monthYear][medId] += quantity;
      });
    });

    const result = [];
    Object.entries(monthlyData).forEach(([monthYear, medicines], monthIndex) => {
      Object.entries(medicines).forEach(([medId, totalQuantity], medIndex) => {
        result.push({
          monthYear,
          med_sid: medId,
          totalQuantity,
          uniqueKey: `${monthYear}-${medId}-${monthIndex}-${medIndex}` // Ensure unique key
        });
      });
    });

    return result.sort((a, b) => b.monthYear.localeCompare(a.monthYear));
  };

  // Update statistics when filteredData changes
  

  // Filter function
  const applyFilter = ({ days, month, year, startDate: filterStartDate, endDate: filterEndDate }) => {
    setFilterSettings({ days, month, year });
    setStartDate(filterStartDate || "");
    setEndDate(filterEndDate || "");

    let filtered = [...allData];

    if (startDate && endDate) {
      filtered = filtered.filter(item => {
        const [itemYear, itemMonth] = item.monthYear.split('-');
        const itemDate = new Date(`${itemYear}-${itemMonth}-01`);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      });
    } else if (days > 0) {
      const cutoff = new Date(Date.now() - days * 86400000);
      filtered = filtered.filter(item => {
        const [itemYear, itemMonth] = item.monthYear.split('-');
        const itemDate = new Date(`${itemYear}-${itemMonth}-01`);
        return itemDate >= cutoff;
      });
    } else {
      if (month !== "0") {
        filtered = filtered.filter(item => {
          const [, itemMonth] = item.monthYear.split('-');
          return parseInt(itemMonth) === parseInt(month);
        });
      }
      if (year !== "0") {
        filtered = filtered.filter(item => {
          const [itemYear] = item.monthYear.split('-');
          return parseInt(itemYear) === parseInt(year);
        });
      }
    }

    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        String(medNames[item.med_sid]?.thai || "").toLowerCase().includes(lowerTerm) ||
        String(medNames[item.med_sid]?.english || "").toLowerCase().includes(lowerTerm) ||
        String(item.med_sid || "").includes(lowerTerm) ||
        String(item.monthYear || "").toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredData(filtered);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterSettings({ days: 0, month: "0", year: "0" });
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  // Trigger filtering on changes
  useEffect(() => {
    applyFilter({ ...filterSettings, startDate, endDate });
  }, [allData, searchTerm, startDate, endDate]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
      });
    } catch {
      return "-";
    }
  };

  // Prepare table data
  const prepareTableData = () => {
    const columns = ["เดือน-ปี", "รหัสยา", "ชื่อยา", "จำนวนที่จ่าย (หน่วย)"];
    const rows = filteredData.map(item => [
      formatDate(`${item.monthYear}-01`),
      item.med_sid,
      medNames[item.med_sid]?.display || `ID: ${item.med_sid}`,
      item.totalQuantity,
    ]);
    return { columns, rows };
  };

  // Export to PDF
  const tableToPDF = async () => {
    setIsExporting(true);
    try {
      const { columns, rows } = prepareTableData();
      await exportPDF({
        filename: `dispense_report_${new Date().toISOString().split("T")[0]}.pdf`,
        columns,
        rows,
        title: "รายงานตัดรอบการจ่ายยา",
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
      const { columns, rows } = prepareTableData();
      exportCSV({
        filename: `dispense_report_${new Date().toISOString().split("T")[0]}.csv`,
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
            header="รายงานตัดรอบการจ่ายยา"
            description="ตรวจสอบและจัดการข้อมูลการจ่ายยาในแต่ละเดือน"
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
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ค้นหาด้วยรหัสยา, ชื่อยา (ไทย/อังกฤษ), หรือเดือน-ปี..."
                value={searchTerm}
                onChange={handleSearch}
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
        {filteredData.length === 0 && (searchTerm || startDate || endDate || filterSettings.days > 0 || filterSettings.month !== "0" || filterSettings.year !== "0") ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">ไม่พบข้อมูลการจ่ายยา</p>
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
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        เดือน-ปี
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                      รหัสยา
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                      ชื่อยา
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">
                      จำนวนที่จ่าย (หน่วย)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((item, index) => (
                    <tr
                      key={item.uniqueKey}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                          </div>
                          {formatDate(`${item.monthYear}-01`)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">{item.med_sid}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {medNames[item.med_sid]?.display || `ID: ${item.med_sid}`}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">{item.totalQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}