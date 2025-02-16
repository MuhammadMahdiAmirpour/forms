package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/gorilla/schema"
	"gorm.io/gorm"

	"back-forms/user-service/models"
)

type UserStatsParams struct {
	Month string `schema:"month"`
	Year  string `schema:"year"`
}

func SubmitUser(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var user models.User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if result := db.Create(&user); result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(user)
	}
}

func GetUserStats(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var params UserStatsParams
		decoder := schema.NewDecoder()
		if err := decoder.Decode(&params, r.URL.Query()); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		datePattern := fmt.Sprintf("%%%s%s%%", params.Year, params.Month)

		var users []models.User
		if err := db.Where("persian_date LIKE ?", datePattern).Find(&users).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	}
}

func GetUsers(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var users []models.User

		// Remove the JOIN and just use Preload
		result := db.
			Preload("Addresses").
			Find(&users)

		if result.Error != nil {
			log.Printf("Error fetching users: %v", result.Error)
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}

		// Debug log
		log.Printf("Found %d users", len(users))
		for _, user := range users {
			log.Printf("User ID: %d has %d addresses", user.ID, len(user.Addresses))
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	}
}

// GetUserById handles fetching a single user by ID
func GetUserById(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		userId := vars["id"]

		var user models.User

		// Just use Preload without JOIN
		result := db.
			Preload("Addresses").
			First(&user, userId)

		if result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				http.Error(w, "User not found", http.StatusNotFound)
				return
			}
			log.Printf("Error fetching user: %v", result.Error)
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}

		// Debug log
		log.Printf("User ID: %d has %d addresses", user.ID, len(user.Addresses))

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}

// GetUserAddresses handles fetching addresses for a specific user
func GetUserAddresses(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		userId := vars["id"]

		var addresses []models.Address
		if err := db.Where("user_id = ?", userId).Find(&addresses).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(addresses)
	}
}

// AddUserAddress handles adding a new address for a user
func AddUserAddress(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		userId := vars["id"]

		// Convert string ID to uint
		id, err := strconv.ParseUint(userId, 10, 32)
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}

		var address models.Address
		if err := json.NewDecoder(r.Body).Decode(&address); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Verify user exists
		var user models.User
		if err := db.First(&user, id).Error; err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		address.UserID = uint(id)
		if err := db.Create(&address).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Verify address was created
		var createdAddress models.Address
		if err := db.First(&createdAddress, address.ID).Error; err != nil {
			http.Error(w, "Failed to verify address creation", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(createdAddress)
	}
}
