package com.example.data.database

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext

class AcademyRepository(private val dao: AcademyDao) {

    val allNotes: Flow<List<NoteEntity>> = dao.getAllNotes()
    val allWhiteboards: Flow<List<WhiteboardEntity>> = dao.getAllWhiteboards()
    val allNotifications: Flow<List<NotificationEntity>> = dao.getAllNotifications()
    val allResults: Flow<List<ResultEntity>> = dao.getAllResults()
    val allStudents: Flow<List<StudentEntity>> = dao.getAllStudents()
    val studentCount: Flow<Int> = dao.getStudentCount()

    suspend fun incrementDownloadCount(noteId: Int) {
        withContext(Dispatchers.IO) {
            dao.incrementDownloadCount(noteId)
        }
    }

    suspend fun addNote(note: NoteEntity) {
        withContext(Dispatchers.IO) {
            dao.insertNote(note)
        }
    }

    suspend fun deleteNote(id: Int) {
        withContext(Dispatchers.IO) {
            dao.deleteNote(id)
        }
    }

    suspend fun addWhiteboard(whiteboard: WhiteboardEntity) {
        withContext(Dispatchers.IO) {
            dao.insertWhiteboard(whiteboard)
        }
    }

    suspend fun deleteWhiteboard(id: Int) {
        withContext(Dispatchers.IO) {
            dao.deleteWhiteboard(id)
        }
    }

    suspend fun addNotification(notification: NotificationEntity) {
        withContext(Dispatchers.IO) {
            dao.insertNotification(notification)
        }
    }

    suspend fun markNotificationAsRead(id: Int) {
        withContext(Dispatchers.IO) {
            dao.markNotificationAsRead(id)
        }
    }

    suspend fun markAllNotificationsAsRead() {
        withContext(Dispatchers.IO) {
            dao.markAllNotificationsAsRead()
        }
    }

    suspend fun deleteNotification(id: Int) {
        withContext(Dispatchers.IO) {
            dao.deleteNotification(id)
        }
    }

    suspend fun addResult(result: ResultEntity) {
        withContext(Dispatchers.IO) {
            dao.insertResult(result)
        }
    }

    suspend fun deleteResult(id: Int) {
        withContext(Dispatchers.IO) {
            dao.deleteResult(id)
        }
    }

    suspend fun addStudent(student: StudentEntity) {
        withContext(Dispatchers.IO) {
            dao.insertStudent(student)
        }
    }

    suspend fun deleteStudent(id: Int) {
        withContext(Dispatchers.IO) {
            dao.deleteStudent(id)
        }
    }

