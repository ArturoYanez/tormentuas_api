
import React, { useState } from 'react';
import { Bell, Trophy, DollarSign, TrendingUp, AlertCircle, CheckCircle, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Notification {
  id: number;
  type: 'tournament' | 'trade' | 'deposit' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: React.ComponentType<any>;
  color: string;
}

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'tournament',
      title: 'Weekly Challenge Started!',
      message: 'The Weekly Challenge tournament has begun. Join now!',
      timestamp: '2 min ago',
      read: false,
      icon: Trophy,
      color: 'text-yellow-400'
    },
    {
      id: 2,
      type: 'trade',
      title: 'Trade Executed',
      message: 'Your EUR/USD trade was executed at 1.0842',
      timestamp: '15 min ago',
      read: false,
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      id: 3,
      type: 'deposit',
      title: 'Deposit Confirmed',
      message: '€250.00 has been added to your account',
      timestamp: '1 hour ago',
      read: true,
      icon: DollarSign,
      color: 'text-blue-400'
    },
    {
      id: 4,
      type: 'alert',
      title: 'Price Alert',
      message: 'BTC reached your target price of $45,000',
      timestamp: '2 hours ago',
      read: true,
      icon: AlertCircle,
      color: 'text-orange-400'
    },
    {
      id: 5,
      type: 'tournament',
      title: 'Tournament Reminder',
      message: 'Elite Championship starts in 24 hours',
      timestamp: '3 hours ago',
      read: true,
      icon: Trophy,
      color: 'text-purple-400'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 bg-gradient-to-br from-gray-700/40 to-gray-800/40 rounded-lg border border-gray-600/50 hover:border-blue-400/50 transition-all duration-300 backdrop-blur-sm hover:bg-gradient-to-br hover:from-blue-600/20 hover:to-purple-600/20 group">
          <Bell className="text-gray-300 group-hover:text-white transition-colors w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg font-bold border border-[#0a0a1a] animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-96 bg-gradient-to-br from-[#23263A] to-[#1A1C2E] border-gray-600/50 shadow-2xl backdrop-blur-xl" 
        align="end"
        sideOffset={8}
      >
        <div className="p-4 border-b border-gray-600/50">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20"
              >
                Mark all read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-gray-400 text-sm mt-1">{unreadCount} unread notifications</p>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-all duration-200 focus:bg-transparent ${!notification.read ? 'bg-gradient-to-r from-blue-600/20 to-transparent border-l-2 border-blue-400 hover:from-blue-600/30' : 'hover:bg-gray-700/40'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className={`p-2 rounded-lg bg-gray-800/60 ${notification.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold text-sm ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-gray-600/50" />
            <div className="p-3">
              <Button 
                variant="ghost" 
                className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-600/20"
                size="sm"
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
