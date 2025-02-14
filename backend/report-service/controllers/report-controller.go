package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"gorm.io/gorm"

	"back-forms/report-service/models"
)

func GenerateReport(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Generating report...")

		stats, err := models.GetAllStats(db)
		fmt.Printf("Generated stats: %+v\n", stats)

		if err != nil {
			fmt.Printf("Error generating stats: %v\n", err)
			http.Error(w, "Failed to fetch statistics", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		err = json.NewEncoder(w).Encode(stats)
		if err != nil {
			fmt.Printf("Error encoding response: %v\n", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		fmt.Println("Report generated successfully")
	}
}
