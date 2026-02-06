
import React from 'react';
import { Shield, X, Check, AlertCircle, Lock, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerificationStatus } from '@/components/sections/AccountSection';

interface ProfileData {
  verification: {
    identity: VerificationStatus;
    address: VerificationStatus;
    phone: VerificationStatus;
  };
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  loginAlerts: boolean;
}

interface SecurityProps {
  profileData: ProfileData;
  securitySettings: SecuritySettings;
  handleVerifyAccount: () => void;
  setSecuritySettings: React.Dispatch<React.SetStateAction<SecuritySettings>>;
  setActiveSection: (section: string) => void;
}

const Security: React.FC<SecurityProps> = ({
  profileData,
  securitySettings,
  handleVerifyAccount,
  setSecuritySettings,
  setActiveSection
}) => {

  const overallStatus: VerificationStatus | 'pending' = Object.values(profileData.verification).every(s => s === 'verified') 
    ? 'verified' 
    : Object.values(profileData.verification).some(s => s === 'pending') 
    ? 'pending' 
    : 'unverified';

  const isButtonDisabled = overallStatus === 'pending' || overallStatus === 'verified';

  const VerificationItem = ({ label, status }: { label: string, status: VerificationStatus }) => {
    const statusConfig = {
      verified: { icon: Check, color: 'text-green-400', text: 'Verified' },
      pending: { icon: Clock, color: 'text-yellow-400', text: 'Pending' },
      unverified: { icon: X, color: 'text-red-400', text: 'Unverified' },
    };
    const { icon: Icon, color } = statusConfig[status];
    return (
      <div className="flex items-center justify-between">
        <span className="text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color} ${status === 'pending' ? 'animate-spin' : ''}`} />
          <span className={`font-semibold ${color}`}>{statusConfig[status].text}</span>
        </div>
      </div>
    );
  };


  return (
    <Card className="bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-gray-600/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-2xl">
            <Shield className="w-6 h-6 text-purple-400" />
            Security & Verification
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-700/30 border-gray-600/50">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                {overallStatus === 'verified' && <Check className="w-5 h-5 text-green-400" />}
                {overallStatus === 'pending' && <Clock className="w-5 h-5 text-yellow-400 animate-spin" />}
                {overallStatus === 'unverified' && <AlertCircle className="w-5 h-5 text-red-400" />}
                Account Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <VerificationItem label="Identity Verified" status={profileData.verification.identity} />
                <VerificationItem label="Address Verified" status={profileData.verification.address} />
                <VerificationItem label="Phone Verified" status={profileData.verification.phone} />
                
                <Button 
                  onClick={handleVerifyAccount} 
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all"
                  disabled={isButtonDisabled}
                >
                  {overallStatus === 'unverified' && 'Start Verification'}
                  {overallStatus === 'pending' && 'Verification Pending...'}
                  {overallStatus === 'verified' && 'Account Verified'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-700/30 border-gray-600/50">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Two-Factor Authentication</span>
                  <button
                    onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
                    className={`w-12 h-6 rounded-full transition-colors ${securitySettings.twoFactorAuth ? 'bg-green-600' : 'bg-gray-600'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${securitySettings.twoFactorAuth ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Email Notifications</span>
                  <button
                    onClick={() => setSecuritySettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                    className={`w-12 h-6 rounded-full transition-colors ${securitySettings.emailNotifications ? 'bg-green-600' : 'bg-gray-600'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${securitySettings.emailNotifications ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Login Alerts</span>
                  <button
                    onClick={() => setSecuritySettings(prev => ({ ...prev, loginAlerts: !prev.loginAlerts }))}
                    className={`w-12 h-6 rounded-full transition-colors ${securitySettings.loginAlerts ? 'bg-green-600' : 'bg-gray-600'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${securitySettings.loginAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default Security;
