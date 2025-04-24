let warningInterval = null;
const growlSound = new Audio('stomach_growl.ogg');
growlSound.volume = 0.3;

function setProgress(percent, selector) {
    const circle = document.querySelector(selector);
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    if (percent < 30) {
        circle.setAttribute('stroke', '#ff3c3c');
        circle.style.filter = 'drop-shadow(0 0 2px #ff3c3c)';
    } else {
        if (selector === '.progress-hunger') {
            circle.setAttribute('stroke', '#00ff88');
            circle.style.filter = 'drop-shadow(0 0 2px #00ff88)';
        } else if (selector === '.progress-thirst') {
            circle.setAttribute('stroke', '#00cfff');
            circle.style.filter = 'drop-shadow(0 0 2px #00cfff)';
        }
    }
}

function checkCriticalLevels(hunger, thirst) {
    if ((hunger < 20 || thirst < 20) && !warningInterval) {
        growlSound.play();
        warningInterval = setInterval(() => {
            growlSound.play();
        }, 30000);
    } else if (hunger >= 20 && thirst >= 20 && warningInterval) {
        clearInterval(warningInterval);
        warningInterval = null;
    }
}

window.addEventListener('message', function (event) {
    const data = event.data;

    if (data.action === 'updateStatus') {
        setProgress(data.hunger, '.progress-hunger');
        setProgress(data.thirst, '.progress-thirst');
        checkCriticalLevels(data.hunger, data.thirst);
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const containers = ['.status-container', '.status-container2'];

    containers.forEach(selector => {
        const hud = document.querySelector(selector);
        let isDragging = false;
        let isDragModeEnabled = false;
        let startX, startY, initialX, initialY;

        const savedPosition = JSON.parse(localStorage.getItem(`${selector}-position`));
        if (savedPosition) {
            hud.style.top = savedPosition.top;
            hud.style.left = savedPosition.left;
            hud.style.position = 'absolute';
        }

        hud.addEventListener('mousedown', (e) => {
            if (isDragModeEnabled) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                initialX = hud.offsetLeft;
                initialY = hud.offsetTop;
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                hud.style.top = `${initialY + dy}px`;
                hud.style.left = `${initialX + dx}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                localStorage.setItem(`${selector}-position`, JSON.stringify({
                    top: hud.style.top,
                    left: hud.style.left,
                }));
            }
        });

        window.addEventListener('message', (event) => {
            const data = event.data;

            if (data.action === 'enableDrag') {
                isDragModeEnabled = true;
                document.body.style.cursor = 'move';
            } else if (data.action === 'disableDrag') {
                isDragModeEnabled = false;
                document.body.style.cursor = 'default';
            } else if (data.action === 'resetHUD') {
                hud.style.top = 'unset';
                hud.style.left = '0';
                hud.style.right = 'unset';
                hud.style.bottom = '0';
                localStorage.removeItem(`${selector}-position`);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && isDragModeEnabled) {
                isDragModeEnabled = false;
                document.body.style.cursor = 'default';

                fetch(`https://${GetParentResourceName()}/closeUI`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    },
                    body: JSON.stringify({})
                }).then(resp => {
                    window.postMessage({ action: 'disableDrag' }, '*');
                }).catch(err => {
                    console.error('Error closing NUI:', err);
                });
            }
        });
    });
});
