import {
  Clock,
  AlertTriangle,
  Calendar,
  Pill,
  Shield,
  Zap,
  ChevronRight,
  FileText,
  Package, // defaul
  Tablets,
} from "lucide-react";

export default function Header({ header, description, icon: Icon = FileText }) {
  return (
    <div className="mb-2">
      <h2 className="text-4xl font-bold text-gray-800 mb-2 ">
        {/* <Icon className="inline-block w-10 h-10 mr-3 text-blue-600" /> */}
        <Icon className="inline-block w-13 h-13 mr-4 text-blue-600 p-2 bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-lg border border-gray-50 shadow-lg shadow-gray-100" />
        {header}
      </h2>
    </div>
  );
}
