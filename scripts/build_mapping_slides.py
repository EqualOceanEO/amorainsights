"""Build Mapping slides (23-27) via XML manipulation."""
import zipfile, os

BASE = r"C:\Users\51229\WorkBuddy\Claw\unpacked_pptx"
OUT  = r"C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v3.pptx"

C_BG="1A2E42"; C_BORDER="2D4A61"; C_CYAN="00B4D8"; C_WHITE="FFFFFF"
C_GRAY="8DA9BD"; C_RED="EF476F"; C_GREEN="06D6A0"; C_AMBER="FF9F1C"
C_YELLOW="FFD166"; C_FOOTER="4A6A85"

def card_shapes(sid, lx, ly, w, h, bc, prefix=""):
    def mk(id_, xfrm, fill):
        return ('<p:sp><p:nvSpPr><p:cNvPr id="%s" name="%s"/>'
                '<p:cNvSpPr/><p:nvPr></p:nvPr><p:spPr>%s'
                '<a:prstGeom prst="rect"><a:avLst></a:avLst></a:prstGeom>'
                '<a:solidFill>%s</a:solidFill>'
                '<a:ln w="12700"><a:solidFill><a:srgbClr val="%s"/></a:solidFill>'
                '<a:prstDash val="solid"/></a:ln></p:spPr></p:sp>') % (
                    id_, prefix, xfrm, fill, C_BORDER)
    def xfrm(x,y,cx,cy): return '<a:xfrm><a:off x="%s" y="%s"/><a:ext cx="%s" cy="%s"/></a:xfrm>'%(x,y,cx,cy)
    return (mk(sid,   xfrm(lx,ly,w,h),   '<a:srgbClr val="%s"/>' % C_BG) +
            mk(sid+1, xfrm(lx,ly,w,64008), '<a:srgbClr val="%s"/>' % bc) +
            mk(sid+2, xfrm(lx,ly,64008,h), '<a:srgbClr val="%s"/>' % bc))

def txt(sid,lx,ly,w,h,text,sz,col,bold=False,italic=False,name="T"):
    ba = ' b="1"' if bold else ''
    ia = ' i="1"' if italic else ''
    return ('<p:sp><p:nvSpPr><p:cNvPr id="%s" name="%s"/>'
            '<p:cNvSpPr/><p:nvPr></p:nvPr>'
            '<p:spPr><a:xfrm><a:off x="%s" y="%s"/><a:ext cx="%s" cy="%s"/></a:xfrm>'
            '<a:prstGeom prst="rect"><a:avLst></a:avLst></a:prstGeom>'
            '<a:noFill/><a:ln></a:ln></p:spPr>'
            '<p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" rtlCol="0" anchor="ctr"/>'
            '<a:lstStyle/><a:p><a:pPr indent="0" marL="0"><a:buNone/></a:pPr>'
            '<a:r><a:rPr lang="en-US" sz="%s"%s%s dirty="0">'
            '<a:solidFill><a:srgbClr val="%s"/></a:solidFill>'
            '<a:latin typeface="Calibri" pitchFamily="34" charset="0"/>'
            '<a:ea typeface="Calibri" pitchFamily="34" charset="-122"/>'
            '<a:cs typeface="Calibri" pitchFamily="34" charset="-120"/>'
            '</a:rPr><a:t>%s</a:t></a:r></a:p></p:txBody></p:sp>') % (
                sid, name, lx, ly, w, h, sz, ba, ia, col, text)

def rect(sid,lx,ly,w,h,fill,bold_border=False):
    lv = "0D1B2A" if bold_border else C_BORDER
    ln = ('<a:ln w="12700"><a:solidFill><a:srgbClr val="%s"/></a:solidFill>'
          '<a:prstDash val="solid"/></a:ln>' if bold_border else '<a:ln></a:ln>')
    return ('<p:sp><p:nvSpPr><p:cNvPr id="%s" name=""/>'
            '<p:cNvSpPr/><p:nvPr></p:nvPr>'
            '<p:spPr><a:xfrm><a:off x="%s" y="%s"/><a:ext cx="%s" cy="%s"/></a:xfrm>'
            '<a:prstGeom prst="rect"><a:avLst></a:avLst></a:prstGeom>'
            '<a:solidFill><a:srgbClr val="%s"/></a:solidFill>%s</p:spPr></p:sp>') % (
                sid, lx, ly, w, h, fill, ln)

