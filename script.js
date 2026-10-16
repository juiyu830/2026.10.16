const dateElement = document.querySelector('#today-date');
const shortDateElement = document.querySelector('#short-date');
const scheduleList = document.querySelector('#schedule-list');
const scheduleCount = document.querySelector('#schedule-count');
const scheduleHeadingCount = document.querySelector('#schedule-heading-count');
const todoList = document.querySelector('#todo-list');
const progressCount = document.querySelector('#progress-count');
const progressPercent = document.querySelector('#progress-percent');
const progressBar = document.querySelector('#progress-bar');
const progressTrack = document.querySelector('.progress-track');
const todoHeadingCount = document.querySelector('.todo-count');
const scheduleForm = document.querySelector('#schedule-form');
const formMessage = document.querySelector('#form-message');

function updateDate() {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  dateElement.dateTime = localDate.toISOString().slice(0, 10);
  dateElement.textContent = new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  }).format(today);
  shortDateElement.textContent = new Intl.DateTimeFormat('en', {
    month: 'short', day: 'numeric',
  }).format(today).toUpperCase();
}

function updateTodoProgress() {
  const todos = [...todoList.querySelectorAll('.todo-item')];
  const completed = todos.filter((item) => item.querySelector('input').checked).length;
  const percentage = todos.length ? Math.round((completed / todos.length) * 100) : 0;
  todoHeadingCount.textContent = String(todos.length).padStart(2, '0');
  progressCount.textContent = `${completed} / ${todos.length}`;
  progressPercent.textContent = `${percentage}%`;
  progressBar.style.width = `${percentage}%`;
  progressTrack.setAttribute('aria-valuemax', String(todos.length));
  progressTrack.setAttribute('aria-valuenow', String(completed));
}

todoList.addEventListener('change', (event) => {
  if (!event.target.matches('input[type="checkbox"]')) return;
  const item = event.target.closest('.todo-item');
  const status = item.querySelector('.todo-status');
  item.classList.toggle('is-complete', event.target.checked);
  status.textContent = event.target.checked ? '完成' : '待處理';
  status.classList.toggle('done-status', event.target.checked);
  status.classList.toggle('pending-status', !event.target.checked);
  const detail = item.querySelector('.todo-text small');
  if (event.target.checked) {
    detail.textContent = '已完成 · 剛剛';
  } else if (detail.textContent.startsWith('已完成')) {
    detail.textContent = '待處理';
  }
  updateTodoProgress();
});

const categoryInfo = {
  work: { label: '工作', tagClass: 'tag-work' },
  life: { label: '生活', tagClass: 'tag-life' },
  focus: { label: '專注', tagClass: 'tag-focus' },
};

function getPeriodLabel(time) {
  const hour = Number(time.split(':')[0]);
  return hour < 12 ? '上午' : hour < 18 ? '下午' : '晚上';
}

function editSchedule(item) {
  const titleElement = item.querySelector('.event-card h3');
  const timeElement = item.querySelector('.time-column time');
  const locationElement = item.querySelector('.event-location');
  const tagElement = item.querySelector('.event-tag');
  const title = window.prompt('修改行程名稱：', titleElement.textContent);
  if (title === null) return;
  if (!title.trim()) {
    window.alert('行程名稱不能空白。');
    return;
  }
  const time = window.prompt('修改時間（24 小時制，例如 16:30）：', timeElement.textContent);
  if (time === null) return;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    window.alert('請輸入有效時間，例如 16:30。');
    return;
  }
  const location = window.prompt('修改地點或備註：', locationElement.textContent);
  if (location === null) return;
  const categoryKeys = Object.keys(categoryInfo);
  const categoryLabels = categoryKeys.map((key) => categoryInfo[key].label).join('、');
  const currentCategory = categoryKeys.find((key) => categoryInfo[key].label === tagElement.textContent) || 'life';
  const categoryAnswer = window.prompt(`修改類別（${categoryLabels}）：`, categoryInfo[currentCategory].label);
  if (categoryAnswer === null) return;
  const categoryKey = categoryKeys.find((key) => categoryInfo[key].label === categoryAnswer.trim());
  if (!categoryKey) {
    window.alert(`請輸入：${categoryLabels}`);
    return;
  }

  const category = categoryInfo[categoryKey];
  titleElement.textContent = title.trim();
  timeElement.textContent = time;
  item.querySelector('.time-column span').textContent = getPeriodLabel(time);
  locationElement.textContent = location.trim() || '尚未填寫地點';
  tagElement.textContent = category.label;
  tagElement.className = `event-tag ${category.tagClass}`;
  item.querySelector('.timeline-marker').className = `timeline-marker marker-${categoryKey === 'work' ? 'lilac' : categoryKey === 'life' ? 'peach' : 'green'}`;
  item.querySelector('.schedule-edit-button').setAttribute('aria-label', `編輯${title.trim()}`);
  item.querySelector('.schedule-delete-button').setAttribute('aria-label', `刪除${title.trim()}`);

  const sorted = [...scheduleList.querySelectorAll('.timeline-item')]
    .sort((a, b) => a.querySelector('.time-column time').textContent.localeCompare(b.querySelector('.time-column time').textContent));
  sorted.forEach((entry) => scheduleList.append(entry));
}

