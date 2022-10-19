export default function mySplice(array, start, howMany) {
  if (isNaN(start)) start = 0;
  if (start < 0) start = array.length + start;

  return array.filter((item, index) => {
    return index >= start && index < howMany + start;
  });
}
