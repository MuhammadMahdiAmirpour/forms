package models

import (
	"fmt"
	"time"

	"github.com/jalaali/go-jalaali"
	"gorm.io/gorm"
)

// GenderStats holds gender-based statistics.
type GenderStats struct {
	Date             string  `json:"date"`
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
func getPersianWeekBoundaries() (string, string) {
	now := time.Now()
	offset := (int(now.Weekday()) + 1) % 7
	startDate := now.AddDate(0, 0, -offset)
	endDate := startDate.AddDate(0, 0, 6)

	sYear, sMonth, sDay, _ := jalaali.ToJalaali(startDate.Year(), startDate.Month(), startDate.Day())
	eYear, eMonth, eDay, _ := jalaali.ToJalaali(endDate.Year(), endDate.Month(), endDate.Day())
	startPersian := fmt.Sprintf("%04d/%02d/%02d", sYear, sMonth, sDay)
	endPersian := fmt.Sprintf("%04d/%02d/%02d", eYear, eMonth, eDay)
	return startPersian, endPersian
}

// getPersianMonthBoundaries computes the boundaries of the current month based on the Persian calendar.
func getPersianMonthBoundaries() (string, string, int) {
	now := time.Now()
	pYear, pMonth, _, _ := jalaali.ToJalaali(now.Year(), now.Month(), now.Day())
	startPersian := fmt.Sprintf("%04d/%02d/%02d", pYear, pMonth, 1)

	var daysInMonth int
	if pMonth <= 6 {
		daysInMonth = 31
	} else if pMonth <= 11 {
		daysInMonth = 30
	} else {
		daysInMonth = 29
	}
	endPersian := fmt.Sprintf("%04d/%02d/%02d", pYear, pMonth, daysInMonth)
	return startPersian, endPersian, daysInMonth
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
	if err != nil {
		return nil, err
	}
	total := result.MaleCount + result.FemaleCount

	stats := []GenderStats{
		{
			Date:             fmt.Sprintf("%s - %s", start, end),
			MaleCount:        result.MaleCount,
			FemaleCount:      result.FemaleCount,
			MalePercentage:   calculatePercentage(result.MaleCount, total),
			FemalePercentage: calculatePercentage(result.FemaleCount, total),
		},
	}
	return stats, nil
}

// GetGenderStatsByMonth returns daily gender statistics for users whose persian_date falls within the current Persian month.
func GetGenderStatsByMonth(db *gorm.DB) ([]GenderStats, error) {
	start, _, daysInMonth := getPersianMonthBoundaries()
	var stats []GenderStats

	for day := 1; day <= daysInMonth; day++ {
		date := fmt.Sprintf("%s/%02d", start[:8], day)
		var result struct {
			MaleCount   int
			FemaleCount int
		}

		query := `
        SELECT 
            SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) AS male_count,
            SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) AS female_count
        FROM users
        WHERE persian_date = ?
    `
		err := db.Raw(query, date).Scan(&result).Error
		if err != nil {
			return nil, err
		}
		total := result.MaleCount + result.FemaleCount

		stats = append(stats, GenderStats{
			Date:             date,
			MaleCount:        result.MaleCount,
			FemaleCount:      result.FemaleCount,
			MalePercentage:   calculatePercentage(result.MaleCount, total),
			FemalePercentage: calculatePercentage(result.FemaleCount, total),
		})
	}
	return stats, nil
}
