import React from "react";
import { formatDate } from "../../utils/helpers";

function ProfileHeader({ user, isEditing, onEditToggle }) {
  if (!user) return null;

  return (
    <div className="card mb-4">
      <div className="card-body d-flex flex-column flex-md-row align-items-center gap-3">
        <div
          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fs-3 fw-bold"
          style={{ width: "80px", height: "80px" }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="text-center text-md-start flex-grow-1">
          <h4 className="mb-0">{user.name}</h4>
          <p className="text-muted mb-1">{user.email}</p>
          <small className="text-muted">
            <i className="fas fa-calendar-alt me-1"></i>Joined{" "}
            {formatDate(user.joinDate || new Date().toISOString())}
          </small>
        </div>
        <div className="ms-auto">
          {!isEditing && (
            <button
              onClick={() => onEditToggle(true)}
              className="btn btn-warning"
            >
              <i className="fas fa-edit me-2"></i>Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