function editTodo(item) {
  const titleElement = item.querySelector('.todo-text strong');
  const updatedTitle = window.prompt('修改待辦事項：', titleElement.textContent);
  if (updatedTitle === null) return;
  if (!updatedTitle.trim()) {
    window.alert('待辦事項不能空白。');
    return;
  }
  titleElement.textContent = updatedTitle.trim();
  item.querySelector('.todo-edit-button').setAttribute('aria-label', `編輯${updatedTitle.trim()}`);
}

scheduleList.addEventListener('click', (event) => {
  const item = event.target.closest('.timeline-item');
  if (!item) return;

  const editButton = event.target.closest('.schedule-edit-button');
  if (editButton) {
    editSchedule(item);
    return;
  }

  const deleteButton = event.target.closest('.schedule-delete-button');
  if (!deleteButton) return;
  const title = item.querySelector('.event-card h3').textContent;
  if (!window.confirm(`確定要刪除「${title}」嗎？`)) return;

  item.remove();
  const total = scheduleList.querySelectorAll('.timeline-item').length;
  scheduleCount.textContent = String(total);
  scheduleHeadingCount.textContent = String(total).padStart(2, '0');
  formMessage.textContent = `「${title}」已從今日行程刪除。`;
});

todoList.addEventListener('click', (event) => {
  const button = event.target.closest('.todo-edit-button');
  if (button) editTodo(button.closest('.todo-item'));
});


scheduleForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!scheduleForm.reportValidity()) return;
  const data = new FormData(scheduleForm);
  const title = String(data.get('title')).trim();
  const location = String(data.get('location')).trim();
  const time = String(data.get('time'));
  const category = categoryInfo[String(data.get('category'))] ?? categoryInfo.life;
  if (!title) return;

  const item = document.createElement('article');
  item.className = 'timeline-item';
  const timeColumn = document.createElement('div');
  timeColumn.className = 'time-column';
  const timeElement = document.createElement('time');
  timeElement.textContent = time;
  const period = document.createElement('span');
  period.textContent = getPeriodLabel(time);
  timeColumn.append(timeElement, period);

  const marker = document.createElement('span');
  marker.className = `timeline-marker marker-${category.tagClass === 'tag-work' ? 'lilac' : category.tagClass === 'tag-life' ? 'peach' : 'green'}`;
  marker.setAttribute('aria-hidden', 'true');

  const card = document.createElement('div');
  card.className = 'event-card';
  const topLine = document.createElement('div');
  topLine.className = 'event-topline';
  const tag = document.createElement('span');
  tag.className = `event-tag ${category.tagClass}`;
  tag.textContent = category.label;
  const duration = document.createElement('span');
  duration.className = 'event-duration';
  duration.textContent = '自訂行程';
  topLine.append(tag, duration);
  const heading = document.createElement('h3');
  heading.textContent = title;
  const details = document.createElement('p');
  const locationIcon = document.createElement('span');
  locationIcon.className = 'event-location-icon';
  locationIcon.setAttribute('aria-hidden', 'true');
  locationIcon.textContent = '⌖';
  const locationText = document.createElement('span');
  locationText.className = 'event-location';
  locationText.textContent = location || '尚未填寫地點';
  details.append(locationIcon, locationText);
  const actions = document.createElement('div');
  actions.className = 'schedule-actions';
  const editButton = document.createElement('button');
  editButton.className = 'item-edit-button schedule-edit-button';
  editButton.type = 'button';
  editButton.textContent = '編輯';
  editButton.setAttribute('aria-label', `編輯${title}`);
  const deleteButton = document.createElement('button');
  deleteButton.className = 'item-delete-button schedule-delete-button';
  deleteButton.type = 'button';
  deleteButton.textContent = '刪除';
  deleteButton.setAttribute('aria-label', `刪除${title}`);
  actions.append(editButton, deleteButton);
  card.append(topLine, heading, details, actions);
  item.append(timeColumn, marker, card);

  const position = [...scheduleList.querySelectorAll('.timeline-item')]
    .find((existing) => existing.querySelector('.time-column time').textContent > time);
  scheduleList.insertBefore(item, position ?? null);
  const total = scheduleList.querySelectorAll('.timeline-item').length;
  scheduleCount.textContent = String(total);
  scheduleHeadingCount.textContent = String(total).padStart(2, '0');
  scheduleForm.reset();
  scheduleForm.elements.time.value = '16:00';
  formMessage.textContent = `「${title}」已加入今日行程。`;
});

updateDate();
updateTodoProgress();
