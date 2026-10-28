package com.example.codrive

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.util.Locale

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CoDriveTheme {
                CoDriveApp()
            }
        }
    }
}

@Composable
fun CoDriveTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Color(0xFF1E88E5),
            onPrimary = Color.White,
            secondary = Color(0xFF26A69A),
            background = Color(0xFFF8F9FA),
            surface = Color.White,
            onSurface = Color(0xFF1F2937)
        ),
        content = content
    )
}

data class WaypointItem(
    val title: String,
    val description: String,
    val proposedBy: String = "Host",
    val isSelected: Boolean = true,
    val likes: Int = 5,
    val comments: Int = 0
)

data class ExpenseItem(val title: String, val details: String, val amount: String, val numericAmount: Double)
data class SettlementItem(val text: String)

data class TripItem(
    val id: String,
    val title: String,
    val startDestination: String,
    val endDestination: String,
    val dates: String = "Jun 14 - 18, 2026",
    val distance: String = "120 mi",
    val crew: String = "Crew: A, B, C",
    val waypoints: List<WaypointItem> = emptyList(),
    val expenses: List<ExpenseItem> = emptyList(),
    val settlements: List<SettlementItem> = emptyList(),
    val budget: Double = 500.0
)

@Composable
fun CoDriveApp() {
    var currentTab by remember { mutableStateOf("home") }
    var showCreateDialog by remember { mutableStateOf(false) }
    var showLogExpenseDialog by remember { mutableStateOf(false) }

    val defaultWaypoints = listOf(
        WaypointItem("Ala Moana Hotel", "Start Location", "Host", true, 5, 0),
        WaypointItem("Pipeline Beach", "10 min surf check", "Ava", true, 6, 1),
        WaypointItem("Shark's Cove", "5 min snorkel stop", "Bo", true, 5, 0),
        WaypointItem("Sunset Beach", "10 min sunset stop", "Cam", true, 4, 2),
        WaypointItem("Turtle Bay Resort", "End Destination", "Host", true, 5, 0)
    )

    val defaultExpenses = listOf(
        ExpenseItem("Gas at Haleiwa Shell", "Paid by Ava • Split 3 ways", "$42.00", 42.0),
        ExpenseItem("Shrimp Plate at Giovanni's", "Paid by Bo • Split 3 ways", "$38.00", 38.0),
        ExpenseItem("Turtle Bay Resort stay", "Paid by Cam • Split 3 ways", "$320.00", 320.0),
        ExpenseItem("Snorkel rental at Shark's Cove", "Paid by Ava • Split 3 ways", "$25.00", 25.0),
        ExpenseItem("Shave ice at Matsumoto's", "Paid by Bo • Split 3 ways", "$18.00", 18.0)
    )

    val defaultSettlements = listOf(
        SettlementItem("Ava owes Bo $18.00"),
        SettlementItem("Cam owes Ava $12.00")
    )

    val trips = remember {
        mutableStateListOf(
            TripItem(
                id = "1",
                title = "North Shore Roadtrip",
                startDestination = "Ala Moana Hotel",
                endDestination = "Turtle Bay Resort",
                dates = "Jun 14 - 18, 2026",
                distance = "120 mi",
                crew = "Crew: A, B, C",
                waypoints = defaultWaypoints,
                expenses = defaultExpenses,
                settlements = defaultSettlements,
                budget = 500.0
            )
        )
    }

    var selectedTrip by remember { mutableStateOf(trips.first()) }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.primary
            ) {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                    label = { Text("Home") },
                    selected = currentTab == "home",
                    onClick = { currentTab = "home" }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Place, contentDescription = "Planning") },
                    label = { Text("Planning") },
                    selected = currentTab == "planning",
                    onClick = { currentTab = "planning" }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Navigation, contentDescription = "Nav") },
                    label = { Text("Nav") },
                    selected = currentTab == "navigation",
                    onClick = { currentTab = "navigation" }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.ShoppingCart, contentDescription = "Expenses") },
                    label = { Text("Expenses") },
                    selected = currentTab == "expenses",
                    onClick = { currentTab = "expenses" }
                )
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            when (currentTab) {
                "home" -> HomeScreen(
                    trips = trips,
                    onTripClick = { trip ->
                        selectedTrip = trip
                        currentTab = "planning"
                    },
                    onStartTrip = {
                        showCreateDialog = true
                    }
                )
                "planning" -> PlanningRoomScreen(
                    trip = selectedTrip,
                    allTrips = trips,
                    onSelectTrip = { selectedTrip = it },
                    onAddWaypoint = { waypointName ->
                        val newWaypoint = WaypointItem(
                            title = waypointName,
                            description = "Proposed stop",
                            proposedBy = "You",
                            isSelected = false,
                            likes = 1,
                            comments = 0
                        )
                        val index = trips.indexOfFirst { it.id == selectedTrip.id }
                        if (index != -1) {
                            val updatedTrip = trips[index].copy(
                                waypoints = trips[index].waypoints + newWaypoint
                            )
                            trips[index] = updatedTrip
                            selectedTrip = updatedTrip
                        }
                    }
                )
                "navigation" -> NavigationMapScreen(
                    trip = selectedTrip,
                    allTrips = trips,
                    onSelectTrip = { selectedTrip = it }
                )
                "expenses" -> ExpenseTabScreen(
                    trip = selectedTrip,
                    allTrips = trips,
                    onSelectTrip = { selectedTrip = it },
                    onLogExpenseClick = { showLogExpenseDialog = true }
                )
            }
        }

        if (showCreateDialog) {
            CreateTripDialog(
                onDismiss = { showCreateDialog = false },
                onCreateTrip = { name, startDest, endDest ->
                    val newWaypoints = listOf(
                        WaypointItem(startDest, "Start Location", "Host", true, 5, 0),
                        WaypointItem(endDest, "End Destination", "Host", true, 5, 0)
                    )
                    val newTrip = TripItem(
                        id = System.currentTimeMillis().toString(),
                        title = name,
                        startDestination = startDest,
                        endDestination = endDest,
                        dates = "Jul 01 - 05, 2026",
                        distance = "150 mi",
                        crew = "Crew: You",
                        waypoints = newWaypoints,
                        expenses = emptyList(),
                        settlements = emptyList(),
                        budget = 500.0
                    )
                    trips.add(0, newTrip)
                    selectedTrip = newTrip
                    currentTab = "planning"
                    showCreateDialog = false
                }
            )
        }

        if (showLogExpenseDialog) {
            LogExpenseDialog(
                onDismiss = { showLogExpenseDialog = false },
                onAddExpense = { name, amount ->
                    val newExpense = ExpenseItem(
                        title = name,
                        details = "Paid by You • Split 3 ways",
                        amount = "$${String.format(Locale.US, "%.2f", amount)}",
                        numericAmount = amount
                    )
                    val index = trips.indexOfFirst { it.id == selectedTrip.id }
                    if (index != -1) {
                        val updatedTrip = trips[index].copy(
                            expenses = trips[index].expenses + newExpense
                        )
                        trips[index] = updatedTrip
                        selectedTrip = updatedTrip
                    }
                    showLogExpenseDialog = false
                }
            )
        }
    }
}

