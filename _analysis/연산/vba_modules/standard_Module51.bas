Attribute VB_Name = "Module51"
Sub third곱셈1_문제()
Attribute third곱셈1_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third곱셈1_문제 매크로
'

'
    Range("B5,D5,F5,H5,H11,F11,D11,B11,B17,D17,F17,H17,H23,F23,D23,B23").Select
    Range("B23").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
   
    Range("B5").Select
End Sub
Sub third곱셈1_답()
Attribute third곱셈1_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third곱셈1_답 매크로
'

'
    Range("B23,D23,F23,H23,H17,F17,D17,B17,B11,D11,F11,H11,H5,F5,D5,B5").Select
    Range("B5").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorAccent1
        .TintAndShade = 0
    End With
    Range("B5").Select
End Sub
