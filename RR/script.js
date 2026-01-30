/* ===================================== 
   Round Robin Scheduling - Match C++ Implementation
   ===================================== 
   
   This script replicates the exact behavior of the C++ program:
   - Shows step-by-step execution log
   - Displays which process runs at each time quantum
   - Shows remaining time and queue status
   - Calculates final metrics
*/

// ===== State Management =====
let appState = {
    quantum: 0,
    processCount: 0,
    burstTimes: [], // Original burst times [P1, P2, P3...]
};

// ===== DOM Elements Cache =====
const elements = {
    quantumInput: document.getElementById('quantum'),
    processCountInput: document.getElementById('processCount'),
    generateBtn: document.getElementById('generateBtn'),
    executeBtn: document.getElementById('executeBtn'),
    resetBtn: document.getElementById('resetBtn'),
    processInputSection: document.getElementById('processInputSection'),
    processInputs: document.getElementById('processInputs'),
    executionSection: document.getElementById('executionSection'),
    executionLog: document.getElementById('executionLog'),
    resultsSection: document.getElementById('resultsSection'),
    resultsBody: document.getElementById('resultsBody'),
    statusMessage: document.getElementById('statusMessage'),
    avgTAT: document.getElementById('avgTAT'),
    avgWT: document.getElementById('avgWT'),
};

// ===================================== 
//   EVENT LISTENERS
// ===================================== 

document.addEventListener('DOMContentLoaded', () => {
    if (elements.generateBtn) elements.generateBtn.addEventListener('click', handleGenerateProcesses);
    if (elements.executeBtn) elements.executeBtn.addEventListener('click', handleExecuteScheduling);
    if (elements.resetBtn) elements.resetBtn.addEventListener('click', handleReset);
    
    // Allow Enter key for input
    if (elements.quantumInput) {
        elements.quantumInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleGenerateProcesses();
        });
    }
    if (elements.processCountInput) {
        elements.processCountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleGenerateProcesses();
        });
    }
});

// ===================================== 
//   HANDLER: Generate Process Inputs
// ===================================== 

function handleGenerateProcesses() {
    // Validate inputs
    const quantum = parseInt(elements.quantumInput.value);
    const processCount = parseInt(elements.processCountInput.value);

    if (isNaN(quantum) || quantum < 1) {
        showStatus('Lỗi: Quantum phải > 0', 'error');
        return;
    }

    if (isNaN(processCount) || processCount < 1 || processCount > 10) {
        showStatus('Lỗi: Số tiến trình phải từ 1-10', 'error');
        return;
    }

    // Update state
    appState.quantum = quantum;
    appState.processCount = processCount;

    // Generate process inputs
    generateProcessInputFields(processCount);

    // Show the process input section
    if (elements.processInputSection) elements.processInputSection.style.display = 'block';
    if (elements.executionSection) elements.executionSection.style.display = 'none';
    if (elements.resultsSection) elements.resultsSection.style.display = 'none';
    clearStatus();

    // Scroll to process inputs
    if (elements.processInputSection) elements.processInputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===================================== 
//   Generate Dynamic Process Input Fields
// ===================================== 

function generateProcessInputFields(count) {
    if (!elements.processInputs) {
        console.error('Process inputs container not found');
        return;
    }
    
    elements.processInputs.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        const item = document.createElement('div');
        item.className = 'process-input-item';

        const label = document.createElement('label');
        label.textContent = `[NHAP THOI GIAN CHO TIEN TRINH] P[${i}]: `;

        const input = document.createElement('input');
        input.type = 'number';
        input.id = `process-${i}`;
        input.min = '1';
        input.max = '100';
        input.value = String(Math.floor(Math.random() * 20) + 5);
        input.placeholder = `Nhập burst time cho P${i}`;

        item.appendChild(label);
        item.appendChild(input);
        elements.processInputs.appendChild(item);
    }
}

// ===================================== 
//   HANDLER: Execute Scheduling
// ===================================== 

function handleExecuteScheduling() {
    // Read burst times from inputs (1-indexed)
    const burstTimes = [0]; // Index 0 unused, start from 1
    let valid = true;

    for (let i = 1; i <= appState.processCount; i++) {
        const input = document.getElementById(`process-${i}`);
        const burstTime = parseInt(input.value);

        if (isNaN(burstTime) || burstTime < 1) {
            showStatus(`Lỗi P${i}: Nhập số > 0`, 'error');
            valid = false;
            break;
        }

        burstTimes.push(burstTime);
    }

    if (!valid) return;

    appState.burstTimes = burstTimes;

    // Execute Round Robin algorithm and get execution log
    const result = executeRoundRobinWithLog(burstTimes, appState.quantum, appState.processCount);

    // Display execution log
    displayExecutionLog(result.log);

    // Display final results
    displayResults(result.completion, result.burstTimes, appState.processCount);

    // Show sections
    elements.executionSection.style.display = 'block';
    elements.resultsSection.style.display = 'block';
    
    // Scroll to results
    elements.executionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showStatus('✅ Lịch biểu đã tính xong!', 'success');
}