// Top Left Header with Trip Selection Dropdown
@Composable
fun TripHeaderDropdown(
    currentTrip: TripItem,
    allTrips: List<TripItem>,
    onSelectTrip: (TripItem) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    Box {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .clip(RoundedCornerShape(8.dp))
                .clickable { expanded = true }
                .padding(vertical = 4.dp, horizontal = 2.dp)
        ) {
            Text(
                text = currentTrip.title,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.width(4.dp))
            Icon(
                imageVector = Icons.Default.ArrowDropDown,
                contentDescription = "Switch Trip",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
        }

        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
            modifier = Modifier.background(MaterialTheme.colorScheme.surface)
        ) {
            Text(
                text = "Select Expedition",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Gray,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )
            HorizontalDivider()
            allTrips.forEach { trip ->
                DropdownMenuItem(
                    text = {
                        Column {
                            Text(
                                text = trip.title,
                                fontWeight = if (trip.id == currentTrip.id) FontWeight.Bold else FontWeight.Normal,
                                color = if (trip.id == currentTrip.id) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "${trip.startDestination} → ${trip.endDestination}",
                                fontSize = 11.sp,
                                color = Color.Gray
                            )
                        }
                    },
                    onClick = {
                        onSelectTrip(trip)
                        expanded = false
                    },
                    leadingIcon = {
                        if (trip.id == currentTrip.id) {
                            Icon(Icons.Default.Check, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        }
                    }
                )
            }
        }
    }
}

