"use client";
import { useEffect, useState } from "react";


const host = typeof window !== "undefined" ? window.location.hostname : "localhost";

export default function MedInteractionPage() {
  const [interactions, setInteractions] = useState([]);
  const [form, setForm] = useState({ med_id_1: "", med_id_2: "", description: "" });
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch(`http://${host}:3001/medicine/interactions`, { cache: "no-store" })
      .then((res) => res.json())
      .then(setInteractions);
  }, []);

  const handleSubmit = async () => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://${host}:3001/medicine/interactions/${selected.interacton_id}`
      : `http://${host}:3001/medicine/interactions`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
      if (isEditing) {
        setInteractions(interactions.map((i) => (i.interacton_id === data.interacton_id ? data : i)));
      } else {
        setInteractions([...interactions, data]);
      }
      resetForm();
    } else {
      alert("❌ ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const handleEdit = (item) => {
    setForm({
      med_id_1: item.med_id_1,
      med_id_2: item.med_id_2,
      description: item.description,
    });
    setSelected(item);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("ต้องการลบใช่หรือไม่?")) return;
    const res = await fetch(`http://${host}:3001/medicine/interactions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setInteractions(interactions.filter((i) => i.interacton_id !== id));
    }
  };

  const resetForm = () => {
    setForm({ med_id_1: "", med_id_2: "", description: "" });
    setSelected(null);
    setIsEditing(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📋 ปฏิกิริยาระหว่างยา</h1>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="mb-6 space-y-3">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="med_id_1"
            className="border p-2 w-full"
            value={form.med_id_1}
            onChange={(e) => setForm({ ...form, med_id_1: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="med_id_2"
            className="border p-2 w-full"
            value={form.med_id_2}
            onChange={(e) => setForm({ ...form, med_id_2: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="คำอธิบาย"
            className="border p-2 w-full"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <div className="text-right">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {isEditing ? "💾 บันทึก" : "➕ เพิ่ม"}
          </button>
          {isEditing && (
            <button
              type="button"
              className="ml-2 bg-gray-400 text-white px-4 py-2 rounded"
              onClick={resetForm}
            >
              ยกเลิก
            </button>
          )}
        </div>
      </form>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">med_id_1</th>
            <th className="p-2 border">med_id_2</th>
            <th className="p-2 border">คำอธิบาย</th>
            <th className="p-2 border">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {interactions.map((item) => (
            <tr key={item.interacton_id}>
              <td className="p-2 border text-center">{item.interacton_id}</td>
              <td className="p-2 border text-center">{item.med_id_1}</td>
              <td className="p-2 border text-center">{item.med_id_2}</td>
              <td className="p-2 border">{item.description}</td>
              <td className="p-2 border text-center space-x-2">
                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline">แก้ไข</button>
                <button onClick={() => handleDelete(item.interacton_id)} className="text-red-600 hover:underline">ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
