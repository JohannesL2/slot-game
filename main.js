const REEL_COLUMNS = 3;
const REEL_ROWS = 3;
const DESIGN_WIDTH = 900;
const DESIGN_HEIGHT = 640;
const REEL_WIDTH = 250;
const REEL_HEIGHT = 170;
const TOTAL_REEL_WIDTH = REEL_COLUMNS * REEL_WIDTH;
const CABINET_X = 28;
const CABINET_Y = 18;
const CABINET_WIDTH = 844;
const CABINET_HEIGHT = 604;
const REEL_START_X = 75;
const REEL_START_Y = 96;
const MAX_LINES = 5;
const WILD_ID = "chest";
const SCATTER_ID = "seastar";

const symbolCatalog = [
    {
        id: "anchor",
        asset: "assets/anchor.png",
        name: "Anchor",
        payouts: { 2: 2, 3: 6 },
        weight: 18,
        tint: 0x90d6ff
    },
    {
        id: "rope",
        asset: "assets/rope.png",
        name: "Rope",
        payouts: { 2: 2, 3: 7 },
        weight: 18,
        tint: 0xd2b07e
    },
    {
        id: "lifebuoy",
        asset: "assets/lifebuoy.png",
        name: "Lifebuoy",
        payouts: { 2: 3, 3: 9 },
        weight: 16,
        tint: 0xff8c8c
    },
    {
        id: "seagull",
        asset: "assets/seagull.png",
        name: "Seagull",
        payouts: { 2: 3, 3: 10 },
        weight: 14,
        tint: 0xf7f0c3
    },
    {
        id: "watch",
        asset: "assets/watch.png",
        name: "Captain's Watch",
        payouts: { 2: 4, 3: 14 },
        weight: 13,
        tint: 0xffc65e
    },
    {
        id: "binocular",
        asset: "assets/binocular.png",
        name: "Binoculars",
        payouts: { 2: 5, 3: 18 },
        weight: 12,
        tint: 0x7fffee
    },
    {
        id: "shell",
        asset: "assets/shell.png",
        name: "Pearl Shell",
        payouts: { 2: 6, 3: 24 },
        weight: 11,
        tint: 0xf0c0ff
    },
    {
        id: "steeringwheel",
        asset: "assets/steeringwheel.png",
        name: "Helm",
        payouts: { 2: 8, 3: 32 },
        weight: 9,
        tint: 0xffd37c
    },
    {
        id: "chest",
        asset: "assets/chest.png",
        name: "Treasure Chest Wild",
        payouts: { 2: 12, 3: 60 },
        weight: 7,
        tint: 0xffd44a
    },
    {
        id: "seastar",
        asset: "assets/seastar.png",
        name: "Seastar Scatter",
        payouts: { 2: 5, 3: 20 },
        weight: 8,
        tint: 0xff88d1
    }
];

const symbolById = Object.fromEntries(symbolCatalog.map((symbol) => [symbol.id, symbol]));
const weightedSymbols = symbolCatalog.flatMap((symbol) => Array.from({ length: symbol.weight }, () => symbol));

const paylines = [
    { id: 1, rows: [1, 1, 1], color: 0x7cf6ff, name: "Middle Line" },
    { id: 2, rows: [0, 0, 0], color: 0xffd56d, name: "Top Line" },
    { id: 3, rows: [2, 2, 2], color: 0xff7b89, name: "Bottom Line" },
    { id: 4, rows: [0, 1, 2], color: 0x8cff8b, name: "Down Diagonal" },
    { id: 5, rows: [2, 1, 0], color: 0xd296ff, name: "Up Diagonal" }
];

const betOptions = [5, 10, 20, 50, 100];
const machineMessages = {
    idle: "Select your lines and spin for a payout.",
    spin: "Reels are spinning. Wilds and scatters can stack with line wins.",
    broke: "Not enough balance for that total bet. Lower your lines or coin size.",
    jackpot: "Jackpot line. Three treasure chests lit up the machine.",
    big: "Big win. Multiple hits landed on the same spin.",
    small: "Win registered. Press spin to chase a bigger combo.",
    lose: "No payout this spin. The next one could still stack multiple wins."
};

const app = new PIXI.Application({
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});

const gameContainerElement = document.getElementById("game-container");
gameContainerElement.appendChild(app.view);

