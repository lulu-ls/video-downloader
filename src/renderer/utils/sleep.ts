export const Sleep = (timeountMS: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, timeountMS);
  });
