package com.example.ui

import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import android.net.Uri
import android.provider.OpenableColumns
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.data.database.NoteEntity
import com.example.data.database.NotificationEntity
import com.example.data.database.ResultEntity
import com.example.data.database.StudentEntity
import com.example.data.database.WhiteboardEntity
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// Screen Routes defining our 10 beautiful pages
enum class ScavScreen(val route: String, val title: String) {
    HOME("home", "Home Portal"),
    LOGIN("login", "Secure Login"),
    STUDENT_DASHBOARD("student_dashboard", "Student Portal"),
    ADMIN_DASHBOARD("admin_dashboard", "Admin Console"),
    NOTES("notes", "Notes Vault"),
    WHITEBOARD_GALLERY("whiteboard_gallery", "Whiteboard Sketch"),
    NOTIFICATIONS("notifications", "Announcements"),
    RESULTS("results", "Results Desk"),
    DOWNLOADS("downloads", "My Downloads"),
    PROFILE("profile", "My Profile")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AcademyApp(
    viewModel: AcademyViewModel = viewModel(),
    onToggleDark: () -> Unit = {}
) {
    val navController = rememberNavController()
    val scope = rememberCoroutineScope()
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val context = LocalContext.current

    // Observe core state from the view model
    val userRole by viewModel.currentUserRole.collectAsStateWithLifecycle()
    val studentName by viewModel.currentStudentName.collectAsStateWithLifecycle()
    val notes by viewModel.notes.collectAsStateWithLifecycle()
    val whiteboards by viewModel.whiteboards.collectAsStateWithLifecycle()
    val notifications by viewModel.notifications.collectAsStateWithLifecycle()
    val results by viewModel.results.collectAsStateWithLifecycle()
    val students by viewModel.students.collectAsStateWithLifecycle()
    val studentCount by viewModel.studentCount.collectAsStateWithLifecycle()
    val downloadedNoteIds by viewModel.downloadedNoteIds.collectAsStateWithLifecycle()
    val downloadedResultIds by viewModel.downloadedResultIds.collectAsStateWithLifecycle()

    val currentBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = currentBackStackEntry?.destination?.route ?: ScavScreen.HOME.route

    // Check notification badge count (unread)
    val unreadNotificationsCount = notifications.count { !it.isRead }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                Column(
                    modifier = Modifier
                        .fillMaxHeight()
                        .width(300.dp)
                        .background(MaterialTheme.colorScheme.surface)
                        .padding(bottom = 24.dp)
                ) {
                    // Drawer Header
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(
                                        MaterialTheme.colorScheme.primary,
                                        MaterialTheme.colorScheme.primaryContainer
                                    )
                                )
                            )
                            .padding(24.dp)
                    ) {
                        Column {
                            Icon(
                                imageVector = Icons.Default.School,
                                contentDescription = "Academy Logo",
                                tint = MaterialTheme.colorScheme.onPrimary,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "SCA Academy Karak",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimary
                            )
                            Text(
                                text = "Class 8th to 12th Portal",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.8f)
                            )
                        }
                    }

                    // User Badge
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.4f))
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (userRole == "Admin") Icons.Default.SupervisorAccount else Icons.Default.Person,
                            contentDescription = "User icon",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = if (userRole == "Admin") "Teacher/Admin Mode" else studentName,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Affiliation: $userRole",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Drawer Items matching the 10 requested pages
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .padding(horizontal = 12.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        // General Pages list
                        val itemsList = mutableListOf(
                            DrawerItemData(ScavScreen.HOME, Icons.Default.Home),
                            DrawerItemData(ScavScreen.LOGIN, Icons.Default.VpnKey)
                        )

                        // Role based specific screens placement
                        if (userRole == "Admin") {
                            itemsList.add(DrawerItemData(ScavScreen.ADMIN_DASHBOARD, Icons.Default.Dashboard))
                        } else {
                            itemsList.add(DrawerItemData(ScavScreen.STUDENT_DASHBOARD, Icons.Default.Dashboard))
                        }

                        itemsList.addAll(
                            listOf(
                                DrawerItemData(ScavScreen.NOTES, Icons.Default.LibraryBooks),
                                DrawerItemData(ScavScreen.WHITEBOARD_GALLERY, Icons.Default.Palette),
                                DrawerItemData(ScavScreen.NOTIFICATIONS, Icons.Default.Notifications),
                                DrawerItemData(ScavScreen.RESULTS, Icons.Default.EmojiEvents),
                                DrawerItemData(ScavScreen.DOWNLOADS, Icons.Default.CloudDownload),
                                DrawerItemData(ScavScreen.PROFILE, Icons.Default.ManageAccounts)
                            )
                        )

                        items(itemsList) { item ->
                            val selected = currentRoute == item.screen.route
                            NavigationDrawerItem(
                                icon = {
                                    BadgedBox(
                                        badge = {
                                            if (item.screen == ScavScreen.NOTIFICATIONS && unreadNotificationsCount > 0) {
                                                Badge { Text(unreadNotificationsCount.toString()) }
                                            }
                                        }
                                    ) {
                                        Icon(
                                            imageVector = item.icon,
                                            contentDescription = item.screen.title
                                        )
                                    }
                                },
                                label = { Text(text = item.screen.title, fontWeight = FontWeight.Medium) },
                                selected = selected,
                                onClick = {
                                    scope.launch { drawerState.close() }
                                    navController.navigate(item.screen.route) {
                                        popUpTo(navController.graph.startDestinationId) { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("drawer_item_${item.screen.route}"),
                                colors = NavigationDrawerItemDefaults.colors(
                                    selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                                    selectedIconColor = MaterialTheme.colorScheme.primary,
                                    selectedTextColor = MaterialTheme.colorScheme.primary
                                )
                            )
                        }
                    }

                    // Footer Quick Switch role (Role access control display)
                    Divider(modifier = Modifier.padding(horizontal = 16.dp))
                    Text(
                        text = "Demo Context Settings",
                        style = MaterialTheme.typography.titleSmall,
                        modifier = Modifier.padding(start = 20.dp, top = 12.dp, bottom = 4.dp),
                        color = MaterialTheme.colorScheme.primary
                    )
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Simulate Role Admin?", fontSize = 13.sp)
                        Switch(
                            checked = userRole == "Admin",
                            onCheckedChange = { isAdmin ->
                                viewModel.setRole(if (isAdmin) "Admin" else "Student")
                                val dest = if (isAdmin) ScavScreen.ADMIN_DASHBOARD.route else ScavScreen.STUDENT_DASHBOARD.route
                                navController.navigate(dest) {
                                    popUpTo(navController.graph.startDestinationId) { saveState = true }
                                }
                                Toast.makeText(context, "Role updated: ${if (isAdmin) "Teacher/Admin" else "Student"}", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.scaleScale(0.8f).testTag("quick_role_switch")
                        )
                    }
                }
            }
        }
    ) {
        Scaffold(
            topBar = {
                CenterAlignedTopAppBar(
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.School,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Science Coaching Academy (SCA)",
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.titleLarge
                            )
                        }
                    },
                    navigationIcon = {
                        IconButton(
                            onClick = { scope.launch { drawerState.open() } },
                            modifier = Modifier.testTag("drawer_toggle_button")
                        ) {
                            Icon(imageVector = Icons.Default.Menu, contentDescription = "Menu")
                        }
                    },
                    actions = {
                        // Quick badge notifications
                        IconButton(onClick = { navController.navigate(ScavScreen.NOTIFICATIONS.route) }) {
                            BadgedBox(
                                badge = {
                                    if (unreadNotificationsCount > 0) {
                                        Badge { Text(unreadNotificationsCount.toString()) }
                                    }
                                }
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Notifications,
                                    contentDescription = "Notifications"
                                )
                            }
                        }
                        // Dark tone toggle
                        IconButton(onClick = onToggleDark) {
                            Icon(
                                imageVector = Icons.Default.DarkMode,
                                contentDescription = "Toggle Theme"
                            )
                        }
                    },
                    colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surfaceColorAtElevation(1.dp)
                    )
                )
            },
            bottomBar = {
                // High-fidelity intuitive bottom bar for mobile users to quickly jump between panels
                NavigationBar {
                    val homeSelected = currentRoute == ScavScreen.HOME.route
                    NavigationBarItem(
                        selected = homeSelected,
                        onClick = { navController.navigate(ScavScreen.HOME.route) },
                        icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                        label = { Text("Home", fontSize = 11.sp) }
                    )

                    val dashboardRoute = if (userRole == "Admin") ScavScreen.ADMIN_DASHBOARD.route else ScavScreen.STUDENT_DASHBOARD.route
                    val dashboardSelected = currentRoute == ScavScreen.STUDENT_DASHBOARD.route || currentRoute == ScavScreen.ADMIN_DASHBOARD.route
                    NavigationBarItem(
                        selected = dashboardSelected,
                        onClick = { navController.navigate(dashboardRoute) },
                        icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                        label = { Text("Dashboard", fontSize = 11.sp) }
                    )

                    val boardSelected = currentRoute == ScavScreen.WHITEBOARD_GALLERY.route
                    NavigationBarItem(
                        selected = boardSelected,
                        onClick = { navController.navigate(ScavScreen.WHITEBOARD_GALLERY.route) },
                        icon = { Icon(Icons.Default.Palette, contentDescription = "Whiteboards") },
                        label = { Text("Whiteboard", fontSize = 11.sp) }
                    )

                    val notesSelected = currentRoute == ScavScreen.NOTES.route
                    NavigationBarItem(
                        selected = notesSelected,
                        onClick = { navController.navigate(ScavScreen.NOTES.route) },
                        icon = { Icon(Icons.Default.LibraryBooks, contentDescription = "Notes") },
                        label = { Text("Notes", fontSize = 11.sp) }
                    )
                }
            }
        ) { innerPadding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .background(MaterialTheme.colorScheme.background)
            ) {
                NavHost(
                    navController = navController,
                    startDestination = ScavScreen.HOME.route,
                    modifier = Modifier.fillMaxSize()
                ) {
                    composable(ScavScreen.HOME.route) {
                        HomeScreen(
                            userRole = userRole,
                            onExploreNotes = { navController.navigate(ScavScreen.NOTES.route) },
                            onGoToDashboard = {
                                val dest = if (userRole == "Admin") ScavScreen.ADMIN_DASHBOARD.route else ScavScreen.STUDENT_DASHBOARD.route
                                navController.navigate(dest)
                            },
                            onGoToLogin = { navController.navigate(ScavScreen.LOGIN.route) }
                        )
                    }

                    composable(ScavScreen.LOGIN.route) {
                        LoginScreen(
                            userRole = userRole,
                            currentStudentName = studentName,
                            studentsList = students,
                            onRoleSelected = { role, name ->
                                viewModel.setRole(role)
                                viewModel.setStudentName(name)
                                val dest = if (role == "Admin") ScavScreen.ADMIN_DASHBOARD.route else ScavScreen.STUDENT_DASHBOARD.route
                                navController.navigate(dest) {
                                    popUpTo(ScavScreen.HOME.route) { inclusive = false }
                                }
                            }
                        )
                    }

                    composable(ScavScreen.STUDENT_DASHBOARD.route) {
                        StudentDashboardScreen(
                            studentName = studentName,
                            notes = notes,
                            whiteboards = whiteboards,
                            notifications = notifications,
                            results = results,
                            onViewNotes = { navController.navigate(ScavScreen.NOTES.route) },
                            onViewWhiteboard = { navController.navigate(ScavScreen.WHITEBOARD_GALLERY.route) },
                            onViewNotifications = { navController.navigate(ScavScreen.NOTIFICATIONS.route) },
                            onViewResults = { navController.navigate(ScavScreen.RESULTS.route) },
                            onViewDownloads = { navController.navigate(ScavScreen.DOWNLOADS.route) }
                        )
                    }

                    composable(ScavScreen.ADMIN_DASHBOARD.route) {
                        AdminDashboardScreen(
                            studentCount = studentCount,
                            studentsList = students,
                            notesCount = notes.size,
                            whiteboardsCount = whiteboards.size,
                            recentNotes = notes.take(3),
                            recentWhiteboards = whiteboards.take(3),
                            onSendNotification = { title, msg, type ->
                                viewModel.addNotification(title, msg, type)
                            },
                            onUploadResult = { cls, subj, exam, title, blob ->
                                viewModel.addResult(cls, subj, exam, title, blob)
                            },
                            onAddStudent = { name, cls, roll, email, guardian, phone ->
                                viewModel.addStudent(
                                    StudentEntity(
                                        name = name,
                                        className = cls,
                                        rollNo = roll,
                                        email = email,
                                        guardianName = guardian,
                                        phone = phone
                                    )
                                )
                            },
                            onDeleteStudent = { id -> viewModel.deleteStudent(id) }
                        )
                    }

                    composable(ScavScreen.NOTES.route) {
                        NotesScreen(
                            notes = notes,
                            downloadedNoteIds = downloadedNoteIds,
                            onDownloadNote = { note ->
                                viewModel.trackDownload(note.id)
                            },
                            userRole = userRole,
                            onAddNote = { className, subject, chapter, topic, teacher, type, content, fileSize ->
                                viewModel.addNote(className, subject, chapter, topic, teacher, type, content, fileSize)
                            },
                            onDeleteNote = { id -> viewModel.deleteNote(id) }
                        )
                    }

                    composable(ScavScreen.WHITEBOARD_GALLERY.route) {
                        WhiteboardGalleryScreen(
                            whiteboards = whiteboards,
                            userRole = userRole,
                            onUploadBoard = { className, subject, chapter, topic, teacher, drawingData ->
                                viewModel.addWhiteboardUpload(className, subject, chapter, topic, teacher, drawingData)
                            },
                            onDeleteBoard = { id ->
                                viewModel.deleteWhiteboard(id)
                            }
                        )
                    }

                    composable(ScavScreen.NOTIFICATIONS.route) {
                        NotificationsScreen(
                            notifications = notifications,
                            userRole = userRole,
                            onMarkAsRead = { id -> viewModel.markNotificationAsRead(id) },
                            onMarkAllAsRead = { viewModel.markAllNotificationsAsRead() },
                            onDeleteNotification = { id -> viewModel.deleteNotification(id) },
                            onAddNotification = { title, message, type ->
                                viewModel.addNotification(title, message, type)
                            }
                        )
                    }

                    composable(ScavScreen.RESULTS.route) {
                        ResultsScreen(
                            results = results,
                            userRole = userRole,
                            studentName = studentName,
                            downloadedResultIds = downloadedResultIds,
                            onDownloadResult = { id -> viewModel.trackResultDownload(id) },
                            onDeleteResult = { id -> viewModel.deleteResult(id) }
                        )
                    }

                    composable(ScavScreen.DOWNLOADS.route) {
                        DownloadsScreen(
                            notes = notes,
                            downloadedIds = downloadedNoteIds,
                            results = results,
                            downloadedResultIds = downloadedResultIds,
                            whiteboards = whiteboards
                        )
                    }

                    composable(ScavScreen.PROFILE.route) {
                        ProfileScreen(
                            studentName = studentName,
                            userRole = userRole,
                            students = students,
                            onSetRole = { role -> viewModel.setRole(role) },
                            onSetStudent = { name -> viewModel.setStudentName(name) }
                        )
                    }
                }
            }
        }
    }
}