const balanceElement = document.getElementById("balance-display");
const betElement = document.getElementById("bet-display");
const linesElement = document.getElementById("lines-display");
const totalBetElement = document.getElementById("total-bet-display");
const statusElement = document.getElementById("status-display");
const paytableElement = document.getElementById("paytable-list");
const spinButton = document.getElementById("spin");
const betButton = document.getElementById("change-bet");
const increaseLinesButton = document.getElementById("increase-lines");
const decreaseLinesButton = document.getElementById("decrease-lines");
const soundButton = document.getElementById("toggle-sound");

const scene = new PIXI.Container();
app.stage.addChild(scene);

const backgroundLayer = new PIXI.Container();
const reelLayer = new PIXI.Container();
const overlayLayer = new PIXI.Container();
scene.addChild(backgroundLayer, reelLayer, overlayLayer);

const reelMask = new PIXI.Graphics();
reelMask.beginFill(0xffffff);
reelMask.drawRoundedRect(REEL_START_X, REEL_START_Y, TOTAL_REEL_WIDTH, REEL_HEIGHT * REEL_ROWS, 24);
reelMask.endFill();
scene.addChild(reelMask);

const reelContainer = new PIXI.Container();
reelContainer.mask = reelMask;
const bubbleLayer = new PIXI.Container();
bubbleLayer.mask = reelMask;
reelLayer.addChild(bubbleLayer, reelContainer);

const paylineGraphic = new PIXI.Graphics();
paylineGraphic.visible = false;
overlayLayer.addChild(paylineGraphic);

let cabinetFrame;
const reels = [];
const bubbles = [];
const lineBadges = [];
let activeLineCount = 3;
let betIndex = 1;
let currentBet = betOptions[betIndex];
let balance = 1000;
let lastWin = 0;
let isSpinning = false;
let soundEnabled = true;
let audioContext;

renderPaytable();
drawMachineChrome();
updateDashboard();
setStatus(machineMessages.idle);

symbolCatalog.forEach((symbol) => {
    PIXI.Assets.add(symbol.asset, symbol.asset);
});

spinButton.addEventListener("click", startSpin);
betButton.addEventListener("click", () => {
    if (isSpinning) {
        return;
    }

    playButtonSound();
    betIndex = (betIndex + 1) % betOptions.length;
    currentBet = betOptions[betIndex];
    updateDashboard();
});

increaseLinesButton.addEventListener("click", () => {
    playButtonSound();
    adjustLines(1);
});
decreaseLinesButton.addEventListener("click", () => {
    playButtonSound();
    adjustLines(-1);
});
soundButton.addEventListener("click", toggleSound);

const resizeObserver = new ResizeObserver(() => fitGameToContainer());
resizeObserver.observe(gameContainerElement);

initialize();

async function initialize() {
    await PIXI.Assets.load(symbolCatalog.map((symbol) => symbol.asset));
    setupBubbles();
    setupReels();
    fitGameToContainer();
}

function setupBubbles() {
    for (let index = 0; index < 22; index += 1) {
        const bubble = new PIXI.Graphics();
        resetBubble(bubble, true);
        bubbleLayer.addChild(bubble);
        bubbles.push(bubble);
    }

    app.ticker.add((ticker) => updateBubbles(ticker.deltaMS / 16.6667));
}

function resetBubble(bubble, randomY = false) {
    const radius = 4 + Math.random() * 12;
    bubble.clear();
    bubble.removeChildren();
    bubble.lineStyle(1.5, 0xb8f7ff, 0.35);
    bubble.beginFill(0xb8f7ff, 0.08 + Math.random() * 0.08);
    bubble.drawCircle(0, 0, radius);
    bubble.endFill();

    const sheen = new PIXI.Graphics();
    sheen.beginFill(0xffffff, 0.18);
    sheen.drawCircle(-radius * 0.28, -radius * 0.28, Math.max(1.5, radius * 0.22));
    sheen.endFill();
    bubble.addChild(sheen);

    bubble.radius = radius;
    bubble.speed = 0.35 + Math.random() * 0.85;
    bubble.drift = (Math.random() - 0.5) * 0.8;
    bubble.wobble = 0.01 + Math.random() * 0.025;
    bubble.wobbleOffset = Math.random() * Math.PI * 2;
    bubble.alpha = 0.25 + Math.random() * 0.45;
    bubble.x = REEL_START_X + 20 + Math.random() * (TOTAL_REEL_WIDTH - 40);
    bubble.y = randomY
        ? REEL_START_Y + Math.random() * (REEL_HEIGHT * REEL_ROWS + 30)
        : REEL_START_Y + REEL_HEIGHT * REEL_ROWS + 20 + Math.random() * 60;
}

