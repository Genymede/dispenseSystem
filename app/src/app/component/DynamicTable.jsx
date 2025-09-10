// components/DynamicTable.js
export default function DynamicTable({ columns, data, onRowClick, renderCell, className = "" }) {
    return (
      <table className={`w-full border-collapse ${className}`}>
        <thead>
          <tr className="bg-gray-100 text-left">
            {columns.map((col, idx) => (
              <th key={idx} className="border px-2 py-1">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="border px-2 py-1">
                  {renderCell
                    ? renderCell(row, col.key)
                    : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  