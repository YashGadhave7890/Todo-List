const taskInput = document.getElementById('task-input');
const dueInput = document.getElementById('due-input');
const priorityInput = document.getElementById('priority-input');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('[data-filter]');
const sortButtons = document.querySelectorAll('[data-sort]');
const themeToggle = document.getElementById('theme-toggle');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let currentFilter = 'all';
let currentSort = '';

document.getElementById('add-btn').onclick = () => {
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({
    id: Date.now(),
    text,
    completed: false,
    due: dueInput.value,
    priority: priorityInput.value
  });
  taskInput.value = '';
  dueInput.value = '';
  priorityInput.value = 'low';
  save();
  renderTasks();
};

function renderTasks() {
  let filtered = tasks.filter(t => {
    if (currentFilter === 'active') return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  if (currentSort === 'text') filtered.sort((a, b) => a.text.localeCompare(b.text));
  if (currentSort === 'due') filtered.sort((a, b) => (a.due || '').localeCompare(b.due || ''));
  if (currentSort === 'priority') {
    const prio = { low: 3, medium: 2, high: 1 };
    filtered.sort((a, b) => prio[a.priority] - prio[b.priority]);
  }

  taskList.innerHTML = '';
  filtered.forEach(t => {
    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.id = t.id;
    li.className = t.completed ? 'done' : '';

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = t.completed;
    chk.onchange = () => {
      t.completed = chk.checked;
      if (t.completed) celebrate();
      save();
      renderTasks();
    };

    const span = document.createElement('span');
    span.textContent = `${t.text} (${t.priority}) ${t.due ? '- ' + t.due : ''}`;
    span.contentEditable = true;
    span.onblur = () => {
      t.text = span.textContent.trim();
      save();
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = '❌';
    delBtn.onclick = () => {
      tasks = tasks.filter(x => x.id !== t.id);
      save();
      renderTasks();
    };

    li.append(chk, span, delBtn);
    taskList.appendChild(li);
  });
}

filterButtons.forEach(btn => btn.onclick = () => {
  filterButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  renderTasks();
});

sortButtons.forEach(btn => btn.onclick = () => {
  currentSort = btn.dataset.sort;
  renderTasks();
});

themeToggle.onclick = () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '🌞' : '🌙';
};

function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Drag and drop support
taskList.ondragstart = e => {
  e.dataTransfer.setData('id', e.target.dataset.id);
};

taskList.ondragover = e => e.preventDefault();

taskList.ondrop = e => {
  e.preventDefault();
  const draggedId = e.dataTransfer.getData('id');
  const targetId = e.target.closest('li')?.dataset?.id;
  if (!targetId || draggedId === targetId) return;
  const draggedIdx = tasks.findIndex(t => t.id == draggedId);
  const targetIdx = tasks.findIndex(t => t.id == targetId);
  const [dragged] = tasks.splice(draggedIdx, 1);
  tasks.splice(targetIdx, 0, dragged);
  save();
  renderTasks();
};

function celebrate() {
  const duration = 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, {
      particleCount,
      origin: { x: Math.random(), y: Math.random() - 0.2 }
    }));
  }, 250);
}

renderTasks();
