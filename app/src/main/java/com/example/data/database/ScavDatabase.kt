package com.example.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        NoteEntity::class,
        WhiteboardEntity::class,
        NotificationEntity::class,
        ResultEntity::class,
        StudentEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class ScavDatabase : RoomDatabase() {
    abstract fun academyDao(): AcademyDao

    companion object {
        @Volatile
        private var INSTANCE: ScavDatabase? = null

        fun getDatabase(context: Context): ScavDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    ScavDatabase::class.java,
                    "scav_academy_database"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
