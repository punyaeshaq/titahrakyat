from PIL import Image
import os

def resize_logo():
    input_path = r"c:\Users\eshaq\OneDrive\Dokumen\fati vscode\menarapublik\public\logo.png"
    output_path = r"c:\Users\eshaq\OneDrive\Dokumen\fati vscode\menarapublik\public\logo_optimized.png"
    
    try:
        with Image.open(input_path) as img:
            print(f"Original size: {img.size}")
            
            # Resize to max 512x512, keeping aspect ratio
            img.thumbnail((512, 512), Image.Resampling.LANCZOS)
            
            img.save(output_path, "PNG", optimize=True)
            print(f"Saved optimized logo to {output_path}")
            print(f"New size: {img.size}")
            
            # Replace original
            os.replace(output_path, input_path)
            print("Replaced original logo.png")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    resize_logo()
