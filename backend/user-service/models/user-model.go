package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents the structure of a user in the database.
type User struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	Firstname string `json:"firstname" gorm:"not null"`
	Lastname  string `json:"lastname" gorm:"not null"`
	Gender    string `json:"gender" gorm:"not null"`
	// PersianDate is stored as a string exactly as provided by the user.
	PersianDate string `json:"persian_date" gorm:"not null"`
	// CreatedAt stores the full date-time when the record was created.
	CreatedAt time.Time `json:"created_at"`
	// DeletedAt stores the full date-time when the record was soft-deleted.
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	Addresses []Address      `json:"addresses" gorm:"foreignKey:UserID"`
}

// Address represents the structure of an address associated with a user.
type Address struct {
	ID      uint   `json:"id" gorm:"primaryKey"`
	UserID  uint   `json:"user_id"`
	Subject string `json:"subject" gorm:"not null"`
	Details string `json:"details" gorm:"not null"`
}
