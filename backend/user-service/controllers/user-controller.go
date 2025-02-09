package controllers

import (
	"encoding/json"
	"net/http"
	"time"

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

		startDate, err := time.Parse("2006-01-02", params.Year+"-"+params.Month+"-01")
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		endDate := startDate.AddDate(0, 1, -1)

		var stats []models.UserStats
		query := `
			SELECT persian_date, COUNT(*) AS count
			FROM users
			WHERE persian_date BETWEEN ? AND ?
			GROUP BY persian_date
			ORDER BY persian_date
		`
		if err := db.Raw(query, startDate.Format("2006-01-02"), endDate.Format("2006-01-02")).Scan(&stats).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(stats)
	}
}
