"use client"
import Header from "../component/Header"
import { Tag, Printer, Send, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react";
import { getPrinters } from "../api/print";

const PRINTER_STORAGE_KEY = "selected_printer_share_name";

export default function Sticker() {
	const [printers, setPrinters] = useState([]);
	const [selectedPrinterShareName, setSelectedPrinterShareName] = useState("");
	const [textToPrint, setTextToPrint] = useState("Hello");
	const [status, setStatus] = useState("");
	const [loading, setLoading] = useState(false);
	const [printerName, setPrinterName] = useState("");

	// ฟังก์ชันสำหรับดึงรายชื่อเครื่องพิมพ์
	const fetchPrinters = async () => { 
		try {
			const res = await getPrinters();
			if (Array.isArray(res)) {
				setPrinters(res);
				const storedPrinter = localStorage.getItem(PRINTER_STORAGE_KEY);
				if (storedPrinter && res.find(p => p.ShareName === storedPrinter)) {
					setSelectedPrinterShareName(storedPrinter);
				} else if (res.length > 0) {
					setSelectedPrinterShareName(res[0].ShareName);
				}
			} else {
				console.error("API response is not an array:", res);
				setPrinters([]);
			}
		} catch (error) {
			console.error("Failed to fetch printers:", error);
			setPrinters([]);
		}
	}

	// ฟังก์ชันสำหรับส่งคำสั่งพิมพ์ไปยังเซิร์ฟเวอร์
	const handlePrint = async () => {
		if (!selectedPrinterShareName || !textToPrint) {
			setStatus("กรุณาเลือกเครื่องพิมพ์และใส่ข้อความ");
			return;
		}

		setLoading(true);
		setStatus("กำลังส่งคำสั่งพิมพ์...");

		try {
			const response = await fetch("http://localhost:3001/print", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: textToPrint, printerShareName: selectedPrinterShareName }),
			});

			const data = await response.json();

			if (data.error) {
				setStatus(`ข้อผิดพลาด: ${data.error}`);
			} else {
				setStatus(data.message || "พิมพ์สำเร็จ");
			}
		} catch (error) {
			console.error("Failed to send print request:", error);
			setStatus("เกิดข้อผิดพลาดในการส่งคำสั่งพิมพ์");
		} finally {
			setLoading(false);
		}
	};

	// ดึงรายชื่อเครื่องพิมพ์เมื่อคอมโพเนนต์ถูกสร้าง
	useEffect(() => {
		fetchPrinters();
	}, []);

	// บันทึกค่าเครื่องพิมพ์ที่เลือกไว้ลงใน localStorage
	useEffect(() => {
		if (selectedPrinterShareName) {
			localStorage.setItem(PRINTER_STORAGE_KEY, selectedPrinterShareName);
			const selectedPrinter = printers.find(p => p.ShareName === selectedPrinterShareName);
			setPrinterName(selectedPrinter ? selectedPrinter.Name : selectedPrinterShareName);
		}
	}, [selectedPrinterShareName, printers]);

	// ฟังก์ชันแสดงสถานะ
	const getStatusIcon = () => {
		if (loading) return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
		if (status.includes("สำเร็จ")) return <CheckCircle className="w-5 h-5 text-green-500" />;
		if (status.includes("ข้อผิดพลาด")) return <AlertCircle className="w-5 h-5 text-red-500" />;
		return null;
	};

	return (
		<div className="font-prompt">
			<Header header={"สติ๊กเกอร์ยา"} description={"จัดการสติ๊กเกอร์ฉลากยา"} icon={Tag} />

			<div className="container mx-auto mt-8 px-4">
				{/* การ拱ดการ์ดหลัก */}
				<div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
					{/* Header ของการ์ด */}
					<div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
						<div className="flex items-center space-x-3">
							<Printer className="w-8 h-8 text-white" />
							<h2 className="text-2xl font-bold text-white">การตั้งค่าเครื่องพิมพ์</h2>
						</div>
					</div>

					<div className="p-8">
						{/* แสดงสถานะเครื่องพิมพ์ปัจจุบัน */}
						<div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
							<h3 className="text-lg font-semibold text-gray-800 mb-3">สถานะเครื่องพิมพ์ปัจจุบัน</h3>
							<div className="flex items-center space-x-3">
								<div className={`w-3 h-3 rounded-full ${printerName ? 'bg-green-500' : 'bg-red-500'}`}></div>
								{printerName ? (
									<span className="text-green-700 font-medium text-lg">
										📄 {printerName}
									</span>
								) : (
									<span className="text-red-600 font-medium">
										⚠️ ยังไม่ได้เลือกเครื่องพิมพ์
									</span>
								)}
							</div>
						</div>

						{/* เลือกเครื่องพิมพ์ */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<label htmlFor="printer-select" className="text-lg font-semibold text-gray-800">
									เลือกเครื่องพิมพ์
								</label>
								<button
									onClick={fetchPrinters}
									className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
									disabled={loading}
								>
									<RefreshCw className="w-4 h-4" />
									<span>รีเฟรช</span>
								</button>
							</div>

							<select
								id="printer-select"
								value={selectedPrinterShareName}
								onChange={(e) => setSelectedPrinterShareName(e.target.value)}
								className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
							>
								<option value="" disabled>-- กรุณาเลือกเครื่องพิมพ์ --</option>
								{printers.length > 0 ? (
									printers.map((printer, index) => (
										<option
											key={index}
											value={printer.ShareName}
											disabled={!printer.ShareName}
										>
											🖨️ {printer.Name} {printer.ShareName && `(${printer.ShareName})`}
										</option>
									))
								) : (
									<option value="" disabled>ไม่พบเครื่องพิมพ์ใด ๆ</option>
								)}
							</select>
						</div>

						{/* ส่วนทดสอบการพิมพ์ */}
						<div className="mt-6 space-y-4">
							<div className="flex items-center justify-between">
								<label htmlFor="print-test" className="text-lg font-semibold text-gray-800">
									ทดสอบการพิมพ์
								</label>
							</div>
							<textarea
								id="print-test"
								value={textToPrint}
								onChange={(e) => setTextToPrint(e.target.value)}
								placeholder="ป้อนข้อความสำหรับทดสอบการพิมพ์..."
								className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm resize-y h-32"
							/>
							<button
								onClick={handlePrint}
								disabled={loading || !selectedPrinterShareName || !textToPrint}
								className={`flex items-center justify-center space-x-2 w-full py-3 px-4 text-base font-semibold rounded-xl transition-all duration-200
									${loading || !selectedPrinterShareName || !textToPrint
										? 'bg-gray-300 cursor-not-allowed'
										: 'bg-blue-600 hover:bg-blue-700 text-white'
									}`}
							>
								<Send className="w-5 h-5" />
								<span>พิมพ์ข้อความทดสอบ</span>
							</button>
						</div>

						{/* แสดงสถานะ */}
						{status && (
							<div className={`mt-6 p-4 rounded-xl border-l-4 ${status.includes("สำเร็จ")
									? "bg-green-50 border-green-500 text-green-800"
									: status.includes("ข้อผิดพลาด")
										? "bg-red-50 border-red-500 text-red-800"
										: "bg-blue-50 border-blue-500 text-blue-800"
								}`}>
								<div className="flex items-center space-x-3">
									{getStatusIcon()}
									<span className="font-medium text-base">{status}</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}