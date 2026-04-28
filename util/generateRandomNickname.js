

const schoolAdjectives = [
    'Brainy', 'Cheerful', 'Curious', 'Diligent', 'Eager', 'Friendly', 'Geeky', 'Happy',
    'Jolly', 'Kind', 'Lively', 'Nerdy', 'Playful', 'Quick', 'Quiet', 'Silly',
    'Smart', 'Sneaky', 'Sporty', 'Studious', 'Swift', 'Tidy', 'Witty', 'Zany',
    'Helpful', 'Creative', 'Brave', 'Polite', 'Chill', 'Goofy'
];

const schoolNouns = [
    'Backpack', 'Book', 'Chalk', 'Desk', 'Eraser', 'Globe', 'Hallway', 'Locker',
    'Lunchbox', 'Marker', 'Notebook', 'Pencil', 'Principal', 'Quiz', 'Ruler', 'Student',
    'Teacher', 'Test', 'Uniform', 'Whiteboard', 'Classmate', 'Coach', 'Janitor', 'Monitor',
    'Prefect', 'Report', 'Schedule', 'Bell', 'Bus', 'Playground', 'Hallpass', 'Tablet',
    'Trophy', 'Yearbook', 'Club', 'Band', 'Drama', 'Mathlete', 'Librarian', 'Counselor'
];



/**
 * Generates a random school-themed nickname.
 * @returns {string} A random nickname like "BrainyBackpack42" or "WittyTeacher7".
 */
const generateRandomNickname = () => {
    const adj = schoolAdjectives[Math.floor(Math.random() * schoolAdjectives.length)];
    const noun = schoolNouns[Math.floor(Math.random() * schoolNouns.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}${noun}${num}`;
};

export default generateRandomNickname;