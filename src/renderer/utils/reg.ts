const IsProtocol = (url: string): boolean => {
  return /^(http|https):\/\//.test(url);
};

export { IsProtocol };
