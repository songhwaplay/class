Attribute VB_Name = "Module17"
Sub 포함등분_답()
Attribute 포함등분_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 포함등분_답 매크로
'

'
    Range("I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19").Select
    Range("K19").Activate
  
    Range( _
        "I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19,I21:K21,I23,K23,I25:K25,I27,K27" _
        ).Select
    Range("K27").Activate
  
    Range( _
        "I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19,I21:K21,I23,K23,I25:K25,I27,K27,I29:K29,I31,K31" _
        ).Select
    Range("K31").Activate

    Range( _
        "I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19,I21:K21,I23,K23,I25:K25,I27,K27,I29:K29,I31,K31,I33:K33,I35:I36,K35:K36,I37:K37,I39:I40,K39:K40,I41:K41,I43:I44,K43:K44" _
        ).Select
    Range("K43").Activate

    With Selection.Font
        .ThemeColor = xlThemeColorLight2
        .TintAndShade = 0
    End With

    Range("K6").Select
   
End Sub
Sub 포함등분_문제()
Attribute 포함등분_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 포함등분_문제 매크로
'

'
    Range("I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19").Select
    Range("K19").Activate

    Range( _
        "I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19,I21:K21,I23,K23,I25:K25,I27,K27" _
        ).Select
    Range("K27").Activate
   
    Range( _
        "I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19,I21:K21,I23,K23,I25:K25,I27,K27,I29:K29,I31,K31" _
        ).Select
    Range("K31").Activate
  
    Range( _
        "I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19,I21:K21,I23,K23,I25:K25,I27,K27,I29:K29,I31,K31,I33:K33,I35,K35" _
        ).Select
    Range("K35").Activate

    Range( _
        "I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19,I21:K21,I23,K23,I25:K25,I27,K27,I29:K29,I31,K31,I33:K33,I35,K35,I37:K37,I39,K39,I41:K41,I43,K43" _
        ).Select
    Range("K43").Activate
 
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
  
    Range("K6").Select

End Sub
