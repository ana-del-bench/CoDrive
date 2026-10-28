import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// --- Types ---
export interface WaypointItem {
  id: string;
  title: string;
  description: string;
  proposedBy: string;
  isSelected: boolean;
  likes: number;
  comments: number;
}

export interface ExpenseItem {
  id: string;
  title: string;
  details: string;
  amount: string;
  numericAmount: number;
}

export interface SettlementItem {
  id: string;
  text: string;
}

export interface TripItem {
  id: string;
  title: string;
  startDestination: string;
  endDestination: string;
  dates: string;
  distance: string;
  crew: string;
  waypoints: WaypointItem[];
  expenses: ExpenseItem[];
  settlements: SettlementItem[];
  budget: number;
}

// --- Initial Data ---
const DEFAULT_WAYPOINTS: WaypointItem[] = [
  { id: '1', title: 'Ala Moana Hotel', description: 'Start Location', proposedBy: 'Host', isSelected: true, likes: 5, comments: 0 },
  { id: '2', title: 'Pipeline Beach', description: '10 min surf check', proposedBy: 'Ava', isSelected: true, likes: 6, comments: 1 },
  { id: '3', title: "Shark's Cove", description: '5 min snorkel stop', proposedBy: 'Bo', isSelected: true, likes: 5, comments: 0 },
  { id: '4', title: 'Sunset Beach', description: '10 min sunset stop', proposedBy: 'Cam', isSelected: true, likes: 4, comments: 2 },
  { id: '5', title: 'Turtle Bay Resort', description: 'End Destination', proposedBy: 'Host', isSelected: true, likes: 5, comments: 0 },
];

const DEFAULT_EXPENSES: ExpenseItem[] = [
  { id: '1', title: 'Gas at Haleiwa Shell', details: 'Paid by Ava • Split 3 ways', amount: '$42.00', numericAmount: 42.0 },
  { id: '2', title: "Shrimp Plate at Giovanni's", details: 'Paid by Bo • Split 3 ways', amount: '$38.00', numericAmount: 38.0 },
  { id: '3', title: 'Turtle Bay Resort stay', details: 'Paid by Cam • Split 3 ways', amount: '$320.00', numericAmount: 320.0 },
  { id: '4', title: "Snorkel rental at Shark's Cove", details: 'Paid by Ava • Split 3 ways', amount: '$25.00', numericAmount: 25.0 },
  { id: '5', title: "Shave ice at Matsumoto's", details: 'Paid by Bo • Split 3 ways', amount: '$18.00', numericAmount: 18.0 },
];

const DEFAULT_SETTLEMENTS: SettlementItem[] = [
  { id: '1', text: 'Ava owes Bo $18.00' },
  { id: '2', text: 'Cam owes Ava $12.00' },
];

