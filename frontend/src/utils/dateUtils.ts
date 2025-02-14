export const formatPersianMonth = (persianDate: string): string => {
  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const [year, month] = persianDate.split('/');
  const monthIndex = parseInt(month);

  if (!year || isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12) {
    return 'نامشخص';
  }

  return `${persianMonths[monthIndex - 1]} ${year}`;
};

