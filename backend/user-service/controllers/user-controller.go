package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"gorm.io/gorm"

	"back-forms/user-service/models"
)

// userInput represents the JSON payload from the frontend.
type userInput struct {
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
	Gender    string `json:"gender"`
	// Expecting persian_date as a string (for example, "1403/02/09")
	PersianDate string `json:"persian_date"`
}

// SubmitUser handles the user creation request and stores the input date directly.
func SubmitUser(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Only allow POST requests.
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var input userInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Prepare the user data by storing the Persian date as provided.
		userData := models.User{
			Firstname:   input.Firstname,
			Lastname:    input.Lastname,
			Gender:      input.Gender,
			PersianDate: input.PersianDate,
			CreatedAt:   time.Now(),
		}

		// Save the user data to the database.
		if result := db.Create(&userData); result.Error != nil {
			log.Printf("Failed to save user: %v", result.Error)
			http.Error(w, "Failed to save user", http.StatusInternalServerError)
			return
		}

		// Respond with a success message and the new user ID.
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "User submitted successfully",
			"user_id": userData.ID,
		})
	}
}
