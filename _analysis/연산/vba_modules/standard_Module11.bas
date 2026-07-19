Attribute VB_Name = "Module11"
Sub 제곱수_문제()
Attribute 제곱수_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 제곱수_문제 매크로
'

'
    Range("C8:C16,G8:G16,K8:K16").Select
    Range("K16").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("D8").Select
End Sub
Sub 제곱수_답()
Attribute 제곱수_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 제곱수_답 매크로
'

'
    Range("C8:C16,G8:G16,K8:K16").Select
    Range("K16").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("C7").Select
End Sub
