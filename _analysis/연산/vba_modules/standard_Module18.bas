Attribute VB_Name = "Module18"
Sub 십구단_문제()
Attribute 십구단_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 십구단_문제 매크로
'

'
    Range("B2:B11,E2:E11,H2:H11").Select
    Range("H2").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("c1").Select
End Sub
Sub 십구단_답()
Attribute 십구단_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 십구단_답 매크로
'

'
    Range("B2:B11").Select
    Range("B2:B11,E2:E11,H2:H11").Select
    Range("H2").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorLight1
        .TintAndShade = 0
    End With
    Range("c1").Select
End Sub
Sub sixth원입체_문제()
Attribute sixth원입체_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' sixth원입체_문제 매크로
'

'
    Range("C5:C6,C13:C14").Select
    Range("C13").Activate
   
    Range("C5:C6,C13:C14,C21:C22").Select
    Range("C21").Activate
  
    Range("C5:C6,C13:C14,C21:C22,C29:C30").Select
    Range("C29").Activate
 
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
 
    Range("G7").Select
End Sub
Sub sixth원입체_답()
Attribute sixth원입체_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' sixth원입체_답 매크로
'

'
    Range("C5:C6,C13:C14").Select
    Range("C13").Activate
   
    Range("C5:C6,C13:C14,C21:C22").Select
    Range("C21").Activate
   
    Range("C5:C6,C13:C14,C21:C22,C29:C30").Select
    Range("C29").Activate
 
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With

    Range("C5:C6,C13:C14").Select
    Range("C13").Activate
 
    Range("C5:C6,C13:C14,C21:C22").Select
    Range("C21").Activate
   
    Range("C5:C6,C13:C14,C21:C22,C29:C30").Select
    Range("C29").Activate
 
    With Selection.Font
        .ThemeColor = xlThemeColorLight1
        .TintAndShade = 0
    End With
   
    Range("G6").Select
End Sub
