import { useEffect, useState } from 'react';
import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBar } from './src/components/TabBar';
import { CREW, iconFor, IMG, TRIPS } from './src/data';
import { ConnectionDialog } from './src/screens/ConnectionDialog';
import { CostsScreen } from './src/screens/CostsScreen';
import { CreateTripDialog } from './src/screens/CreateTripDialog';
import { DriveScreen } from './src/screens/DriveScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { InviteScreen } from './src/screens/InviteScreen';
import { LogExpenseDialog } from './src/screens/LogExpenseDialog';
import { PlanScreen } from './src/screens/PlanScreen';
import { ProfileDialog } from './src/screens/ProfileDialog';
import { RotationDialog } from './src/screens/RotationDialog';
import { C } from './src/theme';
import type { Crew, Tab, Trip } from './src/types';

function CoDrive() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('home');
  const [trips, setTrips] = useState<Trip[]>(TRIPS);
  const [selectedId, setSelectedId] = useState(TRIPS[0].id);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [rotationOpen, setRotationOpen] = useState(false);
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [rotationSeen, setRotationSeen] = useState(false);
  const [rotationNote, setRotationNote] = useState<string | null>(null);
  const [draftStop, setDraftStop] = useState('');
  const [tripName, setTripName] = useState('');
  const [startName, setStartName] = useState('');
  const [endName, setEndName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tripImage, setTripImage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileUri, setProfileUri] = useState<string | null>(null);

  const trip = trips.find((item) => item.id === selectedId) ?? trips[0];

  useEffect(() => {
    if (tab === 'drive' && trip && !rotationSeen) {
      setRotationOpen(true);
      setRotationSeen(true);
    }
  }, [tab, rotationSeen, trip]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (inviteOpen) {
        setInviteOpen(false);
        return true;
      }
      if (rotationOpen) {
        setRotationOpen(false);
        return true;
      }
      if (connectionOpen) {
        setConnectionOpen(false);
        return true;
      }
      if (createOpen) {
        setCreateOpen(false);
        setEditingId(null);
        return true;
      }
      if (expenseOpen) {
        setExpenseOpen(false);
        return true;
      }
      if (profileOpen) {
        setProfileOpen(false);
        return true;
      }
      if (tab !== 'home') {
        setTab('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [inviteOpen, rotationOpen, connectionOpen, createOpen, expenseOpen, profileOpen, tab]);

  const updateTrip = (id: string, recipe: (current: Trip) => Trip) => {
    setTrips((current) => current.map((item) => (item.id === id ? recipe(item) : item)));
  };

  const openTrip = (id: string) => {
    setSelectedId(id);
    setTab('plan');
  };

  const deleteTrip = (id: string) => {
    const remaining = trips.filter((item) => item.id !== id);
    setTrips(remaining);
    if (selectedId === id) {
      setSelectedId(remaining[0]?.id ?? '');
      setTab('home');
    }
  };

  const createReady =
    tripName.trim().length > 0 &&
    startDate.trim().length > 0 &&
    endDate.trim().length > 0 &&
    (editingId !== null || (startName.trim().length > 0 && endName.trim().length > 0));
  const amountValue = parseFloat(expenseAmount);
  const expenseReady =
    expenseName.trim().length > 0 &&
    expenseNotes.trim().length > 0 &&
    !Number.isNaN(amountValue) &&
    amountValue > 0;

  const clearTripForm = () => {
    setTripName('');
    setStartName('');
    setEndName('');
    setStartDate('');
    setEndDate('');
    setTripImage(null);
    setEditingId(null);
  };

  const openCreate = () => {
    clearTripForm();
    setCreateOpen(true);
  };

  const openEdit = (id: string) => {
    const current = trips.find((item) => item.id === id);
    if (!current) return;
    const parts = current.dates.split(/\s+–\s+/);
    setEditingId(id);
    setTripName(current.title);
    setStartName(current.waypoints.find((stop) => stop.detail === 'Start')?.title ?? '');
    setEndName(current.waypoints.find((stop) => stop.detail === 'Destination')?.title ?? '');
    setStartDate(parts[0] ?? '');
    setEndDate(parts.length > 1 ? parts.slice(1).join(' – ') : '');
    setTripImage(current.image);
    setCreateOpen(true);
  };

  const closeTripForm = () => {
    setCreateOpen(false);
    setEditingId(null);
  };

  const placeWaypoints = (current: Trip, start: string, end: string) => {
    let waypoints = current.waypoints.map((stop) => {
      if (stop.detail === 'Start' && start) return { ...stop, title: start };
      if (stop.detail === 'Destination' && end) return { ...stop, title: end };
      return stop;
    });
    if (start && !waypoints.some((stop) => stop.detail === 'Start')) {
      waypoints = [
        {
          id: `${current.id}-start`,
          title: start,
          detail: 'Start',
          proposedBy: 'You',
          likes: 1,
          liked: true,
          image: IMG.coast,
          time: '9:00 AM',
          stop: 'Departure',
          pin: '#E26D5A',
        },
        ...waypoints,
      ];
    }
    if (end && !waypoints.some((stop) => stop.detail === 'Destination')) {
      waypoints = [
        ...waypoints,
        {
          id: `${current.id}-end`,
          title: end,
          detail: 'Destination',
          proposedBy: 'You',
          likes: 1,
          liked: true,
          image: IMG.hills,
          time: '—',
          stop: 'Arrival',
          pin: '#5B7CFA',
        },
      ];
    }
    return waypoints;
  };

  const handleCreate = () => {
    if (!createReady) return;
    const title = tripName.trim();
    const start = startName.trim();
    const end = endName.trim();
    const dates = `${startDate.trim()} – ${endDate.trim()}`;
    const image = tripImage ?? IMG.road;

    if (editingId) {
      updateTrip(editingId, (current) => ({
        ...current,
        title,
        routeName: current.routeName === current.title ? title : current.routeName,
        dates,
        image,
        leg: start && end ? `${start} to ${end}` : current.leg,
        waypoints: placeWaypoints(current, start, end),
      }));
      clearTripForm();
      setCreateOpen(false);
      return;
    }

    const id = Date.now().toString();
    const you: Crew = { id: 'you', name: 'You', initial: 'Y', color: '#E26D5A' };
    const next: Trip = {
      id,
      title,
      routeName: title,
      dates,
      image,
      crew: [you, CREW[1], CREW[2]],
      budget: 500,
      duration: '—',
      leg: `${start} to ${end}`,
      progress: 0.08,
      rest: { place: 'Nearest safe pull-off', distance: '—', note: 'We’ll mark it once you’re moving' },
      expenses: [],
      waypoints: [
        {
          id: `${id}-start`,
          title: start,
          detail: 'Start',
          proposedBy: 'You',
          likes: 1,
          liked: true,
          image: IMG.coast,
          time: '9:00 AM',
          stop: 'Departure',
          pin: '#E26D5A',
        },
        {
          id: `${id}-end`,
          title: end,
          detail: 'Destination',
          proposedBy: 'You',
          likes: 1,
          liked: true,
          image: IMG.hills,
          time: '—',
          stop: 'Arrival',
          pin: '#5B7CFA',
        },
      ],
    };
    setTrips((current) => [next, ...current]);
    setSelectedId(id);
    clearTripForm();
    setCreateOpen(false);
    setInviteOpen(true);
  };

  const addStop = () => {
    const title = draftStop.trim();
    if (!title || !trip) return;
    updateTrip(trip.id, (current) => ({
      ...current,
      waypoints: [
        ...current.waypoints,
        {
          id: Date.now().toString(),
          title,
          detail: 'Suggested stop',
          proposedBy: 'You',
          likes: 1,
          liked: true,
          image: IMG.lake,
          time: '—',
          stop: 'New suggestion',
          pin: '#8B6CC4',
        },
      ],
    }));
    setDraftStop('');
  };

  const toggleLike = (id: string) => {
    if (!trip) return;
    updateTrip(trip.id, (current) => ({
      ...current,
      waypoints: current.waypoints.map((stop) =>
        stop.id === id ? { ...stop, liked: !stop.liked, likes: stop.likes + (stop.liked ? -1 : 1) } : stop,
      ),
    }));
  };

  const handleLog = () => {
    if (!expenseReady || !trip) return;
    updateTrip(trip.id, (current) => ({
      ...current,
      expenses: [
        {
          id: Date.now().toString(),
          title: expenseName.trim(),
          details: expenseNotes.trim(),
          amount: amountValue,
          icon: iconFor(expenseName),
        },
        ...current.expenses,
      ],
    }));
    setExpenseName('');
    setExpenseAmount('');
    setExpenseNotes('');
    setExpenseOpen(false);
  };

  const driver = trip?.crew[0]?.name ?? 'Ava';
  const driverLine =
    driver === 'You'
      ? 'You have reached the group set drive limit of '
      : `${driver} has reached the group set drive limit of `;

  return (
    <View style={styles.stage}>
      <View style={styles.phone}>
        <StatusBar style="dark" />
        <View style={[styles.column, { paddingTop: insets.top, backgroundColor: tab === 'drive' ? C.map : C.cream }]}>
          <View style={styles.fill}>
            {tab === 'home' ? (
              <HomeScreen
                trips={trips}
                profileUri={profileUri}
                onOpen={openTrip}
                onCreate={openCreate}
                onDelete={deleteTrip}
                onEdit={openEdit}
                onProfile={() => setProfileOpen(true)}
              />
            ) : null}
            {!trip && tab !== 'home' ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyTabText}>Start a trip from Home to plan, drive, and split costs.</Text>
              </View>
            ) : null}
            {tab === 'plan' && trip ? (
              <PlanScreen
                trip={trip}
                draft={draftStop}
                onDraft={setDraftStop}
                onAdd={addStop}
                onLike={toggleLike}
                onInvite={() => setInviteOpen(true)}
              />
            ) : null}
            {tab === 'drive' && trip ? (
              <DriveScreen
                trip={trip}
                fullMap={rotationOpen || connectionOpen}
                note={rotationNote}
                onRotation={() => setRotationOpen(true)}
                onConnection={() => setConnectionOpen(true)}
              />
            ) : null}
            {tab === 'costs' && trip ? <CostsScreen trip={trip} onLog={() => setExpenseOpen(true)} /> : null}
          </View>
          <TabBar tab={tab} onChange={setTab} paddingBottom={insets.bottom} />
        </View>

        {createOpen ? (
          <CreateTripDialog
            editing={editingId !== null}
            name={tripName}
            start={startName}
            end={endName}
            onName={setTripName}
            onStart={setStartName}
            onEnd={setEndName}
            startDate={startDate}
            endDate={endDate}
            image={tripImage}
            onStartDate={setStartDate}
            onEndDate={setEndDate}
            onImage={setTripImage}
            onSubmit={handleCreate}
            onClose={closeTripForm}
            canSubmit={createReady}
          />
        ) : null}

        {expenseOpen && trip ? (
          <LogExpenseDialog
            tripTitle={trip.title}
            name={expenseName}
            amount={expenseAmount}
            notes={expenseNotes}
            onName={setExpenseName}
            onAmount={setExpenseAmount}
            onNotes={setExpenseNotes}
            onLog={handleLog}
            onClose={() => setExpenseOpen(false)}
            canLog={expenseReady}
          />
        ) : null}

        {rotationOpen && trip ? (
          <RotationDialog
            driverLine={driverLine}
            rest={trip.rest}
            onClose={() => setRotationOpen(false)}
            onAcknowledge={() => {
              setRotationNote('Rotation acknowledged');
              setRotationOpen(false);
            }}
            onRemind={() => {
              setRotationNote('Reminder in 10 min');
              setRotationOpen(false);
            }}
          />
        ) : null}

        {connectionOpen ? <ConnectionDialog driverName={driver} onClose={() => setConnectionOpen(false)} /> : null}

        {profileOpen ? (
          <ProfileDialog
            uri={profileUri}
            onPhoto={setProfileUri}
            onClear={() => setProfileUri(null)}
            onClose={() => setProfileOpen(false)}
          />
        ) : null}

        {inviteOpen && trip ? (
          <InviteScreen
            trip={trip}
            onDone={() => {
              setInviteOpen(false);
              setTab('plan');
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CoDrive />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: '#E7E1D6',
    alignItems: 'center',
  },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    backgroundColor: C.cream,
    overflow: 'hidden',
  },
  column: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  emptyTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTabText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: C.muted,
  },
});
