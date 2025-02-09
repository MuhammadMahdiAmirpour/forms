package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"back-forms/user-service/controllers"
	"back-forms/user-service/models"
)

func main() {
	// Step 1: Connect to the database.
	dsn := "host=localhost user=myuser password=mypassword dbname=formsdb port=5432 sslmode=disable TimeZone=Asia/Tehran"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	fmt.Println("Connected to the database")

	// Step 2: (Optional) Clean the database tables (for development purposes).
	err = db.Migrator().DropTable(&models.Address{}, &models.User{})
	if err != nil {
		log.Fatalf("Failed to drop tables: %v", err)
	}
	fmt.Println("Dropped user and address tables.")

	// Step 3: Rebuild the schema.
	err = db.AutoMigrate(&models.User{}, &models.Address{})
	if err != nil {
		log.Fatalf("Schema migrated failed: %v", err)
	}
	fmt.Println("Schema migrated successfully")

	// Step 4: Update the persian_date column for existing records.
	// Since the persian_date column is defined as a string, we pass a default string value.
	// Here, we use the current date formatted as "YYYY/MM/DD" as the default value.
	defaultDate := time.Now().Format("2006/01/02")
	err = db.Exec(`
        UPDATE users
        SET persian_date = ?
        WHERE persian_date = '';
    `, defaultDate).Error
	if err != nil {
		log.Fatalf("Failed to update persian_date column: %v", err)
	}
	fmt.Printf("Updated persian_date column with value: %s\n", defaultDate)

	// Step 5: Initialize the router and controllers with CORS support.
	mux := http.NewServeMux()
	mux.HandleFunc("/api/submit-user", controllers.SubmitUser(db))
	handler := corsMiddleware(mux)

	// Step 6: Start the HTTP server on port 8081.
	port := ":8081"
	fmt.Printf("Starting User Service on port %s...\n", port)
	log.Fatal(http.ListenAndServe(port, handler))
}

// corsMiddleware adds the necessary CORS headers to allow cross-origin requests.
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
