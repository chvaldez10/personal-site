/**
 * Get the date 7 days from now
 * @returns {string} The date 7 days from now
 */
export const getDateSevenDaysFromNow = () => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 7);
  return futureDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
