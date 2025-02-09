package main

import (
	"log"
	"net/http"

	"github.com/rs/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"back-forms/report-service/routes"
	"back-forms/user-service/models"
)

var db *gorm.DB

func main() {
	// Initialize the database connection
	dsn := "host=localhost user=myuser password=mypassword dbname=formsdb sslmode=disable"
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	log.Println("Connected to the database")

	// Auto migrate the schema
	err = db.AutoMigrate(&models.User{}, &models.Address{})
	if err != nil {
		log.Fatalf("Failed to migrate the schema: %v", err)
	}

	// Set up routes
	r := routes.SetupRoutes(db)

	// Add CORS middleware
	handler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	}).Handler(r)

	log.Println("Starting User Service on: 8082")
	log.Fatal(http.ListenAndServe(":8082", handler))
}
