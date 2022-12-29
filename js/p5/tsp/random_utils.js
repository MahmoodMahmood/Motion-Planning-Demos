function generateNRandomNums(N, max) {
  let result = []
  while (result.length < Math.min(N, max)) {
    const num = Math.floor(Math.random() * max)
    if (!result.includes(num)) {
      result.push(num)
    }
  }
  return result
}

function pickNRandomElements(arr, N) {
  if (arr.length < 2) return arr
  const indices_to_pick = generateNRandomNums(N, arr.length)
  return indices_to_pick.map(index => arr[index])
}

// get random item from a Set
function getRandomItem(set) {
  let items = Array.from(set);
  return items[Math.floor(Math.random() * items.length)];
}