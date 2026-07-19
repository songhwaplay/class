Attribute VB_Name = "Module23"
Sub third곱셈_답()
Attribute third곱셈_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third곱셈_답 매크로
'

'
    Range("W21,T21,Q21,N21,N15,Q15,T15,W15,W9,T9,Q9,N9,N3,Q3,T3,W3").Select
    Range("W3").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("N3").Select
End Sub
Sub third곱셈_문제()
Attribute third곱셈_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third곱셈_문제 매크로
'

'
    Range("W21,T21,Q21,N21,N15,Q15,T15,W15,W9,T9,Q9,N9,N3,Q3,T3,W3").Select
    Range("W3").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("N3").Select
End Sub
