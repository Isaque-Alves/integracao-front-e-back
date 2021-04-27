function calcReadTime(text) {
  const wordsPerMinute = 170;
  const pattern = '<\\w+(\\s+("[^"]*"|\\\'[^\\\']*\'|[^>])+)?>|<\\/\\w+>';

  const reg = new RegExp(pattern, 'gi');
  text = text.replace(reg, '');

  const noOfWords = text.split(/\s/g).length;
  const minutes = noOfWords / wordsPerMinute;
  const readTime = Math.ceil(minutes);
  return `${readTime} min de leitura`;
}

export default calcReadTime;
