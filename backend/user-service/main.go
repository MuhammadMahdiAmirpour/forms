package main

import (
	"log"
	"net/http"

	"github.com/rs/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"back-forms/user-service/models"
	"back-forms/user-service/routes"
)

var db *gorm.DB

func main() {
	// Initialize the database connection
	dsn := "host=localhost user=myuser password=mypassword dbname=formsdb sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	log.Println("Connected to the database")

	// Auto migrate the schema
	db.AutoMigrate(&models.User{}, &models.Address{})

	// Set up routes
	r := routes.SetupRoutes(db)

	// Add CORS middleware
	handler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	}).Handler(r)

	log.Println("Starting User Service on: 8081")
	log.Fatal(http.ListenAndServe(":8081", handler))
}
