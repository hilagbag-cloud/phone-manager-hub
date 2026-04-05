import { useLocation, useNavigate } from 'react-router-dom';
import { Hammer, Users, MessageSquare, Phone, Settings } from 'lucide-react';

const tabs = [
  { path: '/', label: 'APK', icon: Hammer },
  { path: '/contacts', label: 'Contacts', icon: Users },
  { path: '/sms', label: 'SMS', icon: MessageSquare },
  { path: '/calls', label: 'Appels', icon: Phone },
  { path: '/settings', label: 'Réglages', icon: Settings },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 glass safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
