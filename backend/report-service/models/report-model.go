package models

import (
	"fmt"
	"sort"
	"strings"

	"gorm.io/gorm"
)

type GenderStats struct {
	Date             string  `json:"date"`
	MaleCount        int     `json:"male_count"`
	FemaleCount      int     `json:"female_count"`
	MalePercentage   float64 `json:"male_percentage"`
	FemalePercentage float64 `json:"female_percentage"`
}

func calculatePercentage(count, total int) float64 {
	if total == 0 {
		return 0
	}
	return float64(count) / float64(total) * 100
}

func GetTotalGenderStats(db *gorm.DB) (GenderStats, error) {
	var result struct {
		MaleCount   int
		FemaleCount int
	}

	query := `
        SELECT 
            COUNT(CASE WHEN gender = 'Male' THEN 1 END) AS male_count,
            COUNT(CASE WHEN gender = 'Female' THEN 1 END) AS female_count
        FROM users
    `
	err := db.Raw(query).Scan(&result).Error
	if err != nil {
		return GenderStats{}, err
	}

	total := result.MaleCount + result.FemaleCount
	return GenderStats{
		MaleCount:        result.MaleCount,
		FemaleCount:      result.FemaleCount,
		MalePercentage:   calculatePercentage(result.MaleCount, total),
		FemalePercentage: calculatePercentage(result.FemaleCount, total),
	}, nil
}

type UserForStats struct {
	PersianDate string
	Gender      string
}

func GetDailyStats(db *gorm.DB) ([]GenderStats, error) {
	var users []UserForStats

	err := db.Table("users").
		Select("persian_date, gender").
		Find(&users).Error
	if err != nil {
		return nil, err
	}

	dailyStats := make(map[string]GenderStats)

	for _, user := range users {
		englishDate := convertPersianToEnglish(user.PersianDate)

		stats := dailyStats[englishDate]
		if user.Gender == "Male" {
			stats.MaleCount++
		} else {
			stats.FemaleCount++
		}
		stats.Date = englishDate
		dailyStats[englishDate] = stats
	}

	var result []GenderStats
	for _, stats := range dailyStats {
		total := stats.MaleCount + stats.FemaleCount
		stats.MalePercentage = calculatePercentage(stats.MaleCount, total)
		stats.FemalePercentage = calculatePercentage(stats.FemaleCount, total)
		result = append(result, stats)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Date < result[j].Date
	})

	return result, nil
}

func convertPersianToEnglish(persianStr string) string {
	persianNums := map[rune]rune{
		'۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
		'۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
	}

	var result strings.Builder
	for _, r := range persianStr {
		if en, ok := persianNums[r]; ok {
			result.WriteRune(en)
		} else {
			result.WriteRune(r)
		}
	}
	return result.String()
}

func GetWeeklyStats(db *gorm.DB) ([]GenderStats, error) {
	var users []UserForStats

	err := db.Table("users").
		Select("persian_date, gender").
		Find(&users).Error
	if err != nil {
		return nil, err
	}

	weeklyStats := make(map[string]GenderStats)

	for _, user := range users {
		englishDate := convertPersianToEnglish(user.PersianDate)
		// Extract day from YYYYMMDD format
		day := englishDate[6:8]
		// Calculate week number (1-based)
		weekNum := (atoi(day)-1)/7 + 1
		weekKey := fmt.Sprintf("Week %d", weekNum)

		stats := weeklyStats[weekKey]
		stats.Date = weekKey
		if user.Gender == "Male" {
			stats.MaleCount++
		} else {
			stats.FemaleCount++
		}
		weeklyStats[weekKey] = stats
	}

	var result []GenderStats
	for _, stats := range weeklyStats {
		total := stats.MaleCount + stats.FemaleCount
		stats.MalePercentage = calculatePercentage(stats.MaleCount, total)
		stats.FemalePercentage = calculatePercentage(stats.FemaleCount, total)
		result = append(result, stats)
	}

	// Sort by week number
	sort.Slice(result, func(i, j int) bool {
		return result[i].Date < result[j].Date
	})

	return result, nil
}

func atoi(s string) int {
	n := 0
	for _, c := range s {
		n = n*10 + int(c-'0')
	}
	return n
}

func GetAllStats(db *gorm.DB) (map[string]interface{}, error) {
	totalStats, err := GetTotalGenderStats(db)
	if err != nil {
		return nil, err
	}

	dailyStats, err := GetDailyStats(db)
	if err != nil {
		return nil, err
	}

	weeklyStats, err := GetWeeklyStats(db)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"total":  totalStats,
		"daily":  dailyStats,
		"weekly": weeklyStats,
	}, nil
}
