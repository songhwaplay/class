Attribute VB_Name = "Module24"
Sub third분수_답()
Attribute third분수_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third분수_답 매크로
'

'
    Range("L19:L20,L22:L23").Select
    Range("L22").Activate
   
    Range("L19:L20,L22:L23,L25:L26,L28:L29,L31:L32").Select
    Range("L31").Activate
  
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    Selection.Borders(xlEdgeLeft).LineStyle = xlNone
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
    Selection.Borders(xlEdgeRight).LineStyle = xlNone
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    With Selection.Borders(xlInsideHorizontal)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlThin
    End With
  
    Range( _
        "L19:L20,L22:L23,L25:L26,L28:L29,L31:L32,O15:O16,O12:O13,O9:O10,O6:O7,O3:O4,F15:F16,F12:F13,F9:F10,F6:F7,F3:F4" _
        ).Select
    Range("F3").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorLight1
        .TintAndShade = 0
    End With
    Range("P3:P4").Select
End Sub
Sub third분수_문제()
Attribute third분수_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third분수_문제 매크로
'

'
    Range( _
        "F3:F4,O3:O4,O6:O7,F6:F7,F9:F10,O9:O10,O12:O13,F12:F13,F15:F16,O15:O16,L19:L20,L22:L23" _
        ).Select
    Range("L22").Activate

    Range( _
        "F3:F4,O3:O4,O6:O7,F6:F7,F9:F10,O9:O10,O12:O13,F12:F13,F15:F16,O15:O16,L19:L20,L22:L23,L25:L26,L28:L29,L31:L32" _
        ).Select
    Range("L31").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("K19:M20,K22:M23,K25:M26,K28:M29,K31:M32").Select
    Range("K32").Activate
  
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    With Selection.Borders(xlEdgeLeft)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThin
    End With
    With Selection.Borders(xlEdgeTop)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThin
    End With
    With Selection.Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThin
    End With
    With Selection.Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
  
    Range("P5").Select
End Sub
