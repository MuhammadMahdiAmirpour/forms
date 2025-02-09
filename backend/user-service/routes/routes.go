package routes

import (
	"net/http"

	"gorm.io/gorm"

	"back-forms/user-service/controllers"
)

func SetupRoutes(db *gorm.DB) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/submit-user", controllers.SubmitUser(db))
	return mux
}