    suspend fun preseedDatabaseIfEmpty() {
        withContext(Dispatchers.IO) {
            val count = dao.getStudentCount().first()
            if (count == 0) {
                // Preseed Students
                val initialStudents = listOf(
                    StudentEntity(name = "Zarar Khattak", rollNo = "SCA-101", className = "Class 10", email = "zarar@scav.edu", guardianName = "Sohail Khattak", phone = "0333-1234567"),
                    StudentEntity(name = "Ayesha Afridi", rollNo = "SCA-102", className = "Class 10", email = "ayesha@scav.edu", guardianName = "Farid Afridi", phone = "0345-7654321"),
                    StudentEntity(name = "Ahmed Khan", rollNo = "SCA-201", className = "Class 12", email = "ahmed.k@scav.edu", guardianName = "Mushtaq Khan", phone = "0321-9876543"),
                    StudentEntity(name = "Tariq Mahmood", rollNo = "SCA-202", className = "Class 12", email = "tariq.m@scav.edu", guardianName = "Mahmood Shah", phone = "0312-4567890"),
                    StudentEntity(name = "Sadia Umar", rollNo = "SCA-053", className = "Class 9", email = "sadia@scav.edu", guardianName = "Umar Gul", phone = "0300-1122334"),
                    StudentEntity(name = "Asif Jan", rollNo = "SCA-088", className = "Class 11", email = "asif.jan@scav.edu", guardianName = "Jan Muhammad", phone = "0313-9090123")
                )
                initialStudents.forEach { dao.insertStudent(it) }

                // Preseed Notes
                val initialNotes = listOf(
                    NoteEntity(
                        className = "Class 10",
                        subject = "Chemistry",
                        chapter = "Chapter 3: Organic Chemistry",
                        topic = "Alkanes vs Alkenes Hydrocarbons Comparison",
                        uploadDate = "2026-06-05",
                        teacherName = "Sir Tariq",
                        fileType = "PDF",
                        contentPlaceholder = """
                            * COMPARISON OF SATURATED AND UNSATURATED HYDROCARBONS *
                            
                            1. Saturated Hydrocarbons (Alkanes):
                               - Formula: CnH2n+2
                               - Saturated nature because carbon-carbon single bonds are present.
                               - Example: Methane (CH4), Ethane (C2H6).
                               - Very stable, undergo substitution reactions in sunlight.
                               
                            2. Unsaturated Hydrocarbons (Alkenes & Alkynes):
                               - Formula: CnH2n for Alkenes, CnH2n-2 for Alkynes.
                               - Contains double (alkenes) or triple (alkynes) bonds.
                               - Example: Ethene (C2H4), Ethyne (C2H2).
                               - Highly reactive, undergo addition reactions across multiple bonds.
                               
                            3. Practical Applications:
                               - Alkanes are primarily used as heating fuels (Biogas, CNG, LPG).
                               - Alkenes are extremely important in industrial polymer synthesis (Polythene bags, plastics).
                        """.trimIndent(),
                        downloadCount = 42,
                        fileSize = "1.8 MB"
                    ),
                    NoteEntity(
                        className = "Class 12",
                        subject = "Physics",
                        chapter = "Chapter 1: Electrostatics",
                        topic = "Coulomb's Law In Vector Form",
                        uploadDate = "2026-06-04",
                        teacherName = "Sir Zarar",
                        fileType = "DOCX",
                        contentPlaceholder = """
                            * COULOMB'S LAW AND ELECTROMAGNETISM BASICS *
                            
                            Statement:
                            The force of attraction or repulsion between two static point charges is directly proportional to the product of the magnitudes of charges and inversely proportional to the square of the distance between them.
                            
                            Mathematical Equation:
                            F = k * (q1 * q2) / r^2
                            Where:
                            - F is the static electrostatic force.
                            - q1 and q2 are charges in Coulombs.
                            - r is the distance of separation in meters.
                            - k is the electrostatic constant (8.99e9 N m2 C-2).
                            
                            Medium Influence:
                            When a dielectric medium of relative permittivity (Qr) is introduced, the electrostatic force drops proportionally. This is critical for capacitor designs.
                        """.trimIndent(),
                        downloadCount = 28,
                        fileSize = "3.2 MB"
                    ),
                    NoteEntity(
                        className = "Class 9",
                        subject = "Mathematics",
                        chapter = "Chapter 5: Quadratic Equations",
                        topic = "Derivation & Use of Quadratic Formula",
                        uploadDate = "2026-06-03",
                        teacherName = "Mam Noreen",
                        fileType = "Image",
                        contentPlaceholder = """
                            * ALGEBRA: THE QUADRATIC FORMULA *
                            
                            Generics: ax² + bx + c = 0
                            Where a, b, and c are real numbers, and a != 0.
                            
                            The Formula:
                            x = [ -b ± √(b² - 4ac) ] / 2a
                            
                            Steps of Application:
                            1. Arrange terms to match basic form.
                            2. Identify individual coefficients (sign matters!).
                            3. Evaluate the Discriminant: D = b² - 4ac
                               - If D > 0, roots are real and distinct.
                               - If D = 0, roots are real and equal.
                               - If D < 0, roots are complex/imaginary.
                            4. Plug coefficients to find two values or roots.
                        """.trimIndent(),
                        downloadCount = 19,
                        fileSize = "940 KB"
                    ),
                    NoteEntity(
                        className = "Class 11",
                        subject = "Biology",
                        chapter = "Chapter 2: Coordination",
                        topic = "Human Nervous System Layout",
                        uploadDate = "2026-06-06",
                        teacherName = "Mam Noreen",
                        fileType = "PDF",
                        contentPlaceholder = """
                            * COORDINATION: CENTRAL AND PERIPHERAL NERVOUS SYSTEMS *
                            
                            Components of CNS:
                            1. Brain (Forebrain, Midbrain, Hindbrain) - controls perception, memory, and voluntary motion.
                            2. Spinal Cord - directs reflex actions and relays sensory patterns.
                            
                            Peripheral Nervous System (PNS):
                            - Somatic Nervous System (voluntary actions).
                            - Autonomic Nervous System (Involuntary: Sympathetic fight-or-flight vs Parasympathetic rest-and-digest).
                            
                            Neuron Communication:
                            Brief electrical impulses (Action Potentials) travel along axons. Microscopic chemicals called Neurotransmitters bridge synaptic gaps to complete the signaling sequence.
                        """.trimIndent(),
                        downloadCount = 15,
                        fileSize = "2.1 MB"
                    )
                )
                initialNotes.forEach { dao.insertNote(it) }

                // Preseed Whiteboards
                val initialWhiteboards = listOf(
                    WhiteboardEntity(
                        className = "Class 10",
                        subject = "Biology",
                        chapter = "Chapter 2: Coordination",
                        topicName = "Structure of Neuron Model Board Sketch",
                        uploadDate = "2026-06-06",
                        teacherName = "Mam Noreen",
                        drawingPathData = "NEURON_SKETCH" // Token used to draw rich mock drawing in UI canvas
                    ),
                    WhiteboardEntity(
                        className = "Class 11",
                        subject = "English",
                        chapter = "Chapter 4: Literary Devices",
                        topicName = "Metaphors and Rhyme Scheme Breakdown",
                        uploadDate = "2026-06-05",
                        teacherName = "Sir Tariq",
                        drawingPathData = "ENGLISH_POETRY"
                    ),
                    WhiteboardEntity(
                        className = "Class 8",
                        subject = "General Science",
                        chapter = "Chapter 1: Human Organ Systems",
                        topicName = "Kidney Filtration Structure & Nephron Board Sketch",
                        uploadDate = "2026-06-04",
                        teacherName = "Sir Zarar",
                        drawingPathData = "KIDNEY_NEPHRON"
                    )
                )
                initialWhiteboards.forEach { dao.insertWhiteboard(it) }

                // Preseed Notifications
                val initialNotifications = listOf(
                    NotificationEntity(
                        title = "Mid-Term Examination Schedule K-2026",
                        message = "The mid-term exams for all classes (Class 8th to 12th) starts from Monday, June 15th, 2026. Get your schedules and clearance slips from the Front Office. Hard work is key!",
                        type = "Exam",
                        date = "2026-06-05",
                        isRead = false
                    ),
                    NotificationEntity(
                        title = "Chemistry Lab Assignment Deadline Extended",
                        message = "Good news! The deadline for submitting the Chemistry Lab Notebook (Class 10th) is extended to Friday, June 12th by 2:00 PM. No excuses will be accepted post-deadline.",
                        type = "Homework",
                        date = "2026-06-06",
                        isRead = false
                    ),
                    NotificationEntity(
                        title = "Weekly Algebra Test Results Announced",
                        message = "Class 9th Algebra Test results have been uploaded to the Results directory. Highlight scorers have been uploaded. Congratulate Zarar Khattak on scoring 100%!",
                        type = "Result",
                        date = "2026-06-06",
                        isRead = true
                    ),
                    NotificationEntity(
                        title = "SCA Academy Karak Summer Facility Timings Update",
                        message = "In response to summer heat indexes, academy hours are shifting starting next Monday. New hours: 7:30 AM to 12:30 PM. Stay hydrated, hydrated minds think sharp!",
                        type = "Update",
                        date = "2026-06-04",
                        isRead = true
                    )
                )
                initialNotifications.forEach { dao.insertNotification(it) }

                // Preseed Results
                val initialResults = listOf(
                    ResultEntity(
                        className = "Class 10",
                        subject = "Chemistry",
                        examType = "Weekly Quiz Test 2",
                        date = "2026-06-04",
                        announcementTitle = "Quiz 2: Hydrocarbons & Alkanes",
                        resultsBlob = """
                            Zarar Khattak   : 25 / 25  (Grade A+)
                            Ayesha Afridi   : 24 / 25  (Grade A)
                            Sadia Umar      : 21 / 25  (Grade B+)
                            Waleed Jan      : 19 / 25  (Grade B)
                        """.trimIndent()
                    ),
                    ResultEntity(
                        className = "Class 12",
                        subject = "Physics",
                        examType = "Mid-Term Academic Exam",
                        date = "2026-06-01",
                        announcementTitle = "Electrostatics & Magnetism Unified 100 Marks Test",
                        resultsBlob = """
                            Ahmed Khan      : 92 / 100 (Grade A+)
                            Tariq Mahmood   : 88 / 100 (Grade A)
                            Asif Jan        : 78 / 100 (Grade B)
                            Saira Bibi      : 84 / 100 (Grade B+)
                            Bilal Khattak   : 90 / 100 (Grade A+)
                        """.trimIndent()
                    )
                )
                initialResults.forEach { dao.insertResult(it) }
            }
        }
    }
}
