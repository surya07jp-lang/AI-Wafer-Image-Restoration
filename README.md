\# WAFERAI — AI-Based Wafer Image Restoration



<p align="center">



\*\*AI-powered super-resolution and restoration for semiconductor wafer inspection\*\*



</p>



\---



\## 🧠 Overview



\*\*WAFERAI\*\* is an AI-based wafer image restoration system designed to reconstruct high-resolution wafer images from noisy and low-resolution inputs.



The system uses a lightweight \*\*CNN-based deep learning model\*\* to transform:



\*\*128 × 128 noisy wafer image → 256 × 256 restored wafer image\*\*



The goal is to improve the visual quality and structural information of wafer images while preserving important defect patterns.



\---



\# 🎯 Problem



Semiconductor wafer inspection systems can produce images affected by:



\- Sensor noise

\- Low spatial resolution

\- Imaging limitations

\- Missing fine structural details

\- Degraded defect patterns



Traditional interpolation methods such as \*\*bicubic upscaling\*\* increase image size but cannot intelligently reconstruct missing information.



This creates a challenge when subtle wafer defect patterns need to be analyzed.



\---



\# 💡 Our Solution



WAFERAI uses a trained convolutional neural network to learn the relationship between:



```text

Noisy / Low Resolution Wafer

&#x20;           ↓

&#x20;      AI Restoration

&#x20;           ↓

High Resolution Wafer

