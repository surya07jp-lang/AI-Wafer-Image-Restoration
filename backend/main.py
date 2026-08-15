from fastapi import FastAPI, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware

import tensorflow as tf
import numpy as np

from PIL import Image

import io
import time


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="AI Wafer Image Restoration API",
    description="AI-based wafer image restoration using V3 model",
    version="1.0"
)


# ============================================================
# CORS
# Allows React/Vite frontend to communicate with FastAPI
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

    expose_headers=[
        "X-Inference-Time",
        "X-Input-Resolution",
        "X-Output-Resolution",
        "X-Model",
        "X-Parameters",
    ],
)


# ============================================================
# LOAD AI MODEL
# ============================================================

MODEL_PATH = (
    r"C:\Users\User\Downloads\SEMICON-Hackathon-2026"
    r"\notebook\V3_model.keras"
)

print("============================================================")
print("Loading V3 model...")
print("============================================================")

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)

print("V3 model loaded successfully!")
print("Parameters:", model.count_params())
print("Input shape :", model.input_shape)
print("Output shape:", model.output_shape)
print("Input dtype :", model.inputs[0].dtype)
print("============================================================")


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "AI Wafer Restoration API is running!",
        "model": "V3_model",
        "status": "online",
        "parameters": model.count_params(),
        "input_shape": str(model.input_shape),
        "output_shape": str(model.output_shape)
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": True,
        "model": "V3_model",
        "parameters": model.count_params(),
        "input_shape": str(model.input_shape),
        "output_shape": str(model.output_shape)
    }


# ============================================================
# RESTORE WAFER IMAGE
# ============================================================

@app.post("/restore")
async def restore(file: UploadFile = File(...)):

    print()
    print("============================================================")
    print("RESTORE REQUEST RECEIVED")
    print("============================================================")

    print("Filename:", file.filename)
    print("Content type:", file.content_type)

    # ========================================================
    # START TIMER
    # ========================================================

    start_time = time.perf_counter()


    # ========================================================
    # READ UPLOADED IMAGE
    # ========================================================

    image_bytes = await file.read()

    print("Uploaded bytes:", len(image_bytes))

    if len(image_bytes) == 0:

        return Response(
            content=b"Empty image file.",
            status_code=400,
            media_type="text/plain"
        )


    # ========================================================
    # OPEN IMAGE
    # ========================================================

    try:

        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("L")

    except Exception as error:

        print("Image loading error:", error)

        return Response(
            content=b"Invalid image file.",
            status_code=400,
            media_type="text/plain"
        )


    print("Original image size:", image.size)


    # ========================================================
    # RESIZE TO MODEL INPUT
    # ========================================================

    image = image.resize(
        (128, 128),
        Image.Resampling.BICUBIC
    )

    print("Model input image size:", image.size)


    # ========================================================
    # CONVERT IMAGE TO NUMPY
    # ========================================================

    noisy = np.array(
        image,
        dtype=np.float32
    )

    print()
    print("------------------------------------------------------------")
    print("IMAGE BEFORE NORMALIZATION")
    print("------------------------------------------------------------")

    print("Shape :", noisy.shape)
    print("Dtype :", noisy.dtype)
    print("Min   :", noisy.min())
    print("Max   :", noisy.max())
    print("Mean  :", noisy.mean())


    # ========================================================
    # NORMALIZE PNG
    #
    # Original PNG:
    #
    # 0 → 255
    #
    # Convert to:
    #
    # 0.0 → 1.0
    # ========================================================

    noisy = noisy / 255.0

    noisy = noisy.astype(np.float32)


    # ========================================================
    # CONVERT [0,1] → [-1,1]
    #
    # IMPORTANT:
    #
    # This preprocessing is restored from the previous
    # working version of the WAFERAI backend.
    #
    # 0.0 → -1.0
    # 0.5 →  0.0
    # 1.0 → +1.0
    # ========================================================

    noisy = noisy * 2.0 - 1.0

    noisy = noisy.astype(np.float32)


    print()
    print("------------------------------------------------------------")
    print("IMAGE AFTER NORMALIZATION")
    print("------------------------------------------------------------")

    print("Dtype :", noisy.dtype)
    print("Min   :", noisy.min())
    print("Max   :", noisy.max())
    print("Mean  :", noisy.mean())


    # ========================================================
    # ADD BATCH + CHANNEL DIMENSIONS
    #
    # Current:
    #
    # (128,128)
    #
    # Becomes:
    #
    # (1,128,128,1)
    # ========================================================

    noisy = noisy[
        np.newaxis,
        ...,
        np.newaxis
    ]


    print()
    print("------------------------------------------------------------")
    print("MODEL INPUT")
    print("------------------------------------------------------------")

    print("Input shape:", noisy.shape)
    print("Input dtype:", noisy.dtype)


    # ========================================================
    # AI PREDICTION
    # ========================================================

    prediction = model.predict(
        noisy,
        verbose=0
    )


    print()
    print("------------------------------------------------------------")
    print("MODEL OUTPUT")
    print("------------------------------------------------------------")

    print("Prediction shape:", prediction.shape)
    print("Prediction dtype:", prediction.dtype)


    # ========================================================
    # REMOVE BATCH + CHANNEL DIMENSIONS
    #
    # (1,256,256,1)
    #
    # becomes:
    #
    # (256,256)
    # ========================================================

    restored = prediction[0, ..., 0]


    print("Restored shape:", restored.shape)
    print("Restored min:", restored.min())
    print("Restored max:", restored.max())


    # ========================================================
    # CLIP OUTPUT
    #
    # Make sure output is valid [0,1]
    # ========================================================

    restored = np.clip(
        restored,
        0.0,
        1.0
    )


    # ========================================================
    # CONVERT [0,1] → [0,255]
    # ========================================================

    restored_uint8 = (
        restored * 255.0
    ).astype(np.uint8)


    # ========================================================
    # CREATE PIL IMAGE
    # ========================================================

    output_image = Image.fromarray(
        restored_uint8,
        mode="L"
    )


    print()
    print("Output image resolution:", output_image.size)


    # ========================================================
    # CREATE PNG BUFFER
    # ========================================================

    output_buffer = io.BytesIO()

    output_image.save(
        output_buffer,
        format="PNG"
    )

    output_bytes = output_buffer.getvalue()


    # ========================================================
    # CALCULATE INFERENCE TIME
    # ========================================================

    end_time = time.perf_counter()

    inference_time = (
        end_time - start_time
    )

    inference_time_string = (
        f"{inference_time:.3f}"
    )


    # ========================================================
    # FINAL LOG
    # ========================================================

    print()
    print("============================================================")
    print("RESTORATION RESULTS")
    print("============================================================")

    print("Input resolution :", "128x128")
    print("Output resolution:", "256x256")
    print("Inference time   :", inference_time_string, "seconds")
    print("Model            :", "V3")
    print("Parameters       :", model.count_params())
    print("PNG size         :", len(output_bytes), "bytes")

    print("============================================================")
    print("RESTORE SUCCESS")
    print("============================================================")
    print()


    # ========================================================
    # RETURN RESTORED IMAGE + METADATA
    # ========================================================

    return Response(

        content=output_bytes,

        media_type="image/png",

        headers={

            "Content-Disposition":
                "inline; filename=restored_wafer.png",

            "X-Inference-Time":
                inference_time_string,

            "X-Input-Resolution":
                "128x128",

            "X-Output-Resolution":
                "256x256",

            "X-Model":
                "V3",

            "X-Parameters":
                str(model.count_params()),
        }
    )