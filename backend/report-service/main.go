package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"back-forms/report-service/models"
)

// ReportResponse aggregates the gender statistics reports.
type ReportResponse struct {
	WeeklyStats  []models.GenderStats `json:"WeeklyStats"`
	MonthlyStats []models.GenderStats `json:"MonthlyStats"`
}

func main() {
	// Step 1: Connect to the database.
	dsn := "host=localhost user=myuser password=mypassword dbname=formsdb port=5432 sslmode=disable TimeZone=Asia/Tehran"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	fmt.Println("Connected to the database")

	// Step 2: Initialize the endpoint.
	mux := http.NewServeMux()
	mux.HandleFunc("/api/generate-report", func(w http.ResponseWriter, r *http.Request) {
		reportType := r.URL.Query().Get("type")
		var weekStats, monthStats []models.GenderStats
		var err error

		// Initialize empty slices so that the frontend always receives these keys.
		weekStats = []models.GenderStats{}
		monthStats = []models.GenderStats{}

		switch reportType {
		case "week":
			weekStats, err = models.GetGenderStatsByWeek(db)
			if err != nil {
				http.Error(w, "Error generating weekly report", http.StatusInternalServerError)
				return
			}
		case "month":
			monthStats, err = models.GetGenderStatsByMonth(db)
			if err != nil {
				http.Error(w, "Error generating monthly report", http.StatusInternalServerError)
				return
			}
		default:
			// Return both weekly and monthly reports if no specific type is provided.
			weekStats, err = models.GetGenderStatsByWeek(db)
			if err != nil {
				http.Error(w, "Error generating weekly report", http.StatusInternalServerError)
				return
			}
			monthStats, err = models.GetGenderStatsByMonth(db)
			if err != nil {
				http.Error(w, "Error generating monthly report", http.StatusInternalServerError)
				return
			}
		}

		// Ensure the response contains both keys even if empty.
		if weekStats == nil {
			weekStats = []models.GenderStats{}
		}
		if monthStats == nil {
			monthStats = []models.GenderStats{}
		}

		report := ReportResponse{
			WeeklyStats:  weekStats,
			MonthlyStats: monthStats,
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(report); err != nil {
			http.Error(w, "Error encoding report response", http.StatusInternalServerError)
			return
		}
	})

	// Wrap the handler with CORS middleware.
	handler := corsMiddleware(mux)

	// Step 3: Start the HTTP server.
	port := 8082
	log.Printf("Starting Report Service on port %d...\n", port)
	if err := http.ListenAndServe(":"+strconv.Itoa(port), handler); err != nil {
		log.Fatalf("Failed to start the server: %v", err)
	}
}

// corsMiddleware adds CORS headers to allow cross-origin requests.
func corsMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow all origins.
		w.Header().Set("Access-Control-Allow-Origin", "*")
		// Allow specific headers and methods.
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		// Handle preflight OPTIONS requests.
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		h.ServeHTTP(w, r)
	})
}
