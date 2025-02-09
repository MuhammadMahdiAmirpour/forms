package models

import (
	"fmt"
	"time"

	"github.com/jalaali/go-jalaali"
	"gorm.io/gorm"
)

// GenderStats holds gender based statistics.
type GenderStats struct {
	WeekOrMonth      string  `json:"week_or_month"`
	MaleCount        int     `json:"male_count"`
	FemaleCount      int     `json:"female_count"`
	MalePercentage   float64 `json:"male_percentage"`
	FemalePercentage float64 `json:"female_percentage"`
}

// calculatePercentage calculates the percentage value of count out of total.
func calculatePercentage(count, total int) float64 {
	if total == 0 {
		return 0
	}
	return float64(count) / float64(total) * 100
}

// getPersianWeekBoundaries computes the boundaries of the current week based on the Persian calendar.
// Assumes the Persian week starts on Saturday and ends on Friday.
func getPersianWeekBoundaries() (string, string) {
	now := time.Now()
	// Determine the offset so that Saturday is treated as the first day of the week.
	offset := (int(now.Weekday()) + 1) % 7 // Go's Weekday: Sunday=0, Monday=1, ..., Saturday=6.
	startDate := now.AddDate(0, 0, -offset)
	endDate := startDate.AddDate(0, 0, 6)

	// Convert Gregorian start and end dates to Persian dates using ToJalaali.
	sYear, sMonth, sDay, _ := jalaali.ToJalaali(startDate.Year(), startDate.Month(), startDate.Day())
	eYear, eMonth, eDay, _ := jalaali.ToJalaali(endDate.Year(), endDate.Month(), endDate.Day())
	startPersian := fmt.Sprintf("%04d/%02d/%02d", sYear, sMonth, sDay)
	endPersian := fmt.Sprintf("%04d/%02d/%02d", eYear, eMonth, eDay)
	return startPersian, endPersian
}

// getPersianMonthBoundaries computes the boundaries of the current month based on the Persian calendar.
func getPersianMonthBoundaries() (string, string) {
	now := time.Now()
	pYear, pMonth, _, _ := jalaali.ToJalaali(now.Year(), now.Month(), now.Day())
	startPersian := fmt.Sprintf("%04d/%02d/%02d", pYear, pMonth, 1)

	// Define the number of days in the Persian month.
	var daysInMonth int
	if pMonth <= 6 {
		daysInMonth = 31
	} else if pMonth <= 11 {
		daysInMonth = 30
	} else {
		daysInMonth = 29
	}
	endPersian := fmt.Sprintf("%04d/%02d/%02d", pYear, pMonth, daysInMonth)
	return startPersian, endPersian
}

// GetGenderStatsByWeek returns weekly gender statistics for users whose persian_date falls within the current Persian week.
func GetGenderStatsByWeek(db *gorm.DB) ([]GenderStats, error) {
	start, end := getPersianWeekBoundaries()
	var result struct {
		MaleCount   int
		FemaleCount int
	}

	query := `
        SELECT 
            SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) AS male_count,
            SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) AS female_count
        FROM users
        WHERE persian_date BETWEEN ? AND ?
    `
	err := db.Raw(query, start, end).Scan(&result).Error
	total := result.MaleCount + result.FemaleCount

	stats := []GenderStats{
		{
			WeekOrMonth:      fmt.Sprintf("%s - %s", start, end),
			MaleCount:        result.MaleCount,
			FemaleCount:      result.FemaleCount,
			MalePercentage:   calculatePercentage(result.MaleCount, total),
			FemalePercentage: calculatePercentage(result.FemaleCount, total),
		},
	}
	return stats, err
}

// GetGenderStatsByMonth returns monthly gender statistics for users whose persian_date falls within the current Persian month.
func GetGenderStatsByMonth(db *gorm.DB) ([]GenderStats, error) {
	start, end := getPersianMonthBoundaries()
	var result struct {
		MaleCount   int
		FemaleCount int
	}

	query := `
        SELECT 
            SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) AS male_count,
            SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) AS female_count
        FROM users
        WHERE persian_date BETWEEN ? AND ?
    `
	err := db.Raw(query, start, end).Scan(&result).Error
	total := result.MaleCount + result.FemaleCount

	stats := []GenderStats{
		{
			WeekOrMonth:      fmt.Sprintf("%s - %s", start, end),
			MaleCount:        result.MaleCount,
			FemaleCount:      result.FemaleCount,
			MalePercentage:   calculatePercentage(result.MaleCount, total),
			FemalePercentage: calculatePercentage(result.FemaleCount, total),
		},
	}
	return stats, err
}