const INITIAL_TRIPS: TripItem[] = [
  {
    id: '1',
    title: 'North Shore Roadtrip',
    startDestination: 'Ala Moana Hotel',
    endDestination: 'Turtle Bay Resort',
    dates: 'Jun 14 - 18, 2026',
    distance: '120 mi',
    crew: 'Crew: A, B, C',
    waypoints: DEFAULT_WAYPOINTS,
    expenses: DEFAULT_EXPENSES,
    settlements: DEFAULT_SETTLEMENTS,
    budget: 500,
  },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'planning' | 'navigation' | 'expenses'>('home');
  const [trips, setTrips] = useState<TripItem[]>(INITIAL_TRIPS);
  const [selectedTrip, setSelectedTrip] = useState<TripItem>(INITIAL_TRIPS[0]);

  // Modals
  const [isCreateTripModalVisible, setIsCreateTripModalVisible] = useState(false);
  const [isLogExpenseModalVisible, setIsLogExpenseModalVisible] = useState(false);

  // Form State for Trip
  const [newTripName, setNewTripName] = useState('');
  const [newStartDest, setNewStartDest] = useState('');
  const [newEndDest, setNewEndDest] = useState('');

  // Form State for Expense
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmountText, setExpenseAmountText] = useState('');

  const handleCreateTrip = () => {
    if (!newTripName.trim() || !newStartDest.trim() || !newEndDest.trim()) return;

    const newWaypoints: WaypointItem[] = [
      {
        id: '1',
        title: newStartDest.trim(),
        description: 'Start Location',
        proposedBy: 'Host',
        isSelected: true,
        likes: 5,
        comments: 0,
      },
      {
        id: '2',
        title: newEndDest.trim(),
        description: 'End Destination',
        proposedBy: 'Host',
        isSelected: true,
        likes: 5,
        comments: 0,
      },
    ];

    const newTrip: TripItem = {
      id: Date.now().toString(),
      title: newTripName.trim(),
      startDestination: newStartDest.trim(),
      endDestination: newEndDest.trim(),
      dates: 'Jul 01 - 05, 2026',
      distance: '150 mi',
      crew: 'Crew: You',
      waypoints: newWaypoints,
      expenses: [],
      settlements: [],
      budget: 500,
    };

    setTrips([newTrip, ...trips]);
    setSelectedTrip(newTrip);
    setCurrentTab('planning');
    setIsCreateTripModalVisible(false);

    // Reset Form
    setNewTripName('');
    setNewStartDest('');
    setNewEndDest('');
  };

  const handleLogExpense = () => {
    const amountNum = parseFloat(expenseAmountText);
    if (!expenseName.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const newExpenseItem: ExpenseItem = {
      id: Date.now().toString(),
      title: expenseName.trim(),
      details: 'Paid by You • Split 3 ways',
      amount: `$${amountNum.toFixed(2)}`,
      numericAmount: amountNum,
    };

    const updatedExpenses = [...selectedTrip.expenses, newExpenseItem];
    const updatedTrip = { ...selectedTrip, expenses: updatedExpenses };

    setSelectedTrip(updatedTrip);
    setTrips(trips.map((t) => (t.id === selectedTrip.id ? updatedTrip : t)));

    setIsLogExpenseModalVisible(false);
    setExpenseName('');
    setExpenseAmountText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {currentTab === 'home' && (
          <HomeScreen
            trips={trips}
            onTripClick={(trip) => {
              setSelectedTrip(trip);
              setCurrentTab('planning');
            }}
            onStartTrip={() => setIsCreateTripModalVisible(true)}
          />
        )}
        {currentTab === 'planning' && (
          <PlanningScreen
            trip={selectedTrip}
            allTrips={trips}
            onSelectTrip={setSelectedTrip}
          />
        )}
        {currentTab === 'navigation' && (
          <NavigationScreen
            trip={selectedTrip}
            allTrips={trips}
            onSelectTrip={setSelectedTrip}
          />
        )}
        {currentTab === 'expenses' && (
          <ExpenseScreen
            trip={selectedTrip}
            allTrips={trips}
            onSelectTrip={setSelectedTrip}
            onLogExpenseClick={() => setIsLogExpenseModalVisible(true)}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('home')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, currentTab === 'home' && styles.navTextActive]}>🏠</Text>
          <Text style={[styles.navText, currentTab === 'home' && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('planning')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, currentTab === 'planning' && styles.navTextActive]}>📍</Text>
          <Text style={[styles.navText, currentTab === 'planning' && styles.navTextActive]}>
            Planning
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('navigation')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, currentTab === 'navigation' && styles.navTextActive]}>🧭</Text>
          <Text style={[styles.navText, currentTab === 'navigation' && styles.navTextActive]}>
            Nav
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('expenses')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, currentTab === 'expenses' && styles.navTextActive]}>🛒</Text>
          <Text style={[styles.navText, currentTab === 'expenses' && styles.navTextActive]}>
            Expenses
          </Text>
        </TouchableOpacity>
      </View>

      {/* Create Trip Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCreateTripModalVisible}
        onRequestClose={() => setIsCreateTripModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start a New Trip</Text>

            <Text style={styles.inputLabel}>Trip Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., North Shore Roadtrip"
              value={newTripName}
              onChangeText={setNewTripName}
            />

            <Text style={styles.inputLabel}>Start Destination *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Ala Moana Hotel"
              value={newStartDest}
              onChangeText={setNewStartDest}
            />

            <Text style={styles.inputLabel}>End Destination *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Turtle Bay Resort"
              value={newEndDest}
              onChangeText={setNewEndDest}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsCreateTripModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  (!newTripName.trim() || !newStartDest.trim() || !newEndDest.trim()) &&
                    styles.disabledButton,
                ]}
                disabled={!newTripName.trim() || !newStartDest.trim() || !newEndDest.trim()}
                onPress={handleCreateTrip}
              >
                <Text style={styles.confirmButtonText}>Create Trip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Log Expense Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isLogExpenseModalVisible}
        onRequestClose={() => setIsLogExpenseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log New Expense</Text>

            <Text style={styles.inputLabel}>Expense Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Gas, Dinner, Tickets"
              value={expenseName}
              onChangeText={setExpenseName}
            />

            <Text style={styles.inputLabel}>Amount ($) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 45.00"
              keyboardType="decimal-pad"
              value={expenseAmountText}
              onChangeText={setExpenseAmountText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsLogExpenseModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  (!expenseName.trim() || !expenseAmountText.trim() || isNaN(parseFloat(expenseAmountText))) &&
                    styles.disabledButton,
                ]}
                disabled={!expenseName.trim() || !expenseAmountText.trim() || isNaN(parseFloat(expenseAmountText))}
                onPress={handleLogExpense}
              >
                <Text style={styles.confirmButtonText}>Log Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- Top Left Header Dropdown Switcher ---
function TripHeaderDropdown({
  currentTrip,
  allTrips,
  onSelectTrip,
}: {
  currentTrip: TripItem;
  allTrips: TripItem[];
  onSelectTrip: (trip: TripItem) => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownTrigger}
        onPress={() => setDropdownOpen(!dropdownOpen)}
        activeOpacity={0.7}
      >
        <Text style={styles.screenTitle}>{currentTrip.title}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={dropdownOpen}
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={styles.dropdownMenu}>
            <Text style={styles.dropdownHeaderTitle}>Select Expedition</Text>
            <ScrollView style={{ maxHeight: 240 }}>
              {allTrips.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dropdownItem,
                    item.id === currentTrip.id && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    onSelectTrip(item);
                    setDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemTitle,
                      item.id === currentTrip.id && styles.dropdownItemTitleActive,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.dropdownItemRoute}>
                    {item.startDestination} → {item.endDestination}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// --- Home Screen ---
function HomeScreen({
  trips,
  onTripClick,
  onStartTrip,
}: {
  trips: TripItem[];
  onTripClick: (trip: TripItem) => void;
  onStartTrip: () => void;
}) {
  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={styles.screenContent}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <Text style={styles.timeText}>9:41</Text>
        <Text style={styles.statusIcons}>📶 🔋</Text>
      </View>

      {/* Hero Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>CoDrive</Text>
        <Text style={styles.heroSubtitle}>
          Adventure is better together. Plan routes, log coordinates, rotate drivers, and split
          expenses live with your crew.
        </Text>
        <TouchableOpacity style={styles.heroButton} onPress={onStartTrip} activeOpacity={0.8}>
          <Text style={styles.heroButtonText}>+ Start a New Trip</Text>
        </TouchableOpacity>
      </View>

      {/* Expeditions Header */}
      <Text style={styles.sectionHeader}>Your Expeditions</Text>

      {/* Trips List */}
      {trips.map((trip) => (
        <TouchableOpacity
          key={trip.id}
          style={styles.tripCard}
          onPress={() => onTripClick(trip)}
          activeOpacity={0.7}
        >
          <View style={styles.tripCardHeader}>
            <Text style={styles.tripTitle}>{trip.title}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
          <Text style={styles.tripRoute}>
            ▲ {trip.startDestination} → {trip.endDestination}
          </Text>
          <Text style={styles.tripDetails}>
            {trip.dates} • {trip.distance}
          </Text>
          <Text style={styles.tripCrew}>{trip.crew}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// --- Planning Room Screen ---
function PlanningScreen({
  trip,
  allTrips,
  onSelectTrip,
}: {
  trip: TripItem;
  allTrips: TripItem[];
  onSelectTrip: (trip: TripItem) => void;
}) {
  return (
    <View style={styles.screenContainer}>
      <ScrollView style={styles.screenScroll} contentContainerStyle={styles.screenContent}>
        {/* Header */}
        <View style={styles.planningHeaderRow}>
          <View>
            <TripHeaderDropdown
              currentTrip={trip}
              allTrips={allTrips}
              onSelectTrip={onSelectTrip}
            />
            <Text style={styles.activePlanners}>4 active planners A B C D +1</Text>
          </View>
          <View style={styles.avatarRow}>
            {['A', 'B', 'C', 'D'].map((initial, i) => (
              <View key={i} style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionHeader}>Trip Stops</Text>

        {/* Waypoints List */}
        {trip.waypoints.map((item) => (
          <View key={item.id} style={styles.stopCard}>
            <View style={styles.stopCardHeader}>
              <Text style={styles.stopTitle}>{item.title}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.description === 'Start Location'
                    ? 'Start 🚩'
                    : item.description === 'End Destination'
                    ? 'Destination 🏁'
                    : 'Selected ✓'}
                </Text>
              </View>
            </View>

            <Text style={styles.stopDescription}>{item.description}</Text>

            <View style={styles.stopFooter}>
              <Text style={styles.proposedBy}>Proposed by {item.proposedBy}</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statText}>♡ {item.likes}</Text>
                <Text style={styles.statText}>💬 {item.comments}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Suggest Waypoint Input */}
      <View style={styles.inputBarContainer}>
        <TextInput
          style={styles.inputBar}
          placeholder="Suggest a new waypoint..."
          editable={false}
        />
        <Text style={styles.inputBarPlus}>+</Text>
      </View>
    </View>
  );
}

// --- Navigation Map Screen ---
function NavigationScreen({
  trip,
  allTrips,
  onSelectTrip,
}: {
  trip: TripItem;
  allTrips: TripItem[];
  onSelectTrip: (trip: TripItem) => void;
}) {
  const [activeLeg, setActiveLeg] = useState('Ava (Leg 1)');

  const itinerary = trip.waypoints.map((wp, index) => ({
    name: wp.title,
    time: `10:${String(index * 15 + 5).padStart(2, '0')} AM`,
    duration: index === 0 ? 'Start' : index === trip.waypoints.length - 1 ? 'Arrival' : '10 min stop',
  }));

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={styles.screenContent}>
      <TripHeaderDropdown
        currentTrip={trip}
        allTrips={allTrips}
        onSelectTrip={onSelectTrip}
      />

      {/* Currently Driving Banner */}
      <View style={styles.driverBanner}>
        <View style={styles.driverAvatar}>
          <Text style={styles.driverAvatarText}>A</Text>
        </View>
        <Text style={styles.driverBannerText}>Ava Currently Driving</Text>
      </View>

      {/* Crew Legs Selector */}
      <Text style={styles.sectionHeader}>Crew Legs</Text>
      <View style={styles.legsRow}>
        {['Ava (Leg 1)', 'Bo (Leg 2)', 'Cam (Leg 3)'].map((leg) => {
          const isSelected = leg === activeLeg;
          return (
            <TouchableOpacity
              key={leg}
              style={[styles.legChip, isSelected && styles.legChipSelected]}
              onPress={() => setActiveLeg(leg)}
              activeOpacity={0.7}
            >
              <Text style={[styles.legChipText, isSelected && styles.legChipTextSelected]}>
                {leg}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Map View Card */}
      <View style={styles.mapCard}>
        <Text style={styles.mapRouteText}>
          📍 {trip.startDestination} ➔ {trip.endDestination}
        </Text>
        <Text style={styles.mapSubtext}>En route along main highway</Text>

        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>🌧️ Light showers ahead - recalculating.</Text>
        </View>
      </View>

      {/* Navigation Metrics Banner */}
      <View style={styles.metricsCard}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValuePrimary}>2 hr 14 min</Text>
          <Text style={styles.metricLabel}>Duration</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{trip.distance}</Text>
          <Text style={styles.metricLabel}>Distance</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValueSecondary}>5:30 PM</Text>
          <Text style={styles.metricLabel}>ETA</Text>
        </View>
      </View>

      {/* Today's Itinerary */}
      <Text style={styles.sectionHeader}>Today's Itinerary</Text>
      {itinerary.map((item, index) => (
        <View key={index} style={styles.itineraryCard}>
          <View>
            <Text style={styles.itineraryName}>{item.name}</Text>
            <Text style={styles.itineraryDuration}>{item.duration}</Text>
          </View>
          <Text style={styles.itineraryTime}>{item.time}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// --- Expense Tab Screen ---
function ExpenseScreen({
  trip,
  allTrips,
  onSelectTrip,
  onLogExpenseClick,
}: {
  trip: TripItem;
  allTrips: TripItem[];
  onSelectTrip: (trip: TripItem) => void;
  onLogExpenseClick: () => void;
}) {
  const totalCost = trip.expenses.reduce((sum, item) => sum + item.numericAmount, 0);
  const remainingBudget = Math.max(0, trip.budget - totalCost);
  const percentSpent = trip.budget > 0 ? Math.min(100, Math.round((totalCost / trip.budget) * 100)) : 0;

  return (
    <View style={styles.screenContainer}>
      <ScrollView style={styles.screenScroll} contentContainerStyle={styles.screenContent}>
        <TripHeaderDropdown
          currentTrip={trip}
          allTrips={allTrips}
          onSelectTrip={onSelectTrip}
        />

        {/* Budget Card */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Total Shared Cost</Text>
            <Text style={styles.budgetPercent}>{percentSpent}%</Text>
          </View>
          <Text style={styles.budgetAmount}>${totalCost.toFixed(2)}</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${percentSpent}%` }]} />
          </View>
          <Text style={styles.budgetSubtext}>
            ${remainingBudget.toFixed(2)} remaining of ${trip.budget.toFixed(0)} budget
          </Text>
        </View>

        {/* Who Owes Who Section */}
        {trip.settlements.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Who owes who</Text>
            <View style={styles.settlementsRow}>
              {trip.settlements.map((s) => (
                <View key={s.id} style={styles.settlementChip}>
                  <Text style={styles.settlementText}>{s.text}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Shared Log */}
        <View style={styles.sharedLogHeader}>
          <Text style={styles.sectionHeader}>Shared Log</Text>
          <Text style={styles.logCountText}>{trip.expenses.length} items</Text>
        </View>

        {trip.expenses.length === 0 ? (
          <View style={styles.emptyExpensesBox}>
            <Text style={styles.emptyExpensesText}>
              There are no current expenses for this trip.
            </Text>
          </View>
        ) : (
          trip.expenses.map((expense) => (
            <View key={expense.id} style={styles.expenseCard}>
              <View style={styles.expenseMain}>
                <Text style={styles.expenseTitle}>{expense.title}</Text>
                <Text style={styles.expenseDetails}>{expense.details}</Text>
              </View>
              <Text style={styles.expenseAmount}>{expense.amount}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Log Expense Button */}
      <View style={styles.logExpenseContainer}>
        <TouchableOpacity
          style={styles.logExpenseButton}
          onPress={onLogExpenseClick}
          activeOpacity={0.8}
        >
          <Text style={styles.logExpenseButtonText}>+ Log Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  screenScroll: {
    flex: 1,
  },
  screenContent: {
    padding: 16,
    paddingBottom: 24,
  },

  // Dropdown Switcher
  dropdownContainer: {
    marginBottom: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#1E88E5',
    fontWeight: 'bold',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  dropdownHeaderTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dropdownItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dropdownItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  dropdownItemTitleActive: {
    color: '#1E88E5',
    fontWeight: 'bold',
  },
  dropdownItemRoute: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  statusIcons: {
    fontSize: 14,
  },

  // Hero Section
  heroCard: {
    backgroundColor: '#1E88E5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    marginVertical: 8,
  },
  heroButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  heroButtonText: {
    color: '#1E88E5',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Section Headers
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  // Trip Cards
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  tripRoute: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E88E5',
    marginVertical: 4,
  },
  tripDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  tripCrew: {
    fontSize: 12,
    fontWeight: '500',
    color: '#26A69A',
  },

  // Planning Room
  planningHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activePlanners: {
    fontSize: 12,
    color: '#26A69A',
    marginTop: 2,
  },
  avatarRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Stop Cards
  stopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  stopCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  badge: {
    backgroundColor: 'rgba(38, 166, 154, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#26A69A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stopDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginVertical: 4,
  },
  stopFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  proposedBy: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },

  inputBarContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputBar: {
    flex: 1,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  inputBarPlus: {
    fontSize: 24,
    color: '#1E88E5',
    marginLeft: 12,
    fontWeight: 'bold',
  },

  // Navigation Map Screen
  driverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverAvatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  driverBannerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E88E5',
  },

  legsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  legChip: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  legChipSelected: {
    backgroundColor: '#1E88E5',
  },
  legChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  legChipTextSelected: {
    color: '#FFFFFF',
  },

  mapCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 16,
    height: 160,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mapRouteText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  mapSubtext: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 4,
  },
  alertBanner: {
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 8,
  },
  alertText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '600',
  },

  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValuePrimary: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  metricValueSecondary: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#26A69A',
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },

  itineraryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  itineraryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  itineraryDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itineraryTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E88E5',
  },

  // Expense Screen
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    elevation: 2,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  budgetPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  budgetAmount: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1E88E5',
  },
  budgetSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },

  settlementsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  settlementChip: {
    flex: 1,
    backgroundColor: 'rgba(38, 166, 154, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  settlementText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#26A69A',
  },

  sharedLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logCountText: {
    fontSize: 12,
    color: '#6B7280',
  },

  emptyExpensesBox: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyExpensesText: {
    fontSize: 14,
    color: 'rgba(107, 114, 128, 0.6)',
    fontWeight: '500',
  },

  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  expenseMain: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  expenseDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E88E5',
  },

  logExpenseContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  logExpenseButton: {
    backgroundColor: '#1E88E5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logExpenseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  navText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  navTextActive: {
    color: '#1E88E5',
    fontWeight: 'bold',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#1E88E5',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});
