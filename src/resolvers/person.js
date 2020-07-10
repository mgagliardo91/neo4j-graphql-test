export default {
  Actor: {
    randomValue: (_, { max }) => {
      return Math.floor(Math.random() * Math.floor(max));
    }
  }
}