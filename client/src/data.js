// src/data.js
export const fakeUsers = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
];

// Simulate an API call with a Promise
export function getUsers() {
    return new Promise((resolve) => {
        setTimeout(() => resolve(fakeUsers), 500); // 0.5 second delay
    });
}
