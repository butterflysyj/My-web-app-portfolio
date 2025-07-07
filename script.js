function openApp(url) {
    if (url.includes('example.com')) {
        alert('해당 앱은 현재 개발 중입니다.');
        return;
    }
    
    window.location.href = url;
}

document.addEventListener('DOMContentLoaded', function() {
    const appCards = document.querySelectorAll('.app-card');
    
    appCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});