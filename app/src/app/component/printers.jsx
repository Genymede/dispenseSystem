"use client";
import { useState, useEffect, useCallback } from "react";
import { Printer, AlertTriangle } from "lucide-react";
import Swal from "sweetalert2";

const PRINTER_STORAGE_KEY = "selected_printer_share_name";

// Centralized error handler
const handleError = (title, message, error) => {
  console.error(`${title}:`, error);
  Swal.fire({ icon: "error", title, text: message, confirmButtonText: "ตกลง" });
};

// Function to fetch USB printers using WebUSB API
const fetchUSBPrinters = async () => {
  try {
    // Request USB devices with a filter for printers (vendorId/productId may need adjustment)
    const devices = await navigator.usb.getDevices();
    const printerDevices = devices.map((device, index) => ({
      Name: `USB Printer ${index + 1}`,
      ShareName: `usb_${device.serialNumber || index}`,
      PrinterStatus: device.opened ? "Online" : "Offline",
      DriverName: "USB Printer",
      Port: {
        Name: `USB_${device.serialNumber || index}`,
        Description: `${device.manufacturerName || "Unknown"} ${device.productName || "Printer"}`,
      },
    }));
    return printerDevices;
  } catch (error) {
    handleError("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูลเครื่องพิมพ์ USB ได้", error);
    return [];
  }
};

// Function to request permission to access a new USB device
const requestUSBPrinter = async () => {
  try {
    const device = await navigator.usb.requestDevice({ filters: [{ classCode: 7 }] }); // Class code 7 = Printer
    await device.open();
    return [{
      Name: device.productName || "USB Printer",
      ShareName: `usb_${device.serialNumber || Date.now()}`,
      PrinterStatus: device.opened ? "Online" : "Offline",
      DriverName: "USB Printer",
      Port: {
        Name: `USB_${device.serialNumber || Date.now()}`,
        Description: `${device.manufacturerName || "Unknown"} ${device.productName || "Printer"}`,
      },
    }];
  } catch (error) {
    handleError("ข้อผิดพลาด", "ไม่สามารถเข้าถึงเครื่องพิมพ์ USB ได้", error);
    return [];
  }
};

export default function PrinterSelector({ onPrinterSelect }) {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(
    typeof window !== "undefined" ? localStorage.getItem(PRINTER_STORAGE_KEY) || "" : ""
  );
  const [loading, setLoading] = useState(true);

  // Check WebUSB support and fetch printers on mount
  useEffect(() => {
    if (!navigator.usb) {
      handleError("ไม่รองรับ WebUSB", "เบราว์เซอร์นี้ไม่รองรับ WebUSB API", new Error("WebUSB not supported"));
      setLoading(false);
      return;
    }

    const loadPrinters = async () => {
      setLoading(true);
      const printerData = await fetchUSBPrinters();
      setPrinters(printerData);
      setLoading(false);
    };
    loadPrinters();
  }, []);

  // Handle printer selection
  const handleSelectPrinter = useCallback(
    (printer) => {
      setSelectedPrinter(printer.ShareName);
      if (typeof window !== "undefined") {
        localStorage.setItem(PRINTER_STORAGE_KEY, printer.ShareName);
      }
      if (onPrinterSelect) {
        onPrinterSelect(printer);
      }
      Swal.fire({
        icon: "success",
        title: "เลือกเครื่องพิมพ์",
        text: `เลือกเครื่องพิมพ์ ${printer.Name} สำเร็จ`,
        confirmButtonText: "ตกลง",
      });
    },
    [onPrinterSelect]
  );

  // Handle adding a new USB printer
  const handleAddPrinter = useCallback(async () => {
    const newPrinters = await requestUSBPrinter();
    if (newPrinters.length > 0) {
      setPrinters((prev) => [...prev, ...newPrinters]);
      Swal.fire({
        icon: "success",
        title: "เพิ่มเครื่องพิมพ์",
        text: `เพิ่มเครื่องพิมพ์ ${newPrinters[0].Name} สำเร็จ`,
        confirmButtonText: "ตกลง",
      });
    }
  }, []);

  // Handle print action (placeholder for USB printing)
  const handlePrint = useCallback(
    async (printText) => {
      if (!selectedPrinter) {
        Swal.fire({
          icon: "warning",
          title: "ไม่พบเครื่องพิมพ์",
          text: "กรุณาเลือกเครื่องพิมพ์ก่อนพิมพ์",
          confirmButtonText: "ตกลง",
        });
        return;
      }

      try {
        const selectedDevice = printers.find((p) => p.ShareName === selectedPrinter);
        if (!selectedDevice) throw new Error("ไม่พบเครื่องพิมพ์ที่เลือก");

        // Placeholder: Simulate sending print data to USB printer
        // Actual implementation depends on printer protocol (e.g., ESC/POS)
        Swal.fire({
          icon: "success",
          title: "พิมพ์สำเร็จ",
          text: `ส่งคำสั่งพิมพ์ไปยัง ${selectedDevice.Name} เรียบร้อย`,
          confirmButtonText: "ตกลง",
        });
      } catch (error) {
        handleError("ข้อผิดพลาดในการพิมพ์", "ไม่สามารถส่งคำสั่งพิมพ์ได้", error);
      }
    },
    [selectedPrinter, printers]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">กำลังโหลดข้อมูลเครื่องพิมพ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sarabun p-4 bg-white rounded-2xl shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Printer className="h-5 w-5 text-blue-600" />
          เลือกเครื่องพิมพ์
        </h2>
        <button
          onClick={handleAddPrinter}
          className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          disabled={!navigator.usb}
        >
          เพิ่มเครื่องพิมพ์ USB
        </button>
      </div>
      {printers.length === 0 ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertTriangle size={20} />
          <span className="text-sm">ไม่พบเครื่องพิมพ์ที่พร้อมใช้งาน</span>
        </div>
      ) : (
        <div className="space-y-2">
          {printers.map((printer, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                selectedPrinter === printer.ShareName
                  ? "bg-blue-50 border-blue-500"
                  : "bg-gray-50 border-gray-200 hover:bg-blue-50"
              }`}
              onClick={() => handleSelectPrinter(printer)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{printer.Name}</p>
                  <p className="text-xs text-gray-600">สถานะ: {printer.PrinterStatus}</p>
                  <p className="text-xs text-gray-600">ไดรเวอร์: {printer.DriverName}</p>
                  <p className="text-xs text-gray-600">
                    พอร์ต: {printer.Port?.Name || "ไม่ระบุ"} ({printer.Port?.Description || "ไม่ระบุ"})
                  </p>
                </div>
                {selectedPrinter === printer.ShareName && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    เลือกแล้ว
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4">
        <button
          onClick={() => handlePrint("ทดสอบการพิมพ์")} // Example print text
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
          disabled={!selectedPrinter}
        >
          <Printer className="w-4 h-4 mr-1" />
          ทดสอบพิมพ์
        </button>
      </div>
    </div>
  );
}