const winningPatterns = [
  ["B1", "B2", "B3", "B4", "B5"],
  ["I1", "I2", "I3", "I4", "I5"],
  ["N1", "N2", "Free", "N4", "N5"],
  ["G1", "G2", "G3", "G4", "G5"],
  ["O1", "O2", "O3", "O4", "O5"],
  ["B1", "I1", "N1", "G1", "O1"],
  ["B2", "I2", "N2", "G2", "O2"],
  ["B3", "I3", "Free", "G3", "O3"],
  ["B4", "I4", "N4", "G4", "O4"],
  ["B5", "I5", "N5", "G5", "O5"],
  ["B1", "I2", "Free", "G4", "O5"],
  ["B5", "I4", "Free", "G2", "O1"],
  ["B1", "B5", "O1", "O5"],
];

const validateWinnings = (card, drawnNumbers) => {
  // console.log({ card, drawnNumbers });
  // Convert drawnNumbers array to a Set for faster lookups
  const drawnNumbersSet = new Set(drawnNumbers);

  // Check each winning pattern
  for (let pattern of winningPatterns) {
    let isWinningPattern = true;

    // Check if each cell in the pattern has been drawn
    for (let cell of pattern) {
      // For the free space in the center
      if (cell === "Free") continue;

      // Get the number from the card for the current cell
      let number = card[cell];

      // Check if the number is in the drawn numbers
      if (number !== "Free" && !drawnNumbersSet.has(number)) {
        isWinningPattern = false;
        break;
      }
    }

    // If we found a winning pattern, return true
    if (isWinningPattern) {
      return true;
    }
  }

  // If no winning pattern was found, return false
  return false;
};

module.exports = { validateWinnings };
