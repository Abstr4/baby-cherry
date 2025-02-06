// Define the target date (12/12/2024 10 AM UTC)
const targetDate = new Date('2024-12-12T10:00:00Z');

// Function to calculate the remaining time
function timeLeft(currentDate) {
    const timeDifference = targetDate - currentDate; // in milliseconds
  
    // Ensure the target date is in the future
    if (timeDifference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 }; // The target date has passed
    }
  
    // Calculate hours, minutes, and seconds
    const hoursRemaining = Math.floor(timeDifference / (1000 * 60 * 60)); // Convert to hours
    const minutesRemaining = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)); // Convert to minutes
    const secondsRemaining = Math.floor((timeDifference % (1000 * 60)) / 1000); // Convert to seconds
  
    return {
      hours: hoursRemaining,
      minutes: minutesRemaining,
      seconds: secondsRemaining
    };
  }
  
  // Function to display the time left
  function displayTimeLeft(currentDate) {
    const remainingTime = timeLeft(currentDate);
    return `Faltan ${remainingTime.hours}h, ${remainingTime.minutes}m, ${remainingTime.seconds}s para el claim de $wf`;
  }

module.exports = { displayTimeLeft };

