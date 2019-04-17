module.exports = getRandomItem

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
