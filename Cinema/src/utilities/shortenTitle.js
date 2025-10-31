export const shortenTitle = (title, wordLimit = 4) => {
  if (!title) return "";
  const words = title.split(" ");
  return words.length > wordLimit
    ? words.slice(0, wordLimit).join(" ") + "..."
    : title;
};