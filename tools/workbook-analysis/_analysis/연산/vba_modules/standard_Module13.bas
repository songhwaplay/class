Attribute VB_Name = "Module13"
Sub third빈칸_문제()
Attribute third빈칸_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third빈칸_문제 매크로
'

'
    Union(Range( _
        "K29,O27,P29,Q32,C8,D5,E3,I3,J8,K5,O5,P3,Q8,C13,D16,E11,I16,J11,K13,O11,P13,Q16,P19,O21,Q24,J24,K21,I19,E19,D21,C24,D32" _
        ), Range("C29,E27,I32,J27")).Select
    Range("Q32").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("G9").Select
End Sub
Sub third빈칸_답()
Attribute third빈칸_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third빈칸_답 매크로
'

'
    Union(Range( _
        "J27,D32,C29,E27,C8,D5,E3,I3,K5,J8,O5,P3,Q8,O11,P13,Q16,I16,K13,J11,C13,E11,D16,C24,D21,E19,I19,J24,K21,O21,P19,Q24,Q32" _
        ), Range("P29,O27,I32,K29")).Select
    Range("E27").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("L9").Select
End Sub
Sub fourth큰수곱셈_답()
Attribute fourth큰수곱셈_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fourth큰수곱셈_답 매크로
'

'
    Range("H20,H18,H16,H14,H12,H10,H8,H6,H4,H2").Select
    Range("H2").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("I5").Select
End Sub
Sub fourth큰수곱셈_문제()
Attribute fourth큰수곱셈_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fourth큰수곱셈_문제 매크로
'

'
    Range("H20,H18,H16,H14,H12,H10,H8,H6,H4,H2").Select
    Range("H2").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("J7").Select
End Sub
