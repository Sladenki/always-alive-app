import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthSheet from '@/components/AuthSheet';
import BottomNav from '@/components/BottomNav';
import FeedPage from '@/pages/FeedPage';
import MapPage from '@/pages/MapPage';
import EventDetailPage from '@/pages/EventDetailPage';
import MyEventsPage from '@/pages/MyEventsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ProfilePage from '@/pages/ProfilePage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleEventClick = (id: string) => {
    setSelectedEventId(id);
  };

  const handleBack = () => {
    setSelectedEventId(null);
  };

  const renderContent = () => {
    if (selectedEventId) {
      return <EventDetailPage eventId={selectedEventId} onBack={handleBack} />;
    }

    switch (activeTab) {
      case 'feed':
        return <FeedPage onEventClick={handleEventClick} />;
      case 'map':
        return <MapPage onEventClick={handleEventClick} />;
      case 'myevents':
        return <MyEventsPage onEventClick={handleEventClick} />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <ProfilePage onNavigateToFeed={() => setActiveTab('feed')} />;
      default:
        return <FeedPage onEventClick={handleEventClick} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        {renderContent()}
        <BottomNav activeTab={activeTab} onTabChange={(tab) => { setSelectedEventId(null); setActiveTab(tab); }} />
        <AuthSheet />
      </div>
    </AuthProvider>
  );
};

export default Index;
