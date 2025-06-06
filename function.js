const area = document.getElementById("Area");
const ctx = area.getContext("2d");
const radius = 10;
const gridSize = 50;
const offset = 25;
const epsilon = 5; // 許容誤差（px単位）
let emptyPoints = [];
let points = []; // プレイヤーが置いた点を格納
let you;
let gameOver = false; // ゲーム終了フラグ

area.width = area.clientWidth;
area.height = area.clientHeight;

function getAllGridPoints() {
    for (let x = offset; x <= area.width; x += gridSize) {
        for (let y = offset; y <= area.height; y += gridSize) {
            emptyPoints.push({ x, y });
        }
    }
}

function drawGrid() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    for (let x = offset; x <= area.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, area.height);
        ctx.stroke();
    }

    for (let y = offset; y <= area.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(area.width, y);
        ctx.stroke();
    }
}

function getNearestGridPoint(x, y) {
    const gx = Math.round((x - offset) / gridSize) * gridSize + offset;
    const gy = Math.round((y - offset) / gridSize) * gridSize + offset;
    return { x: gx, y: gy };
}

area.addEventListener('click', (e) => {
    if (gameOver) return; // ゲームが終了したら何もしない

    you = true;
    const repoint = area.getBoundingClientRect();
    const x = e.clientX - repoint.left;
    const y = e.clientY - repoint.top;
    const gridPoint = getNearestGridPoint(x, y);

    // 点を描画
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(gridPoint.x, gridPoint.y, radius, 0, Math.PI * 2);
    points.push(gridPoint);
    ctx.fill();
    ctx.closePath();

    // emptyPoints 配列からクリックされた gridPoint を削除
    emptyPoints = emptyPoints.filter(p => p.x !== gridPoint.x || p.y !== gridPoint.y);
    console.log(emptyPoints);  // 削除後の emptyPoints をログ表示

    npcNormal(emptyPoints);

    // 共円判定
    const result = checkConcyclic(points);
    if (result) {
        if (you) {
            drawCircleOutline(result.circle);
            alert("You Lose !");
            gameOver = true; // ゲーム終了
            showGameOverMessage("You Lose! Game Over.");
        } else {
            drawCircleOutline(result.circle);
            alert("You Win !");
            gameOver = true; // ゲーム終了
            showGameOverMessage("You Win! Game Over.");
        }
    }
});

// 共円判定のメイン関数
function checkConcyclic(points) {
    const n = points.length;
    if (n < 4) return false;

    for (let i = 0; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
            for (let k = j + 1; k < n; k++) {
                const circle = calcCircleCenterAndRadius(points[i], points[j], points[k]);
                if (circle == null) continue; // 3点が一直線ならスキップ

                // この円に乗る点のカウント
                let count = 0;
                for (let p of points) {
                    const distSq = (p.x - circle.cx) ** 2 + (p.y - circle.cy) ** 2;
                    if (Math.abs(distSq - circle.r ** 2) < epsilon * epsilon) {
                        count++;
                    }
                }
                if (count >= 4) {
                    // 共円の集合発見
                    return { circle, pointsOnCircle: count };
                }
            }
        }
    }
    return false;
}

// 3点から円の中心と半径を計算（前回の関数）
function calcCircleCenterAndRadius(p1, p2, p3) {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;

    const A = x2 - x1;
    const B = y2 - y1;
    const C = x3 - x1;
    const D = y3 - y1;

    const E = A * (x1 + x2) + B * (y1 + y2);
    const F = C * (x1 + x3) + D * (y1 + y3);

    const G = 2 * (A * (y3 - y2) - B * (x3 - x2));
    if (G == 0) return null;

    const cx = (D * E - B * F) / G;
    const cy = (A * F - C * E) / G;
    const r = Math.sqrt((cx - x1) ** 2 + (cy - y1) ** 2);

    return { cx, cy, r };
}

function drawCircleOutline(circle) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(circle.cx, circle.cy, circle.r, 0, Math.PI * 2);
    ctx.stroke();
}

function npcNormal(emptyPoints) {
    // ランダムで空いている格子点を選ぶ
    const i = Math.floor(Math.random() * emptyPoints.length);  // 0からemptyPoints.length-1の範囲でランダム
    const gridPoint = emptyPoints[i];

    // 遅延をかけてNPCの動きを描画する
    setTimeout(() => {
        // ここで遅延後にNPCの動きを描画
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(gridPoint.x, gridPoint.y, radius, 0, Math.PI * 2);
        points.push(gridPoint);
        ctx.fill();
        ctx.closePath();
    }, 1000);  // 1000ms (1秒) の遅延を設定
}

// ゲーム終了後のメッセージ表示
function showGameOverMessage(message) {
    const messageElement = document.getElementById("gameOverMessage");
    messageElement.innerText = message;
    messageElement.style.display = "block";
}

// ゲームをリセット
function resetGame() {
    points = [];
    emptyPoints = [];
    gameOver = false;
    you = null;

    // ゲーム終了メッセージを非表示
    const messageElement = document.getElementById("gameOverMessage");
    messageElement.style.display = "none";

    // キャンバスをクリア
    ctx.clearRect(0, 0, area.width, area.height);

    // グリッドを再描画
    drawGrid();
    getAllGridPoints();
}
