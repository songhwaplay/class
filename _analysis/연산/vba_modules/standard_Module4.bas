Attribute VB_Name = "Module4"




Sub 문제바꾸기()
Attribute 문제바꾸기.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 문제바꾸기 매크로
'

'
    Calculate
End Sub

Sub fourth분수_답()
Attribute fourth분수_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
'  fourth분수_답 매크로
'

'
    Range("G3:L11,H13:R51,G33:G36,G29:G30").Select
    Range("G29").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("H3:H6,H8:H11,I13:I16,I18:I21,I23:I26,H28:H31").Select
    Range("H28").Activate
    Range("H3:H6,H8:H11,I13:I16,I18:I21,I23:I26,H28:H31,H33:H36,I38:I41").Select
    Range("I38").Activate
    Range( _
        "H3:H6,H8:H11,I13:I16,I18:I21,I23:I26,H28:H31,H33:H36,I38:I41,I43:I46,I48:I51,L43:L46,L48:L51" _
        ).Select
    Range("L48").Activate
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    Selection.Borders(xlEdgeLeft).LineStyle = xlNone
    Selection.Borders(xlEdgeTop).LineStyle = xlNone
    Selection.Borders(xlEdgeBottom).LineStyle = xlNone
    Selection.Borders(xlEdgeRight).LineStyle = xlNone
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    With Selection.Borders(xlInsideHorizontal)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Range("O43:O44,O48:O49").Select
    Range("O48").Activate
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    Selection.Borders(xlEdgeLeft).LineStyle = xlNone
    Selection.Borders(xlEdgeTop).LineStyle = xlNone
    With Selection.Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.Borders(xlEdgeRight).LineStyle = xlNone
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    Range("L13:L14").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=L13<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("L18:L19").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=L18<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("L23:L24").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=L23<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("L13:L14").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$L$13<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("L23:L24").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$L$23<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("P11").Select
End Sub
Sub fourth분수_문제()
Attribute fourth분수_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
'  fourth분수_문제 매크로
'

'
    Range("G3:M11,H13:R51,G29:G36").Select
    Range("G33").Activate
    
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Selection.FormatConditions.Delete
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    Selection.Borders(xlEdgeLeft).LineStyle = xlNone
    Selection.Borders(xlEdgeTop).LineStyle = xlNone
    Selection.Borders(xlEdgeBottom).LineStyle = xlNone
    Selection.Borders(xlEdgeRight).LineStyle = xlNone
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    Range("S17").Select
    
End Sub
