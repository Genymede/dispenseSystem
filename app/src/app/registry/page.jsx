"use client";
import {
  Clock,
  AlertTriangle,
  Calendar,
  Pill,
  Shield,
  Zap,
  ChevronRight,
  FileText,
  Truck,
  Tablets,
  ShieldAlert,
  Biohazard,
  HandCoins,
  HeartPulse,
  BriefcaseMedical,
  Ambulance,
  TimerOff,
  CircleAlert,
} from "lucide-react";
import Header from "../component/Header";

// Mock data without style properties
const registryItems = [
  {
    id: 'dispenseHistory',
    title: 'ประวัติการจ่ายยา',
    description: 'ดูประวัติการจ่ายยาทั้งหมด',
    icon: Tablets,
    link: '/registry/dispenseHistory'
  },
  {
    id: 'delivery',
    title: 'การจัดส่งยา',
    description: 'จัดการข้อมูลการจัดส่งยา',
    icon: Ambulance,
    link: '/registry/delivery'
  },
  {
    id: 'allergy',
    title: 'ทะเบียนการแพ้ยา',
    description: 'จัดการข้อมูลการแพ้ยา',
    icon: CircleAlert,
    link: '/registry/allergy'
  },
  {
    id: 'adr',
    title: 'ทะเบียนอาการไม่พึงประสงค์จากการใช้ยา',
    description: 'ติดตามอาการไม่พึงประสงค์จากยา',
    icon: Biohazard,
    link: '/registry/adr'
  },
  {
    id: 'overdue',
    title: 'ทะเบียนยาค้างจ่าย',
    description: 'ติดตามยาที่ค้างจ่าย',
    icon: TimerOff,
    link: '/registry/overdue'
  },
  {
    id: 'med_usage',
    title: 'ทะเบียนการใช้ยา',
    description: 'ข้อมูลการใช้ยาของผู้ป่วย',
    icon: BriefcaseMedical,
    link: '/registry/med_usage'
  },
  {
    id: 'rad',
    title: 'ทะเบียนยาปฏิชีวนะควบคุม',
    description: 'จัดการคำขอใช้ยาปฏิชีวนะควบคุม',
    icon: ShieldAlert,
    link: '/registry/rad'
  },
  {
    id: 'med_interactions',
    title: 'ทะเบียนปฏิกิริยาของยา',
    description: 'ตรวจสอบปฏิกิริยาระหว่างยา',
    icon: Zap,
    link: '/registry/med_interactions'
  },
];

export default function Registry() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        {/* Header Section */}
        <Header
          header="ระบบทะเบียน"
          description="จัดการข้อมูลทะเบียนต่างๆ ของระบบเภสัชกรรม"
          icon={FileText}
        />

        {/* Registry Cards Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {registryItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <a
                key={item.id}
                href={item.link}
                className="group relative block p-px rounded-2xl shadow-md transition-all duration-300 hover:scale-[1.02] bg-gradient-to-tr from-blue-500 to-sky-300 hover:shadow-lg hover:shadow-blue-200"
              >
                <div className="flex items-center justify-between gap-4 p-5 bg-white rounded-2xl h-full">
                  {/* ไอคอน */}
                  <div className="p-4 rounded-xl bg-white shadow-sm text-blue-500 flex-shrink-0">
                    <IconComponent className="h-8 w-8" />
                  </div>

                  {/* ข้อความ */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{item.description}</p>
                  </div>

                  {/* ลูกศร */}
                  <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 " />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
