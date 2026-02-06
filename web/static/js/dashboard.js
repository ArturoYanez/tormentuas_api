// Estado de la aplicación
const state = {
    user: null,
    token: null,
    ws: null,
    currentSymbol: 'BTC/USDT',
    activePairs: ['BTC/USDT'],
    prices: {},
    chart: null,
    candleSeries: null,
    selectedDuration: 60,
    activeTrades: [],
    isVerified: false
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initChart();
    initWebSocket();
    loadMarkets();
    setupEventListeners();
    updatePotentialProfit();
});

// Verificar autenticación
function checkAuth() {
    state.token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!state.token || !userStr) {
        window.location.href = '/login';
        return;
    }
    
    state.user = JSON.parse(userStr);
    document.getElementById('userName').textContent = state.user.first_name || state.user.email;
    document.getElementById('userBalance').textContent = `$${(state.user.balance || 10000).toFixed(2)}`;
    
    // Verificar estado de verificación
    checkVerificationStatus();
}

// Verificar si necesita verificación
async function checkVerificationStatus() {
    try {
        const response = await fetch('/api/protected/verification/check', {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await response.json();
        
        state.isVerified = data.can_trade;
        
        if (data.verification_required) {
            document.getElementById('verificationModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error checking verification:', error);
    }
}

// Cerrar modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Mostrar formulario de verificación
function showVerificationForm() {
    alert('Funcionalidad de verificación - En desarrollo');
    closeModal('verificationModal');
}

// Inicializar gráfico
function initChart() {
    const chartContainer = document.getElementById('chart');
    
    state.chart = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
        layout: {
            background: { type: 'solid', color: '#0a0e17' },
            textColor: '#94a3b8',
        },
        grid: {
            vertLines: { color: '#1f2937' },
            horzLines: { color: '#1f2937' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: '#374151',
        },
        timeScale: {
            borderColor: '#374151',
            timeVisible: true,
            secondsVisible: true,
        },
    });

    state.candleSeries = state.chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#10b981',
        wickDownColor: '#ef4444',
        wickUpColor: '#10b981',
    });

    // Datos iniciales de ejemplo
    generateInitialCandles();

    // Resize handler
    window.addEventListener('resize', () => {
        state.chart.applyOptions({
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight,
        });
    });
}

// Generar velas iniciales
function generateInitialCandles() {
    const candles = [];
    let basePrice = 67500;
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 100; i >= 0; i--) {
        const time = now - (i * 5);
        const open = basePrice;
        const change = (Math.random() - 0.5) * 100;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 50;
        const low = Math.min(open, close) - Math.random() * 50;
        
        candles.push({ time, open, high, low, close });
        basePrice = close;
    }
    
    state.candleSeries.setData(candles);
}

