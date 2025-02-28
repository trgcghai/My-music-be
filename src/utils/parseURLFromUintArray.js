const parseURLFromUintArray = (data, type = "image/png") => {
  const blob = new Blob([data], { type });
  return URL.createObjectURL(blob);
};
export default parseURLFromUintArray;
