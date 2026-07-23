Attribute VB_Name = "Module42"
Sub second덧셈_답()
Attribute second덧셈_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' second덧셈_답 매크로
'

'
    Range( _
        "B4:B5,D11:D12,D15:D16,B22:B23,F26:F27,F33:F34,D37:D38,F44:F45,M44:M45,P44:P45,R37:R38,I37:I38,M33:M34,T33:T34,P26:P27,K26:K27,K22:K23,T22:T23,P15:P16,I15:I16,M11:M12,P11:P12,R4:R5,K4:K5" _
        ).Select
    Range("K4").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("B4:B5").Select
End Sub
Sub second덧셈_문제()
Attribute second덧셈_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' second덧셈_문제 매크로
'

'
    Range( _
        "B4:B5,D11:D12,D15:D16,B22:B23,F26:F27,F33:F34,D37:D38,F44:F45,M44:M45,P44:P45,R37:R38,I37:I38,T33:T34,M33:M34,K26:K27,P26:P27,T22:T23,K22:K23,I15:I16,P15:P16,P11:P12,M11:M12,K4:K5,R4:R5" _
        ).Select
    Range("R4").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("B4:B5").Select
End Sub
