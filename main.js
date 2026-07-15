const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    backgroundColor: '#1e1e24',
    parent: 'phaser-calculator',
    scene: { preload: function(){}, create: create }
};

const game = new Phaser.Game(config);
let displayText = '0', displayView, currentInput = '', previousInput = '', activeOperator = null, clearNextInput = false;

function create() {
    const displayBackground = this.add.graphics();
    displayBackground.fillStyle(0x0f0f12, 1);
    displayBackground.fillRoundedRect(20, 20, 360, 100, 12);

    displayView = this.add.text(360, 70, '0', {
        fontFamily: 'Arial', fontSize: '48px', fill: '#ffffff', align: 'right'
    }).setOrigin(1, 0.5);

    const buttons = [
        ['C', '±', '%', '÷'],
        ['7', '8', '9', '×'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', '=', '']
    ];

    const startX = 20, startY = 150, buttonWidth = 80, buttonHeight = 75, spacingX = 13, spacingY = 15;

    for (let row = 0; row < buttons.length; row++) {
        for (let col = 0; col < buttons[row].length; col++) {
            const label = buttons[row][col];
            if (label === '') continue;

            let x = startX + col * (buttonWidth + spacingX);
            let y = startY + row * (buttonHeight + spacingY);
            let currentWidth = label === '0' ? (buttonWidth * 2 + spacingX) : buttonWidth;

            let baseColor = 0x2d2d35, textColor = '#ffffff';
            if (['+', '-', '×', '÷', '='].includes(label)) baseColor = 0xff9500;
            else if (['C', '±', '%'].includes(label)) { baseColor = 0xa5a5a5; textColor = '#000000'; }

            const btnContainer = this.add.container(x, y);
            const btnGraphics = this.add.graphics();
            btnGraphics.fillStyle(baseColor, 1);
            btnGraphics.fillRoundedRect(0, 0, currentWidth, buttonHeight, 15);
            btnContainer.add(btnGraphics);

            const btnText = this.add.text(currentWidth / 2, buttonHeight / 2, label, {
                fontFamily: 'Arial', fontSize: '28px', fill: textColor, fontWeight: 'bold'
            }).setOrigin(0.5);
            btnContainer.add(btnText);

            const clickZone = this.add.zone(0, 0, currentWidth, buttonHeight).setOrigin(0, 0).setInteractive({ useHandCursor: true });
            btnContainer.add(clickZone);

            clickZone.on('pointerdown', () => {
                this.tweens.add({
                    targets: btnContainer, scaleX: 0.95, scaleY: 0.95,
                    x: x + (currentWidth * 0.025), y: y + (buttonHeight * 0.025),
                    duration: 50, yoyo: true,
                    onComplete: () => handleInput(label)
                });
            });
        }
    }
}

function handleInput(value) {
    if (displayText.includes('67') && value !== 'C') {
        return; 
    }

    if (!isNaN(value) || value === '.') {
        if (clearNextInput) { currentInput = ''; clearNextInput = false; }
        if (value === '.' && currentInput.includes('.')) return;
        if (currentInput === '0' && value !== '.') currentInput = '';
        currentInput += value;
        displayText = currentInput;
    } else if (['+', '-', '×', '÷'].includes(value)) {
        if (currentInput === '' && previousInput !== '') { activeOperator = value; return; }
        if (previousInput !== '' && currentInput !== '') calculate();
        else previousInput = currentInput;
        activeOperator = value;
        clearNextInput = true;
    } else if (value === '=') {
        if (currentInput !== '' && previousInput !== '') { 
            calculate(); 
            activeOperator = null; 
            clearNextInput = true; 
        }
    } else if (value === 'C') {
        displayText = '0'; currentInput = ''; previousInput = ''; activeOperator = null; clearNextInput = false;
    } else if (value === '±') {
        if (currentInput !== '') { currentInput = (parseFloat(currentInput) * -1).toString(); displayText = currentInput; }
    } else if (value === '%') {
        if (currentInput !== '') { currentInput = (parseFloat(currentInput) / 100).toString(); displayText = currentInput; }
    }

    if (displayText.includes('67')) {
        displayView.setText('no.');
    } else {
        if (displayText.length > 11) displayView.setText(parseFloat(displayText).toPrecision(8).toString());
        else displayView.setText(displayText);
    }
}

function calculate() {
    let result = 0;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    if (isNaN(prev) || isNaN(current)) return;

    switch (activeOperator) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case '×': result = prev * current; break;
        case '÷': result = current === 0 ? 'Error' : prev / current; break;
    }
    displayText = result.toString();
    previousInput = displayText;
    currentInput = displayText;
}
