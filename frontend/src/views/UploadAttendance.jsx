import React, { useState, useRef } from "react";

export default function UploadAttendance() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [viewMode, setViewMode] = useState("dtr"); // dtr | accomplishment
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF file.");

    setLoading(true);
    const formData = new FormData();
    formData.append("attendanceFile", file);

    try {
      const response = await fetch("http://localhost:5000/api/upload-attendance", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setEmployees(result.data);
        setSelectedEmployee(Object.keys(result.data)[0] || "");
      } else {
        alert(result.error || "Failed to process PDF.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Backend server is not responding.");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async (name, data) => {
    try {
      const response = await fetch("http://localhost:5000/api/download-dtr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_name: name, employee_data: data }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `DTR_${name.replace(/\s+/g, "_")}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Failed to download file from server.");
      }
    } catch (error) {
      console.error(error);
      alert("Error downloading Excel file.");
    }
  };

  const handleClearAll = () => {
    setFile(null);
    setEmployees({});
    setSelectedEmployee("");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">

      {/* UPLOAD + CONTROLS (IMAGE-BASED LAYOUT) */}
      <div className="bg-white border rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Drag & Drop */}
          <div className="md:col-span-2 border-2 border-dashed rounded-xl h-48
            flex flex-col items-center justify-center text-gray-600">
            <div className="font-semibold">PDF</div>
            <p className="text-sm">Drag & Drop</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="attendanceUpload"
            />
            <label
              htmlFor="attendanceUpload"
              className="mt-3 text-sm text-blue-600 cursor-pointer hover:underline"
            >
              Browse File
            </label>
          </div>

          {/* Right Controls */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Filename:</label>
              <p className="text-xs text-gray-500">
                {file ? file.name : "No file selected"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium
                  hover:bg-blue-700 transition disabled:bg-blue-300 w-full"
              >
                {loading ? "Processing..." : "Extract Data"}
              </button>

              <button
                onClick={handleClearAll}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium
                  hover:bg-red-700 transition w-full"
              >
                Clear
              </button>
            </div>

            <div>
              <label className="text-sm font-semibold">
                Select Your Attendance:
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                disabled={Object.keys(employees).length === 0}
              >
                <option value="">employee name</option>
                {Object.keys(employees).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* TOGGLE */}
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer
            ${viewMode === "accomplishment" ? "bg-blue-600" : "bg-gray-300"}`}
          onClick={() =>
            setViewMode(viewMode === "dtr" ? "accomplishment" : "dtr")
          }
        >
          <div
            className={`bg-white w-5 h-5 rounded-full shadow transition-transform
              ${viewMode === "accomplishment" ? "translate-x-6" : ""}`}
          />
        </div>

        <span className="text-sm font-semibold">
          {viewMode === "dtr"
            ? "Daily Time Record (Editor)"
            : "Accomplishment Report (Editor)"}
        </span>
      </div>

      {/* EDITOR */}
      {selectedEmployee && (
        <div className="bg-white rounded-2xl border shadow-lg p-4">
          {viewMode === "dtr" ? (
            <DTRTable
              name={selectedEmployee}
              data={employees[selectedEmployee]}
            />
          ) : (
            <AccomplishmentTable name={selectedEmployee} />
          )}

          <div className="flex justify-end mt-4">
            <button
              onClick={() =>
                downloadExcel(
                  selectedEmployee,
                  employees[selectedEmployee]
                )
              }
              className="bg-green-600 text-white px-4 py-2 rounded-lg
                hover:bg-green-700 transition font-medium"
            >
              Download Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== */
/* TABLE COMPONENTS */
/* ===================== */

function DTRTable({ name, data }) {
  const days = Object.keys(data || {}).filter((k) => !isNaN(k));

  return (
    <>
      <div className="flex justify-between mb-2">
        <span className="font-semibold text-sm">{name}</span>
        <span className="text-gray-500">✏️</span>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Day</th>
            <th className="border px-2 py-1">AM IN</th>
            <th className="border px-2 py-1">AM OUT</th>
            <th className="border px-2 py-1">PM IN</th>
            <th className="border px-2 py-1">PM OUT</th>
            <th className="border px-2 py-1">Undertime Hrs</th>
            <th className="border px-2 py-1">Undertime Min</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day}>
              <td className="border px-2 py-1">{day}</td>
              <td className="border px-2 py-1">{data[day]?.am_in || ""}</td>
              <td className="border px-2 py-1">{data[day]?.am_out || ""}</td>
              <td className="border px-2 py-1">{data[day]?.pm_in || ""}</td>
              <td className="border px-2 py-1">{data[day]?.pm_out || ""}</td>
              <td className="border px-2 py-1">{data[day]?.undertime_hrs || ""}</td>
              <td className="border px-2 py-1">{data[day]?.undertime_min || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function AccomplishmentTable({ name }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="font-semibold">{name}</span>
        <span className="text-gray-500">✏️</span>
      </div>

      <div className="flex gap-2 items-center">
        <span className="font-semibold w-20">Project:</span>
        <div className="flex-1 border rounded px-2 py-1"></div>
        <span className="text-gray-500">✏️</span>
      </div>

      <div className="border rounded">
        <div className="bg-gray-100 py-2 text-center font-semibold">
          Tasks
        </div>

        <div className="grid grid-cols-2">
          <div className="border p-2">January 1, 2026</div>
          <div className="border p-2">...</div>

          <div className="border p-2">January 31, 2026</div>
          <div className="border p-2">...</div>
        </div>
      </div>
    </div>
  );
}