function updateBubbles(delta) {
    bubbles.forEach((bubble) => {
        bubble.y -= bubble.speed * delta;
        bubble.x += bubble.drift * delta + Math.sin((performance.now() * 0.001) + bubble.wobbleOffset) * bubble.wobble;

        if (bubble.y < REEL_START_Y - bubble.radius - 16) {
            resetBubble(bubble);
        }
    });
}

function setupReels() {
    for (let column = 0; column < REEL_COLUMNS; column += 1) {
        const reel = new PIXI.Container();
        reel.x = REEL_START_X + column * REEL_WIDTH;
        reel.y = REEL_START_Y;

        const blur = new PIXI.filters.BlurFilter();
        blur.blurX = 0;
        blur.blurY = 0;
        reel.filters = [blur];

        for (let row = 0; row < REEL_ROWS; row += 1) {
            const symbol = createSymbolSprite(randomSymbol(), row);
            reel.addChild(symbol);
        }

        reels.push(reel);
        reelContainer.addChild(reel);
    }
}

function createSymbolSprite(symbolData, rowIndex) {
    const sprite = PIXI.Sprite.from(symbolData.asset);
    sprite.anchor.set(0.5);
    sprite.x = REEL_WIDTH / 2;
    sprite.y = rowIndex * REEL_HEIGHT + REEL_HEIGHT / 2;

    const targetHeight = REEL_HEIGHT * 0.7;
    const scale = targetHeight / sprite.texture.height;
    sprite.scale.set(scale);
    sprite.baseScale = scale;
    sprite.symbolId = symbolData.id;
    sprite.symbolData = symbolData;

    return sprite;
}

function randomSymbol() {
    const pick = weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
    return pick;
}

function adjustLines(direction) {
    if (isSpinning) {
        return;
    }

    activeLineCount = Math.max(1, Math.min(MAX_LINES, activeLineCount + direction));
    updateDashboard();
}

function getTotalBet() {
    return currentBet * activeLineCount;
}

function updateDashboard(animateBalance = false) {
    const totalBet = getTotalBet();

    if (animateBalance) {
        const currentDisplay = Number(balanceElement.textContent.replace(/[^0-9.-]/g, "")) || 0;
        const animatedValue = { amount: currentDisplay };
        gsap.to(animatedValue, {
            amount: balance,
            duration: 0.75,
            ease: "power1.out",
            onUpdate: () => {
                balanceElement.textContent = formatCurrency(Math.floor(animatedValue.amount));
            }
        });
    } else {
        balanceElement.textContent = formatCurrency(balance);
    }

    betElement.textContent = formatCurrency(currentBet);
    linesElement.textContent = `${activeLineCount}`;
    totalBetElement.textContent = formatCurrency(totalBet);
    increaseLinesButton.disabled = activeLineCount >= MAX_LINES || isSpinning;
    decreaseLinesButton.disabled = activeLineCount <= 1 || isSpinning;
    betButton.disabled = isSpinning;
    spinButton.disabled = isSpinning;
    soundButton.textContent = soundEnabled ? "Sound On" : "Sound Off";
    updateLineBadges();
}

function setStatus(message) {
    statusElement.textContent = `${message} Last win: ${formatCurrency(lastWin)}.`;
}

function renderPaytable() {
    paytableElement.innerHTML = "";

    symbolCatalog
        .slice()
        .sort((left, right) => right.payouts[3] - left.payouts[3])
        .forEach((symbol) => {
            const item = document.createElement("article");
            item.className = "paytable-item";

            const icon = document.createElement("img");
            icon.className = "paytable-icon";
            icon.src = symbol.asset;
            icon.alt = symbol.name;

            const meta = document.createElement("div");

            const name = document.createElement("div");
            name.className = "paytable-name";
            name.textContent = symbol.name;

            const values = document.createElement("div");
            values.className = "paytable-values";

            if (symbol.id === SCATTER_ID) {
                values.textContent = `2 anywhere = ${symbol.payouts[2]}x | 3 anywhere = ${symbol.payouts[3]}x`;
            } else {
                values.textContent = `2 on a line = ${symbol.payouts[2]}x | 3 on a line = ${symbol.payouts[3]}x`;
            }

            meta.append(name, values);
            item.append(icon, meta);
            paytableElement.appendChild(item);
        });
}

