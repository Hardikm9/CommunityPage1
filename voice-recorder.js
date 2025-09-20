// Advanced Voice Recording System for Community Hub
class VoiceRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.audioStream = null;
    this.recordings = [];
    this.currentRecordingId = null;
    this.maxDuration = 300000; // 5 minutes max
    this.recordingTimer = null;
    this.visualizer = null;
    
    this.init();
  }
  
  async init() {
    this.checkBrowserSupport();
    this.injectStyles();
    this.setupGlobalRecorder();
    console.log('🎤 Voice Recording System initialized');
  }
  
  checkBrowserSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Voice recording not supported in this browser');
      return false;
    }
    
    if (!window.MediaRecorder) {
      console.warn('MediaRecorder not supported in this browser');
      return false;
    }
    
    return true;
  }
  
  setupGlobalRecorder() {
    // Add voice recording buttons to forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const textareas = form.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        this.addVoiceRecorderToTextarea(textarea);
      });
    });
  }
  
  addVoiceRecorderToTextarea(textarea) {
    if (textarea.dataset.voiceRecorderAdded) return;
    
    const container = document.createElement('div');
    container.className = 'voice-recorder-container';
    
    const recorder = document.createElement('div');
    recorder.className = 'voice-recorder';
    recorder.innerHTML = `
      <div class="voice-recorder-controls">
        <button type="button" class="voice-record-btn" title="Record voice description">
          <span class="record-icon">🎤</span>
          <span class="record-text">Record</span>
        </button>
        <div class="recording-status" style="display: none;">
          <div class="recording-indicator">
            <div class="pulse"></div>
          </div>
          <span class="recording-time">00:00</span>
          <button type="button" class="stop-record-btn" title="Stop recording">
            <span class="stop-icon">⏹️</span>
          </button>
        </div>
        <div class="voice-visualizer" style="display: none;">
          <canvas class="audio-visualizer" width="200" height="40"></canvas>
        </div>
      </div>
      <div class="recorded-items"></div>
    `;
    
    // Insert after textarea
    textarea.parentNode.insertBefore(container, textarea.nextSibling);
    container.appendChild(recorder);
    
    this.setupRecorderEvents(recorder, textarea);
    textarea.dataset.voiceRecorderAdded = 'true';
  }
  
  setupRecorderEvents(recorder, textarea) {
    const recordBtn = recorder.querySelector('.voice-record-btn');
    const stopBtn = recorder.querySelector('.stop-record-btn');
    const status = recorder.querySelector('.recording-status');
    const visualizerContainer = recorder.querySelector('.voice-visualizer');
    const canvas = recorder.querySelector('.audio-visualizer');
    
    recordBtn.addEventListener('click', () => this.startRecording(recorder, textarea));
    stopBtn.addEventListener('click', () => this.stopRecording(recorder, textarea));
    
    // Setup visualizer
    this.setupVisualizer(canvas);
  }
  
  async startRecording(recorderEl, textarea) {
    try {
      // Request microphone permission
      this.audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Setup MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: this.getSupportedMimeType()
      });
      
      this.audioChunks = [];
      this.currentRecordingId = Date.now();
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        this.processRecording(recorderEl, textarea);
      };
      
      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
      
      // Update UI
      this.updateRecordingUI(recorderEl, true);
      this.startTimer(recorderEl);
      this.startVisualizer(recorderEl);
      
      // Auto-stop after max duration
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording(recorderEl, textarea);
        }
      }, this.maxDuration);
      
      // Show success notification
      if (window.notifications) {
        window.notifications.info('🎤 Recording started. Speak clearly into your microphone.');
      }
      
    } catch (error) {
      console.error('Error starting recording:', error);
      this.handleRecordingError(error);
    }
  }
  
  stopRecording(recorderEl, textarea) {
    if (!this.isRecording) return;
    
    this.isRecording = false;
    this.mediaRecorder.stop();
    this.audioStream.getTracks().forEach(track => track.stop());
    
    this.updateRecordingUI(recorderEl, false);
    this.stopTimer();
    this.stopVisualizer();
    
    if (window.notifications) {
      window.notifications.success('🎤 Recording completed. Processing audio...');
    }
  }
  
  processRecording(recorderEl, textarea) {
    const audioBlob = new Blob(this.audioChunks, { 
      type: this.getSupportedMimeType() 
    });
    
    const recording = {
      id: this.currentRecordingId,
      blob: audioBlob,
      url: URL.createObjectURL(audioBlob),
      timestamp: new Date(),
      duration: this.getRecordingDuration(),
      size: audioBlob.size,
      transcription: null
    };
    
    this.recordings.push(recording);
    this.addRecordingToUI(recorderEl, recording, textarea);
    
    // Try to transcribe (if Web Speech API is available)
    this.attemptTranscription(recording, textarea);
    
    if (window.notifications) {
      window.notifications.success('🎤 Recording saved! You can play it back or transcribe it to text.');
    }
  }
  
  addRecordingToUI(recorderEl, recording, textarea) {
    const recordedItems = recorderEl.querySelector('.recorded-items');
    
    const item = document.createElement('div');
    item.className = 'recorded-item';
    item.setAttribute('data-recording-id', recording.id);
    
    item.innerHTML = `
      <div class="recording-info">
        <div class="recording-header">
          <span class="recording-title">🎤 Voice Note</span>
          <span class="recording-duration">${this.formatDuration(recording.duration)}</span>
          <span class="recording-size">${this.formatFileSize(recording.size)}</span>
        </div>
        <div class="recording-controls">
          <button class="play-btn" title="Play recording">
            <span class="play-icon">▶️</span>
          </button>
          <button class="transcribe-btn" title="Convert to text">
            <span class="transcribe-icon">📝</span>
          </button>
          <button class="download-btn" title="Download recording">
            <span class="download-icon">💾</span>
          </button>
          <button class="delete-btn" title="Delete recording">
            <span class="delete-icon">🗑️</span>
          </button>
        </div>
        <div class="transcription-area" style="display: none;">
          <textarea class="transcription-text" placeholder="Transcription will appear here..."></textarea>
          <div class="transcription-actions">
            <button class="insert-transcription">Insert to Description</button>
            <button class="append-transcription">Append to Description</button>
          </div>
        </div>
      </div>
      <audio class="recording-player" style="display: none;">
        <source src="${recording.url}" type="${this.getSupportedMimeType()}">
      </audio>
    `;
    
    recordedItems.appendChild(item);
    this.setupRecordingItemEvents(item, recording, textarea);
  }
  
  setupRecordingItemEvents(item, recording, textarea) {
    const playBtn = item.querySelector('.play-btn');
    const transcribeBtn = item.querySelector('.transcribe-btn');
    const downloadBtn = item.querySelector('.download-btn');
    const deleteBtn = item.querySelector('.delete-btn');
    const audio = item.querySelector('.recording-player');
    const transcriptionArea = item.querySelector('.transcription-area');
    const transcriptionText = item.querySelector('.transcription-text');
    const insertBtn = item.querySelector('.insert-transcription');
    const appendBtn = item.querySelector('.append-transcription');
    
    // Play/Pause functionality
    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        // Stop all other audio first
        document.querySelectorAll('.recording-player').forEach(a => a.pause());
        document.querySelectorAll('.play-icon').forEach(i => i.textContent = '▶️');
        
        audio.play();
        playBtn.querySelector('.play-icon').textContent = '⏸️';
      } else {
        audio.pause();
        playBtn.querySelector('.play-icon').textContent = '▶️';
      }
    });
    
    audio.addEventListener('ended', () => {
      playBtn.querySelector('.play-icon').textContent = '▶️';
    });
    
    // Transcribe functionality
    transcribeBtn.addEventListener('click', () => {
      if (transcriptionArea.style.display === 'none') {
        transcriptionArea.style.display = 'block';
        this.startTranscription(recording, transcriptionText);
      } else {
        transcriptionArea.style.display = 'none';
      }
    });
    
    // Insert/Append transcription
    insertBtn.addEventListener('click', () => {
      const text = transcriptionText.value.trim();
      if (text) {
        textarea.value = text;
        if (window.notifications) {
          window.notifications.success('Text inserted into description');
        }
      }
    });
    
    appendBtn.addEventListener('click', () => {
      const text = transcriptionText.value.trim();
      if (text) {
        textarea.value += (textarea.value ? '\n\n' : '') + text;
        if (window.notifications) {
          window.notifications.success('Text appended to description');
        }
      }
    });
    
    // Download functionality
    downloadBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = recording.url;
      link.download = `voice-note-${recording.timestamp.toISOString().split('T')[0]}.webm`;
      link.click();
    });
    
    // Delete functionality
    deleteBtn.addEventListener('click', () => {
      if (confirm('Delete this voice recording?')) {
        URL.revokeObjectURL(recording.url);
        this.recordings = this.recordings.filter(r => r.id !== recording.id);
        item.remove();
        
        if (window.notifications) {
          window.notifications.success('Voice recording deleted');
        }
      }
    });
  }
  
  startTranscription(recording, textArea) {
    textArea.value = 'Transcribing audio... Please wait.';
    textArea.disabled = true;
    
    // Check if Web Speech API is available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      this.transcribeWithWebSpeech(recording, textArea);
    } else {
      // Fallback: Manual transcription prompt
      textArea.value = 'Automatic transcription not available. Please type your transcription here.';
      textArea.disabled = false;
      textArea.focus();
    }
  }
  
  transcribeWithWebSpeech(recording, textArea) {
    // Note: This is a simplified implementation
    // Web Speech API typically works with live audio, not recorded files
    // For full transcription, you'd need a service like Google Cloud Speech-to-Text
    
    textArea.value = 'Web Speech API transcription is limited to live speech. Please use manual transcription or integrate with a cloud service like Google Cloud Speech-to-Text for better results.';
    textArea.disabled = false;
    textArea.focus();
    textArea.select();
  }
  
  updateRecordingUI(recorderEl, isRecording) {
    const recordBtn = recorderEl.querySelector('.voice-record-btn');
    const status = recorderEl.querySelector('.recording-status');
    const visualizer = recorderEl.querySelector('.voice-visualizer');
    
    if (isRecording) {
      recordBtn.style.display = 'none';
      status.style.display = 'flex';
      visualizer.style.display = 'block';
    } else {
      recordBtn.style.display = 'flex';
      status.style.display = 'none';
      visualizer.style.display = 'none';
    }
  }
  
  startTimer(recorderEl) {
    const timeDisplay = recorderEl.querySelector('.recording-time');
    let seconds = 0;
    
    this.recordingTimer = setInterval(() => {
      seconds++;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      timeDisplay.textContent = 
        `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, 1000);
  }
  
  stopTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  }
  
  setupVisualizer(canvas) {
    this.visualizer = {
      canvas,
      ctx: canvas.getContext('2d'),
      analyser: null,
      dataArray: null,
      animationId: null
    };
  }
  
  startVisualizer(recorderEl) {
    if (!this.audioStream) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(this.audioStream);
    
    microphone.connect(analyser);
    analyser.fftSize = 256;
    
    this.visualizer.analyser = analyser;
    this.visualizer.dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    this.drawVisualizer();
  }
  
  drawVisualizer() {
    if (!this.isRecording || !this.visualizer.analyser) return;
    
    const { canvas, ctx, analyser, dataArray } = this.visualizer;
    
    analyser.getByteFrequencyData(dataArray);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height;
      
      ctx.fillStyle = `hsl(${i * 2}, 100%, 50%)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
    
    this.visualizer.animationId = requestAnimationFrame(() => this.drawVisualizer());
  }
  
  stopVisualizer() {
    if (this.visualizer.animationId) {
      cancelAnimationFrame(this.visualizer.animationId);
      this.visualizer.animationId = null;
    }
  }
  
  getSupportedMimeType() {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4'];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
  }
  
  getRecordingDuration() {
    // This is approximate - for exact duration, you'd need to analyze the audio blob
    const timeDisplay = document.querySelector('.recording-time');
    return timeDisplay ? timeDisplay.textContent : '00:00';
  }
  
  formatDuration(duration) {
    if (typeof duration === 'string') return duration;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
  
  handleRecordingError(error) {
    let message = 'Failed to start recording';
    
    if (error.name === 'NotAllowedError') {
      message = 'Microphone access denied. Please allow microphone permissions.';
    } else if (error.name === 'NotFoundError') {
      message = 'No microphone found. Please connect a microphone.';
    } else if (error.name === 'NotSupportedError') {
      message = 'Voice recording not supported in this browser.';
    }
    
    if (window.notifications) {
      window.notifications.error(message);
    } else {
      alert(message);
    }
  }
  
  injectStyles() {
    if (document.getElementById('voice-recorder-styles')) return;
    
    const styles = `
      <style id="voice-recorder-styles">
        .voice-recorder-container {
          margin-top: 0.75rem;
        }
        
        .voice-recorder {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius, 8px);
          padding: 1rem;
          margin-bottom: 1rem;
        }
        
        .voice-recorder-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .voice-record-btn {
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius, 6px);
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .voice-record-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }
        
        .recording-status {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #fee2e2;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: var(--radius, 6px);
          font-weight: 500;
        }
        
        .recording-indicator {
          position: relative;
          width: 12px;
          height: 12px;
        }
        
        .pulse {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #dc2626;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        
        .stop-record-btn {
          background: #dc2626;
          color: white;
          border: none;
          border-radius: var(--radius, 6px);
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .stop-record-btn:hover {
          background: #b91c1c;
        }
        
        .voice-visualizer {
          flex: 1;
          max-width: 200px;
        }
        
        .audio-visualizer {
          width: 100%;
          height: 40px;
          border: 1px solid var(--border);
          border-radius: var(--radius, 4px);
          background: #000;
        }
        
        .recorded-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .recorded-item {
          background: var(--surface-dark);
          border: 1px solid var(--border-light);
          border-radius: var(--radius, 6px);
          padding: 1rem;
        }
        
        .recording-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        
        .recording-title {
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .recording-duration,
        .recording-size {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .recording-controls {
          display: flex;
          gap: 0.5rem;
        }
        
        .recording-controls button {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius, 4px);
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
        }
        
        .recording-controls button:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        
        .transcription-area {
          margin-top: 1rem;
          padding: 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius, 4px);
        }
        
        .transcription-text {
          width: 100%;
          min-height: 100px;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: var(--radius, 4px);
          font-family: inherit;
          font-size: 0.9rem;
          resize: vertical;
        }
        
        .transcription-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        
        .transcription-actions button {
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius, 4px);
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .transcription-actions button:hover {
          background: var(--primary-dark);
        }
        
        @media (max-width: 768px) {
          .voice-recorder-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .recording-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .recording-controls {
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .transcription-actions {
            flex-direction: column;
          }
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }
  
  // Public API
  getAllRecordings() {
    return this.recordings;
  }
  
  getRecording(id) {
    return this.recordings.find(r => r.id === id);
  }
  
  deleteRecording(id) {
    const recording = this.recordings.find(r => r.id === id);
    if (recording) {
      URL.revokeObjectURL(recording.url);
      this.recordings = this.recordings.filter(r => r.id !== id);
      
      const item = document.querySelector(`[data-recording-id="${id}"]`);
      if (item) item.remove();
      
      return true;
    }
    return false;
  }
  
  clearAllRecordings() {
    this.recordings.forEach(r => URL.revokeObjectURL(r.url));
    this.recordings = [];
    document.querySelectorAll('.recorded-item').forEach(item => item.remove());
  }
}

// Initialize voice recorder when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.voiceRecorder = new VoiceRecorder();
  });
} else {
  window.voiceRecorder = new VoiceRecorder();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceRecorder;
}