// JavaScript Document

// 1. 常數與變數宣告
var container = document.getElementById('deck-container');
var resultArea = document.getElementById('result-area');
var statusMsg = document.getElementById('status-msg');
var drawSelect = document.getElementById('draw-count');
var deckStyleSelect = document.getElementById('deck-style');

var isShuffled = false;
var totalCards = 78;
var flippedCount = 0;

// 定義不同牌陣的標籤文字
var labelConfig = {
    "1": ["每日抽牌"],
    "3": ["過去", "現在", "未來"],
    "5": ["內在自我", "外在障礙", "潛在因素", "建議", "結果"],
    "10": [] // 十張使用大標題
};

// --- A. 頁面跳轉邏輯修正 ---
function goToStep(stepId) {
    var steps = document.querySelectorAll('.step-container');
    
    // 1. 先隱藏所有步驟容器
    for (var i = 0; i < steps.length; i++) {
        steps[i].style.display = 'none';
        steps[i].classList.remove('active');
    }

    // 2. 取得目標 ID 字串
    var targetId = (typeof stepId === 'number') ? 'step-' + stepId : 'step-' + stepId;
    var target = document.getElementById(targetId);
    
    if (target) {
        // 3. 先變更為 flex，再透過 setTimeout 觸發動畫
        target.style.display = 'flex';
        setTimeout(function() {
            target.classList.add('active');
        }, 50);
    }

    // 4. 進入第 2 步（洗牌頁）時才初始化牌堆
    if (stepId === 2 || stepId === '2') {
        initDeck();
    }
}

// --- B. 準備確認頁面資料 ---
function prepareConfirmation() {
    var qInput = document.getElementById('user-question');
    var qValue = qInput ? qInput.value.trim() : "";

    if (qValue === "") {
        alert("請輸入您想請教的問題。");
        return;
    }

    document.getElementById('conf-question').innerText = qValue;
    document.getElementById('conf-deck').innerText = deckStyleSelect.options[deckStyleSelect.selectedIndex].text;
    document.getElementById('conf-count').innerText = drawSelect.options[drawSelect.selectedIndex].text;

    goToStep('confirm');
}

// --- C. 牌組預覽功能修正 (1直立背面 + 10扇形正面) ---
function updateDeckPreview() {
    var previewContainer = document.getElementById('deck-preview');
    if (!previewContainer) return;

    var style = deckStyleSelect.value;
    previewContainer.innerHTML = ''; 

    // 隨機選出 10 個不重複的數字 (正面牌用)
    var randomNumbers = [];
    while(randomNumbers.length < 10) {
        var r = Math.floor(Math.random() * 78) + 1;
        if(randomNumbers.indexOf(r) === -1) randomNumbers.push(r);
    }

    // 建立 11 張牌 (索引 0 是背面，1-10 是正面)
    for (var i = 0; i <= 10; i++) {
        var img = document.createElement('img');
        
        if (i === 0) {
            img.src = 'images/' + style + '/back.jpg';
            img.className = 'preview-card back-straight'; // 特別給一個直立類別
        } else {
            img.src = 'images/' + style + '/' + randomNumbers[i-1] + '.jpg';
            img.className = 'preview-card fan-card';
            // 設定 CSS 變數用於計算扇形角度，讓正面牌從 1 開始計算
            img.style.setProperty('--card-index', i);
        }
        
        previewContainer.appendChild(img);
    }
}
// 2. 初始化牌堆 (支援專屬牌背)
function initDeck() {
    if(container) container.innerHTML = '';
    if(resultArea) resultArea.innerHTML = '';
    flippedCount = 0;
    isShuffled = false; 

    var style = deckStyleSelect ? deckStyleSelect.value : 'classic';

    if(statusMsg) statusMsg.innerText = "請點擊按鈕開始洗牌";

    for (var i = 1; i <= totalCards; i++) {
        var card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-index', i);
        card.style.zIndex = i; 
        
        card.innerHTML = 
            '<div class="card-inner">' +
                '<div class="card-back">' +
                    '<img src="images/' + style + '/back.jpg" style="width:100%; height:100%; object-fit:cover;">' +
                '</div>' +
                '<div class="card-front">' +
                    '<img src="images/' + style + '/' + i + '.jpg" class="card-front-img" alt="Card ' + i + '">' +
                '</div>' +
            '</div>';

        card.addEventListener('click', function() {
            handleCardClick(this);
        });
        
        container.appendChild(card);
    }
}