function drawMachineChrome() {
    backgroundLayer.removeChildren();

    const outerGlow = new PIXI.Graphics();
    outerGlow.beginFill(0x09111d, 0.92);
    outerGlow.drawRoundedRect(CABINET_X, CABINET_Y, CABINET_WIDTH, CABINET_HEIGHT, 30);
    outerGlow.endFill();
    outerGlow.lineStyle(5, 0xf7c55c, 0.8);
    outerGlow.drawRoundedRect(CABINET_X, CABINET_Y, CABINET_WIDTH, CABINET_HEIGHT, 30);
    backgroundLayer.addChild(outerGlow);
    cabinetFrame = outerGlow;

    const reelFrame = new PIXI.Graphics();
    reelFrame.beginFill(0x091526, 0.55);
    reelFrame.drawRoundedRect(REEL_START_X - 8, REEL_START_Y - 8, TOTAL_REEL_WIDTH + 16, REEL_HEIGHT * REEL_ROWS + 16, 26);
    reelFrame.endFill();
    reelFrame.lineStyle(2, 0x9bc7de, 0.2);
    reelFrame.drawRoundedRect(REEL_START_X - 8, REEL_START_Y - 8, TOTAL_REEL_WIDTH + 16, REEL_HEIGHT * REEL_ROWS + 16, 26);
    backgroundLayer.addChild(reelFrame);

    const headerText = new PIXI.Text("5 LINES  |  WILD JACKPOT  |  SCATTER BONUS", {
        fontFamily: "Orbitron",
        fontSize: 22,
        fontWeight: "700",
        fill: 0x78f5ff,
        letterSpacing: 2
    });
    headerText.anchor.set(0.5, 0);
    headerText.x = DESIGN_WIDTH / 2;
    headerText.y = 46;
    backgroundLayer.addChild(headerText);

    paylines.forEach((payline, index) => {
        const badge = new PIXI.Container();
        const badgeBg = new PIXI.Graphics();
        badgeBg.beginFill(0x101b2b, 0.9);
        badgeBg.drawRoundedRect(0, 0, 42, 32, 12);
        badgeBg.endFill();
        badgeBg.lineStyle(2, payline.color, 0.9);
        badgeBg.drawRoundedRect(0, 0, 42, 32, 12);

        const badgeLabel = new PIXI.Text(String(payline.id), {
            fontFamily: "Orbitron",
            fontSize: 16,
            fontWeight: "800",
            fill: payline.color
        });
        badgeLabel.anchor.set(0.5);
        badgeLabel.x = 21;
        badgeLabel.y = 16;

        badge.addChild(badgeBg, badgeLabel);
        badge.x = index < 3 ? 18 : 840;
        badge.y = 150 + index * 72;
        backgroundLayer.addChild(badge);
        lineBadges.push({ badge, badgeBg, badgeLabel, payline });
    });

    updateLineBadges();
}

function fitGameToContainer() {
    const { clientWidth, clientHeight } = gameContainerElement;
    if (!clientWidth || !clientHeight) {
        return;
    }

    app.renderer.resize(clientWidth, clientHeight);

    const scale = Math.min(clientWidth / DESIGN_WIDTH, clientHeight / DESIGN_HEIGHT);
    scene.scale.set(scale);
    scene.x = Math.round((clientWidth - DESIGN_WIDTH * scale) / 2);
    scene.y = Math.round((clientHeight - DESIGN_HEIGHT * scale) / 2);
}

