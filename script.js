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
    "10": [] 
};

// --- A. 頁面跳轉邏輯 (修正：加入強制置頂防止跑版) ---
function goToStep(stepId) {
    var steps = document.querySelectorAll('.step-container');
    
    for (var i = 0; i < steps.length; i++) {
        steps[i].style.display = 'none';
        steps[i].classList.remove('active');
    }

    var targetId = (typeof stepId === 'number') ? 'step-' + stepId : 'step-' + stepId;
    var target = document.getElementById(targetId);
    
    if (target) {
        target.style.display = 'flex';
        setTimeout(function() {
            target.classList.add('active');
            window.scrollTo(0, 0); // 確保每次切換步驟都回到頂部，避免按鈕跑掉
        }, 50);
    }

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
    document.getElementById('conf-count').innerText = "三張牌陣 (過去、現在、未來)";

    goToStep('confirm');
}

// --- C. 牌組預覽功能 ---
function updateDeckPreview() {
    var previewContainer = document.getElementById('deck-preview');
    if (!previewContainer) return;

    var style = deckStyleSelect.value;
    previewContainer.innerHTML = ''; 

    var randomNumbers = [];
    while(randomNumbers.length < 10) {
        var r = Math.floor(Math.random() * 78) + 1;
        if(randomNumbers.indexOf(r) === -1) randomNumbers.push(r);
    }

    for (var i = 0; i <= 10; i++) {
        var img = document.createElement('img');
        if (i === 0) {
            img.src = 'images/' + style + '/back.jpg';
            img.className = 'preview-card back-straight';
        } else {
            img.src = 'images/' + style + '/' + randomNumbers[i-1] + '.jpg';
            img.className = 'preview-card fan-card';
            img.style.setProperty('--card-index', i);
        }
        previewContainer.appendChild(img);
    }
}

// 2. 初始化牌堆
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
        }

        setTimeout(function() {
            var itemWrapper = document.createElement('div');
            itemWrapper.className = 'result-item';

            if (labelConfig[mode]) {
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

// 4. 洗牌動畫 (修正：優化深長倒 U 型佈局，防止推擠跑版)
function shuffleDeck() {
    isShuffled = true; 
    var ball = document.querySelector('.crystal-ball-btn');
    if (ball) ball.classList.add('shuffling');

    var cardElements = document.querySelectorAll('#deck-container .card');
    var cardsArray = Array.prototype.slice.call(cardElements); 

    statusMsg.innerText = "正在為您洗牌...";

    cardsArray.forEach(function(card) {
        var randomX = (Math.random() - 0.5) * 150; 
        var randomY = (Math.random() - 0.5) * 80;
        var randomRot = (Math.random() - 0.5) * 40;
        card.style.transform = 'translate(calc(-50% + ' + randomX + 'px), calc(-50% + ' + randomY + 'px)) rotate(' + randomRot + 'deg)';
        card.style.opacity = "1";
    });

    setTimeout(function() {
        for (var i = cardsArray.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = cardsArray[i];
            cardsArray[i] = cardsArray[j];
            cardsArray[j] = temp;
        }

        // 動態偵測寬度
        var isMobile = window.innerWidth <= 600;
        
        // 修正跑版參數：
        // radiusX: 手機版設為螢幕寬度的 42%，確保左右滿版且不溢出
        var radiusX = isMobile ? (window.innerWidth * 0.42) : 480; 
        // radiusY: 深長度在手機稍微收斂，避免壓到按鈕
        var radiusY = isMobile ? 280 : 350; 
        // baseY: 垂直中心點，設在中間偏上位置確保下方按鈕空間穩定
        var baseY = isMobile ? 250 : 280; 
        
        cardsArray.forEach(function(card, index) {
            var angle = (index / (totalCards - 1)) * Math.PI; 
            var posX = radiusX * Math.cos(angle + Math.PI); 
            var posY = baseY + (radiusY * -Math.sin(angle)); 
            
            var rotation = (angle * 180 / Math.PI) - 90;
            
            card.style.transform = 'translate(' + posX + 'px, ' + posY + 'px) rotate(' + rotation + 'deg)';
            card.style.zIndex = index;
            card.classList.add('ready');
        });

        if (ball) ball.classList.remove('shuffling');
        statusMsg.innerText = "洗牌完成！請選取 3 張牌";
    }, 1000);
}

// 5. 重置並返回第一步
function resetToStep1() {
    isShuffled = false;
    flippedCount = 0;
    var qInput = document.getElementById('user-question');
    if (qInput) qInput.value = "";
    goToStep(1);
    updateDeckPreview();
}

window.onload = function() {
    goToStep(1);
    deckStyleSelect.addEventListener('change', updateDeckPreview);
    updateDeckPreview();
};