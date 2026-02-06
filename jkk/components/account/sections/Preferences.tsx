
import React from 'react';
import { Settings, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PreferencesProps {
  setActiveSection: (section: string) => void;
}

const Preferences: React.FC<PreferencesProps> = ({ setActiveSection }) => {
  return (
    <Card className="bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-gray-600/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-2xl">
            <Settings className="w-6 h-6 text-orange-400" />
            Preferences & Settings
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
          <div className="space-y-4">
            <h3 className="text-white text-lg font-bold">Trading Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Risk Level</span>
                <select className="bg-gray-700 text-white rounded px-3 py-1 border border-gray-600">
                  <option>Conservative</option>
                  <option>Moderate</option>
                  <option>Aggressive</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Default Currency</span>
                <select className="bg-gray-700 text-white rounded px-3 py-1 border border-gray-600">
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Chart Theme</span>
                <select className="bg-gray-700 text-white rounded px-3 py-1 border border-gray-600">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>Auto</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white text-lg font-bold">Notification Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Price Alerts</span>
                <button className="w-12 h-6 rounded-full bg-green-600">
                  <div className="w-4 h-4 bg-white rounded-full translate-x-7" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Trade Confirmations</span>
                <button className="w-12 h-6 rounded-full bg-green-600">
                  <div className="w-4 h-4 bg-white rounded-full translate-x-7" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Market News</span>
                <button className="w-12 h-6 rounded-full bg-gray-600">
                  <div className="w-4 h-4 bg-white rounded-full translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-600/50">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Preferences;
