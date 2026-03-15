const app = new PIXI.Application({
    view: document.getElementById('game-canvas'),
    backgroundColor: 0x3b2a20,
    width: 800,
    height: 540,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});

document.getElementById('game-container').appendChild(app.view);

const mainContainer = new PIXI.Container();
app.stage.addChild(mainContainer);

const symbols = [
    'assets/anchor.png',
    'assets/binocular.png',
    'assets/chest.png',
    'assets/lifebuoy.png',
    'assets/rope.png',
    'assets/seagull.png',
    'assets/seastar.png',
    'assets/shell.png',
    'assets/steeringwheel.png',
    'assets/watch.png'
];

const reelWidth = 240;
const reelHeight = 160;
const totalWidth = reelWidth * 3;
const startXGlobal = (app.screen.width - totalWidth) / 2;
const startYGlobal = 50;
const reels = [];
let isSpinning = false;

const mask = new PIXI.Graphics();
mask.beginFill(0xffffff);
mask.drawRect(startXGlobal, startYGlobal, totalWidth, reelHeight * 3);
mask.endFill();
app.stage.addChild(mask);

const reelContainer = new PIXI.Container();
reelContainer.mask = mask;
app.stage.addChild(reelContainer);

symbols.forEach(img => {
    PIXI.Assets.add(img, img);
});

async function loadAndStart() {
    await PIXI.Assets.load(symbols);
    setupGame();
}
loadAndStart();

function setupGame() {
    for (let i = 0; i < 3; i++) {
        const reel = new PIXI.Container();

        reel.x = startXGlobal + (i * reelWidth);
        reel.y = startYGlobal;

        const blur = new PIXI.filters.BlurFilter();
        blur.blurX = 0;
        blur.blurY = 0;
        reel.filters = [blur];

        for (let j = 0; j < 3; j++) {
            const symbolName = symbols[Math.floor(Math.random() * symbols.length)];

            const symbol = PIXI.Sprite.from(symbolName);

            symbol.anchor.set(0.5);
            symbol.x = reelWidth / 2;
            symbol.y = j * reelHeight + reelHeight / 2;

            const targetHeight = reelHeight * 0.8;
            const scale = targetHeight / 500;

            symbol.scale.set(scale);
            symbol.baseScale = scale;

            symbol.symbolName = symbolName;
            reel.addChild(symbol);
        }
        reels.push(reel)
        reelContainer.addChild(reel);
    }
}

const spinButton = document.getElementById('spin');
spinButton.addEventListener('click', startSpin);

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
    let winnerFound = false;
    const wild = 'assets/chest.png';

    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
        const row = reels.map(reel => reel.children[rowIndex].symbolName);

        const isNormalMatch = row[0] !== wild && row.every(sym => sym === row[0]);

        const hasChest = row.includes(wild);

        if (isNormalMatch) {
            showWin(3, rowIndex, true);
            winnerFound = true;
            break;
        }
        else if (hasChest) {
            showWin(3, rowIndex, false);
            winnerFound = true;
            break;
        }
    }

    if (!winnerFound) {
        winText.text = "";
    }
}


