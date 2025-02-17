package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"back-forms/user-service/controllers"
	"back-forms/user-service/models"
)

func debugDatabase(db *gorm.DB) {
	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	log.Printf("Total users: %d", userCount)

	var addressCount int64
	db.Model(&models.Address{}).Count(&addressCount)
	log.Printf("Total addresses: %d", addressCount)

	var addresses []models.Address
	db.Find(&addresses)
	for _, addr := range addresses {
		log.Printf("Address ID: %d, User ID: %d, Subject: %s", addr.ID, addr.UserID, addr.Subject)
	}

	var result map[string]interface{}
	db.Raw(`
        SELECT 
            tc.constraint_name, 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'addresses';
    `).Find(&result)
	log.Printf("Foreign key details: %+v", result)
}

func initDB() (*gorm.DB, error) {
	dsn := "user=myuser password=mypassword dbname=formsdb port=5432 sslmode=disable TimeZone=Asia/Tehran"

	newLogger := logger.New(
		log.New(log.Writer(), "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Info,
			IgnoreRecordNotFoundError: false,
			Colorful:                  true,
		},
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Running database migrations...")
	err = db.AutoMigrate(&models.User{}, &models.Address{})
	if err != nil {
		return nil, err
	}

	return db, nil
}

func setupCORS() *cors.Cors {
	return cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		Debug:            true,
	})
}

func setupRoutes(router *mux.Router, db *gorm.DB) {
	api := router.PathPrefix("/api").Subrouter()

	// User routes
	api.HandleFunc("/users", controllers.GetUsers(db)).Methods("GET")
	api.HandleFunc("/users", controllers.SubmitUser(db)).Methods("POST")
	api.HandleFunc("/users/{id}", controllers.GetUserById(db)).Methods("GET")
	api.HandleFunc("/users/{id}", controllers.EditUser(db)).Methods("PUT")

	// Address routes
	api.HandleFunc("/users/{id}/addresses", controllers.GetUserAddresses(db)).Methods("GET")
	api.HandleFunc("/users/{id}/addresses", controllers.AddUserAddress(db)).Methods("POST")
	api.HandleFunc("/users/{userId}/addresses/{addressId}", controllers.EditAddress(db)).Methods("PUT")
	api.HandleFunc("/users/{userId}/addresses/{addressId}", controllers.DeleteAddress(db)).Methods("DELETE")

	// Stats route
	api.HandleFunc("/user-stats", controllers.GetUserStats(db)).Methods("GET")

	// Global OPTIONS handler
	router.PathPrefix("/").Methods("OPTIONS").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.WriteHeader(http.StatusOK)
	})
}

func main() {
	log.Println("Initializing database connection...")
	db, err := initDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	debugDatabase(db)

	router := mux.NewRouter()
	setupRoutes(router, db)
	corsHandler := setupCORS().Handler(router)

	server := &http.Server{
		Addr:         ":8081",
		Handler:      corsHandler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("User Service starting on http://localhost%s", server.Addr)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
