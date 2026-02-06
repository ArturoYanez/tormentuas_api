
import React from 'react';
import { Settings, Download, FileText, Award, Users, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MoreSection = () => {
  const options = [
    {
      icon: Settings,
      title: "Platform Settings",
      description: "Customize your trading experience",
      color: "text-blue-400",
      bgColor: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-400/30"
    },
    {
      icon: Download,
      title: "Download Center",
      description: "Get mobile apps and desktop software",
      color: "text-green-400",
      bgColor: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-400/30"
    },
    {
      icon: FileText,
      title: "Trading Reports",
      description: "View detailed trading history and analytics",
      color: "text-purple-400",
      bgColor: "from-purple-500/20 to-purple-600/20",
      borderColor: "border-purple-400/30"
    },
    {
      icon: Award,
      title: "Achievements",
      description: "Track your trading milestones and badges",
      color: "text-yellow-400",
      bgColor: "from-yellow-500/20 to-yellow-600/20",
      borderColor: "border-yellow-400/30"
    },
    {
      icon: Users,
      title: "Referral Program",
      description: "Invite friends and earn rewards",
      color: "text-orange-400",
      bgColor: "from-orange-500/20 to-orange-600/20",
      borderColor: "border-orange-400/30"
    },
    {
      icon: HelpCircle,
      title: "Help Center",
      description: "FAQs, tutorials, and trading guides",
      color: "text-indigo-400",
      bgColor: "from-indigo-500/20 to-indigo-600/20",
      borderColor: "border-indigo-400/30"
    }
  ];

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-[#131722] to-[#1a1e2e]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            More Options
          </h1>
          <p className="text-gray-300 text-lg">Additional tools and features for your trading journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((option) => (
            <Card key={option.title} className={`bg-gradient-to-br from-[#2C2F42] to-[#23263A] ${option.borderColor} hover:border-opacity-60 transition-all duration-300 cursor-pointer hover:transform hover:scale-105`}>
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${option.bgColor} flex items-center justify-center mb-3`}>
                  <option.icon className={`w-6 h-6 ${option.color}`} />
                </div>
                <CardTitle className="text-white">{option.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{option.description}</p>
                <Button className={`w-full bg-gradient-to-r ${option.bgColor} hover:opacity-80 text-white border ${option.borderColor}`}>
                  Access
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-gray-600/50">
          <CardHeader>
            <CardTitle className="text-white text-center">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                Download App
              </Button>
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                Contact Support
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                View Tutorials
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoreSection;
