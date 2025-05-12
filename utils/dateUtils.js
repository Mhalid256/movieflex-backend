// netflix-api/src/utils/dateUtils.js
export function calculateEndDate(subscriptionType) {
    const currentDate = new Date();
    if (subscriptionType === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (subscriptionType === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return currentDate.toISOString();
  }
  