def hline(sid): return rect(sid,0,128016,9144000,54864,C_CYAN)

def footer(sid,page):
    b=rect(sid,0,4811808,9144000,332268,"111D2B",True)
    b2=rect(sid+1,502920,4849080,8229600,228600,"111D2B",True)
    t=txt(sid+2,502920,4849080,8229600,228600,
          "AMORA Insights  |  Humanoid Robot Index 2026  |  Data Cut-off: Q1 2026",900,C_FOOTER,name="FT")
    p=txt(sid+3,8321040,4849080,457200,228600,str(page),900,C_CYAN,name="PN")
    return b+b2+t+p

def shell(title,subtitle,shapes,page):
    return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"'
            ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
            ' xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
            '<p:cSld name="%s">'
            '<p:bg><p:bgPr><a:solidFill><a:srgbClr val="0D1B2A"/></a:solidFill></p:bgPr></p:bg>'
            '<p:spTree>'
            '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
            '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
            '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
            '%s%s%s%s%s%s'
            '</p:spTree></p:cSld>'
            '<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>') % (
                title,
                hline(100),
                txt(101,502920,128016,8229600,594360,title,2400,C_WHITE,bold=True,name="ST"),
                txt(102,502920,731520,7772400,292608,subtitle,1100,C_CYAN,italic=True,name="SS"),
                shapes,
                footer(900,page))

# SLIDE 9
def build_slide9():
    CW,CH=2679192,1691640; Y1,Y2=1115568,2898648; X1,X2,X3=502920,3273552,6044184
    items=[
        (X1,Y1,C_RED,"谐波减速器","日本哈默纳科(全球70%)","绿的谐波","~18%","精度寿命差30%，高端依赖日韩"),
        (X2,Y1,C_RED,"行星滚柱丝杠","瑞士 GSA/德国 INA","中国华茂/南京工艺","~12%","国产起步，1.5m/s行走要求超出规格"),
        (X3,Y1,C_AMBER,"触觉传感器","美国 Tacter/德国 BioTac","选代传感/敏芯微","~25%","柔性阵列触觉是真正卡点"),
        (X1,Y2,C_YELLOW,"无框力矩电机","美国科尔摩根/瑞士","步科/汇川技术","~40%","汇川覆盖中端，高转矩>20Nm/kg依赖进口"),
        (X2,Y2,C_GREEN,"深度视觉传感器","Intel RealSense","奥比中光/华为","~50%","消费级够用，工业级差距缩小"),
        (X3,Y2,C_GREEN,"AI 芯片","NVIDIA Thor/Jetson","华为昇腾/地平线","~30%","昇腾910B接近A100，工具链差距仍在"),
    ]
    s=""
    for i,(lx,ly,bc,name,imp,dom,rate,note) in enumerate(items):
        b=200+i*10
        s+=card_shapes(b,lx,ly,CW,CH,bc,name)
        s+=txt(b+3,lx+128016,ly+90144,CW-200000,274320,name,1200,C_WHITE,bold=True,name="T"+str(i))
        s+=txt(b+4,lx+128016,ly+246096,CW-200000,219456,"进口: "+imp,850,C_RED,name="I"+str(i))
        s+=txt(b+5,lx+128016,ly+448176,CW-200000,219456,"国产: "+dom,850,C_GREEN,name="D"+str(i))
        rc=C_AMBER if bc==C_AMBER else bc
        s+=txt(b+6,lx+128016,ly+667536,CW-200000,201168,"国产率 "+rate,950,rc,bold=True,name="R"+str(i))
        s+=txt(b+7,lx+128016,ly+905664,CW-200000,784080,note,800,C_GRAY,name="N"+str(i))
    s+=rect(870,502920,4589288,8229600,914400,"0D2035",True)
    for si,(sx,sy,num,label,col) in enumerate([
        (502920,4689288,"30+","中国核心供应商",C_CYAN),
        (3273552,4689288,"55%","零部件国产替代均值",C_GREEN),
        (6044184,4689288,"6类","关键卡脖子零部件",C_RED)]):
        s+=txt(871+si*2,sx,sy+100000,2679192,228600,num,2000,col,bold=True,name="SN"+str(si))
        s+=txt(871+si*2+1,sx,sy+328600,2679192,182880,label,850,C_GRAY,name="SL"+str(si))
    return shell("M3  -  中国产业链生态","30+ 核心供应商  |  6 类关键零部件  |  国产替代加速",s,9)

