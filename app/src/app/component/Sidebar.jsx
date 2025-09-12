// "use client";
// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//   Pill, FileText, Tag, Warehouse, Truck, BarChart3,
//   User, Settings, LogOut, Menu, Home, Tablets,
// } from 'lucide-react';

// // กำหนดรายการเมนูทั้งหมด พร้อมสิทธิ์การเข้าถึงที่จำเป็น
// const allMenuItems = [
//   {
//     href: "/",
//     icon: <Home className="w-5 h-5" />,
//     label: "หน้าหลัก",
//     description: "หน้าหลักของระบบ",
//     requiredRole: ["pharmacist", "Mask Rider"] // ทุกบทบาทเข้าถึงได้
//   },
//   {
//     href: "/dispense",
//     icon: <Tablets className="w-5 h-5" />,
//     label: "จ่ายยา",
//     description: "จัดการการจ่ายยาผู้ป่วย",
//     badge: "12",
//     requiredRole: ["pharmacist"]
//   },
//   {
//     href: [
//       "/registry",
//       "/registry/dispenseHistory",
//       "/registry/delivery",
//       "/registry/allergy",
//       "/registry/overdue",
//       "/registry/med_usage",
//       "/registry/rad",
//       "/registry/med_interactions"
//     ],
//     icon: <FileText className="w-5 h-5" />,
//     label: "ทะเบียน",
//     description: "จัดการทะเบียนยาและผู้ป่วย",
//     requiredRole: ["pharmacist"]
//   },
//   {
//     href: "/sticker",
//     icon: <Tag className="w-5 h-5" />,
//     label: "สติ๊กเกอร์ยา",
//     description: "พิมพ์ป้ายและสติ๊กเกอร์",
//     requiredRole: ["pharmacist"]
//   },
//   {
//     href: "/subwarehouse",
//     icon: <Warehouse className="w-5 h-5" />,
//     label: "คลังย่อย",
//     description: "จัดการคลังยาสาขา",
//     badge: "Low",
//     requiredRole: ["pharmacist"]
//   },
//   {
//     href: "/med_delivery",
//     icon: <Truck className="w-5 h-5" />,
//     label: "การจัดส่งยา",
//     description: "ติดตามการจัดส่ง",
//     badge: "3",
//     requiredRole: ["pharmacist"]
//   },
//   {
//     href: [
//       "/reports",
//       "/reports/med_request",
//       "/reports/cut_off",
//       "/reports/med_order_history",
//       "/reports/med_delivery",
//       "/reports/overdue_med",
//       "/reports/allergy_registry",
//       "/reports/rad_registry",
//       "/reports/adr_registry",
//       "/reports/med_table",
//       "/reports/error_medication",
//       "/reports/med_interaction",
//       "/reports/med_expired",
//       "/reports/med_usage_history",
//       "/reports/med_problem",
//       "/reports/temp_humidity"
//     ],
//     icon: <BarChart3 className="w-5 h-5" />,
//     label: "ออกรายงาน",
//     description: "รายงานและสถิติ",
//     requiredRole: ["pharmacist"]
//   }
// ];

// const Sidebar = () => {
//   const [pathname, setPathname] = useState('/');
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [userRole, setUserRole] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     const storedToken = localStorage.getItem("token");
//     console.log("user data:", storedUser);
//     console.log("token:", storedToken);

//     let user = null;
//     if (storedUser && storedToken) {
//       try {
//         user = JSON.parse(storedUser);
//         setUserRole(user.role);
//       } catch (error) {
//         console.error("Error parsing user data:", error);
//         localStorage.removeItem("user");
//         localStorage.removeItem("token");
//         router.push('/login');
//       }
//     } else {
//       // ถ้าไม่มี token หรือ user data ให้ redirect ไปหน้า login
//       router.push('/login');
//     }

//     const currentPath = window.location.pathname || '/';
//     setPathname(currentPath);

//     // แก้ไขเงื่อนไขการ redirect
//     if (currentPath !== '/' && (!user || user.role !== "pharmacist")) {
//       router.push('/');
//     }
//   }, [router]);

