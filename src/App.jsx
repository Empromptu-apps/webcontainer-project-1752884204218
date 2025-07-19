import React, { useState, useEffect, useRef } from 'react';

const AsAManThinksApp = () => {
  // State management
  const [currentState, setCurrentState] = useState(null);
  const [stateHistory, setStateHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [musicTrack, setMusicTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chaosFlag, setChaosFlag] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [apiLogs, setApiLogs] = useState([]);
  const [createdObjects, setCreatedObjects] = useState([]);
  const [showApiDebug, setShowApiDebug] = useState(false);
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const textInputRef = useRef(null);

  // 7 Bodies/States Configuration
  const sevenStates = {
    physical: { color: '#FF0000', note: 'C', name: 'Physical', description: 'Body, survival', icon: '⚫' },
    etheric: { color: '#FF7F00', note: 'D', name: 'Etheric', description: 'Energy, vitality', icon: '🌀' },
    astral: { color: '#FFFF00', note: 'E', name: 'Astral', description: 'Emotions, dreams', icon: '⭐' },
    mental: { color: '#00FF00', note: 'F', name: 'Mental', description: 'Logic, thinking', icon: '▲' },
    causal: { color: '#0000FF', note: 'G', name: 'Causal', description: 'Life patterns, meaning', icon: '🪐' },
    buddhic: { color: '#4B0082', note: 'A', name: 'Buddhic', description: 'Intuition, connection', icon: '👁️' },
    atmic: { color: '#9400D3', note: 'B', name: 'Atmic', description: 'Transcendence, unity', icon: '∞' }
  };

  // API Headers
  const apiHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer c6303bcc8941b627ba1b32398f9cf214',
    'X-Generated-App-ID': '2efa8c07-cddc-45b1-b210-7db1542413c6',
    'X-Usage-Key': '75582975e7a6c43504f1962005902a95'
  };

  // API Logging Function
  const logApiCall = (endpoint, method, payload, response) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      payload,
      response,
      id: Date.now()
    };
    setApiLogs(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 logs
  };

  // MaiiaM Algorithm - State Detection
  const detectEmotionalState = async (input) => {
    setIsLoading(true);
    try {
      const objectName = `user_input_${Date.now()}`;
      
      // Step 1: Store user input
      const inputPayload = {
        created_object_name: objectName,
        data_type: 'strings',
        input_data: [input]
      };
      
      const inputResponse = await fetch('https://builder.empromptu.ai/api_tools/input_data', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(inputPayload)
      });
      
      logApiCall('/input_data', 'POST', inputPayload, await inputResponse.text());
      setCreatedObjects(prev => [...prev, objectName]);

      // Step 2: Analyze emotional state using MaiiaM algorithm
      const analysisObjectName = `emotional_analysis_${Date.now()}`;
      const promptPayload = {
        created_object_names: [analysisObjectName],
        prompt_string: `Analyze this user input using the 7 Bodies/States framework: {${objectName}}
        
        Classify into one of these states:
        - physical: Body-focused, survival, health concerns
        - etheric: Energy levels, vitality, life force
        - astral: Emotions, feelings, dreams, desires
        - mental: Logic, thinking, problem-solving
        - causal: Life patterns, meaning, karma
        - buddhic: Intuition, spiritual connection
        - atmic: Transcendence, unity, peace
        
        Return JSON format:
        {
          "primary_state": "state_name",
          "intensity": 1-10,
          "secondary_states": ["state1", "state2"],
          "chaos_detected": true/false,
          "opposite_action": "suggested intervention",
          "music_prompt": "description for AI music generation"
        }`,
        inputs: [{
          input_object_name: objectName,
          mode: 'combine_events'
        }]
      };

      const promptResponse = await fetch('https://builder.empromptu.ai/api_tools/apply_prompt', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(promptPayload)
      });

      logApiCall('/apply_prompt', 'POST', promptPayload, await promptResponse.text());
      setCreatedObjects(prev => [...prev, analysisObjectName]);

      // Step 3: Retrieve analysis results
      const returnPayload = {
        object_name: analysisObjectName,
        return_type: 'json'
      };

      const analysisResult = await fetch('https://builder.empromptu.ai/api_tools/return_data', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(returnPayload)
      });

      const analysisData = await analysisResult.json();
      logApiCall('/return_data', 'POST', returnPayload, analysisData);

      let stateData;
      try {
        stateData = JSON.parse(analysisData.value);
      } catch (e) {
        // Fallback if JSON parsing fails
        stateData = {
          primary_state: 'mental',
          intensity: 5,
          secondary_states: [],
          chaos_detected: false,
          opposite_action: 'Take a moment to breathe and reflect',
          music_prompt: 'Calming ambient music for mental clarity'
        };
      }
      
      setCurrentState(stateData);
      setStateHistory(prev => [...prev, stateData]);
      setChaosFlag(stateData.chaos_detected);
      
      return stateData;
    } catch (error) {
      console.error('Error detecting emotional state:', error);
      logApiCall('ERROR', 'detectEmotionalState', { input }, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate AI Music based on emotional state
  const generateMusic = async (stateData) => {
    if (!stateData) return;
    
    setIsLoading(true);
    try {
      const musicObjectName = `music_generation_${Date.now()}`;
      const musicPayload = {
        created_object_names: [musicObjectName],
        prompt_string: `Create a detailed music generation prompt for AI music services based on this emotional state analysis:
        
        State: ${stateData.primary_state}
        Intensity: ${stateData.intensity}/10
        Music Prompt: ${stateData.music_prompt}
        
        Generate a specific prompt for Mureka AI that includes:
        - Musical style and genre
        - Tempo and rhythm
        - Instruments and sounds
        - Emotional tone and energy
        - Duration (3-5 minutes)
        
        Format as a single detailed prompt string.`,
        inputs: []
      };

      const musicResponse = await fetch('https://builder.empromptu.ai/api_tools/apply_prompt', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(musicPayload)
      });

      logApiCall('/apply_prompt', 'POST', musicPayload, await musicResponse.text());
      setCreatedObjects(prev => [...prev, musicObjectName]);

      const musicReturnPayload = {
        object_name: musicObjectName,
        return_type: 'pretty_text'
      };

      const musicPrompt = await fetch('https://builder.empromptu.ai/api_tools/return_data', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(musicReturnPayload)
      });

      const promptData = await musicPrompt.json();
      logApiCall('/return_data', 'POST', musicReturnPayload, promptData);

      setMusicTrack({ prompt: promptData.value, state: stateData.primary_state });
      
    } catch (error) {
      console.error('Error generating music:', error);
      logApiCall('ERROR', 'generateMusic', { stateData }, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Audio = reader.result.split(',')[1];
          await processVoiceInput(base64Audio);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioData) => {
    try {
      const voiceObjectName = `voice_recording_${Date.now()}`;
      
      // Store audio for transcription
      const voicePayload = {
        created_object_name: voiceObjectName,
        data_type: 'files',
        input_data: [`data:audio/wav;base64,${audioData}`]
      };

      await fetch('https://builder.empromptu.ai/api_tools/input_data', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(voicePayload)
      });

      logApiCall('/input_data', 'POST', voicePayload, 'Audio uploaded');
      setCreatedObjects(prev => [...prev, voiceObjectName]);

      // Transcribe and analyze
      const transcriptionObjectName = `transcribed_text_${Date.now()}`;
      const transcriptionPayload = {
        created_object_names: [transcriptionObjectName],
        prompt_string: `Transcribe this audio and extract the emotional content: {${voiceObjectName}}`,
        inputs: [{
          input_object_name: voiceObjectName,
          mode: 'use_individually'
        }]
      };

      const transcription = await fetch('https://builder.empromptu.ai/api_tools/apply_prompt', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(transcriptionPayload)
      });

      logApiCall('/apply_prompt', 'POST', transcriptionPayload, await transcription.text());
      setCreatedObjects(prev => [...prev, transcriptionObjectName]);

      const textReturnPayload = {
        object_name: transcriptionObjectName,
        return_type: 'pretty_text'
      };

      const textResult = await fetch('https://builder.empromptu.ai/api_tools/return_data', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(textReturnPayload)
      });

      const transcribedData = await textResult.json();
      logApiCall('/return_data', 'POST', textReturnPayload, transcribedData);

      const transcribedText = transcribedData.value;
      const stateData = await detectEmotionalState(transcribedText);
      
      setJournalEntries(prev => [...prev, {
        id: Date.now(),
        text: transcribedText,
        timestamp: new Date(),
        state: stateData,
        type: 'voice'
      }]);

      if (stateData) {
        await generateMusic(stateData);
      }

    } catch (error) {
      console.error('Error processing voice input:', error);
      logApiCall('ERROR', 'processVoiceInput', { audioData: 'base64...' }, error.message);
    }
  };

  // Delete all created objects
  const deleteAllObjects = async () => {
    for (const objectName of createdObjects) {
      try {
        await fetch(`https://builder.empromptu.ai/api_tools/objects/${objectName}`, {
          method: 'DELETE',
          headers: apiHeaders
        });
        logApiCall(`/objects/${objectName}`, 'DELETE', {}, 'Deleted');
      } catch (error) {
        console.error(`Error deleting ${objectName}:`, error);
      }
    }
    setCreatedObjects([]);
  };

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // UI Components
  const Dashboard = () => (
    <div className={`min-h-screen transition-all duration-500 ${
      currentState ? 'bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800' : 'bg-gray-50 dark:bg-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-700 dark:text-primary-300 mb-4">
            AsAManThinks
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Digital Sanctuary for Self-Awareness</p>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="mt-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        {/* Current State Display */}
        {currentState && (
          <div className="glass-card rounded-2xl p-6 mb-8 border-l-4" 
               style={{ borderLeftColor: sevenStates[currentState.primary_state]?.color }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Current State: {sevenStates[currentState.primary_state]?.name} {sevenStates[currentState.primary_state]?.icon}
              </h3>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-300">Intensity</div>
                <div className="text-2xl font-bold" style={{ color: sevenStates[currentState.primary_state]?.color }}>
                  {currentState.intensity}/10
                </div>
              </div>
            </div>
            
            {chaosFlag && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="text-yellow-600 dark:text-yellow-400 mr-3">⚡</div>
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Rebalancing Suggested</h4>
                    <p className="text-yellow-700 dark:text-yellow-300">{currentState.opposite_action}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button 
            onClick={() => setCurrentView('checkin')}
            className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
            aria-label="Go to mood check-in"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Mood Check-In</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Track your current emotional state</p>
          </button>
          
          <button 
            onClick={() => setCurrentView('journal')}
            className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
            aria-label="Go to voice journal"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎙️</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Voice Journal</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Record and analyze your thoughts</p>
          </button>
          
          <button 
            onClick={() => setCurrentView('music')}
            className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
            aria-label="Go to AI music"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎵</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">AI Music</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Personalized music therapy</p>
          </button>
          
          <button 
            onClick={() => setCurrentView('learning')}
            className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
            aria-label="Go to learning center"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📚</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Learning Center</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Explore the 7 Bodies framework</p>
          </button>
        </div>

        {/* Debug Controls */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setShowApiDebug(!showApiDebug)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            aria-label="Toggle API debug view"
          >
            👁️ {showApiDebug ? 'Hide' : 'Show'} API Debug
          </button>
          
          <button
            onClick={deleteAllObjects}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            aria-label="Delete all API objects"
          >
            🗑️ Delete Objects ({createdObjects.length})
          </button>
        </div>

        {/* API Debug Panel */}
        {showApiDebug && (
          <div className="mt-8 glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">API Debug Log</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {apiLogs.map(log => (
                <div key={log.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-blue-600 dark:text-blue-400">{log.method} {log.endpoint}</span>
                    <span className="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <details className="cursor-pointer">
                    <summary className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                      View Details
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <strong>Payload:</strong>
                        <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <strong>Response:</strong>
                        <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto">
                          {typeof log.response === 'string' ? log.response : JSON.stringify(log.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const MoodCheckin = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">How are you feeling right now?</h2>
          <p className="text-gray-600 dark:text-gray-300">Select your current state or describe it in detail</p>
        </div>
        
        {/* State Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(sevenStates).map(([key, state]) => (
            <button
              key={key}
              onClick={async () => {
                const stateData = await detectEmotionalState(`I'm feeling ${state.name.toLowerCase()} - ${state.description}`);
                if (stateData) await generateMusic(stateData);
              }}
              className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group text-left"
              style={{ 
                background: `linear-gradient(135deg, ${state.color}10, ${state.color}20)`,
                borderLeft: `4px solid ${state.color}`
              }}
              aria-label={`Select ${state.name} state`}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{state.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{state.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{state.description}</p>
              <div className="text-xs text-gray-500 dark:text-gray-400">Note: {state.note}</div>
            </button>
          ))}
        </div>
        
        {/* Text Input for Detailed Description */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Describe your feelings in detail</h3>
          <textarea
            ref={textInputRef}
            placeholder="Tell me more about how you're feeling right now... What's on your mind? What emotions are you experiencing?"
            className="w-full h-32 p-4 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            aria-label="Describe your current feelings"
          />
          <button
            onClick={async () => {
              const text = textInputRef.current?.value;
              if (text?.trim()) {
                const stateData = await detectEmotionalState(text);
                if (stateData) await generateMusic(stateData);
                textInputRef.current.value = '';
              }
            }}
            className="mt-4 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium"
            aria-label="Analyze my feelings"
          >
            Analyze My Feelings
          </button>
        </div>
        
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl transition-colors"
          aria-label="Back to dashboard"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );

  const VoiceJournal = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Voice Journal</h2>
          <p className="text-gray-600 dark:text-gray-300">Record your thoughts and let AI analyze your emotional patterns</p>
        </div>
        
        {/* Recording Interface */}
        <div className="glass-card rounded-2xl p-8 text-center mb-8">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-300 transform hover:scale-105 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? '⏹️' : '🎙️'}
          </button>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {isRecording ? 'Recording...' : 'Ready to Record'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {isRecording 
                ? 'Speak your thoughts freely. Click to stop when finished.' 
                : 'Click the microphone to start recording your journal entry'
              }
            </p>
          </div>
          
          {isRecording && (
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-8 bg-red-400 rounded animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Journal Entries */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Entries</h3>
          
          {journalEntries.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-600 dark:text-gray-300">No journal entries yet. Start recording to begin your journey!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {journalEntries.slice(-5).reverse().map(entry => (
                <div 
                  key={entry.id} 
                  className="glass-card rounded-2xl p-6"
                  style={entry.state ? {
                    borderLeft: `4px solid ${sevenStates[entry.state.primary_state]?.color}`
                  } : {}}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{entry.type === 'voice' ? '🎙️' : '✍️'}</span>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {entry.timestamp.toLocaleString()}
                        </div>
                        {entry.state && (
                          <div className="text-sm font-medium" style={{ color: sevenStates[entry.state.primary_state]?.color }}>
                            {sevenStates[entry.state.primary_state]?.name} State ({entry.state.intensity}/10)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-800 dark:text-white leading-relaxed">{entry.text}</p>
                  
                  {entry.state?.opposite_action && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Suggested Action:</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">{entry.state.opposite_action}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl transition-colors"
            aria-label="Back to dashboard"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const MusicPlayer = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">AI-Generated Music Therapy</h2>
          <p className="text-gray-600 dark:text-gray-300">Personalized soundtracks based on your emotional state</p>
        </div>
        
        {musicTrack ? (
          <div className="glass-card rounded-2xl p-8 text-center"
               style={{
                 background: `linear-gradient(135deg, ${sevenStates[musicTrack.state]?.color}10, ${sevenStates[musicTrack.state]?.color}20)`
               }}>
            <div className="mb-6">
              <div className="text-6xl mb-4">{sevenStates[musicTrack.state]?.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Custom Track for {sevenStates[musicTrack.state]?.name} State
              </h3>
              <div className="text-lg font-medium" style={{ color: sevenStates[musicTrack.state]?.color }}>
                Musical Note: {sevenStates[musicTrack.state]?.note}
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Generated Music Prompt:</h4>
              <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">{musicTrack.prompt}</p>
            </div>
            
            {/* Vinyl Record Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 animate-spin flex items-center justify-center"
                     style={{ animation: 'spin 3s linear infinite' }}>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-gray-600 opacity-30"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                🎼 This music is specifically generated to support your current emotional state
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-medium">
                  🎵 Generate with Mureka AI
                </button>
                
                <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium">
                  📥 Download Prompt
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="text-6xl mb-6">🎵</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">No Music Generated Yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Complete a mood check-in or journal entry to generate personalized music
            </p>
            <button 
              onClick={() => setCurrentView('checkin')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium"
            >
              Start Mood Check-In
            </button>
          </div>
        )}
        
        <div className="mt-8">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl transition-colors"
            aria-label="Back to dashboard"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const LearningCenter = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Learning Center</h2>
          <p className="text-gray-600 dark:text-gray-300">Explore the 7 Bodies/States framework and your personal insights</p>
        </div>
        
        {/* 7 Bodies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {Object.entries(sevenStates).map(([key, state]) => (
            <div 
              key={key} 
              className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              style={{
                background: `linear-gradient(135deg, ${state.color}08, ${state.color}15)`,
                borderTop: `4px solid ${state.color}`
              }}
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">{state.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{state.name} Body</h3>
                <div className="text-sm font-medium" style={{ color: state.color }}>
                  Note: {state.note}
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 text-center">
                {state.description}
              </p>
              
              <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <div>Color: <span style={{ color: state.color }}>{state.color}</span></div>
                <div>Frequency: {state.note} Major</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Personal Insights */}
        <div className="glass-card rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Your Personal Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {stateHistory.length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Total Check-ins</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {journalEntries.length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Journal Entries</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {musicTrack ? '1' : '0'}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Music Tracks Generated</div>
            </div>
          </div>
          
          {stateHistory.length > 0 && (
            <div className="mt-8 p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Recent State Pattern</h4>
              <div className="flex flex-wrap gap-2">
                {stateHistory.slice(-10).map((state, index) => (
                  <div 
                    key={index}
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: sevenStates[state.primary_state]?.color }}
                  >
                    {sevenStates[state.primary_state]?.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl transition-colors"
            aria-label="Back to dashboard"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  // Loading overlay
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
          <div className="text-2xl mb-2">🧠</div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Processing with MaiiaM Algorithm...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="font-sans">
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'checkin' && <MoodCheckin />}
      {currentView === 'journal' && <VoiceJournal />}
      {currentView === 'music' && <MusicPlayer />}
      {currentView === 'learning' && <LearningCenter />}
    </div>
  );
};

export default AsAManThinksApp;
