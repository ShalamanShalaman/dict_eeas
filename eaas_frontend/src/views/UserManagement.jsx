import { useState, useEffect } from "react";
import { Users, MapPin, Briefcase, Plus, X, Edit2, Trash2, AlertCircle, CheckCircle } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  
  const [editingUser, setEditingUser] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [uiModal, setUiModal] = useState({ show: false, type: '', title: '', message: '', onConfirm: null });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [formData, setFormData] = useState({
    user_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    role: "employee",
    contact_no: "",
    office_location_id: "",
    position_id: "" 
  });

  const [locationForm, setLocationForm] = useState({
    location: "",
    reviewer_id: "" 
  });

  const API_URL = "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchUsers();
    fetchLocations();
    fetchPositions();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users`);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
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
    }
  };

  const fetchPositions = async () => {
    try {
        const res = await fetch(`${API_URL}/admin/positions`);
        const data = await res.json();
        setPositions(data);
    } catch (error) {
        console.error(error);
    }
  };

  const handleInputChange = (setter, data, field, value) => {
    setter({ ...data, [field]: value });
    setHasUnsavedChanges(true);
  };

  const closeUiModal = () => {
    setUiModal({ show: false, type: '', title: '', message: '', onConfirm: null });
  };

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
        setUiModal({ 
            show: true, 
            type: 'success', 
            title: 'Success', 
            message: result.message,
            onConfirm: () => closeUiModal()
        });
        closeUserModal(true); 
        fetchUsers();
        fetchPositions();
      } else {
        setUiModal({ 
            show: true, 
            type: 'error', 
            title: 'Error', 
            message: result.error || "Request failed",
            onConfirm: () => closeUiModal()
        });
      }
    } catch (error) {
      console.error(error);
      setUiModal({ 
        show: true, 
        type: 'error', 
        title: 'System Error', 
        message: "Failed to connect to the server.",
        onConfirm: () => closeUiModal()
      });
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
      office_location_id: user.office_location_id || "",
      position_id: user.position_id || ""
    });
    setHasUnsavedChanges(false);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setUiModal({
        show: true,
        type: 'confirm',
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.full_name}? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                const res = await fetch(`${API_URL}/admin/delete-user/${user.public_id}`, {
                    method: "DELETE"
                });
                if (res.ok) {
                    fetchUsers();
                    closeUiModal();
                } else {
                    setUiModal({ show: true, type: 'error', title: 'Error', message: 'Failed to delete user.', onConfirm: () => closeUiModal() });
                }
            } catch (error) {
                console.error(error);
                setUiModal({ show: true, type: 'error', title: 'Error', message: 'Server error occurred.', onConfirm: () => closeUiModal() });
            }
        }
    });
  };

  const attemptCloseUserModal = () => {
    if (hasUnsavedChanges) {
        setUiModal({
            show: true,
            type: 'confirm',
            title: 'Unsaved Changes',
            message: 'You have unsaved changes. Are you sure you want to close? Your progress will be lost.',
            onConfirm: () => {
                closeUserModal(true);
                closeUiModal();
            }
        });
    } else {
        closeUserModal(true);
    }
  };

  const closeUserModal = (force = false) => {
    if (!force && hasUnsavedChanges) return; 
    
    setIsUserModalOpen(false);
    setEditingUser(null);
    setHasUnsavedChanges(false);
    setFormData({
      user_id: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      role: "employee",
      contact_no: "",
      office_location_id: "",
      position_id: ""
    });
  };

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
        if (editingLocation) {
            closeLocationModal(true);
            setUiModal({ show: true, type: 'success', title: 'Success', message: 'Location updated successfully', onConfirm: () => closeUiModal() });
        } else {
            setLocationForm({ location: "", reviewer_id: "" });
            setHasUnsavedChanges(false);
            setUiModal({ show: true, type: 'success', title: 'Success', message: 'Location added successfully', onConfirm: () => closeUiModal() });
        }
      } else {
        setUiModal({ show: true, type: 'error', title: 'Error', message: result.error || "Failed to save location", onConfirm: () => closeUiModal() });
      }
    } catch (error) {
      console.error(error);
      setUiModal({ show: true, type: 'error', title: 'Error', message: 'Server error', onConfirm: () => closeUiModal() });
    }
  };

  const handleEditLocation = (loc) => {
    setEditingLocation(loc);
    setLocationForm({ location: loc.location, reviewer_id: loc.reviewer_id || "" });
    setHasUnsavedChanges(false);
    setIsLocationModalOpen(true);
  };

  const handleDeleteLocation = (loc) => {
    setUiModal({
        show: true,
        type: 'confirm',
        title: 'Delete Location',
        message: `Are you sure you want to delete "${loc.location}"?`,
        onConfirm: async () => {
            try {
                const res = await fetch(`${API_URL}/admin/delete-location/${loc.id}`, {
                    method: "DELETE"
                });
                if (res.ok) {
                    fetchLocations();
                    closeUiModal();
                } else {
                    setUiModal({ show: true, type: 'error', title: 'Error', message: 'Failed to delete location.', onConfirm: () => closeUiModal() });
                }
            } catch (error) {
                console.error(error);
                setUiModal({ show: true, type: 'error', title: 'Error', message: 'Server error.', onConfirm: () => closeUiModal() });
            }
        }
    });
  };

  const attemptCloseLocationModal = () => {
    if (hasUnsavedChanges) {
        setUiModal({
            show: true,
            type: 'confirm',
            title: 'Unsaved Changes',
            message: 'You have unsaved changes. Are you sure you want to close?',
            onConfirm: () => {
                closeLocationModal(true);
                closeUiModal();
            }
        });
    } else {
        closeLocationModal(true);
    }
  };

  const closeLocationModal = (force = false) => {
    if (!force && hasUnsavedChanges) return;

    setIsLocationModalOpen(false);
    setEditingLocation(null);
    setHasUnsavedChanges(false);
    setLocationForm({ location: "", reviewer_id: "" });
  };

  const itemsPerPage = 10;
  const filteredUsers = users.filter((u) =>
    `${u.full_name} ${u.user_id} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const reviewers = users.filter(u => u.role === 'reviewer');

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                User Management
            </h2>
            <p className="text-gray-500 text-sm">Manage system access, roles, and assignments.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setIsUserModalOpen(true); setHasUnsavedChanges(false); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
          <button
            onClick={() => { setIsLocationModalOpen(true); setHasUnsavedChanges(false); }}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <MapPin className="w-4 h-4" /> Locations
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
                <tr>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Office / Unit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500">Loading users...</td></tr>
                ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500">No users found matching your search.</td></tr>
                ) : (
                paginatedUsers.map((user) => {
                    const loc = locations.find(l => l.id === user.office_location_id);
                    
                    return (
                    <tr key={user.public_id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-3 font-mono text-gray-600">{user.user_id}</td>
                        <td className="px-6 py-3 font-medium text-gray-900">
                            {user.full_name}
                            <div className="text-xs text-gray-400 font-normal">{user.email}</div>
                        </td>
                        <td className="px-6 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                user.role === 'reviewer' ? 'bg-orange-100 text-orange-800' : 
                                'bg-green-100 text-green-800'}`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="px-6 py-3 text-gray-600">{user.position_id || <span className="text-gray-300 italic">None</span>}</td>
                        <td className="px-6 py-3 text-gray-600">{loc ? loc.location : <span className="text-gray-300 italic">None</span>}</td>
                        <td className="px-6 py-3">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {user.is_active ? "Active" : "Inactive"}
                        </td>
                        <td className="px-6 py-3 text-right space-x-2">
                            <button onClick={() => handleEditUser(user)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                                <Edit2 className="w-4 h-4 inline" />
                            </button>
                            <button onClick={() => handleDeleteUser(user)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4 inline" />
                            </button>
                        </td>
                    </tr>
                    );
                })
                )}
            </tbody>
            </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => (
            <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white border hover:bg-gray-50 text-gray-600"}`}
            >
                {i + 1}
            </button>
            ))}
        </div>
      )}

      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">{editingUser ? "Edit User Details" : "Create New User"}</h3>
              <button onClick={attemptCloseUserModal} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleUserSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-[-10px]">Account</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID / Employee No.</label>
                <input
                  required
                  value={formData.user_id}
                  onChange={(e) => handleInputChange(setFormData, formData, "user_id", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. EMP-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange(setFormData, formData, "role", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="employee">Employee</option>
                  <option value="reviewer">Reviewer (Provincial Officer)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="md:col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-2 mb-[-10px]">Personal Information</div>
              <div className="md:col-span-2 grid grid-cols-3 gap-3">
                  <input
                    placeholder="First Name"
                    required
                    value={formData.first_name}
                    onChange={(e) => handleInputChange(setFormData, formData, "first_name", e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    placeholder="Middle Name (Opt)"
                    value={formData.middle_name}
                    onChange={(e) => handleInputChange(setFormData, formData, "middle_name", e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    placeholder="Last Name"
                    required
                    value={formData.last_name}
                    onChange={(e) => handleInputChange(setFormData, formData, "last_name", e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange(setFormData, formData, "email", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  value={formData.contact_no}
                  onChange={(e) => handleInputChange(setFormData, formData, "contact_no", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-2 mb-[-10px]">Assignments</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Position</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Administrative Officer"
                  value={formData.position_id}
                  onChange={(e) => handleInputChange(setFormData, formData, "position_id", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office Location</label>
                <select
                  value={formData.office_location_id}
                  onChange={(e) => handleInputChange(setFormData, formData, "office_location_id", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Select Location --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t">
                <button type="button" onClick={attemptCloseUserModal} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-md transition-colors">
                    {editingUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold">Manage Locations</h3>
              <button onClick={attemptCloseLocationModal} className="text-white/70 hover:text-white"><X className="w-5 h-5"/></button>
            </div>

            <div className="p-5 max-h-[70vh] flex flex-col">
                <form onSubmit={handleLocationSubmit} className="space-y-3 mb-6 border-b border-gray-100 pb-6">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Office Name</label>
                        <input
                            required
                            placeholder="e.g. Santiago City Field Office"
                            value={locationForm.location}
                            onChange={(e) => handleInputChange(setLocationForm, locationForm, "location", e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Assigned Reviewer</label>
                        <select
                            value={locationForm.reviewer_id}
                            onChange={(e) => handleInputChange(setLocationForm, locationForm, "reviewer_id", e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                        >
                            <option value="">-- No Reviewer Assigned --</option>
                            {reviewers.map(r => (
                                <option key={r.id} value={r.id}>{r.full_name}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-400 mt-1">Only users with 'Reviewer' role appear here.</p>
                    </div>
                    <button className={`w-full py-2 rounded-md text-sm font-semibold text-white shadow-sm transition-colors mt-2 ${editingLocation ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"}`}>
                        {editingLocation ? "Update Location" : "Add Location"}
                    </button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {locations.length === 0 && <p className="text-center text-xs text-gray-400 py-4">No locations added yet.</p>}
                    {locations.map((loc) => {
                        const revName = users.find(u => u.id === loc.reviewer_id)?.full_name || "Unassigned";
                        return (
                            <div key={loc.id} className="group flex justify-between items-start p-3 bg-gray-50 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
                                <div>
                                    <div className="font-medium text-sm text-gray-800">{loc.location}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Briefcase className="w-3 h-3"/> {revName}
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditLocation(loc)} className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded"><Edit2 className="w-3 h-3"/></button>
                                    <button onClick={() => handleDeleteLocation(loc)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3"/></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>
        </div>
      )}

      {uiModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                <div className={`p-6 flex flex-col items-center text-center ${uiModal.type === 'error' ? 'bg-red-50' : uiModal.type === 'success' ? 'bg-green-50' : 'bg-white'}`}>
                    {uiModal.type === 'success' && <CheckCircle className="w-12 h-12 text-green-500 mb-3" />}
                    {uiModal.type === 'error' && <AlertCircle className="w-12 h-12 text-red-500 mb-3" />}
                    {uiModal.type === 'confirm' && <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />}
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{uiModal.title}</h3>
                    <p className="text-sm text-gray-600 mb-6">{uiModal.message}</p>
                    
                    <div className="flex gap-3 w-full justify-center">
                        {uiModal.type === 'confirm' ? (
                            <>
                                <button 
                                    onClick={closeUiModal} 
                                    className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Continue Editing
                                </button>
                                <button 
                                    onClick={uiModal.onConfirm} 
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    Confirm
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={uiModal.onConfirm || closeUiModal} 
                                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}