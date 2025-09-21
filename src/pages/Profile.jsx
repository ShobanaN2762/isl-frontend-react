import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileForm from '../components/profile/ProfileForm';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = async (formData) => {
    // In a real app, you would make an API call here.
    // For now, we'll simulate it and update the context.
    console.log("Saving profile data:", formData);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    updateUser(formData); // Update the user in the global context
    setIsEditing(false); // Exit edit mode
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (!user) {
    return <div className="container py-5">Loading profile...</div>;
  }

  return (
    <div className="container my-4">
      <ProfileHeader 
        user={user} 
        isEditing={isEditing} 
        onEditToggle={setIsEditing} 
      />
      
      <ProfileForm 
        user={user} 
        isEditing={isEditing}
        onSave={handleSaveProfile}
        onCancel={handleCancelEdit}
      />

      {/* We would add other components like <SecuritySettings /> here */}
    </div>
  );
}

export default ProfilePage;