// 3. 處理點擊抽牌邏輯
function handleCardClick(cardElement) {
    if (isShuffled === false) { 
        alert("請先洗牌！");
        return; 
    }
    
    var mode = drawSelect.value;
    var maxDraw = parseInt(mode);
    var qValue = document.getElementById('user-question').value.trim();

    if (!cardElement.classList.contains('flipped') && flippedCount < maxDraw) {
        cardElement.classList.add('flying');
        cardElement.classList.add('flipped');
        flippedCount++;
        
        if(statusMsg) statusMsg.innerText = "已抽取 " + flippedCount + " / " + maxDraw + " 張";

        if (flippedCount === 1) {
            var qHeader = document.createElement('div');
            qHeader.className = 'final-question-display';
            qHeader.innerText = "問：「" + qValue + "」";
            resultArea.appendChild(qHeader);

            if (mode === "10") {
                var mainTitle = document.createElement('div');
                mainTitle.className = 'full-width-title';
                mainTitle.innerText = "— 凱爾特十字牌陣 —";
                resultArea.appendChild(mainTitle);
            }
        }

        setTimeout(function() {
            var itemWrapper = document.createElement('div');
            itemWrapper.className = 'result-item';

            if (mode !== "10" && labelConfig[mode]) {
                var label = document.createElement('div');
                label.className = 'card-label';
                label.innerText = labelConfig[mode][flippedCount - 1];
                itemWrapper.appendChild(label);
            }
            
            var clone = cardElement.cloneNode(true);
            clone.classList.remove('flying');
            clone.style.position = "relative";
            clone.style.transform = "none";
            clone.style.left = "auto";
            clone.style.top = "auto";
            clone.style.opacity = "1";
            
            itemWrapper.appendChild(clone);
            resultArea.appendChild(itemWrapper);
            
            cardElement.style.visibility = "hidden";

            if (flippedCount === maxDraw) {
                statusMsg.innerText = "抽牌完成，正在顯示結果...";
                setTimeout(function() {
                    goToStep(3);
                }, 1000); 
            }
            
        }, 700); 
    }
}

// 4. 洗牌動畫 (先打散混亂，再排成 U 型)
function shuffleDeck() {
    isShuffled = true; 
    
    // 1. 水晶球啟動發光
    var ball = document.querySelector('.crystal-ball-btn');
    if (ball) ball.classList.add('shuffling');

    var cardElements = document.querySelectorAll('#deck-container .card');
    var cardsArray = Array.prototype.slice.call(cardElements); 

    statusMsg.innerText = "正在為您洗牌...";

    // --- 第一階段：快速打散動畫 ---
    cardsArray.forEach(function(card) {
        // 讓每張牌隨機飛往中心點附近的小範圍，並產生隨機旋轉
        var randomX = (Math.random() - 0.5) * 150; 
        var randomY = (Math.random() - 0.5) * 80;
        var randomRot = (Math.random() - 0.5) * 40;
        card.style.transform = 'translate(calc(-50% + ' + randomX + 'px), calc(-50% + ' + randomY + 'px)) rotate(' + randomRot + 'deg)';
        card.style.opacity = "1";
    });

    // --- 第二階段：真正的 U 型展開 ---
    // 設定在 1 秒後執行展開（這 1 秒內牌堆會維持在中間亂跳的感覺）
    setTimeout(function() {
        // Fisher-Yates 隨機打亂陣列順序
        for (var i = cardsArray.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = cardsArray[i];
            cardsArray[i] = cardsArray[j];
            cardsArray[j] = temp;
        }

        var radiusX = 400;
        var radiusY = 180;
        
        cardsArray.forEach(function(card, index) {
            var angle = (index / (totalCards - 1)) * Math.PI + Math.PI; 
            var posX = radiusX * Math.cos(angle);
            var posY = 100 + radiusY * Math.sin(angle);
            var rotation = (angle * 180 / Math.PI) + 90;
            
            card.style.transform = 'translate(' + posX + 'px, ' + posY + 'px) rotate(' + rotation + 'deg)';
            card.style.zIndex = index;
            card.classList.add('ready');
        });

        if (ball) ball.classList.remove('shuffling');
        statusMsg.innerText = "洗牌完成！請選取 " + drawSelect.value + " 張牌";
    }, 1000); // 1000ms 是牌堆打散持續的時間
}
// 5. 重置並返回第一步
function resetToStep1() {
    isShuffled = false;
    flippedCount = 0;
    var qInput = document.getElementById('user-question');
    if (qInput) qInput.value = "";
    goToStep(1);
    updateDeckPreview(); // 重置時也更新一下預覽
}

// 初始進入第一步
window.onload = function() {
    goToStep(1);
    // 設定下拉選單監聽
    deckStyleSelect.addEventListener('change', updateDeckPreview);
    // 初始載入預覽
    updateDeckPreview();
};