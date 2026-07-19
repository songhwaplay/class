Attribute VB_Name = "Module46"
Sub second구구단_답()
Attribute second구구단_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' second구구단_답 Macro
'

'
   
    Range("Q21,O19,I19,K21,E21,C19,E17,E15,K17,K15,Q17,Q15:Q16,O13,I13,C13").Select
    Range("C13").Activate
   
    Range( _
        "Q21,O19,I19,K21,E21,C19,E17,E15,K17,K15,Q17,Q15:Q16,O13,I13,C13,Q11,Q9,K11,K9,E11,E9,C7,E5,E3,I7,K5,K3,O7,Q5,Q3" _
        ).Select
    Range("Q3").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("E1:O1").Select
End Sub
Sub second구구단_문제()
Attribute second구구단_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' second구구단_문제 Macro
'

'
    
    Range("Q21,K21,E21,C19,I19,O19,Q17,K17,E17,E15,K15,Q15,O13,I13,C13,E11,K11,Q11" _
        ).Select
    Range("Q11").Activate
    
    Range( _
        "Q21,K21,E21,C19,I19,O19,Q17,K17,E17,E15,K15,Q15,O13,I13,C13,E11,K11,Q11,Q9,K9,E9,C7,I7,O7,Q5,Q3,K5,K3,E5,E3" _
        ).Select
    Range("E3").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("E1:O1").Select
End Sub


Sub first개수세기_답()
Attribute first개수세기_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first개수세기_답 Macro
'

'
   
    Range("A48:Y48").Select
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    Selection.Borders(xlEdgeLeft).LineStyle = xlNone
    With Selection.Borders(xlEdgeTop)
        .LineStyle = xlDash
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlMedium
    End With
    Selection.Borders(xlEdgeBottom).LineStyle = xlNone
    Selection.Borders(xlEdgeRight).LineStyle = xlNone
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
    Range("M47").Select
    With Selection.Font
        .ThemeColor = xlThemeColorLight1
        .TintAndShade = 0
    End With
    
    Range("J1:P1").Select
End Sub

