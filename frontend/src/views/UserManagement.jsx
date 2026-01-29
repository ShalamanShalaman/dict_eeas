import { useState, useEffect } from "react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    user_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    role: "employee",
    contact_no: "",
    office_location_id: ""
  });

  const [locationForm, setLocationForm] = useState({
    location: "",
    manager: ""
  });

  const API_URL = "http://127.0.0.1:5000/api";

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    fetchUsers();
    fetchLocations();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users`);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/locations`);
      const data = await res.json();
      setLocations(data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch locations");
    }
  };

  // ---------------- USER CRUD ----------------
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingUser
        ? `${API_URL}/admin/edit-user/${editingUser.public_id}`
        : `${API_URL}/admin/create-user`;
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const result = await res.json();

      if (res.ok) {
        alert(result.message);
        closeUserModal();
        fetchUsers();
      } else {
        alert(result.error || "Request failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      user_id: user.user_id,
      first_name: user.first_name,
      middle_name: user.middle_name || "",
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      contact_no: user.contact_no || "",
      office_location_id: user.office_location_id || ""
    });
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.full_name}?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/delete-user/${user.public_id}`, {
        method: "DELETE"
      });
      const result = await res.json();
      if (res.ok) fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    }
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
    setFormData({
      user_id: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      role: "employee",
      contact_no: "",
      office_location_id: ""
    });
  };

  // ---------------- OFFICE LOCATION CRUD ----------------
  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingLocation
        ? `${API_URL}/admin/edit-location/${editingLocation.id}`
        : `${API_URL}/admin/create-location`;
      const method = editingLocation ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationForm)
      });
      const result = await res.json();

      if (res.ok) {
        fetchLocations();
        if (!editingLocation) setLocationForm({ location: "", manager: "" });
        setEditingLocation(null); // clear editing, but modal stays open
      } else {
        alert(result.error || "Failed to save location");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  const handleEditLocation = (loc) => {
    setEditingLocation(loc);
    setLocationForm({ location: loc.location, manager: loc.manager });
    setIsLocationModalOpen(true);
  };

  const handleDeleteLocation = async (loc) => {
    if (!window.confirm(`Delete location "${loc.location}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/delete-location/${loc.id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchLocations();
    } catch (error) {
      console.error(error);
      alert("Failed to delete location");
    }
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
    setEditingLocation(null);
    setLocationForm({ location: "", manager: "" });
  };

  // ---------------- PAGINATION ----------------
  const itemsPerPage = 10;
  const filteredUsers = users.filter((u) =>
    `${u.full_name} ${u.user_id} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="space-x-2">
          <button
            onClick={() => setIsUserModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
          >
            + Add User
          </button>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow"
          >
            Manage Office Locations
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded px-3 py-2 w-full max-w-sm focus:outline-none focus:ring focus:border-blue-300"
      />

      {/* USERS TABLE */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden mt-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-6">Loading...</td></tr>
            ) : paginatedUsers.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-6">No users found</td></tr>
            ) : (
              paginatedUsers.map((user) => {
                const loc = locations.find(l => l.id === user.office_location_id);
                return (
                  <tr key={user.public_id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2">{user.user_id}</td>
                    <td className="px-4 py-2">{user.full_name}</td>
                    <td className="px-4 py-2 capitalize">{user.role}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{loc ? loc.location : "-"}</td>
                    <td className="px-4 py-2">{user.is_active ? "Active" : "Inactive"}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDeleteUser(user)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ---------------- USER MODAL ---------------- */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingUser ? "Edit User" : "Create User"}</h3>
              <button onClick={closeUserModal} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>
            <form onSubmit={handleUserSubmit} className="p-6 grid grid-cols-2 gap-4">
              {/* User Inputs */}
              <div>
                <label className="text-xs">User ID</label>
                <input
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="border w-full px-2 py-1 rounded focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div>
                <label className="text-xs">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="border w-full px-2 py-1 rounded focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs">First Name</label>
                <input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="border w-full px-2 py-1 rounded focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div>
                <label className="text-xs">Middle Name</label>
                <input
                  value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  className="border w-full px-2 py-1 rounded focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div>
                <label className="text-xs">Last Name</label>
                <input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="border w-full px-2 py-1 rounded focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div>
                <label className="text-xs">Email</label>
                <input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border w-full px-2 py-1 rounded focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div>
                <label className="text-xs">Contact No</label>
                <input
                  value={formData.contact_no}
                  onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
                  className="border w-full px-2 py-1 rounded focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div>
                <label className="text-xs">Office Location</label>
                <select
                  value={formData.office_location_id}
                  onChange={(e) => setFormData({ ...formData, office_location_id: e.target.value })}
                  className="border w-full px-2 py-1 rounded focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="">-- Select Location --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.location} ({loc.manager})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <button type="button" onClick={closeUserModal} className="px-4 py-2 rounded border hover:bg-gray-100">Cancel</button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{editingUser ? "Save" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- OFFICE LOCATION MODAL ---------------- */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg p-4">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="font-bold text-lg">Manage Office Locations</h3>
              <button onClick={closeLocationModal} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>

            {/* Form */}
            <form onSubmit={handleLocationSubmit} className="grid gap-3 mb-4">
              <input
                placeholder="Location"
                value={locationForm.location}
                onChange={(e) => setLocationForm({ ...locationForm, location: e.target.value })}
                className="border px-2 py-1 rounded focus:outline-none focus:ring focus:border-green-300"
              />
              <input
                placeholder="Manager"
                value={locationForm.manager}
                onChange={(e) => setLocationForm({ ...locationForm, manager: e.target.value })}
                className="border px-2 py-1 rounded focus:outline-none focus:ring focus:border-green-300"
              />
              <button className={`px-4 py-2 rounded ${editingLocation ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-600 hover:bg-green-700"} text-white`}>
                {editingLocation ? "Save" : "Add Location"}
              </button>
            </form>

            {/* List */}
            <div className="space-y-3">
              {locations.map((loc) => (
                <div key={loc.id} className="flex justify-between items-center p-3 border rounded shadow-sm hover:shadow-md transition">
                  <span>{loc.location} ({loc.manager})</span>
                  <div className="space-x-2">
                    <button onClick={() => handleEditLocation(loc)} className="text-yellow-600 hover:underline">Edit</button>
                    <button onClick={() => handleDeleteLocation(loc)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
