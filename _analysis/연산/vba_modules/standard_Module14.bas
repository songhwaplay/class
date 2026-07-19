Attribute VB_Name = "Module14"
Sub second어림_답()
Attribute second어림_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' second어림_답 매크로
'

'
    Range("M12,D18,D16,D14,D12,D10,D8,D6,D4").Select
    Range("D4").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("D4").Select
End Sub
Sub second어림_문제()
Attribute second어림_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' second어림_문제 매크로
'

'
    Range("D18,D16,D14,D12,D10,D8,D6,D4").Select
    Range("D4").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("D4").Select
End Sub
