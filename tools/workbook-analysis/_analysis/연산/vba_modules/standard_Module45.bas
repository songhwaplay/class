Attribute VB_Name = "Module45"
Sub first뛰어세기_답()
Attribute first뛰어세기_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first뛰어세기_답 Macro
'

'
    Range("J22,F22,F20,H20,J20,N22,D20,F18,H18,J18,J16,H16,L16,J14,F14,F12,J12,N12" _
        ).Select
    Range("N12").Activate
    Range( _
        "J22,F22,F20,H20,J20,N22,D20,F18,H18,J18,J16,H16,L16,J14,F14,F12,J12,N12,J10,H10,F10,D10,F8,H8,J8,J6,H6,L6,J4,F4" _
        ).Select
    Range("F4").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("F1").Select
End Sub
Sub 구구단_답()
Attribute 구구단_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 구구단_답 Macro
'

'
    Range("C3:C22,F3:F22,I3:I22,L3:L22,O3:O22").Select
    Range("O3").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    With Selection.Borders(xlEdgeLeft)
        .LineStyle = xlDot
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.Borders(xlEdgeTop).LineStyle = xlNone
    Selection.Borders(xlEdgeBottom).LineStyle = xlNone
    With Selection.Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    Range("A2:O2").Select
End Sub
Sub 구구단_문제()
Attribute 구구단_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 구구단_문제 Macro
'

'
    Range("E5,C3:C22,F3:F22,I3:I22,L3:L22,O3:O22").Select
    Range("O3").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    Selection.Borders(xlEdgeLeft).LineStyle = xlNone
    Selection.Borders(xlEdgeTop).LineStyle = xlNone
    Selection.Borders(xlEdgeBottom).LineStyle = xlNone
    Selection.Borders(xlEdgeRight).LineStyle = xlNone
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    Range("A2:O2").Select
End Sub
