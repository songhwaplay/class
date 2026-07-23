Attribute VB_Name = "Module31"
Sub fifth분수B_답()
Attribute fifth분수B_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fifth분수B_답 Macro
'

'
    Range( _
        "O5:O7,L5:L7,I5:I7,I14:I16,L14:L16,O14:O16,I23:I25,L23:L25,O23:O25,R23:R25,I32:I34,L32:L34,O32:O34,R32:R34" _
        ).Select
    Range("R32").Activate
    Range( _
        "O5:O7,L5:L7,I5:I7,I14:I16,L14:L16,O14:O16,I23:I25,L23:L25,O23:O25,R23:R25,I32:I34,L32:L34,O32:O34,R32:R34,L77:L79,O77:O79,R77:R79,U77:U79,L86:L88,O86:O88,R86:R88,U86:U88" _
        ).Select
    Range("U86").Activate
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
    Range("H5:AA91").Select
    Range("AA89").Activate
    Range("H5:AB37,I41:J73").Select
    Range("I41").Activate
    Range("H5:AB37,I41:J73,K77:AA91").Select
    Range("K77").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("R5:R7").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$R$5<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("U5:U7").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$U$5<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("R14:R16").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$R$14<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("U14:U16").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$U$14<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("U23:U25").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$U$23<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("X23:X25").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$X$23<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("U32:U34").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$U$32<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("X32:X34").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$X$32<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("J41:J43").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$J$41<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("J50:J52").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$J$50<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("J59:J61").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$J$59<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("J68:J70").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$J$68<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("X77:X79").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$X$77<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("AA77:AA79").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:= _
        "=$AA$77<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("X86:X88").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$X$86<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("AA86:AA88").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:= _
        "=$AA$86<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("X23:X25").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$X$23<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("X32:X34").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$X$32<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    Range("b2").Select
End Sub
Sub fifth분수B_문제()
Attribute fifth분수B_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fifth분수B_문제 Macro
'

'
    Range("H5:X37").Select
 
    Range("H5:X37,I41:P73").Select
    Range("I41").Activate
 
    Range("H5:X37,I41:P73,K77:AA91").Select
    Range("K77").Activate
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    Selection.Borders(xlEdgeLeft).LineStyle = xlNone
    Selection.Borders(xlEdgeTop).LineStyle = xlNone
    Selection.Borders(xlEdgeBottom).LineStyle = xlNone
    Selection.Borders(xlEdgeRight).LineStyle = xlNone
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
 
    Cells.FormatConditions.Delete
    Range("b2").Select
   
End Sub
Sub sixth혼합계산_문제()
Attribute sixth혼합계산_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' sixth혼합계산_문제 Macro
'

'
    Range("J4:S12").Select
    Range("J5").Activate
   
    Range("J4:S12,J17:T20").Select
    Range("J17").Activate
   
    Range("J4:S12,J17:T20,K25:P29").Select
    Range("K25").Activate
   
    Range("J4:S12,J17:T20,K25:P29,K32:R33,Q25:R26").Select
    Range("Q25").Activate
  
    Range("J4:S12,J17:T20,K25:P29,K32:R33,Q25:R26,J38:V45,I43:I44").Select
    Range("I43").Activate
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    Selection.Borders(xlEdgeLeft).LineStyle = xlNone
    Selection.Borders(xlEdgeTop).LineStyle = xlNone
    Selection.Borders(xlEdgeBottom).LineStyle = xlNone
    Selection.Borders(xlEdgeRight).LineStyle = xlNone
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With

    Range("T7").Select
    Cells.FormatConditions.Delete
 
    Range("R7").Select
End Sub
Sub sixth혼합계산_답()
Attribute sixth혼합계산_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' sixth혼합계산_답 Macro
'

'
    Range("K4:N7,K11:R12").Select
    Range("K11").Activate
 
    Range("K4:N7,K11:R12,J17:T20").Select
    Range("J17").Activate
   
    Range("K4:N7,K11:R12,J17:T20,K25:R26").Select
    Range("K25").Activate
   
    Range("K4:N7,K11:R12,J17:T20,K25:R26,K32:R33").Select
    Range("K32").Activate
 
    Range("K4:N7,K11:R12,J17:T20,K25:R26,K32:R33,J38:V41").Select
    Range("J38").Activate
   
    Range("K4:N7,K11:R12,J17:T20,K25:R26,K32:R33,J38:V41,I42:N45").Select
    Range("I42").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
  
    Range("K4:K5").Select
   
    Range("K4:K5,K17:K18,N17:N18,Q17:Q18").Select
    Range("Q17").Activate
    
    Range( _
        "K4:K5,K17:K18,Q17:Q18,K38:K39,N38:N39,P38:P39,S38:S39,V38:V39,K42:K43" _
        ).Select
    Range("K42").Activate
   
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

    Range("N4:N5").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$N$4<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
  
    Range("t17:t18").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$t$17<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
    
    Range("N17:N18").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$N$17<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
   
    Range("N42:N43").Select
    Selection.FormatConditions.Add Type:=xlExpression, Formula1:="=$N$42<>"""""
    Selection.FormatConditions(Selection.FormatConditions.Count).SetFirstPriority
    With Selection.FormatConditions(1).Borders(xlBottom)
        .LineStyle = xlContinuous
        .TintAndShade = 0
        .Weight = xlThin
    End With
    Selection.FormatConditions(1).StopIfTrue = False
  
    Range("R7").Select
End Sub
