const app = new PIXI.Application({
    width: 480,
    height: 640,
    backgroundColor: 0x3b2a20,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});

document.getElementById('game-container').appendChild(app.view);

const symbols = ['☕', '🫘', '🥐', '🧁', '🐸'];

const reels = [];
const reelWidth = 120;
const reelHeight = 120;

const totalWidth = reelWidth * 3;
const startXGlobal = (app.screen.width - totalWidth) / 2;

const spinButton = document.getElementById('spin');
let isSpinning = false;

for (let i = 0; i < 3; i++) {
    const reel = new PIXI.Container();
    reel.x = startXGlobal + i * reelWidth;
    reel.y = 180;

    for (let j = 0; j < 3; j++) {
        const symbol = new PIXI.Text(
            symbols[Math.floor(Math.random() * symbols.length)],
            { fontSize: 64 }
        );
        symbol.anchor.set(0.5);
        symbol.x = reelWidth / 2;
        symbol.y = j * reelHeight + reelHeight / 2;
        reel.addChild(symbol);
    }

    reels.push(reel);
    app.stage.addChild(reel);
}

spinButton.addEventListener('click', () => {
    if (isSpinning) return;

    isSpinning = true;
    spinButton.disabled = true;
    winText.text = '';

    reels.forEach((reel, i) => {
        gsap.to(reel, {
            y: reel.y + 360,
            duration: 0.8 + i * 0.2,
            ease: 'power3.out',
            onComplete: () => {
                reel.y = 180;
                reel.children.forEach(symbol => {
                    symbol.text = symbols[Math.floor(Math.random() * symbols.length)];
                });

                if (i === reels.length - 1) {
                    checkWin();
                    isSpinning = false;
                    spinButton.disabled = false;
                }
            }
        });
    });
});

//Win text and win-check

const winText = new PIXI.Text('', {
    fontSize: 32,
    fill: '#ffffff'
});
winText.anchor.set(0.5);
winText.x = app.screen.width / 2;
winText.y = 520;
app.stage.addChild(winText);

function checkWin() {
    const row = reels.map(reel => reel.children[1].text);
    const first = row[0];
    let matchCount = 1;

    for (let i = 1; i < row.length; i++) {
        if (row[i] === first || row[i] === '🐸' || first === '🐸') {
            matchCount++;
        } else {
            break;
        }
    }


if (matchCount === 3) {
        winText.text = 'Good brew ☕';

        reels.forEach(reel => {
            const symbol = reel.children[1];
            gsap.fromTo(
                symbol.scale,
                { x: 1, y: 1 },
                { x: 1.3, y: 1.3, yoyo: true, repeat: 1, duration: 0.2 }
            );
        });
    } else if (matchCount === 2) {
        winText.text = 'Nice! 2 in a row ☕';
        drawPayline(matchCount);

        for (let i = 0; i < matchCount; i++) {
            const symbol = reels[i].children[1];
            gsap.fromTo(
                symbol.scale,
                { x: 1, y: 1 },
                { x: 1.3, y: 1.3, yoyo: true, repeat: 1, duration: 0.2 }
            );
        }
    } else {
        winText.text = '';
    }
}


//Payline graphics
const payline = new PIXI.Graphics();
payline.visible = false;
app.stage.addChild(payline);

function drawPayline(count) {
    payline.clear();
    payline.lineStyle(4, 0xffffff);

    const y = 180 + reelHeight * 1.5;
    const startX = startXGlobal;
    const endX = startXGlobal + reelWidth * count;

    payline.moveTo(startX + reelWidth / 2, y);
    payline.lineTo(endX - reelWidth / 2, y);

    payline.alpha = 0;
    payline.visible = true;

    gsap.to(payline, {
        alpha: 1,
        duration: 0.3,
        onComplete: () => {
            gsap.to(payline, {
                alpha: 0,
                duration: 0.3,
                delay: 1,
                onComplete: () => (payline.visible = false)
            });
        }
    });
}