export const TimeStringToSeconds = (timeString: string): number => {
  const parts = timeString.split(':').map((part) => parseInt(part, 10));
  const hours = parts[0];
  const minutes = parts[1];
  const seconds = parts[2];

  return hours * 3600 + minutes * 60 + seconds;
};
