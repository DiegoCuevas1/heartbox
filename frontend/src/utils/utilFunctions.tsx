export function sanitize_res_msg(message: string) {
  // Sanitize a response message by removing quotes
  const sanitizedMessage = message.replace(/["']/g, "");
  return sanitizedMessage;
}

export function getTimeSincePost(datePosted: Date) {
  const postDate = new Date(datePosted);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - postDate.getTime();
  const millisecondsPerHour = 1000 * 60 * 60;
  const millisecondsPerDay = millisecondsPerHour * 24;

  if (timeDifference < millisecondsPerHour) {
    const minutes = Math.floor(timeDifference / (1000 * 60));
    return `${minutes}min`;
  } else if (timeDifference < millisecondsPerDay) {
    const hours = Math.floor(timeDifference / millisecondsPerHour);
    return `${hours}hr`;
  } else if (timeDifference < millisecondsPerDay * 7) {
    const days = Math.floor(timeDifference / millisecondsPerDay);
    return `${days}d`;
  } else {
    return `${postDate.getMonth() + 1}/${postDate.getDate()}/${postDate
      .getFullYear()
      .toString()
      .slice(-2)}`;
  }
}

export function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text: string) =>
      text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  );
}
