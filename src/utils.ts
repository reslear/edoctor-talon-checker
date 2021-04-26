export const randomNumber = (min = 0, max = 10) =>
  Math.random() * (max - min) + min
