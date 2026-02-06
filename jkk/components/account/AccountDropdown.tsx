
import React from 'react';
import { ChevronDown, User, Settings, LogOut, Wallet, TrendingUp, HelpCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Link } from 'react-router-dom';

interface AccountDropdownProps {
  balance: number;
  accountType: 'live' | 'demo';
  onAccountTypeChange: (type: 'live' | 'demo') => void;
}

const AccountDropdown = ({ balance, accountType, onAccountTypeChange }: AccountDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-800/20 via-green-800/20 to-emerald-800/20 border border-green-500/40 px-4 py-2 rounded-lg backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-green-400/60 group relative overflow-hidden">
          <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-[spin_4s_linear_infinite]"></div>
          <div className="relative flex flex-col">
            <div className="text-green-400 text-xs font-bold uppercase tracking-wider">
              {accountType === 'live' ? 'LIVE ACCOUNT' : 'DEMO ACCOUNT'}
            </div>
            <div className="text-white font-black text-sm">
              €{balance.toFixed(2)}
            </div>
          </div>
          <ChevronDown className="relative text-gray-300 group-hover:text-white transition-colors w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-gray-600/50 shadow-2xl backdrop-blur-xl" 
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-white font-bold text-lg px-4 py-3">
          Account Settings
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-gray-600/50" />
        
        <div className="p-2">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 px-2">
            Account Type
          </div>
          <DropdownMenuItem 
            onClick={() => onAccountTypeChange('live')}
            className={`cursor-pointer hover:bg-gray-700/30 focus:bg-gray-700/30 rounded-lg transition-all duration-200 ${accountType === 'live' ? 'bg-green-600/20 border border-green-400/30 ring-2 ring-green-500/50' : ''}`}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 rounded-lg bg-green-600/20">
                <Wallet className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">Live Account</div>
                <div className="text-gray-400 text-xs">Trade with real money</div>
              </div>
              {accountType === 'live' && (
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onAccountTypeChange('demo')}
            className={`cursor-pointer hover:bg-gray-700/30 focus:bg-gray-700/30 rounded-lg transition-all duration-200 ${accountType === 'demo' ? 'bg-blue-600/20 border border-blue-400/30 ring-2 ring-blue-500/50' : ''}`}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 rounded-lg bg-blue-600/20">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">Demo Account</div>
                <div className="text-gray-400 text-xs">Practice with virtual money</div>
              </div>
              {accountType === 'demo' && (
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              )}
            </div>
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator className="bg-gray-600/50" />
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-700/30 focus:bg-gray-700/30">
          <Link to="/account">
            <User className="w-4 h-4 text-gray-400 mr-3" />
            <span className="text-white">Profile Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-700/30 focus:bg-gray-700/30">
          <Link to="/account">
            <Settings className="w-4 h-4 text-gray-400 mr-3" />
            <span className="text-white">Account Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-700/30 focus:bg-gray-700/30">
          <Link to="/support">
            <HelpCircle className="w-4 h-4 text-gray-400 mr-3" />
            <span className="text-white">Help & Support</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-gray-600/50" />
        
        <DropdownMenuItem className="cursor-pointer hover:bg-red-600/20 focus:bg-red-600/20 text-red-400">
          <LogOut className="w-4 h-4 mr-3" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountDropdown;