// Dialog form for creating a new trip
@Composable
fun CreateTripDialog(
    onDismiss: () -> Unit,
    onCreateTrip: (name: String, startDestination: String, endDestination: String) -> Unit
) {
    var tripName by remember { mutableStateOf("") }
    var startDestination by remember { mutableStateOf("") }
    var endDestination by remember { mutableStateOf("") }

    val isFormValid = tripName.isNotBlank() && startDestination.isNotBlank() && endDestination.isNotBlank()

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = "Start a New Trip", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = tripName,
                    onValueChange = { tripName = it },
                    label = { Text("Trip Name *") },
                    placeholder = { Text("e.g., North Shore Roadtrip") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = startDestination,
                    onValueChange = { startDestination = it },
                    label = { Text("Start Destination *") },
                    placeholder = { Text("e.g., Ala Moana Hotel") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = endDestination,
                    onValueChange = { endDestination = it },
                    label = { Text("End Destination *") },
                    placeholder = { Text("e.g., Turtle Bay Resort") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (isFormValid) {
                        onCreateTrip(tripName.trim(), startDestination.trim(), endDestination.trim())
                    }
                },
                enabled = isFormValid
            ) {
                Text("Create Trip")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

// Dialog form for logging a new expense
@Composable
fun LogExpenseDialog(
    onDismiss: () -> Unit,
    onAddExpense: (name: String, amount: Double) -> Unit
) {
    var expenseName by remember { mutableStateOf("") }
    var expenseAmountText by remember { mutableStateOf("") }

    val parsedAmount = expenseAmountText.toDoubleOrNull() ?: 0.0
    val isFormValid = expenseName.isNotBlank() && parsedAmount > 0.0

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = "Log New Expense", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = expenseName,
                    onValueChange = { expenseName = it },
                    label = { Text("Expense Name *") },
                    placeholder = { Text("e.g., Gas, Dinner, Tickets") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = expenseAmountText,
                    onValueChange = { expenseAmountText = it },
                    label = { Text("Amount ($) *") },
                    placeholder = { Text("e.g., 45.00") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (isFormValid) {
                        onAddExpense(expenseName.trim(), parsedAmount)
                    }
                },
                enabled = isFormValid
            ) {
                Text("Log Expense")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

// 1. Home Screen (`codrive-home`)
@Composable
fun HomeScreen(
    trips: List<TripItem>,
    onTripClick: (TripItem) -> Unit,
    onStartTrip: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        // Status bar simulation / Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = "9:41", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color.Gray)
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Icon(Icons.Default.SignalCellularAlt, contentDescription = null, modifier = Modifier.size(16.dp))
                Icon(Icons.Default.Wifi, contentDescription = null, modifier = Modifier.size(16.dp))
                Icon(Icons.Default.BatteryFull, contentDescription = null, modifier = Modifier.size(16.dp))
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Hero Section
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = "CoDrive",
                    color = Color.White,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Adventure is better together. Plan routes, log coordinates, rotate drivers, and split expenses live with your crew.",
                    color = Color.White.copy(alpha = 0.9f),
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = onStartTrip,
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Start a New Trip", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Your Expeditions",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(trips) { trip ->
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onTripClick(trip) }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Thumbnail Placeholder
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Landscape,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = trip.title,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color.Gray)
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Navigation, contentDescription = null, modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.primary)
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "${trip.startDestination} → ${trip.endDestination}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "${trip.dates}  •  ${trip.distance}",
                                fontSize = 12.sp,
                                color = Color.Gray
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = trip.crew,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.secondary
                            )
                        }
                    }
                }
            }
        }
    }
}

