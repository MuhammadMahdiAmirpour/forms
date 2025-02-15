package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"back-forms/report-service/controllers"
)

func main() {
	dsn := "user=myuser password=mypassword dbname=formsdb port=5432 sslmode=disable TimeZone=Asia/Tehran"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	router := mux.NewRouter()
	router.HandleFunc("/api/report", controllers.GenerateReport(db)).Methods("GET")

	// Enable CORS
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}).Handler(router)

	log.Println("Report Service started at :8082")
	log.Fatal(http.ListenAndServe(":8082", corsHandler))
}