// ===================================== 
//   Round Robin Algorithm with Execution Log
// ===================================== 

function executeRoundRobinWithLog(burstTimes, quantum, n) {
    const log = [];
    
    // Initialize arrays (matching C++)
    const P = [0]; // Process IDs
    const ThoiGian = [0]; // Remaining time
    const Completion = [0]; // Completion times
    
    // Queue initialization
    let front = 0, rear = 0;
    let currentTime = 0;
    
    // Initialize queue with processes
    for (let i = 1; i <= n; i++) {
        P[rear] = i;
        ThoiGian[rear] = burstTimes[i];
        rear++;
    }

    log.push('=== BAT DAU LAP LICH ROUND ROBIN ===');
    log.push('___________________________________________________');

    // Execute scheduling
    while (front < rear) {
        const p = P[front];
        let thoigianconlai = ThoiGian[front];
        front++;

        log.push(`[TIEN TRINH] P[${p}] | TG con lai: ${thoigianconlai}`);

        if (thoigianconlai > quantum) {
            // Process doesn't finish in this quantum
            currentTime += quantum;
            thoigianconlai -= quantum;

            log.push(`  -> Chay ${quantum} | Con lai: ${thoigianconlai} (dua lai hang doi)`);

            // Re-queue
            P[rear] = p;
            ThoiGian[rear] = thoigianconlai;
            rear++;
        } else {
            // Process completes
            currentTime += thoigianconlai;
            Completion[p] = currentTime;

            log.push(`  -> HOAN THANH tai thoi diem: ${currentTime}`);
        }

        log.push('___________________________________________________');
    }

    log.push('=== KET THUC LAP LICH ===');

    return {
        log: log,
        completion: Completion,
        burstTimes: burstTimes,
        currentTime: currentTime
    };
}

// ===================================== 
//   Display Execution Log
// ===================================== 

function displayExecutionLog(log) {
    elements.executionLog.innerHTML = '';
    
    log.forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'log-line';
        
        // Highlight specific patterns
        let displayLine = line;
        if (line.includes('HOAN THANH')) {
            lineDiv.innerHTML = `<span class="log-highlight">${line}</span>`;
        } else {
            lineDiv.textContent = line;
        }
        
        elements.executionLog.appendChild(lineDiv);
    });

    // Auto-scroll to bottom
    elements.executionLog.scrollTop = elements.executionLog.scrollHeight;
}

// ===================================== 
//   Display Results (matching C++ output format)
// ===================================== 

// ===================================== 
//  Display Results (FIXED FOR ALIGNMENT)
// ===================================== 
function displayResults(completion, burstTimes, n) {
    // 1. Xóa kết quả cũ
    elements.resultsBody.innerHTML = '';

    // 2. Tính toán số liệu (giữ nguyên logic của bạn)
    const results = [];
    for (let i = 1; i <= n; i++) {
        const ct = completion[i];
        const bt = burstTimes[i];
        const tat = ct; 
        const wt = tat - bt;

        results.push({ p: i, bt: bt, ct: ct, tat: tat, wt: wt });
    }

    // 3. Đổ dữ liệu vào bảng - THAY THẾ ĐOẠN NÀY
    results.forEach(r => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'result-row';
        
        // QUAN TRỌNG: Bọc từng giá trị vào thẻ <span> để CSS Grid nhận diện từng cột
        rowDiv.innerHTML = `
            <span>P[${r.p}]</span>
            <span>${r.bt}</span>
            <span>${r.ct}</span>
            <span>${r.tat}</span>
            <span>${r.wt}</span>
        `;
        
        if (elements.resultsBody) elements.resultsBody.appendChild(rowDiv);
    });

    // 4. Tính và hiển thị trung bình (giữ nguyên logic)
    const avgTAT = results.reduce((sum, r) => sum + r.tat, 0) / n;
    const avgWT = results.reduce((sum, r) => sum + r.wt, 0) / n;

    if (elements.avgTAT) elements.avgTAT.textContent = avgTAT.toFixed(2);
    if (elements.avgWT) elements.avgWT.textContent = avgWT.toFixed(2);
}
// ===================================== 
//   HANDLER: Reset Application
// ===================================== 

function handleReset() {
    // Clear state
    appState = {
        quantum: 0,
        processCount: 0,
        burstTimes: [],
    };

    // Reset inputs
    if (elements.quantumInput) elements.quantumInput.value = '4';
    if (elements.processCountInput) elements.processCountInput.value = '3';

    // Hide sections
    if (elements.processInputSection) elements.processInputSection.style.display = 'none';
    if (elements.executionSection) elements.executionSection.style.display = 'none';
    if (elements.resultsSection) elements.resultsSection.style.display = 'none';

    // Clear messages
    clearStatus();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================== 
//   UI Utility Functions
// ===================================== 

function showStatus(message, type = 'info') {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message show ${type}`;
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(clearStatus, 5000);
    }
}

function clearStatus() {
    elements.statusMessage.textContent = '';
    elements.statusMessage.className = 'status-message';
}

// ===================================== 
//   END OF SCRIPT
// ===================================== 