function startSpin() {
    const totalBet = getTotalBet();

    if (isSpinning) {
        return;
    }

    if (balance < totalBet) {
        setStatus(machineMessages.broke);
        window.alert("Not enough balance for that total bet.");
        return;
    }

    isSpinning = true;
    lastWin = 0;
    paylineGraphic.visible = false;
    balance -= totalBet;
    updateDashboard();
    setStatus(machineMessages.spin);
    pulseCabinet();
    playSpinSound();

    reels.forEach((reel, column) => {
        const blur = reel.filters[0];
        const duration = 0.9 + column * 0.35;

        gsap.to(blur, { blurY: 10, duration: 0.18, ease: "power1.out" });
        gsap.to(reel, {
            y: REEL_START_Y + 520,
            duration,
            ease: "back.in(1.2)",
            onComplete: () => {
                reel.y = REEL_START_Y;
                reel.children.forEach((sprite) => replaceSymbol(sprite));
                gsap.to(blur, { blurY: 0, duration: 0.15 });
                playReelStopSound(column);

                if (column === REEL_COLUMNS - 1) {
                    finalizeSpin();
                }
            }
        });
    });
}

function replaceSymbol(sprite) {
    const newSymbol = randomSymbol();
    sprite.texture = PIXI.Texture.from(newSymbol.asset);
    sprite.symbolId = newSymbol.id;
    sprite.symbolData = newSymbol;
    const scale = (REEL_HEIGHT * 0.7) / sprite.texture.height;
    sprite.scale.set(scale);
    sprite.baseScale = scale;
}

function finalizeSpin() {
    const results = evaluateSpin();
    const totalWin = results.totalWin;
    isSpinning = false;

    const wildCount = countWildSymbols();

    if (totalWin > 0) {
        balance += totalWin;
        lastWin = totalWin;
        updateDashboard(true);
        animateWinningSymbols(results);
        showWinCounter(totalWin, results.bestWin >= currentBet * 25 ? "JACKPOT" : "WIN");

        if (results.bestWin >= currentBet * 25) {
            triggerCelebration("JACKPOT", 0xffd44a);
            setStatus(`${machineMessages.jackpot} ${buildResultMessage(results)}`);
            playWinSound("jackpot");
        } else if (results.lineWins.length > 1 || results.scatterWin > 0) {
            triggerCelebration("BIG WIN", 0x78f5ff);
            setStatus(`${machineMessages.big} ${buildResultMessage(results)}`);
            playWinSound("big");
        } else {
            setStatus(`${machineMessages.small} ${buildResultMessage(results)}`);
            playWinSound("small");
        }

        if (results.lineWins.length > 0) {
            drawWinningPaylines(results.lineWins);
        }
    } else {
        lastWin = 0;
        updateDashboard();
        if (wildCount >= 2) {
            highlightWilds();
            setStatus("Treasure chests teased a bigger hit. Spin again for the Harbor Royale payoff.");
        } else {
            setStatus(machineMessages.lose);
        }
    }
}

function evaluateSpin() {
    const lineWins = [];
    let totalWin = 0;
    let bestWin = 0;

    paylines.slice(0, activeLineCount).forEach((payline) => {
        const lineSymbols = payline.rows.map((row, column) => reels[column].children[row].symbolData);
        const evaluation = evaluateLine(lineSymbols);

        if (!evaluation) {
            return;
        }

        const winAmount = evaluation.multiplier * currentBet;
        totalWin += winAmount;
        bestWin = Math.max(bestWin, winAmount);

        lineWins.push({
            payline,
            symbol: evaluation.symbol,
            count: evaluation.count,
            winAmount,
            positions: payline.rows.map((row, column) => ({ column, row })).slice(0, evaluation.count)
        });
    });

    const scatterCount = countScatterSymbols();
    let scatterWin = 0;

    if (scatterCount >= 2) {
        const scatterMultiplier = symbolById[SCATTER_ID].payouts[Math.min(scatterCount, 3)];
        scatterWin = scatterMultiplier * currentBet;
        totalWin += scatterWin;
        bestWin = Math.max(bestWin, scatterWin);
    }

    return {
        totalWin,
        bestWin,
        lineWins,
        scatterCount,
        scatterWin
    };
}

function evaluateLine(lineSymbols) {
    const chestCount = lineSymbols.filter((symbol) => symbol.id === WILD_ID).length;

    if (chestCount === lineSymbols.length) {
        return {
            symbol: symbolById[WILD_ID],
            count: lineSymbols.length,
            multiplier: symbolById[WILD_ID].payouts[3]
        };
    }

    const baseSymbol = lineSymbols.find((symbol) => symbol.id !== WILD_ID && symbol.id !== SCATTER_ID);

    if (!baseSymbol) {
        return null;
    }

    let count = 0;
    for (const symbol of lineSymbols) {
        if (symbol.id === baseSymbol.id || symbol.id === WILD_ID) {
            count += 1;
            continue;
        }

        break;
    }

    if (count < 2) {
        return null;
    }

    return {
        symbol: baseSymbol,
        count,
        multiplier: baseSymbol.payouts[count]
    };
}