//   // กรองเมนูตามบทบาทของผู้ใช้
//   const filteredMenuItems = allMenuItems.filter(item => {
//     if (!userRole) {
//       return item.requiredRole.includes("Mask Rider") || item.href === '/';
//     }
//     return item.requiredRole.includes(userRole);
//   });

//   // ปรับตรรกะ isActive เพื่อรองรับ href ที่เป็น string หรือ array
//   const isActive = (href) => {
//     if (Array.isArray(href)) {
//       return href.some(path => pathname === path);
//     }
//     return pathname === href;
//   };

//   return (
//     <div className={`${isCollapsed ? 'w-16' : 'w-72'} transition-all duration-200 ease-in-out`}>
//       <aside className="sticky top-0 h-[91vh] bg-white rounded-r-lg shadow-sm border-r border-gray-200 flex flex-col relative">
//         <nav className="flex-2 px-3 py-4 space-y-3 overflow-y-auto overflow-x-hidden">
//           {/* Header และปุ่มยุบเมนู */}
//           <div className="px-2 border-b border-gray-300 flex items-center justify-between mb-4">
//             <button onClick={() => setIsCollapsed(!isCollapsed)} className="" aria-label={isCollapsed ? "ขยายเมนู" : "ย่อเมนู"}>
//               <Menu className="w-5 h-5 text-gray-600 mb-4" />
//             </button>
//           </div>

//           {!isCollapsed && (
//             <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">
//               เมนูหลัก
//             </h4>
//           )}

//           {/* แสดงรายการเมนูที่ถูกกรองแล้ว */}
//           {filteredMenuItems.map((item) => {
//             const active = isActive(item.href);
//             // ใช้ href[0] ถ้าเป็น array มิฉะนั้นใช้ href ตรง ๆ
//             const linkHref = Array.isArray(item.href) ? item.href[0] : item.href;
//             return (
//               <div key={Array.isArray(item.href) ? item.href[0] : item.href} className="relative group">
//                 <a
//                   href={linkHref}
//                   className={`
//                     flex items-center px-3 py-2.5 rounded-lg transition-colors duration-150
//                     ${active ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-50' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-800'}
//                     ${isCollapsed ? 'justify-center' : 'space-x-3'}
//                   `}
//                 >
//                   {active && (
//                     <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0.5 h-6 bg-blue-600 rounded-r"></div>
//                   )}
//                   <div className="flex-shrink-0">
//                     {item.icon}
//                   </div>
//                   {!isCollapsed && (
//                     <div className="flex-1 min-w-0">
//                       <div className="font-medium truncate">{item.label}</div>
//                       <div className="text-xs text-gray-500 truncate">
//                         {item.description}
//                       </div>
//                     </div>
//                   )}
//                 </a>
//                 {isCollapsed && (
//                   <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-blue-700 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
//                     {item.label}
//                     <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 border-2 border-transparent border-r-gray-900"></div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </nav>
//       </aside>
//     </div>
//   );
// };

// export default Sidebar;

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Pill, FileText, Tag, Warehouse, Truck, BarChart3,
  User, Settings, LogOut, Menu, Home, Tablets,
} from 'lucide-react';

