import React, { useState, useEffect } from "react";

function ProfileForm({ user, isEditing, onSave, onCancel }) {
  const [formData, setFormData] = useState({ name: "", bio: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || "", bio: user.bio || "" });
    }
  }, [user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // onSave is a function passed from the parent that will handle the API call
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="mb-3">Profile Information</h5>
        <form>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={user?.email || ""}
                readOnly
                disabled
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="bio" className="form-label">
              Bio
            </label>
            <textarea
              className="form-control"
              id="bio"
              rows="3"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
            ></textarea>
          </div>
          {isEditing && (
            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-success"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-light"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ProfileForm;