function showWin(matchCount, rowIndex, shouldDrawLine) {
    const wild = 'assets/chest.png';

    if (matchCount === 3 && shouldDrawLine) {
        triggerBigWin();
        winText.text = 'BIG WIN!';
    } else if (!shouldDrawLine) {
        winText.text = 'CHEST OBTAINED';
    } else {
        winText.text = 'LINE WIN!';
    }

    if (shouldDrawLine) {
        drawPayline(matchCount, rowIndex);
    } else {
        payline.visible = false;
    }

            for (let i = 0; i < 3; i++) {
                const symbol = reels[i].children[rowIndex];

                const isChest = symbol.symbolName === wild;

                if (shouldDrawLine || isChest) {
                    const globalPos = symbol.getGlobalPosition();
                    createParticles(globalPos.x, globalPos.y);

                gsap.fromTo(
                    symbol.scale,
                    { x: symbol.baseScale, y: symbol.baseScale },
                    {
                        x: symbol.baseScale * 1.4, 
                        y: symbol.baseScale * 1.4, 
                        yoyo: true, 
                        repeat: 1, 
                        duration: 0.3 
                    }
                );
            }
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
    payline.visible = false;

    reels.forEach((reel, i) => {
        const blur = (reel.filters && reel.filters.length > 0) ? reel.filters[0] : null;

        const spinDuration = 0.8 + (i * 0.6);

        gsap.to(blur, { blurY: 10, duration: 0.3 });
        
        gsap.to(reel, {
            y: startYGlobal + 600,
            duration: spinDuration,
            ease: 'back.inOut(1.2)',
            onComplete: () => {
                gsap.to(blur, { blurY: 0, duration: 0.1 });
                
                reel.y = startYGlobal;
                reel.children.forEach(symbol => {
                    const newSymbolName = symbols[Math.floor(Math.random() * symbols.length)];

                    symbol.texture = PIXI.Texture.from(newSymbolName);

                    symbol.symbolName = newSymbolName;

                    const s = (reelHeight * 0.8) / 500;
                    symbol.scale.set(s);
                    symbol.baseScale = s;
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

function createParticles(x, y) {
    const container = new PIXI.Container();
    app.stage.addChild(container);

    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
        const p = new PIXI.Text('🫘', { fontSize: Math.random() * 20 + 10 });
        p.x = x;
        p.y = y;
        p.anchor.set(0.5);
        container.addChild(p);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 100 + 50;

        gsap.to(p, {
            x: x + Math.cos(angle) * velocity,
            y: y + Math.sin(angle) * velocity,
            rotation: Math.random() * 10,
            alpha: 0,
            duration: 1 + Math.random(),
            ease: "power2.out",
            onComplete: () => {
                container.removeChild(p);
                if (container.children.length === 0) app.stage.removeChild(container);
            }
        })
    }
}

//Big win
function triggerBigWin() {
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.7);
    overlay.drawRect(0, 0, app.screen.width, app.screen.height);
    overlay.endFill();
    overlay.alpha = 0;
    app.stage.addChild(overlay);

    const bigText = new PIXI.Text('BIG WIN', {
        fontSize: 70,
        fontWeight: '900',
        fill: ['#ffffff', '#ffd700', '#ff8c00'],
        stroke: '#4a3000',
        strokeThickness: 8,
        dropShadow: true,
        dropShadowBlur: 10,
        dropShadowColor: '#ffcc00',
        dropShadowDistance: 0,
    });
    bigText.anchor.set(0.5);
    bigText.x = app.screen.width / 2;
    bigText.y = app.screen.height / 2;
    bigText.scale.set(0.1);
    app.stage.addChild(bigText);

    const tl = gsap.timeline({
        onComplete: () => {
            gsap.to([overlay, bigText], {
                alpha: 0,
                delay: 3,
                duration: 1,
                onComplete: () => {
                    app.stage.removeChild(overlay);
                    app.stage.removeChild(bigText);
                }
            });
        }
    });

    tl.to(overlay, { alpha: 1, duration: 0.4 })
        .to(bigText, { alpha: 1, duration: 0.1 }, "-=0.3")
        .to(bigText.scale, { x: 1.2, y: 1.2, duration: 1, ease: "elastic.out(1, 0.3)" }, "-=0.3")
        .to(bigText, { rotation: 0.03, yoyo: true, repeat: 20, duration: 0.1 }, "-=0.5");

    const particleInterval = setInterval(() => {
        if (bigText.alpha > 0) {
            const startX = Math.random() * app.screen.width;
            createGoldDrop(startX, -50);
        } else {
            clearInterval(particleInterval);
        }
    }, 50);
}

function createGoldDrop(x, y) {
    const gold = new PIXI.Text('✨', { fontSize: Math.random() * 20 + 20 });
    gold.x = x;
    gold.y = y;
    gold.anchor.set(0.5);
    app.stage.addChild(gold);

    gsap.to(gold, {
        y: app.screen.height + 100,
        x: x + (Math.random() - 0.5) * 100,
        rotation: 5,
        duration: 2 + Math.random(),
        ease: "none",
        onComplete: () => app.stage.removeChild(gold)
    });
}