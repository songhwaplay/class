Attribute VB_Name = "Module5"
Sub third시간1_답()
Attribute third시간1_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third시간1_답 매크로
'

'
    Range("H24,G22,I22,H20,I18,G18,H16,G14,I14,H12,I10,G10,H8,G6,I6,H4,I2,G2"). _
        Select
    Range("G2").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("G2").Select
End Sub
Sub third시간1_문제()
Attribute third시간1_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third시간1_문제 매크로
'

'
    Range("H24,I22,G22,H20,I18,G18,H16,I14,G14,H12,G10,I10,H8,I6,G6,H4,I2,G2"). _
        Select
    Range("G2").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("G2").Select
End Sub