// 2. Planning Room Screen (`codrive-planning-room`)
@Composable
fun PlanningRoomScreen(
    trip: TripItem,
    allTrips: List<TripItem>,
    onSelectTrip: (TripItem) -> Unit,
    onAddWaypoint: (String) -> Unit
) {
    var newWaypointText by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        // Header with Dropdown Switcher
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                TripHeaderDropdown(
                    currentTrip = trip,
                    allTrips = allTrips,
                    onSelectTrip = onSelectTrip
                )
                Text(
                    text = "4 active planners A B C D +1",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.secondary,
                    modifier = Modifier.padding(start = 2.dp)
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy((-8.dp))) {
                listOf("A", "B", "C", "D").forEach { initial ->
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primary),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = initial, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "Trip Stops",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(10.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(trip.waypoints) { waypoint ->
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Thumbnail Placeholder
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(MaterialTheme.colorScheme.secondary.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Place,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.secondary,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = waypoint.title,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Surface(
                                    color = MaterialTheme.colorScheme.secondary.copy(alpha = 0.15f),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text(
                                        text = if (waypoint.description == "Start Location") "Start 🚩"
                                               else if (waypoint.description == "End Destination") "Destination 🏁"
                                               else "Selected ✓",
                                        color = MaterialTheme.colorScheme.secondary,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = waypoint.description,
                                fontSize = 14.sp,
                                color = Color.DarkGray
                            )

                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Proposed by ${waypoint.proposedBy}",
                                    fontSize = 12.sp,
                                    color = Color.Gray
                                )
                                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.FavoriteBorder, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.Gray)
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(text = "${waypoint.likes}", fontSize = 12.sp, color = Color.Gray)
                                    }
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.ChatBubbleOutline, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.Gray)
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(text = "${waypoint.comments}", fontSize = 12.sp, color = Color.Gray)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Active Typing Input Field
        OutlinedTextField(
            value = newWaypointText,
            onValueChange = { newWaypointText = it },
            placeholder = { Text("Suggest a new waypoint...") },
            trailingIcon = {
                IconButton(
                    onClick = {
                        if (newWaypointText.isNotBlank()) {
                            onAddWaypoint(newWaypointText.trim())
                            newWaypointText = ""
                        }
                    }
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add Waypoint", tint = MaterialTheme.colorScheme.primary)
                }
            },
            keyboardActions = KeyboardActions(
                onDone = {
                    if (newWaypointText.isNotBlank()) {
                        onAddWaypoint(newWaypointText.trim())
                        newWaypointText = ""
                    }
                }
            ),
            singleLine = true,
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        )
    }
}

