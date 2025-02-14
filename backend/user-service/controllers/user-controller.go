package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"

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
