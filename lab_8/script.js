function clearResult() 
{
    document.getElementById("result").textContent = "";
}

// Задача 1
    // Написать функцию counter(n), которая выводит в консоль раз в секунду числа n, n-1 ... 2, 1, 0 и останавливается.

    // Написать функцию createCounter(n), возвращающую объект с методами:
        // start() -- запускает (или возобновляет) счётчик c интервалом 1 секунда: N, N-1.
        // pause() -- приостанавливает счёт, но не сбрасывает счётчик.
        // stop() -- останавливает счёт, сбрасывает счётчик.
let timerId = null;
let currentCount = 0;
let targetCount = 0;

function counter(n) {
    let count = n;
    const intervalId = setInterval(() => {
        console.log(count);
        document.getElementById("result").textContent = `Таймер: ${count}`;
        if (count === 0) {
            clearInterval(intervalId);
        }
        count--;
    }, 1000);
}

function createCounter(n) {
    return {
        start() {
            if (timerId) clearInterval(timerId);
            currentCount = targetCount = n;
            timerId = setInterval(() => {
                document.getElementById("result").textContent = `Счётчик: ${currentCount}`;
                console.log(currentCount);
                if (currentCount <= 0) {
                    stopCounter();
                } else {
                    currentCount--;
                }
            }, 1000);
        },
        pause() {
            if (timerId) {
                clearInterval(timerId);
                timerId = null;
                document.getElementById("result").textContent += " (приостановлен)";
            }
        },
        stop() {
            if (timerId) {
                clearInterval(timerId);
                timerId = null;
            }
            currentCount = 0;
            document.getElementById("result").textContent = "Счётчик остановлен";
        }
    };
}

const counterInstance = createCounter(5);

function startCounter() {
    const n = parseInt(document.getElementById("counterInput").value) || 5;
    if (targetCount !== n) {
        targetCount = n;
        currentCount = n;
    }
    counterInstance.start();
}

function pauseCounter() {
    counterInstance.pause();
}

function stopCounter() {
    counterInstance.stop();
}


// Задача 2
    // Написать функцию delay(N), возвращающую промис, который сделает resolve() через N секунд.
    // Решить задачу со счётчиком N, N-1 ... 2, 1, 0 через функцию delay.
    // Написать функцию, возвращающую название первого репозитория на github.com по имени пользователя (2 последовательных запроса: https://api.github.com/users/%USERNAME%).
function delay(seconds) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}

async function runDelayedCounter() {
    const seconds = parseInt(document.getElementById("delayInput").value) || 3;
    const n = 5;
    document.getElementById("result").textContent = `Ожидание ${seconds} сек...`;
    await delay(seconds);
    for (let i = n; i >= 0; i--) {
        document.getElementById("result").textContent = `Счёт: ${i}`;
        await delay(1);
    }
}

// --- Получение первого репозитория через .then/catch ---

async function getFirstRepo() {
    const username = document.getElementById("githubUserInput").value.trim();
    if (!username) {
        document.getElementById("result").textContent = "Введите имя пользователя.";
        return;
    }

    fetch(`https://api.github.com/users/${username}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(user => {
            return fetch(user.repos_url).then(r => r.json());
        })
        .then(repos => {
            if (repos.length === 0) {
                document.getElementById("result").textContent = "Репозитории не найдены.";
            } else {
                document.getElementById("result").textContent = `Первый репозиторий: ${repos[0].name}`;
            }
        })
        .catch(err => {
            document.getElementById("result").textContent = `Ошибка: ${err.message}`;
        });
}

// --- То же самое, но через async/await (Задача 3) ---

class HttpError extends Error {
    constructor(response) {
        super(`${response.status} for ${response.url}`);
        this.name = 'HttpError';
        this.response = response;
    }
}

async function loadJson(url) {
    const response = await fetch(url);
    if (response.status === 200) {
        return await response.json();
    } else {
        throw new HttpError(response);
    }
}

async function getGithubUser() {
    let name = document.getElementById("githubUserInput").value.trim() || "Nekraket";

    while (true) {
        try {
            const user = await loadJson(`https://api.github.com/users/${name}`);
            const repos = await loadJson(user.repos_url);
            if (repos.length > 0) {
                document.getElementById("result").textContent = `Первый репозиторий: ${repos[0].name}`;
            } else {
                document.getElementById("result").textContent = "У пользователя нет репозиториев.";
            }
            break;
        } catch (err) {
            if (err instanceof HttpError && err.response.status === 404) {
                name = prompt("Пользователь не найден. Введите другое имя:", "");
                if (!name) {
                    document.getElementById("result").textContent = "Отменено пользователем.";
                    break;
                }
            } else {
                document.getElementById("result").textContent = `Ошибка: ${err.message}`;
                break;
            }
        }
    }
}