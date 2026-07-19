Attribute VB_Name = "Module22"
Sub second덧셈뺄셈_답()
Attribute second덧셈뺄셈_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' second덧셈뺄셈_답 매크로
'

'
    Range( _
        "E3,E7,E11,E15,E19,E23,E27,E31,E35,E39,J39,Q39,O35,L35,J31,O31,S27,Q23,H27,J23,L19,O19,S15,J15,H11,O11,O7,O3,J7,H3" _
        ).Select
    Range("H3").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("E3").Select
End Sub
Sub second덧셈뺄셈_문제()
Attribute second덧셈뺄셈_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' second덧셈뺄셈_문제 매크로
'

'
    Range( _
        "Q39,O35,O31,S27,Q23,O19,S15,O11,O7,O3,H3,J7,H11,J15,L19,J23,H27,J31,L35,J39,E39,E35,E31,E27,E23,E19,E15,E11,E7,E3" _
        ).Select
    Range("E3").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("E3").Select
End Sub
