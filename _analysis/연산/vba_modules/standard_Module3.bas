Attribute VB_Name = "Module3"
Sub fifth소수찾기_답()
Attribute fifth소수찾기_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fifth소수찾기_답 매크로
'

'
    Range( _
        "C4:D4,F4,H4:H5,J5:J6,B5,D5:D6,B7:B8,B10:B11,D8:D9,D11:D12,H13,J11:J12,H10,H7:H8,J9" _
        ).Select
    Range("J9").Activate
    Selection.Font.Bold = True
    Selection.Font.Underline = xlUnderlineStyleSingle
    With Selection.Font
        .Color = -4165632
        .TintAndShade = 0
    End With
    With Selection.Font
        .Name = "맑은 고딕"
        .Size = 16
        .Strikethrough = False
        .Superscript = False
        .Subscript = False
        .OutlineFont = False
        .Shadow = False
        .Underline = xlUnderlineStyleSingle
        .Color = -4165632
        .TintAndShade = 0
        .ThemeFont = xlThemeFontMinor
    End With
    Range( _
        "B4,C5:C13,B12:B13,B9,B6,E4:E13,D13,D10,D7,F5:G13,G4,H6,I4:I13,H12,H11,H9,J4,K4:K13,J13,J10,J8,J7" _
        ).Select
    Range("J7").Activate
    Selection.Font.Size = 12
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = -0.249977111117893
    End With
    With Selection.Font
        .Name = "맑은 고딕"
        .Size = 10
        .Strikethrough = False
        .Superscript = False
        .Subscript = False
        .OutlineFont = False
        .Shadow = False
        .Underline = xlUnderlineStyleNone
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = -0.499984740745262
        .ThemeFont = xlThemeFontMinor
    End With
    Range("B4").Select
    
End Sub

Sub fifth소수찾기_문제()
Attribute fifth소수찾기_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fifth소수찾기_문제 매크로
'

'
    Range("B4:k13").Select
    With Selection.Font
        .Name = "맑은 고딕"
        .Size = 14
        .Strikethrough = False
        .Superscript = False
        .Subscript = False
        .OutlineFont = False
        .Shadow = False
        .TintAndShade = 0
        .ThemeFont = xlThemeFontMinor
    End With
    With Selection.Font
        .ThemeColor = xlThemeColorLight1
        .TintAndShade = 0
    End With
    Selection.Font.Underline = xlUnderlineStyleSingle
    Selection.Font.Underline = xlUnderlineStyleNone
    Selection.Font.Bold = True
    Selection.Font.Bold = False
    Range("B4").Select
End Sub