function countScatterSymbols() {
    let count = 0;

    reels.forEach((reel) => {
        reel.children.forEach((sprite) => {
            if (sprite.symbolId === SCATTER_ID) {
                count += 1;
            }
        });
    });

    return count;
}

function countWildSymbols() {
    let count = 0;

    reels.forEach((reel) => {
        reel.children.forEach((sprite) => {
            if (sprite.symbolId === WILD_ID) {
                count += 1;
            }
        });
    });

    return count;
}

function drawWinningPaylines(lineWins) {
    paylineGraphic.clear();
    paylineGraphic.visible = true;
    paylineGraphic.alpha = 1;

    lineWins.forEach((lineWin) => {
        paylineGraphic.lineStyle(5, lineWin.payline.color, 0.95);
        lineWin.positions.forEach(({ column, row }, index) => {
            const x = REEL_START_X + column * REEL_WIDTH + REEL_WIDTH / 2;
            const y = REEL_START_Y + row * REEL_HEIGHT + REEL_HEIGHT / 2;

            if (index === 0) {
                paylineGraphic.moveTo(x, y);
            } else {
                paylineGraphic.lineTo(x, y);
            }

            paylineGraphic.beginFill(lineWin.payline.color, 0.95);
            paylineGraphic.drawCircle(x, y, 8);
            paylineGraphic.endFill();
        });
    });

    gsap.fromTo(
        paylineGraphic,
        { alpha: 0.2 },
        {
            alpha: 1,
            yoyo: true,
            repeat: 3,
            duration: 0.25,
            onComplete: () => {
                gsap.to(paylineGraphic, {
                    alpha: 0,
                    duration: 0.4,
                    delay: 1.2,
                    onComplete: () => {
                        paylineGraphic.visible = false;
                        paylineGraphic.clear();
                    }
                });
            }
        }
    );
}

function updateLineBadges() {
    lineBadges.forEach(({ badge, badgeBg, badgeLabel, payline }, index) => {
        const isActive = index < activeLineCount;
        badge.alpha = isActive ? 1 : 0.35;
        badge.scale.set(isActive ? 1 : 0.9);
        badgeLabel.text = isActive ? String(payline.id) : "-";
        badgeBg.clear();
        badgeBg.beginFill(0x101b2b, isActive ? 0.95 : 0.55);
        badgeBg.drawRoundedRect(0, 0, 42, 32, 12);
        badgeBg.endFill();
        badgeBg.lineStyle(2, payline.color, isActive ? 0.95 : 0.35);
        badgeBg.drawRoundedRect(0, 0, 42, 32, 12);
        badgeLabel.style.fill = isActive ? payline.color : 0x6c7992;
    });
}

function buildResultMessage(results) {
    const parts = [];

    results.lineWins.forEach((lineWin) => {
        parts.push(
            `Line ${lineWin.payline.id} ${lineWin.symbol.name} x${lineWin.count} paid ${formatCurrency(lineWin.winAmount)}`
        );
    });

    if (results.scatterWin > 0) {
        parts.push(
            `${results.scatterCount} Seastars paid ${formatCurrency(results.scatterWin)} anywhere`
        );
    }

    return parts.join(" | ");
}

function animateWinningSymbols(results) {
    const animatedSprites = new Set();

    results.lineWins.forEach((lineWin) => {
        lineWin.positions.forEach(({ column, row }) => {
            const sprite = reels[column].children[row];
            if (animatedSprites.has(sprite)) {
                return;
            }

            animatedSprites.add(sprite);
            pulseSprite(sprite, lineWin.symbol.tint);
        });
    });

    if (results.scatterWin > 0) {
        reels.forEach((reel) => {
            reel.children.forEach((sprite) => {
                if (sprite.symbolId === SCATTER_ID && !animatedSprites.has(sprite)) {
                    animatedSprites.add(sprite);
                    pulseSprite(sprite, symbolById[SCATTER_ID].tint);
                }
            });
        });
    }
}

