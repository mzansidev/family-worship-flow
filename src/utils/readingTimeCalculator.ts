
export const calculateReadingTime = (text: string): string => {
  // Average reading speed is 200-250 words per minute for adults
  // Using 200 WPM for a conservative estimate
  const wordsPerMinute = 200;
  
  // Count words by splitting on whitespace and filtering empty strings
  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  // Calculate reading time in minutes
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  
  // Format the reading time
  if (readingTimeMinutes < 1) {
    return "< 1 min";
  } else if (readingTimeMinutes === 1) {
    return "1 min";
  } else {
    return `${readingTimeMinutes} min`;
  }
};
