import { useCallback, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppStateProvider } from '@/contexts/AppStateContext';
import AuthSheet from '@/components/AuthSheet';
import BottomNav from '@/components/BottomNav';
import MatchFlowOverlay from '@/components/MatchFlowOverlay';
import PlaceMatchFlowOverlay from '@/components/PlaceMatchFlowOverlay';
import OpeningSplash from '@/components/OpeningSplash';
import FeedPage from '@/pages/FeedPage';
import MapPage, { type MapIntent } from '@/pages/MapPage';
import EventDetailPage from '@/pages/EventDetailPage';
import MyEventsPage from '@/pages/MyEventsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ProfilePage from '@/pages/ProfilePage';
import { mockEvents, getPlaceById } from '@/data/mockData';
import { cn } from '@/lib/utils';

const Index = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [matchEventId, setMatchEventId] = useState<string | null>(null);
  const [matchPlaceId, setMatchPlaceId] = useState<string | null>(null);
  const [mapIntent, setMapIntent] = useState<MapIntent | null>(null);
  const [splashActive, setSplashActive] = useState(true);

  const finishSplash = useCallback(() => setSplashActive(false), []);
  const consumeMapIntent = useCallback(() => setMapIntent(null), []);

  const handleEventClick = (id: string) => {
    setSelectedEventId(id);
  };

  const handleBack = () => {
    setSelectedEventId(null);
  };

  const matchEvent = matchEventId ? mockEvents.find((e) => e.id === matchEventId) : undefined;
  const matchPlace = matchPlaceId ? getPlaceById(matchPlaceId) : undefined;

  const contentKey = selectedEventId ?? activeTab;

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
      case 'feed':
        return (
          <FeedPage
            onEventClick={handleEventClick}
            onOpenMapPlace={(placeId) => {
              setMapIntent({ placeId });
              setActiveTab('map');
            }}
          />
        );
      case 'map':
        return (
          <MapPage
            onEventClick={handleEventClick}
            mapIntent={mapIntent}
            onConsumeMapIntent={consumeMapIntent}
          />
        );
      case 'myevents':
        return <MyEventsPage onEventClick={handleEventClick} />;
      case 'notifications':
        return (
          <NotificationsPage
            onOpenMatch={(id) => setMatchEventId(id)}
            onOpenMapPlace={(placeId) => {
              setMapIntent({ placeId });
              setActiveTab('map');
            }}
            onOpenPlaceSheet={(placeId) => {
              setMapIntent({ placeId, openSheet: true });
              setActiveTab('map');
            }}
            onOpenPlaceMatch={(placeId) => setMatchPlaceId(placeId)}
          />
        );
      case 'profile':
        return <ProfilePage onNavigateToFeed={() => setActiveTab('feed')} />;
      default:
        return (
          <FeedPage
            onEventClick={handleEventClick}
            onOpenMapPlace={(placeId) => {
              setMapIntent({ placeId });
              setActiveTab('map');
            }}
          />
        );
    }
  };

  return (
    <AuthProvider>
      <AppStateProvider>
        <OpeningSplash active={splashActive} onComplete={finishSplash} />
        <div
          className={cn(
            'min-h-screen bg-background transition-opacity duration-500 ease-out overflow-x-hidden',
            splashActive ? 'opacity-0' : 'opacity-100',
          )}
        >
          <div
            key={contentKey}
            className={cn('max-w-full overflow-x-hidden', !selectedEventId && 'animate-tab-screen-in')}
          >
            {renderContent()}
          </div>
          {matchEvent && (
            <MatchFlowOverlay event={matchEvent} open onClose={() => setMatchEventId(null)} />
          )}
          {matchPlace && (
            <PlaceMatchFlowOverlay place={matchPlace} open onClose={() => setMatchPlaceId(null)} />
          )}
          <BottomNav
            activeTab={activeTab}
            onTabChange={(tab) => {
              setSelectedEventId(null);
              setActiveTab(tab);
            }}
          />
          <AuthSheet />
        </div>
      </AppStateProvider>
    </AuthProvider>
  );
};

export default Index;
