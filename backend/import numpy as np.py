import numpy as np
from PIL import Image
from pathlib import Path

# ============================================================
# PATHS
# ============================================================

INPUT_DIR = Path(
    r"C:\Users\User\Downloads\SEMICON-Hackathon-2026\dataset\train\NoisyLR"
)

OUTPUT_DIR = Path(
    r"C:\Users\User\Downloads\SEMICON-Hackathon-2026\test_images"
)

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# GET FIRST 5 NPY FILES
# ============================================================

npy_files = sorted(INPUT_DIR.glob("*.npy"))[:5]

print("Found files:")
for f in npy_files:
    print(" ", f.name)


# ============================================================
# CONVERT TO PNG
# ============================================================

for i, npy_file in enumerate(npy_files, start=1):

    # Load NPY
    image = np.load(npy_file).astype(np.float32)

    print("\nProcessing:", npy_file.name)
    print("Original shape:", image.shape)
    print("Min:", image.min())
    print("Max:", image.max())

    # --------------------------------------------------------
    # Remove unnecessary dimensions if present
    # --------------------------------------------------------

    image = np.squeeze(image)

    # --------------------------------------------------------
    # Normalize for visualization
    # --------------------------------------------------------
    # This converts the actual NoisyLR values into
    # 0-255 grayscale so the PNG can be viewed/uploaded.
    # --------------------------------------------------------

    min_val = image.min()
    max_val = image.max()

    if max_val > min_val:
        image_normalized = (
            (image - min_val)
            / (max_val - min_val)
            * 255.0
        )
    else:
        image_normalized = np.zeros_like(image)

    image_uint8 = image_normalized.astype(np.uint8)

    # --------------------------------------------------------
    # Convert to PIL image
    # --------------------------------------------------------

    png_image = Image.fromarray(
        image_uint8,
        mode="L"
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    output_file = OUTPUT_DIR / f"wafer_test_{i}.png"

    png_image.save(
        output_file,
        format="PNG"
    )

    print("Saved:", output_file)
    print("PNG size:", png_image.size)


# ============================================================
# DONE
# ============================================================

print("\n==============================================")
print("DONE!")
print("==============================================")
print("Test images saved in:")
print(OUTPUT_DIR)