import { Download } from "lucide-react";

export default function ExportButton({
  onExport, 
  description = "ดาวน์โหลด",
  icon: Icon = Download,
  color = "blue",
  isExporting = false,
  disabled = false,
}) {
  const baseColor = `bg-${color}-600 hover:bg-${color}-700`;
  const disabledColor = `bg-${color}-400 cursor-not-allowed`;

  return (
    <button
      onClick={onExport}
      disabled={isExporting || disabled}
      className={`text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-sm
        ${isExporting || disabled ? disabledColor : baseColor}`}
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          กำลังส่งออก...
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {description}
        </>
      )}
    </button>
  );
}
