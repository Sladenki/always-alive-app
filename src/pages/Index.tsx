import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppStateProvider } from '@/contexts/AppStateContext';
import AuthSheet from '@/components/AuthSheet';
import BottomNav from '@/components/BottomNav';
import MatchFlowOverlay from '@/components/MatchFlowOverlay';
import FeedPage from '@/pages/FeedPage';
import MapPage from '@/pages/MapPage';
import EventDetailPage from '@/pages/EventDetailPage';
import MyEventsPage from '@/pages/MyEventsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ProfilePage from '@/pages/ProfilePage';
import { mockEvents } from '@/data/mockData';

const Index = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [matchEventId, setMatchEventId] = useState<string | null>(null);

  const handleEventClick = (id: string) => {
    setSelectedEventId(id);
  };

  const handleBack = () => {
    setSelectedEventId(null);
  };

  const matchEvent = matchEventId ? mockEvents.find((e) => e.id === matchEventId) : undefined;

  const renderContent = () => {
    if (selectedEventId) {
      return (
        <EventDetailPage
          eventId={selectedEventId}
          onBack={handleBack}
          onMatchOpen={(id) => setMatchEventId(id)}
        />
      );
    }
    switch (activeTab) {
      case 'feed': return <FeedPage onEventClick={handleEventClick} />;
      case 'map': return <MapPage onEventClick={handleEventClick} />;
      case 'myevents': return <MyEventsPage onEventClick={handleEventClick} />;
      case 'notifications': return <NotificationsPage onOpenMatch={(id) => setMatchEventId(id)} />;
      case 'profile': return <ProfilePage onNavigateToFeed={() => setActiveTab('feed')} />;
      default: return <FeedPage onEventClick={handleEventClick} />;
    }
  };

  return (
    <AuthProvider>
      <AppStateProvider>
        <div className="min-h-screen bg-background">
          {renderContent()}
          {matchEvent && (
            <MatchFlowOverlay event={matchEvent} open onClose={() => setMatchEventId(null)} />
          )}
          <BottomNav activeTab={activeTab} onTabChange={(tab) => { setSelectedEventId(null); setActiveTab(tab); }} />
          <AuthSheet />
        </div>
      </AppStateProvider>
    </AuthProvider>
  );
};

export default Index;
