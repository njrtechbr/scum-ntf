export const extractTimestamp = (timeString: string): number => {
  const match = timeString.match(/<t:(\d+):R>/);
  return match ? parseInt(match[1]) : 0;
};

export const formatTimeLeft = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.abs(timestamp - now);
  
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
