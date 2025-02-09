package models

import "gorm.io/gorm"

type GenderStats struct {
	WeekOrMonth      string  `json:"week_or_month"`
	MaleCount        int     `json:"male_count"`
	FemaleCount      int     `json:"female_count"`
	MalePercentage   float64 `json:"male_percentage"`
	FemalePercentage float64 `json:"female_percentage"`
}

func GetGenderStatsByWeek(db *gorm.DB) ([]GenderStats, error) {
	var stats []GenderStats
	query := `
		SELECT
			EXTRACT(WEEK FROM created_at) AS week,
			SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) AS male_count,
			SUM(CASE WHEN gender = 'Femail' THEN 1 ELSE 0 END) AS female_count
		FROM users
		WHERE deleted_at IS NULL
		GROUP BY EXTRACT(WEEK FROM created_at)
		ORDER BY week;
	`

	db.Raw(query).Scan(&stats)

	for i := range stats {
		total := stats[i].MaleCount + stats[i].FemaleCount
		stats[i].MalePercentage = calculatePercentage(stats[i].MaleCount, total)
		stats[i].FemalePercentage = calculatePercentage(stats[i].FemaleCount, total)
	}
	return stats, nil
}

func GetGenderStatsByMonth(db *gorm.DB) ([]GenderStats, error) {
	var stats []GenderStats
	query := `
        SELECT 
            TO_CHAR(created_at, 'YYYY-MM') AS month,
            SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) AS male_count,
            SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) AS female_count
        FROM users
        WHERE deleted_at IS NULL
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month;
    `

	db.Raw(query).Scan(&stats)
	for i := range stats {
		total := stats[i].MaleCount + stats[i].FemaleCount
		stats[i].MalePercentage = calculatePercentage(stats[i].MaleCount, total)
		stats[i].FemalePercentage = calculatePercentage(stats[i].FemaleCount, total)
	}

	return stats, nil
}

func calculatePercentage(count, total int) float64 {
	if total == 0 {
		return 0
	}
	return float64(count) / float64(total) * 100
}
