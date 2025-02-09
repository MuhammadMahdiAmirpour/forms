package main

import (
	"log"
	"net/http"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/gorilla/mux"
	"github.com/rs/cors"

	"back-forms/user-service/controllers"
	"back-forms/user-service/models"
)

func main() {
	dsn := "user=myuser password=mypassword dbname=formsdb port=5432 sslmode=disable TimeZone=Asia/Tehran"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// Auto migrate the User and Address models.
	db.AutoMigrate(&models.User{}, &models.Address{})

	router := mux.NewRouter()
	router.HandleFunc("/api/submit-user", controllers.SubmitUser(db)).Methods("POST")
	router.HandleFunc("/api/user-stats", controllers.GetUserStats(db)).Methods("GET")

	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}).Handler(router)

	log.Println("User Service started at :8081")
	log.Fatal(http.ListenAndServe(":8081", corsHandler))
}