# SLIDE 10
def build_slide10():
    CW,CH=2679192,2194560; Y=1115568; X1,X2,X3=502920,3273552,6044184
    s=""
    def col_sec(base,x,lbl,items,hdr):
        sc=card_shapes(base,x,Y,CW,CH,C_CYAN,hdr)
        sc+=txt(base+3,x+128016,Y+90144,CW-200000,274320,lbl,1100,C_WHITE,bold=True,name="H"+hdr)
        for j,(co,desc,col) in enumerate(items):
            oy=Y+366480+j*365760
            sc+=txt(base+4+j*2,x+128016,oy,CW-200000,182880,"* "+co,900,col,bold=True,name=("C%s_%d"%(hdr,j)))
            sc+=txt(base+5+j*2,x+128016,oy+182880,CW-200000,182880,desc,800,C_GRAY,name=("D%s_%d"%(hdr,j)))
        return sc
    comps=[("NVIDIA","AI Chips, Isaac Sim, Omniverse",C_AMBER),("ATI Industrial","6-Axis Force Sensors 60%+ share",C_AMBER),
           ("Moog","Servo Actuators, Motion Control",C_CYAN),("Harmonic Drive","Precision Gearboxes",C_RED),
           ("Synapticon","Servo Drives, Motion Control",C_GRAY)]
    oems=[("Tesla (Optimus)","<50 units, NVIDIA+ATI+自研执行器",C_AMBER),("Boston Dynamics","Atlas, 现代集团, 液压路线",C_GRAY),
          ("Figure AI","$675M融资, 宝马合作, OpenAI背书",C_GREEN),("Agility Robotics","Digit, 物流场景, 亚马逊试点",C_GRAY),
          ("1X Technologies","NEO, OpenAI投资, 挪威+美国",C_GRAY)]
    plats=[("Google DeepMind","RT-X, Embodied AI研究",C_GREEN),("OpenAI","GPT-4V, Figure AI合作伙伴",C_GREEN),
           ("Microsoft","Azure Robotics, 云基础设施",C_CYAN),("Meta AI","PyTorch, Habitat仿真",C_GRAY),
           ("Intrinsic (Alphabet)","工业机器人AI, 收购Wandelbots",C_GRAY)]
    s+=col_sec(200,X1,"Component Leaders",comps,"Comp")
    s+=col_sec(300,X2,"Leading OEMs",oems,"OEM")
    s+=col_sec(400,X3,"Platform & AI",plats,"Plat")
    s+=rect(870,502920,3406200,8229600,548640,"2D0A0A",True)
    s+=txt(871,640080,3423600,7885840,365760,
           "  供应链脆弱性: 70%+ 关键零部件依赖进口  |  地缘政治风险高  |  制造成本比中国高 55%",1000,C_RED,bold=True,name="W")
    return shell("M4  -  美国产业链生态","核心零部件依赖进口  |  AI 平台全球领先  |  制造成本劣势明显",s,10)

