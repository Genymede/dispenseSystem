  // Sidebar Component
  import "./globals.css";
  import SidebarWrapper from "./component/SidebarWrapper";
  import Navbar from "./component/Navbar";

  export default async function RootLayout({ children }) {
    return (
      <html lang="en">
        <body className="bg-gray-100">
          {/* Header */}
          <Navbar />

          {/* Main Layout */}
          <div className="flex pt-19 h-screen w-full"> {/* pt-14 คือ padding-top ให้ content ขยับลงจาก header */}
            
            {/* Sidebar */}
            <div className="sticky top-14"> {/* 3.5rem = 14 Tailwind units */}
              <SidebarWrapper />
            </div>

            {/* Main content */}
            <div className="flex-1 h-[91vh] overflow-y-auto px-4">
              <div className=" bg-white p-6 rounded-lg">
                {children}
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }
