import sys
print("Python running", file=sys.stderr)
print("Current directory:", file=sys.stderr)
import os
print(os.getcwd(), file=sys.stderr)

try:
    from reportlab.lib.pagesizes import A4
    print("reportlab imported", file=sys.stderr)
except Exception as e:
    print(f"Error importing reportlab: {e}", file=sys.stderr)
    sys.exit(1)

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
import os

# Colors
RED = HexColor('#DC2626')
AMBER = HexColor('#D97706')
GREEN = HexColor('#059669')
DARK_BLUE = HexColor('#1E3A5F')
LIGHT_GRAY = HexColor('#F3F4F6')
BORDER_GRAY = HexColor('#D1D5DB')

output_path = "c:/Users/51229/WorkBuddy/Claw/储能报告数据检查.pdf"
print(f"Output path: {output_path}", file=sys.stderr)

# Page setup
doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    rightMargin=1.5*cm,
    leftMargin=1.5*cm,
    topMargin=2*cm,
    bottomMargin=2*cm
)

styles = getSampleStyleSheet()
story = []

# Simple title
title_style = ParagraphStyle('Title', fontSize=18, textColor=DARK_BLUE, spaceAfter=20)
story.append(Paragraph("中国储能企业出海中东研究报告 2025", title_style))
story.append(Paragraph("数据与逻辑错误检查报告", ParagraphStyle('Subtitle', fontSize=11, textColor=HexColor('#6B7280'), spaceAfter=20)))
story.append(Spacer(1, 0.5*cm))

# Add a table
header_style = ParagraphStyle('Header', fontSize=10, fontName='Helvetica-Bold', textColor=white)
cell_style = ParagraphStyle('Cell', fontSize=9)

table_data = [
    [Paragraph("<b>项目</b>", header_style), Paragraph("<b>数值</b>", header_style), Paragraph("<b>状态</b>", header_style)],
    [Paragraph("严重错误", cell_style), Paragraph("6项", cell_style), Paragraph("需立即修正", cell_style)],
    [Paragraph("数据不一致", cell_style), Paragraph("7项", cell_style), Paragraph("需核实", cell_style)],
    [Paragraph("逻辑错误", cell_style), Paragraph("5项", cell_style), Paragraph("需修正", cell_style)],
]

table = Table(table_data, colWidths=[4*cm, 4*cm, 4*cm])
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), DARK_BLUE),
    ('GRID', (0, 0), (-1, -1), 0.5, BORDER_GRAY),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(table)

print("Building PDF...", file=sys.stderr)
doc.build(story)
print(f"PDF created: {output_path}", file=sys.stderr)
print("Done!")
