Attribute VB_Name = "Module40"
Sub first덧셈a_답()
Attribute first덧셈a_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first덧셈a_답 매크로
'

'
    Range("E3:E21,K3:K21,M3,O5,M7,O9,M11,O13,M15,O17,M19,O21").Select
    Range("O21").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("e1").Select
End Sub

Sub first덧셈a_문제()
Attribute first덧셈a_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first덧셈a_문제 매크로
'

'
    Range("E3:E21,O21,M19,O17,M15,O13,M11,O9,M7,O5").Select
    Range("O5").Activate
    Range("E3:E21,O21,M19,O17,M15,O13,M11,O9,M7,O5,K3:K21,M3").Select
    Range("M3").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("e1").Select
End Sub