// Inicializar WebSocket
function initWebSocket() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    state.ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws`);
    
    state.ws.onopen = () => {
        console.log('WebSocket conectado');
        // Suscribirse al símbolo actual
        subscribeToSymbol(state.currentSymbol);
    };
    
    state.ws.onmessage = (event) => {
        const messages = event.data.split('\n');
        messages.forEach(msg => {
            if (msg.trim()) {
                try {
                    const data = JSON.parse(msg);
                    handleWebSocketMessage(data);
                } catch (e) {
                    console.error('Error parsing WS message:', e);
                }
            }
        });
    };
    
    state.ws.onclose = () => {
        console.log('WebSocket desconectado, reconectando...');
        setTimeout(initWebSocket, 3000);
    };
    
    state.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

// Manejar mensajes WebSocket
function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'price_update':
            updatePrice(data.data);
            break;
        case 'candle_update':
            updateCandle(data.data);
            break;
        case 'trade_result':
            handleTradeResult(data.data);
            break;
        case 'heartbeat':
            // Mantener conexión viva
            break;
    }
}

// Actualizar precio
function updatePrice(priceData) {
    state.prices[priceData.symbol] = priceData;
    
    // Actualizar UI si es el símbolo actual
    if (priceData.symbol === state.currentSymbol) {
        document.getElementById('currentPrice').textContent = `$${priceData.price.toFixed(2)}`;
        
        const changeEl = document.getElementById('priceChange');
        changeEl.textContent = `${priceData.change_24h >= 0 ? '+' : ''}${priceData.change_24h.toFixed(2)}%`;
        changeEl.className = `change ${priceData.change_24h >= 0 ? 'positive' : 'negative'}`;
        
        // Agregar nueva vela
        const now = Math.floor(Date.now() / 1000);
        state.candleSeries.update({
            time: now,
            open: priceData.price,
            high: priceData.price * 1.0001,
            low: priceData.price * 0.9999,
            close: priceData.price
        });
    }
    
    // Actualizar lista de activos
    updateAssetPrice(priceData);
}

// Actualizar precio en lista de activos
function updateAssetPrice(priceData) {
    const assetEl = document.querySelector(`.asset-item[data-symbol="${priceData.symbol}"]`);
    if (assetEl) {
        assetEl.querySelector('.price').textContent = `$${priceData.price.toFixed(priceData.price < 1 ? 4 : 2)}`;
        const changeEl = assetEl.querySelector('.change');
        changeEl.textContent = `${priceData.change_24h >= 0 ? '+' : ''}${priceData.change_24h.toFixed(2)}%`;
        changeEl.className = `change ${priceData.change_24h >= 0 ? 'positive' : 'negative'}`;
    }
}

// Suscribirse a símbolo
function subscribeToSymbol(symbol) {
    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
        state.ws.send(JSON.stringify({ action: 'subscribe', symbol }));
    }
}

// Desuscribirse de símbolo
function unsubscribeFromSymbol(symbol) {
    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
        state.ws.send(JSON.stringify({ action: 'unsubscribe', symbol }));
    }
}

// Cargar mercados
async function loadMarkets() {
    try {
        const response = await fetch('/api/markets');
        const data = await response.json();
        
        // Cargar precios iniciales
        const pricesResponse = await fetch('/api/prices');
        const pricesData = await pricesResponse.json();
        
        if (pricesData.prices) {
            Object.values(pricesData.prices).forEach(price => {
                state.prices[price.symbol] = price;
            });
        }
        
        // Mostrar mercado de cripto por defecto
        showMarket('crypto');
    } catch (error) {
        console.error('Error loading markets:', error);
    }
}

// Mostrar mercado
function showMarket(marketType) {
    const assetList = document.getElementById('assetList');
    assetList.innerHTML = '';
    
    const marketAssets = {
        crypto: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT', 'DOGE/USDT', 'ADA/USDT', 'AVAX/USDT', 'DOT/USDT', 'LINK/USDT'],
        forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'],
        commodities: ['XAU/USD', 'XAG/USD', 'WTI/USD', 'BRENT/USD', 'XPT/USD', 'XPD/USD', 'NG/USD', 'COPPER/USD'],
        stocks: ['SPY/USD', 'QQQ/USD', 'DIA/USD', 'AAPL/USD', 'GOOGL/USD', 'MSFT/USD', 'AMZN/USD', 'TSLA/USD', 'NVDA/USD', 'META/USD']
    };
    
    const assets = marketAssets[marketType] || [];
    
    assets.forEach(symbol => {
        const price = state.prices[symbol] || { price: 0, change_24h: 0 };
        const assetEl = document.createElement('div');
        assetEl.className = `asset-item ${symbol === state.currentSymbol ? 'active' : ''}`;
        assetEl.dataset.symbol = symbol;
        assetEl.innerHTML = `
            <div class="asset-info">
                <span class="asset-symbol">${symbol}</span>
            </div>
            <div class="asset-price">
                <div class="price">$${price.price.toFixed(price.price < 1 ? 4 : 2)}</div>
                <div class="change ${price.change_24h >= 0 ? 'positive' : 'negative'}">
                    ${price.change_24h >= 0 ? '+' : ''}${price.change_24h.toFixed(2)}%
                </div>
            </div>
        `;
        assetEl.addEventListener('click', () => selectAsset(symbol));
        assetList.appendChild(assetEl);
    });
}

// Seleccionar activo
function selectAsset(symbol) {
    // Desuscribirse del anterior
    unsubscribeFromSymbol(state.currentSymbol);
    
    // Actualizar estado
    state.currentSymbol = symbol;
    
    // Suscribirse al nuevo
    subscribeToSymbol(symbol);
    
    // Actualizar UI
    document.querySelectorAll('.asset-item').forEach(el => {
        el.classList.toggle('active', el.dataset.symbol === symbol);
    });
    
    document.getElementById('currentSymbol').textContent = symbol;
    
    // Agregar a pares activos si no está
    if (!state.activePairs.includes(symbol)) {
        state.activePairs.push(symbol);
        updateActivePairs();
    }
    
    // Regenerar gráfico
    generateInitialCandles();
}

// Actualizar pares activos
function updateActivePairs() {
    const pairsList = document.getElementById('activePairsList');
    pairsList.innerHTML = '';
    
    state.activePairs.forEach(symbol => {
        const pairEl = document.createElement('div');
        pairEl.className = `pair-tab ${symbol === state.currentSymbol ? 'active' : ''}`;
        pairEl.innerHTML = `
            <span>${symbol}</span>
            <button class="close-btn" onclick="removePair('${symbol}', event)">×</button>
        `;
        pairEl.addEventListener('click', (e) => {
            if (!e.target.classList.contains('close-btn')) {
                selectAsset(symbol);
            }
        });
        pairsList.appendChild(pairEl);
    });
}

// Remover par
function removePair(symbol, event) {
    event.stopPropagation();
    
    if (state.activePairs.length <= 1) return;
    
    state.activePairs = state.activePairs.filter(s => s !== symbol);
    unsubscribeFromSymbol(symbol);
    
    if (symbol === state.currentSymbol) {
        selectAsset(state.activePairs[0]);
    }
    
    updateActivePairs();
}

// Configurar event listeners
function setupEventListeners() {
    // Tabs de mercado
    document.querySelectorAll('.market-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.market-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showMarket(tab.dataset.market);
        });
    });
    
    // Duración
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedDuration = parseInt(btn.dataset.duration);
        });
    });
    
    // Monto
    document.getElementById('tradeAmount').addEventListener('input', updatePotentialProfit);
    
    // Búsqueda
    document.getElementById('marketSearch').addEventListener('input', (e) => {
        const search = e.target.value.toLowerCase();
        document.querySelectorAll('.asset-item').forEach(item => {
            const symbol = item.dataset.symbol.toLowerCase();
            item.style.display = symbol.includes(search) ? 'flex' : 'none';
        });
    });
}

// Ajustar monto
function adjustAmount(delta) {
    const input = document.getElementById('tradeAmount');
    let value = parseInt(input.value) + delta;
    if (value < 1) value = 1;
    input.value = value;
    updatePotentialProfit();
}

// Establecer monto
function setAmount(amount) {
    document.getElementById('tradeAmount').value = amount;
    updatePotentialProfit();
}

// Actualizar ganancia potencial
function updatePotentialProfit() {
    const amount = parseInt(document.getElementById('tradeAmount').value) || 0;
    const profit = amount * 0.85;
    document.getElementById('potentialProfit').textContent = `$${profit.toFixed(2)}`;
}

// Colocar operación
async function placeTrade(direction) {
    if (!state.isVerified) {
        document.getElementById('verificationModal').style.display = 'flex';
        return;
    }
    
    const amount = parseInt(document.getElementById('tradeAmount').value);
    
    if (amount <= 0) {
        alert('Ingresa un monto válido');
        return;
    }
    
    try {
        const response = await fetch('/api/protected/trades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
                symbol: state.currentSymbol,
                direction: direction,
                amount: amount,
                duration: state.selectedDuration
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addActiveTrade(data.trade);
        } else {
            alert(data.error || 'Error al colocar operación');
        }
    } catch (error) {
        console.error('Error placing trade:', error);
        alert('Error de conexión');
    }
}

// Agregar trade activo
function addActiveTrade(trade) {
    state.activeTrades.push(trade);
    renderActiveTrades();
    startTradeTimer(trade);
}

// Renderizar trades activos
function renderActiveTrades() {
    const container = document.getElementById('activeTradesList');
    
    if (state.activeTrades.length === 0) {
        container.innerHTML = '<p class="no-trades">No hay operaciones activas</p>';
        return;
    }
    
    container.innerHTML = state.activeTrades.map(trade => `
        <div class="trade-card ${trade.direction}" data-trade-id="${trade.id}">
            <div class="trade-card-header">
                <span class="trade-card-symbol">${trade.symbol}</span>
                <span class="trade-card-direction ${trade.direction}">
                    ${trade.direction === 'up' ? '▲ COMPRA' : '▼ VENTA'}
                </span>
            </div>
            <div class="trade-card-info">
                <span>$${trade.amount.toFixed(2)}</span>
                <span>@${trade.entry_price.toFixed(2)}</span>
            </div>
            <div class="trade-card-timer" id="timer-${trade.id}">
                ${formatTime(Math.max(0, Math.floor((new Date(trade.expires_at) - new Date()) / 1000)))}
            </div>
        </div>
    `).join('');
}

// Iniciar timer de trade
function startTradeTimer(trade) {
    const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((new Date(trade.expires_at) - new Date()) / 1000));
        const timerEl = document.getElementById(`timer-${trade.id}`);
        
        if (timerEl) {
            timerEl.textContent = formatTime(remaining);
        }
        
        if (remaining <= 0) {
            clearInterval(interval);
        }
    }, 1000);
}

// Formatear tiempo
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Manejar resultado de trade
function handleTradeResult(trade) {
    // Remover de activos
    state.activeTrades = state.activeTrades.filter(t => t.id !== trade.id);
    renderActiveTrades();
    
    // Mostrar notificación
    const isWin = trade.status === 'won';
    const message = isWin 
        ? `¡Ganaste $${trade.profit.toFixed(2)}!` 
        : `Perdiste $${Math.abs(trade.profit).toFixed(2)}`;
    
    showNotification(message, isWin ? 'success' : 'error');
    
    // Actualizar balance (simulado)
    const balanceEl = document.getElementById('userBalance');
    const currentBalance = parseFloat(balanceEl.textContent.replace('$', ''));
    const newBalance = currentBalance + trade.profit;
    balanceEl.textContent = `$${newBalance.toFixed(2)}`;
}

// Mostrar notificación
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Inicializar pares activos
updateActivePairs();
