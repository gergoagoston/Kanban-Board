export const formatDate = (dateString: string): string => {
  const date = new Date(dateString); // Convert to Date object
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};
