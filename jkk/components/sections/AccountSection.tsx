
import React, { useState } from 'react';
import { Settings, Edit, Eye, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

import OverviewSection from '../account/sections/Overview';
import ProfileSection from '../account/sections/Profile';
import TransactionsSection from '../account/sections/Transactions';
import SecuritySection from '../account/sections/Security';
import PreferencesSection from '../account/sections/Preferences';

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

const AccountSection = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Trading Street, New York, NY 10001',
    dateOfBirth: '1990-05-15',
    accountType: 'LIVE ACCOUNT',
    balance: 10000.35,
    verification: {
      identity: 'unverified' as VerificationStatus,
      address: 'unverified' as VerificationStatus,
      phone: 'unverified' as VerificationStatus,
    }
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true
  });

  const transactions = [
    { id: 1, type: 'deposit', amount: 1000, currency: 'USD', date: '2024-01-15', status: 'completed', method: 'Credit Card' },
    { id: 2, type: 'trade', amount: -50, currency: 'USD', date: '2024-01-14', status: 'completed', method: 'EUR/USD Trade' },
    { id: 3, type: 'profit', amount: 125, currency: 'USD', date: '2024-01-14', status: 'completed', method: 'Trade Profit' },
    { id: 4, type: 'withdrawal', amount: -200, currency: 'USD', date: '2024-01-13', status: 'pending', method: 'Bank Transfer' },
    { id: 5, type: 'deposit', amount: 500, currency: 'USD', date: '2024-01-12', status: 'completed', method: 'PayPal' },
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleVerifyAccount = () => {
    setProfileData(prev => ({ 
      ...prev, 
      verification: {
        identity: 'pending',
        address: 'pending',
        phone: 'pending',
      }
    }));

    toast({
      title: "Verification in Progress",
      description: "Your documents are being reviewed. This may take a few minutes.",
    });

    setTimeout(() => {
      setProfileData(prev => ({ 
        ...prev, 
        verification: {
          identity: 'verified',
          address: 'verified',
          phone: 'verified',
        }
      }));
      toast({
        title: "Account Verified!",
        description: "Your account has been successfully verified.",
      });
    }, 5000); // 5-second delay to simulate review
  };

  const renderActiveComponent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection 
          profileData={profileData} 
          setProfileData={setProfileData}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleSaveProfile={handleSaveProfile}
          setActiveSection={setActiveSection} 
        />;
      case 'transactions':
        return <TransactionsSection transactions={transactions} setActiveSection={setActiveSection} />;
      case 'security':
        return <SecuritySection 
          profileData={profileData}
          securitySettings={securitySettings}
          setSecuritySettings={setSecuritySettings}
          handleVerifyAccount={handleVerifyAccount}
          setActiveSection={setActiveSection}
        />;
      case 'preferences':
        return <PreferencesSection setActiveSection={setActiveSection} />;
      case 'overview':
      default:
        return (
          <>
            <OverviewSection profileData={profileData} setActiveSection={setActiveSection} />
            <div className="mt-8">
              <Card className="bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-gray-600/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3 text-2xl">
                    <Settings className="w-8 h-8 text-orange-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      onClick={() => setActiveSection('profile')}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-16"
                    >
                      <div className="flex flex-col items-center">
                        <Edit className="w-5 h-5 mb-1" />
                        <span>Edit Profile</span>
                      </div>
                    </Button>
                    <Button 
                      onClick={() => setActiveSection('transactions')}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-16"
                    >
                      <div className="flex flex-col items-center">
                        <Eye className="w-5 h-5 mb-1" />
                        <span>Transactions</span>
                      </div>
                    </Button>
                    <Button 
                      onClick={() => setActiveSection('security')}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 h-16"
                    >
                      <div className="flex flex-col items-center">
                        <Shield className="w-5 h-5 mb-1" />
                        <span>Security</span>
                      </div>
                    </Button>
                    <Button 
                      onClick={() => setActiveSection('preferences')}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-16"
                    >
                      <div className="flex flex-col items-center">
                        <Settings className="w-5 h-5 mb-1" />
                        <span>Preferences</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-[#131722] to-[#1a1e2e]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
            Account Management
          </h1>
          <p className="text-gray-300 text-lg">Manage your trading account and preferences</p>
        </div>

        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default AccountSection;