# SLIDE 11
def build_slide11():
    ROW_H=456480; LBL_W=2100000; BAR_AREA=5500000; YS=1115568; XL=502920; XB=XL+LBL_W+182880
    dims=[
        ("制造规模",95,60,C_RED,C_CYAN,"中国产能+供应链密度远超"),
        ("执行器生态",70,55,C_GREEN,C_AMBER,"中国减速器/电机全面追赶"),
        ("AI 平台",40,98,C_RED,C_GREEN,"CUDA生态护城河，3-5年"),
        ("部署规模",85,20,C_GREEN,C_RED,"宇树5500台领跑，美国<200台"),
        ("成本优势",90,35,C_GREEN,C_RED,"10万台时中国低55%"),
        ("企业客户渗透",60,40,C_AMBER,C_AMBER,"中美均以科研教育为主"),
        ("地缘风险敞口",20,85,C_GREEN,C_RED,"美国面临出口管制+断供风险"),
    ]
    s=""
    s+=txt(200,XL,YS,LBL_W,ROW_H,"维度",1000,C_GRAY,bold=True,name="HD")
    s+=txt(201,XB,YS,1100000,ROW_H,"中国",900,C_RED,bold=True,name="HC")
    s+=txt(202,XB+1200000,YS,1100000,ROW_H,"美国",900,C_CYAN,bold=True,name="HU")
    for i,(label,cn,us,cnc,usc,note) in enumerate(dims):
        iy=YS+ROW_H+i*(ROW_H+91260)
        cnw=int(BAR_AREA*cn/100); usw=int(BAR_AREA*us/100)
        s+=txt(210+i,XL,iy,LBL_W,ROW_H,label,950,C_WHITE,bold=True,name=("DL%d"%i))
        s+=txt(220+i,XL,iy+ROW_H-200000,LBL_W,182880,note,700,C_GRAY,name=("DN%d"%i))
        if cnw>0:
            s+=rect(230+i,XB,iy,cnw,200000,cnc)
            s+=txt(240+i,XB+80000,iy,400000,200000,str(cn),900,C_WHITE,bold=True,name=("CN%d"%i))
        if usw>0:
            s+=rect(250+i,XB+1200000,iy,usw,200000,usc)
            s+=txt(260+i,XB+1200000+80000,iy,400000,200000,str(us),900,C_WHITE,bold=True,name=("US%d"%i))
    return shell("M5  -  中美产业链 7 维度对比","制造 x AI x 部署 x 成本 x 地缘 -- 全方位竞争格局",s,11)

# SLIDE 12
def build_slide12():
    CW=2048640; CH=685800; YS=1115568; X=[502920,2551560,4590480,6629400]; HH=320040
    prices=[("$180K","$280K","$220K","当前"),("$90K","$160K","$120K","1K/年"),
            ("$45K","$95K","$65K","10K/年"),("$20K","$45K","$30K","100K/年")]
    pc=[C_AMBER,C_AMBER,C_YELLOW,C_GREEN]; pb=[False,False,True,True]
    s=""
    s+=rect(200,502920,YS,8229600,HH,"0D2035",True)
    s+=txt(201,502920,YS,8229600,HH,"单位成本 (人民币/台)",900,C_GRAY,name="Th")
    s+=txt(202,X[3],YS,CW,HH,"产量规模",900,C_WHITE,bold=True,name="Sh")
    for ci,(cn,col) in enumerate([("China",C_RED),("US",C_CYAN),("Japan",C_AMBER)]):
        s+=rect(210+ci,X[ci],YS,CW,HH,"1A2E42",True)
        s+=txt(215+ci,X[ci],YS,CW,HH,cn,1000,col,bold=True,name=("Ch%d"%ci))
    for ri,row in enumerate(prices):
        ry=YS+HH+ri*CH
        s+=rect(300+ri,502920,ry,8229600,CH,"111D2B",True)
        s+=txt(310+ri,X[3],ry,CW,CH,row[3],850,pc[ri],bold=True,name=("Sc%d"%ri))
        for ci in range(3):
            s+=txt(320+ri*3+ci,X[ci],ry,CW,CH,row[ci],1400,pc[ri],bold=pb[ri],name=("P%d_%d"%(ri,ci)))
    iy=YS+HH+4*CH+128016
    for ix,(lx,num,title,body) in enumerate([
        (502920,"55%","中国成本优势","10万台时比美国低55%"),
        (3273552,"2027","收敛时间节点","预计2027年成本曲线趋同"),
        (6044184,"Y35万","宇树2025均价","含研发摊销，出口均价$25K")]):
        s+=card_shapes(400+ix*5,lx,iy,2679192,502920,C_CYAN,("Ins%d"%ix))
        s+=txt(405+ix*5,lx+128016,iy+90144,2432392,274320,num,2000,C_CYAN,bold=True,name=("IN%d"%ix))
        s+=txt(406+ix*5,lx+128016,iy+365760,2432392,182880,title,900,C_WHITE,bold=True,name=("IT%d"%ix))
        s+=txt(407+ix*5,lx+128016,iy+548640,2432392,182880,body,800,C_GRAY,name=("IB%d"%ix))
    return shell("M6  -  成本曲线：规模化降本路径","China  |  US  |  Japan  --  当前小批量到 100K 大规模成本对比",s,12)

