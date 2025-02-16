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
	// Check users table
	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	log.Printf("Total users: %d", userCount)

	// Check addresses table
	var addressCount int64
	db.Model(&models.Address{}).Count(&addressCount)
	log.Printf("Total addresses: %d", addressCount)

	// Check addresses with their user IDs
	var addresses []models.Address
	db.Find(&addresses)
	for _, addr := range addresses {
		log.Printf("Address ID: %d, User ID: %d, Subject: %s", addr.ID, addr.UserID, addr.Subject)
	}

	// Verify foreign key constraint
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
	// Database configuration
	dsn := "user=myuser password=mypassword dbname=formsdb port=5432 sslmode=disable TimeZone=Asia/Tehran"

	// Custom GORM logger configuration
	newLogger := logger.New(
		log.New(log.Writer(), "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Info,
			IgnoreRecordNotFoundError: false,
			Colorful:                  true,
		},
	)

	// Open database connection with custom configuration
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		return nil, err
	}

	// Set connection pool settings
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Auto migrate the schemas
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
		// Debug mode for development
		Debug: true,
	})
}

func setupRoutes(router *mux.Router, db *gorm.DB) {
	// API routes
	api := router.PathPrefix("/api").Subrouter()

	// Users endpoints
	api.HandleFunc("/users", controllers.GetUsers(db)).Methods("GET")
	api.HandleFunc("/users/{id}", controllers.GetUserById(db)).Methods("GET")
	api.HandleFunc("/submit-user", controllers.SubmitUser(db)).Methods("POST")

	// Addresses endpoints
	api.HandleFunc("/users/{id}/addresses", controllers.GetUserAddresses(db)).Methods("GET")
	api.HandleFunc("/users/{id}/addresses", controllers.AddUserAddress(db)).Methods("POST")

	// Stats endpoint
	api.HandleFunc("/user-stats", controllers.GetUserStats(db)).Methods("GET")

	// Add OPTIONS method to handle preflight requests
	api.Methods("OPTIONS").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
}

func main() {
	// Initialize database
	log.Println("Initializing database connection...")
	db, err := initDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	debugDatabase(db)

	// Create and configure router
	router := mux.NewRouter()

	// Setup routes
	setupRoutes(router, db)

	// Setup CORS
	corsHandler := setupCORS().Handler(router)

	// Create server
	server := &http.Server{
		Addr:         ":8081",
		Handler:      corsHandler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server
	log.Printf("User Service starting on http://localhost%s", server.Addr)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
