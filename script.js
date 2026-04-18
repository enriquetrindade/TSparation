let users = JSON.parse(localStorage.getItem('users_db')) || [];
let currentUser = null;
let currentDay = null;

function handleAuth() {
    const email = document.getElementById('emailInput').value;
    const user = document.getElementById('userInput').value.trim();
    const pass = document.getElementById('passInput').value;

    if(!email || !user || !pass) return alert("Preencha todos os campos!");

    let found = users.find(u => u.username === user);
    if(found) {
        if(found.password === pass) login(found);
        else alert("Senha incorreta.");
    } else {
        const newUser = { username: user, email: email, password: pass, tasks: [] };
        users.push(newUser);
        save();
        login(newUser);
    }
}

function login(user) {
    currentUser = user;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'flex';
    document.getElementById('welcomeText').innerText = `Dashboard de ${user.username}`;
    document.getElementById('displayEmail').innerText = user.email;
    renderDashboard();
}

function renderDashboard() {
    const grid = document.getElementById('daysGrid');
    grid.innerHTML = '';
    const dias = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

    dias.forEach(dia => {
        const tasks = currentUser.tasks.filter(t => t.day === dia);
        const done = tasks.filter(t => t.status === 'concluido').length;
        grid.innerHTML += `
            <div class="day-card" onclick="openDay('${dia}')">
                <h3>${dia}</h3>
                <p style="font-size: 0.7rem; opacity: 0.5; margin-top: 10px;">${done}/${tasks.length} CONCLUÍDO</p>
            </div>`;
    });
}

function openDay(dia) {
    currentDay = dia;
    document.getElementById('selectedDayTitle').innerText = dia;
    document.getElementById('task-modal').style.display = 'flex';
    renderTasks();
}

function closeModal() {
    document.getElementById('task-modal').style.display = 'none';
    renderDashboard();
}

function addTask() {
    const input = document.getElementById('taskInput');
    const priority = document.getElementById('taskPriority').value;
    if(!input.value.trim()) return;

    currentUser.tasks.push({
        id: Date.now(),
        text: input.value.trim(),
        status: 'pendente',
        priority: priority,
        day: currentDay
    });
    input.value = '';
    save();
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    currentUser.tasks.filter(t => t.day === currentDay).forEach(t => {
        const li = document.createElement('li');
        li.className = t.priority.toLowerCase();
        li.innerHTML = `
            <span style="${t.status === 'concluido' ? 'text-decoration: line-through; opacity: 0.4' : ''}">
                [${t.priority.toUpperCase()}] ${t.text}
            </span>
            <div class="actions">
                <button onclick="updateStatus(${t.id}, 'concluido')">✅</button>
                <button onclick="deleteTask(${t.id})">🗑️</button>
            </div>
        `;
        list.appendChild(li);
    });
}

function updateStatus(id, status) {
    const t = currentUser.tasks.find(x => x.id === id);
    t.status = status;
    if(status === 'concluido') confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    save();
    renderTasks();
}

function deleteTask(id) {
    currentUser.tasks = currentUser.tasks.filter(t => t.id !== id);
    save();
    renderTasks();
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    document.getElementById('theme-toggle').innerText = document.body.classList.contains('light-mode') ? '🌙' : '☀️';
}

function save() { localStorage.setItem('users_db', JSON.stringify(users)); }
function exportData() {
    const data = JSON.stringify(users);
    const blob = new Blob([data], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "tseparation_backup.json"; a.click();
}
function importData(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        users = JSON.parse(e.target.result);
        save();
        location.reload();
    };
    reader.readAsText(event.target.files[0]);
}
function logout() { location.reload(); }