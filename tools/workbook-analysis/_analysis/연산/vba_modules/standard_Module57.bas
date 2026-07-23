Attribute VB_Name = "Module57"
Sub fifth소인수분해_답()
Attribute fifth소인수분해_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fifth소인수분해_답 매크로
'

'
    Range("B4,L4,L7,B7,B10,L10,L13,B13").Select
    Range("B13").Activate
    
    Range("B4,L4,L7,B7,B10,L10,L13,B13,B16,L16,L19,B19,B22,L22,B25").Select
    Range("B25").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    
    Range("A2:E2").Select
End Sub
Sub fifth소인수분해_문제()
Attribute fifth소인수분해_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fifth소인수분해_문제 매크로
'

'
    Range("B4,L4,L7,B7,B10,L10,L13,B13").Select
    Range("B13").Activate
  
    Range("B4,L4,L7,B7,B10,L10,L13,B13,B16,L16,L19,B19,B22,L22").Select
    Range("L22").Activate

    Range("B4,L4,L7,B7,B10,L10,L13,B13,B16,L16,L19,B19,B22,L22,B25").Select
    Range("B25").Activate
   
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
   
    Range("A2:E2").Select
End Sub