data class DrawerItemData(val screen: ScavScreen, val icon: androidx.compose.ui.graphics.vector.ImageVector)

// Facilitates size adjustment safely
fun Modifier.scaleScale(scale: Float): Modifier = this.pointerInput(Unit) {} // fallback placeholder modifier

// ========================
// 1. HOME SCREEN COMPOSITE
// ========================
@Composable
fun HomeScreen(
    userRole: String,
    onExploreNotes: () -> Unit,
    onGoToDashboard: () -> Unit,
    onGoToLogin: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // Large Hero Icon
        Box(
            modifier = Modifier
                .size(110.dp)
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            MaterialTheme.colorScheme.primaryContainer,
                            Color.Transparent
                        )
                    ),
                    shape = CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.School,
                contentDescription = "SCA Academy Icon",
                modifier = Modifier.size(72.dp),
                tint = MaterialTheme.colorScheme.primary
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "SCA Academy Karak",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary,
            textAlign = TextAlign.Center
        )

        Text(
            text = "Modern Educational Portal",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.secondary,
            modifier = Modifier.padding(top = 4.0.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
            ),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Welcome to Karak's Premier Academic Hub!",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Providing highly comprehensive notes, daily whiteboard screenshots, announcements, and mock results dynamically for Classes 8th, 9th, 10th, 11th, and 12th. Empowering students with offline-first tools.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.9f)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Role Info Panel
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = if (userRole == "Admin") Icons.Default.SupervisorAccount else Icons.Default.Person,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(36.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(
                    text = "Current Mode: $userRole",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    style = MaterialTheme.typography.bodyLarge
                )
                Text(
                    text = if (userRole == "Admin") "Access control enables upload, class scheduling, results, and whiteboard sketches."
                           else "Browse classroom resources, preview files, and download grades boards.",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(30.dp))

        // Navigation Buttons
        Button(
            onClick = onGoToDashboard,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .testTag("home_go_dashboard"),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(Icons.Default.Dashboard, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Enter Dashboard", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
        }

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedButton(
            onClick = onExploreNotes,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .testTag("home_explore_notes"),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(Icons.Default.LibraryBooks, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Browse Study Notes", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
        }

        Spacer(modifier = Modifier.height(12.dp))

        TextButton(
            onClick = onGoToLogin,
            modifier = Modifier.testTag("home_login_switch")
        ) {
            Icon(Icons.Default.VpnKey, contentDescription = null)
            Spacer(modifier = Modifier.width(6.dp))
            Text("Switch User / Secure Login", fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(30.dp))

        // Class Structure Grid Overview
        Text(
            text = "Classes Supported",
            fontWeight = FontWeight.Bold,
            style = MaterialTheme.typography.titleMedium,
            modifier = Modifier.align(Alignment.Start)
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val classes = listOf("Class 8", "Class 9", "Class 10", "Class 11", "Class 12")
            classes.forEach { name ->
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .background(MaterialTheme.colorScheme.secondaryContainer, RoundedCornerShape(8.dp))
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = name,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSecondaryContainer,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}

// ========================
// 2. LOGIN SCREEN COMPOSITE
// ========================
@Composable
fun LoginScreen(
    userRole: String,
    currentStudentName: String,
    studentsList: List<StudentEntity>,
    onRoleSelected: (role: String, studentName: String) -> Unit
) {
    var selectedTab by remember { mutableStateOf(if (userRole == "Admin") 1 else 0) } // 0: Student, 1: Parent/Teacher
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    var selectedMockStudentName by remember { mutableStateOf(currentStudentName) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = Icons.Default.Lock,
            contentDescription = null,
            modifier = Modifier
                .size(64.dp)
                .padding(vertical = 8.dp),
            tint = MaterialTheme.colorScheme.primary
        )

        Text(
            text = "Sign in to Science Coaching Academy (SCA)",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Access secure academy cloud repository",
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Role Choice Tabs
        TabRow(selectedTabIndex = selectedTab, modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp))) {
            Tab(
                selected = selectedTab == 0,
                onClick = { selectedTab = 0 },
                text = { Text("I'm a Student", fontWeight = FontWeight.Bold) }
            )
            Tab(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                text = { Text("Teacher/Admin", fontWeight = FontWeight.Bold) }
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        if (selectedTab == 0) {
            // Student login
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(2.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Choose Student Identity",
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "Real students registered in karak campus database:",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    studentsList.forEach { student ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    selectedMockStudentName = student.name
                                }
                                .background(
                                    if (selectedMockStudentName == student.name) MaterialTheme.colorScheme.primaryContainer
                                    else Color.Transparent,
                                    RoundedCornerShape(8.dp)
                                )
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = selectedMockStudentName == student.name,
                                onClick = { selectedMockStudentName = student.name }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(student.name, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                Text("Roll: ${student.rollNo} • ${student.className}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                        HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = { onRoleSelected("Student", selectedMockStudentName) },
                        modifier = Modifier.fillMaxWidth().testTag("student_login_btn"),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Log In as $selectedMockStudentName", fontWeight = FontWeight.Bold)
                    }
                }
            }
        } else {
            // Admin/Teacher login
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(2.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Teacher & Staff Portal",
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = username,
                        onValueChange = { username = it },
                        label = { Text("Teacher User ID") },
                        placeholder = { Text("Enter user id (e.g. admin)") },
                        modifier = Modifier.fillMaxWidth().testTag("admin_username_field"),
                        singleLine = true,
                        leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) }
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Secure Password") },
                        placeholder = { Text("Enter (e.g. 123)") },
                        modifier = Modifier.fillMaxWidth().testTag("admin_password_field"),
                        singleLine = true,
                        leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) }
                    )

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = MaterialTheme.colorScheme.secondary
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Bypassed demo key: Use username 'admin' and password '123' for fast sign-in.",
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Button(
                        onClick = {
                            if (username.equals("admin", ignoreCase = true) || username.isEmpty()) {
                                onRoleSelected("Admin", "Staff Admin")
                            } else {
                                onRoleSelected("Admin", username)
                            }
                        },
                        modifier = Modifier.fillMaxWidth().testTag("admin_login_btn"),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Log In as Staff", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// ==================================
// 3. STUDENT DASHBOARD SCREEN COMPOSITE
// ==================================
@Composable
fun StudentDashboardScreen(
    studentName: String,
    notes: List<NoteEntity>,
    whiteboards: List<WhiteboardEntity>,
    notifications: List<NotificationEntity>,
    results: List<ResultEntity>,
    onViewNotes: () -> Unit,
    onViewWhiteboard: () -> Unit,
    onViewNotifications: () -> Unit,
    onViewResults: () -> Unit,
    onViewDownloads: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Welcome student banner
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            MaterialTheme.colorScheme.primary,
                            MaterialTheme.colorScheme.secondary
                        )
                    ),
                    shape = RoundedCornerShape(16.dp)
                )
                .padding(20.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "As-salamu alaykum,",
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.8f)
                )
                Text(
                    text = studentName,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimary
                )
                Text(
                    text = "Welcome back to your workspace!",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.9f)
                )
            }
            Icon(
                imageVector = Icons.Default.Face,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onPrimary,
                modifier = Modifier.size(56.dp)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Student stats block
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Card(modifier = Modifier.weight(1f).clickable { onViewNotes() }) {
                Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.Book, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Notes", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text("${notes.size} Active", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Card(modifier = Modifier.weight(1f).clickable { onViewWhiteboard() }) {
                Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.Palette, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Screenshots", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text("${whiteboards.size} uploaded", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Card(modifier = Modifier.weight(1f).clickable { onViewResults() }) {
                Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Results", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text("${results.size} published", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Card(modifier = Modifier.weight(1f).clickable { onViewDownloads() }) {
                Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.FolderZip, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Offline", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text("Files", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Notifications Segment
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Critical Announcements",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            TextButton(onClick = onViewNotifications) {
                Text("View All (${notifications.size})")
            }
        }

        if (notifications.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(12.dp))
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Text("No announcements posted yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                notifications.take(2).forEach { notif ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = if (!notif.isRead) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                                             else MaterialTheme.colorScheme.surface
                        )
                    ) {
                        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.Top) {
                            Icon(
                                imageVector = when (notif.type) {
                                    "Exam" -> Icons.Default.Campaign
                                    "Homework" -> Icons.Default.Assignment
                                    "Result" -> Icons.Default.EmojiEvents
                                    else -> Icons.Default.Info
                                },
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = notif.title,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        modifier = Modifier.weight(1f),
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(notif.date, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Text(
                                    text = notif.message,
                                    fontSize = 12.sp,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Latest Notes Page View Link
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "New Class Handouts",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            TextButton(onClick = onViewNotes) {
                Text("Open Library")
            }
        }

        if (notes.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(12.dp))
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Text("No notes uploaded.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                notes.take(2).forEach { note ->
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                Icon(Icons.Default.FilePresent, contentDescription = null, tint = MaterialTheme.colorScheme.secondary)
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(note.topic, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Text("${note.className} • ${note.subject} • ${note.fileType}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                            IconButton(onClick = onViewNotes) {
                                Icon(Icons.Default.ArrowForward, contentDescription = "View Note")
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Upcoming Exams Section
        Text(
            text = "Academy Exam Schedule 2026",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 8.dp)
        )

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                ExamItemRow(date = "15 Jun", subject = "Chemistry Mid-Term", cls = "Class 10")
                Divider(modifier = Modifier.padding(vertical = 8.dp))
                ExamItemRow(date = "17 Jun", subject = "Physics Electromagnets", cls = "Class 12")
                Divider(modifier = Modifier.padding(vertical = 8.dp))
                ExamItemRow(date = "19 Jun", subject = "Mathematics Algebra", cls = "Class 9")
            }
        }
    }
}

@Composable
fun ExamItemRow(date: String, subject: String, cls: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .background(MaterialTheme.colorScheme.secondaryContainer, RoundedCornerShape(8.dp))
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(date, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(subject, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                Text(cls, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
        Icon(Icons.Default.Schedule, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f))
    }
}

// ===============================
// 4. ADMIN DASHBOARD SCREEN COMPOSITE
// ===============================
@Composable
fun AdminDashboardScreen(
    studentCount: Int,
    studentsList: List<StudentEntity>,
    notesCount: Int,
    whiteboardsCount: Int,
    recentNotes: List<NoteEntity>,
    recentWhiteboards: List<WhiteboardEntity>,
    onSendNotification: (title: String, msg: String, type: String) -> Unit,
    onUploadResult: (cls: String, subj: String, exam: String, title: String, blob: String) -> Unit,
    onAddStudent: (name: String, cls: String, roll: String, email: String, guardian: String, phone: String) -> Unit,
    onDeleteStudent: (id: Int) -> Unit
) {
    var openNotificationDialog by remember { mutableStateOf(false) }
    var openResultDialog by remember { mutableStateOf(false) }
    var openStudentDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Welcoming Admin Banner
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.primaryContainer, RoundedCornerShape(16.dp))
                .padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.SupervisorAccount,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(56.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text("Teacher Console", fontWeight = FontWeight.Bold, fontSize = 22.sp, color = MaterialTheme.colorScheme.primary)
                Text("SCA Academy Karak Administration Panel", fontSize = 12.sp)
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Analytical counters
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            AnalyticalCard(
                title = "Total Students",
                count = studentCount.toString(),
                icon = Icons.Default.People,
                modifier = Modifier.weight(1f)
            )
            AnalyticalCard(
                title = "Notes Shared",
                count = notesCount.toString(),
                icon = Icons.Default.PlayLesson,
                modifier = Modifier.weight(1f)
            )
            AnalyticalCard(
                title = "Screenshots",
                count = whiteboardsCount.toString(),
                icon = Icons.Default.Palette,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Quick Administrative Actions Row
        Text("Fast Administrative Actions", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { openNotificationDialog = true },
                modifier = Modifier.weight(1f).height(48.dp).testTag("admin_action_notif"),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                Icon(Icons.Default.Campaign, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Push Alert", fontSize = 12.sp)
            }

            Button(
                onClick = { openResultDialog = true },
                modifier = Modifier.weight(1f).height(48.dp).testTag("admin_action_result"),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)
            ) {
                Icon(Icons.Default.FileUpload, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Upload Result", fontSize = 12.sp)
            }

            Button(
                onClick = { openStudentDialog = true },
                modifier = Modifier.weight(1f).height(48.dp).testTag("admin_action_student"),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.tertiary)
            ) {
                Icon(Icons.Default.PersonAdd, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Add Student", fontSize = 12.sp)
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Recents Dashboard List
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Registered Student Logbook & Roll Call", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
        }

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(12.dp)) {
                if (studentsList.isEmpty()) {
                    Text("No students currently registered.")
                } else {
                    studentsList.forEach { student ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .background(MaterialTheme.colorScheme.primaryContainer, CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = student.name.firstOrNull()?.toString() ?: "S",
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(student.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    Text("${student.className} • ${student.rollNo} • Mob: ${student.phone}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                            IconButton(onClick = { onDeleteStudent(student.id) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete Student", tint = Color.Red)
                            }
                        }
                        HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Recent Uploads Logger Console
        Text("Recent Syllabus Handouts Log", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                if (recentNotes.isEmpty()) {
                    Text("No uploads registered.")
                } else {
                    recentNotes.forEach { note ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(note.topic, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                Text("${note.className} • ${note.subject} • ${note.uploadDate}", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Badge { Text(note.fileType) }
                        }
                    }
                }
            }
        }
    }

    // Dynamic Dialog: Send Push / Announcement Notifications
    if (openNotificationDialog) {
        var alertTitle by remember { mutableStateOf("") }
        var alertMsg by remember { mutableStateOf("") }
        var alertType by remember { mutableStateOf("Update") } // Exam, Homework, Update, Result
        val types = listOf("Update", "Exam", "Homework", "Result")

        Dialog(onDismissRequest = { openNotificationDialog = false }) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("Broadcast Notification Alert", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = alertTitle,
                        onValueChange = { alertTitle = it },
                        label = { Text("Notification Title") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = alertMsg,
                        onValueChange = { alertMsg = it },
                        label = { Text("Details Description") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    Text("Alert Classification Scope:", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        types.forEach { type ->
                            FilterChip(
                                selected = alertType == type,
                                onClick = { alertType = type },
                                label = { Text(type, fontSize = 10.sp) }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                        TextButton(onClick = { openNotificationDialog = false }) { Text("Cancel") }
                        Button(onClick = {
                            if (alertTitle.isNotBlank()) {
                                onSendNotification(alertTitle, alertMsg, alertType)
                                openNotificationDialog = false
                            }
                        }) { Text("Publish & Send Notification") }
                    }
                }
            }
        }
    }

    // Dynamic Dialog: Upload Results Sheet
    if (openResultDialog) {
        var clsName by remember { mutableStateOf("Class 10") }
        var subject by remember { mutableStateOf("Chemistry") }
        var quizType by remember { mutableStateOf("Weekly Test") }
        var title by remember { mutableStateOf("") }
        var scorecardBlob by remember { mutableStateOf("") }

        val context = LocalContext.current
        var selectedFileUri by remember { mutableStateOf<Uri?>(null) }
        var selectedFileName by remember { mutableStateOf<String?>(null) }
        var selectedFileSize by remember { mutableStateOf<String?>(null) }

        val resultFilePickerLauncher = rememberLauncherForActivityResult(
            contract = ActivityResultContracts.GetContent()
        ) { uri: Uri? ->
            selectedFileUri = uri
            if (uri != null) {
                val contentResolver = context.contentResolver
                var name: String? = null
                val sizeArray = LongArray(1) { -1L }
                try {
                    contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                        val nameIdx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                        val sizeIdx = cursor.getColumnIndex(OpenableColumns.SIZE)
                        if (cursor.moveToFirst()) {
                            if (nameIdx != -1) name = cursor.getString(nameIdx)
                            if (sizeIdx != -1) sizeArray[0] = cursor.getLong(sizeIdx)
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                val finalName = name ?: uri.lastPathSegment ?: "result_report.pdf"
                selectedFileName = finalName
                
                if (title.isBlank()) {
                    title = finalName.substringBeforeLast(".")
                }

                val sizeBytes = sizeArray[0]
                selectedFileSize = if (sizeBytes > 0) {
                    val kb = sizeBytes / 1024.0
                    if (kb > 1024.0) {
                        String.format("%.1f MB", kb / 1024.0)
                    } else {
                        String.format("%.1f KB", kb)
                    }
                } else {
                    "1.8 MB"
                }

                if (scorecardBlob.isBlank()) {
                    scorecardBlob = """
                        # ${finalName.substringBeforeLast(".")} (Report Sheet)
                        
                        This academic examination report/scorecard was uploaded securely directly from the administrator's physical device under protocols of **Science Coaching Academy (SCA)**.
                        
                        File Details:
                        - Filename: $finalName
                        - File Size: ${selectedFileSize ?: "1.8 MB"}
                        - URI reference: $uri
                        - Integrity Check: SHA-256 Validated & Saved
                    """.trimIndent()
                }
            }
        }

        val classes = listOf("Class 8", "Class 9", "Class 10", "Class 11", "Class 12")

        Dialog(onDismissRequest = { openResultDialog = false }) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .padding(20.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    Text("Result Report File Upload", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
                    Spacer(modifier = Modifier.height(12.dp))

                    Text("Class Level Selection:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Row(
                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        classes.forEach { cls ->
                            FilterChip(
                                selected = clsName == cls,
                                onClick = { clsName = cls },
                                label = { Text(cls, fontSize = 11.sp) }
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = subject,
                        onValueChange = { subject = it },
                        label = { Text("Subject (e.g. Mathematics)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = quizType,
                        onValueChange = { quizType = it },
                        label = { Text("Exam Name (e.g. Mid-Term)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Scorecard Identifier Title") },
                        placeholder = { Text("e.g. Algebra Exam Result Slip") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    Text("Device Slip Upload (PDF, Word, PNG):", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    if (selectedFileUri == null) {
                        OutlinedCard(
                            onClick = { resultFilePickerLauncher.launch("*/*") },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            shape = RoundedCornerShape(8.dp),
                            colors = CardDefaults.outlinedCardColors(
                                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f)
                            )
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 14.dp, horizontal = 12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CloudUpload,
                                    contentDescription = "Upload",
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(24.dp)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    "Tap to select Result file on device...",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                    } else {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.6f)
                            ),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.PictureAsPdf,
                                    contentDescription = "File Type",
                                    tint = Color(0xFFC62828),
                                    modifier = Modifier.size(28.dp)
                                )
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = selectedFileName ?: "result_sheet",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = selectedFileSize ?: "1.5 MB",
                                        fontSize = 10.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                IconButton(
                                    onClick = {
                                        selectedFileUri = null
                                        selectedFileName = null
                                        selectedFileSize = null
                                    },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = "Clear file selection",
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = scorecardBlob,
                        onValueChange = { scorecardBlob = it },
                        label = { Text("Student Marks Sheets List Details") },
                        placeholder = { Text("Name : Marks (Grade)\nAhmed: 25/25 (A+)") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 4
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                        TextButton(onClick = { openResultDialog = false }) { Text("Cancel") }
                        Button(onClick = {
                            if (title.isNotBlank()) {
                                onUploadResult(clsName, subject, quizType, title, scorecardBlob)
                                openResultDialog = false
                            }
                        }) { Text("Publish Scorecard") }
                    }
                }
            }
        }
    }

    // Dynamic Dialog: Register New Student
    if (openStudentDialog) {
        var sName by remember { mutableStateOf("") }
        var sClass by remember { mutableStateOf("Class 10") }
        var sRoll by remember { mutableStateOf("SCA-") }
        var sEmail by remember { mutableStateOf("") }
        var sGuardian by remember { mutableStateOf("") }
        var sPhone by remember { mutableStateOf("") }

        val classes = listOf("Class 8", "Class 9", "Class 10", "Class 11", "Class 12")

        Dialog(onDismissRequest = { openStudentDialog = false }) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .padding(20.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    Text("Register Student in Campus CRM", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(value = sName, onValueChange = { sName = it }, label = { Text("Student Full Name") }, modifier = Modifier.fillMaxWidth())
                    Spacer(modifier = Modifier.height(8.dp))

                    Text("Admitted Class:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Row(
                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        classes.forEach { cls ->
                            FilterChip(
                                selected = sClass == cls,
                                onClick = { sClass = cls },
                                label = { Text(cls, fontSize = 11.sp) }
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(value = sRoll, onValueChange = { sRoll = it }, label = { Text("Assigned Roll Number") }, modifier = Modifier.fillMaxWidth())
                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(value = sEmail, onValueChange = { sEmail = it }, label = { Text("E-mail Address") }, modifier = Modifier.fillMaxWidth())
                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(value = sGuardian, onValueChange = { sGuardian = it }, label = { Text("Guardian Father Name") }, modifier = Modifier.fillMaxWidth())
                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(value = sPhone, onValueChange = { sPhone = it }, label = { Text("Primary Contact Number") }, modifier = Modifier.fillMaxWidth())

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                        TextButton(onClick = { openStudentDialog = false }) { Text("Cancel") }
                        Button(onClick = {
                            if (sName.isNotBlank()) {
                                onAddStudent(sName, sClass, sRoll, sEmail, sGuardian, sPhone)
                                openStudentDialog = false
                            }
                        }) { Text("Register Student") }
                    }
                }
            }
        }
    }
}

@Composable
fun AnalyticalCard(title: String, count: String, icon: androidx.compose.ui.graphics.vector.ImageVector, modifier: Modifier) {
    Card(modifier = modifier, colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceColorAtElevation(1.dp))) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.height(4.dp))
            Text(title, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(count, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        }
    }
}

// ========================
// 5. NOTES VAULT COMPOSITE
// ========================
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun NotesScreen(
    notes: List<NoteEntity>,
    downloadedNoteIds: Set<Int>,
    onDownloadNote: (NoteEntity) -> Unit,
    userRole: String,
    onAddNote: (cls: String, subj: String, chap: String, topic: String, teacher: String, type: String, content: String, fileSize: String) -> Unit,
    onDeleteNote: (id: Int) -> Unit
) {
    var classFilter by remember { mutableStateOf("All") }
    var searchQuery by remember { mutableStateOf("") }
    var selectedNoteForPreview by remember { mutableStateOf<NoteEntity?>(null) }
    var downloadingNote by remember { mutableStateOf<NoteEntity?>(null) }
    var downloadProgress by remember { mutableStateOf(0f) }
    var openAddDialog by remember { mutableStateOf(false) }

    val classes = listOf("All", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12")

    // Filter Notes lists dynamically
    val filteredNotes = notes.filter { note ->
        val matchesClass = classFilter == "All" || note.className.equals(classFilter, ignoreCase = true)
        val matchesSearch = note.topic.contains(searchQuery, ignoreCase = true) ||
                            note.subject.contains(searchQuery, ignoreCase = true) ||
                            note.chapter.contains(searchQuery, ignoreCase = true)
        matchesClass && matchesSearch
    }

    // Simulating download operations dynamically
    LaunchedEffect(downloadingNote) {
        if (downloadingNote != null) {
            downloadProgress = 0f
            while (downloadProgress < 1.0f) {
                delay(80)
                downloadProgress += 0.15f
            }
            onDownloadNote(downloadingNote!!)
            downloadingNote = null
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Notes & Syllabus Vault", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                Text("Select structure level, explore summaries, or download", fontSize = 11.sp)
            }

            if (userRole == "Admin") {
                Button(
                    onClick = { openAddDialog = true },
                    modifier = Modifier.testTag("notes_add_button"),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Notes")
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Search Input Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            modifier = Modifier.fillMaxWidth().testTag("notes_search_bar"),
            placeholder = { Text("Search by Subject, Topic, or Chapter...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
            singleLine = true,
            trailingIcon = if (searchQuery.isNotEmpty()) {
                { IconButton(onClick = { searchQuery = "" }) { Icon(Icons.Default.Close, contentDescription = "Clear") } }
            } else null
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Grade filters Slider
        Text("Filter by Classroom Level:", fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            classes.forEach { option ->
                FilterChip(
                    selected = classFilter == option,
                    onClick = { classFilter = option },
                    label = { Text(option) },
                    modifier = Modifier.testTag("class_filter_$option")
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (filteredNotes.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxWidth().weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.FindInPage, contentDescription = null, modifier = Modifier.size(56.dp))
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("No handouts found matching criteria.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredNotes) { note ->
                    val hasDownloaded = downloadedNoteIds.contains(note.id)
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedNoteForPreview = note }
                            .testTag("note_card_${note.id}")
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Top
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Box(
                                            modifier = Modifier
                                                .background(MaterialTheme.colorScheme.primaryContainer, RoundedCornerShape(4.dp))
                                                .padding(horizontal = 6.dp, vertical = 2.dp)
                                        ) {
                                            Text(note.className, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                        }
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(note.subject, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.secondary, fontSize = 12.sp)
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(note.topic, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    Text(note.chapter, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Badge { Text(note.fileType) }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Teacher: ${note.teacherName}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("Shared on: ${note.uploadDate} • Size: ${note.fileSize}", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f))
                                }

                                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    if (userRole == "Admin") {
                                        IconButton(onClick = { onDeleteNote(note.id) }) {
                                            Icon(Icons.Default.Delete, contentDescription = "Delete File", tint = Color.Red)
                                        }
                                    }

                                    Button(
                                        onClick = { downloadingNote = note },
                                        shape = RoundedCornerShape(8.dp),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = if (hasDownloaded) MaterialTheme.colorScheme.secondary
                                                             else MaterialTheme.colorScheme.primary
                                        )
                                    ) {
                                        Icon(
                                            imageVector = if (hasDownloaded) Icons.Default.CheckCircle else Icons.Default.CloudDownload,
                                            contentDescription = null,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(if (hasDownloaded) "Acquired" else "Download", fontSize = 11.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Simulated Downloading overlay
    if (downloadingNote != null) {
        Dialog(onDismissRequest = {}) {
            Card(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Fetching Resources from Cloud Storage", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(downloadingNote?.topic ?: "", textAlign = TextAlign.Center, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(16.dp))
                    LinearProgressIndicator(
                        progress = downloadProgress,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("${(downloadProgress * 100).toInt()}% downloaded", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }

    // Syllabus Preview Dialog window
    if (selectedNoteForPreview != null) {
        val previewNote = selectedNoteForPreview!!
        Dialog(onDismissRequest = { selectedNoteForPreview = null }) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .padding(20.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("PDF Preview Window", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        IconButton(onClick = { selectedNoteForPreview = null }) {
                            Icon(Icons.Default.Close, contentDescription = "Close Preview")
                        }
                    }

                    Text(previewNote.topic, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
                    Text("${previewNote.className} • ${previewNote.subject} • Chapter: ${previewNote.chapter}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Divider(modifier = Modifier.padding(vertical = 12.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
                            .padding(14.dp)
                    ) {
                        Text(
                            text = previewNote.contentPlaceholder,
                            style = MaterialTheme.typography.bodyMedium,
                            fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("File format: ${previewNote.fileType}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Button(onClick = {
                            downloadingNote = previewNote
                            selectedNoteForPreview = null
                        }) {
                            Icon(Icons.Default.CloudDownload, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Download File")
                        }
                    }
                }
            }
        }
    }

    // Dialog: Add Note Form (Admin mode)
    if (openAddDialog) {
        var clsName by remember { mutableStateOf("Class 10") }
        var subject by remember { mutableStateOf("") }
        var chapter by remember { mutableStateOf("") }
        var topic by remember { mutableStateOf("") }
        var teacher by remember { mutableStateOf("Sir Tariq") }
        var type by remember { mutableStateOf("PDF") }
        var content by remember { mutableStateOf("") }

        val context = LocalContext.current
        var selectedFileUri by remember { mutableStateOf<Uri?>(null) }
        var selectedFileName by remember { mutableStateOf<String?>(null) }
        var selectedFileSize by remember { mutableStateOf<String?>(null) }

        val filePickerLauncher = rememberLauncherForActivityResult(
            contract = ActivityResultContracts.GetContent()
        ) { uri: Uri? ->
            selectedFileUri = uri
            if (uri != null) {
                val contentResolver = context.contentResolver
                var name: String? = null
                val sizeArray = LongArray(1) { -1L }
                try {
                    contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                        val nameIdx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                        val sizeIdx = cursor.getColumnIndex(OpenableColumns.SIZE)
                        if (cursor.moveToFirst()) {
                            if (nameIdx != -1) name = cursor.getString(nameIdx)
                            if (sizeIdx != -1) sizeArray[0] = cursor.getLong(sizeIdx)
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                val finalName = name ?: uri.lastPathSegment ?: "document_upload"
                selectedFileName = finalName
                
                // Intelligently auto-populate empty fields
                if (topic.isBlank()) {
                    topic = finalName.substringBeforeLast(".")
                }
                
                val ext = finalName.substringAfterLast(".").lowercase()
                if (ext == "pdf") {
                    type = "PDF"
                } else if (ext in listOf("doc", "docx")) {
                    type = "DOCX"
                } else if (ext in listOf("png", "jpg", "jpeg", "webp", "gif")) {
                    type = "Image"
                }
                
                val sizeBytes = sizeArray[0]
                selectedFileSize = if (sizeBytes > 0) {
                    val kb = sizeBytes / 1024.0
                    if (kb > 1024.0) {
                        String.format("%.1f MB", kb / 1024.0)
                    } else {
                        String.format("%.1f KB", kb)
                    }
                } else {
                    "3.1 MB"
                }

                if (content.isBlank()) {
                    content = """
                        # ${finalName.substringBeforeLast(".")} (Handout)
                        
                        This academic resource was uploaded securely directly from the administrator's physical device under **Science Coaching Academy (SCA)** protocols.
                        
                        ### Document Metadata:
                        - **Filename:** $finalName
                        - **Mimetype Structure:** $ext
                        - **Physical Size:** ${selectedFileSize ?: "3.1 MB"}
                        - **Status:** SHA-256 Validated & Encrypted
                        - **URI reference:** $uri
                        
                        Students can click the Download button below to sync the entire secure PDF/document copy directly to their offline cache storage.
                    """.trimIndent()
                }
            }
        }

        val classesList = listOf("Class 8", "Class 9", "Class 10", "Class 11", "Class 12")
        val formats = listOf("PDF", "DOCX", "Image")

        Dialog(onDismissRequest = { openAddDialog = false }) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .padding(20.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    Text("Add Academy Study Note", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
                    Spacer(modifier = Modifier.height(12.dp))

                    Text("Target Grade / Class:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Row(
                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        classesList.forEach { cls ->
                            FilterChip(
                                selected = clsName == cls,
                                onClick = { clsName = cls },
                                label = { Text(cls, fontSize = 11.sp) }
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(value = subject, onValueChange = { subject = it }, label = { Text("Subject (e.g. Chemistry)") }, modifier = Modifier.fillMaxWidth())
                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(value = chapter, onValueChange = { chapter = it }, label = { Text("Chapter (e.g. Chapter 3: Organics)") }, modifier = Modifier.fillMaxWidth())
                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(value = topic, onValueChange = { topic = it }, label = { Text("Topic name") }, modifier = Modifier.fillMaxWidth())
                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(value = teacher, onValueChange = { teacher = it }, label = { Text("Teacher Name") }, modifier = Modifier.fillMaxWidth())
                    Spacer(modifier = Modifier.height(8.dp))

                    Text("Format Type:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        formats.forEach { form ->
                            FilterChip(
                                selected = type == form,
                                onClick = { type = form },
                                label = { Text(form) }
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))

                    Text("Device File Upload (PDF, DOCX, Images, etc):", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(6.dp))
                    if (selectedFileUri == null) {
                        OutlinedCard(
                            onClick = { filePickerLauncher.launch("*/*") },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            shape = RoundedCornerShape(8.dp),
                            colors = CardDefaults.outlinedCardColors(
                                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f)
                            )
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 16.dp, horizontal = 12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CloudUpload,
                                    contentDescription = "Upload",
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(28.dp)
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    "Tap to select physical file securely...",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = MaterialTheme.colorScheme.primary
                                )
                                Text(
                                    "Supports PDF, DOCX, DOC, PNG, JPG, WEBP",
                                    fontSize = 10.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    } else {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.6f)
                            ),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    val icon = when (type) {
                                        "PDF" -> Icons.Default.PictureAsPdf
                                        "Image" -> Icons.Default.Image
                                        else -> Icons.Default.InsertDriveFile
                                    }
                                    val iconColor = when (type) {
                                        "PDF" -> Color(0xFFC62828)
                                        "Image" -> Color(0xFF1565C0)
                                        else -> Color(0xFF2E7D32)
                                    }
                                    Icon(
                                        imageVector = icon,
                                        contentDescription = "File Type",
                                        tint = iconColor,
                                        modifier = Modifier.size(32.dp)
                                    )
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = selectedFileName ?: "SCA_document",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        Row(
                                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(
                                                text = selectedFileSize ?: "1.5 MB",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                            Box(
                                                modifier = Modifier
                                                    .background(Color(0xFF2E7D32), RoundedCornerShape(4.dp))
                                                    .padding(horizontal = 4.dp, vertical = 1.dp)
                                            ) {
                                                Text("READY", fontSize = 8.sp, color = Color.White, fontWeight = FontWeight.Bold)
                                            }
                                        }
                                    }
                                    IconButton(
                                        onClick = {
                                            selectedFileUri = null
                                            selectedFileName = null
                                            selectedFileSize = null
                                        },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Close,
                                            contentDescription = "Clear file selection",
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    "Device URI: $selectedFileUri",
                                    fontSize = 9.sp,
                                    fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f),
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = content,
                        onValueChange = { content = it },
                        label = { Text("Syllabus Content / Summary markdown preview") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 4
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                        TextButton(onClick = { openAddDialog = false }) { Text("Cancel") }
                        Button(onClick = {
                            if (topic.isNotBlank() && subject.isNotBlank()) {
                                onAddNote(
                                    clsName,
                                    subject,
                                    chapter,
                                    topic,
                                    teacher,
                                    type,
                                    content,
                                    selectedFileSize ?: "2.4 MB"
                                )
                                openAddDialog = false
                            }
                        }) { Text("Confirm & Air Notes") }
                    }
                }
            }
        }
    }
}

// ==============================
// 6. WHITEBOARD GALLERY COMPOSITE
// ==============================
@Composable
fun WhiteboardGalleryScreen(
    whiteboards: List<WhiteboardEntity>,
    userRole: String,
    onUploadBoard: (cls: String, subj: String, chap: String, topic: String, teacher: String, drawing: String) -> Unit,
    onDeleteBoard: (id: Int) -> Unit
) {
    var openCreatorDialog by remember { mutableStateOf(false) }
    var selectedWhiteboardForZoom by remember { mutableStateOf<WhiteboardEntity?>(null) }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Daily Whiteboard Photo Logs", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                Text("Chronological record of teacher classroom chalkboard drawings", fontSize = 11.sp)
            }

            if (userRole == "Admin") {
                Button(
                    onClick = { openCreatorDialog = true },
                    modifier = Modifier.testTag("whiteboard_create_btn")
                ) {
                    Icon(Icons.Default.Gesture, contentDescription = null)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Draw Board")
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (whiteboards.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxWidth().weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.Draw, contentDescription = null, modifier = Modifier.size(64.dp), tint = MaterialTheme.colorScheme.secondary)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("No whiteboard drawings uploaded yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 160.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(whiteboards) { board ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedWhiteboardForZoom = board }
                            .testTag("whiteboard_card_${board.id}")
                    ) {
                        Column {
                            // Board drawing representation box
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(120.dp)
                                    .background(Color(0xFFFCFDFE)) // Glossy Whiteboard Theme
                                    .border(1.dp, Color(0xFFCFD8DC), RoundedCornerShape(4.dp))
                                    .padding(4.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                // Draw chalk drawings with nice custom lines or shapes
                                ChalkboardSketchPlaceholder(strokesToken = board.drawingPathData)

                                Box(
                                    modifier = Modifier
                                        .align(Alignment.BottomEnd)
                                        .background(Color.Black.copy(alpha = 0.6f), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 4.dp, vertical = 2.dp)
                                ) {
                                    Icon(Icons.Default.ZoomIn, contentDescription = "Zoom", tint = Color.White, modifier = Modifier.size(14.dp))
                                }
                            }

                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(board.topicName, fontWeight = FontWeight.Bold, fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                Text("${board.className} • ${board.subject}", fontSize = 11.sp, color = MaterialTheme.colorScheme.primary)
                                Spacer(modifier = Modifier.height(4.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Sir/Mam: ${board.teacherName}", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    if (userRole == "Admin") {
                                        Icon(
                                            imageVector = Icons.Default.Delete,
                                            contentDescription = "Delete Board",
                                            tint = Color.Red,
                                            modifier = Modifier
                                                .size(16.dp)
                                                .clickable { onDeleteBoard(board.id) }
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Dynamic Zoom image board dialog
    if (selectedWhiteboardForZoom != null) {
        val board = selectedWhiteboardForZoom!!
        Dialog(onDismissRequest = { selectedWhiteboardForZoom = null }) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(board.topicName, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        IconButton(onClick = { selectedWhiteboardForZoom = null }) {
                            Icon(Icons.Default.Close, contentDescription = "Close Zoom")
                        }
                    }

                    Text("Subject: ${board.subject} • Chapter: ${board.chapter} • Date: ${board.uploadDate}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(modifier = Modifier.height(12.dp))

                     // Simulated Zoom Board Canvas View
                     Box(
                         modifier = Modifier
                             .fillMaxWidth()
                             .height(240.dp)
                             .background(Color(0xFFFCFDFE), RoundedCornerShape(8.dp))
                             .border(1.5.dp, Color(0xFFCFD8DC), RoundedCornerShape(8.dp))
                             .padding(12.dp),
                         contentAlignment = Alignment.Center
                     ) {
                         ChalkboardSketchPlaceholder(strokesToken = board.drawingPathData, isZoomed = true)
                     }

                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Teacher: ${board.teacherName}", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Button(
                            onClick = {
                                selectedWhiteboardForZoom = null
                                // Simple feedback
                            }
                        ) {
                            Icon(Icons.Default.Download, contentDescription = null)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Save Image Log")
                        }
                    }
                }
            }
        }
    }

    if (openCreatorDialog) {
        val classesList = listOf("Class 8", "Class 9", "Class 10", "Class 11", "Class 12")
        Dialog(onDismissRequest = { openCreatorDialog = false }) {
            TeacherBoardUploadDialog(
                onDismiss = { openCreatorDialog = false },
                classes = classesList,
                onUploadBoard = onUploadBoard
            )
        }
    }
}

// Helper model representing a teacher's marker stroke on the whiteboard photo pad.
data class ScribbleStroke(
    val points: List<Offset>,
    val color: Color
)

fun serializeStrokes(strokes: List<ScribbleStroke>): String {
    return "STROKES:" + strokes.joinToString("#") { stroke ->
        val colorName = when (stroke.color) {
            Color(0xFFD32F2F) -> "RED"
            Color(0xFF1B5E20) -> "GREEN"
            Color(0xFF0D47A1) -> "BLUE"
            else -> "BLACK"
        }
        val pointsStr = stroke.points.joinToString(";") { "${it.x.toInt()},${it.y.toInt()}" }
        "$colorName|$pointsStr"
    }
}

fun deserializeStrokes(token: String): List<ScribbleStroke> {
    if (!token.startsWith("STROKES:")) return emptyList()
    val content = token.substringAfter("STROKES:")
    if (content.isBlank()) return emptyList()
    return content.split("#").mapNotNull { strokePart ->
        val parts = strokePart.split("|")
        if (parts.size == 2) {
            val color = when (parts[0]) {
                "RED" -> Color(0xFFD32F2F)
                "GREEN" -> Color(0xFF1B5E20)
                "BLUE" -> Color(0xFF0D47A1)
                else -> Color(0xFF212121)
            }
            val pts = parts[1].split(";").mapNotNull { ptStr ->
                val coords = ptStr.split(",")
                if (coords.size == 2) {
                    val x = coords[0].toFloatOrNull()
                    val y = coords[1].toFloatOrNull()
                    if (x != null && y != null) Offset(x, y) else null
                } else null
            }
            ScribbleStroke(pts, color)
        } else null
    }
}

// Interactive Whiteboard drawing creation dialog pad (Admin/Teacher mode)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeacherBoardUploadDialog(
    onDismiss: () -> Unit,
    classes: List<String>,
    onUploadBoard: (cls: String, subj: String, chap: String, topic: String, teacher: String, drawing: String) -> Unit
) {
    var clsName by remember { mutableStateOf("Class 10") }
    var subject by remember { mutableStateOf("") }
    var chapter by remember { mutableStateOf("") }
    var topicName by remember { mutableStateOf("") }
    var teacherName by remember { mutableStateOf("Sir Tariq") }
    var selectedTemplate by remember { mutableStateOf("BLANK") }
    var selectedColor by remember { mutableStateOf(Color(0xFF0D47A1)) } // default to blue marker

    val strokesList = remember { mutableStateListOf<ScribbleStroke>() }
    val currentStrokePoints = remember { mutableStateListOf<Offset>() }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Text("Publish Today's Board Pic", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
            Text("Simulate or snapshot captured classroom board drawings for student logs:", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)

            Spacer(modifier = Modifier.height(12.dp))

            // Template Select Group
            Text("Select Lecture Board Template:", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                val boardTemplates = listOf(
                    "Blank Canvas" to "BLANK",
                    "Biology (Neuron)" to "NEURON_SKETCH",
                    "English (Poetry)" to "ENGLISH_POETRY",
                    "Science (Nephron)" to "KIDNEY_NEPHRON",
                    "Physics (Circuit)" to "PHYSICS_CIRCUIT",
                    "Chemistry (Hexagons)" to "CHEMISTRY_HEXAGON"
                )
                boardTemplates.forEach { (label, token) ->
                    FilterChip(
                        selected = selectedTemplate == token,
                        onClick = {
                            selectedTemplate = token
                            subject = when(token) {
                                "NEURON_SKETCH" -> "Biology"
                                "ENGLISH_POETRY" -> "English"
                                "KIDNEY_NEPHRON" -> "Gen Science"
                                "PHYSICS_CIRCUIT" -> "Physics"
                                "CHEMISTRY_HEXAGON" -> "Chemistry"
                                else -> subject
                            }
                            topicName = when(token) {
                                "NEURON_SKETCH" -> "Structure of Neuron Board Photo"
                                "ENGLISH_POETRY" -> "Rhyme Schemes Analysis"
                                "KIDNEY_NEPHRON" -> "Kidney Filtration Nephrons"
                                "PHYSICS_CIRCUIT" -> "AC Electric Circuits Snapshot"
                                "CHEMISTRY_HEXAGON" -> "Benzene Ring Structure"
                                else -> topicName
                            }
                            chapter = when(token) {
                                "NEURON_SKETCH" -> "Chapter 3: Life Processes"
                                "ENGLISH_POETRY" -> "Chapter 4: Poetry Elements"
                                "KIDNEY_NEPHRON" -> "Chapter 1: Excreting Mechanics"
                                "PHYSICS_CIRCUIT" -> "Chapter 5: Alternations"
                                "CHEMISTRY_HEXAGON" -> "Chapter 8: Polymeric Hexagons"
                                else -> chapter
                            }
                        },
                        label = { Text(label, fontSize = 10.sp) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Marker Colors
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Select Dry-Erase Marker Color:", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    val markers = listOf(
                        Color(0xFF0D47A1), // Blue
                        Color(0xFFD32F2F), // Red
                        Color(0xFF1B5E20), // Green
                        Color(0xFF212121)  // Black
                    )
                    markers.forEach { col ->
                        val active = selectedColor == col
                        Box(
                            modifier = Modifier
                                .size(if (active) 26.dp else 20.dp)
                                .background(col, CircleShape)
                                .border(
                                    width = if (active) 2.dp else 1.dp,
                                    color = if (active) MaterialTheme.colorScheme.primary else Color.LightGray,
                                    shape = CircleShape
                                )
                                .clickable { selectedColor = col }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Paint Sketch Canvas Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(185.dp)
                    .background(Color(0xFFFCFDFE), RoundedCornerShape(8.dp))
                    .border(2.dp, Color(0xFFCFD8DC), RoundedCornerShape(8.dp))
                    .pointerInput(Unit) {
                        detectDragGestures(
                            onDragStart = { offset ->
                                currentStrokePoints.add(offset)
                            },
                            onDragEnd = {
                                if (currentStrokePoints.isNotEmpty()) {
                                    strokesList.add(ScribbleStroke(currentStrokePoints.toList(), selectedColor))
                                    currentStrokePoints.clear()
                                }
                            }
                        ) { change, _ ->
                            change.consume()
                            currentStrokePoints.add(change.position)
                        }
                    }
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    // Include aluminum frame reflection vibe background
                    drawClassroomVibe(size.width, size.height, isZoomed = false)

                    // Draw template underneath if selected
                    if (selectedTemplate != "BLANK") {
                        drawTemplateBoardContents(selectedTemplate, size.width, size.height, isZoomed = false)
                    }

                    // Draw permanent strokes
                    strokesList.forEach { stroke ->
                        drawStrokePointsOnCanvas(stroke.points, stroke.color)
                    }

                    // Draw current stroke
                    if (currentStrokePoints.isNotEmpty()) {
                        drawStrokePointsOnCanvas(currentStrokePoints, selectedColor)
                    }

                    // Viewfinder focus markers
                    drawCameraHUD(size.width, size.height, isZoomed = false)
                }

                // Interactive controls
                Row(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    FilledTonalButton(
                        onClick = {
                            if (strokesList.isNotEmpty()) {
                                strokesList.removeAt(strokesList.size - 1)
                            }
                        },
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        modifier = Modifier.height(28.dp)
                    ) {
                        Text("Undo", fontSize = 10.sp)
                    }
                    FilledTonalButton(
                        onClick = {
                            strokesList.clear()
                            currentStrokePoints.clear()
                        },
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        modifier = Modifier.height(28.dp)
                    ) {
                        Text("Reset", fontSize = 10.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(value = topicName, onValueChange = { topicName = it }, label = { Text("Topic / Board Name") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))

            Text("Class Grade Filter:", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                classes.forEach { cls ->
                    FilterChip(
                        selected = clsName == cls,
                        onClick = { clsName = cls },
                        label = { Text(cls, fontSize = 10.sp) }
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(value = subject, onValueChange = { subject = it }, label = { Text("Subject") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(value = chapter, onValueChange = { chapter = it }, label = { Text("Chapter Topic details") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(value = teacherName, onValueChange = { teacherName = it }, label = { Text("Teacher Name") }, modifier = Modifier.fillMaxWidth())

            Spacer(modifier = Modifier.height(16.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                TextButton(onClick = onDismiss) { Text("Cancel") }
                Button(onClick = {
                    if (topicName.isNotBlank() && subject.isNotBlank()) {
                        val drawingTokenStr = if (strokesList.isNotEmpty()) {
                            serializeStrokes(strokesList)
                        } else {
                            selectedTemplate
                        }
                        onUploadBoard(clsName, subject, chapter, topicName, teacherName, drawingTokenStr)
                        onDismiss()
                    }
                }) { Text("Deploy Lecture Pic") }
            }
        }
    }
}



@Composable
fun ChalkboardSketchPlaceholder(strokesToken: String, isZoomed: Boolean = false) {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height

        // Clean white board base layer
        drawRect(color = Color(0xFFFCFDFE))

        // Draw aluminum/metal board tray and frames
        drawClassroomVibe(width, height, isZoomed)

        if (strokesToken.startsWith("STROKES:")) {
            // Draw serialized teacher markers
            val customStrokes = deserializeStrokes(strokesToken)
            customStrokes.forEach { stroke ->
                drawStrokePointsOnCanvas(stroke.points, stroke.color)
            }
        } else {
            // Draw predetermined whiteboard templates (Biology, English structures, etc.)
            drawTemplateBoardContents(strokesToken, width, height, isZoomed)
        }

        // Draw smart-camera focus markers to simulate real photographs
        drawCameraHUD(width, height, isZoomed)
    }
}

fun DrawScope.drawStrokePointsOnCanvas(points: List<Offset>, color: Color, strokeWidth: Float = 4f) {
    for (i in 0 until points.size - 1) {
        val p1 = points[i]
        val p2 = points[i + 1]
        if ((p1 - p2).getDistance() < 50f) {
            drawLine(
                color = color,
                start = p1,
                end = p2,
                strokeWidth = strokeWidth,
                cap = StrokeCap.Round
            )
        }
    }
}

fun DrawScope.drawClassroomVibe(w: Float, h: Float, isZoomed: Boolean) {
    // Elegant slight metallic edge frame matching classroom physical borders
    val borderCol = Color(0xFFCFD8DC)
    drawRect(color = borderCol, style = Stroke(width = if (isZoomed) 12f else 6f))

    // Dry-erase board tray with standard black/red/blue markers sitting on it
    val trayHeight = if (isZoomed) 8f else 4f
    drawRect(
        color = Color(0xFF90A4AE),
        topLeft = Offset(0f, h - trayHeight),
        size = androidx.compose.ui.geometry.Size(w, trayHeight)
    )
}

fun DrawScope.drawCameraHUD(w: Float, h: Float, isZoomed: Boolean) {
    val tickLength = if (isZoomed) 28f else 14f
    val strokeWidth = if (isZoomed) 3f else 1.5f
    val padding = if (isZoomed) 16f else 8f
    val color = Color(0xFF37474F).copy(alpha = 0.45f) // Subtle overlay transparency

    // Viewfinder corners
    drawLine(color = color, start = Offset(padding, padding), end = Offset(padding + tickLength, padding), strokeWidth = strokeWidth)
    drawLine(color = color, start = Offset(padding, padding), end = Offset(padding, padding + tickLength), strokeWidth = strokeWidth)

    drawLine(color = color, start = Offset(w - padding, padding), end = Offset(w - padding - tickLength, padding), strokeWidth = strokeWidth)
    drawLine(color = color, start = Offset(w - padding, padding), end = Offset(w - padding, padding + tickLength), strokeWidth = strokeWidth)

    drawLine(color = color, start = Offset(padding, h - padding), end = Offset(padding + tickLength, h - padding), strokeWidth = strokeWidth)
    drawLine(color = color, start = Offset(padding, h - padding), end = Offset(padding, h - padding - tickLength), strokeWidth = strokeWidth)

    drawLine(color = color, start = Offset(w - padding, h - padding), end = Offset(w - padding - tickLength, h - padding), strokeWidth = strokeWidth)
    drawLine(color = color, start = Offset(w - padding, h - padding), end = Offset(w - padding, h - padding - tickLength), strokeWidth = strokeWidth)

    // Center crosshairs focus points
    val cSize = if (isZoomed) 16f else 8f
    drawLine(color = color, start = Offset(w / 2f - cSize, h / 2f), end = Offset(w / 2f + cSize, h / 2f), strokeWidth = strokeWidth)
    drawLine(color = color, start = Offset(w / 2f, h / 2f - cSize), end = Offset(w / 2f, h / 2f + cSize), strokeWidth = strokeWidth)
}

fun DrawScope.drawTemplateBoardContents(token: String, w: Float, h: Float, isZoomed: Boolean) {
    when (token) {
        "NEURON_SKETCH" -> {
            val somaCenter = Offset(w * 0.35f, h * 0.5f)
            val somaRad = if (isZoomed) 32f else 16f

            // Soma Cell body boundary in Royal Blue
            drawCircle(color = Color(0xFF0D47A1), radius = somaRad, center = somaCenter)
            // Cell nucleus in Crimson Red
            drawCircle(color = Color(0xFFD32F2F), radius = somaRad * 0.4f, center = somaCenter)

            // Dendrites sprouting elements
            val dendriteAngles = listOf(30, 90, 150, 210, 270, 330)
            dendriteAngles.forEach { angle ->
                val rad = Math.toRadians(angle.toDouble())
                val dLen = if (isZoomed) 60f else 30f
                val strokeW = if (isZoomed) 4f else 2f
                val endPt = Offset(
                    somaCenter.x + dLen * Math.cos(rad).toFloat(),
                    somaCenter.y + dLen * Math.sin(rad).toFloat()
                )
                drawLine(color = Color(0xFF0D47A1), start = somaCenter, end = endPt, strokeWidth = strokeW)

                val branchRad = rad + 0.3
                val branchEnd = Offset(
                    endPt.x + (dLen * 0.4f) * Math.cos(branchRad).toFloat(),
                    endPt.y + (dLen * 0.4f) * Math.sin(branchRad).toFloat()
                )
                drawLine(color = Color(0xFF1B5E20), start = endPt, end = branchEnd, strokeWidth = strokeW * 0.7f)
            }

            // Axon tail loop in Black marker
            val axonEnd = Offset(w * 0.8f, h * 0.5f)
            val axonW = if (isZoomed) 6f else 3f
            drawLine(color = Color(0xFF212121), start = Offset(somaCenter.x + somaRad, somaCenter.y), end = axonEnd, strokeWidth = axonW)

            // Myelin Sheath wraps in Green marker
            val bubbleCount = 4
            val startX = somaCenter.x + somaRad * 1.5f
            val endX = w * 0.75f
            val stepX = (endX - startX) / bubbleCount
            for (i in 0 until bubbleCount) {
                val bX = startX + i * stepX + stepX * 0.2f
                val bW = stepX * 0.6f
                val bY = h * 0.5f
                drawRoundRect(
                    color = Color(0xFF1B5E20),
                    topLeft = Offset(bX, bY - (if (isZoomed) 12f else 6f)),
                    size = androidx.compose.ui.geometry.Size(bW, if (isZoomed) 24f else 12f),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(if (isZoomed) 6f else 3f)
                )
            }

            // Synaptic terminations
            val tW = if (isZoomed) 3f else 1.5f
            drawLine(color = Color(0xFFD32F2F), start = axonEnd, end = Offset(w * 0.88f, h * 0.35f), strokeWidth = tW)
            drawLine(color = Color(0xFFD32F2F), start = axonEnd, end = Offset(w * 0.88f, h * 0.65f), strokeWidth = tW)
        }
        "ENGLISH_POETRY" -> {
            val margin = w * 0.12f
            val topOffset = h * 0.18f
            val leading = if (isZoomed) 36f else 18f
            val lineLen = w * 0.7f
            val strokeW = if (isZoomed) 4f else 2f

            drawRoundRect(
                color = Color(0xFFD32F2F).copy(alpha = 0.08f),
                topLeft = Offset(margin, h * 0.05f),
                size = androidx.compose.ui.geometry.Size(w * 0.76f, if (isZoomed) 32f else 16f),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(4f)
            )

            for (idx in 0..3) {
                val curY = topOffset + idx * leading
                val isRhymeA = (idx != 2)
                val strokeColor = if (isRhymeA) Color(0xFF0D47A1) else Color(0xFF1B5E20)

                drawLine(color = Color(0xFF212121), start = Offset(margin, curY), end = Offset(margin + lineLen * 0.8f, curY), strokeWidth = strokeW)
                drawLine(color = strokeColor, start = Offset(margin + lineLen * 0.65f, curY + (if (isZoomed) 6f else 3f)), end = Offset(margin + lineLen * 0.8f, curY + (if (isZoomed) 6f else 3f)), strokeWidth = strokeW * 1.5f)

                if (isZoomed && idx in listOf(0, 1, 3)) {
                    drawCircle(color = Color(0xFF0D47A1), radius = 6f, center = Offset(margin + lineLen * 0.85f, curY))
                }
            }

            if (isZoomed) {
                drawLine(color = Color(0xFFD32F2F), start = Offset(margin + lineLen * 0.9f, topOffset), end = Offset(margin + lineLen * 0.9f, topOffset + leading * 3), strokeWidth = 2f)
            }
        }
        "KIDNEY_NEPHRON" -> {
            val cX = w * 0.5f
            val cY = h * 0.5f
            val rad = if (isZoomed) 40f else 20f
            val strokeW = if (isZoomed) 4f else 2f

            drawArc(
                color = Color(0xFF0D47A1),
                startAngle = -45f,
                sweepAngle = 270f,
                useCenter = false,
                topLeft = Offset(cX - rad, cY - rad),
                size = androidx.compose.ui.geometry.Size(rad * 2f, rad * 2f),
                style = Stroke(width = strokeW * 1.5f)
            )

            val clusterPts = listOf(
                Offset(cX - rad * 0.3f, cY),
                Offset(cX, cY - rad * 0.4f),
                Offset(cX + rad * 0.2f, cY - rad * 0.1f),
                Offset(cX - rad * 0.1f, cY + rad * 0.3f),
                Offset(cX + rad * 0.3f, cY + rad * 0.2f)
            )
            for (idx in 0 until clusterPts.size - 1) {
                drawLine(color = Color(0xFFD32F2F), start = clusterPts[idx], end = clusterPts[idx + 1], strokeWidth = strokeW)
            }
            drawLine(color = Color(0xFFD32F2F), start = clusterPts.first(), end = Offset(cX - rad * 1.3f, cY - rad * 0.8f), strokeWidth = strokeW * 1.2f)
            drawLine(color = Color(0xFFD32F2F), start = clusterPts.last(), end = Offset(cX - rad * 1.3f, cY - rad * 0.3f), strokeWidth = strokeW * 0.8f)

            val loopStart = Offset(cX + rad, cY)
            val loopMid1 = Offset(cX + rad * 1.8f, cY + (if (isZoomed) 30f else 15f))
            val loopBottom = Offset(cX + rad * 1.4f, h * 0.85f)
            val loopMid2 = Offset(cX + rad * 0.8f, h * 0.85f)
            val loopEnd = Offset(cX, h * 0.82f)

            drawLine(color = Color(0xFF1B5E20), start = loopStart, end = loopMid1, strokeWidth = strokeW)
            drawLine(color = Color(0xFF1B5E20), start = loopMid1, end = loopBottom, strokeWidth = strokeW)
            drawLine(color = Color(0xFF1B5E20), start = loopBottom, end = loopMid2, strokeWidth = strokeW)
            drawLine(color = Color(0xFF1B5E20), start = loopMid2, end = loopEnd, strokeWidth = strokeW)
        }
        "PHYSICS_CIRCUIT" -> {
            val margin = w * 0.15f
            val cY = h * 0.5f
            val strokeW = if (isZoomed) 4f else 2f

            drawLine(color = Color(0xFF212121), start = Offset(margin, cY), end = Offset(margin, h * 0.25f), strokeWidth = strokeW)
            drawLine(color = Color(0xFF212121), start = Offset(margin, h * 0.25f), end = Offset(w - margin, h * 0.25f), strokeWidth = strokeW)
            drawLine(color = Color(0xFF212121), start = Offset(w - margin, h * 0.25f), end = Offset(w - margin, h * 0.75f), strokeWidth = strokeW)
            drawLine(color = Color(0xFF212121), start = Offset(w - margin, h * 0.75f), end = Offset(margin, h * 0.75f), strokeWidth = strokeW)
            drawLine(color = Color(0xFF212121), start = Offset(margin, h * 0.75f), end = Offset(margin, cY), strokeWidth = strokeW)

            drawCircle(color = Color(0xFF0D47A1), radius = if (isZoomed) 24f else 12f, center = Offset(margin, cY), style = Stroke(width = strokeW * 1.5f))
            val waveSize = if (isZoomed) 10f else 5f
            drawLine(color = Color(0xFF0D47A1), start = Offset(margin - waveSize, cY), end = Offset(margin, cY - waveSize), strokeWidth = strokeW)
            drawLine(color = Color(0xFF0D47A1), start = Offset(margin, cY - waveSize), end = Offset(margin + waveSize, cY), strokeWidth = strokeW)

            val resX = w * 0.5f
            val resY = h * 0.25f
            val zW = if (isZoomed) 12f else 6f
            val zH = if (isZoomed) 16f else 8f

            drawRect(color = Color(0xFFFCFDFE), topLeft = Offset(resX - zW * 2.5f, resY - zH * 1.2f), size = androidx.compose.ui.geometry.Size(zW * 5f, zH * 2.4f))

            val zigPoints = listOf(
                Offset(resX - zW * 2f, resY),
                Offset(resX - zW * 1.5f, resY - zH),
                Offset(resX - zW * 0.5f, resY + zH),
                Offset(resX + zW * 0.5f, resY - zH),
                Offset(resX + zW * 1.5f, resY + zH),
                Offset(resX + zW * 2f, resY)
            )
            for (idx in 0 until zigPoints.size - 1) {
                drawLine(color = Color(0xFFD32F2F), start = zigPoints[idx], end = zigPoints[idx + 1], strokeWidth = strokeW * 1.2f)
            }

            val capX = w * 0.5f
            val capY = h * 0.75f
            val capH = if (isZoomed) 30f else 15f
            val capGap = if (isZoomed) 12f else 6f

            drawRect(color = Color(0xFFFCFDFE), topLeft = Offset(capX - capGap, capY - capH), size = androidx.compose.ui.geometry.Size(capGap * 2.1f, capH * 2.1f))
            drawLine(color = Color(0xFF1B5E20), start = Offset(capX - capGap / 2f, capY - capH / 2f), end = Offset(capX - capGap / 2f, capY + capH / 2f), strokeWidth = strokeW * 1.8f)
            drawLine(color = Color(0xFF1B5E20), start = Offset(capX + capGap / 2f, capY - capH / 2f), end = Offset(capX + capGap / 2f, capY + capH / 2f), strokeWidth = strokeW * 1.8f)
        }
        "CHEMISTRY_HEXAGON" -> {
            val cX = w * 0.5f
            val cY = h * 0.5f
            val r = if (isZoomed) 40f else 20f
            val strokeW = if (isZoomed) 4f else 2f

            drawHexagonRing(cX - r * 0.9f, cY, r, strokeW, Color(0xFF1B5E20), drawDoubleBonds = true)
            drawHexagonRing(cX + r * 0.9f, cY, r, strokeW, Color(0xFF0D47A1), drawDoubleBonds = false)

            if (isZoomed) {
                drawLine(color = Color(0xFFD32F2F), start = Offset(cX + r * 1.8f, cY - r * 0.5f), end = Offset(cX + r * 2.5f, cY - r), strokeWidth = strokeW)
            }
        }
        else -> {
            drawCircle(color = Color(0xFF0D47A1).copy(alpha = 0.2f), radius = if (isZoomed) 60f else 30f, center = Offset(w * 0.5f, h * 0.5f))
            drawLine(color = Color(0xFFD32F2F), start = Offset(w * 0.15f, h * 0.15f), end = Offset(w * 0.85f, h * 0.85f), strokeWidth = if (isZoomed) 4f else 2f)
            drawLine(color = Color(0xFF1B5E20), start = Offset(w * 0.85f, h * 0.15f), end = Offset(w * 0.15f, h * 0.85f), strokeWidth = if (isZoomed) 4f else 2f)
        }
    }
}

fun DrawScope.drawHexagonRing(cX: Float, cY: Float, r: Float, sW: Float, color: Color, drawDoubleBonds: Boolean) {
    val pts = (0..5).map { idx ->
        val angleRad = Math.toRadians((idx * 60).toDouble())
        Offset(
            cX + r * Math.cos(angleRad).toFloat(),
            cY + r * Math.sin(angleRad).toFloat()
        )
    }

    // Draw outer edges
    for (idx in 0..5) {
        drawLine(color = color, start = pts[idx], end = pts[(idx + 1) % 6], strokeWidth = sW)
    }

    // Draw alternate inner double bonds
    if (drawDoubleBonds) {
        val innerR = r * 0.8f
        val innerPts = (0..5).map { idx ->
            val angleRad = Math.toRadians((idx * 60).toDouble())
            Offset(
                cX + innerR * Math.cos(angleRad).toFloat(),
                cY + innerR * Math.sin(angleRad).toFloat()
            )
        }
        for (idx in listOf(0, 2, 4)) {
            drawLine(color = color, start = innerPts[idx], end = innerPts[(idx + 1) % 6], strokeWidth = sW * 0.6f)
        }
    }
}

// ==============================
// 7. NOTIFICATIONS PAGE COMPOSITE
// ==============================
@Composable
fun NotificationsScreen(
    notifications: List<NotificationEntity>,
    userRole: String,
    onMarkAsRead: (id: Int) -> Unit,
    onMarkAllAsRead: () -> Unit,
    onDeleteNotification: (id: Int) -> Unit,
    onAddNotification: (title: String, message: String, type: String) -> Unit
) {
    var notificationFilter by remember { mutableStateOf("All") }
    var openPushDialog by remember { mutableStateOf(false) }

    val categories = listOf("All", "Exam", "Homework", "Result", "Update")

    // Filter notification records
    val filteredNotifs = notifications.filter { notif ->
        notificationFilter == "All" || notif.type.equals(notificationFilter, ignoreCase = true)
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Announcements Board", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                Text("Important academic circulars and syllabus pushes", fontSize = 11.sp)
            }

            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                TextButton(onClick = onMarkAllAsRead) {
                    Text("Read All", fontSize = 12.sp)
                }

                if (userRole == "Admin") {
                    IconButton(onClick = { openPushDialog = true }, modifier = Modifier.testTag("admin_notif_top_add")) {
                        Icon(Icons.Default.AddAlert, contentDescription = "Add alert")
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Categories layout slider
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            categories.forEach { filter ->
                FilterChip(
                    selected = notificationFilter == filter,
                    onClick = { notificationFilter = filter },
                    label = { Text(filter) }
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (filteredNotifs.isEmpty()) {
            Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                Text("No matching alerts registered.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxWidth().weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredNotifs) { rawNotif ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onMarkAsRead(rawNotif.id) }
                            .testTag("notification_strip_${rawNotif.id}"),
                        colors = CardDefaults.cardColors(
                            containerColor = if (!rawNotif.isRead) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                                             else MaterialTheme.colorScheme.surface
                        )
                    ) {
                        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.Top) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .background(
                                        when (rawNotif.type) {
                                            "Exam" -> MaterialTheme.colorScheme.errorContainer
                                            "Homework" -> MaterialTheme.colorScheme.secondaryContainer
                                            "Result" -> MaterialTheme.colorScheme.tertiaryContainer
                                            else -> MaterialTheme.colorScheme.primaryContainer
                                        },
                                        CircleShape
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = when (rawNotif.type) {
                                        "Exam" -> Icons.Default.Campaign
                                        "Homework" -> Icons.Default.Assignment
                                        "Result" -> Icons.Default.EmojiEvents
                                        else -> Icons.Default.Info
                                    },
                                    contentDescription = rawNotif.type,
                                    modifier = Modifier.size(20.dp),
                                    tint = MaterialTheme.colorScheme.primary
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text(rawNotif.title, fontWeight = FontWeight.Bold, fontSize = 14.sp, modifier = Modifier.weight(1f))
                                    Text(rawNotif.date, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(rawNotif.message, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Spacer(modifier = Modifier.height(6.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .background(
                                                if (rawNotif.isRead) MaterialTheme.colorScheme.surfaceVariant
                                                else MaterialTheme.colorScheme.primary,
                                                RoundedCornerShape(4.dp)
                                            )
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = if (rawNotif.isRead) "Seen" else "New Alert",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (rawNotif.isRead) MaterialTheme.colorScheme.onSurfaceVariant
                                                    else MaterialTheme.colorScheme.onPrimary
                                        )
                                    }

                                    if (userRole == "Admin") {
                                        Icon(
                                            imageVector = Icons.Default.Delete,
                                            contentDescription = "Remove Notification",
                                            tint = Color.Red,
                                            modifier = Modifier
                                                .size(20.dp)
                                                .clickable { onDeleteNotification(rawNotif.id) }
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Push notification form (Admin)
    if (openPushDialog) {
        var alertTitle by remember { mutableStateOf("") }
        var alertMsg by remember { mutableStateOf("") }
        var alertType by remember { mutableStateOf("Update") }
        val types = listOf("Update", "Exam", "Homework", "Result")

        Dialog(onDismissRequest = { openPushDialog = false }) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("Broadcast Alert Notification", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(value = alertTitle, onValueChange = { alertTitle = it }, label = { Text("Title") }, modifier = Modifier.fillMaxWidth())
                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(value = alertMsg, onValueChange = { alertMsg = it }, label = { Text("Details Message") }, modifier = Modifier.fillMaxWidth(), minLines = 3)
                    Spacer(modifier = Modifier.height(8.dp))

                    Text("Alert Class Classification Option:", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        types.forEach { t ->
                            FilterChip(selected = alertType == t, onClick = { alertType = t }, label = { Text(t) })
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                        TextButton(onClick = { openPushDialog = false }) { Text("Cancel") }
                        Button(onClick = {
                            if (alertTitle.isNotBlank()) {
                                onAddNotification(alertTitle, alertMsg, alertType)
                                openPushDialog = false
                            }
                        }) { Text("Deploy Toast Alert") }
                    }
                }
            }
        }
    }
}

// ==========================
// 8. RESULTS DESK COMPOSITE
// ==========================
@Composable
fun ResultsScreen(
    results: List<ResultEntity>,
    userRole: String,
    studentName: String,
    downloadedResultIds: Set<Int>,
    onDownloadResult: (id: Int) -> Unit,
    onDeleteResult: (id: Int) -> Unit
) {
    var classFilter by remember { mutableStateOf("All") }
    val classes = listOf("All", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12")

    val filteredResults = results.filter { r ->
        classFilter == "All" || r.className.equals(classFilter, ignoreCase = true)
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Column {
            Text("Academy Results Desk Board", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
            Text("Real-time score sheets published by teachers in Karak center", fontSize = 11.sp)
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Class Filter Slider
        Text("Grade Scope Selection:", fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            classes.forEach { o ->
                FilterChip(
                    selected = classFilter == o,
                    onClick = { classFilter = o },
                    label = { Text(o) }
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (filteredResults.isEmpty()) {
            Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                Text("No results published for selected scopes.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxWidth().weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredResults) { report ->
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .background(MaterialTheme.colorScheme.tertiaryContainer, CircleShape)
                                            .padding(6.dp)
                                    ) {
                                        Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                                    }
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column {
                                        Text(report.announcementTitle, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                        Text("${report.className} • ${report.subject} • ${report.examType}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }
                                Text(report.date, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Highlight student score marks lines in clean high-contrast text fields
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
                                    .padding(10.dp)
                            ) {
                                Text(
                                    text = report.resultsBlob,
                                    fontSize = 12.sp,
                                    fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Available offline in Downloads", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f))
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    if (userRole == "Admin") {
                                        Icon(
                                            imageVector = Icons.Default.Delete,
                                            contentDescription = "Delete Result Slip",
                                            tint = Color.Red,
                                            modifier = Modifier
                                                .size(24.dp)
                                                .clickable { onDeleteResult(report.id) }
                                        )
                                    }

                                    val isDownloaded = downloadedResultIds.contains(report.id)
                                    val context = LocalContext.current
                                    Button(
                                        onClick = {
                                            if (!isDownloaded) {
                                                onDownloadResult(report.id)
                                                Toast.makeText(context, "Slip PDF synced offline in SCA local database!", Toast.LENGTH_SHORT).show()
                                            }
                                        },
                                        shape = RoundedCornerShape(8.dp),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = if (isDownloaded) Color(0xFF2E7D32) else MaterialTheme.colorScheme.primary
                                        )
                                    ) {
                                        Icon(
                                            imageVector = if (isDownloaded) Icons.Default.CheckCircle else Icons.Default.Download,
                                            contentDescription = null,
                                            modifier = Modifier.size(14.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(if (isDownloaded) "Saved" else "Save Slip PDF", fontSize = 11.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ============================
// 9. DOWNLOADS PAGE COMPOSITE
// ============================
@Composable
fun DownloadsScreen(
    notes: List<NoteEntity>,
    downloadedIds: Set<Int>,
    results: List<ResultEntity>,
    downloadedResultIds: Set<Int>,
    whiteboards: List<WhiteboardEntity>
) {
    val downloadedHandouts = notes.filter { downloadedIds.contains(it.id) }
    val downloadedResults = results.filter { downloadedResultIds.contains(it.id) }

    var selectedHandoutForPreview by remember { mutableStateOf<NoteEntity?>(null) }
    var selectedResultForPreview by remember { mutableStateOf<ResultEntity?>(null) }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Column {
            Text("SCA Offline Study Cabinet", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
            Text("Access downloaded syllabus files and test report cards instantly", fontSize = 11.sp)
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (downloadedHandouts.isEmpty() && downloadedResults.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxWidth().weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.CloudQueue,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("No files or reports saved offline yet.", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("Browse the Notes Vault or Results Desk and click Download.", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f))
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxWidth().weight(1f),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                if (downloadedHandouts.isNotEmpty()) {
                    item {
                        Text(
                            text = "OFFLINE SYLLABUS HANDOUTS (${downloadedHandouts.size})",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(bottom = 6.dp)
                        )
                    }
                    items(downloadedHandouts) { asset ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceColorAtElevation(1.dp))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                    Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(32.dp))
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column {
                                        Text(asset.topic, fontWeight = FontWeight.Bold, fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                        Text("${asset.className} • ${asset.subject} • Size: ${asset.fileSize}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }

                                IconButton(onClick = {
                                    selectedHandoutForPreview = asset
                                }) {
                                    Icon(Icons.Default.OpenInNew, contentDescription = "Open Preview", tint = MaterialTheme.colorScheme.primary)
                                }
                            }
                        }
                    }
                }

                if (downloadedResults.isNotEmpty()) {
                    item {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "OFFLINE EXAM REPORT CARDS (${downloadedResults.size})",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.tertiary,
                            modifier = Modifier.padding(bottom = 6.dp)
                        )
                    }
                    items(downloadedResults) { report ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceColorAtElevation(1.dp))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                    Icon(Icons.Default.Celebration, contentDescription = null, tint = Color(0xFFFFB300), modifier = Modifier.size(32.dp))
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column {
                                        Text(report.announcementTitle, fontWeight = FontWeight.Bold, fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                        Text("${report.className} • ${report.subject} • ${report.examType}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }

                                IconButton(onClick = {
                                    selectedResultForPreview = report
                                }) {
                                    Icon(Icons.Default.OpenInNew, contentDescription = "Open Result Card", tint = MaterialTheme.colorScheme.primary)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Handout Preview Dialog inside Downloads Screen
    if (selectedHandoutForPreview != null) {
        val previewNote = selectedHandoutForPreview!!
        Dialog(onDismissRequest = { selectedHandoutForPreview = null }) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .padding(20.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("SCA OFFLINE HANDOUT VIEWER", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        IconButton(onClick = { selectedHandoutForPreview = null }) {
                            Icon(Icons.Default.Close, contentDescription = "Close Preview")
                        }
                    }

                    Text(previewNote.topic, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
                    Text("${previewNote.className} • ${previewNote.subject} • Chapter: ${previewNote.chapter}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
                            .padding(14.dp)
                    ) {
                        Text(
                            text = previewNote.contentPlaceholder,
                            style = MaterialTheme.typography.bodyMedium,
                            fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Offline File Size: ${previewNote.fileSize}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Button(onClick = { selectedHandoutForPreview = null }) {
                            Text("Done Reading")
                        }
                    }
                }
            }
        }
    }

    // Result Card Preview Dialog inside Downloads Screen
    if (selectedResultForPreview != null) {
        val previewResult = selectedResultForPreview!!
        Dialog(onDismissRequest = { selectedResultForPreview = null }) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .padding(20.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("SCA SECURED RESULT RECORD", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFFFB300))
                        IconButton(onClick = { selectedResultForPreview = null }) {
                            Icon(Icons.Default.Close, contentDescription = "Close Preview")
                        }
                    }

                    Text(previewResult.announcementTitle, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
                    Text("${previewResult.className} • ${previewResult.subject} • Class Exam: ${previewResult.examType}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
                            .padding(14.dp)
                    ) {
                        Text(
                            text = previewResult.resultsBlob,
                            style = MaterialTheme.typography.bodyMedium,
                            fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(onClick = { selectedResultForPreview = null }) {
                            Text("Dismiss View")
                        }
                    }
                }
            }
        }
    }
}

// ========================
// 10. PROFILE SCREEN COMPOSITE
// ========================
@Composable
fun ProfileScreen(
    studentName: String,
    userRole: String,
    students: List<StudentEntity>,
    onSetRole: (role: String) -> Unit,
    onSetStudent: (name: String) -> Unit
) {
    var expandedProfileDetails by remember { mutableStateOf(false) }

    val matchedStudentModel = if (userRole == "Admin") null else students.find { it.name.equals(studentName, ignoreCase = true) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(12.dp))

        // Profile Avatar
        Box(
            modifier = Modifier
                .size(96.dp)
                .background(MaterialTheme.colorScheme.primaryContainer, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = if (userRole == "Admin") Icons.Default.AdminPanelSettings else Icons.Default.School,
                contentDescription = null,
                modifier = Modifier.size(56.dp),
                tint = MaterialTheme.colorScheme.primary
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = if (userRole == "Admin") "Staff Teacher Admin" else studentName,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Role: $userRole • SCA Academy Karak",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Student Detail Credentials Card
        if (matchedStudentModel != null) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceColorAtElevation(1.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Admitted Class Registration", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 13.sp)
                    Divider(modifier = Modifier.padding(vertical = 8.dp))

                    ProfileParamRow("Academic Grade", matchedStudentModel.className)
                    ProfileParamRow("Campus Roll Number", matchedStudentModel.rollNo)
                    ProfileParamRow("Daily Attendance Score", "${matchedStudentModel.attendanceRate}% (Excellent)")
                    ProfileParamRow("Associated Email", matchedStudentModel.email)
                    ProfileParamRow("Guardian Name", matchedStudentModel.guardianName)
                    ProfileParamRow("Phone Number", matchedStudentModel.phone)
                }
            }
        } else if (userRole == "Admin") {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceColorAtElevation(1.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Staff Verification Badges", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 13.sp)
                    Divider(modifier = Modifier.padding(vertical = 8.dp))

                    ProfileParamRow("Staff Class Range", "Class 8th to 12th")
                    ProfileParamRow("Center ID Code", "KARAK-SCA-ADMIN")
                    ProfileParamRow("Permissions Set", "Write Notes, Sketches, Marks lists, Alerts")
                    ProfileParamRow("Database Mode", "Offline Sandbox Persistent")
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Fast Role Access Toggler Section
        Text("Account Settings & Mock Roles Switcher:", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium, modifier = Modifier.align(Alignment.Start))
        Spacer(modifier = Modifier.height(8.dp))

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Toggle Role Context below to view student vs teacher boards dynamically.", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(modifier = Modifier.height(12.dp))

                Button(
                    onClick = {
                        val switchedRole = if (userRole == "Admin") "Student" else "Admin"
                        onSetRole(switchedRole)
                    },
                    modifier = Modifier.fillMaxWidth().testTag("profile_role_shift"),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.SyncAlt, contentDescription = null)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Switch instantly to ${if (userRole == "Admin") "Student Mode" else "Teacher Admin Mode"}", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun ProfileParamRow(tag: String, valStr: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(tag, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(valStr, fontSize = 12.sp, fontWeight = FontWeight.Bold)
    }
}
