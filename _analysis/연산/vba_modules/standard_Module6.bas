Attribute VB_Name = "Module6"
Sub third나눗셈_문제()
Attribute third나눗셈_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third나눗셈_문제 매크로
'

'
    Range("B7:H11").Select
  
    Range("B7:H11,B15:H18").Select
    Range("B15").Activate
   
    Range("B7:H11,B15:H18,B23:H26,B31:H34,B29,E29,H29,H21,E21,B21").Select
    Range("B21").Activate
   
    Range("B7:H11,B15:H18,B23:H26,B31:H34,B29,E29,H29,H21,E21,B21,B13,E13,H13"). _
        Select
    Range("H13").Activate
   
    Range( _
        "B7:H11,B15:H18,B23:H26,B31:H34,B29,E29,H29,H21,E21,B21,B13,E13,H13,H5,E5,B5"). _
        Select
    Range("B5").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
   
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    Selection.Borders(xlEdgeLeft).LineStyle = xlNone
    Selection.Borders(xlEdgeTop).LineStyle = xlNone
    Selection.Borders(xlEdgeRight).LineStyle = xlNone
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    Range("J12").Select
 
    Range("B8:H11").Select
    
    Range("B8:H11,B17:H18").Select
    Range("B17").Activate

    Range("B8:H11,B17:H18,B25:H26,B33:H34").Select
    Range("B33").Activate
   
    Selection.FormatConditions.Delete
    Range("I8").Select
    
End Sub
Sub third나눗셈_답()
Attribute third나눗셈_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third나눗셈_답 매크로
'

'
    Range("B5,E5,H5,B13,E13,H13,B7:H12").Select
    Range("B7").Activate
    
    Range("B5,E5,H5,B13,E13,H13,B7:H12,B15:H21").Select
    Range("B15").Activate
   
    Range("B5,E5,H5,B13,E13,H13,B7:H12,B15:H21,B23:H29").Select
    Range("B23").Activate
    
    Range("B5,E5,H5,B13,E13,H13,B7:H12,B15:H21,B23:H29,B31:H36").Select
    Range("B31").Activate

    With Selection.Font
        .ThemeColor = xlThemeColorLight1
        .TintAndShade = 0
    End With
    Range("I31").Select
   
    Range("B8,E8,H8,B16,E16,H16,B24,E24,H24").Select
    Range("H24").Activate
 
    Range("B8,E8,H8,B16,E16,H16,B24,E24,H24,B32,E32,H32").Select
    Range("H32").Activate
    
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    Selection.Borders(xlEdgeLeft).LineStyle = xlNone
    With Selection.Borders(xlEdgeTop)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.Borders(xlEdgeBottom).LineStyle = xlNone
    Selection.Borders(xlEdgeRight).LineStyle = xlNone
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
   
    Range("B10,E10,H10,B18,E18,H18").Select
    Range("H18").Activate
   
    Range("B10").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$B$10<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlTop)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("E10").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$E$10<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlTop)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("H10").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$H$10<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlTop)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("B18").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$B$18<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlTop)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("E18").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$E$18<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlTop)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("H18").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$H$18<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlTop)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    
    Range("B26").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$B$26<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlTop)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("E26").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$E$26<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlTop)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("H26").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$H$26<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlTop)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    
    Range("B34").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$B$34<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlTop)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("E34").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$E$34<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlTop)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("H34").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$H$34<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlTop)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    
    Range("I9").Select
End Sub
