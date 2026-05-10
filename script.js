// Отримуємо задачі з localStorage.
// Якщо задач немає — створюємо порожній масив.
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Поточний активний фільтр
let filter = 'all';

// Отримуємо елементи DOM
const list = document.getElementById('list');
const input = document.getElementById('input');
const search = document.getElementById('search');

// Функція зберігає задачі у localStorage
function save() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function render() {

    // Очищаємо список перед повторним рендером
    list.innerHTML = '';

    // Фільтрація задач
    let data = todos

        // Фільтр по статусу
        .filter(t =>
            filter === 'all' ||
            (filter === 'active' && !t.done) ||
            (filter === 'done' && t.done)
        )

        // Пошук задач по тексту
        .filter(t =>
            t.text.toLowerCase().includes(search.value.toLowerCase())
        );

    // Якщо задач немає — показуємо блок "Немає задач"
    document.getElementById('empty').style.display =
        data.length ? 'none' : 'block';

    // Перебираємо всі задачі
    data.forEach(t => {

        // Створюємо HTML елемент li
        const li = document.createElement('li');

        // Додаємо CSS класи
        li.className = `${t.done ? 'done' : ''} prio-${t.priority}`;

        // Перевірка на прострочений дедлайн
        if (t.deadline && new Date(t.deadline) < new Date()) {
            li.classList.add('overdue');
        }

        // HTML структуру задачі
        li.innerHTML = `
            <input type="checkbox" ${t.done ? 'checked' : ''}>
            
            <span>${t.text}</span>

            <div class="actions">
                <button>✏️</button>
                <button>🗑</button>
            </div>
        `;

        li.querySelector('input').onclick = () => {

            // Змінюємо статус задачі
            t.done = !t.done;

            // Зберігаємо зміни
            save();

            // Оновлюємо список
            render();
        };


        li.querySelectorAll('button')[0].onclick = () => {

            // Вікно редагування тексту
            const txt = prompt('Edit', t.text);

            // Якщо введений текст існує
            if (txt) {

                // Оновлюємо текст задачі
                t.text = txt;

                // Зберігаємо зміни
                save();

                // Перерендер
                render();
            }
        };


        li.querySelectorAll('button')[1].onclick = () => {

            // Видаляємо задачу по id
            todos = todos.filter(x => x.id !== t.id);

            // Зберігаємо зміни
            save();

            // Оновлюємо список
            render();
        };

        // Додаємо задачу у список
        list.appendChild(li);
    });
}

document.getElementById('form').onsubmit = e => {

    // Забороняємо перезавантаження сторінки
    e.preventDefault();

    // Додаємо нову задачу у початок масиву
    todos.unshift({

        // Унікальний id
        id: Date.now(),

        // Текст задачі
        text: input.value,

        // Статус виконання
        done: false,

        // Пріоритет
        priority: document.getElementById('priority').value,

        // Дедлайн
        deadline: document.getElementById('deadline').value
    });

    // Очищаємо input
    input.value = '';

    // Зберігаємо задачі
    save();

    // Оновлюємо список
    render();
};



// Отримуємо всі кнопки фільтрів
document.querySelectorAll('.filters button').forEach(b => {

    // Подія кліку
    b.onclick = () => {

        // Встановлюємо активний фільтр
        filter = b.dataset.f;

        // Забираємо active у попередньої кнопки
        document.querySelector('.active').classList.remove('active');

        // Додаємо active поточній кнопці
        b.classList.add('active');

        // Оновлюємо список
        render();
    };
});


// При введенні тексту оновлюємо список
search.oninput = render;



document.getElementById('theme').onclick = () => {

    // Перемикаємо світлу тему
    document.body.classList.toggle('light');
};



// Початковий час — 25 хв
let time = 1500;

// Загальний час для progress bar
let total = time;

// Змінна інтервалу
let interval;

// Елементи DOM
const display = document.getElementById('time');
const inputTime = document.getElementById('time-input');


function update() {

    // Обчислення хвилин та секунд
    let m = Math.floor(time / 60);
    let s = time % 60;

    // Форматування часу
    display.innerText =
        `${m}:${s < 10 ? '0' : ''}${s}`;

    // Оновлення progress bar
    document.getElementById('progress-bar').style.width =
        ((total - time) / total) * 100 + '%';
}



display.onclick = () => {

    // Забороняємо зміну під час роботи таймера
    if (interval) return;

    // Ховаємо display
    display.style.display = 'none';

    // Показуємо input
    inputTime.classList.remove('hidden');

    // Встановлюємо поточний час
    inputTime.value = Math.floor(time / 60);

    // Фокус на input
    inputTime.focus();
};


// Збереження часу при втраті фокусу
inputTime.onblur = saveTime;


// Збереження часу по Enter
inputTime.onkeydown = e => {

    if (e.key === 'Enter') saveTime();
};


function saveTime() {

    // Отримуємо введене значення
    let val = parseInt(inputTime.value);

    // Перевірка на коректність
    if (val > 0) {

        // Конвертуємо хвилини у секунди
        time = val * 60;

        // Оновлюємо total
        total = time;

        // Оновлюємо таймер
        update();
    }

    // Ховаємо input
    inputTime.classList.add('hidden');

    // Показуємо display
    display.style.display = 'block';
}



// Налаштування режимів
const modes = {
    focus: 25,
    short: 5,
    long: 15
};

// Кнопки режимів
document.querySelectorAll('.mode-btn').forEach(btn => {

    btn.onclick = () => {

        // Забираємо active
        document
            .querySelector('.mode-btn.active')
            .classList.remove('active');

        // Додаємо active поточній кнопці
        btn.classList.add('active');

        // Встановлюємо новий час
        time = modes[btn.dataset.mode] * 60;

        // Оновлюємо total
        total = time;

        // Оновлюємо UI
        update();
    };
});



document.getElementById('start').onclick = () => {

    // Якщо таймер працює — ставимо паузу
    if (interval) {

        clearInterval(interval);

        interval = null;

        return;
    }

    // Запускаємо таймер
    interval = setInterval(() => {

        // Зменшуємо час
        time--;

        // Оновлюємо UI
        update();

        // Якщо час закінчився
        if (time <= 0) {

            // Зупиняємо таймер
            clearInterval(interval);

            interval = null;

            // Показуємо toast
            toast('Сесія завершена 🔥');

            // Повертаємо початковий час
            time = total;
        }

    }, 1000);
};



document.getElementById('reset').onclick = () => {

    // Зупиняємо таймер
    clearInterval(interval);

    interval = null;

    // Повертаємо початковий час
    time = total;

    // Оновлюємо UI
    update();
};


function toast(msg) {

    // Створюємо div
    const t = document.createElement('div');

    // Додаємо клас
    t.className = 'toast';

    // Встановлюємо текст
    t.innerText = msg;

    // Додаємо у body
    document.body.appendChild(t);

    // Видаляємо через 2 секунди
    setTimeout(() => t.remove(), 2000);
}


// Оновлюємо таймер
update();

// Відображаємо задачі
render();