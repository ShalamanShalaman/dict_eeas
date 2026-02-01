import React, { useState, useRef } from "react";

export default function UploadAttendance() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [viewMode, setViewMode] = useState("dtr");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f || f.type !== "application/pdf") return;
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("attendanceFile", file);

    try {
      const response = await fetch(
        "http://localhost:5000/api/upload-attendance",
        { method: "POST", body: formData }
      );
      const result = await response.json();

      if (response.ok) {
        setEmployees(result.data || {});
        setSelectedEmployee(Object.keys(result.data || {})[0] || "");
      } else {
        alert(result.error || "Failed to process PDF.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setFile(null);
    setEmployees({});
    setSelectedEmployee("");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const downloadExcel = async () => {
    if (!selectedEmployee) return;

    const response = await fetch("http://localhost:5000/api/download-dtr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_name: selectedEmployee,
        employee_data: employees[selectedEmployee],
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `DTR_${selectedEmployee}.xlsx`;
      a.click();
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`md:col-span-2 rounded-xl h-60 flex flex-col items-center justify-center border-2 border-dashed ${
              isDragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <div className="font-semibold">{file ? "PDF Selected" : "PDF"}</div>
            <p className="text-sm text-gray-500">Drag & Drop</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
              id="attendanceUpload"
            />

            <label
              htmlFor="attendanceUpload"
              className="mt-3 text-sm text-blue-600 cursor-pointer hover:underline"
            >
              Browse File
            </label>

            {file && (
              <p className="mt-2 text-xs text-gray-700">{file.name}</p>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full disabled:bg-blue-300"
            >
              {loading ? "Extracting…" : "Extract Data"}
            </button>

            <button
              onClick={handleClearAll}
              className="bg-red-600 text-white px-4 py-2 rounded-lg w-full"
            >
              Clear
            </button>

            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm border"
            >
              <option value="">Employee name</option>
              {Object.keys(employees).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedEmployee && (
        <>
          <div className="flex justify-center">
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              {["dtr", "accomplishment"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold ${
                    viewMode === mode
                      ? "bg-white shadow text-blue-700"
                      : "text-gray-500"
                  }`}
                >
                  {mode === "dtr"
                    ? "Daily Time Record"
                    : "Accomplishment Report"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4">
            {viewMode === "dtr" ? (
              <DTRTable data={employees[selectedEmployee]} />
            ) : (
              <AccomplishmentTable />
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={downloadExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Download Excel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* TABLES */

function DTRTable({ data }) {
  const days = Object.keys(data || {}).filter((k) => !isNaN(k));

  return (
    <table className="w-full text-sm border">
      <thead className="bg-gray-100">
        <tr>
          {["Day", "AM IN", "AM OUT", "PM IN", "PM OUT", "UT HRS", "UT MIN"].map(
            (h) => (
              <th key={h} className="border px-2 py-1">
                {h}
              </th>
            )
          )}
        </tr>
      </thead>
      <tbody>
        {days.map((day) => (
          <tr key={day}>
            <td className="border px-2 py-1">{day}</td>
            {[
              "am_in",
              "am_out",
              "pm_in",
              "pm_out",
              "undertime_hrs",
              "undertime_min",
            ].map((f) => (
              <td key={f} className="border px-2 py-1">
                {data[day]?.[f] || ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AccomplishmentTable() {
  return (
    <div className="space-y-3 text-sm">
      <div className="font-semibold">Tasks</div>
      <textarea className="w-full border rounded p-2" rows={4} />
    </div>
  );
}
