export const formatPersianMonth = (persianDate: string | undefined): string => {
  if (!persianDate) return 'نامشخص';
  
  try {
    const [year, month] = persianDate.split('/');
    const persianMonths = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    
    if (!year || !month || isNaN(parseInt(month)) || parseInt(month) < 1 || parseInt(month) > 12) {
      return 'نامشخص';
    }
    
    return `${persianMonths[parseInt(month) - 1]} ${year}`;
  } catch (error) {
    console.error('Error formatting Persian date:', error);
    return 'نامشخص';
  }
};
