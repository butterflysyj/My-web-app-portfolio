class ScheduleManager {
    constructor() {
        this.schedules = this.loadSchedules();
        this.initializeEventListeners();
        this.renderSchedules();
    }

    initializeEventListeners() {
        const form = document.getElementById('schedule-form');
        const searchInput = document.getElementById('search');
        const categoryFilter = document.getElementById('filter-category');
        const sortSelect = document.getElementById('sort-by');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        searchInput.addEventListener('input', () => this.renderSchedules());
        categoryFilter.addEventListener('change', () => this.renderSchedules());
        sortSelect.addEventListener('change', () => this.renderSchedules());
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value.trim();
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value.trim();

        if (!title || !date || !time || !category) {
            alert('모든 필수 항목을 입력해주세요.');
            return;
        }

        const schedule = {
            id: Date.now(),
            title,
            date,
            time,
            category,
            description,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.schedules.push(schedule);
        this.saveSchedules();
        this.renderSchedules();
        this.resetForm();
        
        this.showNotification('일정이 성공적으로 추가되었습니다!', 'success');
    }

    resetForm() {
        document.getElementById('schedule-form').reset();
    }

    loadSchedules() {
        const stored = localStorage.getItem('schedules');
        return stored ? JSON.parse(stored) : [];
    }

    saveSchedules() {
        localStorage.setItem('schedules', JSON.stringify(this.schedules));
    }

    deleteSchedule(id) {
        if (confirm('이 일정을 삭제하시겠습니까?')) {
            this.schedules = this.schedules.filter(schedule => schedule.id !== id);
            this.saveSchedules();
            this.renderSchedules();
            this.showNotification('일정이 삭제되었습니다.', 'info');
        }
    }

    toggleComplete(id) {
        const schedule = this.schedules.find(s => s.id === id);
        if (schedule) {
            schedule.completed = !schedule.completed;
            this.saveSchedules();
            this.renderSchedules();
            this.showNotification(
                schedule.completed ? '일정을 완료했습니다!' : '일정을 미완료로 변경했습니다.',
                'success'
            );
        }
    }

    editSchedule(id) {
        const schedule = this.schedules.find(s => s.id === id);
        if (!schedule) return;

        document.getElementById('title').value = schedule.title;
        document.getElementById('date').value = schedule.date;
        document.getElementById('time').value = schedule.time;
        document.getElementById('category').value = schedule.category;
        document.getElementById('description').value = schedule.description;

        this.deleteSchedule(id);
        document.getElementById('title').focus();
    }

    getFilteredAndSortedSchedules() {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const categoryFilter = document.getElementById('filter-category').value;
        const sortBy = document.getElementById('sort-by').value;

        let filtered = this.schedules.filter(schedule => {
            const matchesSearch = schedule.title.toLowerCase().includes(searchTerm) ||
                                schedule.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || schedule.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        return this.sortSchedules(filtered, sortBy);
    }

    sortSchedules(schedules, sortBy) {
        return schedules.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);
                case 'date-desc':
                    return new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });
    }

    getCategoryIcon(category) {
        const icons = {
            work: 'fas fa-briefcase',
            personal: 'fas fa-user',
            health: 'fas fa-heart',
            study: 'fas fa-book',
            meeting: 'fas fa-users',
            other: 'fas fa-tag'
        };
        return icons[category] || 'fas fa-calendar';
    }

    getCategoryColor(category) {
        const colors = {
            work: 'bg-blue-100 text-blue-800',
            personal: 'bg-green-100 text-green-800',
            health: 'bg-red-100 text-red-800',
            study: 'bg-purple-100 text-purple-800',
            meeting: 'bg-yellow-100 text-yellow-800',
            other: 'bg-gray-100 text-gray-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    }

    getCategoryName(category) {
        const names = {
            work: '업무',
            personal: '개인',
            health: '건강',
            study: '공부',
            meeting: '회의',
            other: '기타'
        };
        return names[category] || '기타';
    }

    formatDateTime(date, time) {
        const scheduleDate = new Date(date + ' ' + time);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const scheduleDay = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());
        
        const diffDays = Math.floor((scheduleDay - today) / (1000 * 60 * 60 * 24));
        
        let dayText = '';
        if (diffDays === 0) dayText = '오늘';
        else if (diffDays === 1) dayText = '내일';
        else if (diffDays === -1) dayText = '어제';
        else if (diffDays > 1) dayText = `${diffDays}일 후`;
        else dayText = `${Math.abs(diffDays)}일 전`;

        const timeStr = scheduleDate.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });

        return {
            date: scheduleDate.toLocaleDateString('ko-KR'),
            time: timeStr,
            dayText,
            isPast: scheduleDate < now
        };
    }

    renderSchedules() {
        const container = document.getElementById('schedule-list');
        const schedules = this.getFilteredAndSortedSchedules();

        if (schedules.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    등록된 일정이 없습니다.
                </div>
            `;
            return;
        }

        container.innerHTML = schedules.map(schedule => {
            const dateTime = this.formatDateTime(schedule.date, schedule.time);
            const categoryIcon = this.getCategoryIcon(schedule.category);
            const categoryColor = this.getCategoryColor(schedule.category);
            const categoryName = this.getCategoryName(schedule.category);

            return `
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${schedule.completed ? 'bg-gray-50' : ''} ${dateTime.isPast && !schedule.completed ? 'border-red-200 bg-red-50' : ''}">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <button onclick="scheduleManager.toggleComplete(${schedule.id})" 
                                    class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${schedule.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-500'}">
                                    ${schedule.completed ? '<i class="fas fa-check text-xs"></i>' : ''}
                                </button>
                                <h3 class="text-lg font-semibold text-gray-800 ${schedule.completed ? 'line-through text-gray-500' : ''}">${schedule.title}</h3>
                                <span class="px-2 py-1 rounded-full text-xs font-medium ${categoryColor}">
                                    <i class="${categoryIcon} mr-1"></i>${categoryName}
                                </span>
                            </div>
                            
                            <div class="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <span class="flex items-center gap-1">
                                    <i class="fas fa-calendar-day"></i>
                                    ${dateTime.date} (${dateTime.dayText})
                                </span>
                                <span class="flex items-center gap-1">
                                    <i class="fas fa-clock"></i>
                                    ${dateTime.time}
                                </span>
                                ${dateTime.isPast && !schedule.completed ? '<span class="text-red-600 font-medium">지난 일정</span>' : ''}
                            </div>
                            
                            ${schedule.description ? `<p class="text-gray-600 text-sm ${schedule.completed ? 'line-through' : ''}">${schedule.description}</p>` : ''}
                        </div>
                        
                        <div class="flex items-center gap-2 ml-4">
                            <button onclick="scheduleManager.editSchedule(${schedule.id})" 
                                class="text-blue-600 hover:text-blue-800 p-2 rounded transition-colors">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="scheduleManager.deleteSchedule(${schedule.id})" 
                                class="text-red-600 hover:text-red-800 p-2 rounded transition-colors">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white transition-all duration-300 transform translate-x-full`;
        
        const bgColor = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        }[type] || 'bg-gray-500';
        
        notification.className += ` ${bgColor}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    exportToJSON() {
        const dataStr = JSON.stringify(this.schedules, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'schedules.json';
        link.click();
        URL.revokeObjectURL(url);
        this.showNotification('일정 데이터가 내보내기되었습니다.', 'success');
    }

    importFromJSON(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    this.schedules = imported;
                    this.saveSchedules();
                    this.renderSchedules();
                    this.showNotification('일정 데이터가 가져오기되었습니다.', 'success');
                } else {
                    throw new Error('Invalid format');
                }
            } catch (error) {
                this.showNotification('파일 형식이 올바르지 않습니다.', 'error');
            }
        };
        reader.readAsText(file);
    }
}

let scheduleManager;

document.addEventListener('DOMContentLoaded', () => {
    scheduleManager = new ScheduleManager();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
});