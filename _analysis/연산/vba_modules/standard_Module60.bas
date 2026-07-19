Attribute VB_Name = "Module60"
Sub first읽기_답()
Attribute first읽기_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first읽기_답 매크로
'

'
    Range("D5,D7,D9,D11,D13,D15,D17,D19,D21,K5,K7,K9,K11,K13,K15,K17,K19,K21"). _
        Select
    Range("K21").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("D5").Select
End Sub
Sub first읽기_문제()
Attribute first읽기_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first읽기_문제 매크로
'

'
    Range("D5,D7,D9,D11,D13,D15,D17,D19,D21,K5,K6,K6,K7,K9,K11,K13,K15,K17,K19,K21" _
        ).Select
    Range("K21").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("D5").Select
End Sub
