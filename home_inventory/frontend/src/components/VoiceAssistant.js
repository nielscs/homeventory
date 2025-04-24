import React, { useState, useRef } from "react";
import axios from "axios";
import { IconButton, CircularProgress, Snackbar, Alert } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";

function VoiceAssistant({ onNewItemsAdded }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const mediaRecorderRef = useRef(null); // ✅ Store MediaRecorder instance
  let audioChunks = [];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder; // ✅ Save recorder instance

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); // ✅ Stop recording correctly
      setIsRecording(false);
    } else {
      console.error("MediaRecorder is undefined.");
    }
  };

  const submitAudio = async () => {
    if (!audioBlob) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append("audio", audioBlob);

    try {
      const response = await axios.post("http://localhost:8000/api/voice-add-item/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSnackbarMessage("Items added successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      onNewItemsAdded(response.data);
    } catch (error) {
      console.error("Error adding items:", error);
      setSnackbarMessage("Failed to process voice input.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }

    setLoading(false);
  };

  return (
    <>
      {/* ✅ Voice Assistant Button in Navbar */}
      <IconButton color="inherit" onClick={isRecording ? stopRecording : startRecording}>
        {loading ? <CircularProgress size={24} /> : <MicIcon />}
      </IconButton>

      {/* ✅ Snackbar Notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
      </Snackbar>
    </>
  );
}

export default VoiceAssistant;
