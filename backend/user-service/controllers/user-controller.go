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

// EditAddress handles updating an existing address
func EditAddress(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		userId := vars["userId"]
		addressId := vars["addressId"]

		// Parse the updated address from request body
		var updatedAddress models.Address
		if err := json.NewDecoder(r.Body).Decode(&updatedAddress); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Find existing address
		var existingAddress models.Address
		if err := db.Where("id = ? AND user_id = ?", addressId, userId).First(&existingAddress).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				http.Error(w, "Address not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Update address fields
		if updatedAddress.Subject != "" {
			existingAddress.Subject = updatedAddress.Subject
		}
		if updatedAddress.Details != "" {
			existingAddress.Details = updatedAddress.Details
		}

		// Save the updated address
		if err := db.Save(&existingAddress).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(existingAddress)
	}
}

// DeleteAddress handles deleting an address
func DeleteAddress(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		userId := vars["userId"]
		addressId := vars["addressId"]

		// Check if address exists and belongs to the user
		var address models.Address
		if err := db.Where("id = ? AND user_id = ?", addressId, userId).First(&address).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				http.Error(w, "Address not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Delete the address
		if err := db.Delete(&address).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

func EditUser(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get user ID from URL parameters
		vars := mux.Vars(r)
		userId := vars["id"]

		// Create a struct to receive the update data
		type UpdateData struct {
			User      models.User      `json:"user"`
			Addresses []models.Address `json:"addresses"`
		}

		// Parse the updated data from request body
		var updateData UpdateData
		if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Start a transaction
		tx := db.Begin()
		if tx.Error != nil {
			http.Error(w, tx.Error.Error(), http.StatusInternalServerError)
			return
		}

		// Find existing user
		var existingUser models.User
		if err := tx.Preload("Addresses").First(&existingUser, userId).Error; err != nil {
			tx.Rollback()
			if errors.Is(err, gorm.ErrRecordNotFound) {
				http.Error(w, "User not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Update user fields
		if updateData.User.Firstname != "" {
			existingUser.Firstname = updateData.User.Firstname
		}
		if updateData.User.Lastname != "" {
			existingUser.Lastname = updateData.User.Lastname
		}
		if updateData.User.PhoneNumber != "" {
			existingUser.PhoneNumber = updateData.User.PhoneNumber
		}
		if updateData.User.Gender != "" {
			existingUser.Gender = updateData.User.Gender
		}
		if updateData.User.PersianDate != "" {
			existingUser.PersianDate = updateData.User.PersianDate
		}

		// Save the updated user
		if err := tx.Save(&existingUser).Error; err != nil {
			tx.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Handle address updates
		if len(updateData.Addresses) > 0 {
			// Delete existing addresses
			if err := tx.Where("user_id = ?", existingUser.ID).Delete(&models.Address{}).Error; err != nil {
				tx.Rollback()
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Add new addresses
			for i := range updateData.Addresses {
				updateData.Addresses[i].UserID = existingUser.ID
				if err := tx.Create(&updateData.Addresses[i]).Error; err != nil {
					tx.Rollback()
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}
		}

		// Commit the transaction
		if err := tx.Commit().Error; err != nil {
			tx.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Fetch the updated user with addresses
		var updatedUser models.User
		if err := db.Preload("Addresses").First(&updatedUser, userId).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Return the updated user
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(updatedUser)
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
