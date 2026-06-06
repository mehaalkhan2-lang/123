package com.example.data.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "notes")
data class NoteEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val className: String, // "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"
    val subject: String,
    val chapter: String,
    val topic: String,
    val uploadDate: String,
    val teacherName: String,
    val fileType: String, // "PDF", "DOCX", "Image"
    val contentPlaceholder: String, // Multi-line summary content for preview window
    val downloadCount: Int = 0,
    val fileSize: String = "2.4 MB"
)

@Entity(tableName = "whiteboards")
data class WhiteboardEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val className: String,
    val subject: String,
    val chapter: String,
    val topicName: String,
    val uploadDate: String,
    val teacherName: String,
    val drawingPathData: String // Simulated drawing strokes or image placeholder
)

@Entity(tableName = "notifications")
data class NotificationEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val message: String,
    val type: String, // "Exam", "Homework", "Update", "Result"
    val date: String,
    val isRead: Boolean = false
)

@Entity(tableName = "results")
data class ResultEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val className: String,
    val subject: String,
    val examType: String, // "Mid-Term", "Final", "Weekly Test"
    val date: String,
    val announcementTitle: String,
    val resultsBlob: String, // Student-wise custom mark list representation JSON/Text
    val pdfUrlPlaceholder: String = "result_slip.pdf"
)

@Entity(tableName = "students")
data class StudentEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val rollNo: String,
    val className: String,
    val attendanceRate: Float = 92.5f,
    val email: String,
    val guardianName: String,
    val phone: String
)
