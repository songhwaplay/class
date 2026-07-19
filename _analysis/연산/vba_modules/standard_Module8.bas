Attribute VB_Name = "Module8"
Sub third나눗셈B_답()
Attribute third나눗셈B_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third나눗셈B_답 매크로
'

ActiveSheet.Unprotect Password:="ghkthd85"
    Range("F3:F22,H3:H22,N3:N22,P3:P22,V3:V19,X3:X19").Select
    Range("x19").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("a2").Select
    ActiveSheet.Protect Password:="ghkthd85"
End Sub
Sub third나눗셈B_문제()
Attribute third나눗셈B_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third나눗셈B_문제 매크로
'

ActiveSheet.Unprotect Password:="ghkthd85"
    Range("X3:X19,V3:V19,P3:P22,N3:N22,H3:H22,F3:F22").Select
    Range("f22").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("a1").Select
        ActiveSheet.Protect Password:="ghkthd85"
End Sub
