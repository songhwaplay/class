Attribute VB_Name = "Module15"
Sub third단위_답()
Attribute third단위_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third단위_답 매크로
'

'
    Range("E24:E25,E21:E22,E18:E19,E15:E16,E12:E13,E9:E10,E6:E7,E3:E4").Select
    Range("E3").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("E3:E4").Select
End Sub
Sub third단위_문제()
Attribute third단위_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third단위_문제 매크로
'

'
    Range("E24:E25,E21:E22,E18:E19,E15:E16,E12:E13,E9:E10,E6:E7,E3:E4").Select
    Range("E3").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("E3:E4").Select
End Sub