// Define menu items with required roles
const allMenuItems = [
  {
    href: "/",
    icon: <Home className="w-6 h-6"/>,
    label: "หน้าหลัก",
    description: "หน้าหลักของระบบ",
    requiredRole: ["pharmacist", "Mask Rider"],
  },
  {
    href: "/dispense",
    icon: <Tablets className="w-6 h-6"/>,
    label: "จ่ายยา",
    description: "จัดการการจ่ายยาผู้ป่วย",
    requiredRole: ["pharmacist"],
  },
  {
    href: [
      "/registry",
      "/registry/dispenseHistory",
      "/registry/delivery",
      "/registry/allergy",
      "/registry/overdue",
      "/registry/med_usage",
      "/registry/rad",
      "/registry/med_interactions",
    ],
    icon: <FileText className="w-6 h-6"/>,
    label: "ทะเบียน",
    description: "จัดการทะเบียนยาและผู้ป่วย",
    requiredRole: ["pharmacist"],
  },
  {
    href: "/sticker",
    icon: <Tag className="w-6 h-6"/>,
    label: "สติ๊กเกอร์ยา",
    description: "พิมพ์ป้ายและสติ๊กเกอร์",
    requiredRole: ["pharmacist"],
  },
  {
    href: "/subwarehouse",
    icon: <Warehouse className="w-6 h-6"/>,
    label: "คลังย่อย",
    description: "จัดการคลังยาสาขา",
    requiredRole: ["pharmacist"],
  },
  {
    href: "/med_delivery",
    icon: <Truck className="w-6 h-6"/>,
    label: "การจัดส่งยา",
    description: "ติดตามการจัดส่ง",
    requiredRole: ["pharmacist"],
  },
  {
    href: [
      "/reports",
      "/reports/med_request",
      "/reports/cut_off",
      "/reports/med_order_history",
      "/reports/med_delivery",
      "/reports/overdue_med",
      "/reports/allergy_registry",
      "/reports/rad_registry",
      "/reports/adr_registry",
      "/reports/med_table",
      "/reports/error_medication",
      "/reports/med_interaction",
      "/reports/med_expired",
      "/reports/med_usage_history",
      "/reports/med_problem",
      "/reports/temp_humidity",
    ],
    icon: <BarChart3 className="w-6 h-6" />,
    label: "ออกรายงาน",
    description: "รายงานและสถิติ",
    requiredRole: ["pharmacist"],
  },
];

const Sidebar = () => {
  const [pathname, setPathname] = useState('/');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    console.log("user data:", storedUser);
    console.log("token:", storedToken);

    let user = null;
    if (storedUser && storedToken) {
      try {
        user = JSON.parse(storedUser);
        setUserRole(user.role);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push('/login');
      }
    } else {
      router.push('/login');
    }

    const currentPath = window.location.pathname || '/';
    setPathname(currentPath);

    if (currentPath !== '/' && (!user || user.role !== "pharmacist")) {
      router.push('/');
    }
  }, [router]);

  // Filter menu items based on user role
  const filteredMenuItems = allMenuItems.filter(item => {
    if (!userRole) {
      return item.requiredRole.includes("Mask Rider") || item.href === '/';
    }
    return item.requiredRole.includes(userRole);
  });

  // Check if menu item is active
  const isActive = (href) => {
    if (Array.isArray(href)) {
      return href.some(path => pathname === path);
    }
    return pathname === href;
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-72'} transition-all duration-200 ease-in-out`}>
      <aside className="sticky top-0 h-[91vh] bg-white rounded-r-xl shadow-xl flex flex-col font-prompt">
        <nav className="flex-1 py-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-none">
          {/* Header and collapse button */}
          <div className="flex justify-between items-center px-4 border-b border-gray-200 mb-4 pb-4">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-blue-50 rounded-lg active:scale-95 transition-all duration-200"
              aria-label={isCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {!isCollapsed && (
            <h4 className="text-xs font-bold uppercase text-slate-400 px-4 py-2 mb-2 tracking-wider">
              เมนูหลัก
            </h4>
          )}

          {/* Render filtered menu items */}
          {filteredMenuItems.map((item) => {
            const active = isActive(item.href);
            const linkHref = Array.isArray(item.href) ? item.href[0] : item.href;
            return (
              <div key={linkHref} className="relative group">
                <a
                  href={linkHref}
                  className={`
                    flex items-center px-4 py-3 cursor-pointer transition-all duration-300 
                    ${active 
                      ? 'bg-gradient-to-r from-blue-500 to-sky-300 text-white font-medium shadow-sm' 
                      : 'text-slate-600 hover:bg-gray-200'
                    }
                    ${isCollapsed ? 'justify-center' : 'space-x-4'}
                  `}
                >
                  <div className="flex-shrink-0">
                    <div className={`
                      ${active ? 'text-white' : 'text-slate-500'} 
                      transition-colors duration-300
                    `}>
                      {item.icon}
                    </div>
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm truncate ${active ? 'text-white font-bold' : 'text-slate-700'}`}>
                        {item.label}
                      </div>
                      <div className={`text-xs truncate mt-0.5 ${active ? 'text-white font-bold' : 'text-slate-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </a>
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-slate-800 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-slate-800"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;