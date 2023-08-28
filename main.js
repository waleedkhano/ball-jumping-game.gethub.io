//board
let board;
// let boardWidth = 1080;
// let boardHeight = 735;
boardWidth = window.innerWidth;
boardHeight = window.innerHeight - 4;
let context;


//ball
let ballWidth = 46;
let ballHeight = 46;
let ballX = boardWidth / 2 - ballHeight / 2;
let ballY = boardHeight * 7 / 8 - ballHeight;
let ballRightImg;
let ballleftImg;

let ball = {
    img: null,
    x: ballX,
    y: ballY,
    width: ballWidth,
    height: ballHeight
}

//game physics
let velocityX = 0;
let velocityY = 0;
let initialVelocity = -8;
let gravity = 0.4;

//plateforms
let plateformArray = [];
let plateformWidth = 80;
let plateformHeight = 28;
let plateformImg;

// score
let score = 0;
let maxScore = 0;
let gameOver = false;


//resize canvas
window.onresize = function () {
    boardWidth = window.innerWidth;
    boardHeight = window.innerHeight;

    // Calculate ball's dimensions based on original canvas dimensions
    const widthRatio = boardWidth / 1080;
    const heightRatio = boardHeight / 700;
    ballWidth = 40 * widthRatio;
    ballHeight = 46 * heightRatio;

    // Reset ball dimensions
    ball.width = ballWidth;
    ball.height = ballHeight;

    // Resize canvas
    board.height = boardHeight;
    board.width = boardWidth;
}

window.onload = function () {
    const hasRefreshed = localStorage.getItem("hasRefreshed");

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load Images
    ballRightImg = new Image();
    ballRightImg.src = "./assets/ball.png";
    ball.img = ballRightImg;
    ballRightImg.onload = function () {
        context.drawImage(ball.img, ball.x, ball.y, ball.width, ball.height);
    };
    ballleftImg = new Image();
    ballleftImg.src = "./assets/ball.png";

    plateformImg = new Image();
    plateformImg.src = "./assets/support2.png";

    velocityY = initialVelocity;

    placePlateforms();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveball);

    // Refresh the page after 3 seconds when first rendered
    if (!hasRefreshed) {
        setTimeout(function () {
            window.location.reload();
        }, 3000);
        localStorage.setItem("hasRefreshed", "true");
    }

    // Refresh the page after 3 seconds of resizing
    let resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            window.location.reload();
        }, 3000);
    });
};






function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height)

    ball.x += velocityX;

    //condition for ball 
    if (ball.x > boardWidth) {
        ball.x = 0;
    } else if (ball.x + ball.width < 0) {
        ball.x = boardWidth;
    }

    velocityY += gravity;
    ball.y += velocityY;
    if (ball.y > board.height) {
        gameOver = true;
    }
    context.drawImage(ball.img, ball.x, ball.y, ball.width, ball.height);

    //plateforms
    for (let i = 0; i < plateformArray.length; i++) {
        let plateform = plateformArray[i];
        if (velocityY < 0 && ball.y < boardHeight * 3 / 4) {
            plateform.y -= initialVelocity; // slide plateform down
        }
        if (detectCollision(ball, plateform) && velocityY >= 0) {
            velocityY = initialVelocity; // jummp up from the plateform
        }
        context.drawImage(plateform.img, plateform.x, plateform.y, plateform.width, plateform.height);
    }

    //clear platform and add new platform
    while (plateformArray.length > 0 && plateformArray[0].y >= boardHeight) {
        plateformArray.shift(); // remove first element from the array
        newPlateform() // replace with new platform on top
    }

    //score 
    updateScore();
    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText(score, 5, 20);

    if (gameOver) {
        let text = "Game over: Press 'Space' to Restart";
        let mobileText = "Game over: 'Touch' the screen to Restart";
        let textWidth = context.measureText(text).width;

        let x = (boardWidth - textWidth) / 2;
        let y = boardHeight * 7 / 8;

        context.fillStyle = "black"; // Set background color to black

        if (boardWidth <= 560) {
            context.font = "17px Arial";

            let backgroundWidth = textWidth + 20; // Increase the background width
            let backgroundHeight = parseInt(context.font) + 20; // Increase the background height

            // Draw black background rectangle
            context.fillRect(x - 10, y - backgroundHeight, backgroundWidth, backgroundHeight);

            context.fillStyle = "white"; // Set text color to white
            let textX = x - 10 + (backgroundWidth - textWidth) / 2; // Center the text horizontally
            let textY = y - (backgroundHeight - parseInt(context.font)) / 2; // Center the text vertically
            context.fillText(mobileText, textX, textY);
        } else {
            let backgroundWidth = textWidth + 20; // Increase the background width
            let backgroundHeight = parseInt(context.font) + 20; // Increase the background height

            // Draw black background rectangle
            context.fillRect(x - 10, y - backgroundHeight, backgroundWidth, backgroundHeight);

            context.fillStyle = "white"; // Set text color to white
            let textX = x - 10 + (backgroundWidth - textWidth) / 2; // Center the text horizontally
            let textY = y - (backgroundHeight - parseInt(context.font)) / 2; // Center the text vertically
            context.fillText(text, textX, textY);
        }
    }


};


