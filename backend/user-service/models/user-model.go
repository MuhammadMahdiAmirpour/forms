package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents the structure of a user in the database.
type User struct {
	ID          uint           `json:"id" gorm:"primaryKey"`               // Unique identifier for the user
	Firstname   string         `json:"firstname" gorm:"not null"`          // User's first name (required)
	Lastname    string         `json:"lastname" gorm:"not null"`           // User's last name (required)
	Gender      string         `json:"gender" gorm:"not null"`             // User's gender (e.g., "Male", "Female") (required)
	PersianDate string         `json:"persian_date" gorm:"not null"`       // Persian date entered by the user (e.g., "1403/02/09") (required)
	CreatedAt   time.Time      `json:"created_at"`                         // Gregorian date converted from PersianDate
	DeletedAt   gorm.DeletedAt `json:"deleted_at" gorm:"index"`            // Soft delete timestamp
	Addresses   []Address      `json:"addresses" gorm:"foreignKey:UserID"` // List of user addresses
}

// Address represents the structure of an address associated with a user.
type Address struct {
	ID      uint   `json:"id" gorm:"primaryKey"`    // Unique identifier for the address
	UserID  uint   `json:"user_id"`                 // Foreign key linking the address to the user
	Subject string `json:"subject" gorm:"not null"` // Subject of the address (e.g., "Home", "Work") (required)
	Details string `json:"details" gorm:"not null"` // Details of the address (required)
}
