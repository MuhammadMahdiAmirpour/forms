export const formatPersianMonth = (persianDate: string | undefined): string => {
  if (!persianDate) return 'نامشخص';
  
  try {
    const [year, month] = persianDate.split('/');
    const persianMonths = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    
    const monthIndex = parseInt(month);

    if (!year || isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12) {
      return 'نامشخص';
    }
    
    return `${persianMonths[monthIndex - 1]} ${year}`;
  } catch (error) {
    console.error('Error formatting Persian date:', error);
    return 'نامشخص';
  }
};
