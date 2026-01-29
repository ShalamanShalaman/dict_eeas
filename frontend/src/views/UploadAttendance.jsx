import React, { useState } from "react";

export default function UploadAttendance() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState({});

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

  return (
    <div className="space-y-6">
      {/* UPLOAD SECTION */}
      <div className="bg-white p-8 rounded-xl border shadow-sm">
        <h2 className="text-2xl font-bold mb-2">Upload Attendance</h2>
        <p className="text-gray-500 mb-6">
          Upload the Biometrics PDF report to generate DTR files.
        </p>

        <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0 file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
              border p-2 rounded-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium
              hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? "Processing..." : "Extract Data"}
          </button>
        </form>
      </div>

      {/* RESULTS TABLE */}
      {Object.keys(employees).length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Employee Name
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-center">
                  Days Found
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Object.entries(employees).map(([name, data]) => {
                const dayCount = Object.keys(data).filter((k) => !isNaN(k)).length;

                return (
                  <tr key={name} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        {dayCount} Days
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => downloadExcel(name, data)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Download Excel 📥
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
