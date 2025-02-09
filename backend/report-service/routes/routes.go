package routes

import (
	"net/http"

	"gorm.io/gorm"

	"back-forms/report-service/controllers"
)

func SetupRoutes(db *gorm.DB) *http.ServeMux {
	mux := http.NewServeMux()

	// Define API routes
	mux.HandleFunc("/api/generate-report", controllers.GenerateReport(db))

	return mux
}
