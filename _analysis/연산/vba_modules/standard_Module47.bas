Attribute VB_Name = "Module47"
Sub first딱지_답()
Attribute first딱지_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first딱지_답 Macro
'

'
    Range("A44:J45").Select
    Range("A45").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("E43:F43").Select
    With Selection.Font
        .ThemeColor = xlThemeColorLight1
        .TintAndShade = 0
    End With
    Range("A44:J44").Select
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    Selection.Borders(xlEdgeLeft).LineStyle = xlNone
    With Selection.Borders(xlEdgeTop)
        .LineStyle = xlDash
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    Selection.Borders(xlEdgeBottom).LineStyle = xlNone
    Selection.Borders(xlEdgeRight).LineStyle = xlNone
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    Range("C1:G1").Select
End Sub
Sub first딱지_문제()
Attribute first딱지_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first딱지_문제 Macro
'

'
    Range("A43:J45").Select
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
    Range("C1:G1").Select
End Sub
