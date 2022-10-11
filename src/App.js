import React, { useEffect, useState, useRef } from "react";
import logo from './logo.svg';
import './App.css';

import * as tf from '@tensorflow/tfjs';
import * as posenet from "@tensorflow-models/posenet";
import '@tensorflow/tfjs-backend-webgl';
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities";

import {
  Grid
} from '@material-ui/core'

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const poseEstimationLoop = useRef(null);
  const [isPoseEstimation, setIsPoseEstimation] = useState(false)

  useEffect(() => {
    loadPosenet();
  }, [])

  const loadPosenet = async () => {
    let loadedModel = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: 800, height: 600 },
      multiplier: 0.75
    });

    setModel(loadedModel)
    console.log("Posenet Model Loaded..")
  };

  const startPoseEstimation = () => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Run pose estimation each 100 milliseconds
      poseEstimationLoop.current = setInterval(() => {
        // Get Video Properties
        const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        // Set video width
        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        // Do pose estimation
        var tic = new Date().getTime()
        model.estimateSinglePose(video, {
          flipHorizontal: false
        }).then(pose => {
          var toc = new Date().getTime();
          console.log(toc - tic, " ms");
          console.log(tf.getBackend());
          console.log(pose);

          drawCanvas(pose, videoWidth, videoHeight, canvasRef);
        });
      }, 100);
    }
  };

  const drawCanvas = (pose, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    drawKeypoints(pose["keypoints"], 0.5, ctx);
    drawSkeleton(pose["keypoints"], 0.5, ctx);
  };

  const stopPoseEstimation = () => clearInterval(poseEstimationLoop.current);

  const handlePoseEstimation = () => {
    if (isPoseEstimation)
      stopPoseEstimation();
    else
      startPoseEstimation();

    setIsPoseEstimation(current => !current)
  };

  return (
    <div className="App">
        {/*
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 800,
            height: 600,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 800,
            height: 600,
          }}
        />
        */}
        <Grid container spacing={3}>
            <Grid item xs={12}>
            </Grid>
        </Grid>
        <Grid container spacing={3}>
            <Grid item xs={12}>
            </Grid>
        </Grid>

    </div>
  );
}

export default App;
