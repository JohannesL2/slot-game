export function createHandle({
    app,
    x,
    y,
    maxPull = 120,
    onPull
}) {
    const handle = new PIXI.Container();
    handle.x = x;
    handle.y = y;
    app.stage.addChild(handle);

    const STICK_LENGTH = 120;

    const stick = new PIXI.Graphics();
    stick.beginFill(0xaaaaaa);
    stick.drawRoundedRect(-5, 0, 10, STICK_LENGTH, 5);
    stick.endFill();
    handle.addChild(stick);

    const stickMask = new PIXI.Graphics();
    handle.addChild(stickMask);
    stick.mask = stickMask;

function updateMask() {
    stickMask.clear();
    const delta = Math.max(0, ball.y - startBallY);
    if (delta <= 0) return; // inget syns om vi inte drar

    stickMask.beginFill(0xffffff);
    stickMask.drawRect(
        -5,                 // x
        ball.y - STICK_LENGTH, // y: börja från toppen av pinnen under bollen
        10,                 // bredd
        STICK_LENGTH        // höjd
    );
    stickMask.endFill();
}



    const ball = new PIXI.Graphics();

    ball.beginFill(0xff0000);
    ball.drawCircle(0, 0, 15);
    ball.endFill();

    const highlight = new PIXI.Graphics();
    highlight.beginFill(0xff6666, 0.6);
    highlight.drawCircle(-5, -5, 8);
    highlight.endFill();
    ball.addChild(highlight);

    ball.y = STICK_LENGTH;
    handle.addChild(ball);

    const startBallY = ball.y;

    stick.y = startBallY - STICK_LENGTH;

    updateMask();

    
    ball.interactive = true;
    ball.cursor = 'pointer';

    let isDragging = false;
    let startY = 0;

    ball.on('pointerdown', (e) => {
        isDragging = true;
        startY = e.data.global.y;
    });

    ball.on('pointermove', (e) => {
        if (!isDragging) return;

        const delta = Math.min(
            Math.max(e.data.global.y - startY, 0),
            maxPull
        );

        ball.y = startBallY + delta;

        updateMask();
    });

    function release() {
        if (!isDragging) return;
        isDragging = false;

        const pulled = ball.y - startBallY;

        if (pulled > maxPull * 0.7) {
            onPull?.();
        }

        gsap.to(ball, {
            y: startBallY,
            duration: 0.4,
            ease: 'elastic.out(1, 0.4)',
            onUpdate: updateMask
        });
    }

    ball.on('pointerup', release);
    ball.on('pointerupoutside', release);

    return handle;
}