//for keyboard button 
function moveball(e) {
    if (e.code == "ArrowRight" || e.code == "keyD") {
        velocityX = 4;
        ball.img = ballRightImg
    } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
        velocityX = -4;
        ball.img = ballleftImg;
    }

    //restart game
    else if (e.code == "Space" && gameOver) {
        ball = {
            img: ballRightImg,
            x: ballX,
            y: ballY,
            width: ballWidth,
            height: ballHeight
        }

        velocityX = 0;
        velocityY = initialVelocity;
        score = 0;
        maxScore = 0;
        gameOver = false;
        placePlateforms();
    }
}
//for mobile touch
let touchStartX = null;

// ...

function onTouchStart(e) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
}

function onTouchMove(e) {
    if (touchStartX === null) return;

    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchDeltaX = touchX - touchStartX;

    if (touchDeltaX > 0) {
        velocityX = 5;
        ball.img = ballRightImg;
    } else if (touchDeltaX < 0) {
        velocityX = -5;
        ball.img = ballleftImg;
    } else {
        velocityX = 0;
    }
}

function onTouchEnd() {
    touchStartX = null;
    if (gameOver) {
        ball = {
            img: ballRightImg,
            x: ballX,
            y: ballY,
            width: ballWidth,
            height: ballHeight
        }

        velocityX = 0;
        velocityY = initialVelocity;
        score = 0;
        maxScore = 0;
        gameOver = false;
        // placePlatforms();
    } else {
        velocityX = 0;
    }


}



document.addEventListener("touchstart", onTouchStart);
document.addEventListener("touchmove", onTouchMove);
document.addEventListener("touchend", onTouchEnd);







function placePlateforms() {
    plateformArray = [];

    //starting plateform
    let plateform = {
        img: plateformImg,
        x: boardWidth / 2,
        y: boardHeight - 50,
        width: plateformWidth,
        height: plateformHeight
    }

    plateformArray.push(plateform)

    if (boardWidth <= 560) {

        for (let i = 0; i < 15; i++) {
            let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
            let plateform = {
                img: plateformImg,
                x: randomX,
                y: boardHeight - 100 * i - 30,
                width: plateformWidth,
                height: plateformHeight
            }

            plateformArray.push(plateform)

        }

    } else if (boardWidth <= 400) {

        for (let i = 0; i < 13; i++) {
            let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
            let plateform = {
                img: plateformImg,
                x: randomX,
                y: boardHeight - 100 * i - 30,
                width: plateformWidth,
                height: plateformHeight
            }

            plateformArray.push(plateform)

        }
            if (boardWidth <= 560) {

        for (let i = 0; i < 15; i++) {
            let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
            let plateform = {
                img: plateformImg,
                x: randomX,
                y: boardHeight - 100 * i - 30,
                width: plateformWidth,
                height: plateformHeight
            }

            plateformArray.push(plateform)

        }

    }

    }  else if (boardWidth <= 360) {

        for (let i = 0; i < 10; i++) {
            let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
            let plateform = {
                img: plateformImg,
                x: randomX,
                y: boardHeight - 100 * i - 30,
                width: plateformWidth,
                height: plateformHeight
            }

            plateformArray.push(plateform)

        }

    }   else if (boardWidth <= 300) {

        for (let i = 0; i < 10; i++) {
            let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
            let plateform = {
                img: plateformImg,
                x: randomX,
                y: boardHeight - 100 * i - 30,
                width: plateformWidth,
                height: plateformHeight
            }

            plateformArray.push(plateform)

        }

    }else {
        for (let i = 0; i < 50; i++) {
            let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
            let plateform = {
                img: plateformImg,
                x: randomX,
                y: boardHeight - 30 * i - 50,
                width: plateformWidth,
                height: plateformHeight
            }

            plateformArray.push(plateform)
        }
    }


}


function newPlateform() {
    let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
    let plateform = {
        img: plateformImg,
        x: randomX,
        y: -plateformHeight,
        width: plateformWidth,
        height: plateformHeight
    }

    plateformArray.push(plateform)
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}


function updateScore() {
    let points = Math.floor(50 * Math.random()); //(0-1) *50 --> (0-50)
    if (velocityY < 0) { //negative going up
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    }
    else if (velocityY >= 0) {
        maxScore -= points;
    }
}