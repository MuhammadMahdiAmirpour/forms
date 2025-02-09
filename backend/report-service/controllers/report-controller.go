package controllers

import (
	"encoding/json"
	"log"
	"net/http"

	"gorm.io/gorm"

	"back-forms/report-service/models"
)

func GenerateReport(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		// Fetch gender stats by week
		weeklyStats, err := models.GetGenderStatsByWeek(db)
		if err != nil {
			http.Error(w, "Failed to fetch weekly stats", http.StatusInternalServerError)
			return
		}

		// Fetch gender stats by month
		monthlyStats, err := models.GetGenderStatsByMonth(db)
		if err != nil {
			http.Error(w, "Failed to fetch monthly stats", http.StatusInternalServerError)
			return
		}

		// Return JSON response
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"WeeklyStats":  weeklyStats,
			"MonthlyStats": monthlyStats,
		})
		if err != nil {
			log.Fatalf("failed to return JSON response: %v", err)
		}
	}
}
