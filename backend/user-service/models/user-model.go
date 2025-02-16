package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents the structure of a user in the database.
type User struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Firstname   string         `json:"firstname" gorm:"not null"`
	Lastname    string         `json:"lastname" gorm:"not null"`
	Gender      string         `json:"gender" gorm:"not null"`
	PersianDate string         `json:"persian_date" gorm:"not null"`
	CreatedAt   time.Time      `json:"created_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	Addresses   []Address      `json:"addresses" gorm:"foreignKey:UserID;references:ID"`
}

// Address represents the structure of an address associated with a user.
type Address struct {
	ID      uint   `json:"id" gorm:"primaryKey"`
	UserID  uint   `json:"user_id" gorm:"not null"`
	Subject string `json:"subject" gorm:"not null"`
	Details string `json:"details" gorm:"not null"`
}

// UserStats represents the aggregated user statistics.
type UserStats struct {
	PersianDate string `json:"persian_date"`
	MaleCount   int    `json:"male_count"`
	FemaleCount int    `json:"female_count"`
}
