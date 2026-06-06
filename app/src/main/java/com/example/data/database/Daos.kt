package com.example.data.database

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface AcademyDao {
    // === NOTES ===
    @Query("SELECT * FROM notes ORDER BY id DESC")
    fun getAllNotes(): Flow<List<NoteEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNote(note: NoteEntity): Long

    @Query("UPDATE notes SET downloadCount = downloadCount + 1 WHERE id = :noteId")
    suspend fun incrementDownloadCount(noteId: Int)

    @Query("DELETE FROM notes WHERE id = :id")
    suspend fun deleteNote(id: Int)

    // === WHITEBOARDS ===
    @Query("SELECT * FROM whiteboards ORDER BY id DESC")
    fun getAllWhiteboards(): Flow<List<WhiteboardEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWhiteboard(whiteboard: WhiteboardEntity): Long

    @Query("DELETE FROM whiteboards WHERE id = :id")
    suspend fun deleteWhiteboard(id: Int)

    // === NOTIFICATIONS ===
    @Query("SELECT * FROM notifications ORDER BY id DESC")
    fun getAllNotifications(): Flow<List<NotificationEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNotification(notification: NotificationEntity): Long

    @Query("UPDATE notifications SET isRead = 1 WHERE id = :id")
    suspend fun markNotificationAsRead(id: Int)

    @Query("UPDATE notifications SET isRead = 1")
    suspend fun markAllNotificationsAsRead()

    @Query("DELETE FROM notifications WHERE id = :id")
    suspend fun deleteNotification(id: Int)

    // === RESULTS ===
    @Query("SELECT * FROM results ORDER BY id DESC")
    fun getAllResults(): Flow<List<ResultEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertResult(result: ResultEntity): Long

    @Query("DELETE FROM results WHERE id = :id")
    suspend fun deleteResult(id: Int)

    // === STUDENTS ===
    @Query("SELECT * FROM students ORDER BY name ASC")
    fun getAllStudents(): Flow<List<StudentEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStudent(student: StudentEntity): Long

    @Query("DELETE FROM students WHERE id = :id")
    suspend fun deleteStudent(id: Int)

    @Query("SELECT COUNT(*) FROM students")
    fun getStudentCount(): Flow<Int>
}
