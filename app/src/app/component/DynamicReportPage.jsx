
"use client";
import { useEffect, useState } from "react";

export default function DynamicReportPage({ params }) {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const table = params.table;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:3001/reports/${table}`);
        const result = await res.json();
        if (result.length > 0) {
          setColumns(Object.keys(result[0]));
          setData(result);
        }
      } catch (error) {
        console.error("Failed to load report data:", error);
      }
    }

    fetchData();
  }, [table]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">รายงาน: {table}</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-2 border">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2 border">{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
