"""
Convert PPTX to PDF using python-pptx + pypdfium2 + Pillow.
Extracts slide content as images and assembles into a PDF.
"""
import os
import io
import sys

python_exe = os.path.abspath(__file__).replace(os.path.basename(__file__), '') + os.sep + '..' + os.sep + '..' + os.sep + '.workbuddy' + os.sep + 'binaries' + os.sep + 'python' + os.sep + 'versions' + os.sep + '3.13.12' + os.sep + 'python.exe'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

pptx_path = r"C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pptx"
pdf_path = r"C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pdf"

print(f"PPTX: {pptx_path}")
print(f"PDF output: {pdf_path}")

try:
    from pptx import Presentation
    from pptx.util import Inches, Pt, Emu
    from PIL import Image, ImageDraw, ImageFont
    import pypdfium2 as pdfium
    print("All libraries imported successfully")
except ImportError as e:
    print(f"Import error: {e}")
    sys.exit(1)

# Load the presentation
prs = Presentation(pptx_path)
print(f"Loaded presentation with {len(prs.slides)} slides")

# Slide dimensions (inches)
slide_width_in = prs.slide_width.inches
slide_height_in = prs.slide_height.inches
print(f"Slide size: {slide_width_in:.2f} x {slide_height_in:.2f} inches")

# DPI and pixel dimensions
DPI = 150
img_width = int(slide_width_in * DPI)
img_height = int(slide_height_in * DPI)

print(f"Image size: {img_width} x {img_height} pixels at {DPI} DPI")

# Color palette from the PPT
BG_COLOR = (10, 20, 40)     # Dark navy
TEXT_COLOR = (255, 255, 255)
ACCENT_COLOR = (0, 180, 216)  # Tech blue
GOLD_COLOR = (255, 193, 7)   # Gold
SECTION_BG = (20, 35, 65)

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(*rgb)

def draw_slide_as_image(slide, slide_num, total):
    """Draw a slide as a PIL Image based on PPTX XML data."""
    from pptx.oxml.ns import qn
    from pptx.oxml import parse_xml
    from lxml import etree

    img = Image.new('RGB', (img_width, img_height), color=BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Try to load fonts
    try:
        font_bold = ImageFont.truetype("arialbd.ttf", 24)
        font_regular = ImageFont.truetype("arial.ttf", 18)
        font_small = ImageFont.truetype("arial.ttf", 14)
        font_large = ImageFont.truetype("arialbd.ttf", 36)
        font_xlarge = ImageFont.truetype("arialbd.ttf", 48)
    except:
        font_bold = ImageFont.load_default()
        font_regular = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_large = font_bold
        font_xlarge = font_bold

    # Collect all shapes
    shapes_data = []

    for shape in slide.shapes:
        left_px = int(shape.left / 914400 * DPI)
        top_px = int(shape.top / 914400 * DPI)
        width_px = int(shape.width / 914400 * DPI)
        height_px = int(shape.height / 914400 * DPI)

        shape_type = shape.shape_type

        if hasattr(shape, "text_frame") and shape.has_text_frame:
            text = shape.text_frame.text.strip()
            if text:
                # Determine text style from shape
                font_size = 18
                fill_color = TEXT_COLOR
                bold = False

                for para in shape.text_frame.paragraphs:
                    for run in para.runs:
                        if run.font.size:
                            font_size = int(run.font.size.pt)
                        if run.font.bold:
                            bold = True
                        if run.font.color and hasattr(run.font.color, 'rgb'):
                            fill_color = (run.font.color.rgb[0],
                                          run.font.color.rgb[1],
                                          run.font.color.rgb[2])

                shapes_data.append({
                    'type': 'text',
                    'x': left_px, 'y': top_px,
                    'w': width_px, 'h': height_px,
                    'text': text,
                    'font_size': font_size,
                    'fill': fill_color,
                    'bold': bold
                })

        if hasattr(shape, 'fill') and shape.fill and hasattr(shape.fill, 'fore_color'):
            fill = shape.fill
            if hasattr(fill.fore_color, 'rgb') and fill.fore_color.rgb:
                fc = fill.fore_color.rgb
                fill_rgb = (fc[0], fc[1], fc[2])
                shapes_data.append({
                    'type': 'shape',
                    'x': left_px, 'y': top_px,
                    'w': width_px, 'h': height_px,
                    'fill': fill_rgb
                })

    # Draw background gradient simulation (dark navy)
    for i in range(img_height):
        ratio = i / img_height
        r = int(BG_COLOR[0] * (1 - ratio * 0.3))
        g = int(BG_COLOR[1] * (1 - ratio * 0.2))
        b = int(BG_COLOR[2] * (1 + ratio * 0.1))
        b = min(255, b)
        draw.line([(0, i), (img_width, i)], fill=(r, g, b))

    # Draw all shapes
    for sd in shapes_data:
        if sd['type'] == 'shape':
            fill_rgb = sd['fill']
            # Only draw if it's a background/rectangle shape
            if sd['w'] > 50 and sd['h'] > 20:
                draw.rectangle([sd['x'], sd['y'], sd['x']+sd['w'], sd['y']+sd['h']],
                             fill=fill_rgb)

    # Draw text shapes
    for sd in shapes_data:
        if sd['type'] == 'text' and sd['text']:
            font_size = sd['font_size']
            if sd['bold']:
                try:
                    fnt = ImageFont.truetype("arialbd.ttf", font_size)
                except:
                    fnt = font_bold
            else:
                try:
                    fnt = ImageFont.truetype("arial.ttf", font_size)
                except:
                    fnt = font_regular

            # Wrap text
            text = sd['text']
            max_width = max(sd['w'], 100)
            lines = []
            words = text.split()
            current_line = ""
            for word in words:
                test_line = current_line + (" " if current_line else "") + word
                try:
                    bbox = draw.textbbox((0, 0), test_line, font=fnt)
                    if bbox[2] - bbox[0] <= max_width:
                        current_line = test_line
                    else:
                        if current_line:
                            lines.append(current_line)
                        current_line = word
                except:
                    lines.append(current_line)
                    break
            if current_line:
                lines.append(current_line)

            y = sd['y']
            for line in lines:
                if y < img_height - 5:
                    draw.text((sd['x'], y), line, font=fnt, fill=sd['fill'])
                    try:
                        bbox = draw.textbbox((0, 0), line, font=fnt)
                        line_height = bbox[3] - bbox[1] + 4
                    except:
                        line_height = font_size + 4
                    y += max(line_height, font_size + 4)

    # Add slide number
    try:
        fnt_small = ImageFont.truetype("arial.ttf", 12)
    except:
        fnt_small = font_small
    draw.text((img_width - 60, img_height - 30), f"{slide_num}/{total}",
               font=fnt_small, fill=(150, 150, 150))

    return img

# Create images for each slide
print("Generating slide images...")
images = []
for i, slide in enumerate(prs.slides, 1):
    print(f"  Slide {i}/{len(prs.slides)}...", end="")
    img = draw_slide_as_image(slide, i, len(prs.slides))
    images.append(img)
    print(" done")

# Save as PDF using Pillow
print(f"Saving PDF to {pdf_path}...")
images[0].save(
    pdf_path,
    save_all=True,
    append_images=images[1:],
    resolution=DPI
)

print(f"PDF saved: {pdf_path}")
print(f"PDF size: {os.path.getsize(pdf_path)} bytes")
