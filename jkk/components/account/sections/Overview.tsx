import React from 'react';
import { User, CreditCard, Shield, Edit, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerificationStatus } from '@/components/sections/AccountSection';

interface ProfileData {
  name: string;
  email: string;
  accountType: string;
  balance: number;
  verification: {
    identity: VerificationStatus;
    address: VerificationStatus;
    phone: VerificationStatus;
  };
}

interface OverviewProps {
  profileData: ProfileData;
  setActiveSection: (section: string) => void;
}

const Overview: React.FC<OverviewProps> = ({ profileData, setActiveSection }) => {
  const isVerified = Object.values(profileData.verification).every(status => status === 'verified');
  const verificationText = isVerified ? 'Verified' : 'Not Verified';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-gray-600/50 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm">Name</label>
            <div className="text-white font-semibold">{profileData.name}</div>
          </div>
          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <div className="text-white font-semibold">{profileData.email}</div>
          </div>
          <div>
            <label className="text-gray-300 text-sm">Account Type</label>
            <div className="text-green-400 font-semibold">{profileData.accountType}</div>
          </div>
          <Button 
            onClick={() => setActiveSection('profile')}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-gray-600/50 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-400" />
            Balance & Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm">Current Balance</label>
            <div className="text-white font-bold text-2xl">€{profileData.balance.toFixed(2)}</div>
          </div>
          <div>
            <label className="text-gray-300 text-sm">Total Profit</label>
            <div className="text-green-400 font-semibold">+€124.50</div>
          </div>
          <div>
            <label className="text-gray-300 text-sm">Total Trades</label>
            <div className="text-white font-semibold">47</div>
          </div>
          <Button 
            onClick={() => setActiveSection('transactions')}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Transactions
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-gray-600/50 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Account Verification</span>
            <span className={`font-semibold ${isVerified ? 'text-green-400' : 'text-red-400'}`}>
              {verificationText}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Two-Factor Auth</span>
            <span className="text-green-400 font-semibold">Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Password</span>
            <span className="text-gray-500">••••••••</span>
          </div>
          <Button 
            onClick={() => setActiveSection('security')}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            <Shield className="w-4 h-4 mr-2" />
            Security Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
