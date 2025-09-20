/**
 * Formats a date string into "Today", "Yesterday", or a localized date.
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(); // fallback
};

/**
 * Generates a simple unique ID.
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};
