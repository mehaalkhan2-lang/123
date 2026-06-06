package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.database.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class AcademyViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: AcademyRepository

    // Database flow streams
    val notes: StateFlow<List<NoteEntity>>
    val whiteboards: StateFlow<List<WhiteboardEntity>>
    val notifications: StateFlow<List<NotificationEntity>>
    val results: StateFlow<List<ResultEntity>>
    val students: StateFlow<List<StudentEntity>>
    val studentCount: StateFlow<Int>

    // Authentic login state simulation
    private val _currentUserRole = MutableStateFlow("Student") // "Student" or "Admin"
    val currentUserRole: StateFlow<String> = _currentUserRole.asStateFlow()

    private val _currentStudentName = MutableStateFlow("Zarar Khattak")
    val currentStudentName: StateFlow<String> = _currentStudentName.asStateFlow()

    // Filters and searches
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedClassFilter = MutableStateFlow("All") // "All", "Class 8", ..., "Class 12"
    val selectedClassFilter: StateFlow<String> = _selectedClassFilter.asStateFlow()

    private val _selectedSubjectFilter = MutableStateFlow("All")
    val selectedSubjectFilter: StateFlow<String> = _selectedSubjectFilter.asStateFlow()

    // Downloaded elements tracking
    private val _downloadedNoteIds = MutableStateFlow<Set<Int>>(emptySet())
    val downloadedNoteIds: StateFlow<Set<Int>> = _downloadedNoteIds.asStateFlow()

    private val _downloadedResultIds = MutableStateFlow<Set<Int>>(emptySet())
    val downloadedResultIds: StateFlow<Set<Int>> = _downloadedResultIds.asStateFlow()

    init {
        val database = ScavDatabase.getDatabase(application)
        repository = AcademyRepository(database.academyDao())

        // Sync streams with stateflows
        notes = repository.allNotes.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        whiteboards = repository.allWhiteboards.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        notifications = repository.allNotifications.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        results = repository.allResults.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        students = repository.allStudents.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        studentCount = repository.studentCount.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = 0
        )

        // Seed if empty on launch
        viewModelScope.launch {
            repository.preseedDatabaseIfEmpty()
        }
    }

    // Role switcher
    fun setRole(role: String) {
        _currentUserRole.value = role
    }

    fun setStudentName(name: String) {
        _currentStudentName.value = name
    }

    // Set filters
    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun updateClassFilter(classFilter: String) {
        _selectedClassFilter.value = classFilter
    }

    fun updateSubjectFilter(subjectFilter: String) {
        _selectedSubjectFilter.value = subjectFilter
    }

    // Database additions
    fun addNote(
        className: String,
        subject: String,
        chapter: String,
        topic: String,
        teacherName: String,
        fileType: String,
        content: String,
        fileSize: String = "1.5 MB"
    ) {
        viewModelScope.launch {
            val note = NoteEntity(
                className = className,
                subject = subject,
                chapter = chapter,
                topic = topic,
                uploadDate = "2026-06-06",
                teacherName = teacherName,
                fileType = fileType,
                contentPlaceholder = content,
                fileSize = fileSize
            )
            repository.addNote(note)
            
            // Push dynamic homework or update notification automatically for that class
            addNotification(
                title = "New Notes Uploaded for $className",
                message = "$teacherName uploaded notes for $subject -> $topic ($fileType format). Start practicing immediately!",
                type = "Update"
            )
        }
    }

    fun deleteNote(id: Int) {
        viewModelScope.launch {
            repository.deleteNote(id)
        }
    }

    fun addWhiteboardUpload(
        className: String,
        subject: String,
        chapter: String,
        topicName: String,
        teacherName: String,
        drawingData: String
    ) {
        viewModelScope.launch {
            val board = WhiteboardEntity(
                className = className,
                subject = subject,
                chapter = chapter,
                topicName = topicName,
                uploadDate = "2026-06-06",
                teacherName = teacherName,
                drawingPathData = drawingData
            )
            repository.addWhiteboard(board)

            // Auto notification push
            addNotification(
                title = "New Whiteboard Board Sketch: $topicName",
                message = "Sir $teacherName shared board notes in $subject chapter: $chapter. View in Whiteboard Gallery now.",
                type = "Update"
            )
        }
    }

    fun deleteWhiteboard(id: Int) {
        viewModelScope.launch {
            repository.deleteWhiteboard(id)
        }
    }

    fun addNotification(title: String, message: String, type: String) {
        viewModelScope.launch {
            val notif = NotificationEntity(
                title = title,
                message = message,
                type = type,
                date = "2026-06-06",
                isRead = false
            )
            repository.addNotification(notif)
        }
    }

    fun markNotificationAsRead(id: Int) {
        viewModelScope.launch {
            repository.markNotificationAsRead(id)
        }
    }

    fun markAllNotificationsAsRead() {
        viewModelScope.launch {
            repository.markAllNotificationsAsRead()
        }
    }

    fun deleteNotification(id: Int) {
        viewModelScope.launch {
            repository.deleteNotification(id)
        }
    }

    fun addResult(className: String, subject: String, examType: String, title: String, resultsBlob: String) {
        viewModelScope.launch {
            val result = ResultEntity(
                className = className,
                subject = subject,
                examType = examType,
                date = "2026-06-06",
                announcementTitle = title,
                resultsBlob = resultsBlob
            )
            repository.addResult(result)

            // Auto notification push
            addNotification(
                title = "Exam Result Published: $className $subject",
                message = "$examType results published for $subject ($title). Scroll and view in your dashboard.",
                type = "Result"
            )
        }
    }

    fun deleteResult(id: Int) {
        viewModelScope.launch {
            repository.deleteResult(id)
        }
    }

    fun addStudent(student: StudentEntity) {
        viewModelScope.launch {
            repository.addStudent(student)
        }
    }

    fun deleteStudent(id: Int) {
        viewModelScope.launch {
            repository.deleteStudent(id)
        }
    }

    fun trackDownload(noteId: Int) {
        viewModelScope.launch {
            repository.incrementDownloadCount(noteId)
            val updated = _downloadedNoteIds.value.toMutableSet()
            updated.add(noteId)
            _downloadedNoteIds.value = updated
        }
    }

    fun trackResultDownload(resultId: Int) {
        viewModelScope.launch {
            val updated = _downloadedResultIds.value.toMutableSet()
            updated.add(resultId)
            _downloadedResultIds.value = updated
        }
    }
}
