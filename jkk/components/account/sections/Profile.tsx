
import React from 'react';
import { User, Save, X, Edit, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
}

interface ProfileProps {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  handleSaveProfile: () => void;
  setActiveSection: (section: string) => void;
}

const Profile: React.FC<ProfileProps> = ({
  profileData,
  setProfileData,
  isEditing,
  setIsEditing,
  handleSaveProfile,
  setActiveSection,
}) => {
  return (
    <Card className="bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-gray-600/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-2xl">
            <User className="w-6 h-6 text-blue-400" />
            Profile Settings
          </CardTitle>
          <Button
            onClick={() => setActiveSection('overview')}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <label htmlFor="profile-picture-upload" className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 hover:bg-green-600 transition-colors cursor-pointer">
              <Camera className="w-3 h-3 text-white" />
              <input id="profile-picture-upload" type="file" className="hidden" accept="image/*" />
            </label>
          </div>
          <div>
            <h3 className="text-white text-xl font-bold">{profileData.name}</h3>
            <p className="text-gray-400">{profileData.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
            {isEditing ? (
              <Input
                id="fullName"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            ) : (
              <div className="text-white font-semibold p-2 bg-gray-700/30 rounded h-10 flex items-center">{profileData.name}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email Address</Label>
            {isEditing ? (
              <Input
                id="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            ) : (
              <div className="text-white font-semibold p-2 bg-gray-700/30 rounded h-10 flex items-center">{profileData.email}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
            {isEditing ? (
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            ) : (
              <div className="text-white font-semibold p-2 bg-gray-700/30 rounded h-10 flex items-center">{profileData.phone}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob" className="text-gray-300">Date of Birth</Label>
            {isEditing ? (
              <Input
                id="dob"
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            ) : (
              <div className="text-white font-semibold p-2 bg-gray-700/30 rounded h-10 flex items-center">{profileData.dateOfBirth}</div>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address" className="text-gray-300">Address</Label>
            {isEditing ? (
              <Input
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            ) : (
              <div className="text-white font-semibold p-2 bg-gray-700/30 rounded h-10 flex items-center">{profileData.address}</div>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          {isEditing ? (
            <>
              <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" className="border-gray-600 text-gray-300">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Profile;
