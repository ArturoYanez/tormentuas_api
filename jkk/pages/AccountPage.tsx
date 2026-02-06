
import React from 'react';
import AccountSection from '@/components/sections/AccountSection';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AccountPage = () => {
  return (
    <div className="bg-[#131722] min-h-screen text-white">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-800 bg-[#131722]/80 backdrop-blur-sm px-6">
        <Button asChild variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300">
          <Link to="/platform" className='flex items-center'>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Platform
          </Link>
        </Button>
      </header>
      <AccountSection />
    </div>
  );
};

export default AccountPage;