# SLIDE 13
def build_slide13():
    TX=914400; PH=878280; Y0=1100000
    phases=[
        ("2023-2024",C_RED,"蛰伏期",
         ["Figure AI 成立，$675M融资","Boston Dynamics Atlas停产液压版","宇树H1量产，500台","特斯拉Optimus首亮相","Figure AI+OpenAI/微软合作"]),
        ("2025",C_AMBER,"爆发期",
         ["宇树5500台出货量，全球第一","Figure 02/Optimus新进展","Figure AI+BMW试点启动","Agility+亚马逊仓库试点","国产谐波减速器小批量量产"]),
        ("2026-2027",C_YELLOW,"收敛期",
         ["国产谐波/丝杠批量替代","宇树IPO，产能扩至7.5万台/年","Figure/Agility规模化部署","特斯拉Optimus千台部署","成本曲线趋同，中国保持55%优势"]),
        ("2028+",C_GREEN,"成熟期",
         ["中国完整供应链生态形成","全球百万台出货临界点","美国AI平台+中国制造分工","人形机器人走进工业/服务业","产业格局定型"]),
    ]
    s=rect(200,TX,Y0,54864,3500000,C_BORDER)
    for pi,(year,dot_col,phase,evts) in enumerate(phases):
        cy=Y0+pi*PH
        s+=rect(210+pi,TX-182880,cy,731520,731520,dot_col)
        s+=rect(220+pi,1828800,cy,1828800,292608,"1A2E42",True)
        s+=txt(225+pi,1917600,cy,1700000,292608,year,1400,dot_col,bold=True,name=("Y%d"%pi))
        s+=txt(229+pi,1917600,cy+292608,1700000,182880,phase,900,C_GRAY,name=("Ph%d"%pi))
        for ei,ev in enumerate(evts):
            ey=cy+456480+ei*137160
            s+=txt(230+pi*5+ei,3826800,ey,6500000,137160,"- "+ev,850,
                   C_WHITE if ei==0 else C_GRAY,bold=(ei==0),name=("E%d_%d"%(pi,ei)))
    s+=rect(870,502920,4619808,8229600,365760,"0D2035",True)
    s+=txt(871,640080,4637208,7885840,292608,
           "关键结论: 2027供应链收敛后，中国制造优势将转化为全球成本定价权，AI平台竞争格局决定长期利润分配",
           900,C_CYAN,name="Key")
    return shell("M7  -  供应链收敛时间线","2023 蛰伏  >>  2025 爆发  >>  2027 收敛  >>  2028+ 成熟",s,13)

def write_slide(num, xml_str):
    path=os.path.join(BASE,"ppt","slides","slide%d.xml"%num)
    with open(path,"w",encoding="utf-8") as f: f.write(xml_str)
    print("  slide%d.xml  (%d bytes)"%(num,len(xml_str)))

def write_rels(num):
    path=os.path.join(BASE,"ppt","slides","_rels","slide%d.xml.rels"%num)
    with open(path,"w",encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/'
                '2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>'
                '</Relationships>')
    print("  slide%d.xml.rels" % num)

print("Building 5 Mapping slides...")
write_slide(23,build_slide9())
write_slide(24,build_slide10())
write_slide(25,build_slide11())
write_slide(26,build_slide12())
write_slide(27,build_slide13())
for n in range(23,28): write_rels(n)
print("All done.")
