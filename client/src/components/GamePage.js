import React, { useState, useEffect } from 'react';
import './GamePage.css';

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];

const GamePage = () => {
    const [selectedNumber, setSelectedNumber] = useState(1);
    const [bingoCard, setBingoCard] = useState(generateBingoCard(1));
    const [markedNumbers, setMarkedNumbers] = useState([]);
    const [isCardSelected, setIsCardSelected] = useState(false);
    const [calledNumbers, setCalledNumbers] = useState([]);
    const [timer, setTimer] = useState(null);
    const [currentCall, setCurrentCall] = useState('');
    const [bingo, setBingo] = useState(false);

    const handleNumberChange = (e) => {
        setSelectedNumber(e.target.value);
        setBingoCard(generateBingoCard(e.target.value));
        setMarkedNumbers([]);
        setBingo(false);
    };

    const handleCardSelect = () => {
        setIsCardSelected(true);
        startTimer();
    };

    const toggleMarkNumber = (rowIndex, cellIndex) => {
        const number = bingoCard[rowIndex][cellIndex];
        setMarkedNumbers(prev =>
            prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]
        );
    };

    const checkBingo = () => {
        const rows = bingoCard.some(row => row.every(number => markedNumbers.includes(number)));
        const cols = bingoCard[0].some((_, i) => bingoCard.every(row => markedNumbers.includes(row[i])));
        const diag1 = bingoCard.every((row, i) => markedNumbers.includes(row[i]));
        const diag2 = bingoCard.every((row, i) => markedNumbers.includes(row[4 - i]));

        if (rows || cols || diag1 || diag2) {
            setBingo(true);
            alert('Bingo! You win!');
        } else {
            alert('Not Bingo yet! Keep going!');
        }
    };

    const startTimer = () => {
        const interval = setInterval(() => {
            const letter = BINGO_LETTERS[Math.floor(Math.random() * BINGO_LETTERS.length)];
            let number;

            switch (letter) {
                case 'B':
                    number = Math.floor(Math.random() * 15) + 1; // 1-15
                    break;
                case 'I':
                    number = Math.floor(Math.random() * 15) + 16; // 16-30
                    break;
                case 'N':
                    number = Math.floor(Math.random() * 15) + 31; // 31-45
                    break;
                case 'G':
                    number = Math.floor(Math.random() * 15) + 46; // 46-60
                    break;
                case 'O':
                    number = Math.floor(Math.random() * 15) + 61; // 61-75
                    break;
                default:
                    number = Math.floor(Math.random() * 75) + 1;
            }

            const call = `${letter}${number}`;
            setCurrentCall(call);
            setCalledNumbers(prev => [...prev, call]);
        }, 5000); // 5-second intervals
        setTimer(interval);
    };

    useEffect(() => {
        return () => {
            clearInterval(timer);
        };
    }, [timer]);

    return (
        <div>
            {!isCardSelected ? (
                <div>
                    <label>Select a number between 1-200:</label>
                    <input
                        type="number"
                        value={selectedNumber}
                        onChange={handleNumberChange}
                        min="1"
                        max="200"
                    />
                    <button onClick={handleCardSelect}>Select Card</button>
                    <div className="bingo-card">
                        <div className="bingo-header">
                            {BINGO_LETTERS.map((letter, index) => (
                                <div key={index} className="bingo-header-cell">{letter}</div>
                            ))}
                        </div>
                        <div className="bingo-body">
                            {bingoCard.map((row, rowIndex) => (
                                <div key={rowIndex} className="bingo-row">
                                    {row.map((cell, cellIndex) => (
                                        <div
                                            key={cellIndex}
                                            className={`bingo-cell ${markedNumbers.includes(cell) ? 'marked' : ''}`}
                                            onClick={() => toggleMarkNumber(rowIndex, cellIndex)}
                                        >
                                            {cell === '★' ? '★' : cell}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <h3>Game in progress</h3>
                    <p>Current Call: {currentCall}</p>
                    <div className="called-numbers">
                        <h4>Called Numbers History:</h4>
                        <div className="called-numbers-list">
                            {calledNumbers.map((call, index) => (
                                <span key={index} className="called-number">{call}</span>
                            ))}
                        </div>
                    </div>
                    <div className="bingo-card">
                        <div className="bingo-header">
                            {BINGO_LETTERS.map((letter, index) => (
                                <div key={index} className="bingo-header-cell">{letter}</div>
                            ))}
                        </div>
                        <div className="bingo-body">
                            {bingoCard.map((row, rowIndex) => (
                                <div key={rowIndex} className="bingo-row">
                                    {row.map((cell, cellIndex) => (
                                        <div
                                            key={cellIndex}
                                            className={`bingo-cell ${markedNumbers.includes(cell) ? 'marked' : ''}`}
                                            onClick={() => toggleMarkNumber(rowIndex, cellIndex)}
                                        >
                                            {cell === '★' ? '★' : cell}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    {bingo && <button onClick={checkBingo}>Check Bingo</button>}
                </div>
            )}
        </div>
    );
};

const generateBingoCard = (seed) => {
  const card = [];
  for (let i = 0; i < 5; i++) {
      const column = [];
      for (let j = 0; j < 5; j++) {
          let min = i * 15 + 1;
          let max = i * 15 + 15;
          let num;
          do {
              num = Math.floor(Math.random() * (max - min + 1)) + min;
          } while (column.includes(num));
          column.push(num);
      }
      card.push(column);
  }
  card[2][2] = '★'; // Middle cell as a star
  return card[0].map((_, colIndex) => card.map(row => row[colIndex]));
};

export default GamePage;