// 3. Map Navigation Screen (`codrive-navigation`)
@Composable
fun NavigationMapScreen(
    trip: TripItem,
    allTrips: List<TripItem>,
    onSelectTrip: (TripItem) -> Unit
) {
    var activeLeg by remember { mutableStateOf("Ava (Leg 1)") }

    // Itinerary items based on current trip's waypoints
    val itinerary = trip.waypoints.mapIndexed { index, wp ->
        val time = "10:${String.format(Locale.US, "%02d", index * 15 + 5)} AM"
        val duration = if (index == 0) "Start" else if (index == trip.waypoints.size - 1) "Arrival" else "10 min stop"
        Triple(wp.title, time, duration)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        // Header with Dropdown Switcher
        TripHeaderDropdown(
            currentTrip = trip,
            allTrips = allTrips,
            onSelectTrip = onSelectTrip
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Currently Driving Banner
        Surface(
            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary),
                    contentAlignment = Alignment.Center
                ) {
                    Text("A", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Ava Currently Driving",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Crew Legs Chips
        Text(
            text = "Crew Legs",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )
        Spacer(modifier = Modifier.height(6.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("Ava (Leg 1)", "Bo (Leg 2)", "Cam (Leg 3)").forEach { leg ->
                val isSelected = leg == activeLeg
                FilterChip(
                    selected = isSelected,
                    onClick = { activeLeg = leg },
                    label = { Text(leg, fontSize = 12.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MaterialTheme.colorScheme.primary,
                        selectedLabelColor = Color.White
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Large Map Navigation Visual Placeholder (takes up a large portion of the screen)
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFE3F2FD)),
            elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(240.dp)
        ) {
            Box(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Map, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "${trip.startDestination} ➔ ${trip.endDestination}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFFBBDEFB)),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Navigation, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(48.dp))
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Live Map Route Visual Placeholder",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }

                // Alert overlay banner at bottom of map
                Surface(
                    color = Color(0xFFFFF3CD),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                ) {
                    Text(
                        text = "🌧️ Light showers ahead - recalculating route.",
                        color = Color(0xFF856404),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Navigation Metrics Banner
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("2 hr 14 min", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MaterialTheme.colorScheme.primary)
                    Text("Duration", fontSize = 11.sp, color = Color.Gray)
                }
                VerticalDivider(modifier = Modifier.height(24.dp), color = Color.LightGray)
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(trip.distance, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MaterialTheme.colorScheme.onSurface)
                    Text("Distance", fontSize = 11.sp, color = Color.Gray)
                }
                VerticalDivider(modifier = Modifier.height(24.dp), color = Color.LightGray)
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("5:30 PM", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MaterialTheme.colorScheme.secondary)
                    Text("ETA", fontSize = 11.sp, color = Color.Gray)
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Today's Itinerary
        Text(
            text = "Today's Itinerary",
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(8.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(itinerary) { (stopName, time, duration) ->
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Thumbnail Placeholder
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Explore,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(stopName, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurface)
                            Text(duration, fontSize = 12.sp, color = Color.Gray)
                        }
                        Text(time, fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
}

// 4. Expense Tab Screen (`codrive-expense-tab`)
@Composable
fun ExpenseTabScreen(
    trip: TripItem,
    allTrips: List<TripItem>,
    onSelectTrip: (TripItem) -> Unit,
    onLogExpenseClick: () -> Unit
) {
    val totalCost = trip.expenses.sumOf { it.numericAmount }
    val remainingBudget = (trip.budget - totalCost).coerceAtLeast(0.0)
    val percentSpent = if (trip.budget > 0) ((totalCost / trip.budget) * 100).toInt() else 0

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        // Header with Dropdown Switcher
        TripHeaderDropdown(
            currentTrip = trip,
            allTrips = allTrips,
            onSelectTrip = onSelectTrip
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Budget Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Total Shared Cost", fontSize = 14.sp, color = Color.Gray)
                    Text(text = "$percentSpent%", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "$${String.format(Locale.US, "%.2f", totalCost)}",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = { (percentSpent / 100f).coerceIn(0f, 1f) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = Color.LightGray.copy(alpha = 0.5f)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "$${String.format(Locale.US, "%.2f", remainingBudget)} remaining of $${String.format(Locale.US, "%.0f", trip.budget)} budget",
                    fontSize = 12.sp,
                    color = Color.Gray
                )
            }
        }

        if (trip.settlements.isNotEmpty()) {
            Spacer(modifier = Modifier.height(16.dp))

            // Settlements Section
            Text(
                text = "Who owes who",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                trip.settlements.forEach { settlement ->
                    Surface(
                        color = MaterialTheme.colorScheme.secondary.copy(alpha = 0.1f),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = settlement.text,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.secondary,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Shared Log Section
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Shared Log",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "${trip.expenses.size} items",
                fontSize = 12.sp,
                color = Color.Gray
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        if (trip.expenses.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "There are no current expenses for this trip.",
                    fontSize = 14.sp,
                    color = Color.Gray.copy(alpha = 0.6f),
                    fontWeight = FontWeight.Medium
                )
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(trip.expenses) { expense ->
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = expense.title,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = expense.details,
                                    fontSize = 12.sp,
                                    color = Color.Gray
                                )
                            }
                            Text(
                                text = expense.amount,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Log Expense Button
        Button(
            onClick = onLogExpenseClick,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
        ) {
            Icon(Icons.Default.Add, contentDescription = null, tint = Color.White)
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = "Log Expense", color = Color.White, fontWeight = FontWeight.Bold)
        }
    }
}
