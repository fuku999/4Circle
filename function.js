const area = document.getElementById("Area");
const ctx = area.getContext("2d");
const radius = 10;
const gridSize = 50;
const offset = 25;
const epsilon = 5;
let emptyPoints = [];
let points = [];
let gameOver = false;
let isPlayerTurn = true;

area.width = area.clientWidth;
area.height = area.clientHeight;

function getAllGridPoints() {
	emptyPoints = []; 
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
	if (gameOver || !isPlayerTurn) return;

	const repoint = area.getBoundingClientRect();
	const x = e.clientX - repoint.left;
	const y = e.clientY - repoint.top;
	const gridPoint = getNearestGridPoint(x, y);

	// プレイヤーの点を描画
	ctx.fillStyle = 'black';
	ctx.beginPath();
	ctx.arc(gridPoint.x, gridPoint.y, radius, 0, Math.PI * 2);
	points.push(gridPoint);
	ctx.fill();
	ctx.closePath();

	// プレイヤーの点を使用済みに
	emptyPoints = emptyPoints.filter(p => p.x !== gridPoint.x || p.y !== gridPoint.y);
	
	// プレイヤーの共円チェック
	let result = checkConcyclic(points);
	if (result) {
		drawCircleOutline(result.circle);
		alert("You Lose !");
		gameOver = true;
		showGameOverMessage("You Lose! Game Over.");
		return;
	}

	// NPC のターン
	npcNormal();
	isPlayerTurn = false;
});

function npcNormal() {
	if (emptyPoints.length === 0 || gameOver) return;

	const i = Math.floor(Math.random() * emptyPoints.length);
	const gridPoint = emptyPoints[i];

	setTimeout(() => {
		// 点を描画
		ctx.fillStyle = 'black';
		ctx.beginPath();
		ctx.arc(gridPoint.x, gridPoint.y, radius, 0, Math.PI * 2);
		points.push(gridPoint);
		ctx.fill();
		ctx.closePath();

		// 使用済みポイントを削除
		emptyPoints = emptyPoints.filter(p => p.x !== gridPoint.x || p.y !== gridPoint.y);

		// NPC の共円チェック
		const result = checkConcyclic(points);
		if (result) {
			drawCircleOutline(result.circle);
			alert("You Win !");
			gameOver = true;
			showGameOverMessage("You Win! Game Over.");
		}
		isPlayerTurn = true;
	}, 1000);
}

function checkConcyclic(points) {
	const n = points.length;
	if (n < 4) return false;

	for (let i = 0; i < n - 2; i++) {
		for (let j = i + 1; j < n - 1; j++) {
			for (let k = j + 1; k < n; k++) {
				const circle = calcCircleCenterAndRadius(points[i], points[j], points[k]);
				if (!circle) continue;

				let count = 0;
				for (let p of points) {
					const distSq = (p.x - circle.cx) ** 2 + (p.y - circle.cy) ** 2;
					if (Math.abs(distSq - circle.r ** 2) < epsilon * epsilon) {
						count++;
					}
				}
				if (count >= 4) {
					return { circle, pointsOnCircle: count };
				}
			}
		}
	}
	return false;
}

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
	if (G === 0) return null;

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

function showGameOverMessage(message) {
	const messageElement = document.getElementById("gameOverMessage");
	messageElement.innerText = message;
	messageElement.style.display = "block";
}

function resetGame() {
	points = [];
	gameOver = false;
	isPlayerTurn = true;


	ctx.clearRect(0, 0,area.clientWidth, area.clientHeight);
	console.log(area.clientWidth);
	getAllGridPoints();  
	drawGrid();
	
}

	drawGrid();
	getAllGridPoints();
