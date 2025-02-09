package controllers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/jalaali/go-jalaali" // Import the jalaali-go library
	"gorm.io/gorm"

	"back-forms/user-service/models"
)

func SubmitUser(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var userData models.User
		err := json.NewDecoder(r.Body).Decode(&userData)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Parse the Persian date (e.g., "1403/02/09")
		var year, month, day int
		_, err = fmt.Sscanf(userData.PersianDate, "%d/%d/%d", &year, &month, &day)
		if err != nil {
			log.Printf("Failed to parse Persian date: %v", err)
			http.Error(w, "Failed to parse Persian date", http.StatusBadRequest)
			return
		}

		// Convert Persian date to Gregorian date
		gregorianYear, gregorianMonth, gregorianDay, _ := jalaali.ToGregorian(year, jalaali.Month(month), day)

		// Create a time.Time object from the Gregorian date
		gregorianDate := time.Date(gregorianYear, time.Month(gregorianMonth), gregorianDay, 0, 0, 0, 0, time.UTC)

		// Set the Gregorian date as the created_at field
		userData.CreatedAt = gregorianDate

		// Save the user to the database
		result := db.Create(&userData)
		if result.Error != nil {
			log.Printf("Failed to save user: %v", result.Error)
			http.Error(w, "Failed to save user", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "User submitted successfully",
			"user_id": userData.ID,
		})
	}
}
