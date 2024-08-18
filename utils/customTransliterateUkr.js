exports.customTransliterateUkr = function (name) {
  return name
    .replace(/є/g, "ie")
    .replace(/й/g, "i")
    .replace(/ю/g, "iu")
    .replace(/я/g, "ia");
};
