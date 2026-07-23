Attribute VB_Name = "Module21"
Sub sixth원평면_답()
Attribute sixth원평면_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' sixth원평면_답 매크로
'

'
    Range("B3:B4,F3:F4,F11:F12,B11:B12").Select
    Range("B11").Activate
 
    Range("B3:B4,F3:F4,F11:F12,B11:B12,B19:B20,F19:F20").Select
    Range("F19").Activate
  
    Range("B3:B4,F3:F4,F11:F12,B11:B12,B19:B20,F19:F20,F27:F28,B27:B28").Select
    Range("B27").Activate
 
    With Selection.Font
        .ThemeColor = xlThemeColorLight1
        .TintAndShade = 0
    End With

    Range("G6").Select
End Sub
Sub sixth원평면_문제()
Attribute sixth원평면_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' sixth원평면_문제 매크로
'

'
    Range("B4,F4,F12,B12").Select
    Range("B12").Activate
   
    Range("B4,F4,F12,B12,B20,F20").Select
    Range("F20").Activate
   
    Range("B4,F4,F12,B12,B20,F20,F28,B28").Select
    Range("B28").Activate
   
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With

    Range("F5").Select
End Sub
Sub fifth분수A_답()
Attribute fifth분수A_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fifth분수A_답 매크로
'

'
    Range("F5:L37").Select
  
    Range("F5:L37,M5:M19").Select
    Range("M5").Activate
   
    Range("F5:L37,M5:M19,H41:M91,F77:G91").Select
    Range("F77").Activate
   
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
   
    Range("F5:F7,H5:H7,J5:J7,J14:J16,H14:H16,F14:F16,F23:F25,H23:H25,J23:J25"). _
        Select
    Range("J23").Activate

    Range( _
        "F5:F7,H5:H7,J5:J7,J14:J16,H14:H16,F14:F16,F23:F25,H23:H25,J23:J25,F32:F34,H32:H34,J32:J34" _
        ).Select
    Range("J32").Activate
   
    Range( _
        "F5:F7,H5:H7,J5:J7,J14:J16,H14:H16,F14:F16,F23:F25,H23:H25,J23:J25,F32:F34,H32:H34,J32:J34,F77:F79,H77:H79,J77:J79" _
        ).Select
    Range("J77").Activate
 
    Range( _
        "F5:F7,H5:H7,J5:J7,J14:J16,H14:H16,F14:F16,F23:F25,H23:H25,J23:J25,F32:F34,H32:H34,J32:J34,F77:F79,H77:H79,J77:J79,F86:F88,H86:H88,J86:J88" _
        ).Select
    Range("J86").Activate

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
   
    Range("M5:M7").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$M$5<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("M14:M16").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$M$14<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
   
    Range("L23:L25").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$L$23<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("L32:L34").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$L$32<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
   
    Range("I41:I43").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$I$41<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("I50:I52").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$I$50<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("I59:I61").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$I$59<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
   
    Range("I68:I70").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$I$68<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    
    Range("M77:M79").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$M$77<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("M86:M88").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$M$86<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    
    Range("S15").Select
End Sub
Sub fifth분수A_문제()
Attribute fifth분수A_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fifth분수A_문제 매크로
'

'
    Range("F5:N37").Select
   
    Range("F5:N37,H41:I73,F77:M91").Select
    Range("F77").Activate
 
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

    Cells.FormatConditions.Delete

    Range("S14").Select
End Sub

