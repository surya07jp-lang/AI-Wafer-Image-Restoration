import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingTime, setProcessingTime] = useState(null);

  const [sliderPosition, setSliderPosition] = useState(50);

  // ============================================================
  // FILE SELECTION
  // ============================================================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    if (result) {
      URL.revokeObjectURL(result);
    }

    const previewURL = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreview(previewURL);
    setResult(null);
    setProcessingTime(null);
    setSliderPosition(50);
  };

  // ============================================================
  // RESTORE IMAGE
  // ============================================================

  const restoreImage = async () => {
    if (!file) {
      alert("Please select a wafer image first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setProcessingTime(null);

    const startTime = performance.now();

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Sending image to backend...");

      const response = await fetch(
        "http://127.0.0.1:8000/restore",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Backend status:", response.status);

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const blob = await response.blob();

      console.log("Blob type:", blob.type);
      console.log("Blob size:", blob.size);

      if (!blob.type.startsWith("image/")) {
        throw new Error("Backend did not return an image.");
      }

      if (blob.size === 0) {
        throw new Error("Backend returned an empty image.");
      }

      const restoredURL = URL.createObjectURL(blob);

      setResult(restoredURL);
      setSliderPosition(50);

      const endTime = performance.now();

      const elapsedTime = (
        (endTime - startTime) /
        1000
      ).toFixed(2);

      setProcessingTime(elapsedTime);

      console.log("Restoration successful");
      console.log("Processing time:", elapsedTime, "seconds");

    } catch (error) {
      console.error("RESTORE ERROR:", error);

      alert(
        "Something went wrong while restoring the image."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SLIDER
  // ============================================================

  const handleSliderChange = (event) => {
    setSliderPosition(Number(event.target.value));
  };

  // ============================================================
  // CURRENT LABEL
  // IMPORTANT:
  // ONLY ONE LABEL IS RENDERED
  // ============================================================

  const showOriginalLabel = sliderPosition < 50;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="app">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className="header">

        <div className="brand">

          <div className="brand-icon">
            W
          </div>

          <div>
            <div className="brand-name">
              WAFER<span>AI</span>
            </div>

            <div className="brand-subtitle">
              INTELLIGENT IMAGE RESTORATION
            </div>
          </div>

        </div>

        <div className="online-status">

          <span className="online-dot"></span>

          AI MODEL ONLINE

        </div>

      </header>


      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="hero">

        <div className="hero-content">

          <div className="hero-badge">
            SEMICON INDIA • AI HACKATHON 2026
          </div>

          <h1>
            Restore the
            <br />
            <span>Invisible.</span>
          </h1>

          <p className="hero-description">

            AI-powered wafer image restoration that
            transforms degraded low-resolution
            semiconductor images into clearer
            high-resolution representations.

          </p>

          <div className="hero-stats">

            <div>
              <strong>2×</strong>
              <span>UPSCALE</span>
            </div>

            <div>
              <strong>128²</strong>
              <span>INPUT</span>
            </div>

            <div>
              <strong>256²</strong>
              <span>OUTPUT</span>
            </div>

            <div>
              <strong>887K</strong>
              <span>PARAMETERS</span>
            </div>

          </div>

        </div>


        {/* ========================================================
            UPLOAD CARD
        ======================================================== */}

        <div className="upload-card">

          <div className="upload-glow"></div>

          <div className="upload-icon">
            ↑
          </div>

          <h2>
            Upload Wafer Image
          </h2>

          <p>
            Drop your degraded wafer image here
          </p>

          <span className="supported">
            PNG • JPG • JPEG
          </span>

          <label className="choose-button">

            SELECT IMAGE

            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              hidden
            />

          </label>

          {file && (

            <div className="selected-file">

              <span className="file-check">
                ✓
              </span>

              <div>

                <strong>
                  {file.name}
                </strong>

                <small>
                  {(file.size / 1024).toFixed(1)} KB
                </small>

              </div>

            </div>

          )}

        </div>

      </section>


      {/* ========================================================
          WORKSPACE
      ======================================================== */}

      {preview && (

        <section className="workspace">

          <div className="workspace-top">

            <div>

              <div className="section-tag">
                ANALYSIS WORKSPACE
              </div>

              <h2>
                Wafer Restoration
              </h2>

              <p>
                Compare the degraded input with the
                AI-generated restoration.
              </p>

            </div>

            <button
              className="restore-button"
              onClick={restoreImage}
              disabled={loading}
            >

              {loading ? (

                <>
                  <span className="spinner"></span>
                  AI PROCESSING...
                </>

              ) : (

                <>
                  RESTORE WITH AI
                  <span>→</span>
                </>

              )}

            </button>

          </div>


          {/* ======================================================
              BEFORE / AFTER SLIDER
          ====================================================== */}

          {result ? (

            <div className="image-card restored-card">

              <div className="image-card-header">

                <div>

                  <span className="image-number">
                    01
                  </span>

                  <div>

                    <span className="image-type">
                      BEFORE / AFTER
                    </span>

                    <h3>
                      Interactive Restoration Comparison
                    </h3>

                  </div>

                </div>

                <span className="resolution ai-resolution">
                  128 × 128 → 256 × 256
                </span>

              </div>


              {/* ==================================================
                  COMPARISON CONTAINER
              ================================================== */}

              <div className="image-container comparison-slider">

                {/* ORIGINAL IMAGE */}

                <img
                  src={preview}
                  alt="Original degraded wafer"
                  className="comparison-original"
                />


                {/* RESTORED IMAGE */}

                <div
                  className="comparison-restored"
                  style={{
                    width: `${sliderPosition}%`,
                  }}
                >

                  <img
                    src={result}
                    alt="AI restored wafer"
                  />

                </div>


                {/* ==================================================
                    ONLY ONE LABEL
                    This is the important fix.
                ================================================== */}

                <div
                  className={
                    showOriginalLabel
                      ? "comparison-label dynamic-original-label"
                      : "comparison-label dynamic-restored-label"
                  }
                >

                  {showOriginalLabel
                    ? "ORIGINAL"
                    : "AI RESTORED"}

                </div>


                {/* ==================================================
                    DIVIDER
                ================================================== */}

                <div
                  className="comparison-divider"
                  style={{
                    left: `${sliderPosition}%`,
                  }}
                >

                  <div className="comparison-handle">
                    ↔
                  </div>

                </div>


                {/* ==================================================
                    RANGE CONTROL
                ================================================== */}

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={handleSliderChange}
                  className="comparison-range"
                  aria-label="Before and after comparison"
                />

              </div>


              {/* ==================================================
                  SLIDER INSTRUCTION
              ================================================== */}

              <div className="slider-instruction">

                <span>↔</span>

                DRAG THE SLIDER TO COMPARE ORIGINAL
                AND AI RESTORED IMAGE

              </div>

            </div>

          ) : (

            /* ======================================================
                WAITING STATE
            ====================================================== */

            <div className="comparison">

              {/* ORIGINAL */}

              <div className="image-card">

                <div className="image-card-header">

                  <div>

                    <span className="image-number">
                      01
                    </span>

                    <div>

                      <span className="image-type">
                        INPUT
                      </span>

                      <h3>
                        Degraded Wafer
                      </h3>

                    </div>

                  </div>

                  <span className="resolution">
                    128 × 128
                  </span>

                </div>


                <div className="image-container original-image-container">

                  <img
                    src={preview}
                    alt="Original wafer"
                  />

                  <div className="image-overlay-label original-waiting-label">
                    ORIGINAL
                  </div>

                </div>

              </div>


              {/* ARROW */}

              <div className="transform-arrow">

                <div className="arrow-line"></div>

                <div className="arrow-head">
                  →
                </div>

                <span>
                  AI TRANSFORMATION
                </span>

              </div>


              {/* WAITING */}

              <div className="image-card restored-card">

                <div className="image-card-header">

                  <div>

                    <span className="image-number">
                      02
                    </span>

                    <div>

                      <span className="image-type ai">
                        AI OUTPUT
                      </span>

                      <h3>
                        Restored Wafer
                      </h3>

                    </div>

                  </div>

                  <span className="resolution ai-resolution">
                    256 × 256
                  </span>

                </div>


                <div className="image-container restored-image-container">

                  <div className="waiting">

                    <div className="ai-symbol">
                      AI
                    </div>

                    <div>
                      WAITING FOR RESTORATION
                    </div>

                    <small>
                      Run the AI model to generate output
                    </small>

                  </div>

                </div>

              </div>

            </div>

          )}


          {/* ========================================================
              RESULTS
          ======================================================== */}

          {result && (

            <div className="results-panel">

              <div className="result-title">

                <span className="success-icon">
                  ✓
                </span>

                <div>

                  <strong>
                    RESTORATION COMPLETE
                  </strong>

                  <small>
                    AI inference successfully completed
                  </small>

                </div>

              </div>


              <div className="metrics">

                <div className="metric">

                  <span>
                    INPUT
                  </span>

                  <strong>
                    128 × 128
                  </strong>

                </div>

                <div className="metric">

                  <span>
                    OUTPUT
                  </span>

                  <strong>
                    256 × 256
                  </strong>

                </div>

                <div className="metric">

                  <span>
                    UPSCALE
                  </span>

                  <strong>
                    2×
                  </strong>

                </div>

                <div className="metric">

                  <span>
                    INFERENCE
                  </span>

                  <strong>
                    {processingTime
                      ? `${processingTime}s`
                      : "--"}
                  </strong>

                </div>

                <div className="metric">

                  <span>
                    MODEL
                  </span>

                  <strong>
                    V3
                  </strong>

                </div>

              </div>


              <a
                className="download-button"
                href={result}
                download="restored_wafer.png"
              >
                DOWNLOAD RESTORED IMAGE ↓
              </a>

            </div>

          )}

        </section>

      )}


      {/* ========================================================
          TECHNICAL PERFORMANCE
      ======================================================== */}

      <section className="technical-performance">

        <div className="section-tag">
          TECHNICAL PERFORMANCE
        </div>

        <h2>
          Measured improvement over conventional upscaling.
        </h2>

        <p className="technical-description">
          Evaluation results measured on the validation dataset
          against a bicubic interpolation baseline.
        </p>


        <div className="performance-grid">

          <div className="performance-card">

            <span className="performance-label">
              PSNR
            </span>

            <strong>
              27.75
            </strong>

            <span className="performance-unit">
              dB
            </span>

            <div className="performance-gain">
              +4.24 dB
            </div>

            <small>
              vs 23.51 dB bicubic baseline
            </small>

          </div>


          <div className="performance-card">

            <span className="performance-label">
              SSIM
            </span>

            <strong>
              0.727
            </strong>

            <span className="performance-unit">
              score
            </span>

            <div className="performance-gain">
              +0.190
            </div>

            <small>
              vs 0.537 bicubic baseline
            </small>

          </div>


          <div className="performance-card">

            <span className="performance-label">
              UPSCALING
            </span>

            <strong>
              2×
            </strong>

            <span className="performance-unit">
              resolution
            </span>

            <div className="performance-gain">
              128² → 256²
            </div>

            <small>
              High-resolution reconstruction
            </small>

          </div>


          <div className="performance-card">

            <span className="performance-label">
              MODEL
            </span>

            <strong>
              887K
            </strong>

            <span className="performance-unit">
              parameters
            </span>

            <div className="performance-gain">
              V3 CNN
            </div>

            <small>
              Lightweight restoration architecture
            </small>

          </div>

        </div>


        {/* BASELINE → PROPOSED */}

        <div className="performance-comparison">

          <div className="baseline-box">

            <span>
              BASELINE
            </span>

            <strong>
              BICUBIC
            </strong>

          </div>


          <div className="performance-arrow">
            →
          </div>


          <div className="proposed-box">

            <span>
              PROPOSED MODEL
            </span>

            <strong>
              WAFERAI V3
            </strong>

          </div>


          <div className="psnr-gain-box">

            <span>
              PSNR GAIN
            </span>

            <strong>
              +4.24 dB
            </strong>

          </div>

        </div>

      </section>


      {/* ========================================================
          AI PIPELINE
      ======================================================== */}

      <section className="pipeline">

        <div className="section-tag">
          AI PIPELINE
        </div>

        <h2>
          From degraded data to restored intelligence.
        </h2>


        <div className="pipeline-grid">

          <div className="pipeline-step">

            <span>
              01
            </span>

            <h3>
              INPUT
            </h3>

            <p>
              Low-resolution wafer image is uploaded
              to the restoration system.
            </p>

          </div>


          <div className="pipeline-step">

            <span>
              02
            </span>

            <h3>
              PREPROCESS
            </h3>

            <p>
              Image is converted, resized and normalized
              for neural network inference.
            </p>

          </div>


          <div className="pipeline-step">

            <span>
              03
            </span>

            <h3>
              V3 MODEL
            </h3>

            <p>
              Deep-learning restoration model reconstructs
              missing image details.
            </p>

          </div>


          <div className="pipeline-step">

            <span>
              04
            </span>

            <h3>
              OUTPUT
            </h3>

            <p>
              High-resolution restored wafer image
              is returned to the interface.
            </p>

          </div>

        </div>

      </section>


      {/* ========================================================
          FOOTER
      ======================================================== */}

      <footer>

        <div>

          <strong>
            WAFER<span>AI</span>
          </strong>

          <p>
            AI Wafer Image Restoration
          </p>

        </div>


        <div className="footer-right">

          V3 MODEL • 887,425 PARAMETERS

          <br />

          SEMICON INDIA HACKATHON 2026

        </div>

      </footer>

    </div>
  );
}

export default App;