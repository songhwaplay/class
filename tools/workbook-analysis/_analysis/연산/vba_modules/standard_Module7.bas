Attribute VB_Name = "Module7"
Sub third덧셈뺄셈b_문제()
Attribute third덧셈뺄셈b_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third덧셈뺄셈b_문제 매크로
'

'
    Range("f23,l23,L21,L19,F21,F19,F17,L17,L15,F15,F13,L13,L11,F11,F9,L9,L7,F7,F5,L5,L3,F3" _
        ).Select
    Range("F3").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("F3").Select
End Sub
Sub third덧셈뺄셈b_답()
Attribute third덧셈뺄셈b_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third덧셈뺄셈b_답 매크로
'

'
    Range("f23,l23,L21,F21,F19,F17,F15,L19,L17,L15,L13,F13,F11,L11,L9,L7,L5,L3,F9,F7,F5,F3" _
        ).Select
    Range("F3").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("F3").Select
End Sub
