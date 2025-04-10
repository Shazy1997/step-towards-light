#!/bin/bash

# Check if Ollama is running
if ! curl -s localhost:11434 &>/dev/null; then
    echo "Starting Ollama..."
    ollama serve &>/dev/null &
    sleep 2
fi

# Check if model exists
if ! ollama list | grep -q "llama2:7b-chat"; then
    echo "Downloading Llama 2 model..."
    ollama pull llama2:7b-chat
fi

# Start chat
node scripts/chat.js
