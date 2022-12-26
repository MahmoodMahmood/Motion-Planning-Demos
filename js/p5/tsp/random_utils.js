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
  if (arr.length == 0) return []
  if (arr.length == 1) return Math.min(1,N)
  const indices_to_pick = generateNRandomNums(N, arr.length)
  return indices_to_pick.map(index => arr[index])
}