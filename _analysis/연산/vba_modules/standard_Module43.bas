Attribute VB_Name = "Module43"
Sub first덧셈뺄셈2_답()
Attribute first덧셈뺄셈2_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first덧셈뺄셈2_답 매크로
'

'
    Range("E3,E5,E7,E9,K9,K7,K5,K3,Q3,Q5,Q7,Q9,Q11,K11,E11").Select
    Range("E11").Activate
  
    Range( _
        "E3,E5,E7,E9,K9,K7,K5,K3,Q3,Q5,Q7,Q9,Q11,K11,E11,E13,K13,Q13,Q15,Q17,Q19,K19,K17,K15,E15,E17,E19" _
        ).Select
    Range("E19").Activate
    
    Range( _
        "E3,E5,E7,E9,K9,K7,K5,K3,Q3,Q5,Q7,Q9,Q11,K11,E11,E13,K13,Q13,Q15,Q17,Q19,K19,K17,K15,E15,E17,E19,E21,K21,Q21" _
        ).Select
    Range("Q21").Activate
    
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
   
    Range("E3").Select
    
End Sub
Sub first덧셈뺄셈2_문제()
Attribute first덧셈뺄셈2_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first덧셈뺄셈2_문제 매크로
'

'
    Range("E3,K3,Q3,Q5,K5,K7,E7,E5,E9,K9,Q9,Q7,Q11,Q13,K13,K11,E11,E13").Select
    Range("E13").Activate
    
    Range( _
        "E3,K3,Q3,Q5,K5,K7,E7,E5,E9,K9,Q9,Q7,Q11,Q13,K13,K11,E11,E13,E15,K15,Q15,Q17,Q19,Q21,K21,K19,K17,E17,E19,E21" _
        ).Select
    Range("E21").Activate
    
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
   
    Range("E3").Select
End Sub