function highlightWilds() {
    reels.forEach((reel) => {
        reel.children.forEach((sprite) => {
            if (sprite.symbolId === WILD_ID) {
                pulseSprite(sprite, symbolById[WILD_ID].tint);
            }
        });
    });
}

function pulseSprite(sprite, tintColor) {
    const globalPosition = sprite.getGlobalPosition();
    const localPosition = overlayLayer.toLocal(globalPosition);
    spawnBurst(localPosition.x, localPosition.y, tintColor);

    gsap.fromTo(
        sprite.scale,
        { x: sprite.baseScale, y: sprite.baseScale },
        {
            x: sprite.baseScale * 1.18,
            y: sprite.baseScale * 1.18,
            yoyo: true,
            repeat: 3,
            duration: 0.18,
            ease: "sine.inOut"
        }
    );
}

function spawnBurst(x, y, color) {
    const container = new PIXI.Container();
    overlayLayer.addChild(container);

    for (let index = 0; index < 14; index += 1) {
        const particle = new PIXI.Graphics();
        particle.beginFill(color, 0.9);
        particle.drawCircle(0, 0, Math.random() * 5 + 3);
        particle.endFill();
        particle.x = x;
        particle.y = y;
        container.addChild(particle);

        const angle = (Math.PI * 2 * index) / 14;
        const distance = 40 + Math.random() * 55;
        gsap.to(particle, {
            x: x + Math.cos(angle) * distance,
            y: y + Math.sin(angle) * distance,
            alpha: 0,
            duration: 0.7 + Math.random() * 0.4,
            ease: "power2.out",
            onComplete: () => {
                container.removeChild(particle);
                if (container.children.length === 0) {
                    overlayLayer.removeChild(container);
                }
            }
        });
    }
}

function triggerCelebration(label, color) {
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x030710, 0.68);
    overlay.drawRoundedRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, 0);
    overlay.endFill();
    overlay.alpha = 0;
    overlayLayer.addChild(overlay);

    const text = new PIXI.Text(label, {
        fontFamily: "Cinzel",
        fontSize: 74,
        fontWeight: "800",
        fill: color,
        stroke: 0xffffff,
        strokeThickness: 3,
        dropShadow: true,
        dropShadowColor: color,
        dropShadowBlur: 16,
        dropShadowDistance: 0
    });
    text.anchor.set(0.5);
    text.x = DESIGN_WIDTH / 2;
    text.y = DESIGN_HEIGHT / 2;
    text.scale.set(0.45);
    text.alpha = 0;
    overlayLayer.addChild(text);

    const timeline = gsap.timeline({
        onComplete: () => {
            gsap.to([overlay, text], {
                alpha: 0,
                duration: 0.5,
                delay: 1.2,
                onComplete: () => {
                    overlayLayer.removeChild(overlay);
                    overlayLayer.removeChild(text);
                }
            });
        }
    });

    timeline
        .to(overlay, { alpha: 1, duration: 0.2 })
        .to(text, { alpha: 1, duration: 0.12 }, "<")
        .to(text.scale, { x: 1, y: 1, duration: 0.8, ease: "elastic.out(1, 0.42)" }, "<")
        .to(text, { rotation: 0.02, duration: 0.14, repeat: 7, yoyo: true }, "-=0.4");

    for (let index = 0; index < 18; index += 1) {
        createFallingLight(color, index * 22);
    }
}

