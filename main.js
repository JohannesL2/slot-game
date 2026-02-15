const app = new PIXI.Application({
    width: 400,
    height: 300,
    backgroundColor: 0x3b2a20,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});

document.getElementById('game-container').appendChild(app.view);

const symbols = ['☕', '🫘', '🥐', '🧁', '🐸'];

const reels = [];
const reelWidth = 120;
const reelHeight = 80;

const totalWidth = reelWidth * 3;
const startXGlobal = (app.screen.width - totalWidth) / 2;
const startYGlobal = 20;

const margin = 10;
const mask = new PIXI.Graphics();
mask.beginFill(0xffffff);
mask.drawRect(startXGlobal, startYGlobal, totalWidth, reelHeight * 3);
mask.endFill();
app.stage.addChild(mask);

const reelContainer = new PIXI.Container();
reelContainer.mask = mask;
app.stage.addChild(reelContainer);

const spinButton = document.getElementById('spin');
let isSpinning = false;

for (let i = 0; i < 3; i++) {
    const reel = new PIXI.Container();
    reel.x = startXGlobal + i * reelWidth;
    reel.y = startYGlobal;

    for (let j = 0; j < 3; j++) {
        const symbol = new PIXI.Text(
            symbols[Math.floor(Math.random() * symbols.length)],
            { 
                fontSize: 50,
                fill: '#fff',
                fontWeight: 'bold',
                dropShadow: true,
                dropShadowDistance: 2,
                dropShadowColor: '#000000'
            }
        );
        symbol.anchor.set(0.5);
        symbol.x = reelWidth / 2;
        symbol.y = j * reelHeight + reelHeight / 2;
        reel.addChild(symbol);
    }

    reels.push(reel);
    reelContainer.addChild(reel);
}

spinButton.addEventListener('click', startSpin);

//Win text and win-check

const winText = new PIXI.Text('', {
    fontSize: 24,
    fill: '#ffd700',
    fontWeight: 'bold'
});
winText.anchor.set(0.5);
winText.x = app.screen.width / 2;
winText.y = app.screen.height - 20;
app.stage.addChild(winText);

function checkWin() {
    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
        const row = reels.map(reel => reel.children[rowIndex].text);
        const first = row[0];
        let matchCount = 1;

    for (let i = 1; i < row.length; i++) {
        if (row[i] === first || row[i] === '🐸' || first === '🐸') {
            matchCount++;
        } else {
            break;
        }
    }

    if (matchCount >= 2) {
        showWin(matchCount, rowIndex);
        return
    }
}
    winText.text = "";
}

function showWin(matchCount, rowIndex) {
    winText.text =
        matchCount === 3
            ? 'Good brew'
            : 'Nice! 2 in a row';

            drawPayline(matchCount, rowIndex);

            for (let i = 0; i < matchCount; i++) {
                const symbol = reels[i].children[rowIndex];
                gsap.fromTo(
                    symbol.scale,
                    { x: 1, y: 1 },
                    { x: 1.3, y: 1.3, yoyo: true, repeat: 1, duration: 0.2 }
                );
            }
        }


//Payline graphics
const payline = new PIXI.Graphics();
payline.visible = false;
app.stage.addChild(payline);

function drawPayline(count, rowIndex) {
    payline.clear();
    payline.lineStyle(4, 0xffffff);

    const y = startYGlobal + rowIndex * reelHeight + reelHeight / 2;
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

function startSpin() {
    if (isSpinning) return;

    isSpinning = true;
    spinButton.disabled = true;
    winText.text = '';

    reels.forEach((reel, i) => {
        gsap.to(reel, {
            y: reel.y + 3 * reelHeight,
            duration: 0.8 + i * 0.2,
            ease: 'power3.out',
            onComplete: () => {
                reel.y = startYGlobal;
                reel.children.forEach(symbol => {
                    symbol.text = symbols[Math.floor(Math.random() * symbols.length)];
                });

                if (i === reels.length - 1) {
                    checkWin();
                    isSpinning = false;
                    spinButton.disabled = false
                }
            }
        })
    })
}