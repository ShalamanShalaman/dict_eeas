import { useState, useEffect } from "react";
import { MapPin, Briefcase, Plus, X, Edit2, Trash2, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function LocationManagement() {
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isGlobalHoursModalOpen, setIsGlobalHoursModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const [uiModal, setUiModal] = useState({ show: false, type: '', title: '', message: '', onConfirm: null });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [locationForm, setLocationForm] = useState({
    location: "",
    reviewer_id: "",
    am_in: "",
    am_out: "",
    pm_in: "",
    pm_out: ""
  });

  const [globalHoursForm, setGlobalHoursForm] = useState({
    am_in: "",
    am_out: "",
    pm_in: "",
    pm_out: ""
  });

  const API_BASE_URL = "";
  const API_URL = `${API_BASE_URL}/api`;

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    fetchLocations();
    fetchUsers();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/locations`);
      const data = await res.json();
      setLocations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`);
      const data = await res.json();
      setUsers(data);
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

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingLocation
        ? `${API_URL}/admin/edit-location/${editingLocation.id}`
        : `${API_URL}/admin/create-location`;
      const method = editingLocation ? "PUT" : "POST";

      const payload = {
        ...locationForm,
        action_by: currentUser?.user_id || currentUser?.id
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (res.ok) {
        fetchLocations();
        if (editingLocation) {
            closeLocationModal(true);
            setUiModal({ show: true, type: 'success', title: 'Success', message: 'Location updated successfully', onConfirm: () => closeUiModal() });
        } else {
            setLocationForm({ location: "", reviewer_id: "", am_in: "", am_out: "", pm_in: "", pm_out: "" });
            setHasUnsavedChanges(false);
            setIsLocationModalOpen(false);
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

  const handleGlobalHoursSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...globalHoursForm,
        action_by: currentUser?.user_id || currentUser?.id
      };

      const res = await fetch(`${API_URL}/admin/update-global-hours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (res.ok) {
        fetchLocations();
        closeGlobalHoursModal(true);
        setUiModal({ show: true, type: 'success', title: 'Success', message: 'Global hours updated successfully for all locations', onConfirm: () => closeUiModal() });
      } else {
        setUiModal({ show: true, type: 'error', title: 'Error', message: result.error || "Failed to update global hours", onConfirm: () => closeUiModal() });
      }
    } catch (error) {
      console.error(error);
      setUiModal({ show: true, type: 'error', title: 'Error', message: 'Server error', onConfirm: () => closeUiModal() });
    }
  };

  const handleEditLocation = (loc) => {
    setEditingLocation(loc);
    setLocationForm({ 
      location: loc.location, 
      reviewer_id: loc.reviewer_id || "",
      am_in: loc.am_in || "",
      am_out: loc.am_out || "",
      pm_in: loc.pm_in || "",
      pm_out: loc.pm_out || ""
    });
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
                const actionBy = currentUser?.user_id || currentUser?.id || '';
                const res = await fetch(`${API_URL}/admin/delete-location/${loc.id}?action_by=${actionBy}`, {
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
    setLocationForm({ location: "", reviewer_id: "", am_in: "", am_out: "", pm_in: "", pm_out: "" });
  };

  const attemptCloseGlobalHoursModal = () => {
    if (hasUnsavedChanges) {
        setUiModal({
            show: true,
            type: 'confirm',
            title: 'Unsaved Changes',
            message: 'You have unsaved changes. Are you sure you want to close?',
            onConfirm: () => {
                closeGlobalHoursModal(true);
                closeUiModal();
            }
        });
    } else {
        closeGlobalHoursModal(true);
    }
  };

  const closeGlobalHoursModal = (force = false) => {
    if (!force && hasUnsavedChanges) return;

    setIsGlobalHoursModalOpen(false);
    setHasUnsavedChanges(false);
    setGlobalHoursForm({ am_in: "", am_out: "", pm_in: "", pm_out: "" });
  };

  const reviewers = users.filter(u => u.role === 'reviewer');

  const formatTime = (t) => {
    if(!t) return '';
    let [h, m] = t.split(':');
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                Office Locations
            </h2>
            <p className="text-gray-500 text-sm">Manage office locations and working hours.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setIsGlobalHoursModalOpen(true); setHasUnsavedChanges(false); }}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Clock className="w-4 h-4" /> Global Schedule
          </button>
          <button
            onClick={() => { setIsLocationModalOpen(true); setHasUnsavedChanges(false); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Location
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
                <tr>
                <th className="px-6 py-4">Office Name</th>
                <th className="px-6 py-4">Assigned Reviewer</th>
                <th className="px-6 py-4 text-center">AM Schedule</th>
                <th className="px-6 py-4 text-center">PM Schedule</th>
                <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading locations...</td></tr>
                ) : locations.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">No locations added yet.</td></tr>
                ) : (
                locations.map((loc) => {
                    const revName = users.find(u => u.id === loc.reviewer_id)?.full_name || <span className="text-gray-400 italic">Unassigned</span>;
                    
                    return (
                    <tr key={loc.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4 font-medium text-gray-900">{loc.location}</td>
                        <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            {revName}
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-gray-600">
                            {loc.am_in && loc.am_out ? `${formatTime(loc.am_in)} - ${formatTime(loc.am_out)}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-gray-600">
                            {loc.pm_in && loc.pm_out ? `${formatTime(loc.pm_in)} - ${formatTime(loc.pm_out)}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                            <button onClick={() => handleEditLocation(loc)} className="text-gray-400 hover:text-amber-600 transition-colors" title="Edit">
                                <Edit2 className="w-4 h-4 inline" />
                            </button>
                            <button onClick={() => handleDeleteLocation(loc)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete">
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

      {isGlobalHoursModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-lg">Global Schedule</h3>
              </div>
              <button onClick={attemptCloseGlobalHoursModal} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
            </div>

            <div className="p-6">
                <p className="text-sm text-gray-500 mb-5">
                    Setting the global schedule will instantly update the standard working hours for <strong>all</strong> existing office locations.
                </p>
                <form onSubmit={handleGlobalHoursSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">AM IN</label>
                            <input type="time" value={globalHoursForm.am_in} onChange={(e) => handleInputChange(setGlobalHoursForm, globalHoursForm, "am_in", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">AM OUT</label>
                            <input type="time" value={globalHoursForm.am_out} onChange={(e) => handleInputChange(setGlobalHoursForm, globalHoursForm, "am_out", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">PM IN</label>
                            <input type="time" value={globalHoursForm.pm_in} onChange={(e) => handleInputChange(setGlobalHoursForm, globalHoursForm, "pm_in", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">PM OUT</label>
                            <input type="time" value={globalHoursForm.pm_out} onChange={(e) => handleInputChange(setGlobalHoursForm, globalHoursForm, "pm_out", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-gray-100">
                      <button type="button" onClick={attemptCloseGlobalHoursModal} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">
                          Cancel
                      </button>
                      <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
                          Apply to All
                      </button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}

      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingLocation ? "Edit Location" : "Add Location"}</h3>
              <button onClick={attemptCloseLocationModal} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
            </div>

            <div className="p-6">
                <form onSubmit={handleLocationSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Office Name</label>
                        <input
                            required
                            placeholder="e.g. Santiago City Field Office"
                            value={locationForm.location}
                            onChange={(e) => handleInputChange(setLocationForm, locationForm, "location", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Assigned Reviewer</label>
                        <select
                            value={locationForm.reviewer_id}
                            onChange={(e) => handleInputChange(setLocationForm, locationForm, "reviewer_id", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">-- No Reviewer Assigned --</option>
                            {reviewers.map(r => (
                                <option key={r.id} value={r.id}>{r.full_name}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-400 mt-1">Only users with 'Reviewer' role appear here.</p>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Local Office Hours Overrides</label>
                        <p className="text-[10px] text-gray-400 mb-3">Set specific hours for this location (overrides the global schedule).</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">AM IN</label>
                                <input type="time" value={locationForm.am_in} onChange={(e) => handleInputChange(setLocationForm, locationForm, "am_in", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">AM OUT</label>
                                <input type="time" value={locationForm.am_out} onChange={(e) => handleInputChange(setLocationForm, locationForm, "am_out", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">PM IN</label>
                                <input type="time" value={locationForm.pm_in} onChange={(e) => handleInputChange(setLocationForm, locationForm, "pm_in", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">PM OUT</label>
                                <input type="time" value={locationForm.pm_out} onChange={(e) => handleInputChange(setLocationForm, locationForm, "pm_out", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button type="button" onClick={attemptCloseLocationModal} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">
                          Cancel
                      </button>
                      <button type="submit" className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors ${editingLocation ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"}`}>
                          {editingLocation ? "Update Location" : "Add Location"}
                      </button>
                    </div>
                </form>
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