function showWinCounter(totalWin, label) {
    const badge = new PIXI.Container();
    overlayLayer.addChild(badge);

    const badgeBg = new PIXI.Graphics();
    badgeBg.beginFill(0x08111f, 0.92);
    badgeBg.drawRoundedRect(-130, -46, 260, 92, 24);
    badgeBg.endFill();
    badgeBg.lineStyle(3, label === "JACKPOT" ? 0xffd44a : 0x78f5ff, 0.9);
    badgeBg.drawRoundedRect(-130, -46, 260, 92, 24);

    const title = new PIXI.Text(label, {
        fontFamily: "Orbitron",
        fontSize: 18,
        fontWeight: "800",
        fill: label === "JACKPOT" ? 0xffd44a : 0x78f5ff,
        letterSpacing: 2
    });
    title.anchor.set(0.5);
    title.y = -16;

    const amount = new PIXI.Text("$0", {
        fontFamily: "Cinzel",
        fontSize: 34,
        fontWeight: "800",
        fill: 0xfff2bf
    });
    amount.anchor.set(0.5);
    amount.y = 18;

    badge.addChild(badgeBg, title, amount);
    badge.x = DESIGN_WIDTH / 2;
    badge.y = REEL_START_Y + REEL_HEIGHT * 1.5;
    badge.alpha = 0;
    badge.scale.set(0.82);

    const counter = { value: 0 };
    const timeline = gsap.timeline({
        onComplete: () => {
            gsap.to(badge, {
                alpha: 0,
                y: badge.y - 18,
                duration: 0.4,
                delay: 1,
                onComplete: () => {
                    overlayLayer.removeChild(badge);
                }
            });
        }
    });

    timeline
        .to(badge, { alpha: 1, duration: 0.14 }, 0)
        .to(badge.scale, { x: 1, y: 1, duration: 0.45, ease: "back.out(1.6)" }, 0)
        .to(counter, {
            value: totalWin,
            duration: 0.9,
            ease: "power2.out",
            onUpdate: () => {
                amount.text = formatCurrency(counter.value);
            }
        }, 0.08);
}

function pulseCabinet() {
    if (!cabinetFrame) {
        return;
    }

    gsap.fromTo(
        cabinetFrame,
        { alpha: 0.82 },
        {
            alpha: 1,
            duration: 0.22,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut"
        }
    );
}

function createFallingLight(color, delay) {
    const spark = new PIXI.Graphics();
    spark.beginFill(color, 0.9);
    spark.drawCircle(0, 0, Math.random() * 5 + 3);
    spark.endFill();
    spark.x = 60 + Math.random() * (DESIGN_WIDTH - 120);
    spark.y = -20;
    overlayLayer.addChild(spark);

    gsap.to(spark, {
        y: DESIGN_HEIGHT + 30,
        x: spark.x + (Math.random() - 0.5) * 120,
        alpha: 0.1,
        delay: delay / 1000,
        duration: 1.3 + Math.random() * 0.7,
        ease: "none",
        onComplete: () => {
            overlayLayer.removeChild(spark);
        }
    });
}

function formatCurrency(value) {
    return `$${Math.floor(value)}`;
}

function toggleSound() {
    soundEnabled = !soundEnabled;

    if (soundEnabled) {
        ensureAudioContext();
        playButtonSound();
    }

    updateDashboard();
}

function ensureAudioContext() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            soundEnabled = false;
            return null;
        }

        audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    return audioContext;
}

function playTone(frequency, startAt, duration, type = "sine", volume = 0.05) {
    const context = ensureAudioContext();
    if (!soundEnabled || !context) {
        return;
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
}

function playButtonSound() {
    const context = ensureAudioContext();
    if (!soundEnabled || !context) {
        return;
    }

    const now = context.currentTime;
    playTone(540, now, 0.05, "square", 0.018);
    playTone(720, now + 0.04, 0.06, "triangle", 0.016);
}

function playSpinSound() {
    const context = ensureAudioContext();
    if (!soundEnabled || !context) {
        return;
    }

    const now = context.currentTime;
    playTone(180, now, 0.24, "sawtooth", 0.025);
    playTone(240, now + 0.08, 0.24, "triangle", 0.02);
    playTone(320, now + 0.18, 0.3, "square", 0.015);
}

function playReelStopSound(column) {
    const context = ensureAudioContext();
    if (!soundEnabled || !context) {
        return;
    }

    const now = context.currentTime;
    const base = 260 + column * 65;
    playTone(base, now, 0.05, "square", 0.02);
    playTone(base * 1.3, now + 0.03, 0.05, "triangle", 0.014);
}

function playWinSound(type) {
    const context = ensureAudioContext();
    if (!soundEnabled || !context) {
        return;
    }

    const now = context.currentTime;

    if (type === "jackpot") {
        [440, 660, 880, 1320].forEach((note, index) => {
            playTone(note, now + index * 0.12, 0.22, "triangle", 0.04);
        });
        return;
    }

    if (type === "big") {
        [392, 523, 659].forEach((note, index) => {
            playTone(note, now + index * 0.09, 0.16, "sine", 0.03);
        });
        return;
    }

    [392, 523].forEach((note, index) => {
        playTone(note, now + index * 0.08, 0.12, "sine", 0.025);
    });
}
