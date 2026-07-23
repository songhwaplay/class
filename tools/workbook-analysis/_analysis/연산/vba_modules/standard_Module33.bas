Attribute VB_Name = "Module33"
Sub fourth큰수_문제()
Attribute fourth큰수_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fourth큰수_문제 Macro
'

'
    Range("B4:L4,B7:L7,B10:L10,B13:L13,B16:L16,B20").Select
    Range("B20").Activate
    Range("B4:L4,B7:L7,B10:L10,B13:L13,B16:L16,B20,B23,B26,B29").Select
    Range("B29").Activate
    Range("B4:L4,B7:L7,B10:L10,B13:L13,B16:L16,B20,B23,B26,B29,B32").Select
    Range("B32").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("c1").Select
End Sub
Sub fourth큰수_답()
Attribute fourth큰수_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fourth큰수_답 Macro
'

'
    Range("B4:L4,B7:L7,B10:L10,B13:L13,B16:L16,B20").Select
    Range("B20").Activate
    Range("B4:L4,B7:L7,B10:L10,B13:L13,B16:L16,B20,B23").Select
    Range("B23").Activate
    Range("B4:L4,B7:L7,B10:L10,B13:L13,B16:L16,B20,B23,B26,B29,B32").Select
    Range("B32").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("c1").Select
End Sub
