Attribute VB_Name = "Module53"
Sub third분수B_답()
Attribute third분수B_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third분수B_답 매크로
'

'
    Range( _
        "F4:F5,F7:F8,F10:F11,F13:F14,F16:F17,F19:F21,F22:F23,F25:F26,L25:M26,L22:M23,L19:M20,L16:M17,L13:M14,L10:M11,L7:M8,L4:M5" _
        ).Select
    Range("M5").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    With Selection.Borders(xlEdgeTop)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlThin
    End With
    With Selection.Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    With Selection.Borders(xlInsideHorizontal)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Range("H3").Select
End Sub
Sub third분수B_문제()
Attribute third분수B_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third분수B_문제 매크로
'

'
    Range( _
        "F4:F5,F7:F8,F10:F11,F13:F14,F16:F17,F19:F20,F22:F23,F25:F26,L25:M26,L22:M23,L19:M20,L16:M17,L13:M14,L10:M11,L7:M8,L4:M5" _
        ).Select
    Range("M5").Activate
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    With Selection.Borders(xlEdgeTop)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlThin
    End With
    With Selection.Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("H3").Select
End Sub
